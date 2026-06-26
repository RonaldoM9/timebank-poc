import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { checkOrganizationPermission } from "@/lib/organizations"
import { getProgramBySlug, getProgramWellbeingStats } from "@/lib/programs"
import ProgramWellbeingClient from "./ProgramWellbeingClient"

export default async function ProgramWellbeingPage({
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

  const canViewResults = membership && ["OWNER", "ADMIN", "FACILITATOR"].includes(membership.role)

  let wellbeingStats = null
  if (canViewResults) {
    try {
      wellbeingStats = await getProgramWellbeingStats(program.id)
    } catch {}
  }

  return (
    <ProgramWellbeingClient
      program={{ id: program.id, name: program.name, slug: program.slug }}
      orgSlug={org.slug}
      wellbeingStats={wellbeingStats ? {
        summary: wellbeingStats.summary,
        comparison: {
          beforeAverage: wellbeingStats.comparison.beforeAverage,
          afterAverage: wellbeingStats.comparison.afterAverage,
          evolution: wellbeingStats.comparison.afterAverage != null && wellbeingStats.comparison.beforeAverage != null
            ? Number((wellbeingStats.comparison.afterAverage - wellbeingStats.comparison.beforeAverage).toFixed(1))
            : null,
        },
        comments: wellbeingStats.comments,
      } : null}
      canViewResults={!!canViewResults}
    />
  )
}
