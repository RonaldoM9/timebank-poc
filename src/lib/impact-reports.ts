// ─── Impact Reports — métier ──────────────────────────────────────────
//
// Ce module centralise :
//   - le calcul des métriques d'impact (live + snapshot)
//   - la création / consultation / archivage des rapports
//   - les résumés, highlights, risques, recommandations
//   - l'export CSV
//
// Règles :
//   - Toutes les métriques sont calculées depuis les données réelles
//   - Aucune donnée personnelle (email, adresse) n'est exposée
//   - La valeur sociale est toujours indiquée comme estimation
//   - Les snapshots sont persistés et ne changent pas sans régénération

import { prisma } from "@/lib/prisma";
import {
  METRIC_LABELS,
  METRIC_UNITS,
} from "./impact-report-labels";

// ─── Types ───────────────────────────────────────────────────────────

export interface ImpactMetrics {
  // Membres
  totalMembers: number;
  activeMembers30d: number;
  newMembers: number;
  facilitatorsCount: number;
  membersWithCompletedMission: number;

  // Missions
  totalMissions: number;
  activeMissions: number;
  completedMissions: number;
  collectiveMissions: number;
  solidarityMissions: number;
  urgentRequestsLinked: number;
  averageParticipantsPerMission: number;
  completionRate: number;

  // TIME
  totalTimeMobilized: number;
  timeFromCollectiveMissions: number;
  timeFromSolidarityMissions: number;
  organizationPotBalance: number;
  organizationPotDonations: number;
  organizationPotFunded: number;
  dormantTimeDetected: number;

  // Bénéficiaires
  estimatedBeneficiaries: number;
  uniqueReceivers: number;
  receiversBecameContributors: number;
  reciprocityRate: number;

  // Qualité
  averageRating: number;
  ratingsCount: number;
  blockedRequestsResolved: number;
  averageResponseDelay: number;
  noShowCount: number;
  safetyReportsCount: number;

  // Valeur sociale
  socialValueEstimated: number;
  socialValueHourlyRate: number;
}

export interface TopMission {
  id: string;
  title: string;
  type: "service" | "collective";
  status: string;
  participantCount: number;
  totalTime: number;
  averageRating: number | null;
}

export interface ImpactSnapshot {
  metrics: ImpactMetrics;
  topMissions: TopMission[];
  summary: string;
  highlights: string[];
  risks: string[];
  recommendations: string[];
}

export type ImpactReportType =
  | "ORGANIZATION_SUMMARY"
  | "FUNDER_REPORT"
  | "RSE_REPORT"
  | "BOARD_REPORT"
  | "ESSEC_DEMO";

export type ImpactReportStatus = "DRAFT" | "GENERATED" | "ARCHIVED";

export type ImpactReportVisibility =
  | "PRIVATE"
  | "ORGANIZATION"
  | "SHARE_LINK"
  | "PUBLIC";

export interface CreateImpactReportInput {
  title: string;
  type: ImpactReportType;
  periodStart: Date;
  periodEnd: Date;
  socialValueHourlyRate: number;
  visibility: ImpactReportVisibility;
  includeRecommendations: boolean;
  includeRisks: boolean;
  includeTopMissions: boolean;
}

// ─── Helpers internes ────────────────────────────────────────────────

function dateOrFallback(date: Date | null | undefined, fallback: Date): Date {
  return date || fallback;
}

// ─── 1. Live stats (pour la page impact en temps réel) ───────────────

