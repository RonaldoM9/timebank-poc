"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getFacilitatorNetworkDashboard,
  generateNetworkAlerts,
  resolveNetworkAlert,
  dismissNetworkAlert,
  addFacilitatorNote,
} from "@/lib/facilitator-network";

export type ActionResult =
  | { success: true; error?: never; data?: any }
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
 * Server Action: get full dashboard data.
 */
export async function getNetworkDashboardAction(): Promise<ActionResult> {
  try {
    await assertFacilitator();
    const dashboard = await getFacilitatorNetworkDashboard();
    return { success: true, data: dashboard };
  } catch (e: any) {
    return { success: false, error: e.message ?? "Erreur lors du chargement du dashboard." };
  }
}

/**
 * Server Action: refresh (regenerate) network alerts — idempotent.
 */
export async function refreshNetworkAlertsAction(): Promise<ActionResult> {
  try {
    await assertFacilitator();
    const created = await generateNetworkAlerts();
    return { success: true, data: { created } };
  } catch (e: any) {
    return { success: false, error: e.message ?? "Erreur lors de la génération des alertes." };
  }
}

/**
 * Server Action: resolve an alert.
 */
export async function resolveAlertAction(
  alertId: string,
  note?: string,
): Promise<ActionResult> {
  let facilitator: { id: string; name: string; role: string };
  try {
    facilitator = await assertFacilitator();
  } catch (e: any) {
    return { success: false, error: e.message ?? "Non autorisé." };
  }

  const result = await resolveNetworkAlert(alertId, facilitator.id, note);
  if (!result.success) {
    return { success: false, error: result.error ?? "Erreur inconnue" };
  }
  return { success: true };
}

/**
 * Server Action: dismiss (ignore) an alert.
 */
export async function dismissAlertAction(
  alertId: string,
  note?: string,
): Promise<ActionResult> {
  let facilitator: { id: string; name: string; role: string };
  try {
    facilitator = await assertFacilitator();
  } catch (e: any) {
    return { success: false, error: e.message ?? "Non autorisé." };
  }

  const result = await dismissNetworkAlert(alertId, facilitator.id, note);
  if (!result.success) {
    return { success: false, error: result.error ?? "Erreur inconnue" };
  }
  return { success: true };
}

/**
 * Server Action: add a facilitator note on any entity.
 */
export async function addFacilitatorNoteAction(
  entityType: string,
  entityId: string,
  content: string,
): Promise<ActionResult> {
  let facilitator: { id: string; name: string; role: string };
  try {
    facilitator = await assertFacilitator();
  } catch (e: any) {
    return { success: false, error: e.message ?? "Non autorisé." };
  }

  const result = await addFacilitatorNote(entityType, entityId, content, facilitator.id);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return { success: true, data: result.note };
}
