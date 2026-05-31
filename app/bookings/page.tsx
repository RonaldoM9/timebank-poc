import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookingItem } from "@/app/services/actions";
import BookingsClient from "./BookingsClient";

export default async function BookingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true },
  });

  if (!user) redirect("/auth/signin");

  const [clientBookings, providerBookings] = await Promise.all([
    prisma.booking.findMany({
      where: { clientId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            ratePerHour: true,
            provider: { select: { id: true, name: true } },
          },
        },
        client: { select: { id: true, name: true } },
        _count: { select: { messages: true } },
      },
    }),
    prisma.booking.findMany({
      where: { service: { providerId: user.id } },
      orderBy: { createdAt: "desc" },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            ratePerHour: true,
            provider: { select: { id: true, name: true } },
          },
        },
        client: { select: { id: true, name: true } },
        _count: { select: { messages: true } },
      },
    }),
  ]);

  const serialize = (b: typeof clientBookings[number]): BookingItem => ({
    ...b,
    createdAt: b.createdAt.toISOString(),
    completedAt: b.completedAt?.toISOString() ?? null,
    cancelledAt: b.cancelledAt?.toISOString() ?? null,
    lastMessageAt: b.lastMessageAt?.toISOString() ?? null,
    _count: b._count ?? { messages: 0 },
  });

  return (
    <BookingsClient
      initialClientBookings={clientBookings.map(serialize)}
      initialProviderBookings={providerBookings.map(serialize)}
      userName={user.name}
    />
  );
}
