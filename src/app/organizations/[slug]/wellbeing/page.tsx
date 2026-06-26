import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { checkOrganizationPermission } from "@/lib/organizations";
import { getWellbeingResultsForOrganization, getAnonymousWellbeingComments } from "@/lib/wellbeing";
import WellbeingResultsClient from "./WellbeingResultsClient";

export default async function OrganizationWellbeingPage({
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
    select: { id: true, name: true, slug: true },
  });
  if (!org) notFound();

  const hasAccess = await checkOrganizationPermission(
    userId,
    org.id,
    "VIEW_PRIVATE_DASHBOARD"
  );
  if (!hasAccess) notFound();

  const membership = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: org.id, userId } },
    select: { role: true },
  });

  const canSurvey = !!membership; // any member can answer
  const canViewResults = membership && ["OWNER", "ADMIN", "FACILITATOR"].includes(membership.role);

  let summary = null;
  let comments: string[] = [];
  if (canViewResults) {
    [summary, comments] = await Promise.all([
      getWellbeingResultsForOrganization(org.id),
      getAnonymousWellbeingComments(org.id),
    ]);
  }

  return (
    <WellbeingResultsClient
      organization={{ id: org.id, name: org.name, slug: org.slug }}
      summary={summary ? {
        totalResponses: summary.totalResponses,
        averageScore: Math.round(summary.averageScore * 10) / 10,
        beforeAverage: summary.beforeAverage ? Math.round(summary.beforeAverage) : null,
        afterAverage: summary.afterAverage ? Math.round(summary.afterAverage) : null,
        evolution: summary.evolution,
        isolationAvg: Math.round(summary.isolationAvg * 10) / 10,
        supportAvg: Math.round(summary.supportAvg * 10) / 10,
        usefulnessAvg: Math.round(summary.usefulnessAvg * 10) / 10,
        trustAvg: Math.round(summary.trustAvg * 10) / 10,
        contributionAvg: Math.round(summary.contributionAvg * 10) / 10,
      } : null}
      comments={comments}
      canSurvey={canSurvey}
      canViewResults={canViewResults ?? false}
    />
  );
}