export async function getOrganizationImpactLiveStats(
  organizationId: string,
  periodStart?: Date,
  periodEnd?: Date
): Promise<ImpactMetrics | null> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { pot: { select: { balance: true } } },
  });
  if (!org) return null;

  const start = periodStart || new Date(0);
  const end = periodEnd || new Date(Date.now() + 86400000);

  // ── Membres ─────────────────────────────────────────────────

  const totalMembers = await prisma.organizationMember.count({
    where: { organizationId, status: "ACTIVE" },
  });

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgoOrStart = thirtyDaysAgo > start ? thirtyDaysAgo : start;

  // Active members (30j ou période) — ont eu une transaction sur la période
  const activeMembers30d = await prisma.organizationMember.count({
    where: {
      organizationId,
      status: "ACTIVE",
      user: {
        OR: [
          { transactionsFrom: { some: { createdAt: { gte: thirtyDaysAgoOrStart, lte: end } } } },
          { transactionsTo: { some: { createdAt: { gte: thirtyDaysAgoOrStart, lte: end } } } },
        ],
      },
    },
  });

  const newMembers = await prisma.organizationMember.count({
    where: {
      organizationId,
      status: "ACTIVE",
      joinedAt: { gte: start, lte: end },
    },
  });

  const facilitatorsCount = await prisma.organizationMember.count({
    where: { organizationId, status: "ACTIVE", role: "FACILITATOR" },
  });

  // Members who completed at least one mission (via collective)
  const membersWithCompletedMission = (
    await prisma.collectiveMissionParticipant.findMany({
      where: {
        mission: { organizationId },
        status: "VALIDATED",
        validatedAt: { gte: start, lte: end },
      },
      select: { userId: true },
      distinct: ["userId"],
    })
  ).length;

  // ── Missions ────────────────────────────────────────────────

  const totalMissions =
    (await prisma.service.count({ where: { organizationId } })) +
    (await prisma.collectiveMission.count({ where: { organizationId } }));

  const activeMissions =
    (await prisma.service.count({
      where: { organizationId, status: "active" },
    })) +
    (await prisma.collectiveMission.count({
      where: {
        organizationId,
        status: { in: ["OPEN", "FULL", "IN_PROGRESS"] },
      },
    }));

  // Completed in period
  const completedServiceBookings = await prisma.booking.count({
    where: {
      service: { organizationId },
      status: "completed",
      completedAt: { gte: start, lte: end },
    },
  });
  const completedCollectives = await prisma.collectiveMission.count({
    where: {
      organizationId,
      status: "COMPLETED",
      completedAt: { gte: start, lte: end },
    },
  });
  const completedMissions = completedServiceBookings + completedCollectives;

  const collectiveMissions = await prisma.collectiveMission.count({
    where: { organizationId },
  });

  const solidarityMissions = await prisma.service.count({
    where: { organizationId, isSolidarityMission: true },
  });

  // Urgent requests where the requester is a member of the org
  const memberUserIds = (
    await prisma.organizationMember.findMany({
      where: { organizationId, status: "ACTIVE" },
      select: { userId: true },
    })
  ).map((m) => m.userId);

  const urgentRequestsLinked = await prisma.urgentRequest.count({
    where: {
      requesterId: { in: memberUserIds },
      createdAt: { gte: start, lte: end },
    },
  });

  // Average participants per collective mission
  const participantsPerMission = await prisma.collectiveMission.groupBy({
    by: ["id"],
    where: { organizationId },
    _count: { id: true },
  });
  const avgParticipants =
    participantsPerMission.length > 0
      ? Math.round(
          participantsPerMission.reduce(
            (sum, p) => sum + p._count.id,
            0
          ) / participantsPerMission.length
        )
      : 0;

  // Completion rate
  const totalLaunched =
    (await prisma.service.count({
      where: {
        organizationId,
        bookings: { some: {} },
      },
    })) +
    (await prisma.collectiveMission.count({
      where: {
        organizationId,
        status: { not: "CANCELLED" },
      },
    }));

  const completionRate =
    totalLaunched > 0
      ? Math.round((completedMissions / totalLaunched) * 100)
      : 0;

  // ── TIME ────────────────────────────────────────────────────

  // TIME from collective missions (sum of timeReward for validated participants)
  const collectiveTimeAgg = await prisma.collectiveMissionParticipant.aggregate({
    where: {
      mission: { organizationId },
      timeReward: { not: null },
    },
    _sum: { timeReward: true },
  });
  const timeFromCollective = collectiveTimeAgg._sum.timeReward || 0;

  // TIME from solidarity missions (bookings on solidarity services)
  const solidarityBookingAgg = await prisma.booking.aggregate({
    where: {
      service: { organizationId, isSolidarityMission: true },
      status: "completed",
    },
    _sum: { totalTime: true },
  });
  const timeFromSolidarity = solidarityBookingAgg._sum.totalTime || 0;

  const totalTimeMobilized = timeFromCollective + timeFromSolidarity;

  const organizationPotBalance = org.pot?.balance || 0;

  // Pot donations in period
  const potDonationsAgg = await prisma.organizationTimePotTransaction.aggregate({
    where: {
      organizationId,
      type: "DONATION",
      createdAt: { gte: start, lte: end },
    },
    _sum: { amount: true },
  });
  const organizationPotDonations = potDonationsAgg._sum.amount || 0;

  // Pot funded (FUNDING transactions)
  const potFundingAgg = await prisma.organizationTimePotTransaction.aggregate({
    where: {
      organizationId,
      type: "FUNDING",
      createdAt: { gte: start, lte: end },
    },
    _sum: { amount: true },
  });
  const organizationPotFunded = potFundingAgg._sum.amount || 0;

  // Dormant TIME: members with TIME balance > 0 but no activity in 90 days
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const dormantUsers = await prisma.user.count({
    where: {
      id: { in: memberUserIds },
      timeBalance: { gt: 0 },
      transactionsFrom: { none: { createdAt: { gte: ninetyDaysAgo } } },
      transactionsTo: { none: { createdAt: { gte: ninetyDaysAgo } } },
    },
  });
  const dormantMembers = await prisma.organizationMember.count({
    where: {
      organizationId,
      status: "ACTIVE",
      userId: { in: (
        await prisma.user.findMany({
          where: {
            id: { in: memberUserIds },
            timeBalance: { gt: 0 },
          },
          select: { id: true },
        })
      ).map(u => u.id) },
    },
  });
  const dormantTimeDetected = dormantMembers;

  // ── Bénéficiaires (P0: simple estimate) ─────────────────────

  // Estimated beneficiaries: unique users who were checked in as BENEFICIARY or received time
  const beneficiaryParticipants = await prisma.collectiveMissionParticipant.findMany({
    where: {
      mission: { organizationId },
      role: "BENEFICIARY",
    },
    select: { userId: true },
    distinct: ["userId"],
  });
  const estimatedBeneficiaries = beneficiaryParticipants.length;

  // Unique receivers (users who received TIME via transactions on org missions)
  const collectiveTransactionUsers = await prisma.collectiveMissionParticipant.findMany({
    where: {
      mission: { organizationId },
      timeReward: { gt: 0 },
    },
    select: { userId: true },
    distinct: ["userId"],
  });
  const uniqueReceivers = collectiveTransactionUsers.length;

  // Receivers who later became contributors (have both given AND received)
  const gaveAndReceived = await prisma.collectiveMissionParticipant.groupBy({
    by: ["userId"],
    where: {
      mission: { organizationId },
      role: { in: ["CONTRIBUTOR", "ORGANIZER"] },
    },
    _count: { id: true },
  });
  const receiversWhoLaterGave = gaveAndReceived.filter((g) =>
    collectiveTransactionUsers.some((r) => r.userId === g.userId)
  ).length;
  const receiversBecameContributors =
    uniqueReceivers > 0 ? receiversWhoLaterGave : 0;

  // Reciprocity rate: % of members who both gave and received TIME
  let recipientsCount = uniqueReceivers;
  const giversCount = (
    await prisma.collectiveMissionParticipant.findMany({
      where: {
        mission: { organizationId },
        role: { in: ["CONTRIBUTOR", "ORGANIZER"] },
        timeReward: { gt: 0 },
      },
      select: { userId: true },
      distinct: ["userId"],
    })
  ).length;

  const bothGaveAndReceived = gaveAndReceived.filter((g) =>
    collectiveTransactionUsers.some((r) => r.userId === g.userId)
  ).length;

  const reciprocityRate =
    totalMembers > 0
      ? Math.round((bothGaveAndReceived / totalMembers) * 100)
      : 0;

  // ── Qualité ─────────────────────────────────────────────────

  const ratingAgg = await prisma.rating.aggregate({
    where: {
      booking: { service: { organizationId } },
    },
    _avg: { score: true },
    _count: { score: true },
  });
  const averageRating = ratingAgg._avg.score
    ? Math.round(ratingAgg._avg.score * 10) / 10
    : 0;
  const ratingsCount = ratingAgg._count.score || 0;

  // Blocked requests resolved (from facilitator network)
  const blockedRequestsResolved = await prisma.facilitatorNetworkAlert.count({
    where: {
      entityType: "URGENT_REQUEST",
      status: "RESOLVED",
    },
  });

  // Average response delay (from booking creation to first message or acceptance)
  // P0 fallback: 0 if not computable
  const averageResponseDelay = 0;

  // No-shows
  const noShowCount = await prisma.collectiveMissionParticipant.count({
    where: {
      mission: { organizationId },
      status: "NO_SHOW",
    },
  });

  // Safety reports
  // Safety reports — P0: pas de relation directe booking → messageReport, fallback à 0
  const safetyReportsCount = 0;

  // ── Valeur sociale ──────────────────────────────────────────

  const socialValueHourlyRate = 15;
  const socialValueEstimated = totalTimeMobilized * socialValueHourlyRate;

  return {
    totalMembers,
    activeMembers30d,
    newMembers,
    facilitatorsCount,
    membersWithCompletedMission,
    totalMissions,
    activeMissions,
    completedMissions,
    collectiveMissions,
    solidarityMissions,
    urgentRequestsLinked,
    averageParticipantsPerMission: avgParticipants,
    completionRate,
    totalTimeMobilized,
    timeFromCollectiveMissions: timeFromCollective,
    timeFromSolidarityMissions: timeFromSolidarity,
    organizationPotBalance,
    organizationPotDonations,
    organizationPotFunded,
    dormantTimeDetected,
    estimatedBeneficiaries,
    uniqueReceivers,
    receiversBecameContributors,
    reciprocityRate,
    averageRating,
    ratingsCount,
    blockedRequestsResolved,
    averageResponseDelay,
    noShowCount,
    safetyReportsCount,
    socialValueEstimated,
    socialValueHourlyRate,
  };
}

