import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OrganizationSettingsClient from "./OrganizationSettingsClient";

export default async function OrganizationSettingsPage({
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
      description: true,
      shortDescription: true,
      websiteUrl: true,
      contactName: true,
      contactEmail: true,
      logoUrl: true,
    },
  });
  if (!org) notFound();

  return <OrganizationSettingsClient organization={org} />;
}
