"use client";

import Link from "next/link";
import {
  Target,
  Zap,
  Gift,
  Star,
  Users,
  Shield,
  Trophy,
  Lock,
  CheckCircle,
  ChevronRight,
  Sparkles,
  Clock,
  Award,
  BadgeCheck,
} from "lucide-react";
import type { HeroLevel } from "@/lib/gamification";
import ConnectedHeader from "@/components/ConnectedHeader";
import RewardBadgeSVG from "@/components/RewardBadgeSVG";

// ─── Types ──────────────────────────────────────────────────────────────

interface StatItem {
  key: string;
  label: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  bg: string;
  iconBg: string;
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
  badges: { earned: BadgeItem[]; locked: BadgeItem[] };
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

// ─── Helpers ─────────────────────────────────────────────────────────────

type Rarity = "COMMUN" | "RARE" | "ÉPIQUE" | "LÉGENDAIRE";

function getBadgeRarity(code: string, category: string): Rarity {
  if (category === "special") {
    if (code === "gardien-quartier") return "RARE";
    if (["pilier-quartier", "mentor-supreme"].includes(code)) return "ÉPIQUE";
    if (code === "champion-entraide") return "LÉGENDAIRE";
  }
  return "COMMUN";
}

const RARITY_STYLES: Record<Rarity, { bg: string; text: string; border: string; dot: string }> = {
  COMMUN: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200", dot: "bg-gray-400" },
  RARE: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  ÉPIQUE: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", dot: "bg-violet-500" },
  LÉGENDAIRE: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
};

const BADGE_ICONS: Record<string, string> = {
  star: "⭐", heart: "❤️", zap: "⚡", gift: "🎁", award: "🏆",
  shield: "🛡️", check: "✅", "thumbs-up": "👍", monitor: "💻",
  tool: "🔧", "book-open": "📖", coffee: "☕", package: "📦",
  "file-text": "📄", users: "👥", globe: "🌍", target: "🎯",
  building: "🏛️", trophy: "🏆",
};

function badgeIcon(icon: string) {
  return BADGE_ICONS[icon] ?? "🏅";
}

// ─── Components ─────────────────────────────────────────────────────────

function StatCard({ stat }: { stat: StatItem }) {
  return (
    <div className="bg-tb-surface border border-tb-border rounded-2xl p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-tb-accent/5">
      <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-3`}>
        {stat.icon}
      </div>
      <p className="text-2xl font-anton tracking-wide text-tb-text-primary">
        {stat.value}
      </p>
      <p className="text-xs text-tb-text-secondary font-medium mt-0.5">{stat.label}</p>
      <p className="text-[10px] text-tb-text-muted mt-0.5">{stat.subtext}</p>
    </div>
  );
}

function RarityBadge({ rarity }: { rarity: Rarity }) {
  const s = RARITY_STYLES[rarity];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${s.bg} ${s.text} border ${s.border}`}>
      {rarity}
    </span>
  );
}

function BadgeProgressCircle({ progress, total }: { progress: number; total: number }) {
  const pct = total > 0 ? Math.round((progress / total) * 100) : 0;
  const r = 18;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="#E8E1D8" strokeWidth="4" />
        <circle
          cx="22" cy="22" r={r}
          fill="none" stroke="#00A889"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute text-xs font-bold text-tb-accent">{pct}%</span>
    </div>
  );
}

function BadgeIconDisplay({ icon, rarity, earned }: { icon: string; rarity: Rarity; earned: boolean }) {
  return (
    <RewardBadgeSVG
      icon={badgeIcon(icon)}
      rarity={rarity}
      earned={earned}
      size="lg"
      className={earned ? "" : "opacity-50 grayscale"}
    />
  );
}

