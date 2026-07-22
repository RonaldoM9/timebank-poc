import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { checkOrganizationPermission } from "@/lib/organizations"
import { getProgramsForOrganization } from "@/lib/programs"
import ProgramsListClient from "./ProgramsListClient"

export default async function ProgramsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
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

  const membership = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: org.id, userId } },
    select: { role: true },
  })

  const programs = await getProgramsForOrganization(org.id)

  const canManage = membership && ["OWNER", "ADMIN", "FACILITATOR"].includes(membership.role)

  return (
    <ProgramsListClient
      organization={{ id: org.id, name: org.name, slug: org.slug }}
      programs={programs.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        type: p.type,
        status: p.status,
        shortDescription: p.shortDescription,
        createdAt: p.createdAt.toISOString(),
        participantCount: p._count.participants,
      }))}
      canManage={!!canManage}
      isFacilitator={membership?.role === "FACILITATOR"}
    />
  )
}
