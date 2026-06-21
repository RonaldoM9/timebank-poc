// ─── Organisation helpers — permissions, queries, impact ─────────────

import { prisma } from "@/lib/prisma";

// ─── Types ───────────────────────────────────────────────────────────

export type OrganizationPermission =
  | "VIEW_PRIVATE_DASHBOARD"
  | "MANAGE_ORGANIZATION"
  | "MANAGE_MEMBERS"
  | "CREATE_ORG_MISSION"
  | "MANAGE_ORG_POT"
  | "VERIFY_ORGANIZATION"
  | "ARCHIVE_ORGANIZATION"
  | "VIEW_ORG_POT";

const ROLE_PERMISSIONS: Record<string, OrganizationPermission[]> = {
  OWNER: [
    "VIEW_PRIVATE_DASHBOARD",
    "MANAGE_ORGANIZATION",
    "MANAGE_MEMBERS",
    "CREATE_ORG_MISSION",
    "MANAGE_ORG_POT",
    "VIEW_ORG_POT",
    "ARCHIVE_ORGANIZATION",
  ],
  ADMIN: [
    "VIEW_PRIVATE_DASHBOARD",
    "MANAGE_ORGANIZATION",
    "MANAGE_MEMBERS",
    "CREATE_ORG_MISSION",
    "MANAGE_ORG_POT",
    "VIEW_ORG_POT",
  ],
  FACILITATOR: [
    "VIEW_PRIVATE_DASHBOARD",
    "CREATE_ORG_MISSION",
    "VIEW_ORG_POT",
  ],
  MEMBER: [
    "VIEW_ORG_POT",
  ],
  VIEWER: [],
};

// ─── Permission check ────────────────────────────────────────────────

export function roleHasPermission(
  role: string,
  permission: OrganizationPermission
): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  return perms.includes(permission);
}

export async function checkOrganizationPermission(
  userId: string,
  organizationId: string,
  permission: OrganizationPermission
): Promise<boolean> {
  // Global ADMIN can do everything
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (user?.role === "ADMIN") return true;

  // Check organization membership
  const member = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: { organizationId, userId },
    },
  });

  if (!member || member.status !== "ACTIVE") return false;
  return roleHasPermission(member.role, permission);
}

export async function requireOrganizationPermission(
  userId: string,
  organizationId: string,
  permission: OrganizationPermission
): Promise<{ allowed: boolean; error?: string }> {
  const allowed = await checkOrganizationPermission(
    userId,
    organizationId,
    permission
  );
  if (!allowed) {
    return {
      allowed: false,
      error: "Vous n'avez pas les droits nécessaires pour cette action.",
    };
  }
  return { allowed: true };
}

// ─── Slug generation ─────────────────────────────────────────────────

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// ─── CRUD ────────────────────────────────────────────────────────────

export async function getOrganizations(filters?: {
  type?: string;
  city?: string;
  department?: string;
  region?: string;
  verifiedOnly?: boolean;
  status?: string;
}) {
  const where: any = {};

  if (filters?.type) where.type = filters.type;
  if (filters?.city) where.city = { contains: filters.city };
  if (filters?.department) where.department = filters.department;
  if (filters?.region) where.region = filters.region;
  if (filters?.verifiedOnly) where.isVerified = true;
  if (filters?.status) where.status = filters.status;
  else where.status = { in: ["VERIFIED", "ACTIVE"] };

  const orgs = await prisma.organization.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      pot: { select: { balance: true } },
      _count: { select: { members: { where: { status: "ACTIVE" } } } },
    },
  });

  return orgs;
}

export async function getOrganizationBySlug(slug: string) {
  return prisma.organization.findUnique({
    where: { slug },
    include: {
      createdBy: { select: { name: true, avatar: true } },
      pot: { select: { balance: true } },
      _count: {
        select: {
          members: { where: { status: "ACTIVE" } },
        },
      },
    },
  });
}

