"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { awardXP, evaluateUserRewards, createAchievement } from "@/lib/gamification";

const transferSchema = z.object({
  recipientEmail: z.string().email("Email invalide"),
  amount: z.coerce.number().int().positive("Le montant doit être supérieur à 0"),
});

export type TransferResult = { success: true; amount: number; recipientName: string } | { error: string; errors?: Record<string, string[]> };

export async function transferTime(formData: FormData): Promise<TransferResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Vous devez être connecté" };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, timeBalance: true },
  });
  if (!user) return { error: "Utilisateur introuvable" };

  const parsed = transferSchema.safeParse({
    recipientEmail: formData.get("recipientEmail"),
    amount: formData.get("amount"),
  });
  if (!parsed.success) {
    return { error: "Données invalides", errors: parsed.error.flatten().fieldErrors };
  }

  const { recipientEmail, amount } = parsed.data;

  // Can't send to yourself
  if (recipientEmail === session.user.email) {
    return { error: "Vous ne pouvez pas vous transférer du TIME à vous-même" };
  }

  // Find recipient
  const recipient = await prisma.user.findUnique({
    where: { email: recipientEmail },
    select: { id: true, name: true },
  });
  if (!recipient) return { error: "Destinataire introuvable" };

  // Check balance
  if (user.timeBalance < amount) {
    return { error: `Solde insuffisant. Vous avez ${user.timeBalance} TIME.` };
  }

  // Transfer
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { timeBalance: { decrement: amount } },
    }),
    prisma.user.update({
      where: { id: recipient.id },
      data: { timeBalance: { increment: amount } },
    }),
    prisma.transaction.create({
      data: {
        fromId: user.id,
        toId: recipient.id,
        amount,
        type: "transfer",
        status: "completed",
      },
    }),
  ]);

  // ─── Gamification ──────────────────────────────────────────
  // Sender gets +30 XP per donation event
  await awardXP({
    userId: user.id,
    type: "time_donated",
    points: 30,
    sourceType: "transfer",
    description: `Don de ${amount} TIME à ${recipient.name}`,
  });

  // Achievement for the sender
  await createAchievement({
    userId: user.id,
    type: "time_donated",
    title: `Don de ${amount} TIME`,
    description: `Tu as donné ${amount} TIME à ${recipient.name}`,
    metadata: { amount, recipientId: recipient.id, recipientName: recipient.name },
  });

  // Check badges for the sender
  await evaluateUserRewards(user.id, "time_donated");

  return { success: true, amount, recipientName: recipient.name };
}
