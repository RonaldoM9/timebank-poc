"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  generateMatchRecommendations,
  approveMatchRecommendation,
  rejectMatchRecommendation,
  addMatchFeedback,
  getRecommendationsForTarget,
} from "@/lib/matchmaking";
import type { MatchTargetType } from "@/lib/matchmaking";

export type ActionResult =
  | { success: true; data?: any }
  | { success: false; error: string };

/**
 * Assert the current user is a FACILITATOR or ADMIN.
 */
async function assertFacilitator(): Promise<{ id: string; name: string; role: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Vous devez être connecté.");
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, role: true },
  });
  if (!user || (user.role !== "FACILITATOR" && user.role !== "ADMIN")) {
    throw new Error("Accès non autorisé. Seul un facilitateur peut effectuer cette action.");
  }
  return user;
}

/**
 * Générer des recommandations de match pour une cible donnée.
 */
export async function generateRecommendationsAction(
  targetType: MatchTargetType,
  targetId: string
): Promise<ActionResult> {
  let facilitator;
  try {
    facilitator = await assertFacilitator();
  } catch (e: any) {
    return { success: false, error: e.message ?? "Non autorisé." };
  }

  try {
    const result = await generateMatchRecommendations(targetType, targetId, facilitator.id);
    return {
      success: true,
      data: {
        recommendations: result.recommendations,
        totalCandidates: result.totalCandidates,
        excludedCount: result.excludedCount,
      },
    };
  } catch (e: any) {
    return { success: false, error: e.message ?? "Erreur lors de la génération des recommandations." };
  }
}

/**
 * Approuver une recommandation.
 */
export async function approveRecommendationAction(
  recommendationId: string,
  note?: string
): Promise<ActionResult> {
  let facilitator;
  try {
    facilitator = await assertFacilitator();
  } catch (e: any) {
    return { success: false, error: e.message ?? "Non autorisé." };
  }

  try {
    await approveMatchRecommendation(recommendationId, facilitator.id, note);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message ?? "Erreur lors de l'approbation." };
  }
}

/**
 * Rejeter une recommandation.
 */
export async function rejectRecommendationAction(
  recommendationId: string,
  note?: string
): Promise<ActionResult> {
  let facilitator;
  try {
    facilitator = await assertFacilitator();
  } catch (e: any) {
    return { success: false, error: e.message ?? "Non autorisé." };
  }

  try {
    await rejectMatchRecommendation(recommendationId, facilitator.id, note);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message ?? "Erreur lors du rejet." };
  }
}

/**
 * Ajouter un feedback sur une recommandation.
 */
export async function addMatchFeedbackAction(
  recommendationId: string,
  decision: string,
  comment?: string
): Promise<ActionResult> {
  let facilitator;
  try {
    facilitator = await assertFacilitator();
  } catch (e: any) {
    return { success: false, error: e.message ?? "Non autorisé." };
  }

  try {
    await addMatchFeedback(recommendationId, facilitator.id, decision, comment);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message ?? "Erreur lors de l'enregistrement du feedback." };
  }
}

/**
 * Récupérer les recommandations pour une cible.
 */
export async function getRecommendationsAction(
  targetType: string,
  targetId: string
): Promise<ActionResult> {
  try {
    await assertFacilitator();
    const recommendations = await getRecommendationsForTarget(targetType, targetId);
    return { success: true, data: recommendations };
  } catch (e: any) {
    return { success: false, error: e.message ?? "Erreur lors du chargement." };
  }
}

/**
 * Récupérer les demandes urgentes ouvertes.
 */
export async function getOpenUrgentRequestsAction(): Promise<ActionResult> {
  try {
    await assertFacilitator();
    const requests = await prisma.urgentRequest.findMany({
      where: { status: "open" },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        city: true,
        department: true,
        region: true,
        online: true,
        urgency: true,
        hours: true,
        createdAt: true,
        requester: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: requests };
  } catch (e: any) {
    return { success: false, error: e.message ?? "Erreur lors du chargement." };
  }
}

/**
 * Récupérer les missions solidaires ouvertes.
 */
export async function getOpenSolidarityMissionsAction(): Promise<ActionResult> {
  try {
    await assertFacilitator();
    const missions = await prisma.service.findMany({
      where: { isSolidarityMission: true, status: "active" },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        provider: { select: { id: true, name: true, city: true } },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: missions };
  } catch (e: any) {
    return { success: false, error: e.message ?? "Erreur lors du chargement." };
  }
}

/**
 * Récupérer les missions collectives qui ont des places libres.
 */
export async function getOpenCollectiveMissionsAction(): Promise<ActionResult> {
  try {
    await assertFacilitator();
    const missions = await prisma.collectiveMission.findMany({
      where: { status: "OPEN" },
      include: {
        organizer: { select: { id: true, name: true } },
        _count: { select: { participants: true } },
      },
      orderBy: { startsAt: "asc" },
    });
    return { success: true, data: missions };
  } catch (e: any) {
    return { success: false, error: e.message ?? "Erreur lors du chargement." };
  }
}
