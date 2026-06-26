"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createOrganizationProgram,
  createSeniorProgramFromTemplate,
  updateProgramStatus,
  archiveProgram,
  addProgramParticipant,
  removeProgramParticipant,
  pauseProgramParticipant,
  createProgramMissionFromTemplate,
} from "@/lib/programs";
import { getSeniorMissionTemplateByCode } from "@/lib/senior-program-templates";
import { checkOrganizationPermission } from "@/lib/organizations";
import type { ProgramStatus, ProgramParticipantRole, ProgramType } from "@/lib/program-labels";

// ─── Helpers ───────────────────────────────────────────────────────────

async function requireOrgAccess(organizationId: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return { error: "Non connecté" as const };
  return { userId };
}

async function requireOrgPermission(
  userId: string,
  organizationId: string,
  permission: string
): Promise<{ error: string } | null> {
  // Reuse the existing permission system — extend with program-specific perms
  const hasPerm = await checkOrganizationPermission(userId, organizationId, permission as any);
  if (!hasPerm) {
    return { error: "Permission insuffisante" };
  }
  return null;
}

async function verifyProgramBelongsToOrg(programId: string, organizationId: string) {
  const program = await prisma.organizationProgram.findUnique({
    where: { id: programId },
    select: { organizationId: true },
  });
  if (!program || program.organizationId !== organizationId) {
    return { error: "Programme introuvable", program: null as any };
  }
  return { error: null, program };
}

// ─── Schemas ───────────────────────────────────────────────────────────

const CreateProgramSchema = z.object({
  organizationId: z.string().min(1),
  name: z.string().min(3).max(100),
  type: z.string().min(1),
  shortDescription: z.string().max(200).nullable().optional(),
  description: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  targetAudience: z.string().nullable().optional(),
  goalsJson: z.string().nullable().optional(),
  settingsJson: z.string().nullable().optional(),
});

const AddParticipantSchema = z.object({
  programId: z.string().min(1),
  userId: z.string().min(1),
  role: z.enum(["SENIOR", "HERO", "CAREGIVER", "FACILITATOR", "OBSERVER"]),
});

const RemoveParticipantSchema = z.object({
  programId: z.string().min(1),
  userId: z.string().min(1),
});

const CreateMissionFromTemplateSchema = z.object({
  organizationId: z.string().min(1),
  templateCode: z.string().min(1),
  providerId: z.string().min(1),
  programId: z.string().nullable().optional(),
});

// ─── Actions ───────────────────────────────────────────────────────────

export async function createOrganizationProgramAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return { error: "Non connecté" };

  const raw: Record<string, any> = {};
  for (const [key, val] of formData.entries()) {
    raw[key] = val;
  }

  const parsed = CreateProgramSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Données invalides", details: parsed.error.flatten() };
  }

  const input = parsed.data;
  const orgId = input.organizationId;

  // Check permission: OWNER or ADMIN org can create programs
  const perms = await checkOrganizationPermission(userId, orgId, "MANAGE_ORGANIZATION" as any);
  const isFacilitator = await prisma.organizationMember.findFirst({
    where: { organizationId: orgId, userId, role: "FACILITATOR", status: "ACTIVE" },
  });
  if (!perms && !isFacilitator) {
    return { error: "Permission insuffisante pour créer un programme" };
  }

  // Create program
  const program = await createOrganizationProgram(
    orgId,
    {
      name: input.name,
      type: input.type as ProgramType,
      shortDescription: input.shortDescription ?? null,
      description: input.description ?? null,
      startDate: input.startDate ? new Date(input.startDate) : null,
      endDate: input.endDate ? new Date(input.endDate) : null,
      targetAudience: input.targetAudience ?? null,
      goalsJson: input.goalsJson ?? null,
      settingsJson: input.settingsJson ?? null,
    },
    userId
  );

  revalidatePath(`/organizations/${program.organization.slug}/programs`);
  return { success: true, program };
}

export async function createSeniorProgramFromTemplateAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return { error: "Non connecté" };

  const organizationId = formData.get("organizationId") as string;
  if (!organizationId) return { error: "organisation manquante" };

  // Check permission
  const perms = await checkOrganizationPermission(userId, organizationId, "MANAGE_ORGANIZATION" as any);
  const isFacilitator = await prisma.organizationMember.findFirst({
    where: { organizationId, userId, role: "FACILITATOR", status: "ACTIVE" },
  });
  if (!perms && !isFacilitator) {
    return { error: "Permission insuffisante" };
  }

  const program = await createSeniorProgramFromTemplate(organizationId, userId);
  revalidatePath(`/organizations/${organizationId}/programs`);
  return { success: true, program };
}

export async function activateProgramAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return { error: "Non connecté" };

  const programId = formData.get("programId") as string;
  const organizationId = formData.get("organizationId") as string;
  if (!programId || !organizationId) return { error: "Données manquantes" };

  // OWNER or ADMIN can activate
  const perms = await checkOrganizationPermission(userId, organizationId, "MANAGE_ORGANIZATION" as any);
  if (!perms) return { error: "Permission insuffisante" };

  const { error } = await verifyProgramBelongsToOrg(programId, organizationId);
  if (error) return { error };

  await updateProgramStatus(programId, "ACTIVE" as ProgramStatus);
  revalidatePath(`/organizations/${organizationId}/programs/${programId}`);
  return { success: true };
}

