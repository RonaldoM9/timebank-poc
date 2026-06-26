import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { checkOrganizationPermission } from "@/lib/organizations"
import { getProgramBySlug } from "@/lib/programs"
import { getSeniorMissionTemplates } from "@/lib/senior-program-templates"
import ProgramMissionsClient from "./ProgramMissionsClient"

export default async function ProgramMissionsPage({
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

  const canManage = membership && ["OWNER", "ADMIN", "FACILITATOR"].includes(membership.role)
  const canView = !!membership

  // Get missions tied to this org + solidarity program category
  const missions = await prisma.service.findMany({
    where: {
      organizationId: org.id,
      isSolidarityMission: true,
      solidarityCategory: "SENIOR_PROGRAM",
    },
    include: {
      provider: { select: { id: true, name: true, avatar: true } },
      bookings: {
        include: {
          client: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  const templates = getSeniorMissionTemplates()

  // Get program participants (for filtering)
  const seniors = await prisma.programParticipant.findMany({
    where: { programId: program.id, role: "SENIOR", status: "ACTIVE" },
    include: { user: { select: { id: true, name: true } } },
  })

  const heroes = await prisma.programParticipant.findMany({
    where: { programId: program.id, role: "HERO", status: "ACTIVE" },
    include: { user: { select: { id: true, name: true } } },
  })

  return (
    <ProgramMissionsClient
      program={{ id: program.id, name: program.name, slug: program.slug }}
      orgSlug={org.slug}
      orgId={org.id}
      missions={missions.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        status: m.status,
        category: m.category,
        createdAt: m.createdAt.toISOString(),
        provider: { name: m.provider.name },
        bookingCount: m.bookings.length,
      }))}
      templates={templates.map((t) => ({
        code: t.code,
        name: t.name,
        type: t.type,
        description: t.description,
        estimatedDurationHours: t.estimatedDurationHours ?? null,
        estimatedTime: t.estimatedTime ?? null,
        category: t.category,
      }))}
      seniors={seniors.map((s) => ({ id: s.userId, name: s.user.name }))}
      heroes={heroes.map((h) => ({ id: h.userId, name: h.user.name }))}
      canManage={!!canManage}
      canView={!!canView}
    />
  )
}
