import { prisma } from "@/lib/prisma";
import { FACILITATOR_THRESHOLDS as T } from "@/lib/facilitator-thresholds";

// ─── Types ───────────────────────────────────────────────────────────────────

export type NetworkHealthStats = {
  networkHealthScore: number;
  blockedRequestsCount: number;
  overusedHeroesCount: number;
  underusedHeroesCount: number;
  dormantTimeUsersCount: number;
  reciprocityPercent: number;
  averageResponseTimeHours: number | null;
  criticalAlertsCount: number;
  liquidityScore: number;
  responseScore: number;
  reciprocityScore: number;
  activityScore: number;
  safetyScore: number;
};

export type BlockedRequestItem = {
  type: string;
  title: string;
  ageHours: number;
  city: string | null;
  status: string;
  severity: string;
  recommendedAction: string;
  link: string;
};

export type OverusedHero = {
  userId: string;
  name: string;
  missions30d: number;
  hoursGiven: number;
  pendingCount: number;
  timeBalance: number;
  overuseScore: number;
  risk: "LOW" | "MEDIUM" | "HIGH";
  recommendation: string;
};

export type UnderusedHero = {
  userId: string;
  name: string;
  skills: string;
  city: string | null;
  activeServices: number;
  passportCompletion: number;
  lastActivityDays: number;
  recommendation: string;
};

export type DormantTimeUser = {
  userId: string;
  name: string;
  balance: number;
  lastSpendDays: number | null;
  potDonations: number;
  status: "Light" | "Strong" | "TimeRich" | "TimePoor";
  suggestion: string;
};

export type NetworkAlert = {
  id: string;
  type: string;
  severity: string;
  status: string;
  title: string;
  description: string | null;
  recommendedAction: string | null;
  entityType: string | null;
  entityId: string | null;
  createdAt: Date;
  updatedAt: Date;
  resolvedById: string | null;
  resolvedAt: Date | null;
  resolutionNote: string | null;
};

export type FacilitatorNoteItem = {
  id: string;
  authorId: string;
  authorName: string | null;
  entityType: string;
  entityId: string;
  content: string;
  createdAt: Date;
};

