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

export type DonateResult =
  | { success: true; amount: number; potBalance: number; error?: never }
  | { success: false; error: string; amount?: never; potBalance?: never };

/**
 * Server Action: a user donates TIME to the community pot.
 * Rules:
 * - amount must be positive
 * - user must have enough TIME balance
 * - user wallet is debited
 * - pot is credited
 * - transaction is traced
 * - all atomic (Prisma $transaction)
 */
export async function donateToCommunityPot(
  userId: string,
  amount: number
): Promise<DonateResult> {
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

  try {
    await prisma.$transaction([
      // Debit user wallet
      prisma.user.update({
        where: { id: userId },
        data: { timeBalance: { decrement: amount } },
      }),
      // Credit community pot
      prisma.communityPot.update({
        where: { id: pot.id },
        data: { balance: { increment: amount } },
      }),
      // Trace transaction
      prisma.communityPotTransaction.create({
        data: {
          potId: pot.id,
          userId,
          amount,
          type: "DONATION",
          reason: null,
        },
      }),
    ]);
  } catch (_e) {
    return { success: false, error: "Une erreur est survenue lors du don." };
  }

  const updatedPot = await getCommunityPot();

  return { success: true, amount, potBalance: updatedPot.balance };
}

export type FundResult =
  | { success: true; amount: number; potBalance: number }
  | { error: string };

/**
 * Server Action: an admin/facilitator uses the pot to fund a booking.
 * Rules:
 * - admin/facilitator only
 * - booking must exist
 * - pot must have sufficient balance
 * - pot is debited
 * - booking is marked as funded by pot
 * - transaction FUNDING is traced
 * - all atomic
 */
export async function fundBookingFromCommunityPot(
  adminUserId: string,
  bookingId: string,
  amount: number,
  reason?: string
): Promise<FundResult> {
  // Admin check
  const admin = await prisma.user.findUnique({
    where: { id: adminUserId },
    select: { role: true },
  });
  if (!admin || (admin.role !== "admin" && admin.role !== "facilitator")) {
    return { error: "Seul un admin ou facilitateur peut utiliser le pot commun." };
  }

  if (!amount || amount <= 0) {
    return { error: "Le montant doit être supérieur à 0." };
  }

  // Check booking exists
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true },
  });
  if (!booking) {
    return { error: "Mission introuvable." };
  }

  const pot = await getCommunityPot();
  if (pot.balance < amount) {
    return {
      error: `Solde du pot insuffisant. Le pot a ${pot.balance} TIME, vous essayez d'en utiliser ${amount}.`,
    };
  }

  try {
    await prisma.$transaction([
      // Debit pot
      prisma.communityPot.update({
        where: { id: pot.id },
        data: { balance: { decrement: amount } },
      }),
      // Mark booking as funded
      prisma.booking.update({
        where: { id: bookingId },
        data: {
          fundedByCommunityPot: true,
          communityPotAmount: amount,
        },
      }),
      // Trace funding transaction
      prisma.communityPotTransaction.create({
        data: {
          potId: pot.id,
          userId: adminUserId,
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

  return { success: true, amount, potBalance: updatedPot.balance };
}
