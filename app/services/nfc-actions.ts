"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { releaseEscrow } from "@/lib/ledger";
import crypto from "crypto";

const TTL_MINUTES = parseInt(process.env.QR_TOKEN_TTL_MINUTES || "30", 10);

/**
 * Génère un token NFC pour un booking pending (provider only).
 * Stocke le hash + expiration + method = nfc sur le booking.
 */
export async function generateNFCToken(
  bookingId: string
): Promise<
  { success: true; token: string; expiresAt: string; nfcUrl: string }
  | { error: string }
> {
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
      proofOfCompletion: { select: { id: true } },
    },
  });

  if (!booking) return { error: "Réservation introuvable" };
  if (booking.service.providerId !== user.id)
    return { error: "Seul le provider peut générer un lien NFC" };
  if (booking.status !== "pending")
    return { error: "Seules les réservations en attente peuvent être validées" };
  if (booking.proofOfCompletion)
    return { error: "Cette mission a déjà été validée" };

  // Générer un token sécurisé
  const rawToken = crypto.randomUUID();
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + TTL_MINUTES * 60 * 1000);

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      completionTokenHash: tokenHash,
      completionTokenExpiresAt: expiresAt,
      completionTokenMethod: "nfc",
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://204.168.193.43:3000";
  const nfcUrl = `${baseUrl}/complete/nfc/${rawToken}`;

  return {
    success: true,
    token: rawToken,
    expiresAt: expiresAt.toISOString(),
    nfcUrl,
  };
}

/**
 * Valide un token NFC et complète le booking (client only).
 * Vérifie toutes les règles métier puis réutilise la logique existante.
 */
export async function validateNFCProof(
  token: string
): Promise<{ success: true } | { error: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Vous devez être connecté" };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { error: "Utilisateur introuvable" };

  // Hash du token pour lookup
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  // Trouver le booking par tokenHash + method = nfc
  const booking = await prisma.booking.findFirst({
    where: {
      completionTokenHash: tokenHash,
      completionTokenMethod: "nfc",
    },
    include: {
      service: { select: { providerId: true } },
      proofOfCompletion: { select: { id: true } },
    },
  });

  if (!booking) return { error: "Lien NFC invalide ou inexistant" };

  // Vérifications métier
  if (booking.status === "cancelled")
    return { error: "Cette mission a été annulée" };
  if (booking.status === "completed")
    return { error: "Mission déjà validée" };
  if (booking.status !== "pending")
    return { error: "Cette mission ne peut plus être validée" };
  if (booking.proofOfCompletion)
    return { error: "Mission déjà validée" };
  if (booking.clientId !== user.id)
    return { error: "Vous n'êtes pas autorisé à valider cette mission" };
  if (booking.service.providerId === user.id)
    return { error: "Le provider ne peut pas valider son propre NFC" };

  // Vérifier expiration
  if (
    booking.completionTokenExpiresAt &&
    new Date() > booking.completionTokenExpiresAt
  ) {
    return { error: "Lien NFC expiré" };
  }

  // Créer la ProofOfCompletion en transaction
  await prisma.$transaction(async (tx) => {
    // 1. Créer la preuve
    await tx.proofOfCompletion.create({
      data: {
        bookingId: booking.id,
        method: "nfc",
        validatorId: user.id,
        providerId: booking.service.providerId,
        tokenHash: booking.completionTokenHash!,
        status: "validated",
      },
    });

    // 2. Compléter le booking
    await tx.booking.update({
      where: { id: booking.id },
      data: {
        status: "completed",
        completedAt: new Date(),
        completionTokenHash: null, // invalider le token
        completionTokenExpiresAt: null,
        completionTokenMethod: null,
      },
    });
  });

  // 3. Release escrow via la fonction existante
  const releaseResult = await releaseEscrow({
    providerId: booking.service.providerId,
    bookingId: booking.id,
    amount: booking.totalTime,
  });

  if ("error" in releaseResult) {
    return { error: releaseResult.error };
  }

  return { success: true };
}

/**
 * Vérifie si un token NFC est toujours valide pour affichage sur la page.
 */
export async function checkNFCTokenStatus(
  token: string
): Promise<
  | { valid: true; booking: { id: string; serviceTitle: string; providerName: string; clientName: string; hours: number; totalTime: number; status: string } }
  | { valid: false; error: string }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { valid: false, error: "Vous devez être connecté" };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { valid: false, error: "Utilisateur introuvable" };

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const booking = await prisma.booking.findFirst({
    where: {
      completionTokenHash: tokenHash,
      completionTokenMethod: "nfc",
    },
    include: {
      service: {
        select: { title: true, provider: { select: { name: true } } },
      },
      client: { select: { name: true } },
      proofOfCompletion: { select: { id: true } },
    },
  });

  if (!booking) return { valid: false, error: "Lien NFC invalide" };
  if (booking.clientId !== user.id)
    return { valid: false, error: "Vous n'êtes pas le client de cette mission" };
  if (booking.status !== "pending")
    return { valid: false, error: "Cette mission ne peut plus être validée" };
  if (booking.proofOfCompletion)
    return { valid: false, error: "Mission déjà validée" };
  if (
    booking.completionTokenExpiresAt &&
    new Date() > booking.completionTokenExpiresAt
  ) {
    return { valid: false, error: "Lien NFC expiré" };
  }

  return {
    valid: true,
    booking: {
      id: booking.id,
      serviceTitle: booking.service.title,
      providerName: booking.service.provider.name,
      clientName: booking.client.name,
      hours: booking.hours,
      totalTime: booking.totalTime,
      status: booking.status,
    },
  };
}