export type NetworkDashboard = {
  healthStats: NetworkHealthStats;
  blockedRequests: BlockedRequestItem[];
  overusedHeroes: OverusedHero[];
  underusedHeroes: UnderusedHero[];
  dormantTimeUsers: DormantTimeUser[];
  alerts: NetworkAlert[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SEVERITY_ORDER: Record<string, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };

function hoursSince(date: Date): number {
  return (Date.now() - date.getTime()) / 3600000;
}

function daysSince(date: Date): number {
  return (Date.now() - date.getTime()) / 86400000;
}

// ─── 1. Network Health Stats ─────────────────────────────────────────────────

export async function getNetworkHealthStats(): Promise<NetworkHealthStats> {
  const now = new Date();
  const days30 = new Date(now.getTime() - 30 * 86400000);

  // ── Liquidity Score ────────────────────────────────────────────────
  const totalUsersWithBalance = await prisma.user.count({
    where: { timeBalance: { gt: 0 } },
  });
  const dormantUsers = await prisma.user.count({
    where: {
      timeBalance: { gte: T.dormantTimeBalance },
      transactionsTo: {
        none: { createdAt: { gte: new Date(now.getTime() - T.dormantTimeNoSpendDays * 86400000) } },
      },
    },
  });
  const dormantTimeRatio = totalUsersWithBalance > 0 ? dormantUsers / totalUsersWithBalance : 0;
  const liquidityScore = Math.round(100 - dormantTimeRatio * 100);

  // ── Response Score ─────────────────────────────────────────────────
  // Délai moyen = time between UrgentRequest creation and first UrgentOffer
  const requestsWithOffers = await prisma.urgentRequest.findMany({
    where: {
      offers: { some: {} },
      status: { not: "open" },
    },
    select: {
      createdAt: true,
      offers: {
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { createdAt: true },
      },
    },
  });

  let avgHours: number | null = null;
  if (requestsWithOffers.length > 0) {
    const totalHours = requestsWithOffers.reduce((sum, rq) => {
      const offerTime = rq.offers[0]?.createdAt;
      if (!offerTime) return sum;
      return sum + hoursSince(rq.createdAt) - hoursSince(offerTime);
      // Actually: we want the diff between creation and first offer
    }, 0);
    // Let me rewrite this properly
    let total = 0;
    let count = 0;
    for (const rq of requestsWithOffers) {
      const offerTime = rq.offers[0]?.createdAt;
      if (!offerTime) continue;
      total += (offerTime.getTime() - rq.createdAt.getTime()) / 3600000;
      count++;
    }
    avgHours = count > 0 ? total / count : null;
  }

  let responseScore = 20;
  if (avgHours !== null) {
    if (avgHours < 6) responseScore = 100;
    else if (avgHours < 24) responseScore = 80;
    else if (avgHours < 48) responseScore = 60;
    else if (avgHours < 72) responseScore = 40;
    else responseScore = 20;
  }

  // ── Reciprocity Score ──────────────────────────────────────────────
  // "Donné" = toute transaction sortante (escrow_hold, transfer, pot donation)
  // "Reçu" = toute transaction entrante (escrow_release, collective reward, pot funding)
  const activeUsersCount = await prisma.user.count({
    where: {
      OR: [
        { transactionsTo: { some: { createdAt: { gte: days30 } } } },
        { transactionsFrom: { some: { createdAt: { gte: days30 } } } },
      ],
    },
  });

  const reciprocalUsers = await prisma.user.count({
    where: {
      transactionsFrom: {
        some: {
          createdAt: { gte: days30 },
          type: { in: ["escrow_hold", "transfer"] },
        },
      },
      transactionsTo: {
        some: {
          createdAt: { gte: days30 },
          type: { in: ["escrow_release", "collective_mission_reward"] },
        },
      },
    },
  });
  const reciprocityScore = activeUsersCount > 0
    ? Math.round((reciprocalUsers / activeUsersCount) * 100)
    : 100;

  // ── Activity Score ─────────────────────────────────────────────────
  const missions30d = await prisma.booking.count({
    where: { completedAt: { gte: days30 }, status: "completed" },
  });
  const urgentRequests30d = await prisma.urgentRequest.count({
    where: { createdAt: { gte: days30 } },
  });
  const collectiveCompletions = await prisma.collectiveMission.count({
    where: { completedAt: { gte: days30 } },
  });
  const potDonations30d = await prisma.communityPotTransaction.count({
    where: { type: "DONATION", createdAt: { gte: days30 } },
  });
  // Normalise activity: cap at 100
  const rawActivity = missions30d * 10 + urgentRequests30d * 5 + collectiveCompletions * 15 + potDonations30d * 8;
  const activityScore = Math.min(100, Math.round(rawActivity));

  // ── Safety Score ───────────────────────────────────────────────────
  const openReports = await prisma.messageReport.count({
    where: { status: "OPEN" },
  });
  const flaggedMessages = await prisma.bookingMessage.count({
    where: { isFlagged: true, isHidden: false },
  });
  const stuckBookings = await prisma.booking.count({
    where: {
      status: { in: ["pending", "confirmed"] },
      createdAt: { lt: new Date(now.getTime() - 5 * 86400000) },
    },
  });
  const safetyDeductions = openReports * 15 + flaggedMessages * 10 + stuckBookings * 5;
  const safetyScore = Math.max(0, 100 - safetyDeductions);

  // ── Blocked Requests Count ─────────────────────────────────────────
  const blockedReq = await getBlockedRequests();
  const blockedRequestsCount = blockedReq.length;

  // ── Overused Heroes Count ──────────────────────────────────────────
  const overused = await getOverusedHeroes();
  const overusedHeroesCount = overused.filter((h) => h.risk === "HIGH" || h.risk === "MEDIUM").length;

  // ── Underused Heroes Count ─────────────────────────────────────────
  const underused = await getUnderusedHeroes();
  const underusedHeroesCount = underused.length;

  // ── Dormant Time Count ─────────────────────────────────────────────
  const dormant = await getDormantTimeUsers();
  const dormantTimeUsersCount = dormant.length;

  // ── Critical Alerts Count ──────────────────────────────────────────
  const criticalAlerts = await prisma.facilitatorNetworkAlert.count({
    where: {
      status: "OPEN",
      severity: { in: ["HIGH", "CRITICAL"] },
    },
  });

  // ── Global Score ───────────────────────────────────────────────────
  const networkHealthScore = Math.round(
    liquidityScore * T.healthScore.liquidityWeight
    + responseScore * T.healthScore.responseWeight
    + reciprocityScore * T.healthScore.reciprocityWeight
    + activityScore * T.healthScore.activityWeight
    + safetyScore * T.healthScore.safetyWeight
  );

  return {
    networkHealthScore,
    blockedRequestsCount,
    overusedHeroesCount,
    underusedHeroesCount,
    dormantTimeUsersCount,
    reciprocityPercent: reciprocityScore,
    averageResponseTimeHours: avgHours !== null ? Math.round(avgHours * 10) / 10 : null,
    criticalAlertsCount: criticalAlerts,
    liquidityScore,
    responseScore,
    reciprocityScore,
    activityScore,
    safetyScore,
  };
}

// ─── 2. Blocked Requests ─────────────────────────────────────────────────────

export async function getBlockedRequests(): Promise<BlockedRequestItem[]> {
  const now = new Date();
  const blocked: BlockedRequestItem[] = [];

  // 2a. UrgentRequest OPEN sans offre depuis >48h
  const urgentNoOffer = await prisma.urgentRequest.findMany({
    where: {
      status: "open",
      offers: { none: {} },
      createdAt: { lt: new Date(now.getTime() - T.urgentRequestBlockedHours * 3600000) },
    },
    include: { requester: { select: { name: true } } },
  });
  for (const req of urgentNoOffer) {
    const age = hoursSince(req.createdAt);
    blocked.push({
      type: "Urgent Help",
      title: req.title,
      ageHours: Math.round(age),
      city: req.city,
      status: "OPEN",
      severity: age > 72 ? "CRITICAL" : "HIGH",
      recommendedAction: "Contacter des Heroes locaux pour proposer leur aide",
      link: `/urgent/${req.id}`,
    });
  }

  // 2b. UrgentRequest OPEN avec offres mais aucune acceptée depuis >48h
  const urgentWithOffers = await prisma.urgentRequest.findMany({
    where: {
      status: "open",
      offers: { some: {} },
      createdAt: { lt: new Date(now.getTime() - T.urgentRequestBlockedHours * 3600000) },
    },
    include: { requester: { select: { name: true } }, offers: { take: 1 } },
  });
  for (const req of urgentWithOffers) {
    const age = hoursSince(req.createdAt);
    blocked.push({
      type: "Urgent Help",
      title: req.title,
      ageHours: Math.round(age),
      city: req.city,
      status: "OPEN (offres en attente)",
      severity: "MEDIUM",
      recommendedAction: "Relancer le demandeur pour qu'il accepte une offre",
      link: `/urgent/${req.id}`,
    });
  }

  // 2c. CommunityPotRequest PENDING depuis >48h
  const potRequests = await prisma.communityPotRequest.findMany({
    where: {
      status: "PENDING",
      createdAt: { lt: new Date(now.getTime() - T.potRequestPendingHours * 3600000) },
    },
    include: { user: { select: { name: true } } },
  });
  for (const req of potRequests) {
    const age = hoursSince(req.createdAt);
    blocked.push({
      type: "Community Pot",
      title: `Demande de ${req.user.name} — ${req.amount} TIME`,
      ageHours: Math.round(age),
      city: null,
      status: "PENDING",
      severity: age > 72 ? "HIGH" : "MEDIUM",
      recommendedAction: "Examiner et valider ou refuser la demande",
      link: "/facilitator/community-pot",
    });
  }

  // 2d. Missions solidaires SELF_DECLARED non vérifiées depuis >72h
  const solidarityPending = await prisma.service.findMany({
    where: {
      solidarityStatus: "SELF_DECLARED",
      createdAt: { lt: new Date(now.getTime() - T.solidarityReviewPendingHours * 3600000) },
    },
    include: { provider: { select: { name: true } } },
  });
  for (const s of solidarityPending) {
    blocked.push({
      type: "Mission solidaire",
      title: s.title,
      ageHours: Math.round(hoursSince(s.createdAt)),
      city: null,
      status: "SELF_DECLARED",
      severity: "LOW",
      recommendedAction: "Vérifier la mission solidaire et valider ou refuser",
      link: `/services/${s.id}`,
    });
  }

  // 2e. Booking pending depuis >5 jours
  const stuckBookings = await prisma.booking.findMany({
    where: {
      status: "pending",
      createdAt: { lt: new Date(now.getTime() - T.bookingStuckDays * 86400000) },
    },
    include: { service: { select: { title: true } } },
  });
  for (const b of stuckBookings) {
    blocked.push({
      type: "Booking",
      title: b.service.title,
      ageHours: Math.round(hoursSince(b.createdAt)),
      city: null,
      status: "PENDING",
      severity: "MEDIUM",
      recommendedAction: "Contacter les deux parties pour débloquer la réservation",
      link: `/bookings/${b.id}`,
    });
  }

  // 2f. Missions collectives proches de la date mais remplissage < 50%
  const upcomingCollective = await prisma.collectiveMission.findMany({
    where: {
      status: "OPEN",
      startsAt: {
        not: null,
        lt: new Date(now.getTime() + T.collectiveMissionUnderfilledHoursBeforeStart * 3600000),
        gt: now,
      },
    },
    include: { organizer: { select: { name: true } }, participants: true },
  });
  for (const m of upcomingCollective) {
    const fillRate = m.maxParticipants > 0
      ? m.participants.filter((p) => p.status === "JOINED").length / m.maxParticipants
      : 0;
    if (fillRate < T.collectiveMissionMinimumFillRate) {
      blocked.push({
        type: "Mission collective",
        title: m.title,
        ageHours: Math.round(hoursSince(m.createdAt)),
        city: m.city,
        status: "SOUS-REMPLIE",
        severity: "MEDIUM",
        recommendedAction: `Remplissage actuel ${Math.round(fillRate * 100)}% — recruter des participants`,
        link: `/collective-missions/${m.id}`,
      });
    }
  }

  // Trier par sévérité décroissante
  blocked.sort((a, b) => (SEVERITY_ORDER[b.severity] ?? 0) - (SEVERITY_ORDER[a.severity] ?? 0));
  return blocked;
}

// ─── 3. Overused Heroes ──────────────────────────────────────────────────────

export async function getOverusedHeroes(): Promise<OverusedHero[]> {
  const now = new Date();
  const days30 = new Date(now.getTime() - 30 * 86400000);

  const users = await prisma.user.findMany({
    where: { role: { not: "ADMIN" } },
    select: {
      id: true,
      name: true,
      timeBalance: true,
      clientBookings: {
        where: { completedAt: { gte: days30 }, status: "completed" },
        select: { hours: true },
      },
      services: {
        where: { status: "active", bookings: { some: { completedAt: { gte: days30 }, status: "completed" } } },
        select: {
          bookings: {
            where: { completedAt: { gte: days30 }, status: "completed" },
            select: { hours: true },
          },
        },
      },
      urgentRequests: { where: { createdAt: { gte: days30 } }, select: { id: true } },
      urgentOffers: { where: { createdAt: { gte: days30 } }, select: { id: true } },
      collectiveMissionParticipants: {
        where: {
          mission: { status: "COMPLETED", completedAt: { gte: days30 } },
          role: { not: "BENEFICIARY" },
        },
        select: { id: true, hoursValidated: true },
      },
    },
  });

  const heroes: OverusedHero[] = [];

  for (const u of users) {
    // Completed bookings: as client + as provider (from services)
    const providerBookings = u.services.flatMap((s) => s.bookings);
    const missions30d = u.clientBookings.length + providerBookings.length;
    const hours30d =
      u.clientBookings.reduce((s, b) => s + b.hours, 0) +
      providerBookings.reduce((s, b) => s + b.hours, 0);
    const pendingCount = u.urgentRequests.length + u.urgentOffers.length;
    const collectiveCount = u.collectiveMissionParticipants.length;

    if (missions30d < T.overusedMissionCount30d && hours30d < T.overusedHours30d && pendingCount < 3 && collectiveCount < 3) {
      continue;
    }

    const overuseScore = missions30d * T.overuseMissionWeight
      + hours30d * T.overuseHoursWeight
      + pendingCount * T.overusePendingWeight;

    let risk: "LOW" | "MEDIUM" | "HIGH";
    let recommendation: string;
    if (overuseScore >= 80) {
      risk = "HIGH";
      recommendation = "Éviter de recommander ce Hero cette semaine. Prioriser d'autres membres.";
    } else if (overuseScore >= 40) {
      risk = "MEDIUM";
      recommendation = "Surveiller la charge. Limiter les nouvelles sollicitations.";
    } else {
      risk = "LOW";
      recommendation = "Charge normale. Continuer à solliciter avec modération.";
    }

    if (risk !== "LOW") {
      heroes.push({
        userId: u.id,
        name: u.name,
        missions30d,
        hoursGiven: hours30d,
        pendingCount,
        timeBalance: u.timeBalance,
        overuseScore,
        risk,
        recommendation,
      });
    }
  }

  heroes.sort((a, b) => b.overuseScore - a.overuseScore);
  return heroes;
}

// ─── 4. Underused Heroes ─────────────────────────────────────────────────────

export async function getUnderusedHeroes(): Promise<UnderusedHero[]> {
  const now = new Date();
  const days30 = new Date(now.getTime() - 30 * 86400000);
  const days60 = new Date(now.getTime() - 60 * 86400000);

  const users = await prisma.user.findMany({
    where: {
      // Must have complete profile: passport + services + city
      heroPassport: { isNot: null },
      city: { not: null },
      // No missions in 30 days (as client or via their services)
      clientBookings: {
        none: { completedAt: { gte: days30 } },
      },
      // Active in last 60 days
      createdAt: { lt: days60 },
    },
    select: {
      id: true,
      name: true,
      city: true,
      availableOnline: true,
      createdAt: true,
      heroPassport: {
        select: {
          bio: true,
          offeredSkills: true,
          motivations: true,
        },
      },
      services: {
        where: { status: "active" },
        select: { id: true },
      },
      transactionsTo: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
      transactionsFrom: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
      urgentRequests: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
      urgentOffers: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
  });

  const heroes: UnderusedHero[] = [];

  for (const u of users) {
    // Passport completion (simplified: if passport has bio + offeredSkills, count as complete)
    const passport = u.heroPassport;
    const hasBio = passport?.bio && passport.bio.length > 5;
    const hasSkills = passport?.offeredSkills && passport.offeredSkills.length > 3;
    const hasMotivations = passport?.motivations && passport.motivations.length > 3;
    const filledFields = [hasBio, hasSkills, hasMotivations].filter(Boolean).length;
    const passportCompletion = Math.round((filledFields / 3) * 100);

    if (passportCompletion < T.underusedMinPassportCompletion * 100) continue;
    if (u.services.length < 1) continue;

    // Last activity
    const lastActivityDates = [
      u.transactionsTo[0]?.createdAt,
      u.transactionsFrom[0]?.createdAt,
      u.urgentRequests[0]?.createdAt,
      u.urgentOffers[0]?.createdAt,
    ].filter(Boolean) as Date[];

    if (lastActivityDates.length === 0) continue;

    const lastActivity = lastActivityDates.sort((a, b) => b.getTime() - a.getTime())[0];
    const lastActivityDays = Math.round(daysSince(lastActivity));

    if (lastActivityDays > T.underusedMaxInactiveDays) continue;

    // Build recommendation
    const skills = passport?.offeredSkills || "";
    const topSkill = skills.split(",").map((s) => s.trim()).filter(Boolean)[0] || "leur spécialité";
    const recommendation = `Peut répondre aux demandes de ${topSkill.toLowerCase()} à ${u.city || "sa ville"}`;

    heroes.push({
      userId: u.id,
      name: u.name,
      skills,
      city: u.city,
      activeServices: u.services.length,
      passportCompletion,
      lastActivityDays,
      recommendation,
    });
  }

  heroes.sort((a, b) => b.passportCompletion - a.passportCompletion);
  return heroes;
}

// ─── 5. Dormant Time Users ───────────────────────────────────────────────────

export async function getDormantTimeUsers(): Promise<DormantTimeUser[]> {
  const now = new Date();
  const days30 = new Date(now.getTime() - 30 * 86400000);
  const days60 = new Date(now.getTime() - 60 * 86400000);

  const users = await prisma.user.findMany({
    where: { timeBalance: { gte: 2 } },
    select: {
      id: true,
      name: true,
      timeBalance: true,
      communityPotDonations: {
        select: { amount: true },
      },
      transactionsTo: {
        where: {
          type: { in: ["escrow_hold", "transfer"] },
        },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
      urgentRequests: {
        where: { status: "open" },
        select: { id: true },
      },
      clientBookings: {
        where: { status: { in: ["pending", "confirmed"] } },
        select: { id: true },
      },
    },
  });

  const dormant: DormantTimeUser[] = [];

  for (const u of users) {
    const lastSpend = u.transactionsTo[0]?.createdAt;
    const daysSinceLastSpend = lastSpend ? Math.round(daysSince(lastSpend)) : null;
    const potDonations = u.communityPotDonations.reduce((s, d) => s + d.amount, 0);
    const hasActiveNeed = u.urgentRequests.length > 0 || u.clientBookings.length > 0;

    let status: "Light" | "Strong" | "TimeRich" | "TimePoor";
    let suggestion: string;

    if (u.timeBalance <= 2 && hasActiveNeed) {
      status = "TimePoor";
      suggestion = "Peut bénéficier d'une aide du pot commun ou d'une mission solidaire";
    } else if (u.timeBalance >= 20 && daysSinceLastSpend !== null && daysSinceLastSpend >= 60) {
      status = "Strong";
      suggestion = `Proposer un don de ${Math.min(5, Math.floor(u.timeBalance / 3))} TIME au pot commun`;
    } else if (u.timeBalance >= 10 && daysSinceLastSpend !== null && daysSinceLastSpend >= 30) {
      status = "Light";
      suggestion = "Encourager à dépenser ou donner au pot commun";
    } else if (u.timeBalance >= 20 && potDonations === 0) {
      status = "TimeRich";
      suggestion = `N'a jamais donné au pot. Proposer un don de ${Math.min(5, Math.floor(u.timeBalance / 4))} TIME.`;
    } else {
      continue; // pas dormant
    }

    dormant.push({
      userId: u.id,
      name: u.name,
      balance: u.timeBalance,
      lastSpendDays: daysSinceLastSpend,
      potDonations,
      status,
      suggestion,
    });
  }

  dormant.sort((a, b) => b.balance - a.balance);
  return dormant;
}

// ─── 6. Reciprocity Stats ────────────────────────────────────────────────────

export async function getReciprocityStats() {
  const now = new Date();
  const days30 = new Date(now.getTime() - 30 * 86400000);

  const activeUsers = await prisma.user.count({
    where: {
      OR: [
        { transactionsTo: { some: { createdAt: { gte: days30 } } } },
        { transactionsFrom: { some: { createdAt: { gte: days30 } } } },
      ],
    },
  });

  const giversOnly = await prisma.user.count({
    where: {
      transactionsFrom: {
        some: {
          createdAt: { gte: days30 },
          type: { in: ["escrow_hold", "transfer"] },
        },
      },
      transactionsTo: {
        none: {
          createdAt: { gte: days30 },
          type: { in: ["escrow_release", "collective_mission_reward"] },
        },
      },
    },
  });

  const receiversOnly = await prisma.user.count({
    where: {
      transactionsTo: {
        some: {
          createdAt: { gte: days30 },
          type: { in: ["escrow_release", "collective_mission_reward"] },
        },
      },
      transactionsFrom: {
        none: {
          createdAt: { gte: days30 },
          type: { in: ["escrow_hold", "transfer"] },
        },
      },
    },
  });

  const reciprocal = await prisma.user.count({
    where: {
      transactionsFrom: {
        some: {
          createdAt: { gte: days30 },
          type: { in: ["escrow_hold", "transfer"] },
        },
      },
      transactionsTo: {
        some: {
          createdAt: { gte: days30 },
          type: { in: ["escrow_release", "collective_mission_reward"] },
        },
      },
    },
  });

  return {
    activeUsers,
    giversOnly,
    receiversOnly,
    reciprocal,
    reciprocityPercent: activeUsers > 0 ? Math.round((reciprocal / activeUsers) * 100) : 0,
  };
}

// ─── 7. Network Alerts ───────────────────────────────────────────────────────

/**
 * Génère les alertes réseau de façon IDEMPOTENTE.
 * Avant de créer chaque alerte, vérifie si une alerte de même type + entityId
 * existe déjà avec status OPEN. Si oui, met à jour updatedAt et sévérité.
 */
export async function generateNetworkAlerts(): Promise<number> {
  let createdCount = 0;

  // ── Blocked request alerts ─────────────────────────────────────────
  const blocked = await getBlockedRequests();
  for (const item of blocked.filter((b) => b.severity === "HIGH" || b.severity === "CRITICAL")) {
    const alertType = getAlertTypeForBlocked(item.type);
    const entityId = extractEntityId(item.link);
    const dedupKey = `${alertType}_${entityId}`;

    const existing = await prisma.facilitatorNetworkAlert.findFirst({
      where: {
        type: alertType,
        entityId: entityId,
        status: "OPEN",
      },
    });

    if (existing) {
      // Update severity if changed
      if (existing.severity !== item.severity) {
        await prisma.facilitatorNetworkAlert.update({
          where: { id: existing.id },
          data: { severity: item.severity, updatedAt: new Date() },
        });
      }
      continue;
    }

    await prisma.facilitatorNetworkAlert.create({
      data: {
        type: alertType,
        severity: item.severity,
        status: "OPEN",
        title: item.title,
        description: `Bloquée depuis ${item.ageHours}h — ${item.status}`,
        recommendedAction: item.recommendedAction,
        entityType: getEntityTypeForBlocked(item.type),
        entityId,
      },
    });
    createdCount++;
  }

  // ── Overused hero alerts ───────────────────────────────────────────
  const overused = await getOverusedHeroes();
  for (const hero of overused.filter((h) => h.risk === "HIGH")) {
    const existing = await prisma.facilitatorNetworkAlert.findFirst({
      where: {
        type: "OVERUSED_HERO",
        entityId: hero.userId,
        status: "OPEN",
      },
    });
    if (existing) continue;

    await prisma.facilitatorNetworkAlert.create({
      data: {
        type: "OVERUSED_HERO",
        severity: "HIGH",
        status: "OPEN",
        title: `${hero.name} — sur-sollicité`,
        description: `${hero.missions30d} missions, ${hero.hoursGiven}h données sur 30j`,
        recommendedAction: hero.recommendation,
        entityType: "USER",
        entityId: hero.userId,
      },
    });
    createdCount++;
  }

  // ── Underused hero alerts ──────────────────────────────────────────
  const underused = await getUnderusedHeroes();
  for (const hero of underused.slice(0, 10)) {
    const existing = await prisma.facilitatorNetworkAlert.findFirst({
      where: {
        type: "UNDERUSED_HERO",
        entityId: hero.userId,
        status: "OPEN",
      },
    });
    if (existing) continue;

    await prisma.facilitatorNetworkAlert.create({
      data: {
        type: "UNDERUSED_HERO",
        severity: "LOW",
        status: "OPEN",
        title: `${hero.name} — sous-utilisé`,
        description: `Profil complété à ${hero.passportCompletion}%, 0 mission sur 30j`,
        recommendedAction: hero.recommendation,
        entityType: "USER",
        entityId: hero.userId,
      },
    });
    createdCount++;
  }

  // ── Dormant time alerts ────────────────────────────────────────────
  const dormant = await getDormantTimeUsers();
  for (const user of dormant.filter((d) => d.status === "Strong" || d.status === "TimeRich")) {
    const existing = await prisma.facilitatorNetworkAlert.findFirst({
      where: {
        type: "DORMANT_TIME",
        entityId: user.userId,
        status: "OPEN",
      },
    });
    if (existing) continue;

    await prisma.facilitatorNetworkAlert.create({
      data: {
        type: "DORMANT_TIME",
        severity: user.status === "Strong" ? "MEDIUM" : "LOW",
        status: "OPEN",
        title: `${user.name} — ${user.balance} TIME dormants`,
        description: user.lastSpendDays !== null
          ? `Dernière dépense il y a ${user.lastSpendDays} jours`
          : "N'a jamais dépensé de TIME",
        recommendedAction: user.suggestion,
        entityType: "USER",
        entityId: user.userId,
      },
    });
    createdCount++;
  }

  return createdCount;
}

// ─── 8. Get Alerts ───────────────────────────────────────────────────────────

export async function getNetworkAlerts(): Promise<NetworkAlert[]> {
  const alerts = await prisma.facilitatorNetworkAlert.findMany({
    orderBy: [
      { status: "asc" }, // OPEN first
      { severity: "desc" },
      { createdAt: "desc" },
    ],
  });

  // Sort by severity within status
  return alerts.sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "OPEN" ? -1 : 1;
    }
    return (SEVERITY_ORDER[b.severity] ?? 0) - (SEVERITY_ORDER[a.severity] ?? 0);
  });
}

