"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import {
  requireOrganizationPermission,
} from "@/lib/organizations";
import {
  createImpactReport,
  getImpactReportById,
  archiveImpactReport,
  exportImpactReportToCsv,
} from "@/lib/impact-reports";
import { IMPACT_REPORT_TYPES } from "@/lib/impact-report-labels";

// ─── Helper ──────────────────────────────────────────────────────────

function getUserId(session: any): string | null {
  return (session?.user as any)?.id || null;
}

// ─── Validation schemas ──────────────────────────────────────────────

const generateReportSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre est obligatoire.")
    .max(120, "Le titre ne doit pas dépasser 120 caractères.")
    .trim(),
  type: z
    .string()
    .refine((val) => Object.keys(IMPACT_REPORT_TYPES).includes(val), {
      message: "Type de rapport invalide.",
    }),
  periodStart: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Date de début invalide.",
  }),
  periodEnd: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Date de fin invalide.",
  }),
  socialValueHourlyRate: z.coerce
    .number()
    .int("Le taux horaire doit être un nombre entier.")
    .min(0, "Le taux horaire ne peut pas être négatif.")
    .max(100, "Le taux horaire ne peut pas dépasser 100 €."),
  visibility: z
    .string()
    .refine((val) =>
      ["PRIVATE", "ORGANIZATION", "SHARE_LINK", "PUBLIC"].includes(val)
    ),
  includeRecommendations: z.coerce.boolean(),
  includeRisks: z.coerce.boolean(),
  includeTopMissions: z.coerce.boolean(),
});

const reportIdSchema = z.string().cuid("ID de rapport invalide.");

const updateVisibilitySchema = z.object({
  visibility: z
    .string()
    .refine((val) =>
      ["PRIVATE", "ORGANIZATION", "SHARE_LINK", "PUBLIC"].includes(val)
    ),
});

const organizationIdSchema = z.string().cuid("ID d'organisation invalide.");

// ─── Action 1: Generate report ──────────────────────────────────────

export async function generateImpactReportAction(
  organizationId: string,
  formData: FormData
) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return { error: "Non connecté." };

  // Validate org ID
  const orgResult = organizationIdSchema.safeParse(organizationId);
  if (!orgResult.success) return { error: "ID d'organisation invalide." };

  // Permission: OWNER, ADMIN, FACILITATOR can generate
  const perm = await requireOrganizationPermission(
    userId,
    organizationId,
    "VIEW_PRIVATE_DASHBOARD"
  );
  if (!perm.allowed) return { error: perm.error };

  // Parse and validate form data
  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    raw[key] = value;
  }

  const parsed = generateReportSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const {
    title,
    type,
    periodStart,
    periodEnd,
    socialValueHourlyRate,
    visibility,
    includeRecommendations,
    includeRisks,
  } = parsed.data;

  // Business validation
  const start = new Date(periodStart);
  const end = new Date(periodEnd);

  if (start >= end) {
    return { error: "La date de début doit être antérieure à la date de fin." };
  }

  // Max 12 months
  const monthsDiff =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  if (monthsDiff > 12) {
    return {
      error: "La période ne peut pas dépasser 12 mois.",
    };
  }

  try {
    const report = await createImpactReport(
      organizationId,
      {
        title,
        type: type as any,
        periodStart: start,
        periodEnd: end,
        socialValueHourlyRate,
        visibility: visibility as any,
        includeRecommendations,
        includeRisks,
        includeTopMissions: false,
      },
      userId
    );

    revalidatePath(`/organizations/${organizationId}/reports`);
    return { success: true, reportId: report.id };
  } catch (error: any) {
    return {
      error: error.message || "Erreur lors de la génération du rapport.",
    };
  }
}

// ─── Action 2: Archive report ───────────────────────────────────────

export async function archiveImpactReportAction(reportId: string): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return { success: false, error: "Non connecté." };

  const idResult = reportIdSchema.safeParse(reportId);
  if (!idResult.success) return { success: false, error: "ID de rapport invalide." };

  // Get the report to check permissions
  const report = await prisma.impactReport.findUnique({
    where: { id: reportId },
    include: { organization: { select: { slug: true } } },
  });
  if (!report) return { success: false, error: "Rapport introuvable." };

  // Permission: OWNER, ADMIN can archive. FACILITATOR cannot.
  const perm = await requireOrganizationPermission(
    userId,
    report.organizationId,
    "MANAGE_ORGANIZATION"
  );
  if (!perm.allowed) return { success: false, error: perm.error };

  const result = await archiveImpactReport(reportId, userId);
  if (result.success) {
    revalidatePath(`/organizations/${report.organization.slug}/reports`);
  }
  return result;
}

// ─── Action 3: Update visibility ────────────────────────────────────

export async function updateImpactReportVisibilityAction(
  reportId: string,
  visibility: string
) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return { error: "Non connecté." };

  const idResult = reportIdSchema.safeParse(reportId);
  if (!idResult.success) return { error: "ID de rapport invalide." };

  const visResult = updateVisibilitySchema.safeParse({ visibility });
  if (!visResult.success) return { error: "Visibilité invalide." };

  const report = await prisma.impactReport.findUnique({
    where: { id: reportId },
    include: { organization: { select: { slug: true } } },
  });
  if (!report) return { error: "Rapport introuvable." };

  // Permission: OWNER, ADMIN
  const perm = await requireOrganizationPermission(
    userId,
    report.organizationId,
    "MANAGE_ORGANIZATION"
  );
  if (!perm.allowed) return { error: perm.error };

  await prisma.impactReport.update({
    where: { id: reportId },
    data: {
      visibility: visResult.data.visibility,
      publicTokenHash:
        visResult.data.visibility === "SHARE_LINK" || visResult.data.visibility === "PUBLIC"
          ? cryptoRandomString()
          : null,
      publicEnabledAt:
        visResult.data.visibility === "PUBLIC" ? new Date() : null,
    },
  });

  revalidatePath(`/organizations/${report.organization.slug}/reports`);
  return { success: true };
}

// ─── Action 4: Export CSV ────────────────────────────────────────────

export async function exportImpactReportCsvAction(reportId: string) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return { error: "Non connecté." };

  const idResult = reportIdSchema.safeParse(reportId);
  if (!idResult.success) return { error: "ID de rapport invalide." };

  const report = await prisma.impactReport.findUnique({
    where: { id: reportId },
    select: { id: true, organizationId: true },
  });
  if (!report) return { error: "Rapport introuvable." };

  // Permission: VIEW_PRIVATE_DASHBOARD
  const perm = await requireOrganizationPermission(
    userId,
    report.organizationId,
    "VIEW_PRIVATE_DASHBOARD"
  );
  if (!perm.allowed) return { error: perm.error };

  const csv = await exportImpactReportToCsv(reportId);
  if (!csv) return { error: "Impossible de générer le CSV." };

  return { success: true, csv };
}

// ─── Helper: crypto random string ────────────────────────────────────

function cryptoRandomString(): string {
  return crypto.randomUUID();
}
