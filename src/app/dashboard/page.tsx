import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, timeBalance: true, city: true },
  });
  if (!user) redirect("/auth/signin");

  const [pendingCount, recentTransactions, serviceCount] = await Promise.all([
    prisma.booking.count({
      where: {
        OR: [
          { clientId: user.id, status: "pending" },
          { service: { providerId: user.id }, status: "pending" },
        ],
      },
    }),
    prisma.transaction.findMany({
      where: { OR: [{ fromId: user.id }, { toId: user.id }] },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, type: true, amount: true, createdAt: true },
    }),
    prisma.service.count({
      where: { status: "active", providerId: { not: user.id } },
    }),
  ]);

  return (
    <DashboardClient
      user={{ id: user.id, name: user.name, timeBalance: user.timeBalance, city: user.city }}
      pendingCount={pendingCount}
      recentTransactions={recentTransactions.map((tx) => ({
        ...tx,
        createdAt: tx.createdAt.toISOString(),
      }))}
      serviceCount={serviceCount}
      walletBalance={user.timeBalance}
    />
  );
}
