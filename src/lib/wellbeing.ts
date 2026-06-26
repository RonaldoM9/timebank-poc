import { prisma } from "./prisma";

// ─── Types ────────────────────────────────────────────────────────────

export type WellbeingScores = {
  isolationScore: number;
  supportScore: number;
  usefulnessScore: number;
  trustScore: number;
  contributionScore: number;
};

export type WellbeingSurveyInput = WellbeingScores & {
  organizationId?: string | null;
  programId?: string | null;
  contextType: string;
  contextId?: string | null;
  phase: "BEFORE" | "AFTER" | "FOLLOW_UP";
  comment?: string | null;
};

export type WellbeingSummary = {
  totalResponses: number;
  averageScore: number;
  beforeAverage: number | null;
  afterAverage: number | null;
  evolution: number | null;
  isolationAvg: number;
  supportAvg: number;
  usefulnessAvg: number;
  trustAvg: number;
  contributionAvg: number;
};

// ─── Create ────────────────────────────────────────────────────────────

export async function createWellbeingSurvey(
  userId: string,
  input: WellbeingSurveyInput
) {
  const scores = [
    input.isolationScore,
    input.supportScore,
    input.usefulnessScore,
    input.trustScore,
    input.contributionScore,
  ];
  const scoreTotal = scores.reduce((a, b) => a + b, 0);
  const scoreAverage = Math.round((scoreTotal / 25) * 100); // 5 questions × 5 max = 25

  return prisma.wellbeingSurvey.create({
    data: {
      organizationId: input.organizationId ?? null,
      programId: input.programId ?? null,
      userId,
      contextType: input.contextType,
      contextId: input.contextId ?? null,
      phase: input.phase,
      status: "COMPLETED",
      isolationScore: input.isolationScore,
      supportScore: input.supportScore,
      usefulnessScore: input.usefulnessScore,
      trustScore: input.trustScore,
      contributionScore: input.contributionScore,
      comment: input.comment ?? null,
      scoreTotal,
      scoreAverage,
    },
  });
}

// ─── Read ──────────────────────────────────────────────────────────────

export async function getWellbeingResultsForOrganization(
  orgId: string
): Promise<WellbeingSummary> {
  const responses = await prisma.wellbeingSurvey.findMany({
    where: { organizationId: orgId },
    select: {
      phase: true,
      scoreAverage: true,
      isolationScore: true,
      supportScore: true,
      usefulnessScore: true,
      trustScore: true,
      contributionScore: true,
    },
  });

  return computeSummary(responses);
}

export async function getWellbeingResultsForProgram(
  programId: string
): Promise<WellbeingSummary> {
  const responses = await prisma.wellbeingSurvey.findMany({
    where: { programId },
    select: {
      phase: true,
      scoreAverage: true,
      isolationScore: true,
      supportScore: true,
      usefulnessScore: true,
      trustScore: true,
      contributionScore: true,
    },
  });

  return computeSummary(responses);
}

export async function getWellbeingComparisonBeforeAfter(
  orgId?: string,
  programId?: string
) {
  const where: any = {};
  if (orgId) where.organizationId = orgId;
  if (programId) where.programId = programId;

  const all = await prisma.wellbeingSurvey.findMany({
    where,
    select: {
      phase: true,
      scoreAverage: true,
      isolationScore: true,
      supportScore: true,
      usefulnessScore: true,
      trustScore: true,
      contributionScore: true,
    },
  });

  const before = all.filter((r) => r.phase === "BEFORE");
  const after = all.filter((r) => r.phase === "AFTER");

  const avg = (arr: typeof before, key: keyof typeof before[0]) => {
    const vals = arr.map((r) => (r as any)[key]).filter((v): v is number => v !== null);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  };

  return {
    beforeCount: before.length,
    afterCount: after.length,
    beforeAverage: avg(before, "scoreAverage"),
    afterAverage: avg(after, "scoreAverage"),
    beforeIsolation: avg(before, "isolationScore"),
    afterIsolation: avg(after, "isolationScore"),
    beforeSupport: avg(before, "supportScore"),
    afterSupport: avg(after, "supportScore"),
    beforeUsefulness: avg(before, "usefulnessScore"),
    afterUsefulness: avg(after, "usefulnessScore"),
    beforeTrust: avg(before, "trustScore"),
    afterTrust: avg(after, "trustScore"),
    beforeContribution: avg(before, "contributionScore"),
    afterContribution: avg(after, "contributionScore"),
  };
}

export async function getAnonymousWellbeingComments(
  orgId?: string,
  programId?: string,
  limit = 5
): Promise<string[]> {
  const where: any = {
    comment: { not: null },
  };
  if (orgId) where.organizationId = orgId;
  if (programId) where.programId = programId;

  const results = await prisma.wellbeingSurvey.findMany({
    where,
    select: { comment: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return results
    .map((r) => r.comment?.trim())
    .filter((c): c is string => !!c && c.length > 0);
}

// ─── Delete ────────────────────────────────────────────────────────────

export async function deleteWellbeingSurvey(id: string) {
  return prisma.wellbeingSurvey.delete({ where: { id } });
}

// ─── Helpers ───────────────────────────────────────────────────────────

function computeSummary(
  responses: {
    phase: string;
    scoreAverage: number | null;
    isolationScore: number | null;
    supportScore: number | null;
    usefulnessScore: number | null;
    trustScore: number | null;
    contributionScore: number | null;
  }[]
): WellbeingSummary {
  const totalResponses = responses.length;

  const avg = (key: keyof (typeof responses)[0]) => {
    const vals = responses.map((r) => (r as any)[key]).filter((v): v is number => v !== null);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };

  const before = responses.filter((r) => r.phase === "BEFORE");
  const after = responses.filter((r) => r.phase === "AFTER");

  const bAvg = before.length > 0
    ? before.reduce((s, r) => s + (r.scoreAverage ?? 0), 0) / before.length
    : null;
  const aAvg = after.length > 0
    ? after.reduce((s, r) => s + (r.scoreAverage ?? 0), 0) / after.length
    : null;

  return {
    totalResponses,
    averageScore: avg("isolationScore") + avg("supportScore") + avg("usefulnessScore") + avg("trustScore") + avg("contributionScore"),
    beforeAverage: bAvg,
    afterAverage: aAvg,
    evolution: bAvg !== null && aAvg !== null ? Math.round((aAvg - bAvg) * 10) / 10 : null,
    isolationAvg: Math.round(avg("isolationScore") * 10) / 10,
    supportAvg: Math.round(avg("supportScore") * 10) / 10,
    usefulnessAvg: Math.round(avg("usefulnessScore") * 10) / 10,
    trustAvg: Math.round(avg("trustScore") * 10) / 10,
    contributionAvg: Math.round(avg("contributionScore") * 10) / 10,
  };
}