// ─── 9. Resolve / Dismiss Alert ──────────────────────────────────────────────

export async function resolveNetworkAlert(
  alertId: string,
  actorId: string,
  note?: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const alert = await prisma.facilitatorNetworkAlert.findUnique({
    where: { id: alertId },
  });

  if (!alert) return { success: false, error: "Alerte introuvable." };
  if (alert.status !== "OPEN") {
    return { success: false, error: "Cette alerte a déjà été traitée." };
  }

  await prisma.facilitatorNetworkAlert.update({
    where: { id: alertId },
    data: {
      status: "RESOLVED",
      resolvedById: actorId,
      resolvedAt: new Date(),
      resolutionNote: note ?? null,
    },
  });
  return { success: true };
}

export async function dismissNetworkAlert(
  alertId: string,
  actorId: string,
  note?: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const alert = await prisma.facilitatorNetworkAlert.findUnique({
    where: { id: alertId },
  });

  if (!alert) return { success: false, error: "Alerte introuvable." };
  if (alert.status !== "OPEN") {
    return { success: false, error: "Cette alerte a déjà été traitée." };
  }

  await prisma.facilitatorNetworkAlert.update({
    where: { id: alertId },
    data: {
      status: "DISMISSED",
      resolvedById: actorId,
      resolvedAt: new Date(),
      resolutionNote: note ?? null,
    },
  });
  return { success: true };
}

