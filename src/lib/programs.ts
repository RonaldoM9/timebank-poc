// ─── Programmes organisation — business logic ─────────────────────────

import { prisma } from "./prisma"
import { slugify } from "./utils"
import type { ProgramType, ProgramStatus, ProgramParticipantRole } from "./program-labels"

// ─── Types ────────────────────────────────────────────────────────────

export interface CreateProgramInput {
  name: string
  type: ProgramType
  description?: string | null
  shortDescription?: string | null
  startDate?: Date | null
  endDate?: Date | null
  targetAudience?: string | null
  goalsJson?: string | null
  settingsJson?: string | null
}

export interface ProgramStats {
  seniorCount: number
  heroCount: number
  caregiverCount: number
  facilitatorCount: number
  totalParticipants: number
  missionCount: number
  completedMissionCount: number
  totalHours: number
  totalTime: number
  wellbeingAverage: number | null
  wellbeingEvolution: number | null
}

// ─── Core CRUD ─────────────────────────────────────────────────────────

export async function createOrganizationProgram(
  organizationId: string,
  input: CreateProgramInput,
  createdById: string
) {
  const baseSlug = slugify(input.name)
  // Ensure unique slug within org
  const existing = await prisma.organizationProgram.findUnique({
    where: { organizationId_slug: { organizationId, slug: baseSlug } },
  })
  const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug

  return prisma.organizationProgram.create({
    data: {
      organizationId,
      name: input.name,
      slug,
      type: input.type,
      status: "DRAFT",
      description: input.description ?? null,
      shortDescription: input.shortDescription ?? null,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      targetAudience: input.targetAudience ?? null,
      goalsJson: input.goalsJson ?? null,
      settingsJson: input.settingsJson ?? null,
      createdById,
    },
    include: {
      organization: { select: { name: true, slug: true } },
      _count: { select: { participants: true } },
    },
  })
}

export const SENIOR_SOCIAL_LINK_TEMPLATE: CreateProgramInput = {
  name: "Programme Lien Social Seniors",
  type: "SENIOR_SOCIAL_LINK" as ProgramType,
  shortDescription:
    "Un programme de 12 semaines pour réduire l'isolement des seniors grâce à l'entraide locale.",
  description:
    "Le programme Lien Social Seniors permet à une organisation locale de mobiliser des habitants, Heroes, aidants et partenaires autour de seniors isolés. Il structure des missions simples : visites conviviales, aide numérique, accompagnement aux courses, appels réguliers, cafés conversation et cercles de soutien. Le programme suit les missions réalisées, les heures mobilisées, les TIME distribués et l'évolution du lien social via des questionnaires d'impact humain.",
  targetAudience:
    "Seniors isolés, aidants, habitants volontaires, associations locales",
  goalsJson: JSON.stringify([
    "Réduire l'isolement social",
    "Créer des liens de confiance dans le quartier",
    "Aider les seniors dans les usages numériques simples",
    "Mobiliser des habitants volontaires",
    "Mesurer l'impact humain avant et après le programme",
    "Produire un rapport d'impact exploitable par l'organisation",
  ]),
  settingsJson: JSON.stringify({
    recommendedDurationWeeks: 12,
    defaultSocialValueHourlyRate: 15,
    allowWellbeingSurveys: true,
    allowImpactReports: true,
    allowMissionTemplates: true,
  }),
}

export async function createSeniorProgramFromTemplate(
  organizationId: string,
  createdById: string
) {
  return createOrganizationProgram(organizationId, SENIOR_SOCIAL_LINK_TEMPLATE, createdById)
}

export async function getProgramsForOrganization(organizationId: string) {
  return prisma.organizationProgram.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { participants: true } },
      organization: { select: { name: true, slug: true } },
    },
  })
}

export async function getProgramBySlug(organizationId: string, slug: string) {
  return prisma.organizationProgram.findUnique({
    where: { organizationId_slug: { organizationId, slug } },
    include: {
      organization: { select: { name: true, slug: true } },
      _count: { select: { participants: true } },
    },
  })
}

export async function getProgramById(programId: string) {
  return prisma.organizationProgram.findUnique({
    where: { id: programId },
    include: {
      organization: { select: { name: true, slug: true } },
      _count: { select: { participants: true } },
    },
  })
}

