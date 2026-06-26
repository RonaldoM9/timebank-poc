"use client";

import { Shield, ChevronRight } from "lucide-react";
import type { HeroLevel } from "@/lib/gamification";

const levelColors: Record<number, string> = {
  0: "text-yellow-400 border-yellow-500/30",
  1: "text-blue-400 border-blue-500/30",
  2: "text-purple-400 border-purple-500/30",
  3: "text-orange-400 border-orange-500/30",
  4: "text-tb-accent border-tb-accent/30",
};

const levelBgColors: Record<number, string> = {
  0: "bg-yellow-500/10",
  1: "bg-blue-500/10",
  2: "bg-purple-500/10",
  3: "bg-orange-500/10",
  4: "bg-[#00d4aa]/10",
};

const shieldColors: Record<number, string> = {
  0: "text-yellow-400",
  1: "text-blue-400",
  2: "text-purple-400",
  3: "text-orange-400",
  4: "text-tb-accent",
};

interface HeroLevelBadgeProps {
  level: HeroLevel;
}

export default function HeroLevelBadge({ level }: HeroLevelBadgeProps) {
  const borderColor = levelColors[level.level] ?? levelColors[0];
  const bgColor = levelBgColors[level.level] ?? levelBgColors[0];
  const shieldColor = shieldColors[level.level] ?? shieldColors[0];

  return (
    <div
      className={`inline-flex items-center gap-3 rounded-2xl border px-4 py-3 ${borderColor} ${bgColor}`}
    >
      <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-tb-surface-elevated border-2 border-tb-border shadow-sm">
        <Shield className={`h-6 w-6 ${shieldColor}`} />
        {/* Level number overlay */}
        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-tb-accent text-white text-[8px] font-bold flex items-center justify-center shadow-sm">
          {level.level}
        </span>
      </div>
      <div>
        <p className="font-bangers text-[10px] tracking-widest text-[#a3a3a3] uppercase">
          Niveau {level.level}
        </p>
        <p className="font-anton text-base tracking-wide text-tb-text-primary">
          {level.name}
        </p>
      </div>
      {level.nextLevelXp !== null && (
        <ChevronRight className="h-4 w-4 text-[#5c5c5c] ml-2" />
      )}
    </div>
  );
}
