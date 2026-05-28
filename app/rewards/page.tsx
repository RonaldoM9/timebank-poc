import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRewardsData } from "@/lib/gamification";
import RewardsClient from "./RewardsClient";

export default async function RewardsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true },
  });

  if (!user) redirect("/auth/signin");

  const rewardsData = await getRewardsData(user.id);

  return (
    <RewardsClient
      userName={user.name}
      totalXp={rewardsData.totalXp}
      level={rewardsData.level}
      badges={rewardsData.badges}
      quests={rewardsData.quests}
      achievements={rewardsData.achievements}
      stats={rewardsData.stats}
    />
  );
}