function QuestBadgeCard({ quest, rarity }: { quest: QuestItem; rarity: Rarity }) {
  const pct = quest.targetValue > 0 ? Math.round((quest.progress / quest.targetValue) * 100) : 0;
  const isComplete = quest.completed;
  const icon = quest.badgeCode
    ? (quest.badgeCode === "gardien-quartier" ? "shield" :
       quest.badgeCode === "pilier-quartier" ? "building" :
       quest.badgeCode === "mentor-supreme" ? "star" :
       quest.badgeCode === "champion-entraide" ? "trophy" :
       quest.badgeCode === "first-mission" ? "star" :
       quest.badgeCode === "helping-hand" ? "heart" :
       quest.badgeCode === "time-giver" ? "gift" :
       quest.badgeCode === "generous-hero" ? "award" : "target")
    : "target";

  return (
    <div className={`bg-tb-surface border ${isComplete ? 'border-tb-accent/40' : 'border-tb-border'} rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg`}>
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          <RewardBadgeSVG
            icon={badgeIcon(icon)}
            rarity={rarity}
            earned={isComplete}
            size="md"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`text-sm font-semibold truncate ${isComplete ? 'text-tb-accent' : 'text-tb-text-primary'}`}>
              {quest.title}
            </h4>
            <RarityBadge rarity={rarity} />
          </div>
          <p className="text-xs text-tb-text-secondary mb-2 line-clamp-2">{quest.description}</p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-tb-text-muted">Progression</span>
                <span className="font-semibold text-tb-text-secondary">{quest.progress}/{quest.targetValue}</span>
              </div>
              <div className="h-2 bg-tb-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isComplete ? 'bg-tb-accent' : 'bg-tb-accent/60'
                  }`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
            {isComplete && <CheckCircle className="w-5 h-5 text-tb-accent shrink-0" />}
          </div>
          {quest.rewardXp > 0 && !isComplete && (
            <p className="text-[10px] text-tb-text-muted mt-2 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Récompense : {quest.rewardXp} XP
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function LockedBadgeCard({ badge, rarity }: { badge: BadgeItem; rarity: Rarity }) {
  const icon = badge.code
    ? (badge.code.includes("pilier") ? "building" :
       badge.code.includes("mentor") ? "star" :
       badge.code.includes("champion") ? "trophy" : badge.icon)
    : badge.icon;

  return (
    <div className="bg-tb-surface border border-tb-border rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          <RewardBadgeSVG
            icon={badgeIcon(icon)}
            rarity={rarity}
            earned={false}
            size="md"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-tb-text-primary truncate">{badge.name}</h4>
            <RarityBadge rarity={rarity} />
          </div>
          <p className="text-xs text-tb-text-secondary">{badge.description}</p>
          <div className="mt-3 flex items-center gap-1 text-[11px] text-tb-text-muted">
            <Lock className="w-3 h-3" />
            <span>Non débloqué</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EarnedBadgeCard({ badge, rarity }: { badge: BadgeItem; rarity: Rarity }) {
  const icon = badge.icon;
  return (
    <div className={`bg-tb-surface border-2 ${RARITY_STYLES[rarity].border} rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg`}>
      <div className="flex flex-col items-center text-center gap-3">
        <RewardBadgeSVG
          icon={badgeIcon(icon)}
          rarity={rarity}
          earned={true}
          size="lg"
        />
        <div>
          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            <h4 className="text-sm font-semibold text-tb-text-primary">{badge.name}</h4>
            <RarityBadge rarity={rarity} />
          </div>
          <p className="text-[11px] text-tb-text-muted">{badge.description}</p>
          {badge.earnedAt && (
            <p className="text-[10px] text-tb-accent mt-1">
              Obtenu le {new Date(badge.earnedAt).toLocaleDateString("fr-FR")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────

export default function RewardsClient(props: RewardsClientProps) {
  const { userName, totalXp, level, badges, quests, achievements, stats } = props;

  // Impact stat cards
  const statCards: StatItem[] = [
    {
      key: "missionsCompleted", label: "Missions réalisées", value: `${stats.missionsCompleted}`,
      subtext: stats.missionsCompleted > 0 ? "Communauté servie" : "Encore aucune",
      icon: <Target className="w-5 h-5 text-white" />, bg: "bg-tb-accent", iconBg: "bg-tb-accent",
    },
    {
      key: "timeEarned", label: "TIME gagnés", value: `${stats.timeEarned}`,
      subtext: stats.timeEarned > 0 ? "Via les missions" : "Encore aucun",
      icon: <Zap className="w-5 h-5 text-white" />, bg: "bg-blue-500", iconBg: "bg-blue-500",
    },
    {
      key: "timeDonated", label: "TIME donnés", value: `${stats.timeDonated}`,
      subtext: stats.timeDonated > 0 ? "Offerts à la communauté" : "Encore aucun",
      icon: <Gift className="w-5 h-5 text-white" />, bg: "bg-pink-500", iconBg: "bg-pink-500",
    },
    {
      key: "ratingsReceived", label: "Avis reçus", value: `${stats.ratingsReceived}`,
      subtext: stats.ratingsReceived > 0 ? "Retours de la communauté" : "Encore aucun",
      icon: <Star className="w-5 h-5 text-white" />, bg: "bg-yellow-500", iconBg: "bg-yellow-500",
    },
    {
      key: "peopleHelped", label: "Personnes aidées", value: `${stats.peopleHelped}`,
      subtext: stats.peopleHelped > 0 ? "Membres uniques" : "Encore aucune",
      icon: <Users className="w-5 h-5 text-white" />, bg: "bg-purple-500", iconBg: "bg-purple-500",
    },
  ];

  // Next reward — highest progress quest that's not completed
  const activeQuests = quests.filter((q) => !q.completed).sort(
    (a, b) => (b.progress / b.targetValue) - (a.progress / a.targetValue)
  );
  const nextReward = activeQuests[0] ?? null;
  const nextRewardRarity: Rarity = nextReward?.badgeCode === "gardien-quartier" ? "RARE"
    : ["pilier-quartier", "mentor-supreme"].includes(nextReward?.badgeCode ?? "") ? "ÉPIQUE"
    : nextReward?.badgeCode === "champion-entraide" ? "LÉGENDAIRE"
    : "COMMUN";

  // "À débloquer bientôt" — top active quests (up to 3)
  const soonQuests = activeQuests.slice(0, 3);

  // "Tes récompenses" — earned badges
  const earnedBadges = badges.earned;
  const earnedBadgesWithRarity = earnedBadges.map((b) => ({
    badge: b,
    rarity: getBadgeRarity(b.code, b.category),
  }));

  // "Récompenses légendaires" — locked special badges (pilier, mentor, champion)
  const legendaryLocked = badges.locked.filter((b) =>
    ["pilier-quartier", "mentor-supreme", "champion-entraide"].includes(b.code)
  );

  const pctDone = level.nextLevelXp
    ? Math.round(((totalXp - (level.nextLevelXp - 300)) / 300) * 100)
    : 100;

  // Next level info
  const xpInLevel = level.currentXp - (level.level > 0 ? 100 : 0);
  const xpForNextLevel = level.nextLevelXp ? (level.nextLevelXp - (level.level > 0 ? 100 : 0)) : 300;
  const progressPct = level.nextLevelXp ? level.progress : 100;

  return (
    <div className="min-h-screen bg-tb-surface-elevated">
      <ConnectedHeader />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in-up">
        {/* ── 1. Hero Level Card ────────────────────────────────────── */}
        <section>
          <div className="bg-tb-surface border border-tb-border rounded-2xl p-6 transition-all duration-300 hover:shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              {/* Level badge */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-tb-accent-soft flex items-center justify-center">
                  <Shield className="w-8 h-8 text-tb-accent" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-tb-text-primary">NIVEAU {level.level}</h2>
                    <span className="text-sm text-tb-accent font-semibold">— {level.name}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-tb-text-muted">XP Total <strong className="text-tb-accent">{totalXp}</strong></span>
                    <span className="text-xs text-tb-text-muted">
                      XP Actuel <strong>{level.currentXp}</strong> / {level.nextLevelXp ?? "MAX"}
                    </span>
                  </div>
                </div>
              </div>

              {/* XP progress */}
              <div className="w-full sm:w-64">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-tb-text-secondary font-medium">{progressPct}% complété</span>
                  {level.nextLevelXp && (
                    <span className="text-tb-text-muted">+{level.nextLevelXp - level.currentXp} XP restants</span>
                  )}
                </div>
                <div className="h-3 bg-tb-border rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-tb-accent rounded-full transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                  {/* Milestone dots */}
                  {[25, 50, 75].map((pct) => (
                    <div
                      key={pct}
                      className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/70"
                      style={{ left: `${pct}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Impact Stats ───────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-tb-accent" />
            <h2 className="text-lg font-anton tracking-wide text-tb-text-primary">
              Impact dans la communauté
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {statCards.map((card) => (
              <StatCard key={card.key} stat={card} />
            ))}
          </div>
        </section>

        {/* ── 3. Next Reward ────────────────────────────────────────── */}
        {nextReward && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-tb-accent" />
              <h2 className="text-lg font-anton tracking-wide text-tb-text-primary">
                Prochaine récompense
              </h2>
            </div>
            <div className={`bg-gradient-to-br from-tb-accent-soft to-white border border-tb-accent/20 rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:shadow-lg`}>
              {/* Background watermark */}
              <div className="absolute right-4 top-4 text-6xl opacity-[0.06] pointer-events-none select-none">
                {badgeIcon(nextReward.badgeCode === "gardien-quartier" ? "shield" :
                  nextReward.badgeCode === "pilier-quartier" ? "building" :
                  nextReward.badgeCode === "mentor-supreme" ? "star" :
                  nextReward.badgeCode === "champion-entraide" ? "trophy" : "target")}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-6 relative z-10">
                {/* Badge icon */}
                <div className="shrink-0">
                  <RewardBadgeSVG
                    icon={badgeIcon(nextReward.badgeCode === "gardien-quartier" ? "shield" :
                      nextReward.badgeCode === "pilier-quartier" ? "building" :
                      nextReward.badgeCode === "mentor-supreme" ? "star" :
                      nextReward.badgeCode === "champion-entraide" ? "trophy" : "target")}
                    rarity={nextRewardRarity}
                    earned={true}
                    size="xl"
                  />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-tb-text-primary">{nextReward.title}</h3>
                    <RarityBadge rarity={nextRewardRarity} />
                  </div>
                  <p className="text-sm text-tb-text-secondary">{nextReward.description}</p>

                  {/* Progress */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-tb-text-muted">Progression</span>
                      <span className="font-semibold text-tb-text-secondary">{nextReward.progress}/{nextReward.targetValue}</span>
                    </div>
                    <div className="h-2.5 bg-tb-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-tb-accent rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((nextReward.progress / nextReward.targetValue) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Rewards list */}
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    <span className="text-tb-accent font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Badge {nextRewardRarity.toLowerCase()} sur ton profil
                    </span>
                    {nextReward.rewardXp > 0 && (
                      <span className="text-tb-accent font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> +{nextReward.rewardXp} XP
                      </span>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href="/services"
                  className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 bg-tb-accent text-white rounded-xl text-sm font-semibold hover:bg-tb-accent-hover transition-colors"
                >
                  Voir les actions à faire
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── 4. Three columns: À débloquer / Récompenses / Légendaires ── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Column 1: À débloquer bientôt */}
          <div className="bg-tb-surface border border-tb-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-tb-accent" />
              <h3 className="text-sm font-semibold text-tb-text-primary">À débloquer bientôt</h3>
              <span className="text-xs text-tb-text-muted">({soonQuests.length})</span>
            </div>
            <div className="space-y-3">
              {soonQuests.length > 0 ? (
                soonQuests.map((q) => {
                  const rarity: Rarity = q.badgeCode === "gardien-quartier" ? "RARE"
                    : ["pilier-quartier", "mentor-supreme"].includes(q.badgeCode ?? "") ? "ÉPIQUE"
                    : q.badgeCode === "champion-entraide" ? "LÉGENDAIRE"
                    : "COMMUN";
                  return <QuestBadgeCard key={q.code} quest={q} rarity={rarity} />;
                })
              ) : (
                <div className="text-center py-8">
                  <Trophy className="w-10 h-10 text-tb-text-muted mx-auto mb-2 opacity-30" />
                  <p className="text-sm text-tb-text-secondary">Tout est débloqué !</p>
                  <p className="text-xs text-tb-text-muted mt-1">Reviens pour plus de défis.</p>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Tes récompenses */}
          <div className="bg-tb-surface border border-tb-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BadgeCheck className="w-4 h-4 text-tb-accent" />
              <h3 className="text-sm font-semibold text-tb-text-primary">Tes récompenses</h3>
              <span className="text-xs text-tb-text-muted">({earnedBadges.length})</span>
            </div>
            <div className="space-y-3">
              {earnedBadges.length > 0 ? (
                earnedBadgesWithRarity.map(({ badge, rarity }) => (
                  <EarnedBadgeCard key={badge.code} badge={badge} rarity={rarity} />
                ))
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-3xl mx-auto mb-3 opacity-40">
                    🏆
                  </div>
                  <p className="text-sm text-tb-text-secondary font-medium">
                    Aucune récompense obtenue pour le moment.
                  </p>
                  <p className="text-xs text-tb-text-muted mt-1">
                    Tu es à quelques actions de tes premières récompenses !
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Récompenses légendaires */}
          <div className="bg-tb-surface border border-tb-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-tb-text-muted" />
              <h3 className="text-sm font-semibold text-tb-text-primary">Récompenses légendaires</h3>
              <span className="text-xs text-tb-text-muted">({legendaryLocked.length})</span>
            </div>
            <div className="space-y-3">
              {legendaryLocked.length > 0 ? (
                legendaryLocked.map((b) => {
                  const rarity = getBadgeRarity(b.code, b.category);
                  return <LockedBadgeCard key={b.code} badge={b} rarity={rarity} />;
                })
              ) : (
                <div className="text-center py-8">
                  <Lock className="w-10 h-10 text-tb-text-muted mx-auto mb-2 opacity-30" />
                  <p className="text-sm text-tb-text-secondary">Tout est débloqué !</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── 5. Promotional banner ──────────────────────────────────── */}
        <section className="bg-gradient-to-r from-tb-accent-soft to-white border border-tb-accent/20 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 text-8xl opacity-[0.04] pointer-events-none select-none">
            🎁
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-tb-accent/10 flex items-center justify-center shrink-0">
                <Gift className="w-6 h-6 text-tb-accent" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-tb-text-primary">
                  Les récompenses, c&apos;est bien plus que des badges !
                </h3>
                <p className="text-xs text-tb-text-secondary mt-1">
                  Accès prioritaire à des missions · Avantages partenaires · Visibilité sur ton profil · Invitations exclusives · Et bien plus...
                </p>
              </div>
            </div>
            <Link
              href="/services"
              className="shrink-0 px-5 py-2.5 bg-white border border-tb-accent/30 text-tb-accent rounded-xl text-sm font-semibold hover:bg-tb-accent hover:text-white transition-all text-center whitespace-nowrap"
            >
              Découvrir les avantages
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-tb-border mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="font-bangers text-sm tracking-wider text-tb-text-muted">
            ~ chaque geste compte, chaque héros brille ~
          </p>
          <p className="text-[10px] text-tb-text-muted mt-2">
            TimeHeroes &mdash; L&apos;entraide qui fait grandir
          </p>
        </div>
      </footer>
    </div>
  );
}
