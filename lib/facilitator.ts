import { prisma } from "@/lib/prisma";

export type FacilitatorDashboardData = {
  potBalance: number;
  donationsThisMonth: number;
  fundingsThisMonth: number;
  pendingRequests: number;
  fundedMissions: number;
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

  return {
    potBalance: pot?.balance ?? 0,
    donationsThisMonth,
    fundingsThisMonth: fundingsAgg._sum.amount ?? 0,
    pendingRequests,
    fundedMissions,
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

  // Fetch booking titles for requests that have a bookingId
  const bookingIds = requests
    .filter((r) => r.bookingId)
    .map((r) => r.bookingId!);

  const bookings = bookingIds.length > 0
    ? await prisma.booking.findMany({
        where: { id: { in: bookingIds } },
        select: { id: true, service: { select: { title: true } } },
      })
    : [];

  const bookingMap = new Map(bookings.map((b) => [b.id, b.service.title]));

  return requests.map((r) => ({
    id: r.id,
    userId: r.userId,
    userName: r.user.name,
    bookingId: r.bookingId,
    bookingTitle: r.bookingId ? bookingMap.get(r.bookingId) ?? "Mission inconnue" : null,
    amount: r.amount,
    reason: r.reason,
    message: r.message,
    status: r.status,
    createdAt: r.createdAt,
    decidedById: r.decidedById,
    decidedByName: r.decidedBy?.name ?? null,
    decidedAt: r.decidedAt,
    decisionNote: r.decisionNote,
  }));
}
