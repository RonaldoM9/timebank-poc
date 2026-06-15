"use server";

import {
  createCollectiveMission as libCreate,
  joinCollectiveMission as libJoin,
  leaveCollectiveMission as libLeave,
  cancelCollectiveMission as libCancel,
  validateParticipant as libValidate,
  markParticipantNoShow as libNoShow,
  completeCollectiveMission as libComplete,
} from "@/lib/collective-missions";

export type ActionResult =
  | { success: true; id?: string; error?: never }
  | { success: false; error: string };

export async function createCollectiveMissionAction(
  data: Parameters<typeof libCreate>[0]
): Promise<ActionResult> {
  try {
    const mission = await libCreate(data);
    return { success: true, id: mission.id };
  } catch (e: any) {
    return { success: false, error: e.message ?? "Erreur lors de la création." };
  }
}

export async function joinCollectiveMissionAction(
  missionId: string
): Promise<ActionResult> {
  try {
    await libJoin(missionId);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message ?? "Erreur." };
  }
}

export async function leaveCollectiveMissionAction(
  missionId: string
): Promise<ActionResult> {
  try {
    await libLeave(missionId);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message ?? "Erreur." };
  }
}

export async function cancelCollectiveMissionAction(
  missionId: string
): Promise<ActionResult> {
  try {
    await libCancel(missionId);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message ?? "Erreur." };
  }
}

export async function validateParticipantAction(
  missionId: string,
  participantId: string,
  hoursValidated?: number
): Promise<ActionResult> {
  try {
    await libValidate(missionId, participantId, hoursValidated);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message ?? "Erreur." };
  }
}

export async function markParticipantNoShowAction(
  missionId: string,
  participantId: string
): Promise<ActionResult> {
  try {
    await libNoShow(missionId, participantId);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message ?? "Erreur." };
  }
}

export async function completeCollectiveMissionAction(
  missionId: string
): Promise<ActionResult> {
  try {
    await libComplete(missionId);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message ?? "Erreur." };
  }
}
