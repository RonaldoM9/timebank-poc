import { prisma } from "./prisma";

// ─── Niveaux Hero ──────────────────────────────────────────────────────────

export const LEVEL_THRESHOLDS = [
  { level: 0, name: "Rookie Hero", minXp: 0 },
  { level: 1, name: "Active Hero", minXp: 100 },
  { level: 2, name: "Local Hero", minXp: 300 },
  { level: 3, name: "Guardian Hero", minXp: 700 },
  { level: 4, name: "Community Legend", minXp: 1500 },
] as const;

export interface HeroLevel {
  level: number;
  name: string;
  currentXp: number;
  nextLevelXp: number | null; // null si max level
  progress: number; // 0-100
}

export function getLevelFromXp(totalXp: number): HeroLevel {
  let currentLevel: (typeof LEVEL_THRESHOLDS)[number] = LEVEL_THRESHOLDS[0];
  let nextLevel: (typeof LEVEL_THRESHOLDS)[number] | null = null;

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXp >= LEVEL_THRESHOLDS[i].minXp) {
      currentLevel = LEVEL_THRESHOLDS[i];
      nextLevel = LEVEL_THRESHOLDS[i + 1] ?? null;
    }
  }

  if (!nextLevel) {
    return {
      level: currentLevel.level,
      name: currentLevel.name,
      currentXp: totalXp,
      nextLevelXp: null,
      progress: 100,
    };
  }

  const range = nextLevel.minXp - currentLevel.minXp;
  const progress = range > 0 ? ((totalXp - currentLevel.minXp) / range) * 100 : 100;

  return {
    level: currentLevel.level,
    name: currentLevel.name,
    currentXp: totalXp,
    nextLevelXp: nextLevel.minXp,
    progress: Math.min(Math.round(progress), 100),
  };
}

// ─── XP ─────────────────────────────────────────────────────────────────────

export async function awardXP(params: {
  userId: string;
  type: string;
  points: number;
  sourceType?: string;
  sourceId?: string;
  description?: string;
}): Promise<void> {
  await prisma.userXpEvent.create({
    data: {
      userId: params.userId,
      type: params.type,
      points: params.points,
      sourceType: params.sourceType ?? null,
      sourceId: params.sourceId ?? null,
      description: params.description ?? null,
    },
  });
}

export async function getTotalXp(userId: string): Promise<number> {
  const result = await prisma.userXpEvent.aggregate({
    where: { userId },
    _sum: { points: true },
  });
  return result._sum.points ?? 0;
}

// ─── Achievement Events ────────────────────────────────────────────────────

export async function createAchievement(params: {
  userId: string;
  type: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  isPublic?: boolean;
}): Promise<void> {
  await prisma.achievementEvent.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      description: params.description ?? null,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      isPublic: params.isPublic ?? true,
    },
  });
}

// ─── Badge checking ────────────────────────────────────────────────────────

async function hasBadge(userId: string, badgeCode: string): Promise<boolean> {
  const badge = await prisma.badge.findUnique({ where: { code: badgeCode } });
  if (!badge) return false;
  const existing = await prisma.userBadge.findUnique({
    where: { userId_badgeId: { userId, badgeId: badge.id } },
  });
  return existing !== null;
}

async function awardBadge(userId: string, badgeCode: string): Promise<boolean> {
  const badge = await prisma.badge.findUnique({ where: { code: badgeCode } });
  if (!badge) return false;
  if (!badge.isActive) return false;
  if (await hasBadge(userId, badgeCode)) return false;

  await prisma.userBadge.create({
    data: { userId, badgeId: badge.id },
  });

  // Award XP for earning badge
  await awardXP({
    userId,
    type: "badge_earned",
    points: 25,
    sourceType: "badge",
    sourceId: badge.id,
    description: `Badge obtenu : ${badge.name}`,
  });

  // Create achievement
  await createAchievement({
    userId,
    type: "badge_earned",
    title: `Badge débloqué : ${badge.name}`,
    description: badge.description,
    metadata: { badgeCode, badgeName: badge.name },
  });

  return true;
}