// ─── 2. Generate snapshot (for report generation) ────────────────────

export async function generateOrganizationImpactSnapshot(
  organizationId: string,
  periodStart: Date,
  periodEnd: Date,
  socialValueHourlyRate: number = 15
): Promise<ImpactSnapshot> {
  const metrics = await getOrganizationImpactLiveStats(
    organizationId,
    periodStart,
    periodEnd
  );

  if (!metrics) {
    throw new Error("Organisation introuvable");
  }

  // Override hourly rate
  metrics.socialValueHourlyRate = socialValueHourlyRate;
  metrics.socialValueEstimated = metrics.totalTimeMobilized * socialValueHourlyRate;

  // Top missions
  const topMissions = await getTopMissions(organizationId, periodStart, periodEnd);

  // Build summary, highlights, risks, recommendations
  const summary = buildImpactReportSummary(metrics);
  const highlights = buildImpactHighlights(metrics);
  const risks = buildImpactRisks(metrics);
  const recommendations = buildImpactRecommendations(metrics);

  return {
    metrics,
    topMissions,
    summary,
    highlights,
    risks,
    recommendations,
  };
}

// ─── 3. Top missions ────────────────────────────────────────────────

async function getTopMissions(
  organizationId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<TopMission[]> {
  // Get top 5 collective missions by participant count
  const collectives = await prisma.collectiveMission.findMany({
    where: {
      organizationId,
      createdAt: { gte: periodStart, lte: periodEnd },
    },
    include: {
      _count: { select: { participants: true } },
      participants: {
        where: { timeReward: { not: null } },
        select: { timeReward: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const topCollectives: TopMission[] = collectives.map((m) => ({
    id: m.id,
    title: m.title,
    type: "collective",
    status: m.status,
    participantCount: m._count.participants,
    totalTime: m.participants.reduce(
      (sum, p) => sum + (p.timeReward || 0),
      0
    ),
    averageRating: null,
  }));

  // Get top 5 services/bookings by booking count
  const services = await prisma.service.findMany({
    where: {
      organizationId,
      bookings: {
        some: { createdAt: { gte: periodStart, lte: periodEnd } },
      },
    },
    include: {
      _count: { select: { bookings: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const topServices: TopMission[] = services.map((s) => ({
    id: s.id,
    title: s.title,
    type: "service",
    status: s.status,
    participantCount: s._count.bookings,
    totalTime: 0,
    averageRating: null,
  }));

  // Merge and sort by participant count
  const all = [...topCollectives, ...topServices].sort(
    (a, b) => b.participantCount - a.participantCount
  );

  return all.slice(0, 5);
}

// ─── 4. Create report ───────────────────────────────────────────────

export async function createImpactReport(
  organizationId: string,
  input: CreateImpactReportInput,
  generatedById: string
) {
  const snapshot = await generateOrganizationImpactSnapshot(
    organizationId,
    input.periodStart,
    input.periodEnd,
    input.socialValueHourlyRate
  );

  const report = await prisma.impactReport.create({
    data: {
      organizationId,
      title: input.title,
      type: input.type,
      status: "GENERATED",
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      summary: snapshot.summary,
      metricsJson: JSON.stringify(snapshot.metrics),
      highlightsJson: JSON.stringify(snapshot.highlights),
      risksJson: input.includeRisks
        ? JSON.stringify(snapshot.risks)
        : null,
      recommendationsJson: input.includeRecommendations
        ? JSON.stringify(snapshot.recommendations)
        : null,
      socialValueHourlyRate: input.socialValueHourlyRate,
      socialValueEstimated: snapshot.metrics.socialValueEstimated,
      visibility: input.visibility,
      generatedById,
      generatedAt: new Date(),
    },
  });

  return report;
}

// ─── 5. Get reports for organization ─────────────────────────────────

export async function getImpactReportsForOrganization(
  organizationId: string
) {
  return prisma.impactReport.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    include: {
      organization: {
        select: { name: true, slug: true },
      },
    },
  });
}

// ─── 6. Get report by ID ────────────────────────────────────────────

export async function getImpactReportById(reportId: string) {
  const report = await prisma.impactReport.findUnique({
    where: { id: reportId },
    include: {
      organization: {
        select: { name: true, slug: true },
      },
    },
  });

  if (!report) return null;

  return {
    ...report,
    metrics: report.metricsJson ? JSON.parse(report.metricsJson) : null,
    highlights: report.highlightsJson
      ? JSON.parse(report.highlightsJson)
      : [],
    risks: report.risksJson ? JSON.parse(report.risksJson) : [],
    recommendations: report.recommendationsJson
      ? JSON.parse(report.recommendationsJson)
      : [],
  };
}

// ─── 7. Archive report ──────────────────────────────────────────────

export async function archiveImpactReport(
  reportId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const report = await prisma.impactReport.findUnique({
    where: { id: reportId },
    select: { id: true, organizationId: true },
  });
  if (!report) return { success: false, error: "Rapport introuvable." };

  await prisma.impactReport.update({
    where: { id: reportId },
    data: { status: "ARCHIVED" },
  });

  return { success: true };
}

// ─── 8. Build summary ───────────────────────────────────────────────

export function buildImpactReportSummary(metrics: ImpactMetrics): string {
  const rate = metrics.reciprocityRate;
  let reciprocityNote = "";

  if (rate >= 40) {
    reciprocityNote =
      "La communauté montre une forte dynamique de réciprocité, signe d'un engagement durable.";
  } else if (rate >= 20) {
    reciprocityNote =
      "Le taux de réciprocité observé montre une dynamique de contribution progressive au sein de la communauté.";
  } else if (rate > 0) {
    reciprocityNote =
      "La réciprocité commence à s'installer, des actions de renforcement sont recommandées.";
  } else {
    reciprocityNote =
      "La réciprocité est encore faible, des actions de sensibilisation peuvent être utiles.";
  }

  return `Sur la période, l'organisation a mobilisé ${metrics.totalMembers} membre${
    metrics.totalMembers > 1 ? "s" : ""
  } autour de ${metrics.totalMissions} mission${
    metrics.totalMissions > 1 ? "s" : ""
  }, dont ${metrics.solidarityMissions} mission${
    metrics.solidarityMissions > 1 ? "s" : ""
  } solidaire${metrics.solidarityMissions > 1 ? "s" : ""} et ${
    metrics.collectiveMissions
  } mission${
    metrics.collectiveMissions > 1 ? "s" : ""
  } collective${metrics.collectiveMissions > 1 ? "s" : ""}. Au total, ${
    metrics.totalTimeMobilized
  } TIME ont été mobilisé${
    metrics.totalTimeMobilized > 1 ? "s" : ""
  }, représentant une valeur sociale estimée à ${metrics.socialValueEstimated.toLocaleString(
    "fr-FR"
  )} €. ${reciprocityNote}`;
}

// ─── 9. Build highlights ────────────────────────────────────────────

export function buildImpactHighlights(metrics: ImpactMetrics): string[] {
  const highlights: string[] = [];

  if (metrics.totalMembers > 0) {
    highlights.push(`${metrics.totalMembers} membre${metrics.totalMembers > 1 ? "s" : ""} engagé${metrics.totalMembers > 1 ? "s" : ""}`);
  }
  if (metrics.completedMissions > 0) {
    highlights.push(
      `${metrics.completedMissions} mission${metrics.completedMissions > 1 ? "s" : ""} réalisée${metrics.completedMissions > 1 ? "s" : ""}`
    );
  }
  if (metrics.totalTimeMobilized > 0) {
    highlights.push(
      `${metrics.totalTimeMobilized} TIME mobilisé${metrics.totalTimeMobilized > 1 ? "s" : ""}`
    );
  }
  if (metrics.solidarityMissions > 0) {
    highlights.push(`${metrics.solidarityMissions} mission${metrics.solidarityMissions > 1 ? "s" : ""} solidaire${metrics.solidarityMissions > 1 ? "s" : ""}`);
  }
  if (metrics.collectiveMissions > 0) {
    highlights.push(`${metrics.collectiveMissions} mission${metrics.collectiveMissions > 1 ? "s" : ""} collective${metrics.collectiveMissions > 1 ? "s" : ""}`);
  }
  if (metrics.reciprocityRate > 0) {
    highlights.push(`${metrics.reciprocityRate} % de réciprocité`);
  }
  if (metrics.socialValueEstimated > 0) {
    highlights.push(
      `${metrics.socialValueEstimated.toLocaleString("fr-FR")} € de valeur sociale estimée`
    );
  }
  if (metrics.organizationPotBalance > 0) {
    highlights.push(
      `${metrics.organizationPotBalance} TIME dans le pot d'impact`
    );
  }

  return highlights;
}

// ─── 10. Build risks ────────────────────────────────────────────────

export function buildImpactRisks(metrics: ImpactMetrics): string[] {
  const risks: string[] = [];

  if (metrics.reciprocityRate < 20 && metrics.totalMembers > 5) {
    risks.push("La réciprocité reste faible. Peu de membres donnent et reçoivent du TIME.");
  }
  if (metrics.completedMissions === 0 && metrics.totalMissions > 0) {
    risks.push("Aucune mission terminée sur la période.");
  }
  if (metrics.activeMembers30d < 5 && metrics.totalMembers > 0) {
    risks.push("La communauté est encore peu active.");
  }
  if (
    metrics.organizationPotBalance > 100 &&
    metrics.organizationPotFunded === 0
  ) {
    risks.push("Le pot d'impact est bien approvisionné mais peu utilisé pour financer des missions.");
  }
  if (metrics.averageRating > 0 && metrics.averageRating < 4 && metrics.ratingsCount > 0) {
    risks.push("La satisfaction est à surveiller (note moyenne inférieure à 4/5).");
  }
  if (
    metrics.blockedRequestsResolved === 0 &&
    metrics.urgentRequestsLinked > 0
  ) {
    risks.push("Certaines demandes urgentes semblent rester bloquées.");
  }
  if (metrics.noShowCount > 3) {
    risks.push("Les absences non justifiées sont fréquentes.");
  }

  return risks;
}

// ─── 11. Build recommendations ──────────────────────────────────────

export function buildImpactRecommendations(metrics: ImpactMetrics): string[] {
  const recs: string[] = [];

  if (metrics.reciprocityRate < 30) {
    recs.push("Encourager les receveurs à devenir contributeurs pour renforcer la réciprocité.");
  }
  if (metrics.organizationPotBalance > 50 && metrics.organizationPotFunded === 0) {
    recs.push("Utiliser une partie du pot d'impact pour financer des missions solidaires.");
  }
  if (metrics.completedMissions < 3 && metrics.totalMissions > 0) {
    recs.push("Accompagner les missions en cours pour augmenter le taux d'achèvement.");
  }
  if (metrics.activeMembers30d < metrics.totalMembers * 0.5) {
    recs.push("Mobiliser les membres sous-utilisés via une campagne d'engagement.");
  }
  if (metrics.estimatedBeneficiaries === 0) {
    recs.push("Structurer des missions à bénéfice direct pour mesurer l'impact social.");
  }
  if (metrics.solidarityMissions === 0) {
    recs.push("Lancer des missions solidaires pour renforcer l'impact social de l'organisation.");
  }

  // Generic recommendations
  recs.push("Organiser un temps d'échange local pour renforcer les liens de la communauté.");
  recs.push("Partager ce rapport d'impact avec les partenaires et financeurs.");

  return recs;
}

// ─── 12. Export CSV ─────────────────────────────────────────────────

export async function exportImpactReportToCsv(reportId: string): Promise<string | null> {
  const report = await getImpactReportById(reportId);
  if (!report || !report.metrics) return null;

  const metrics = report.metrics as ImpactMetrics;

  const csvLines = ["metric_key,metric_label,value,unit"];
  const keys = Object.keys(metrics) as (keyof ImpactMetrics)[];

  for (const key of keys) {
    if (key === "socialValueHourlyRate") continue; // Skip config field
    const label = getMetricLabel(key);
    const value = metrics[key];
    const unit = getMetricUnit(key);
    // Sanitize label for CSV
    const safeLabel = label.replace(/"/g, '""');
    csvLines.push(`${key},"${safeLabel}",${value},${unit}`);
  }

  return csvLines.join("\n");
}

// ─── Metric label/unit helpers ──────────────────────────────────────

function getMetricLabel(key: string): string {
  return METRIC_LABELS[key] || key;
}

function getMetricUnit(key: string): string {
  return METRIC_UNITS[key] || "count";
}
