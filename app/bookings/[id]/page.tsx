import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BookingDetailClient from "./BookingDetailClient";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) redirect("/auth/signin");

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      service: {
        include: {
          provider: {
            select: { id: true, name: true },
          },
        },
      },
      client: {
        select: { id: true, name: true },
      },
      transactions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!booking) notFound();

  // Sécurité : accessible uniquement par le client ou le provider
  const isClient = booking.clientId === user.id;
  const isProvider = booking.service.provider.id === user.id;
  if (!isClient && !isProvider) notFound();

  const serialized = {
    id: booking.id,
    serviceId: booking.serviceId,
    clientId: booking.clientId,
    hours: booking.hours,
    totalTime: booking.totalTime,
    status: booking.status,
    createdAt: booking.createdAt.toISOString(),
    completedAt: booking.completedAt?.toISOString() ?? null,
    cancelledAt: booking.cancelledAt?.toISOString() ?? null,
    cancellationReason: booking.cancellationReason ?? null,
    service: {
      id: booking.service.id,
      title: booking.service.title,
      description: booking.service.description,
      ratePerHour: booking.service.ratePerHour,
      provider: {
        id: booking.service.provider.id,
        name: booking.service.provider.name,
      },
    },
    client: {
      id: booking.client.id,
      name: booking.client.name,
    },
    transactions: booking.transactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      status: tx.status,
      createdAt: tx.createdAt.toISOString(),
    })),
  };

  return (
    <BookingDetailClient
      booking={serialized}
      userId={user.id}
      isClient={isClient}
    />
  );
}
