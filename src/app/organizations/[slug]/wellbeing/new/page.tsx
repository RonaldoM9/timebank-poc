import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { checkOrganizationPermission } from "@/lib/organizations";
import WellbeingSurveyForm from "./WellbeingSurveyForm";

export default async function NewWellbeingPage({
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

  const membership = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: org.id, userId } },
    select: { role: true },
  });
  if (!membership) notFound(); // must be member

  return (
    <WellbeingSurveyForm
      organization={{ id: org.id, name: org.name, slug: org.slug }}
    />
  );
}
