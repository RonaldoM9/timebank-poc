"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserBalance, createEscrow, releaseEscrow, refundEscrow } from "@/lib/ledger";
import { awardXP, evaluateUserRewards } from "@/lib/gamification";
import { z } from "zod";

const createServiceSchema = z.object({
  title: z.string().min(3, "Le titre doit faire au moins 3 caractères"),
  description: z.string().min(10, "La description doit faire au moins 10 caractères"),
  category: z.string().min(1, "La catégorie est requise"),
  ratePerHour: z.coerce.number().int().positive("Le tarif doit être un nombre entier positif"),
});

export type ServiceItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  ratePerHour: number;
  providerId: string;
  status: string;
  createdAt: Date;
  provider: {
    name: string;
    walletAddress: string;
  };
};

export async function createService(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: "Vous devez être connecté" };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { error: "Utilisateur introuvable" };

  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    ratePerHour: formData.get("ratePerHour"),
  };

  const parsed = createServiceSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return { errors: fieldErrors };
  }

  const { title, description, category, ratePerHour } = parsed.data;

  const service = await prisma.service.create({
    data: {
      title,
      description,
      category,
      ratePerHour,
      providerId: user.id,
      status: "active",
    },
  });

  return { success: true, serviceId: service.id };
}

export async function toggleServiceStatus(serviceId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: "Vous devez être connecté" };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { error: "Utilisateur introuvable" };

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { providerId: true, status: true },
  });
  if (!service) return { error: "Service introuvable" };
  if (service.providerId !== user.id) return { error: "Action non autorisée" };

  const newStatus = service.status === "active" ? "inactive" : "active";

  await prisma.service.update({
    where: { id: serviceId },
    data: { status: newStatus },
  });

  return { success: true, newStatus };
}

export async function getMyServices() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return [];

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return [];

  const services = await prisma.service.findMany({
    where: { providerId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      provider: {
        select: { name: true, walletAddress: true },
      },
    },
  });

  return services.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));
}

export async function getActiveServices(search?: string, category?: string) {
  const where: Record<string, unknown> = { status: "active" };

  if (category && category !== "Tous") {
    where.category = category;
  }

  if (search && search.trim()) {
    where.OR = [
      { title: { contains: search.trim() } },
      { description: { contains: search.trim() } },
      { provider: { name: { contains: search.trim() } } },
    ];
  }

  const services = await prisma.service.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      provider: {
        select: { name: true, walletAddress: true },
      },
    },
  });

  return services.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));
}

export async function getServiceById(id: string) {
  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      provider: {
        select: { id: true, name: true, walletAddress: true },
      },
    },
  });

  if (!service) return null;

  return {
    ...service,
    createdAt: service.createdAt.toISOString(),
    updatedAt: service.updatedAt.toISOString(),
  };
}

// ─── Booking Server Actions ─────────────────────────────────────────────

export type BookingItem = {
  id: string;
  serviceId: string;
  clientId: string;
  hours: number;
  totalTime: number;
  status: string;
  createdAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  service: {
    id: string;
    title: string;
    ratePerHour: number;
    provider: { id: string; name: string };
  };
  client: { id: string; name: string };
};

/** Réservations où l'user connecté est le client */
export async function getMyBookingsClient(): Promise<BookingItem[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return [];

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return [];

  const bookings = await prisma.booking.findMany({
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
    },
  });

  return bookings.map((b) => ({
    ...b,
    createdAt: b.createdAt.toISOString(),
    completedAt: b.completedAt?.toISOString() ?? null,
    cancelledAt: b.cancelledAt?.toISOString() ?? null,
  }));
}

/** Réservations où l'user connecté est le provider du service */
export async function getMyBookingsProvider(): Promise<BookingItem[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return [];

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return [];

  const bookings = await prisma.booking.findMany({
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
    },
  });

  return bookings.map((b) => ({
    ...b,
    createdAt: b.createdAt.toISOString(),
    completedAt: b.completedAt?.toISOString() ?? null,
    cancelledAt: b.cancelledAt?.toISOString() ?? null,
  }));
}

/** Marque une réservation comme terminée et libère l'escrow (client only) */
export async function completeBooking(
  bookingId: string
): Promise<{ success: true } | { error: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Vous devez être connecté" };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { error: "Utilisateur introuvable" };

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: { select: { providerId: true } },
    },
  });
  if (!booking) return { error: "Réservation introuvable" };
  if (booking.clientId !== user.id)
    return { error: "Seul le client peut confirmer la complétion" };
  if (booking.status !== "pending")
    return { error: "Seules les réservations en attente peuvent être complétées" };

  await prisma.$transaction([
    prisma.booking.update({
      where: { id: bookingId },
      data: { status: "completed", completedAt: new Date() },
    }),
  ]);

  const releaseResult = await releaseEscrow({
    providerId: booking.service.providerId,
    bookingId,
    amount: booking.totalTime,
  });

  if ("error" in releaseResult) {
    return { error: releaseResult.error };
  }

  // ─── Gamification : XP + badges + quêtes ─────────────────────────
  // Provider reçoit +50 XP pour mission terminée
  await awardXP({
    userId: booking.service.providerId,
    type: "booking_complete",
    points: 50,
    sourceType: "booking",
    sourceId: booking.id,
    description: "Mission terminée en tant qu'aidant",
  });

  // Client reçoit +20 XP
  await awardXP({
    userId: booking.clientId,
    type: "booking_complete",
    points: 20,
    sourceType: "booking",
    sourceId: booking.id,
    description: "Mission terminée en tant que bénéficiaire",
  });

  // Check badges, quêtes, niveau
  await evaluateUserRewards(booking.service.providerId, "booking_complete");

  return { success: true };
}

