import { prisma } from "@/lib/prisma";

export type PotTransaction = {
  id: string;
  userId: string | null;
  userName: string | null;
  bookingId: string | null;
  amount: number;
  type: string;
  reason: string | null;
  createdAt: string;
};

/**
 * Get or create the global community pot (singleton pattern).
 * There should only ever be one global pot in V1.
 */
export async function getCommunityPot() {
  let pot = await prisma.communityPot.findFirst({ orderBy: { createdAt: "asc" } });
  if (!pot) {
    pot = await prisma.communityPot.create({
      data: { name: "Pot commun TimeHeroes" },
    });
  }
  return pot;
}

/**
 * Get recent pot transactions with user names, ordered by newest first.
 */
export async function getPotTransactions(
  limit: number = 5
): Promise<PotTransaction[]> {
  const raw = await prisma.communityPotTransaction.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: { name: true } } },
  });

  return raw.map((tx) => ({
    id: tx.id,
    userId: tx.userId,
    userName: tx.user?.name ?? null,
    bookingId: tx.bookingId,
    amount: tx.amount,
    type: tx.type,
    reason: tx.reason,
    createdAt: tx.createdAt.toISOString(),
  }));
}

/**
 * Get pot transactions for a specific user (their own donations).
 */
export async function getUserPotTransactions(
  userId: string,
  limit: number = 5
): Promise<PotTransaction[]> {
  const raw = await prisma.communityPotTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: { name: true } } },
  });

  return raw.map((tx) => ({
    id: tx.id,
    userId: tx.userId,
    userName: tx.user?.name ?? null,
    bookingId: tx.bookingId,
    amount: tx.amount,
    type: tx.type,
    reason: tx.reason,
    createdAt: tx.createdAt.toISOString(),
  }));
}
