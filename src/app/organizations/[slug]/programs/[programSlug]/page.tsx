import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { checkOrganizationPermission } from "@/lib/organizations"
import { getProgramBySlug, getProgramImpactStats, getProgramWellbeingStats } from "@/lib/programs"
import ProgramDetailClient from "./ProgramDetailClient"

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ slug: string; programSlug: string }>
}) {
  const { slug, programSlug } = await params
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  if (!userId) redirect("/auth/signin")

  const org = await prisma.organization.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true },
  })
  if (!org) notFound()

  const hasAccess = await checkOrganizationPermission(userId, org.id, "VIEW_PRIVATE_DASHBOARD")
  if (!hasAccess) notFound()

  const program = await getProgramBySlug(org.id, programSlug)
  if (!program) notFound()

  const membership = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: org.id, userId } },
    select: { role: true },
  })

  const canManage = membership && ["OWNER", "ADMIN"].includes(membership.role)
  const canFacilitate = membership && ["OWNER", "ADMIN", "FACILITATOR"].includes(membership.role)

  // Get stats
  const stats = await getProgramImpactStats(program.id)

  // Get wellbeing
  let wellbeingStats = null
  if (canFacilitate) {
    try {
      wellbeingStats = await getProgramWellbeingStats(program.id)
    } catch {
      // wellbeing not available
    }
  }

  const programData = {
    id: program.id,
    name: program.name,
    slug: program.slug,
    type: program.type,
    status: program.status,
    description: program.description,
    shortDescription: program.shortDescription,
    startDate: program.startDate?.toISOString() || null,
    endDate: program.endDate?.toISOString() || null,
    targetAudience: program.targetAudience,
    goalsJson: program.goalsJson,
    settingsJson: program.settingsJson,
    createdAt: program.createdAt.toISOString(),
    organization: program.organization,
    participantCount: program._count.participants,
  }

  return (
    <ProgramDetailClient
      program={programData}
      orgSlug={org.slug}
      orgName={org.name}
      stats={stats}
      wellbeingStats={wellbeingStats ? {
        summary: wellbeingStats.summary,
        comparison: {
          beforeAverage: wellbeingStats.comparison.beforeAverage,
          afterAverage: wellbeingStats.comparison.afterAverage,
          evolution: wellbeingStats.comparison.afterAverage != null && wellbeingStats.comparison.beforeAverage != null
            ? Number((wellbeingStats.comparison.afterAverage - wellbeingStats.comparison.beforeAverage).toFixed(1))
            : null,
        },
        commentCount: wellbeingStats.comments.length,
      } : null}
      canManage={!!canManage}
      canFacilitate={!!canFacilitate}
    />
  )
}