export async function getOrganizationDashboard(
  slug: string,
  userId: string
) {
  const org = await prisma.organization.findUnique({
    where: { slug },
    include: {
      pot: { select: { balance: true } },
      _count: {
        select: {
          members: { where: { status: "ACTIVE" } },
        },
      },
      members: {
        where: { userId, status: "ACTIVE" },
        select: { role: true },
      },
    },
  });
  if (!org) return null;

  // Verify user has access
  const perm = await checkOrganizationPermission(
    userId,
    org.id,
    "VIEW_PRIVATE_DASHBOARD"
  );
  if (!perm) return null;

  // Get stats
  const memberCount = org._count.members;

  // Active members (30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const activeMemberIds = (
    await prisma.organizationMember.findMany({
      where: {
        organizationId: org.id,
        status: "ACTIVE",
        user: {
          OR: [
            { transactionsFrom: { some: { createdAt: { gte: thirtyDaysAgo } } } },
            { transactionsTo: { some: { createdAt: { gte: thirtyDaysAgo } } } },
          ],
        },
      },
      select: { userId: true },
    })
  ).map((m) => m.userId);

  // Missions count
  const activeServices = await prisma.service.count({
    where: { organizationId: org.id, status: "active" },
  });
  const activeCollectiveMissions = await prisma.collectiveMission.count({
    where: {
      organizationId: org.id,
      status: { in: ["OPEN", "FULL", "IN_PROGRESS"] },
    },
  });

  const completedServices = await prisma.service.count({
    where: { organizationId: org.id, bookings: { some: { status: "completed" } } },
  });
  const completedCollectiveMissions = await prisma.collectiveMission.count({
    where: { organizationId: org.id, status: "COMPLETED" },
  });

  // TIME generated
  const collectiveTimeAgg = await prisma.collectiveMissionParticipant.aggregate({
    where: {
      mission: { organizationId: org.id },
      timeReward: { not: null },
    },
    _sum: { timeReward: true },
  });

  const potBalance = org.pot?.balance || 0;

  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    type: org.type,
    status: org.status,
    isVerified: org.isVerified,
    logoUrl: org.logoUrl,
    description: org.description,
    city: org.city,
    department: org.department,
    region: org.region,
    memberCount,
    activeMemberCount: activeMemberIds.length,
    activeMissions: activeServices + activeCollectiveMissions,
    completedMissions: completedServices + completedCollectiveMissions,
    totalTimeGenerated: collectiveTimeAgg._sum.timeReward || 0,
    potBalance,
    myRole: org.members[0]?.role || null,
  };
}

export async function getOrganizationMembers(
  organizationId: string,
  userId: string
) {
  const perm = await checkOrganizationPermission(
    userId,
    organizationId,
    "VIEW_PRIVATE_DASHBOARD"
  );
  if (!perm) return null;

  const members = await prisma.organizationMember.findMany({
    where: { organizationId },
    orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          reputation: true,
        },
      },
    },
  });

  return members;
}

export async function getUserOrganizations(userId: string) {
  const memberships = await prisma.organizationMember.findMany({
    where: { userId, status: "ACTIVE" },
    include: {
      organization: {
        include: {
          pot: { select: { balance: true } },
          _count: {
            select: { members: { where: { status: "ACTIVE" } } },
          },
        },
      },
    },
    orderBy: { organization: { name: "asc" } },
  });

  return memberships.map((m) => ({
    id: m.organization.id,
    name: m.organization.name,
    slug: m.organization.slug,
    type: m.organization.type,
    logoUrl: m.organization.logoUrl,
    city: m.organization.city,
    isVerified: m.organization.isVerified,
    memberCount: m.organization._count.members,
    potBalance: m.organization.pot?.balance || 0,
    myRole: m.role,
  }));
}

// ─── Impact stats ───────────────────────────────────────────────────