export async function archiveProgramAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return { error: "Non connecté" };

  const programId = formData.get("programId") as string;
  const organizationId = formData.get("organizationId") as string;
  if (!programId || !organizationId) return { error: "Données manquantes" };

  const perms = await checkOrganizationPermission(userId, organizationId, "MANAGE_ORGANIZATION" as any);
  if (!perms) return { error: "Permission insuffisante" };

  const { error } = await verifyProgramBelongsToOrg(programId, organizationId);
  if (error) return { error };

  await archiveProgram(programId);
  revalidatePath(`/organizations/${organizationId}/programs`);
  return { success: true };
}

export async function addProgramParticipantAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return { error: "Non connecté" };

  const raw = {
    programId: formData.get("programId") as string,
    userId: formData.get("userId") as string,
    role: formData.get("role") as string,
    organizationId: formData.get("organizationId") as string,
  };

  const parsed = AddParticipantSchema.safeParse(raw);
  if (!parsed.success) return { error: "Données invalides" };

  const { programId, userId: targetUserId, role } = parsed.data;
  const organizationId = raw.organizationId;

  // OWNER, ADMIN, or FACILITATOR can add participants
  const perms = await checkOrganizationPermission(userId, organizationId, "MANAGE_ORGANIZATION" as any);
  const isFacilitator = await prisma.organizationMember.findFirst({
    where: { organizationId, userId, role: "FACILITATOR", status: "ACTIVE" },
  });
  if (!perms && !isFacilitator) {
    return { error: "Permission insuffisante" };
  }

  const { error: verifyError } = await verifyProgramBelongsToOrg(programId, organizationId);
  if (verifyError) return { error: verifyError };

  try {
    const participant = await addProgramParticipant(programId, targetUserId, role as ProgramParticipantRole);
    revalidatePath(`/organizations/${organizationId}/programs/${programId}/participants`);
    return { success: true, participant };
  } catch (err: any) {
    if (err?.code === "P2002") {
      return { error: "Ce participant est déjà dans le programme" };
    }
    return { error: "Erreur lors de l'ajout" };
  }
}

export async function removeProgramParticipantAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return { error: "Non connecté" };

  const programId = formData.get("programId") as string;
  const targetUserId = formData.get("userId") as string;
  const organizationId = formData.get("organizationId") as string;

  const perms = await checkOrganizationPermission(userId, organizationId, "MANAGE_ORGANIZATION" as any);
  const isFacilitator = await prisma.organizationMember.findFirst({
    where: { organizationId, userId, role: "FACILITATOR", status: "ACTIVE" },
  });
  if (!perms && !isFacilitator) return { error: "Permission insuffisante" };

  const { error } = await verifyProgramBelongsToOrg(programId, organizationId);
  if (error) return { error };

  await removeProgramParticipant(programId, targetUserId);
  revalidatePath(`/organizations/${organizationId}/programs/${programId}/participants`);
  return { success: true };
}

export async function pauseProgramParticipantAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return { error: "Non connecté" };

  const programId = formData.get("programId") as string;
  const targetUserId = formData.get("userId") as string;
  const organizationId = formData.get("organizationId") as string;

  const perms = await checkOrganizationPermission(userId, organizationId, "MANAGE_ORGANIZATION" as any);
  const isFacilitator = await prisma.organizationMember.findFirst({
    where: { organizationId, userId, role: "FACILITATOR", status: "ACTIVE" },
  });
  if (!perms && !isFacilitator) return { error: "Permission insuffisante" };

  const { error } = await verifyProgramBelongsToOrg(programId, organizationId);
  if (error) return { error };

  await pauseProgramParticipant(programId, targetUserId);
  revalidatePath(`/organizations/${organizationId}/programs/${programId}/participants`);
  return { success: true };
}

export async function createProgramMissionFromTemplateAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return { error: "Non connecté" };

  const organizationId = formData.get("organizationId") as string;
  const templateCode = formData.get("templateCode") as string;
  const providerId = formData.get("providerId") as string;
  const programId = formData.get("programId") as string | null;

  if (!organizationId || !templateCode || !providerId) {
    return { error: "Données manquantes" };
  }

  // OWNER, ADMIN, or FACILITATOR can create missions
  const perms = await checkOrganizationPermission(userId, organizationId, "MANAGE_ORGANIZATION" as any);
  const isFacilitator = await prisma.organizationMember.findFirst({
    where: { organizationId, userId, role: "FACILITATOR", status: "ACTIVE" },
  });
  if (!perms && !isFacilitator) return { error: "Permission insuffisante" };

  const template = getSeniorMissionTemplateByCode(templateCode);
  if (!template) return { error: "Template introuvable" };

  const mission = await createProgramMissionFromTemplate(
    organizationId,
    programId ?? undefined,
    {
      title: template.name,
      description: template.description,
      category: template.category,
      estimatedDurationHours: template.estimatedDurationHours,
      estimatedTime: template.estimatedTime,
    },
    providerId
  );

  const slug = organizationId; // We'll derive from org
  revalidatePath(`/organizations/${slug}/programs/${programId ?? ""}/missions`);
  return { success: true, mission };
}
