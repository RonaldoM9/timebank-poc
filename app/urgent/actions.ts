"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createEscrow, getUserBalance } from "@/lib/ledger";
import { z } from "zod";

// ─── Schémas de validation ─────────────────────────────────────────

const createUrgentSchema = z.object({
  title: z.string().min(5, "Le titre doit faire au moins 5 caractères"),
  description: z.string().min(10, "La description doit faire au moins 10 caractères"),
  category: z.string().min(1, "La catégorie est requise"),
  city: z.string().optional().default(""),
  department: z.string().optional().default(""),
  region: z.string().optional().default(""),
  online: z.coerce.boolean().optional().default(false),
  urgency: z.enum(["today", "week"]).default("today"),
  hours: z.coerce.number().int().positive("Les heures doivent être supérieures à 0"),
  ratePerHour: z.coerce.number().int().min(1, "Minimum 1 TIME/h").max(3, "Maximum 3 TIME/h"),
});

// ─── Types partagés ─────────────────────────────────────────────────

export type UrgentRequestItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  city: string | null;
  department: string | null;
  region: string | null;
  online: boolean;
  urgency: string;
  hours: number;
  ratePerHour: number;
  totalTime: number;
  status: string;
  createdAt: string;
  offersCount: number;
  requester: {
    id: string;
    name: string;
    reputation: number;
  };
};

export type UrgentRequestDetail = UrgentRequestItem & {
  offers: UrgentOfferItem[];
};

export type UrgentOfferItem = {
  id: string;
  message: string | null;
  status: string;
  createdAt: string;
  provider: {
    id: string;
    name: string;
    reputation: number;
  };
};

// ─── Lister les demandes urgentes ───────────────────────────────────

export async function getUrgentRequests(filters?: {
  city?: string;
  department?: string;
  region?: string;
  online?: boolean;
  urgency?: string;
  category?: string;
}): Promise<UrgentRequestItem[]> {
  const where: Record<string, unknown> = { status: "open" };

  if (filters?.city?.trim()) {
    where.city = filters.city.trim();
  }
  if (filters?.department?.trim()) {
    where.department = filters.department.trim();
  }
  if (filters?.region?.trim()) {
    where.region = filters.region.trim();
  }
  if (filters?.online) {
    where.online = true;
  }
  if (filters?.urgency) {
    where.urgency = filters.urgency;
  }
  if (filters?.category && filters.category !== "Tous") {
    where.category = filters.category;
  }

  const requests = await prisma.urgentRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      requester: {
        select: { id: true, name: true, reputation: true },
      },
      offers: {
        select: { id: true },
      },
    },
  });

  return requests.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    city: r.city,
    department: r.department,
    region: r.region,
    online: r.online,
    urgency: r.urgency,
    hours: r.hours,
    ratePerHour: r.ratePerHour,
    totalTime: r.totalTime,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    offersCount: r.offers.length,
    requester: r.requester,
  }));
}

// ─── Créer une demande urgente ──────────────────────────────────────

export async function createUrgentRequest(
  formData: FormData
): Promise<{ success: true; requestId: string } | { error: string; errors?: Record<string, string[]> }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: "Vous devez être connecté" };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, city: true, department: true, region: true },
  });
  if (!user) return { error: "Utilisateur introuvable" };

  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    city: formData.get("city") || user.city || "",
    department: formData.get("department") || user.department || "",
    region: formData.get("region") || user.region || "",
    online: formData.get("online") === "on",
    urgency: formData.get("urgency") || "today",
    hours: formData.get("hours"),
    ratePerHour: formData.get("ratePerHour"),
  };

  const parsed = createUrgentSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return { error: "Champs invalides", errors: fieldErrors };
  }

  const { title, description, category, city, department, region, online, urgency, hours, ratePerHour } = parsed.data;

  // Recalcul côté serveur
  const totalTime = hours * ratePerHour;

  const request = await prisma.urgentRequest.create({
    data: {
      requesterId: user.id,
      title,
      description,
      category,
      city: city || null,
      department: department || null,
      region: region || null,
      online,
      urgency,
      hours,
      ratePerHour,
      totalTime,
      status: "open",
    },
  });

  return { success: true, requestId: request.id };
}

// ─── Récupérer une demande urgente par ID ───────────────────────────