// ─── 10. Facilitator Notes ────────────────────────────────────────────────────

export async function addFacilitatorNote(
  entityType: string,
  entityId: string,
  content: string,
  actorId: string,
): Promise<{ success: true; note: FacilitatorNoteItem } | { success: false; error: string }> {
  if (!content || content.trim().length === 0) {
    return { success: false, error: "La note ne peut pas être vide." };
  }
  if (content.length > 1000) {
    return { success: false, error: "La note ne peut pas dépasser 1000 caractères." };
  }

  const validTypes = ["USER", "BOOKING", "URGENT_REQUEST", "COMMUNITY_POT_REQUEST", "SERVICE", "COLLECTIVE_MISSION"];
  if (!validTypes.includes(entityType)) {
    return { success: false, error: `Type d'entité invalide. Types acceptés: ${validTypes.join(", ")}` };
  }

  const note = await prisma.facilitatorNote.create({
    data: {
      authorId: actorId,
      entityType,
      entityId,
      content: content.trim(),
    },
    include: { author: { select: { name: true } } },
  });

  return {
    success: true,
    note: {
      id: note.id,
      authorId: note.authorId,
      authorName: note.author.name,
      entityType: note.entityType,
      entityId: note.entityId,
      content: note.content,
      createdAt: note.createdAt,
    },
  };
}

