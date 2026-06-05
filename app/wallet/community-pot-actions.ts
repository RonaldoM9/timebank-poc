"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type DonateResult =
  | { success: true; amount: number; potBalance: number; error?: never }
  | { success: false; error: string; amount?: never; potBalance?: never };

export type FundResult =
  | { success: true; amount: number; potBalance: number; bookingId: string }
  | { error: string };

/**
 * Get or create the global community pot.
 */
async function getCommunityPot() {
  let pot = await prisma.communityPot.findFirst({ orderBy: { createdAt: "asc" } });
  if (!pot) {
    pot = await prisma.communityPot.create({
      data: { name: "Pot commun TimeHeroes" },
    });
  }
  return pot;
}

/**
 * Server Action: donate TIME to the community pot.
 */
export async function donateToCommunityPot(
  userId: string,
  amount: number
): Promise<DonateResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, error: "Vous devez être connecté." };
  }

  if (!amount || amount <= 0) {
    return { success: false, error: "Le montant doit être supérieur à 0." };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, timeBalance: true },
  });
  if (!user) return { success: false, error: "Utilisateur introuvable." };

  if (user.timeBalance < amount) {
    return {
      success: false,
      error: `Solde insuffisant. Vous avez ${user.timeBalance} TIME, vous essayez d'en donner ${amount}.`,
    };
  }

  const pot = await getCommunityPot();
  if (!pot) return { success: false, error: "Pot commun introuvable." };

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { timeBalance: { decrement: amount } },
      }),
      prisma.communityPot.update({
        where: { id: pot.id },
        data: { balance: { increment: amount } },
      }),
      prisma.communityPotTransaction.create({
        data: {
          potId: pot.id,
          userId,
          amount,
          type: "DONATION",
        },
      }),
    ]);
  } catch (_e) {
    return { success: false, error: "Une erreur est survenue lors du don." };
  }

  const updatedPot = await getCommunityPot();
  return { success: true, amount, potBalance: updatedPot?.balance ?? 0 };
}

/**
 * Server Action: admin/facilitator funds a booking from the community pot.
 */
export async function fundBookingFromCommunityPot(
  bookingId: string,
  amount: number,
  reason?: string
): Promise<FundResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: "Vous devez être connecté." };
  }

  const admin = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!admin || (admin.role !== "admin" && admin.role !== "facilitator")) {
    return { error: "Seul un admin ou facilitateur peut utiliser le pot commun." };
  }

  if (!amount || amount <= 0) {
    return { error: "Le montant doit être supérieur à 0." };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true },
  });
  if (!booking) {
    return { error: "Mission introuvable." };
  }

  const pot = await getCommunityPot();
  if (!pot) return { error: "Pot commun introuvable." };

  if (pot.balance < amount) {
    return {
      error: `Solde du pot insuffisant. Le pot a ${pot.balance} TIME.`,
    };
  }

  try {
    await prisma.$transaction([
      prisma.communityPot.update({
        where: { id: pot.id },
        data: { balance: { decrement: amount } },
      }),
      prisma.booking.update({
        where: { id: bookingId },
        data: {
          fundedByCommunityPot: true,
          communityPotAmount: amount,
        },
      }),
      prisma.communityPotTransaction.create({
        data: {
          potId: pot.id,
          userId: admin.id,
          bookingId,
          amount,
          type: "FUNDING",
          reason: reason ?? null,
        },
      }),
    ]);
  } catch (_e) {
    return { error: "Une erreur est survenue lors du financement." };
  }

  const updatedPot = await getCommunityPot();
  return { success: true, amount, potBalance: updatedPot?.balance ?? 0, bookingId };
}
