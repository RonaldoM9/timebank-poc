import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AgendaClient from "./AgendaClient";

export type AgendaBooking = {
  id: string;
  serviceId: string;
  clientId: string;
  hours: number;
  totalTime: number;
  status: string;
  createdAt: string;
  startAt: string | null;
  endAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  service: {
    id: string;
    title: string;
    ratePerHour: number;
    providerId: string;
    provider: { id: string; name: string };
  };
  client: { id: string; name: string };
  provider: { id: string; name: string };
  transactions: { id: string; type: string; amount: number; status: string; createdAt: string }[];
};

export default async function AgendaPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true },
  });

  if (!user) redirect("/auth/signin");

  const bookings = await prisma.booking.findMany({
    where: {
      OR: [
        { clientId: user.id },
        { service: { providerId: user.id } },
      ],
    },
    orderBy: { startAt: { sort: "desc", nulls: "last" } },
    include: {
      service: {
        select: {
          id: true,
          title: true,
          ratePerHour: true,
          providerId: true,
          provider: { select: { id: true, name: true } },
        },
      },
      client: { select: { id: true, name: true } },
      transactions: {
        orderBy: { createdAt: "desc" },
        select: { id: true, type: true, amount: true, status: true, createdAt: true },
      },
    },
  });

  const now = new Date();

  const serialized: AgendaBooking[] = bookings.map((b: any) => ({
    id: b.id,
    serviceId: b.serviceId,
    clientId: b.clientId,
    hours: b.hours,
    totalTime: b.totalTime,
    status: b.status,
    createdAt: b.createdAt.toISOString(),
    startAt: b.startAt?.toISOString() ?? null,
    endAt: b.endAt?.toISOString() ?? null,
    completedAt: b.completedAt?.toISOString() ?? null,
    cancelledAt: b.cancelledAt?.toISOString() ?? null,
    cancellationReason: b.cancellationReason ?? null,
    service: {
      id: b.service.id,
      title: b.service.title,
      ratePerHour: b.service.ratePerHour,
      providerId: b.service.providerId,
      provider: { id: b.service.provider.id, name: b.service.provider.name },
    },
    client: { id: b.client.id, name: b.client.name },
    provider: { id: b.service.provider.id, name: b.service.provider.name },
    transactions: b.transactions.map((tx: any) => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      status: tx.status,
      createdAt: tx.createdAt.toISOString(),
    })),
  }));

  const isUpcoming = (b: AgendaBooking) => {
    if (b.status === "completed" || b.status === "cancelled") return false;
    if (b.startAt && new Date(b.startAt) < now) return false;
    if (!b.startAt && b.status === "pending") return true;
    return true;
  };

  const upcoming = serialized.filter(isUpcoming);
  const past = serialized.filter((b) => !isUpcoming(b));

  return (
    <AgendaClient
      upcoming={upcoming}
      past={past}
      userId={user.id}
      userName={user.name}
    />
  );
}