// ─── Check badge conditions ────────────────────────────────────────────────

export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const awarded: string[] = [];

  // Stats needed for badge checks
  const [missionsCompleted, bookingsProvider, ratingsReceived, timeDonated, timeEarned, categories] =
    await Promise.all([
      // Missions terminées comme provider
      prisma.booking.count({
        where: { service: { providerId: userId }, status: "completed" },
      }),
      // Toutes les réservations du provider
      prisma.booking.findMany({
        where: { service: { providerId: userId } },
        select: { status: true },
      }),
      // Avis reçus
      prisma.rating.findMany({
        where: { toId: userId },
        select: { score: true },
      }),
      // TIME donnés (type = transfer, from = user)
      prisma.transaction.aggregate({
        where: { fromId: userId, type: "transfer" },
        _sum: { amount: true },
      }),
      // TIME gagnés via release
      prisma.transaction.aggregate({
        where: { toId: userId, type: "release" },
        _sum: { amount: true },
      }),
      // Catégories distinctes de missions complétées
      prisma.booking.findMany({
        where: { service: { providerId: userId }, status: "completed" },
        include: { service: { select: { category: true } } },
      }),
    ]);

  const cancelledCount = bookingsProvider.filter((b) => b.status === "cancelled").length;
  const totalBookings = bookingsProvider.length;
  const missionsWithoutCancel = missionsCompleted; // mission completed = non-cancelled
  const positiveRatings = ratingsReceived.filter((r) => r.score >= 4).length;
  const avgRating =
    ratingsReceived.length > 0
      ? ratingsReceived.reduce((s, r) => s + r.score, 0) / ratingsReceived.length
      : 0;
  const totalTimeDonated = timeDonated._sum.amount ?? 0;
  const totalTimeEarnedVal = timeEarned._sum.amount ?? 0;
  const uniqueCategories = Array.from(new Set(categories.map((b) => b.service.category)));

  // --- Engagement badges ---

  // First Mission
  if (missionsCompleted >= 1) {
    const ok = await awardBadge(userId, "first-mission");
    if (ok) awarded.push("first-mission");
  }

  // Helping Hand
  if (missionsCompleted >= 3) {
    const ok = await awardBadge(userId, "helping-hand");
    if (ok) awarded.push("helping-hand");
  }

  // Local Hero
  if (missionsCompleted >= 10) {
    const ok = await awardBadge(userId, "local-hero");
    if (ok) awarded.push("local-hero");
  }

  // --- Solidarity badges ---

  // Time Giver
  if (totalTimeDonated >= 1) {
    const ok = await awardBadge(userId, "time-giver");
    if (ok) awarded.push("time-giver");
  }

  // Generous Hero
  if (totalTimeDonated >= 5) {
    const ok = await awardBadge(userId, "generous-hero");
    if (ok) awarded.push("generous-hero");
  }

  // --- Trust badges ---

  // Trusted Hero
  if (positiveRatings >= 5) {
    const ok = await awardBadge(userId, "trusted-hero");
    if (ok) awarded.push("trusted-hero");
  }

  // Reliable Hero
  if (missionsCompleted >= 5 && cancelledCount === 0) {
    const ok = await awardBadge(userId, "reliable-hero");
    if (ok) awarded.push("reliable-hero");
  }

  // Great Feedback
  if (ratingsReceived.length >= 5 && avgRating >= 4.5) {
    const ok = await awardBadge(userId, "great-feedback");
    if (ok) awarded.push("great-feedback");
  }

  // --- Skill badges ---

  // Tech Helper (category = numérique/tech)
  if (uniqueCategories.some((c) => /tech|numerique|numérique|digital/i.test(c))) {
    const techMissions = categories.filter((b) =>
      /tech|numerique|numérique|digital/i.test(b.service.category)
    ).length;
    if (techMissions >= 3) {
      const ok = await awardBadge(userId, "tech-helper");
      if (ok) awarded.push("tech-helper");
    }
  }

  // DIY Helper (category = bricolage)
  if (uniqueCategories.some((c) => /bricolage|diy/i.test(c))) {
    const diyMissions = categories.filter((b) =>
      /bricolage|diy/i.test(b.service.category)
    ).length;
    if (diyMissions >= 3) {
      const ok = await awardBadge(userId, "diy-helper");
      if (ok) awarded.push("diy-helper");
    }
  }

  // Learning Buddy (category = soutien scolaire / langues / career)
  if (uniqueCategories.some((c) => /scolaire|langues|career|formation|apprentissage/i.test(c))) {
    const learningMissions = categories.filter((b) =>
      /scolaire|langues|career|formation|apprentissage/i.test(b.service.category)
    ).length;
    if (learningMissions >= 3) {
      const ok = await awardBadge(userId, "learning-buddy");
      if (ok) awarded.push("learning-buddy");
    }
  }

  // Kitchen Hero
  if (uniqueCategories.some((c) => /cuisine|kitchen/i.test(c))) {
    const kitchenMissions = categories.filter((b) => /cuisine|kitchen/i.test(b.service.category)).length;
    if (kitchenMissions >= 3) {
      const ok = await awardBadge(userId, "kitchen-hero");
      if (ok) awarded.push("kitchen-hero");
    }
  }

  // Strong Arms (déménagement)
  if (uniqueCategories.some((c) => /déménagement|demenagement|force/i.test(c))) {
    const strongMissions = categories.filter((b) =>
      /déménagement|demenagement|force/i.test(b.service.category)
    ).length;
    if (strongMissions >= 3) {
      const ok = await awardBadge(userId, "strong-arms");
      if (ok) awarded.push("strong-arms");
    }
  }

  // Admin Ally
  if (uniqueCategories.some((c) => /administratif|admin/i.test(c))) {
    const adminMissions = categories.filter((b) =>
      /administratif|admin/i.test(b.service.category)
    ).length;
    if (adminMissions >= 3) {
      const ok = await awardBadge(userId, "admin-ally");
      if (ok) awarded.push("admin-ally");
    }
  }

  // Senior Ally
  if (uniqueCategories.some((c) => /senior|seniors/i.test(c))) {
    const seniorMissions = categories.filter((b) => /senior|seniors/i.test(b.service.category)).length;
    if (seniorMissions >= 3) {
      const ok = await awardBadge(userId, "senior-ally");
      if (ok) awarded.push("senior-ally");
    }
  }

  // --- Community badges ---

  // Community Builder (missions urgentes ou communautaires)
  const urgentMissions = categories.length; // all missions are in communities
  if (missionsCompleted >= 3) {
    const ok = await awardBadge(userId, "community-builder");
    if (ok) awarded.push("community-builder");
  }

  // --- Impact ---

  // Impact Maker
  const totalImpact = totalTimeEarnedVal + (totalTimeDonated * 2);
  if (totalImpact >= 20) {
    const ok = await awardBadge(userId, "impact-maker");
    if (ok) awarded.push("impact-maker");
  }

  return awarded;
}

