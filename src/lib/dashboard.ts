import { prisma } from "@/lib/prisma";

export type DashboardStats = {
  timeBalance: number;
  receivedBookingsCount: number;
  requestedBookingsCount: number;
  unreadMessagesCount: number;
  todoActionsCount: number;
};

const ACTIVE_STATUSES = ["pending", "accepted", "in_progress"];

export async function getDashboardStats(
  userId: string
): Promise<DashboardStats> {
  const [user, receivedBookingsCount, requestedBookingsCount, unreadMessagesCount] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { timeBalance: true },
      }),
      // Missions reçues (provider)
      prisma.booking.count({
        where: {
          service: { providerId: userId },
          status: { in: ACTIVE_STATUSES },
        },
      }),
      // Missions demandées (customer/client)
      prisma.booking.count({
        where: {
          clientId: userId,
          status: { in: ACTIVE_STATUSES },
        },
      }),
      // Messages non lus (reçus par user, pas lus)
      prisma.bookingMessage.count({
        where: {
          readAt: null,
          authorId: { not: userId },
          booking: {
            OR: [
              { clientId: userId },
              { service: { providerId: userId } },
            ],
          },
        },
      }),
    ]);

  // Actions à faire = pending provider bookings + unread messages + completed bookings (customer) sans rating
  const pendingProviderCount = await prisma.booking.count({
    where: {
      service: { providerId: userId },
      status: "pending",
    },
  });

  const completedWithoutRating = await prisma.booking.count({
    where: {
      clientId: userId,
      status: "completed",
      rating: null,
    },
  });

  const todoActionsCount =
    pendingProviderCount + unreadMessagesCount + completedWithoutRating;

  return {
    timeBalance: user?.timeBalance ?? 0,
    receivedBookingsCount,
    requestedBookingsCount,
    unreadMessagesCount,
    todoActionsCount,
  };
}
