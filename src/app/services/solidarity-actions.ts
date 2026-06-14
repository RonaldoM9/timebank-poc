"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type SolidarityActionResult =
  | { success: true; error?: never }
  | { success: false; error: string };

/**
 * Assert the current user is FACILITATOR or ADMIN.
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
 * Server Action: Facilitator VERIFIES a solidarity mission.
 * Accessible uniquement FACILITATOR ou ADMIN.
 * Passe solidarityStatus à VERIFIED.
 */
export async function verifySolidarityMission(
  serviceId: string
): Promise<SolidarityActionResult> {
  let facilitator: Awaited<ReturnType<typeof assertFacilitator>>;
  try {
    facilitator = await assertFacilitator();
  } catch (e: any) {
    return { success: false, error: e.message ?? "Non autorisé." };
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { id: true, solidarityStatus: true, title: true },
  });
  if (!service) return { success: false, error: "Mission introuvable." };
  if (service.solidarityStatus !== "SELF_DECLARED") {
    return { success: false, error: "Seules les missions SELF_DECLARED peuvent être vérifiées." };
  }

  try {
    await prisma.service.update({
      where: { id: serviceId },
      data: { solidarityStatus: "VERIFIED" },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Erreur lors de la vérification de la mission." };
  }
}

/**
 * Server Action: Facilitator REJECTS a solidarity mission.
 * Accessible uniquement FACILITATOR ou ADMIN.
 * Passe solidarityStatus à REJECTED, ne débite rien.
 */
export async function rejectSolidarityMission(
  serviceId: string,
  note?: string
): Promise<SolidarityActionResult> {
  let facilitator: Awaited<ReturnType<typeof assertFacilitator>>;
  try {
    facilitator = await assertFacilitator();
  } catch (e: any) {
    return { success: false, error: e.message ?? "Non autorisé." };
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { id: true, solidarityStatus: true, title: true },
  });
  if (!service) return { success: false, error: "Mission introuvable." };
  if (service.solidarityStatus !== "SELF_DECLARED") {
    return { success: false, error: "Seules les missions SELF_DECLARED peuvent être refusées." };
  }

  try {
    await prisma.service.update({
      where: { id: serviceId },
      data: { solidarityStatus: "REJECTED" },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Erreur lors du refus de la mission." };
  }
}