// ─── Quests ─────────────────────────────────────────────────────────────────

export async function checkAndUpdateQuests(
  userId: string,
  triggerType: string,
  progressDelta: number,
  metadata?: { category?: string }
): Promise<void> {
  const activeQuests = await prisma.quest.findMany({
    where: { isActive: true },
    include: { badge: true },
  });

  for (const quest of activeQuests) {
    // Check if this quest's target matches the trigger
    if (!isQuestTriggeredBy(quest.targetType, triggerType, metadata)) continue;

    // Get or create user quest
    let userQuest = await prisma.userQuest.findUnique({
      where: { userId_questId: { userId, questId: quest.id } },
    });

    if (userQuest?.completed && !quest.repeatable) continue;

    if (!userQuest) {
      userQuest = await prisma.userQuest.create({
        data: { userId, questId: quest.id, progress: 0 },
      });
    }

    // Calculate actual progress based on target type
    const newProgress = await calculateQuestProgress(userId, quest.targetType, quest.targetValue);

    await prisma.userQuest.update({
      where: { id: userQuest.id },
      data: { progress: newProgress },
    });

    // Check completion
    if (newProgress >= quest.targetValue && !userQuest.completed) {
      await prisma.userQuest.update({
        where: { id: userQuest.id },
        data: { completed: true, completedAt: new Date() },
      });

      // Award XP
      if (quest.rewardXp > 0) {
        await awardXP({
          userId,
          type: "quest_complete",
          points: quest.rewardXp,
          sourceType: "quest",
          sourceId: quest.id,
          description: `Quête terminée : ${quest.title}`,
        });
      }

      // Award badge if linked
      if (quest.badgeCode) {
        const ok = await awardBadge(userId, quest.badgeCode);
        if (ok) {
          await createAchievement({
            userId,
            type: "quest_complete",
            title: `Quête terminée : ${quest.title}`,
            description: quest.description,
            metadata: { questCode: quest.code, badgeCode: quest.badgeCode },
          });
        }
      }
    }
  }
}