export async function getOrganizationImpactStats(organizationId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { pot: { select: { balance: true } } },
  });
  if (!org) return null;

  const memberCount = await prisma.organizationMember.count({
    where: { organizationId, status: "ACTIVE" },
  });

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const activeMembers = await prisma.organizationMember.count({
    where: {
      organizationId,
      status: "ACTIVE",
      user: {
        OR: [
          { transactionsFrom: { some: { createdAt: { gte: thirtyDaysAgo } } } },
          { transactionsTo: { some: { createdAt: { gte: thirtyDaysAgo } } } },
        ],
      },
    },
  });

  const serviceCount = await prisma.service.count({
    where: { organizationId },
  });

  const collectiveCount = await prisma.collectiveMission.count({
    where: { organizationId },
  });

  const completedServiceBookings = await prisma.booking.count({
    where: {
      service: { organizationId },
      status: "completed",
    },
  });

  const completedCollectives = await prisma.collectiveMission.count({
    where: { organizationId, status: "COMPLETED" },
  });

  const collectiveTime = await prisma.collectiveMissionParticipant.aggregate({
    where: {
      mission: { organizationId },
      timeReward: { not: null },
    },
    _sum: { timeReward: true },
  });

  const donations = await prisma.organizationTimePotTransaction.count({
    where: { organizationId, type: "DONATION" },
  });

  // Reciprocity: members who both gave and received TIME through org missions
  const memberUserIds = (
    await prisma.organizationMember.findMany({
      where: { organizationId, status: "ACTIVE" },
      select: { userId: true },
    })
  ).map((m) => m.userId);

  let reciprocityRate = 0;
  if (memberUserIds.length > 0) {
    const gaveReceived = await prisma.collectiveMissionParticipant.findMany({
      where: {
        userId: { in: memberUserIds },
        timeReward: { not: null },
      },
      select: { userId: true },
      distinct: ["userId"],
    });
    const uniqueActiveMembers = memberUserIds.length;
    reciprocityRate =
      uniqueActiveMembers > 0
        ? Math.round((gaveReceived.length / uniqueActiveMembers) * 100)
        : 0;
  }

  return {
    memberCount,
    activeMemberCount30d: activeMembers,
    missionCount: serviceCount + collectiveCount,
    completedMissionCount: completedServiceBookings + completedCollectives,
    totalTimeGenerated: collectiveTime._sum.timeReward || 0,
    organizationPotBalance: org.pot?.balance || 0,
    donationCount: donations,
    reciprocityRate,
    collectiveMissionCount: collectiveCount,
    solidarityMissionCount: await prisma.service.count({
      where: { organizationId, isSolidarityMission: true },
    }),
  };
}

// ─── Pot helpers ─────────────────────────────────────────────────────

export async function getOrganizationPot(organizationId: string) {
  const pot = await prisma.organizationTimePot.findUnique({
    where: { organizationId },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });
  return pot;
}

export async function donateToOrganizationPot(
  organizationId: string,
  userId: string,
  amount: number
) {
  if (amount <= 0) return { success: false, error: "Le montant doit être positif." };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { timeBalance: true },
  });
  if (!user || user.timeBalance < amount) {
    return { success: false, error: "Solde TIME insuffisant." };
  }

  const pot = await prisma.organizationTimePot.findUnique({
    where: { organizationId },
  });
  if (!pot) return { success: false, error: "Pot organisation introuvable." };

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { timeBalance: { decrement: amount } },
    }),
    prisma.organizationTimePot.update({
      where: { id: pot.id },
      data: { balance: { increment: amount } },
    }),
    prisma.organizationTimePotTransaction.create({
      data: {
        potId: pot.id,
        organizationId,
        type: "DONATION",
        amount,
        fromUserId: userId,
        description: `Don de ${amount} TIME au pot de l'organisation`,
      },
    }),
    prisma.transaction.create({
      data: {
        fromId: userId,
        toId: null,
        amount,
        type: "transfer",
        status: "completed",
      },
    }),
  ]);

  return { success: true, error: null };
}
