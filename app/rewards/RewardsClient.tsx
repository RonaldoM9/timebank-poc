"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Sparkles,
  CheckCircle,
  Lock,
  Trophy,
  Target,
  Gift,
  Star,
  Users,
  Shield,
  Zap,
  Flag,
} from "lucide-react";
import type { HeroLevel } from "@/lib/gamification";
import HeroLevelBadge from "@/components/HeroLevelBadge";
import XpProgressBar from "@/components/XpProgressBar";
import BadgeCard from "@/components/BadgeCard";
import QuestCard from "@/components/QuestCard";
import AchievementTimeline from "@/components/AchievementTimeline";

interface StatItem {
  key: string;
  label: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
}

interface BadgeItem {
  code: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  earnedAt: string | null;
}

interface QuestItem {
  code: string;
  title: string;
  description: string;
  progress: number;
  targetValue: number;
  completed: boolean;
  rewardXp: number;
  badgeCode: string | null;
}

interface AchievementItem {
  id: string;
  type: string;
  title: string;
  description: string | null;
  createdAt: string;
}

interface RewardsClientProps {
  userName: string;
  totalXp: number;
  level: HeroLevel;
  badges: {
    earned: BadgeItem[];
    locked: BadgeItem[];
  };
  quests: QuestItem[];
  achievements: AchievementItem[];
  stats: {
    missionsCompleted: number;
    timeEarned: number;
    timeDonated: number;
    ratingsReceived: number;
    peopleHelped: number;
  };
}