export async function updateProgramStatus(
  programId: string,
  status: ProgramStatus
) {
  return prisma.organizationProgram.update({
    where: { id: programId },
    data: { status },
  })
}

export async function archiveProgram(programId: string) {
  return updateProgramStatus(programId, "ARCHIVED")
}

// ─── Participants ──────────────────────────────────────────────────────

export async function addProgramParticipant(
  programId: string,
  userId: string,
  role: ProgramParticipantRole
) {
  return prisma.programParticipant.create({
    data: { programId, userId, role },
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true } },
    },
  })
}

export async function removeProgramParticipant(programId: string, userId: string) {
  return prisma.programParticipant.update({
    where: { programId_userId: { programId, userId } },
    data: { status: "REMOVED", removedAt: new Date() },
  })
}

export async function pauseProgramParticipant(programId: string, userId: string) {
  return prisma.programParticipant.update({
    where: { programId_userId: { programId, userId } },
    data: { status: "PAUSED" },
  })
}

export async function getProgramParticipants(programId: string) {
  return prisma.programParticipant.findMany({
    where: { programId },
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true } },
    },
    orderBy: { joinedAt: "desc" },
  })
}

export async function getProgramParticipantsByRole(
  programId: string,
  role: ProgramParticipantRole
) {
  return prisma.programParticipant.findMany({
    where: { programId, role, status: "ACTIVE" },
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true } },
    },
  })
}

// ─── Missions ──────────────────────────────────────────────────────────

export async function createProgramMissionFromTemplate(
  organizationId: string,
  programId: string | undefined,
  template: {
    title: string
    description: string
    category: string
    estimatedDurationHours?: number
    estimatedTime?: number
  },
  providerId: string
) {
  // Create a Service (solidarity mission) linked to this program
  return prisma.service.create({
    data: {
      title: template.title,
      description: template.description,
      category: template.category,
      ratePerHour: template.estimatedTime ?? 2,
      providerId,
      organizationId,
      isSolidarityMission: true,
      solidarityCategory: "SENIOR_PROGRAM",
      solidarityStatus: "CLASSIC",
    },
  })
}

// ─── Stats ─────────────────────────────────────────────────────────────

export async function getProgramImpactStats(programId: string): Promise<ProgramStats> {
  const program = await prisma.organizationProgram.findUnique({
    where: { id: programId },
    include: {
      participants: {
        where: { status: "ACTIVE" },
        select: { role: true },
      },
    },
  })

  if (!program) {
    throw new Error("Program not found")
  }

  const participants = program.participants

  // Count missions tied to this org (we filter by org since Service doesn't have programId yet)
  const orgMissions = await prisma.service.findMany({
    where: {
      organizationId: program.organizationId,
      isSolidarityMission: true,
      solidarityCategory: "SENIOR_PROGRAM",
    },
    select: { status: true, ratePerHour: true },
  })

  const missionCount = orgMissions.length
  const completedMissionCount = orgMissions.filter((m) => m.status === "completed").length
  const totalHours = orgMissions.reduce((sum, m) => sum + m.ratePerHour, 0)
  const totalTime = totalHours // 1h = 1 TIME for solidarity missions

  return {
    seniorCount: participants.filter((p) => p.role === "SENIOR").length,
    heroCount: participants.filter((p) => p.role === "HERO").length,
    caregiverCount: participants.filter((p) => p.role === "CAREGIVER").length,
    facilitatorCount: participants.filter((p) => p.role === "FACILITATOR").length,
    totalParticipants: participants.length,
    missionCount,
    completedMissionCount,
    totalHours,
    totalTime,
    wellbeingAverage: null,
    wellbeingEvolution: null,
  }
}

export async function getProgramWellbeingStats(programId: string) {
  const { getWellbeingResultsForProgram, getWellbeingComparisonBeforeAfter, getAnonymousWellbeingComments } =
    await import("./wellbeing")

  const [summary, comparison, comments] = await Promise.all([
    getWellbeingResultsForProgram(programId),
    getWellbeingComparisonBeforeAfter(undefined, programId),
    getAnonymousWellbeingComments(undefined, programId),
  ])

  return { summary, comparison, comments }
}
