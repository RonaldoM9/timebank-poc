import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPublicProfile } from "@/lib/profile";
import { getTotalXp, getLevelFromXp } from "@/lib/gamification";
import ProfileClient from "./ProfileClient";

interface TopBadge {
  code: string;
  name: string;
  icon: string;
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const profile = await getPublicProfile(id);
  if (!profile) notFound();

  const totalXp = await getTotalXp(id);
  const heroLevel = getLevelFromXp(totalXp);

  // Fetch top 3 earned badges
  const userBadges = await prisma.userBadge.findMany({
    where: { userId: id },
    include: { badge: true },
    orderBy: { earnedAt: "desc" },
    take: 3,
  });

  const topBadges: TopBadge[] = userBadges.map((ub) => ({
    code: ub.badge.code,
    name: ub.badge.name,
    icon: ub.badge.icon,
  }));

  return (
    <ProfileClient
      profile={profile}
      heroLevel={heroLevel}
      totalXp={totalXp}
      topBadges={topBadges}
    />
  );
}
