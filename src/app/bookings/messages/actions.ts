"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ─── Zod schemas ───────────────────────────────────────────────────────────

const createBookingMessageSchema = z.object({
  bookingId: z.string().min(1),
  content: z.string().min(1).max(1000),
});

const reportMessageSchema = z.object({
  messageId: z.string().min(1),
  reason: z.enum([
    "HARASSMENT",
    "PERSONAL_CONTACT",
    "SPAM",
    "INAPPROPRIATE",
    "OTHER",
  ]),
  comment: z.string().max(500).optional(),
});

// ─── PII Detection ─────────────────────────────────────────────────────────

const PHONE_REGEX = /(?:(?:\+|00)33[\s.-]?|0)[1-9](?:[\s.-]?\d{2}){4}/;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const WHATSAPP_REGEX = /wa\.me\/|whatsapp\.com|WhatsApp/;

function detectPII(content: string): { flagged: boolean; types: string[] } {
  const types: string[] = [];
  if (PHONE_REGEX.test(content)) types.push("TÉLÉPHONE");
  if (EMAIL_REGEX.test(content)) types.push("EMAIL");
  if (WHATSAPP_REGEX.test(content)) types.push("WHATSAPP");
  return { flagged: types.length > 0, types };
}

// ─── Permission check helper ───────────────────────────────────────────────

async function assertParticipant(
  userId: string,
  bookingId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: { select: { providerId: true } },
    },
  });

  if (!booking) return { ok: false, error: "Réservation introuvable" };

  const isClient = booking.clientId === userId;
  const isProvider = booking.service.providerId === userId;

  if (!isClient && !isProvider) {
    return { ok: false, error: "Vous n'êtes pas participant de cette réservation" };
  }

  return { ok: true };
}

// ─── Actions ───────────────────────────────────────────────────────────────

export type BookingMessageItem = {
  id: string;
  bookingId: string;
  authorId: string | null;
  content: string;
  type: string;
  isFlagged: boolean;
  isHidden: boolean;
  createdAt: string;
  author?: { id: string; name: string } | null;
};

export async function getBookingMessages(
  bookingId: string
): Promise<BookingMessageItem[] | { error: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Vous devez être connecté" };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { error: "Utilisateur introuvable" };

  // Permission check
  const perm = await assertParticipant(user.id, bookingId);
  if (!perm.ok) return { error: perm.error };

  const messages = await prisma.bookingMessage.findMany({
    where: { bookingId, isHidden: false },
    orderBy: { createdAt: "asc" },
    include: {
      booking: false, // avoid circular
    },
  });

  // Fetch author names separately for USER messages
  const authorIds = [
    ...new Set(messages.filter((m) => m.authorId).map((m) => m.authorId!)),
  ];
  const authors = authorIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: authorIds } },
        select: { id: true, name: true },
      })
    : [];
  const authorMap = new Map(authors.map((a) => [a.id, a]));

  return messages.map((m) => ({
    id: m.id,
    bookingId: m.bookingId,
    authorId: m.authorId,
    content: m.content,
    type: m.type,
    isFlagged: m.isFlagged,
    isHidden: m.isHidden,
    createdAt: m.createdAt.toISOString(),
    author: m.authorId ? (authorMap.get(m.authorId) ?? null) : null,
  }));
}

export async function createBookingMessage(
  bookingId: string,
  content: string
): Promise<
  { success: true; message: BookingMessageItem; warning?: string } | { error: string }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Vous devez être connecté" };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true },
  });
  if (!user) return { error: "Utilisateur introuvable" };

  // Validation
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return { error: "Le message ne peut pas être vide." };
  }
  if (trimmed.length > 1000) {
    return { error: "Ton message est trop long. Limite : 1000 caractères." };
  }

  const parsed = createBookingMessageSchema.safeParse({ bookingId, content: trimmed });
  if (!parsed.success) {
    return { error: "Message invalide." };
  }
  const safeContent = parsed.data.content;

  // Permission check
  const perm = await assertParticipant(user.id, bookingId);
  if (!perm.ok) return { error: perm.error };

  // PII detection
  const { flagged, types } = detectPII(safeContent);

  const message = await prisma.bookingMessage.create({
    data: {
      bookingId,
      authorId: user.id,
      content: safeContent,
      type: "USER",
      isFlagged: flagged,
    },
  });

  // Update lastMessageAt on booking
  await prisma.booking.update({
    where: { id: bookingId },
    data: { lastMessageAt: new Date() },
  });

  let warning: string | undefined;
  if (flagged) {
    warning = `Coordonnées personnelles détectées (${types.join(", ")}). Pour votre sécurité, gardez les échanges dans TimeHeroes.`;
  }

  return {
    success: true,
    message: {
      id: message.id,
      bookingId: message.bookingId,
      authorId: message.authorId,
      content: message.content,
      type: message.type,
      isFlagged: message.isFlagged,
      isHidden: message.isHidden,
      createdAt: message.createdAt.toISOString(),
      author: { id: user.id, name: user.name ?? "Utilisateur" },
    },
    warning,
  };
}

export async function createSystemBookingMessage(
  bookingId: string,
  content: string
): Promise<{ success: true } | { error: string }> {
  // No auth needed — called server-side from other actions
  try {
    await prisma.bookingMessage.create({
      data: {
        bookingId,
        authorId: null,
        content,
        type: "SYSTEM",
      },
    });

    // Update lastMessageAt
    await prisma.booking.update({
      where: { id: bookingId },
      data: { lastMessageAt: new Date() },
    });

    return { success: true };
  } catch (e) {
    return { error: "Erreur lors de la création du message système" };
  }
}

export async function reportBookingMessage(
  messageId: string,
  reason: string,
  comment?: string
): Promise<{ success: true } | { error: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Vous devez être connecté" };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { error: "Utilisateur introuvable" };

  // Validation
  const parsed = reportMessageSchema.safeParse({ messageId, reason, comment });
  if (!parsed.success) {
    return { error: "Données de signalement invalides" };
  }

  // Find the message to check permissions
  const message = await prisma.bookingMessage.findUnique({
    where: { id: messageId },
    select: { bookingId: true, authorId: true },
  });
  if (!message) return { error: "Message introuvable" };
  if (message.authorId === user.id) {
    return { error: "Vous ne pouvez pas signaler votre propre message" };
  }

  // Check user is participant
  const perm = await assertParticipant(user.id, message.bookingId);
  if (!perm.ok) return { error: perm.error };

  // Check not already reported by this user
  const existing = await prisma.messageReport.findFirst({
    where: {
      messageId,
      reporterId: user.id,
    },
  });
  if (existing) {
    return { error: "Vous avez déjà signalé ce message" };
  }

  await prisma.messageReport.create({
    data: {
      messageId,
      reporterId: user.id,
      reason: parsed.data.reason,
      comment: parsed.data.comment ?? null,
      status: "OPEN",
    },
  });

  return { success: true };
}

export async function markBookingMessagesAsRead(
  bookingId: string
): Promise<{ success: true } | { error: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Vous devez être connecté" };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { error: "Utilisateur introuvable" };

  const perm = await assertParticipant(user.id, bookingId);
  if (!perm.ok) return { error: perm.error };

  // Mark all unread messages sent by the other participant as read
  await prisma.bookingMessage.updateMany({
    where: {
      bookingId,
      authorId: { not: user.id },
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  return { success: true };
}

// ─── Helper for checkMessagePII (used from client) ─────────────────────────

export async function checkMessagePII(
  content: string
): Promise<{ flagged: boolean; types: string[] }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { flagged: false, types: [] };
  return detectPII(content);
}
