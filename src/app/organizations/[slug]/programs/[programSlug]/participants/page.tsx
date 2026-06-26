import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { checkOrganizationPermission } from "@/lib/organizations"
import { getProgramBySlug, getProgramParticipants } from "@/lib/programs"
import ProgramParticipantsClient from "./ProgramParticipantsClient"

export default async function ProgramParticipantsPage({
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

  const participants = await getProgramParticipants(program.id)

  // Get all org members to allow adding them as participants
  const orgMembers = canManage
    ? await prisma.organizationMember.findMany({
        where: { organizationId: org.id, status: "ACTIVE" },
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
        },
      })
    : []

  const existingParticipantUserIds = new Set(participants.map((p) => p.userId))

  return (
    <ProgramParticipantsClient
      program={{ id: program.id, name: program.name, slug: program.slug }}
      orgSlug={org.slug}
      participants={participants.map((p) => ({
        id: p.id,
        userId: p.userId,
        role: p.role,
        status: p.status,
        joinedAt: p.joinedAt.toISOString(),
        removedAt: p.removedAt?.toISOString() || null,
        user: {
          name: p.user.name,
          email: p.user.email,
          avatar: p.user.avatar,
        },
      }))}
      availableUsers={orgMembers
        .filter((m) => !existingParticipantUserIds.has(m.userId))
        .map((m) => ({
          id: m.userId,
          name: m.user.name,
          email: m.user.email,
        }))}
      canManage={!!canManage}
    />
  )
}