function isQuestTriggeredBy(
  targetType: string,
  triggerType: string,
  _metadata?: { category?: string }
): boolean {
  const mapping: Record<string, string[]> = {
    missions_completed: ["booking_complete"],
    time_donated: ["time_donated"],
    ratings_received: ["rating_received"],
    profile_complete: ["profile_complete"],
    categories_explored: ["booking_complete"],
  };
  const triggers = mapping[targetType] || [];
  return triggers.includes(triggerType);
}

async function calculateQuestProgress(
  userId: string,
  targetType: string,
  _targetValue: number
): Promise<number> {
  switch (targetType) {
    case "missions_completed": {
      return prisma.booking.count({
        where: { service: { providerId: userId }, status: "completed" },
      });
    }
    case "time_donated": {
      const result = await prisma.transaction.aggregate({
        where: { fromId: userId, type: "transfer" },
        _sum: { amount: true },
      });
      return Math.floor(result._sum.amount ?? 0);
    }
    case "ratings_received": {
      return prisma.rating.count({ where: { toId: userId } });
    }
    case "profile_complete": {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { bio: true, city: true },
      });
      if (!user) return 0;
      let score = 0;
      if (user.bio) score += 1;
      if (user.city) score += 1;
      return score;
    }
    case "categories_explored": {
      const categories = await prisma.booking.findMany({
        where: { service: { providerId: userId }, status: "completed" },
        select: { service: { select: { category: true } } },
      });
      return Array.from(new Set(categories.map((b) => b.service.category))).length;
    }
    default:
      return 0;
  }
}

// ─── Level up check ────────────────────────────────────────────────────────

export async function checkLevelUp(userId: string): Promise<HeroLevel | null> {
  const totalXp = await getTotalXp(userId);
  const level = getLevelFromXp(totalXp);

  // Check for achievement events to avoid duplicates on every call
  const existing = await prisma.achievementEvent.findFirst({
    where: {
      userId,
      type: "level_up",
      metadata: { contains: `"level":${level.level}` },
    },
  });

  if (!existing && level.level > 0) {
    await createAchievement({
      userId,
      type: "level_up",
      title: `Niveau atteint : ${level.name}`,
      description: `Tu as atteint le niveau ${level.name} avec ${level.currentXp} XP !`,
      metadata: { level: level.level, levelName: level.name, xp: level.currentXp },
    });
  }

  return level;
}

// ─── Master function ────────────────────────────────────────────────────────

export async function evaluateUserRewards(userId: string, triggerType: string, metadata?: { category?: string }): Promise<{
  xpAwarded: number;
  badgesAwarded: string[];
  level: HeroLevel;
  questsUpdated: boolean;
}> {
  // Award XP based on trigger (defined by caller)
  // Check badges
  const badgesAwarded = await checkAndAwardBadges(userId);

  // Check quests
  await checkAndUpdateQuests(userId, triggerType, 1, metadata);

  // Check level
  const level = (await checkLevelUp(userId))!;

  return {
    xpAwarded: 0, // XP is awarded by the caller before calling this function
    badgesAwarded,
    level,
    questsUpdated: true,
  };
}