export async function getUrgentRequestById(
  requestId: string
): Promise<UrgentRequestDetail | null> {
  const request = await prisma.urgentRequest.findUnique({
    where: { id: requestId },
    include: {
      requester: {
        select: { id: true, name: true, reputation: true },
      },
      offers: {
        orderBy: { createdAt: "desc" },
        include: {
          provider: {
            select: { id: true, name: true, reputation: true },
          },
        },
      },
    },
  });

  if (!request) return null;

  return {
    id: request.id,
    title: request.title,
    description: request.description,
    category: request.category,
    city: request.city,
    department: request.department,
    region: request.region,
    online: request.online,
    urgency: request.urgency,
    hours: request.hours,
    ratePerHour: request.ratePerHour,
    totalTime: request.totalTime,
    status: request.status,
    createdAt: request.createdAt.toISOString(),
    offersCount: request.offers.length,
    requester: request.requester,
    offers: request.offers.map((o) => ({
      id: o.id,
      message: o.message,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
      provider: o.provider,
    })),
  };
}

// ─── Proposer son aide ──────────────────────────────────────────────

export async function proposeHelp(
  requestId: string,
  message?: string
): Promise<{ success: true } | { error: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: "Vous devez être connecté" };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { error: "Utilisateur introuvable" };

  const request = await prisma.urgentRequest.findUnique({
    where: { id: requestId },
    select: { requesterId: true, status: true },
  });
  if (!request) return { error: "Demande introuvable" };
  if (request.requesterId === user.id) {
    return { error: "Vous ne pouvez pas proposer votre aide sur votre propre demande" };
  }
  if (request.status !== "open") {
    return { error: "Cette demande n'est plus ouverte" };
  }

  // Vérifier qu'il n'a pas déjà proposé
  const existing = await prisma.urgentOffer.findFirst({
    where: { urgentRequestId: requestId, providerId: user.id },
  });
  if (existing) {
    return { error: "Vous avez déjà proposé votre aide sur cette demande" };
  }

  await prisma.urgentOffer.create({
    data: {
      urgentRequestId: requestId,
      providerId: user.id,
      message: message?.trim() || null,
      status: "pending",
    },
  });

  return { success: true };
}

// ─── Accepter une offre (→ booking + escrow) ────────────────────────

export async function acceptOffer(
  requestId: string,
  offerId: string
): Promise<{ success: true } | { error: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: "Vous devez être connecté" };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { error: "Utilisateur introuvable" };

  // 1. Vérifier que l'user est bien le requester de cette demande
  const request = await prisma.urgentRequest.findUnique({
    where: { id: requestId },
    select: { requesterId: true, status: true, totalTime: true, title: true, description: true, category: true, ratePerHour: true, hours: true },
  });
  if (!request) return { error: "Demande introuvable" };
  if (request.requesterId !== user.id) {
    return { error: "Seul le demandeur peut accepter une offre" };
  }
  if (request.status !== "open") {
    return { error: "Cette demande n'est plus ouverte" };
  }

  // 2. Vérifier l'offre
  const offer = await prisma.urgentOffer.findUnique({
    where: { id: offerId },
    select: { id: true, status: true, providerId: true, urgentRequestId: true },
  });
  if (!offer || offer.urgentRequestId !== requestId) {
    return { error: "Offre introuvable" };
  }
  if (offer.status !== "pending") {
    return { error: "Cette offre n'est plus disponible" };
  }

  // 3. Vérifier le solde du requester
  const balance = await getUserBalance(user.id);
  if (balance < request.totalTime) {
    return { error: `Solde TIME insuffisant. Il vous faut ${request.totalTime} TIME (solde: ${balance} TIME).` };
  }

  // 4. Créer un service temporaire pour ce booking
  // On crée un service "fantôme" qui représente cette demande urgente
  const service = await prisma.service.create({
    data: {
      title: `[Urgent] ${request.title}`,
      description: request.description,
      category: request.category,
      ratePerHour: request.ratePerHour,
      providerId: offer.providerId,
      status: "active",
    },
  });

  // 5. Créer le booking
  const booking = await prisma.booking.create({
    data: {
      serviceId: service.id,
      clientId: user.id,
      hours: request.hours,
      totalTime: request.totalTime,
      status: "pending",
    },
  });

  // 6. Escrow
  const escrowResult = await createEscrow({
    clientId: user.id,
    bookingId: booking.id,
    amount: request.totalTime,
  });

  if ("error" in escrowResult) {
    // Rollback
    await prisma.booking.delete({ where: { id: booking.id } });
    await prisma.service.delete({ where: { id: service.id } });
    return { error: escrowResult.error };
  }

  // 7. Mettre à jour request + toutes les offres dans une transaction
  await prisma.$transaction([
    prisma.urgentRequest.update({
      where: { id: requestId },
      data: { status: "matched" },
    }),
    prisma.urgentOffer.update({
      where: { id: offerId },
      data: { status: "accepted" },
    }),
    // Décliner toutes les autres offres
    prisma.urgentOffer.updateMany({
      where: { urgentRequestId: requestId, status: "pending", id: { not: offerId } },
      data: { status: "declined" },
    }),
  ]);

  return { success: true };
}
