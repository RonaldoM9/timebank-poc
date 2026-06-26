"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createWellbeingSurvey,
  deleteWellbeingSurvey,
} from "@/lib/wellbeing";

// ─── Validation ────────────────────────────────────────────────────────

const SubmitSurveySchema = z.object({
  organizationId: z.string().nullable().optional(),
  programId: z.string().nullable().optional(),
  contextType: z.enum(["ORGANIZATION", "PROGRAM", "MISSION", "SUPPORT_CIRCLE"]),
  contextId: z.string().nullable().optional(),
  phase: z.enum(["BEFORE", "AFTER", "FOLLOW_UP"]),
  isolationScore: z.number().int().min(1).max(5),
  supportScore: z.number().int().min(1).max(5),
  usefulnessScore: z.number().int().min(1).max(5),
  trustScore: z.number().int().min(1).max(5),
  contributionScore: z.number().int().min(1).max(5),
  comment: z.string().max(500).nullable().optional(),
});

const DeleteSurveySchema = z.object({
  surveyId: z.string().min(1),
});

// ─── Actions ────────────────────────────────────────────────────────────

export async function submitWellbeingSurveyAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return { error: "Non connecté" };

  const raw = {
    organizationId: formData.get("organizationId") as string | null,
    programId: formData.get("programId") as string | null,
    contextType: formData.get("contextType") as string,
    contextId: formData.get("contextId") as string | null,
    phase: formData.get("phase") as string,
    isolationScore: Number(formData.get("isolationScore")),
    supportScore: Number(formData.get("supportScore")),
    usefulnessScore: Number(formData.get("usefulnessScore")),
    trustScore: Number(formData.get("trustScore")),
    contributionScore: Number(formData.get("contributionScore")),
    comment: (formData.get("comment") as string) || null,
  };

  const parsed = SubmitSurveySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Données invalides : " + parsed.error.flatten().fieldErrors };
  }

  try {
    const survey = await createWellbeingSurvey(userId, {
      ...parsed.data,
      organizationId: parsed.data.organizationId || null,
      programId: parsed.data.programId || null,
      contextId: parsed.data.contextId || null,
      comment: parsed.data.comment || null,
    });

    revalidatePath(`/organizations/${parsed.data.organizationId ?? ""}/wellbeing`);
    if (parsed.data.programId) {
      revalidatePath(`/programs/${parsed.data.programId}/wellbeing`);
    }

    return { success: true, surveyId: survey.id };
  } catch (err) {
    console.error("submitWellbeingSurveyAction error:", err);
    return { error: "Erreur lors de l'enregistrement" };
  }
}

export async function deleteWellbeingSurveyAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return { error: "Non connecté" };

  const raw = { surveyId: formData.get("surveyId") as string };
  const parsed = DeleteSurveySchema.safeParse(raw);
  if (!parsed.success) return { error: "ID invalide" };

  // Check permissions: only ADMIN global or OWNER org can delete
  const user = await prisma?.user?.findUnique({ where: { id: userId } });
  // Simple permission: only the author or global admin can delete
  const survey = await prisma?.wellbeingSurvey?.findUnique({
    where: { id: parsed.data.surveyId },
  });
  if (!survey) return { error: "Questionnaire introuvable" };
  if (survey.userId !== userId && (user as any)?.role !== "ADMIN") {
    return { error: "Permission refusée" };
  }

  try {
    await deleteWellbeingSurvey(parsed.data.surveyId);
    revalidatePath(`/organizations/${survey.organizationId ?? ""}/wellbeing`);
    return { success: true };
  } catch (err) {
    console.error("deleteWellbeingSurveyAction error:", err);
    return { error: "Erreur lors de la suppression" };
  }
}

export async function getWellbeingResultsAction(orgId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Non connecté" };
  const userId = (session.user as any).id;

  const { getWellbeingResultsForOrganization } = await import("@/lib/wellbeing");
  const { checkOrganizationPermission } = await import("@/lib/organizations");

  const hasAccess = await checkOrganizationPermission(
    userId,
    orgId,
    "VIEW_PRIVATE_DASHBOARD"
  );
  if (!hasAccess) return { error: "Accès refusé" };

  const summary = await getWellbeingResultsForOrganization(orgId);
  return { success: true, summary };
}
