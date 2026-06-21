import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { getOrganizationBySlug } from "@/lib/organizations";
import OrganizationDetailClient from "./OrganizationDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const org = await getOrganizationBySlug(slug);
  if (!org) return { title: "Organisation introuvable — TimeHeroes" };
  return {
    title: `${org.name} — Espace Partenaire TimeHeroes`,
    description: org.shortDescription || `Découvrez ${org.name} sur TimeHeroes`,
  };
}

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const org = await getOrganizationBySlug(slug);
  if (!org) notFound();

  const orgData = {
    id: org.id,
    name: org.name,
    slug: org.slug,
    type: org.type,
    status: org.status,
    description: org.description,
    shortDescription: org.shortDescription,
    logoUrl: org.logoUrl,
    coverImageUrl: org.coverImageUrl,
    websiteUrl: org.websiteUrl,
    city: org.city,
    department: org.department,
    region: org.region,
    isVerified: org.isVerified,
    contactName: org.contactName,
    contactEmail: org.contactEmail,
    memberCount: org._count.members,
    potBalance: org.pot?.balance || 0,
    createdBy: org.createdBy,
    createdAt: org.createdAt.toISOString(),
  };

  return (
    <OrganizationDetailClient
      organization={orgData}
      user={session?.user ? { id: (session.user as any).id, name: session.user.name || "" } : null}
    />
  );
}
