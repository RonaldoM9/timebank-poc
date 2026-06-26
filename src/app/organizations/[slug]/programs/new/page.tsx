import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { checkOrganizationPermission } from "@/lib/organizations"
import ProgramCreateClient from "./ProgramCreateClient"

export default async function NewProgramPage({
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

  // Only OWNER, ADMIN can create programs
  if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
    notFound()
  }

  return (
    <ProgramCreateClient
      organization={{ id: org.id, name: org.name, slug: org.slug }}
    />
  )
}
