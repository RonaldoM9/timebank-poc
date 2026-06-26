import { prisma } from "@/lib/prisma";

export type WalletDashboard = {
  availableBalance: number;
  pendingBalance: number;
  earnedTotal: number;
  spentTotal: number;
  donatedTotal: number;
  communityPotBalance: number;
  communityPotMonthlyGoal: number;
  transactions: WalletTransaction[];
  pendingTransactions: WalletTransaction[];
};

export type WalletTransaction = {
  id: string;
  type: string;
  amount: number;
  fromId: string | null;
  toId: string | null;
  status: string;
  label: string;
  statusLabel: string;
  bookingStatus: string | null;
  bookingId: string | null;
  missionTitle: string | null;     // Nom du service/mission lié à la transaction
  otherPartyName: string | null;   // Nom de l'autre personne impliquée
  createdAt: Date;
};

/** Map transaction types to user-friendly labels */
export function getTransactionLabel(type: string): string {
  const labels: Record<string, string> = {
    mint: "Crédit de bienvenue",
    transfer: "Transfert",
    escrow: "Réservation en attente",
    escrow_hold: "Réservation en attente",
    escrow_release: "Service terminé",
    escrow_refund: "Remboursement",
    release: "Service terminé",
    refund: "Remboursement",
    bonus: "Bonus TimeHeroes",
    welcome_credit: "Crédit de bienvenue",
    donation_to_pot: "Don au pot commun",
    donation: "Don au pot commun",
  };
  return labels[type] ?? "Transaction TimeHeroes";
}

/** Map statuses to user-friendly labels */
export function getTransactionStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    completed: "Validé",
    pending: "En attente",
    cancelled: "Annulé",
    refunded: "Remboursé",
    failed: "Échoué",
  };
  return labels[status] ?? "Traité";
}

/** Map pot transaction types to user-friendly labels */
export function getPotTransactionLabel(type: string): string {
  const labels: Record<string, string> = {
    DONATION: "Don au pot commun",
    FUNDING: "Financement de mission",
    ADJUSTMENT: "Ajustement",
    REFUND: "Remboursement pot commun",
  };
  return labels[type] ?? "Transaction pot commun";
}

const COMMUNITY_POT_MONTHLY_GOAL = 100;

export async function getWalletDashboard(userId: string): Promise<WalletDashboard> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { timeBalance: true },
  });

  if (!user) throw new Error("Utilisateur introuvable");

  // Pending escrows: transactions where user paid but booking is still pending
  const pendingEscrows = await prisma.transaction.findMany({
    where: {
      fromId: userId,
      type: { in: ["escrow", "escrow_hold"] },
      booking: { status: "pending" },
    },
    select: { amount: true },
  });
  const pendingBalance = pendingEscrows.reduce((sum, tx) => sum + tx.amount, 0);

  // All user transactions for aggregates
  const allTxs = await prisma.transaction.findMany({
    where: { OR: [{ fromId: userId }, { toId: userId }] },
    include: {
      booking: {
        select: {
          status: true,
          service: {
            select: { title: true, provider: { select: { name: true } } },
          },
          client: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  // Calculate aggregates
  let earnedTotal = 0;
  let spentTotal = 0;

  for (const tx of allTxs) {
    // Earned: received money from completed services, bonuses, welcome credits
    if (
      tx.toId === userId &&
      ["release", "escrow_release", "bonus", "mint"].includes(tx.type)
    ) {
      earnedTotal += tx.amount;
    }
    // Spent: paid for services (excluding refunds and pot donations)
    if (
      tx.fromId === userId &&
      ["escrow", "escrow_hold", "transfer"].includes(tx.type)
    ) {
      spentTotal += tx.amount;
    }
  }

  // Pot donations by user
  const potDonations = await prisma.communityPotTransaction.aggregate({
    where: { userId, type: "DONATION" },
    _sum: { amount: true },
  });
  const donatedTotal = potDonations._sum.amount ?? 0;

  // Community pot current balance
  const pot = await prisma.communityPot.findFirst({ orderBy: { createdAt: "asc" } });

  // Format transactions
  const transactions: WalletTransaction[] = allTxs.map((tx) => {
    // Déterminer le titre de la mission et l'autre participant
    let missionTitle: string | null = null;
    let otherPartyName: string | null = null;

    if (tx.booking) {
      missionTitle = tx.booking.service?.title ?? null;

      // Si l'utilisateur est le bénéficiaire (on lui a payé), l'autre est le client
      // Si l'utilisateur est le payeur, l'autre est le prestataire
      if (tx.toId === userId) {
        otherPartyName = tx.booking.client?.name ?? null;
      } else if (tx.fromId === userId) {
        otherPartyName = tx.booking.service?.provider?.name ?? null;
      }
    }

    return {
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      fromId: tx.fromId,
      toId: tx.toId,
      status: tx.status,
      label: getTransactionLabel(tx.type),
      statusLabel: getTransactionStatusLabel(tx.status),
      bookingStatus: tx.booking?.status ?? null,
      bookingId: tx.bookingId,
      missionTitle,
      otherPartyName,
      createdAt: tx.createdAt,
    };
  });

  const pendingTransactions = transactions.filter(
    (tx) =>
      tx.status === "pending" ||
      (["escrow", "escrow_hold"].includes(tx.type) && tx.bookingStatus === "pending")
  );

  return {
    availableBalance: user.timeBalance,
    pendingBalance,
    earnedTotal,
    spentTotal,
    donatedTotal,
    communityPotBalance: pot?.balance ?? 0,
    communityPotMonthlyGoal: COMMUNITY_POT_MONTHLY_GOAL,
    transactions,
    pendingTransactions,
  };
}
