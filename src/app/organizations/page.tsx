import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrganizations } from "@/lib/organizations";
import OrganizationsClient from "./OrganizationsClient";

export const metadata = {
  title: "Organisations partenaires — TimeHeroes",
  description:
    "Découvrez les mairies, associations, écoles, bailleurs et entreprises qui mobilisent leurs communautés avec TimeHeroes.",
};

export default async function OrganizationsPage() {
  const session = await getServerSession(authOptions);
  const orgs = await getOrganizations();

  const orgsData = orgs.map((o) => ({
    id: o.id,
    name: o.name,
    slug: o.slug,
    type: o.type,
    shortDescription: o.shortDescription,
    city: o.city,
    department: o.department,
    region: o.region,
    isVerified: o.isVerified,
    status: o.status,
    logoUrl: o.logoUrl,
    potBalance: o.pot?.balance || 0,
    memberCount: o._count.members,
  }));

  return (
    <OrganizationsClient
      organizations={orgsData}
      isAuthenticated={!!session?.user}
    />
  );
}
