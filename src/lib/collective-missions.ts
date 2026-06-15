import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ─── Types ───────────────────────────────────────────────────────────────────

export type CollectiveMissionWithParticipants = {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string | null;
  status: string;
  organizerId: string;
  facilitatorId: string | null;
  city: string | null;
  department: string | null;
  region: string | null;
  locationLabel: string | null;
  online: boolean;
  startsAt: string | null;
  endsAt: string | null;
  durationHours: number;
  minParticipants: number;
  maxParticipants: number;
  fundingSource: string;
  communityPotAmount: number;
  isSolidarity: boolean;
  solidarityCategory: string | null;
  solidarityReason: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  organizerName: string;
  participantCount: number;
  validatedCount: number;
  userRole: string | null;  // viewer's role in this mission
  userStatus: string | null; // viewer's participation status
};

export type ParticipantDetail = {
  id: string;
  userId: string;
  userName: string;
  role: string;
  status: string;
  joinedAt: string;
  validatedAt: string | null;
  hoursValidated: number | null;
  timeReward: number | null;
  note: string | null;
};

// ─── Assert helper ───────────────────────────────────────────────────────────

async function assertUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Vous devez être connecté.");
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, role: true },
  });
  if (!user) throw new Error("Utilisateur introuvable.");
  return user;
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getCollectiveMissions(filters?: {
  type?: string;
  status?: string;
  city?: string;
  department?: string;
  region?: string;
  category?: string;
  solidarity?: boolean;
}): Promise<CollectiveMissionWithParticipants[]> {
  const where: any = {};
  if (filters?.type) where.type = filters.type;
  if (filters?.status) where.status = filters.status;
  else where.status = { notIn: ["CANCELLED"] };
  if (filters?.city) where.city = { contains: filters.city };
  if (filters?.department) where.department = filters.department;
  if (filters?.region) where.region = filters.region;
  if (filters?.category) where.category = filters.category;
  if (filters?.solidarity) where.isSolidarity = true;

  const viewer = await getServerSession(authOptions);
  const viewerUser = viewer?.user?.email
    ? await prisma.user.findUnique({ where: { email: viewer.user.email }, select: { id: true } })
    : null;
  const viewerId = viewerUser?.id;

  const missions = await prisma.collectiveMission.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      organizer: { select: { name: true } },
      participants: {
        select: { userId: true, role: true, status: true },
      },
      _count: { select: { participants: true } },
    },
  });

  return missions.map((m) => {
    const validatedCount = m.participants.filter((p) => p.status === "VALIDATED").length;
    const viewerParticipation = viewerId
      ? m.participants.find((p) => p.userId === viewerId)
      : null;

    return {
      id: m.id,
      title: m.title,
      description: m.description,
      type: m.type,
      category: m.category,
      status: m.status,
      organizerId: m.organizerId,
      facilitatorId: m.facilitatorId,
      city: m.city,
      department: m.department,
      region: m.region,
      locationLabel: m.locationLabel,
      online: m.online,
      startsAt: m.startsAt?.toISOString() ?? null,
      endsAt: m.endsAt?.toISOString() ?? null,
      durationHours: m.durationHours,
      minParticipants: m.minParticipants,
      maxParticipants: m.maxParticipants,
      fundingSource: m.fundingSource,
      communityPotAmount: m.communityPotAmount,
      isSolidarity: m.isSolidarity,
      solidarityCategory: m.solidarityCategory,
      solidarityReason: m.solidarityReason,
      completedAt: m.completedAt?.toISOString() ?? null,
      cancelledAt: m.cancelledAt?.toISOString() ?? null,
      createdAt: m.createdAt.toISOString(),
      organizerName: m.organizer.name,
      participantCount: m._count.participants,
      validatedCount,
      userRole: viewerParticipation?.role ?? null,
      userStatus: viewerParticipation?.status ?? null,
    };
  });
}

