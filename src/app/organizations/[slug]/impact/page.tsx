import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { checkOrganizationPermission } from "@/lib/organizations";
import { getOrganizationImpactLiveStats } from "@/lib/impact-reports";
import OrganizationImpactClient from "./OrganizationImpactClient";

export default async function OrganizationImpactPage({
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

  // Default: last 12 months
  const now = new Date();
  const defaultEnd = now;
  const defaultStart = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  defaultStart.setHours(0, 0, 0, 0);

  const metrics = await getOrganizationImpactLiveStats(
    org.id,
    defaultStart,
    defaultEnd
  );

  return (
    <OrganizationImpactClient
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
      initialMetrics={metrics}
      canGenerate={!!canGenerate}
    />
  );
}
