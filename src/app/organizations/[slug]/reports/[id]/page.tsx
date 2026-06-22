import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { checkOrganizationPermission } from "@/lib/organizations";
import { getImpactReportById } from "@/lib/impact-reports";
import OrganizationReportViewClient from "./OrganizationReportViewClient";

export default async function OrganizationReportViewPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) redirect("/auth/signin");

  const org = await prisma.organization.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true },
  });
  if (!org) notFound();

  const hasAccess = await checkOrganizationPermission(
    userId,
    org.id,
    "VIEW_PRIVATE_DASHBOARD"
  );
  if (!hasAccess) notFound();

  const report = await getImpactReportById(id);
  if (!report || report.organizationId !== org.id) notFound();

  // Get user role
  const membership = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: org.id, userId } },
    select: { role: true },
  });

  const canArchive = !!(membership && ["OWNER", "ADMIN"].includes(membership.role));

  return (
    <OrganizationReportViewClient
      organization={{ id: org.id, name: org.name, slug: org.slug }}
      report={{
        id: report.id,
        title: report.title,
        type: report.type,
        status: report.status,
        periodStart: report.periodStart.toISOString(),
        periodEnd: report.periodEnd.toISOString(),
        summary: report.summary,
        metrics: report.metrics,
        highlights: report.highlights,
        risks: report.risks,
        recommendations: report.recommendations,
        socialValueHourlyRate: report.socialValueHourlyRate,
        socialValueEstimated: report.socialValueEstimated,
        visibility: report.visibility,
        generatedById: report.generatedById,
        generatedAt: report.generatedAt?.toISOString() || null,
        createdAt: report.createdAt.toISOString(),
      }}
      canArchive={canArchive}
    />
  );
}
