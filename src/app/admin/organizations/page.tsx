import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminOrganizationsClient from "./AdminOrganizationsClient";

export const metadata = {
  title: "Admin organisations — TimeHeroes",
};

export default async function AdminOrganizationsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") redirect("/dashboard");

  const orgs = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { members: { where: { status: "ACTIVE" } } } },
      createdBy: { select: { name: true } },
    },
  });

  const orgsData = orgs.map((o) => ({
    id: o.id,
    name: o.name,
    slug: o.slug,
    type: o.type,
    status: o.status,
    isVerified: o.isVerified,
    city: o.city,
    memberCount: o._count.members,
    createdByName: o.createdBy?.name || "Inconnu",
    createdAt: o.createdAt.toISOString(),
  }));

  return <AdminOrganizationsClient organizations={orgsData} />;
}