/** Annule une réservation et rembourse l'escrow (client only) */
export async function cancelBooking(
  bookingId: string,
  reason?: string
): Promise<{ success: true } | { error: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Vous devez être connecté" };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { error: "Utilisateur introuvable" };

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });
  if (!booking) return { error: "Réservation introuvable" };
  if (booking.clientId !== user.id)
    return { error: "Seul le client peut annuler une réservation" };
  if (booking.status !== "pending")
    return { error: "Seules les réservations en attente peuvent être annulées" };

  await prisma.$transaction([
    prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "cancelled",
        cancelledAt: new Date(),
        cancellationReason: reason ?? null,
      },
    }),
  ]);

  const refundResult = await refundEscrow({
    clientId: booking.clientId,
    bookingId,
    amount: booking.totalTime,
  });

  if ("error" in refundResult) {
    return { error: refundResult.error };
  }

  return { success: true };
}

export type BookingDetail = {
  id: string;
  serviceId: string;
  clientId: string;
  hours: number;
  totalTime: number;
  status: string;
  createdAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  service: {
    id: string;
    title: string;
    description: string;
    ratePerHour: number;
    provider: {
      id: string;
      name: string;
    };
  };
  client: {
    id: string;
    name: string;
  };
  transactions: {
    id: string;
    type: string;
    amount: number;
    status: string;
    createdAt: string;
  }[];
};

export async function getMyBookingById(bookingId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Non connecté" };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { error: "Utilisateur introuvable" };

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
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

  if (!booking) return null;

  // Sécurité : seul le client ou le provider peut voir
  const isClient = booking.clientId === user.id;
  const isProvider = booking.service.provider.id === user.id;
  if (!isClient && !isProvider) return null;

  return {
    ...booking,
    createdAt: booking.createdAt.toISOString(),
    completedAt: booking.completedAt?.toISOString() ?? null,
    cancelledAt: booking.cancelledAt?.toISOString() ?? null,
    transactions: booking.transactions.map((tx) => ({
      ...tx,
      createdAt: tx.createdAt.toISOString(),
    })),
  };
}

// ─── Create Booking (with or without slot) ───────────────────────────────

export async function createBooking(
  serviceId: string,
  formData: FormData
): Promise<
  | { success: true; bookingId: string }
  | { error: string }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: "Vous devez être connecté" };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { error: "Utilisateur introuvable" };

  // Récupérer le service avec son provider
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: {
      id: true,
      title: true,
      ratePerHour: true,
      status: true,
      providerId: true,
      provider: { select: { id: true, name: true } },
    },
  });

  if (!service) return { error: "Service introuvable" };
  if (service.status !== "active") return { error: "Ce service n'est plus actif" };
  if (service.providerId === user.id) return { error: "Vous ne pouvez pas réserver votre propre service" };

  // Valider les heures
  const hoursRaw = formData.get("hours");
  const hours = typeof hoursRaw === "string" ? parseInt(hoursRaw, 10) : NaN;

  if (isNaN(hours) || hours <= 0) {
    return { error: "Le nombre d'heures doit être supérieur à 0" };
  }

  // Recalculer le total côté serveur
  const totalTime = service.ratePerHour * hours;

  // Vérifier le solde
  const balance = await getUserBalance(user.id);
  if (balance < totalTime) {
    return { error: "Solde TIME insuffisant. Vous avez besoin de " + totalTime + " TIME mais vous n'avez que " + balance + " TIME." };
  }

  // Valider le créneau si fourni
  const startAtRaw = formData.get("startAt");
  const endAtRaw = formData.get("endAt");
  let startAt: Date | undefined;
  let endAt: Date | undefined;

  if (startAtRaw && endAtRaw) {
    startAt = new Date(startAtRaw as string);
    endAt = new Date(endAtRaw as string);

    if (isNaN(startAt.getTime()) || isNaN(endAt.getTime())) {
      return { error: "Dates de créneau invalides" };
    }
    if (startAt <= new Date()) {
      return { error: "Impossible de réserver dans le passé" };
    }
    if (endAt <= startAt) {
      return { error: "La date de fin doit être après la date de début" };
    }

    // Vérifier conflit avec autres bookings
    const conflict = await prisma.booking.findFirst({
      where: {
        service: { providerId: service.providerId },
        status: { in: ["pending", "confirmed", "in_progress"] },
        startAt: { not: null },
        endAt: { not: null },
        AND: [
          { startAt: { lt: endAt } },
          { endAt: { gt: startAt } },
        ],
      },
    });
    if (conflict) {
      return { error: "Ce créneau est déjà réservé" };
    }
  }

  // Créer le booking
  const booking = await prisma.booking.create({
    data: {
      serviceId: service.id,
      clientId: user.id,
      hours,
      totalTime,
      status: "pending",
      startAt: startAt || null,
      endAt: endAt || null,
    },
  });

  // Appeler l'escrow
  const escrowResult = await createEscrow({
    clientId: user.id,
    bookingId: booking.id,
    amount: totalTime,
  });

  if ("error" in escrowResult) {
    // Rollback le booking si l'escrow échoue
    await prisma.booking.delete({ where: { id: booking.id } });
    return { error: escrowResult.error };
  }

  return { success: true, bookingId: booking.id };
}
