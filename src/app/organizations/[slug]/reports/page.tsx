import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { checkOrganizationPermission } from "@/lib/organizations";
import { getImpactReportsForOrganization } from "@/lib/impact-reports";
import OrganizationReportsListClient from "./OrganizationReportsListClient";

export default async function OrganizationReportsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) redirect("/auth/signin");

  const org = await prisma.organization.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      city: true,
      department: true,
      isVerified: true,
      logoUrl: true,
    },
  });
  if (!org) notFound();

  const hasAccess = await checkOrganizationPermission(
    userId,
    org.id,
    "VIEW_PRIVATE_DASHBOARD"
  );
  if (!hasAccess) notFound();

  // Get user role
  const membership = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: org.id, userId } },
    select: { role: true },
  });

  const canGenerate = !!(membership && ["OWNER", "ADMIN", "FACILITATOR"].includes(membership.role));
  const canArchive = !!(membership && ["OWNER", "ADMIN"].includes(membership.role));

  const reports = await getImpactReportsForOrganization(org.id);

  const reportsData = reports.map((r) => ({
    id: r.id,
    title: r.title,
    type: r.type,
    status: r.status,
    periodStart: r.periodStart.toISOString(),
    periodEnd: r.periodEnd.toISOString(),
    generatedById: r.generatedById,
    generatedAt: r.generatedAt?.toISOString() || null,
    createdAt: r.createdAt.toISOString(),
    socialValueEstimated: r.socialValueEstimated,
    summary: r.summary,
  }));

  return (
    <OrganizationReportsListClient
      organization={{
        id: org.id,
        name: org.name,
        slug: org.slug,
        type: org.type,
        city: org.city,
        department: org.department,
        isVerified: org.isVerified,
        logoUrl: org.logoUrl,
      }}
      reports={reportsData}
      canGenerate={!!canGenerate}
      canArchive={!!canArchive}
    />
  );
}
