import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OrganizationMissionNewClient from "./OrganizationMissionNewClient";

export default async function OrganizationMissionNewPage({
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
    select: { id: true, name: true },
  });
  if (!org) notFound();

  return (
    <OrganizationMissionNewClient
      organizationId={org.id}
      organizationSlug={slug}
      organizationName={org.name}
    />
  );
}