// ─── Data for /rewards page ───────────────────────────────────────────────

export interface RewardsData {
  totalXp: number;
  level: HeroLevel;
  badges: {
    earned: BadgeWithDate[];
    locked: BadgeWithDate[];
  };
  quests: {
    id: string;
    code: string;
    title: string;
    description: string;
    progress: number;
    targetValue: number;
    completed: boolean;
    rewardXp: number;
    badgeCode: string | null;
  }[];
  achievements: {
    id: string;
    type: string;
    title: string;
    description: string | null;
    createdAt: string;
  }[];
  stats: {
    missionsCompleted: number;
    timeEarned: number;
    timeDonated: number;
    ratingsReceived: number;
    peopleHelped: number;
  };
}

interface BadgeWithDate {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  earnedAt: string | null;
}

export async function getRewardsData(userId: string): Promise<RewardsData> {
  const [totalXp, allBadges, userBadges, userQuests, achievements, stats] = await Promise.all([
    getTotalXp(userId),
    prisma.badge.findMany({ orderBy: { category: "asc" } }),
    prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
    }),
    prisma.userQuest.findMany({
      where: { userId },
      include: { quest: true },
    }),
    prisma.achievementEvent.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    getStats(userId),
  ]);

  const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));
  const badgeEarnedDates = new Map(userBadges.map((ub) => [ub.badgeId, ub.earnedAt.toISOString()]));

  const earned: BadgeWithDate[] = [];
  const locked: BadgeWithDate[] = [];

  for (const badge of allBadges) {
    const item: BadgeWithDate = {
      id: badge.id,
      code: badge.code,
      name: badge.name,
      description: badge.description,
      category: badge.category,
      icon: badge.icon,
      earnedAt: badgeEarnedDates.get(badge.id) ?? null,
    };
    if (earnedBadgeIds.has(badge.id)) {
      earned.push(item);
    } else {
      locked.push(item);
    }
  }

  const level = getLevelFromXp(totalXp);

  // Build quests data - include all active quests
  const activeQuests = await prisma.quest.findMany({ where: { isActive: true } });
  const userQuestMap = new Map(userQuests.map((uq) => [uq.questId, uq]));

  const questsData = activeQuests.map((quest) => {
    const uq = userQuestMap.get(quest.id);
    const progress = uq
      ? uq.completed
        ? quest.targetValue
        : uq.progress
      : 0;
    return {
      id: quest.id,
      code: quest.code,
      title: quest.title,
      description: quest.description,
      progress,
      targetValue: quest.targetValue,
      completed: uq?.completed ?? false,
      rewardXp: quest.rewardXp,
      badgeCode: quest.badgeCode,
    };
  });

  return {
    totalXp,
    level,
    badges: { earned, locked },
    quests: questsData,
    achievements: achievements.map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      description: a.description,
      createdAt: a.createdAt.toISOString(),
    })),
    stats,
  };
}

async function getStats(userId: string) {
  const [missionsCompleted, timeEarned, timeDonated, ratingsReceived, peopleHelped] =
    await Promise.all([
      prisma.booking.count({
        where: { service: { providerId: userId }, status: "completed" },
      }),
      prisma.transaction.aggregate({
        where: { toId: userId, type: "release" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { fromId: userId, type: "transfer" },
        _sum: { amount: true },
      }),
      prisma.rating.count({ where: { toId: userId } }),
      prisma.booking.groupBy({
        by: ["clientId"],
        where: { service: { providerId: userId }, status: "completed" },
      }),
    ]);

  return {
    missionsCompleted,
    timeEarned: timeEarned._sum.amount ?? 0,
    timeDonated: timeDonated._sum.amount ?? 0,
    ratingsReceived,
    peopleHelped: peopleHelped.length,
  };
}
