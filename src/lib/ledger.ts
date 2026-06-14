import { prisma } from "@/lib/prisma";

export async function getUserBalance(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { timeBalance: true },
  });
  return user?.timeBalance ?? 0;
}

export async function createEscrow(params: {
  clientId: string;
  bookingId: string;
  amount: number;
}): Promise<{ success: true } | { error: string }> {
  if (params.amount <= 0) return { error: "Le montant doit être supérieur à 0" };

  const user = await prisma.user.findUnique({
    where: { id: params.clientId },
    select: { timeBalance: true },
  });
  if (!user) return { error: "Utilisateur introuvable" };
  if (user.timeBalance < params.amount) return { error: "Solde TIME insuffisant" };

  await prisma.$transaction([
    prisma.user.update({
      where: { id: params.clientId },
      data: { timeBalance: { decrement: params.amount } },
    }),
    prisma.transaction.create({
      data: {
        fromId: params.clientId,
        toId: null,
        amount: params.amount,
        type: "escrow",
        status: "completed",
        bookingId: params.bookingId,
      },
    }),
  ]);

  return { success: true };
}

export async function releaseEscrow(params: {
  providerId: string;
  bookingId: string;
  amount: number;
}): Promise<{ success: true } | { error: string }> {
  if (params.amount <= 0) return { error: "Le montant doit être supérieur à 0" };

  const existing = await prisma.transaction.findFirst({
    where: { bookingId: params.bookingId, type: "release" },
  });
  if (existing) return { error: "Double libération impossible" };

  await prisma.$transaction([
    prisma.user.update({
      where: { id: params.providerId },
      data: { timeBalance: { increment: params.amount } },
    }),
    prisma.transaction.create({
      data: {
        fromId: null,
        toId: params.providerId,
        amount: params.amount,
        type: "release",
        status: "completed",
        bookingId: params.bookingId,
      },
    }),
  ]);

  return { success: true };
}

export async function refundEscrow(params: {
  clientId: string;
  bookingId: string;
  amount: number;
}): Promise<{ success: true } | { error: string }> {
  if (params.amount <= 0) return { error: "Le montant doit être supérieur à 0" };

  const existing = await prisma.transaction.findFirst({
    where: { bookingId: params.bookingId, type: "refund" },
  });
  if (existing) return { error: "Double remboursement impossible" };

  await prisma.$transaction([
    prisma.user.update({
      where: { id: params.clientId },
      data: { timeBalance: { increment: params.amount } },
    }),
    prisma.transaction.create({
      data: {
        fromId: null,
        toId: params.clientId,
        amount: params.amount,
        type: "refund",
        status: "completed",
        bookingId: params.bookingId,
      },
    }),
  ]);

  return { success: true };
}
