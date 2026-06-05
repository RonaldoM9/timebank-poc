"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type FacilitatorActionResult =
  | { success: true; error?: never }
  | { success: false; error: string };

/**
 * Assert the current user is a FACILITATOR or ADMIN.
 */
async function assertFacilitator() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Vous devez être connecté.");
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true, name: true },
  });
  if (!user || (user.role !== "FACILITATOR" && user.role !== "ADMIN")) {
    throw new Error("Accès non autorisé. Seul un facilitateur peut effectuer cette action.");
  }
  return user;
}

/**
 * Server Action: user submits a request for community pot funding.
 */
export async function createCommunityPotRequest(
  amount: number,
  reason: string,
  message?: string,
  bookingId?: string
): Promise<FacilitatorActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, error: "Vous devez être connecté." };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { success: false, error: "Utilisateur introuvable." };

  if (!amount || amount <= 0) {
    return { success: false, error: "Le montant doit être supérieur à 0." };
  }

  const pot = await prisma.communityPot.findFirst({ orderBy: { createdAt: "asc" } });
  if (!pot) return { success: false, error: "Pot commun introuvable." };

  try {
    await prisma.communityPotRequest.create({
      data: {
        potId: pot.id,
        userId: user.id,
        bookingId: bookingId ?? null,
        amount,
        reason: reason || null,
        message: message ?? null,
        status: "PENDING",
      },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Une erreur est survenue lors de la création de la demande." };
  }
}

/**
 * Server Action: facilitator approves a pending request.
 */
export async function approveCommunityPotRequest(
  requestId: string,
  decisionNote?: string
): Promise<FacilitatorActionResult> {
  let facilitator: Awaited<ReturnType<typeof assertFacilitator>>;
  try {
    facilitator = await assertFacilitator();
  } catch (e: any) {
    return { success: false, error: e.message ?? "Non autorisé." };
  }

  const request = await prisma.communityPotRequest.findUnique({
    where: { id: requestId },
  });
  if (!request) return { success: false, error: "Demande introuvable." };
  if (request.status !== "PENDING") {
    return { success: false, error: "Cette demande a déjà été traitée." };
  }

  const pot = await prisma.communityPot.findFirst({ orderBy: { createdAt: "asc" } });
  if (!pot) return { success: false, error: "Pot commun introuvable." };
  if (pot.balance < request.amount) {
    return {
      success: false,
      error: `Solde du pot insuffisant. Le pot a ${pot.balance} TIME, la demande est de ${request.amount} TIME.`,
    };
  }

  try {
    await prisma.$transaction([
      // Decrement pot
      prisma.communityPot.update({
        where: { id: pot.id },
        data: { balance: { decrement: request.amount } },
      }),
      // Mark request as APPROVED
      prisma.communityPotRequest.update({
        where: { id: requestId },
        data: {
          status: "APPROVED",
          decidedById: facilitator.id,
          decidedAt: new Date(),
          decisionNote: decisionNote ?? null,
        },
      }),
      // Create FUNDING transaction
      prisma.communityPotTransaction.create({
        data: {
          potId: pot.id,
          userId: facilitator.id,
          bookingId: request.bookingId,
          amount: request.amount,
          type: "FUNDING",
          reason: request.reason ?? "Demande approuvée",
        },
      }),
      // If linked to a booking, mark it
      ...(request.bookingId
        ? [
            prisma.booking.update({
              where: { id: request.bookingId },
              data: {
                fundedByCommunityPot: true,
                communityPotAmount: request.amount,
              },
            }),
          ]
        : []),
    ]);
    return { success: true };
  } catch {
    return { success: false, error: "Une erreur est survenue lors de l'approbation." };
  }
}

/**
 * Server Action: facilitator rejects a pending request.
 */
export async function rejectCommunityPotRequest(
  requestId: string,
  decisionNote?: string
): Promise<FacilitatorActionResult> {
  let facilitator: Awaited<ReturnType<typeof assertFacilitator>>;
  try {
    facilitator = await assertFacilitator();
  } catch (e: any) {
    return { success: false, error: e.message ?? "Non autorisé." };
  }

  const request = await prisma.communityPotRequest.findUnique({
    where: { id: requestId },
  });
  if (!request) return { success: false, error: "Demande introuvable." };
  if (request.status !== "PENDING") {
    return { success: false, error: "Cette demande a déjà été traitée." };
  }

  try {
    await prisma.communityPotRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        decidedById: facilitator.id,
        decidedAt: new Date(),
        decisionNote: decisionNote ?? null,
      },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Une erreur est survenue lors du refus." };
  }
}
