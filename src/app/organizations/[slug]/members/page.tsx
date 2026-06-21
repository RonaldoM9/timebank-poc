import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getOrganizationMembers } from "@/lib/organizations";
import OrganizationMembersClient from "./OrganizationMembersClient";

export default async function OrganizationMembersPage({
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

  const members = await getOrganizationMembers(org.id, userId);
  if (!members) notFound(); // no access

  const membersData = members.map((m) => ({
    id: m.id,
    userId: m.user.id,
    name: m.user.name,
    email: m.user.email,
    avatar: m.user.avatar,
    reputation: m.user.reputation,
    role: m.role,
    status: m.status,
    joinedAt: m.joinedAt.toISOString(),
  }));

  return (
    <OrganizationMembersClient
      organization={{ id: org.id, name: org.name, slug: org.slug }}
      members={membersData}
    />
  );
}
