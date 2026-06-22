import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { checkOrganizationPermission } from "@/lib/organizations";
import OrganizationReportNewClient from "./OrganizationReportNewClient";

export default async function OrganizationReportNewPage({
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

  // Permission: OWNER, ADMIN, FACILITATOR can generate
  const membership = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: org.id, userId } },
    select: { role: true },
  });

  const canGenerate = !!(membership && ["OWNER", "ADMIN", "FACILITATOR"].includes(membership.role));
  if (!canGenerate) {
    return (
      <div className="min-h-screen bg-tb-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-tb-text-muted">Vous n'avez pas les droits pour générer un rapport.</p>
          <a href={`/organizations/${slug}/impact`} className="text-tb-accent hover:underline mt-2 inline-block">
            Retour à l'impact
          </a>
        </div>
      </div>
    );
  }

  return (
    <OrganizationReportNewClient
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
    />
  );
}