export default function RewardsClient({
  userName,
  totalXp,
  level,
  badges,
  quests,
  achievements,
  stats,
}: RewardsClientProps) {
  const statCards: StatItem[] = [
    {
      key: "missionsCompleted",
      label: "Missions réalisées",
      value: `${stats.missionsCompleted}`,
      subtext: stats.missionsCompleted > 0 ? "Communauté servie" : "Encore aucune",
      icon: <Target className="w-4 h-4 text-[#00d4aa]" />,
    },
    {
      key: "timeEarned",
      label: "TIME gagnés",
      value: `${stats.timeEarned}`,
      subtext: stats.timeEarned > 0 ? "Via les missions" : "Encore aucun",
      icon: <Zap className="w-4 h-4 text-blue-400" />,
    },
    {
      key: "timeDonated",
      label: "TIME donnés",
      value: `${stats.timeDonated}`,
      subtext: stats.timeDonated > 0 ? "Offerts à la communauté" : "Encore aucun",
      icon: <Gift className="w-4 h-4 text-pink-400" />,
    },
    {
      key: "ratingsReceived",
      label: "Avis reçus",
      value: `${stats.ratingsReceived}`,
      subtext: stats.ratingsReceived > 0 ? "Retours de la communauté" : "Encore aucun",
      icon: <Star className="w-4 h-4 text-yellow-400" />,
    },
    {
      key: "peopleHelped",
      label: "Personnes aidées",
      value: `${stats.peopleHelped}`,
      subtext: stats.peopleHelped > 0 ? "Membres uniques" : "Encore aucune",
      icon: <Users className="w-4 h-4 text-purple-400" />,
    },
  ];

  const hasEarnedBadges = badges.earned.length > 0;
  const hasLockedBadges = badges.locked.length > 0;
  const activeQuests = quests.filter((q) => !q.completed);
  const completedQuests = quests.filter((q) => q.completed);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#262626]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-[#00d4aa]" />
            <span className="font-anton text-lg tracking-wide text-[#f5f5f5]">
              TimeBank
            </span>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        {/* Section 1: Hero Level Card */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Shield className="w-5 h-5 text-[#00d4aa]" />
            <h2 className="text-lg font-anton tracking-wide text-[#f5f5f5]">
              Ton niveau Hero
            </h2>
          </div>
          <div className="bg-[#111111] border border-[#262626] rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <HeroLevelBadge level={level} />
              <div className="text-right">
                <p className="text-xs text-[#a3a3a3] font-medium">XP Total</p>
                <p className="text-2xl font-anton tracking-wide text-[#00d4aa]">
                  {totalXp}
                </p>
              </div>
            </div>
            <XpProgressBar
              currentXp={level.currentXp}
              nextLevelXp={level.nextLevelXp}
              progress={level.progress}
            />
          </div>
        </section>

        {/* Section 2: Impact Stats */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="w-5 h-5 text-[#00d4aa]" />
            <h2 className="text-lg font-anton tracking-wide text-[#f5f5f5]">
              Impact dans la communauté
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {statCards.map((card) => (
              <div
                key={card.key}
                className="bg-[#111111] border border-[#262626] rounded-2xl p-4 text-center"
              >
                <div className="flex justify-center mb-2">{card.icon}</div>
                <p className="text-2xl font-anton tracking-wide text-[#f5f5f5] mb-0.5">
                  {card.value}
                </p>
                <p className="text-xs text-[#a3a3a3] font-medium">{card.label}</p>
                <p className="text-[10px] text-[#5c5c5c] mt-0.5">{card.subtext}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Badges */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Trophy className="w-5 h-5 text-[#00d4aa]" />
            <h2 className="text-lg font-anton tracking-wide text-[#f5f5f5]">
              Badges
            </h2>
          </div>

          {/* Earned badges */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-4 h-4 text-[#00d4aa]" />
              <h3 className="text-sm font-bangers tracking-wider text-[#a3a3a3] uppercase">
                Badges obtenus
              </h3>
              <span className="text-xs text-[#5c5c5c]">({badges.earned.length})</span>
            </div>
            {hasEarnedBadges ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {badges.earned.map((badge) => (
                  <BadgeCard
                    key={badge.code}
                    icon={badge.icon}
                    name={badge.name}
                    description={badge.description}
                    earned={true}
                    earnedAt={badge.earnedAt}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-[#111111] border border-[#262626] rounded-2xl p-6 text-center">
                <Trophy className="w-8 h-8 text-[#5c5c5c] mx-auto mb-2" />
                <p className="text-sm text-[#a3a3a3]">
                  Aucun badge débloqué pour le moment
                </p>
                <p className="text-xs text-[#5c5c5c] mt-1">
                  Continue tes missions pour gagner des badges&nbsp;!
                </p>
              </div>
            )}
          </div>

          {/* Locked badges */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-[#5c5c5c]" />
              <h3 className="text-sm font-bangers tracking-wider text-[#a3a3a3] uppercase">
                Badges à débloquer
              </h3>
              <span className="text-xs text-[#5c5c5c]">({badges.locked.length})</span>
            </div>
            {hasLockedBadges ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {badges.locked.map((badge) => (
                  <BadgeCard
                    key={badge.code}
                    icon={badge.icon}
                    name={badge.name}
                    description={badge.description}
                    earned={false}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#5c5c5c] italic">
                Tous les badges ont été débloqués&nbsp;!
              </p>
            )}
          </div>
        </section>

        {/* Section 4: Quêtes actives */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Target className="w-5 h-5 text-[#00d4aa]" />
            <h2 className="text-lg font-anton tracking-wide text-[#f5f5f5]">
              Quêtes actives
            </h2>
          </div>

          {activeQuests.length > 0 ? (
            <div className="space-y-3">
              {activeQuests.map((quest) => (
                <QuestCard
                  key={quest.code}
                  title={quest.title}
                  description={quest.description}
                  progress={quest.progress}
                  targetValue={quest.targetValue}
                  completed={quest.completed}
                  rewardXp={quest.rewardXp}
                />
              ))}
            </div>
          ) : (
            <div className="bg-[#111111] border border-[#262626] rounded-2xl p-6 text-center">
              <Flag className="w-8 h-8 text-[#5c5c5c] mx-auto mb-2" />
              <p className="text-sm text-[#a3a3a3]">
                Aucune quête active pour le moment
              </p>
              <p className="text-xs text-[#5c5c5c] mt-1">
                De nouvelles quêtes arriveront bientôt&nbsp;!
              </p>
            </div>
          )}

          {/* Completed quests summary */}
          {completedQuests.length > 0 && (
            <div className="mt-4">
              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer text-sm text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors">
                  <CheckCircle className="w-4 h-4 text-[#00d4aa]" />
                  Quêtes accomplies ({completedQuests.length})
                  <span className="ml-auto text-[10px] text-[#5c5c5c] group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="mt-3 space-y-3">
                  {completedQuests.map((quest) => (
                    <QuestCard
                      key={quest.code}
                      title={quest.title}
                      description={quest.description}
                      progress={quest.progress}
                      targetValue={quest.targetValue}
                      completed={quest.completed}
                      rewardXp={quest.rewardXp}
                    />
                  ))}
                </div>
              </details>
            </div>
          )}
        </section>

        {/* Section 5: Timeline */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Zap className="w-5 h-5 text-[#00d4aa]" />
            <h2 className="text-lg font-anton tracking-wide text-[#f5f5f5]">
              Chronologie des exploits
            </h2>
          </div>
          <AchievementTimeline achievements={achievements} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#262626] mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="font-bangers text-sm tracking-wider text-[#5c5c5c]">
            ~ chaque geste compte, chaque héros brille ~
          </p>
          <p className="text-[10px] text-[#3a3a3a] mt-2">
            TimeBank &mdash; L&apos;entraide qui fait grandir
          </p>
        </div>
      </footer>
    </div>
  );
}