export async function getCollectiveMissionById(
  id: string,
  viewerId?: string
): Promise<{
  mission: CollectiveMissionWithParticipants;
  participants: ParticipantDetail[];
} | null> {
  const m = await prisma.collectiveMission.findUnique({
    where: { id },
    include: {
      organizer: { select: { name: true } },
      participants: {
        orderBy: { joinedAt: "asc" },
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!m) return null;

  const viewerParticipation = viewerId
    ? m.participants.find((p) => p.userId === viewerId)
    : null;

  const validatedCount = m.participants.filter((p) => p.status === "VALIDATED").length;

  return {
    mission: {
      id: m.id,
      title: m.title,
      description: m.description,
      type: m.type,
      category: m.category,
      status: m.status,
      organizerId: m.organizerId,
      facilitatorId: m.facilitatorId,
      city: m.city,
      department: m.department,
      region: m.region,
      locationLabel: m.locationLabel,
      online: m.online,
      startsAt: m.startsAt?.toISOString() ?? null,
      endsAt: m.endsAt?.toISOString() ?? null,
      durationHours: m.durationHours,
      minParticipants: m.minParticipants,
      maxParticipants: m.maxParticipants,
      fundingSource: m.fundingSource,
      communityPotAmount: m.communityPotAmount,
      isSolidarity: m.isSolidarity,
      solidarityCategory: m.solidarityCategory,
      solidarityReason: m.solidarityReason,
      completedAt: m.completedAt?.toISOString() ?? null,
      cancelledAt: m.cancelledAt?.toISOString() ?? null,
      createdAt: m.createdAt.toISOString(),
      organizerName: m.organizer.name,
      participantCount: m.participants.length,
      validatedCount,
      userRole: viewerParticipation?.role ?? null,
      userStatus: viewerParticipation?.status ?? null,
    },
    participants: m.participants.map((p) => ({
      id: p.id,
      userId: p.userId,
      userName: p.user.name,
      role: p.role,
      status: p.status,
      joinedAt: p.joinedAt.toISOString(),
      validatedAt: p.validatedAt?.toISOString() ?? null,
      hoursValidated: p.hoursValidated,
      timeReward: p.timeReward,
      note: p.note,
    })),
  };
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export async function createCollectiveMission(data: {
  title: string;
  description: string;
  type: string;
  category?: string;
  city?: string;
  department?: string;
  region?: string;
  locationLabel?: string;
  online?: boolean;
  startsAt?: string;
  endsAt?: string;
  durationHours: number;
  maxParticipants: number;
  fundingSource?: string;
  isSolidarity?: boolean;
  solidarityCategory?: string;
  solidarityReason?: string;
}) {
  const user = await assertUser();

  // Validation
  if (data.title.length < 5) throw new Error("Le titre doit faire au moins 5 caractères.");
  if (data.description.length < 20) throw new Error("La description doit faire au moins 20 caractères.");
  if (data.durationHours <= 0 || data.durationHours > 8) throw new Error("La durée doit être entre 1 et 8h.");
  if (data.maxParticipants < 2 || data.maxParticipants > 100) throw new Error("Le nombre de participants doit être entre 2 et 100.");
  if (!data.online && !data.city && !data.department) throw new Error("Pour une mission en présentiel, la ville ou le département est requis.");
  if (data.isSolidarity && !data.solidarityCategory) throw new Error("Une mission solidaire doit avoir une catégorie.");
  if (data.isSolidarity && !data.solidarityReason) throw new Error("Une mission solidaire doit avoir une justification.");

  const mission = await prisma.collectiveMission.create({
    data: {
      title: data.title,
      description: data.description,
      type: data.type,
      category: data.category ?? null,
      city: data.city ?? null,
      department: data.department ?? null,
      region: data.region ?? null,
      locationLabel: data.locationLabel ?? null,
      online: data.online ?? false,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      durationHours: data.durationHours,
      maxParticipants: data.maxParticipants,
      fundingSource: data.fundingSource ?? "NONE",
      isSolidarity: data.isSolidarity ?? false,
      solidarityCategory: data.isSolidarity ? (data.solidarityCategory ?? null) : null,
      solidarityReason: data.isSolidarity ? (data.solidarityReason ?? null) : null,
      organizerId: user.id,
    },
  });

  // Auto-add organizer as participant
  await prisma.collectiveMissionParticipant.create({
    data: {
      missionId: mission.id,
      userId: user.id,
      role: "ORGANIZER",
      status: "JOINED",
    },
  });

  return mission;
}

export async function joinCollectiveMission(missionId: string) {
  const user = await assertUser();

  const mission = await prisma.collectiveMission.findUnique({
    where: { id: missionId },
    include: { _count: { select: { participants: true } } },
  });
  if (!mission) throw new Error("Mission introuvable.");
  if (!["OPEN", "FULL"].includes(mission.status)) throw new Error("Cette mission n'accepte plus d'inscriptions.");

  const existing = await prisma.collectiveMissionParticipant.findUnique({
    where: { missionId_userId: { missionId, userId: user.id } },
  });
  if (existing) throw new Error("Tu es déjà inscrit à cette mission.");

  if (mission._count.participants >= mission.maxParticipants) {
    throw new Error("Cette mission a atteint son nombre maximum de participants.");
  }

  await prisma.collectiveMissionParticipant.create({
    data: {
      missionId,
      userId: user.id,
      role: "CONTRIBUTOR",
      status: "JOINED",
    },
  });

  // Auto-set FULL if max reached
  const count = await prisma.collectiveMissionParticipant.count({ where: { missionId } });
  if (count >= mission.maxParticipants && mission.status === "OPEN") {
    await prisma.collectiveMission.update({
      where: { id: missionId },
      data: { status: "FULL" },
    });
  }
}

export async function leaveCollectiveMission(missionId: string) {
  const user = await assertUser();

  const mission = await prisma.collectiveMission.findUnique({
    where: { id: missionId },
    select: { status: true },
  });
  if (!mission) throw new Error("Mission introuvable.");
  if (["COMPLETED", "ATTENDANCE_PENDING", "IN_PROGRESS"].includes(mission.status)) {
    throw new Error("Impossible de quitter une mission en cours ou terminée.");
  }

  const participant = await prisma.collectiveMissionParticipant.findUnique({
    where: { missionId_userId: { missionId, userId: user.id } },
  });
  if (!participant) throw new Error("Tu n'es pas inscrit à cette mission.");
  if (participant.role === "ORGANIZER") throw new Error("L'organisateur ne peut pas quitter la mission. Annule-la plutôt.");

  await prisma.collectiveMissionParticipant.update({
    where: { id: participant.id },
    data: { status: "CANCELLED" },
  });
}

export async function cancelCollectiveMission(missionId: string) {
  const user = await assertUser();
  const mission = await prisma.collectiveMission.findUnique({
    where: { id: missionId },
    select: { organizerId: true, facilitatorId: true, status: true },
  });
  if (!mission) throw new Error("Mission introuvable.");
  if (mission.status === "COMPLETED") throw new Error("Une mission terminée ne peut pas être annulée.");

  const isAuthorized = user.role === "ADMIN" || user.id === mission.organizerId || user.id === mission.facilitatorId;
  if (!isAuthorized) throw new Error("Seul l'organisateur ou un facilitateur peut annuler.");

  await prisma.collectiveMission.update({
    where: { id: missionId },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });
}

export async function validateParticipant(
  missionId: string,
  participantId: string,
  hoursValidated?: number
) {
  const user = await assertUser();
  const mission = await prisma.collectiveMission.findUnique({
    where: { id: missionId },
    select: { organizerId: true, facilitatorId: true, status: true, durationHours: true },
  });
  if (!mission) throw new Error("Mission introuvable.");
  if (["COMPLETED", "CANCELLED"].includes(mission.status)) throw new Error("Mission déjà terminée ou annulée.");

  const isAuthorized = user.role === "ADMIN" || user.id === mission.organizerId || user.id === mission.facilitatorId;
  if (!isAuthorized) throw new Error("Seul l'organisateur ou un facilitateur peut valider des présences.");

  const participant = await prisma.collectiveMissionParticipant.findUnique({
    where: { id: participantId },
  });
  if (!participant) throw new Error("Participant introuvable.");
  if (participant.status !== "JOINED") throw new Error("Ce participant n'est pas en statut JOINED.");

  const h = hoursValidated ?? mission.durationHours;
  if (h <= 0 || h > mission.durationHours) throw new Error(`Les heures validées doivent être entre 1 et ${mission.durationHours}.`);

  await prisma.collectiveMissionParticipant.update({
    where: { id: participantId },
    data: {
      status: "VALIDATED",
      validatedAt: new Date(),
      validatedById: user.id,
      hoursValidated: h,
    },
  });
}

export async function markParticipantNoShow(missionId: string, participantId: string) {
  const user = await assertUser();
  const mission = await prisma.collectiveMission.findUnique({
    where: { id: missionId },
    select: { organizerId: true, facilitatorId: true, status: true },
  });
  if (!mission) throw new Error("Mission introuvable.");
  if (["COMPLETED", "CANCELLED"].includes(mission.status)) throw new Error("Mission déjà terminée ou annulée.");

  const isAuthorized = user.role === "ADMIN" || user.id === mission.organizerId || user.id === mission.facilitatorId;
  if (!isAuthorized) throw new Error("Non autorisé.");

  const participant = await prisma.collectiveMissionParticipant.findUnique({
    where: { id: participantId },
  });
  if (!participant) throw new Error("Participant introuvable.");
  if (participant.status !== "JOINED") throw new Error("Le participant n'est pas en statut JOINED.");

  await prisma.collectiveMissionParticipant.update({
    where: { id: participantId },
    data: { status: "NO_SHOW", validatedAt: new Date(), validatedById: user.id },
  });
}

export async function completeCollectiveMission(missionId: string) {
  const user = await assertUser();
  const mission = await prisma.collectiveMission.findUnique({
    where: { id: missionId },
    include: {
      _count: { select: { participants: true } },
      participants: { where: { status: "VALIDATED" }, include: { user: { select: { id: true, name: true } } } },
    },
  });
  if (!mission) throw new Error("Mission introuvable.");
  if (mission.status === "COMPLETED") throw new Error("Cette mission est déjà terminée.");
  if (mission.status === "CANCELLED") throw new Error("Cette mission est annulée.");

  const isAuthorized = user.role === "ADMIN" || user.id === mission.organizerId || user.id === mission.facilitatorId;
  if (!isAuthorized) throw new Error("Seul l'organisateur ou un facilitateur peut compléter une mission.");

  const validatedParticipants = mission.participants;
  if (validatedParticipants.length === 0) throw new Error("Au moins un participant doit être validé.");

  if (mission.fundingSource === "COMMUNITY_POT") {
    // Calculate budget: durationHours × validatedCount
    const totalBudget = mission.durationHours * validatedParticipants.length;

    const pot = await prisma.communityPot.findFirst({ orderBy: { createdAt: "asc" } });
    if (!pot) throw new Error("Pot commun introuvable.");
    if (pot.balance < totalBudget) {
      throw new Error(`Solde du pot commun insuffisant. Besoin de ${totalBudget} TIME, disponible : ${pot.balance} TIME.`);
    }

    // Atomic transaction: debit pot, credit users, create transactions
    await prisma.$transaction(async (tx) => {
      // Debit pot
      await tx.communityPot.update({
        where: { id: pot.id },
        data: { balance: { decrement: totalBudget } },
      });

      // Create pot transaction
      await tx.communityPotTransaction.create({
        data: {
          potId: pot.id,
          userId: user.id,
          amount: totalBudget,
          type: "COLLECTIVE_MISSION_FUNDING",
          reason: `Financement mission collective: ${mission.title}`,
        },
      });

      // Reward each validated participant
      for (const p of validatedParticipants) {
        const reward = mission.durationHours;

        // Credit user's timeBalance
        await tx.user.update({
          where: { id: p.userId },
          data: { timeBalance: { increment: reward } },
        });

        // Create Transaction record
        const txn = await tx.transaction.create({
          data: {
            fromId: null,
            toId: p.userId,
            amount: reward,
            type: "collective_mission_reward",
            status: "completed",
          },
        });

        // Update participant with reward info
        await tx.collectiveMissionParticipant.update({
          where: { id: p.id },
          data: {
            timeReward: reward,
            transactionId: txn.id,
          },
        });
      }

      // Mark mission completed
      await tx.collectiveMission.update({
        where: { id: missionId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          communityPotAmount: totalBudget,
        },
      });
    });
  } else {
    // NONE funding — just mark completed, no distribution
    const reward = mission.durationHours;
    for (const p of validatedParticipants) {
      await prisma.collectiveMissionParticipant.update({
        where: { id: p.id },
        data: { timeReward: reward },
      });
    }
    await prisma.collectiveMission.update({
      where: { id: missionId },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
  }
}
