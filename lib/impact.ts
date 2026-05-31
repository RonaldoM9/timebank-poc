import { prisma } from "./prisma";

export interface ImpactStats {
  // P0 — Obligatoire
  totalTimeExchanged: number;
  completedMissions: number;
  activeHeroes: number;
  availableServices: number;
  averageRating: number | null;
  unlockedBadges: number;
  transferredTime: number;
  resolvedUrgentHelps: number;

  // P1 — Très souhaitable
  discussionsCreated: number;
  messagesExchanged: number;
  scheduledMissions: number;
  activeAvailabilitySlots: number;
  totalXpGenerated: number;
  completedQuests: number;
  escrowedTime: number;
  transferCount: number;
}

export async function getImpactStats(): Promise<ImpactStats> {
  const [
    timeExchanged,
    completedMissions,
    availableServices,
    ratings,
    unlockedBadges,
    transferredData,
    resolvedUrgentHelps,
    discussionsCreated,
    messagesExchanged,
    scheduledMissions,
    activeSlots,
    xpData,
    completedQuests,
    escrowedData,
    heroCount,
  ] = await Promise.all([
    // F15.1 — TIME échangé : somme des release + escrow_release (deux systèmes de transactions coexistants dans la seed)
    prisma.transaction.aggregate({
      where: { type: { in: ["release", "escrow_release"] } },
      _sum: { amount: true },
    }),

    // F15.2 — Missions terminées
    prisma.booking.count({
      where: { status: "completed" },
    }),

    // F15.4 — Services disponibles
    prisma.service.count({
      where: { status: "active" },
    }),

    // F15.5 — Satisfaction moyenne
    prisma.rating.aggregate({
      _avg: { score: true },
    }),

    // F15.6 — Badges débloqués
    prisma.userBadge.count(),

    // F15.7 + transferCount — TIME transféré (TRANSFER_SENT uniquement)
    prisma.transaction.aggregate({
      where: { type: "transfer" },
      _sum: { amount: true },
      _count: { amount: true },
    }),

    // F15.8 — Aides urgentes traitées
    prisma.urgentRequest.count({
      where: { status: "resolved" },
    }),

    // F15.9 — Discussions créées (distinct bookingId dans BookingMessage)
    prisma.bookingMessage.groupBy({
      by: ["bookingId"],
      _count: { bookingId: true },
    }),

    // F15.10 — Messages échangés
    prisma.bookingMessage.count(),

    // F15.11 — Missions planifiées
    prisma.booking.count({
      where: {
        startAt: { not: null },
        endAt: { not: null },
      },
    }),

    // F15.12 — Créneaux disponibles
    prisma.availabilitySlot.count({
      where: { isActive: true },
    }),

    // F15.13 — XP générée
    prisma.userXpEvent.aggregate({
      _sum: { points: true },
    }),

    // F15.14 — Quêtes terminées
    prisma.userQuest.count({
      where: { completed: true },
    }),

    // F15.15 — TIME en escrow (escrow non encore release/refunded)
    calcEscrowedTime(),

    // F15.3 — Heroes actifs (users avec au moins un booking ou une transaction)
    countActiveHeroes(),
  ]);

  // Rating average
  const averageRating = ratings._avg.score ?? null;

  // Transferred time (TRANSFER_SENT only)
  const transferredTime = transferredData._sum.amount ?? 0;
  const transferCount = transferredData._count?.amount ?? 0;

  // Discussions créées = nombre de bookingId distincts avec messages
  const discussionsCreatedCount = discussionsCreated.length;

  // XP générée
  const totalXpGenerated = xpData._sum.points ?? 0;

  return {
    // P0
    totalTimeExchanged: timeExchanged._sum.amount ?? 0,
    completedMissions,
    activeHeroes: heroCount,
    availableServices,
    averageRating,
    unlockedBadges,
    transferredTime,
    resolvedUrgentHelps,

    // P1
    discussionsCreated: discussionsCreatedCount,
    messagesExchanged,
    scheduledMissions,
    activeAvailabilitySlots: activeSlots,
    totalXpGenerated,
    completedQuests,
    escrowedTime: escrowedData,
    transferCount,
  };
}

/**
 * Calcule le TIME actuellement en escrow :
 * somme des transactions "escrow" ou "escrow_hold" pour lesquelles il n'existe
 * pas encore de release/refund (dans les deux conventions) lié au même booking.
 */
async function calcEscrowedTime(): Promise<number> {
  // Trouver tous les bookingId qui ont une transaction escrow ou escrow_hold
  const escrowBookings = await prisma.transaction.findMany({
    where: { type: { in: ["escrow", "escrow_hold"] } },
    select: { bookingId: true, amount: true },
  });

  // Filtrer les bookings qui n'ont pas de release ni refund (dans les deux conventions)
  let total = 0;
  for (const tx of escrowBookings) {
    if (!tx.bookingId) continue;
    const hasReleaseOrRefund = await prisma.transaction.findFirst({
      where: {
        bookingId: tx.bookingId,
        type: { in: ["release", "escrow_release", "refund", "escrow_refund"] },
      },
    });
    if (!hasReleaseOrRefund) {
      total += tx.amount;
    }
  }

  return total;
}

/**
 * Compte les Heroes actifs : utilisateurs ayant au moins
 * un booking ou une transaction TIME.
 */
async function countActiveHeroes(): Promise<number> {
  // Users with at least one booking
  const usersWithBookings = await prisma.booking.groupBy({
    by: ["clientId"],
  });

  // Users with at least one transaction
  const usersWithTxFrom = await prisma.transaction.groupBy({
    by: ["fromId"],
    where: { fromId: { not: null } },
  });
  const usersWithTxTo = await prisma.transaction.groupBy({
    by: ["toId"],
    where: { toId: { not: null } },
  });

  const userIds = new Set<string>();

  for (const b of usersWithBookings) {
    if (b.clientId) userIds.add(b.clientId);
  }
  for (const t of usersWithTxFrom) {
    if (t.fromId) userIds.add(t.fromId);
  }
  for (const t of usersWithTxTo) {
    if (t.toId) userIds.add(t.toId);
  }

  return userIds.size;
}
