import { prisma } from "@/lib/prisma";

export type FacilitatorDashboardData = {
  potBalance: number;
  donationsThisMonth: number;
  fundingsThisMonth: number;
  pendingRequests: number;
  fundedMissions: number;
  openCollectiveMissions: number;
};

export type PotTransactionWithDetails = {
  id: string;
  type: string;
  amount: number;
  reason: string | null;
  userName: string | null;
  bookingId: string | null;
  createdAt: Date;
};

export type FundedMissionItem = {
  id: string;
  bookingId: string;
  serviceTitle: string;
  requesterName: string;
  providerName: string;
  potAmount: number;
  status: string;
  completedAt: Date | null;
  fundedAt: Date;
};

export type RequestWithDetails = {
  id: string;
  userId: string;
  userName: string;
  bookingId: string | null;
  bookingTitle: string | null;
  amount: number;
  reason: string | null;
  message: string | null;
  status: string;
  createdAt: Date;
  decidedById: string | null;
  decidedByName: string | null;
  decidedAt: Date | null;
  decisionNote: string | null;
  // Lot 18 — Solidarity info
  solidarityStatus: string | null;
  solidarityCategory: string | null;
  solidarityReason: string | null;
};

/**
 * Get facilitator dashboard summary data.
 */
export async function getFacilitatorDashboard(): Promise<FacilitatorDashboardData> {
  const pot = await prisma.communityPot.findFirst({ orderBy: { createdAt: "asc" } });
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const donationsThisMonth = await prisma.communityPotTransaction.count({
    where: { type: "DONATION", createdAt: { gte: firstOfMonth } },
  });

  // Sum of amounts for fundings this month using aggregate
  const fundingsAgg = await prisma.communityPotTransaction.aggregate({
    _sum: { amount: true },
    where: { type: "FUNDING", createdAt: { gte: firstOfMonth } },
  });

  const fundedMissions = await prisma.booking.count({
    where: { fundedByCommunityPot: true },
  });

  const pendingRequests = await prisma.communityPotRequest.count({
    where: { status: "PENDING" },
  });

  const openCollectiveMissions = await prisma.collectiveMission.count({
    where: { status: "OPEN" },
  });

  return {
    potBalance: pot?.balance ?? 0,
    donationsThisMonth,
    fundingsThisMonth: fundingsAgg._sum.amount ?? 0,
    pendingRequests,
    fundedMissions,
    openCollectiveMissions,
  };
}

/**
 * Get all community pot requests with user/booking details.
 */
export async function getFacilitatorRequests(): Promise<RequestWithDetails[]> {
  const requests = await prisma.communityPotRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true } },
      decidedBy: { select: { id: true, name: true } },
      pot: { select: { balance: true } },
    },
  });

  // Fetch booking titles & solidarity info for requests that have a bookingId
  const bookingIds = requests
    .filter((r) => r.bookingId)
    .map((r) => r.bookingId!);

  const bookings = bookingIds.length > 0
    ? await prisma.booking.findMany({
        where: { id: { in: bookingIds } },
        select: {
          id: true,
          service: {
            select: {
              title: true,
              isSolidarityMission: true,
              solidarityStatus: true,
              solidarityCategory: true,
              solidarityReason: true,
            },
          },
        },
      })
    : [];

  const bookingMap = new Map(bookings.map((b) => [b.id, b.service]));

  return requests.map((r) => {
    const service = r.bookingId ? bookingMap.get(r.bookingId) ?? null : null;
    return {
    id: r.id,
    userId: r.userId,
    userName: r.user.name,
    bookingId: r.bookingId,
    bookingTitle: r.bookingId ? service?.title ?? "Mission inconnue" : null,
    amount: r.amount,
    reason: r.reason,
    message: r.message,
    status: r.status,
    createdAt: r.createdAt,
    decidedById: r.decidedById,
    decidedByName: r.decidedBy?.name ?? null,
    decidedAt: r.decidedAt,
    decisionNote: r.decisionNote,
    solidarityStatus: service?.solidarityStatus ?? null,
    solidarityCategory: service?.solidarityCategory ?? null,
    solidarityReason: service?.solidarityReason ?? null,
  }});
}

/**
 * Get recent pot transactions with user details.
 */
export async function getPotTransactions(): Promise<PotTransactionWithDetails[]> {
  const transactions = await prisma.communityPotTransaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { name: true } },
    },
  });

  // Collect bookingIds — some from direct link, others resolved via approved requests
  const directBookingIds = transactions
    .filter((t) => t.bookingId)
    .map((t) => t.bookingId!);

  // For transactions sans bookingId, try to find via approved CommunityPotRequest
  const txWithoutBooking = transactions.filter((t) => !t.bookingId && t.type === "FUNDING");
  const resolvedMap = new Map<string, string | null>();

  if (txWithoutBooking.length > 0) {
    const approvedRequests = await prisma.communityPotRequest.findMany({
      where: {
        status: "APPROVED",
        bookingId: { not: null },
        amount: { in: txWithoutBooking.map((t) => t.amount) },
      },
      select: { amount: true, bookingId: true, createdAt: true },
    });

    for (const tx of txWithoutBooking) {
      const match = approvedRequests.find((r) =>
        r.amount === tx.amount &&
        Math.abs(r.createdAt.getTime() - tx.createdAt.getTime()) < 300000
      );
      resolvedMap.set(tx.id, match?.bookingId ?? null);
    }
  }

  // Merge bookingIds directs + résolus
  const allBookingIds = [
    ...directBookingIds,
    ...txWithoutBooking
      .map((t) => resolvedMap.get(t.id))
      .filter((id): id is string => id !== null),
  ];

  const uniqueBookingIds = [...new Set(allBookingIds)];

  const bookings = uniqueBookingIds.length > 0
    ? await prisma.booking.findMany({
        where: { id: { in: uniqueBookingIds } },
        select: {
          id: true,
          service: { select: { title: true } },
        },
      })
    : [];

  const bookingTitles = new Map(bookings.map((b) => [b.id, b.service.title]));

  return transactions.map((t) => {
    // Résoudre le bookingId : direct, ou via request approuvée
    let resolvedBookingId = t.bookingId;
    if (!resolvedBookingId && resolvedMap.has(t.id)) {
      resolvedBookingId = resolvedMap.get(t.id) ?? null;
    }

    return {
      id: t.id,
      type: t.type,
      amount: t.amount,
      reason: t.reason,
      userName: t.user?.name ?? null,
      bookingId: resolvedBookingId,
      createdAt: t.createdAt,
    };
  });
}

/**
 * Get bookings funded by the community pot, with service and user details.
 */
export async function getFundedMissions(): Promise<FundedMissionItem[]> {
  const bookings = await prisma.booking.findMany({
    where: { fundedByCommunityPot: true },
    include: {
      service: {
        select: { title: true, providerId: true, provider: { select: { name: true } } },
      },
      client: { select: { name: true } },
    },
    orderBy: { completedAt: { sort: "desc", nulls: "last" } },
  });

  return bookings.map((b) => ({
    id: b.id,
    bookingId: b.id,
    serviceTitle: b.service.title,
    requesterName: b.client.name,
    providerName: b.service.provider.name,
    potAmount: b.communityPotAmount ?? 0,
    status: b.status,
    completedAt: b.completedAt,
    fundedAt: b.createdAt,
  }));
}
