import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OrganizationPotClient from "./OrganizationPotClient";

export default async function OrganizationPotPage({
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
      pot: {
        select: {
          balance: true,
          transactions: {
            orderBy: { createdAt: "desc" },
            take: 50,
          },
        },
      },
    },
  });
  if (!org) notFound();

  // Fetch user's role in this organization
  const membership = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: org.id, userId } },
    select: { role: true, status: true },
  });
  let myRole = membership?.status === "ACTIVE" ? membership.role : null;
  // ADMIN global bypass — peut gérer même sans être membre
  if (!myRole && (session?.user as any)?.role === "ADMIN") {
    myRole = "ADMIN";
  }

  const potBalance = org.pot?.balance || 0;
  const rawTransactions = org.pot?.transactions || [];

  // Fetch user names for all fromUserIds
  const userIds = rawTransactions
    .map((tx) => tx.fromUserId)
    .filter(Boolean) as string[];
  const users = userIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true },
      })
    : [];
  const userMap = new Map(users.map((u) => [u.id, u.name]));

  const transactions = rawTransactions.map((tx) => ({
    id: tx.id,
    type: tx.type,
    amount: tx.amount,
    description: tx.description,
    fromUserId: tx.fromUserId,
    createdAt: tx.createdAt.toISOString(),
    fromUser: tx.fromUserId
      ? { name: userMap.get(tx.fromUserId) || "Utilisateur inconnu" }
      : null,
  }));

  return (
    <OrganizationPotClient
      organizationId={org.id}
      organizationSlug={org.slug}
      organizationName={org.name}
      potBalance={potBalance}
      transactions={transactions}
      myRole={myRole}
    />
  );
}
