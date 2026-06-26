import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AgendaClient from "./AgendaClient";

// ─── Unified event type for the calendar ───────────────────────────────

export type AgendaEvent = {
  id: string;
  title: string;
  date: string | null; // ISO string
  type: "booking" | "collective" | "urgent";
  status: string;
  totalTime?: number;
  href: string;
  roleIcon: string;
  roleLabel: string;
};

export default async function AgendaPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true },
  });

  if (!user) redirect("/auth/signin");

  const events: AgendaEvent[] = [];

  // ─── 1. Bookings (missions réservées) ─────────────────────────────────

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
    },
  });

  for (const b of bookings) {
    const isClient = b.clientId === user.id;
    events.push({
      id: `booking-${b.id}`,
      title: b.service.title,
      date: b.startAt?.toISOString() ?? null,
      type: "booking",
      status: b.status,
      totalTime: b.totalTime,
      href: `/bookings/${b.id}`,
      roleIcon: isClient ? "🙋" : "🦸",
      roleLabel: isClient ? "En tant que client" : "En tant que Hero",
    });
  }

  // ─── 2. Collective missions (missions collectives) ───────────────────

  const collectiveMissions = await prisma.collectiveMission.findMany({
    where: {
      OR: [
        { organizerId: user.id },
        { participants: { some: { userId: user.id } } },
      ],
    },
    orderBy: { startsAt: { sort: "desc", nulls: "last" } },
    include: {
      participants: {
        where: { userId: user.id },
        select: { role: true, status: true },
      },
    },
  });

  for (const m of collectiveMissions) {
    const myParticipation = m.participants[0];
    const isOrganizer = m.organizerId === user.id;
    const roleIcon = isOrganizer ? "👥" : "🤝";
    const roleLabel = isOrganizer
      ? "En tant qu'organisateur"
      : myParticipation?.role === "BENEFICIARY"
        ? "En tant que bénéficiaire"
        : "En tant que participant";

    events.push({
      id: `collective-${m.id}`,
      title: m.title,
      date: m.startsAt?.toISOString() ?? null,
      type: "collective",
      status: m.status,
      totalTime: m.durationHours,
      href: `/collective-missions/${m.id}`,
      roleIcon,
      roleLabel,
    });
  }

  // ─── 3. Urgent requests (demandes urgentes) ──────────────────────────

  const urgentRequests = await prisma.urgentRequest.findMany({
    where: { requesterId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      totalTime: true,
      status: true,
      createdAt: true,
      expiresAt: true,
    },
  });

  for (const r of urgentRequests) {
    // Use expiresAt as the calendar date if available, otherwise createdAt
    const date = r.expiresAt?.toISOString() ?? r.createdAt.toISOString();
    events.push({
      id: `urgent-${r.id}`,
      title: r.title,
      date,
      type: "urgent",
      status: r.status,
      totalTime: r.totalTime,
      href: `/urgent/${r.id}`,
      roleIcon: "🆘",
      roleLabel: "Demande urgente",
    });
  }

  // ─── 4. Urgent offers (offres sur demandes urgentes) ─────────────────

  const urgentOffers = await prisma.urgentOffer.findMany({
    where: { providerId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      urgentRequest: {
        select: {
          id: true,
          title: true,
          totalTime: true,
          createdAt: true,
          expiresAt: true,
        },
      },
    },
  });

  for (const o of urgentOffers) {
    const date =
      o.urgentRequest.expiresAt?.toISOString() ?? o.createdAt.toISOString();
    events.push({
      id: `urgent-offer-${o.id}`,
      title: o.urgentRequest.title,
      date,
      type: "urgent",
      status: o.status,
      totalTime: o.urgentRequest.totalTime,
      href: `/urgent/${o.urgentRequest.id}`,
      roleIcon: "🦸",
      roleLabel: "Offre de service",
    });
  }

  return (
    <AgendaClient events={events} userId={user.id} userName={user.name} />
  );
}
