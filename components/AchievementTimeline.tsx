"use client";

import {
  Trophy,
  Star,
  Award,
  Zap,
  Shield,
  Gift,
  Heart,
  Users,
  Target,
  Flag,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const typeIconMap: Record<string, LucideIcon> = {
  level_up: Shield,
  badge_earned: Award,
  time_donated: Gift,
  quest_complete: Flag,
  mission_complete: Target,
  rating_received: Star,
  impact_milestone: Zap,
  community_milestone: Users,
  welcome: Sparkles,
};

const typeColors: Record<string, string> = {
  level_up: "bg-orange-500/10 border-orange-500/20 text-orange-400",
  badge_earned: "bg-purple-500/10 border-purple-500/20 text-purple-400",
  time_donated: "bg-pink-500/10 border-pink-500/20 text-pink-400",
  quest_complete: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  mission_complete: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  rating_received: "bg-green-500/10 border-green-500/20 text-green-400",
  impact_milestone: "bg-[#00d4aa]/10 border-[#00d4aa]/20 text-[#00d4aa]",
  community_milestone: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
  welcome: "bg-[#00d4aa]/10 border-[#00d4aa]/20 text-[#00d4aa]",
};

interface AchievementEvent {
  id: string;
  type: string;
  title: string;
  description: string | null;
  createdAt: string;
}

interface AchievementTimelineProps {
  achievements: AchievementEvent[];
}

export default function AchievementTimeline({
  achievements,
}: AchievementTimelineProps) {
  if (achievements.length === 0) {
    return (
      <div className="rounded-2xl border border-[#262626] bg-[#111111] p-8 text-center">
        <Trophy className="h-8 w-8 text-[#5c5c5c] mx-auto mb-3" />
        <p className="text-sm text-[#a3a3a3]">
          Aucun exploit pour le moment
        </p>
        <p className="text-xs text-[#5c5c5c] mt-1">
          Accomplis des actions pour débloquer des succès&nbsp;!
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline vertical line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-[#262626]" />

      <div className="space-y-3">
        {achievements.map((event, idx) => {
          const Icon = typeIconMap[event.type] ?? Star;
          const colorClass = typeColors[event.type] ?? "bg-[#181818] border-[#262626] text-[#a3a3a3]";

          return (
            <div key={event.id} className="relative flex items-start gap-4 pl-0">
              {/* Dot on timeline */}
              <div className="relative z-10 flex shrink-0">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border ${colorClass}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1 rounded-2xl border border-[#262626] bg-[#111111] p-3.5">
                <p className="text-sm font-semibold text-[#f5f5f5]">
                  {event.title}
                </p>
                {event.description && (
                  <p className="text-xs text-[#a3a3a3] mt-0.5 line-clamp-2">
                    {event.description}
                  </p>
                )}
                <p className="text-[10px] text-[#5c5c5c] mt-1.5">
                  {new Date(event.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