export async function getFacilitatorNotes(
  entityType: string,
  entityId: string,
): Promise<FacilitatorNoteItem[]> {
  const notes = await prisma.facilitatorNote.findMany({
    where: { entityType, entityId },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return notes.map((n) => ({
    id: n.id,
    authorId: n.authorId,
    authorName: n.author.name,
    entityType: n.entityType,
    entityId: n.entityId,
    content: n.content,
    createdAt: n.createdAt,
  }));
}

// ─── 11. Full Dashboard ──────────────────────────────────────────────────────

export async function getFacilitatorNetworkDashboard(): Promise<NetworkDashboard> {
  const [healthStats, blockedRequests, overusedHeroes, underusedHeroes, dormantTimeUsers, alerts] =
    await Promise.all([
      getNetworkHealthStats(),
      getBlockedRequests(),
      getOverusedHeroes(),
      getUnderusedHeroes(),
      getDormantTimeUsers(),
      getNetworkAlerts(),
    ]);

  return {
    healthStats,
    blockedRequests,
    overusedHeroes,
    underusedHeroes,
    dormantTimeUsers,
    alerts,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAlertTypeForBlocked(type: string): string {
  const map: Record<string, string> = {
    "Urgent Help": "BLOCKED_REQUEST",
    "Community Pot": "POT_REQUEST_PENDING",
    "Mission solidaire": "SOLIDARITY_REVIEW_PENDING",
    "Booking": "BOOKING_STUCK",
    "Mission collective": "COLLECTIVE_MISSION_UNDERFILLED",
  };
  return map[type] || "BLOCKED_REQUEST";
}

function getEntityTypeForBlocked(type: string): string {
  const map: Record<string, string> = {
    "Urgent Help": "URGENT_REQUEST",
    "Community Pot": "COMMUNITY_POT_REQUEST",
    "Mission solidaire": "SERVICE",
    "Booking": "BOOKING",
    "Mission collective": "COLLECTIVE_MISSION",
  };
  return map[type] || "UNKNOWN";
}

function extractEntityId(link: string): string {
  // Extract from URLs like /urgent/[id], /bookings/[id], /services/[id], /collective-missions/[id]
  const parts = link.split("/").filter(Boolean);
  return parts[parts.length - 1] || "unknown";
}
