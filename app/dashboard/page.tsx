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
    select: { id: true, name: true, timeBalance: true, walletAddress: true, reputation: true, city: true, department: true, serviceRadiusKm: true, availableOnline: true },
  });

  if (!user) redirect("/auth/signin");

  const services = await prisma.service.findMany({
    where: { providerId: user.id },
    select: { id: true, status: true },
  });

  const activeCount = services.filter((s) => s.status === "active").length;
  const inactiveCount = services.filter((s) => s.status === "inactive").length;

  const [myBookingsCount, missionsCount, recentTransactions, ratingsReceivedCount] = await Promise.all([
    prisma.booking.count({ where: { clientId: user.id, status: "pending" } }),
    prisma.booking.count({
      where: { service: { providerId: user.id }, status: "pending" },
    }),
    prisma.transaction.findMany({
      where: {
        OR: [{ fromId: user.id }, { toId: user.id }],
        type: { in: ["escrow", "release", "refund"] },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.rating.count({ where: { toId: user.id } }),
  ]);

  return (
    <DashboardClient
      user={{ ...user, reputation: user.reputation }}
      activeServices={activeCount}
      inactiveServices={inactiveCount}
      myBookingsCount={myBookingsCount}
      missionsCount={missionsCount}
      recentTransactions={recentTransactions.map((tx) => ({
        ...tx,
        createdAt: tx.createdAt.toISOString(),
      }))}
      ratingsReceivedCount={ratingsReceivedCount}
    />
  );
}
