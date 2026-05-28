"use client";

import {
  Award,
  Target,
  Hand,
  Star,
  Gift,
  Heart,
  ShieldCheck,
  BadgeCheck,
  Cpu,
  Users,
  Zap,
  Wrench,
  BookOpen,
  UtensilsCrossed,
  Dumbbell,
  ThumbsUp,
  FileText,
  HeartHandshake,
  Lock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  award: Award,
  target: Target,
  hand: Hand,
  star: Star,
  gift: Gift,
  heart: Heart,
  "shield-check": ShieldCheck,
  "badge-check": BadgeCheck,
  cpu: Cpu,
  users: Users,
  zap: Zap,
  wrench: Wrench,
  "book-open": BookOpen,
  "utensils-crossed": UtensilsCrossed,
  dumbbell: Dumbbell,
  "thumbs-up": ThumbsUp,
  "file-text": FileText,
  "heart-handshake": HeartHandshake,
};

interface BadgeCardProps {
  icon: string;
  name: string;
  description: string;
  earned: boolean;
  earnedAt?: string | null;
}

export default function BadgeCard({
  icon,
  name,
  description,
  earned,
  earnedAt,
}: BadgeCardProps) {
  const Icon = iconMap[icon] ?? Award;
  const categoryColors: Record<string, string> = {
    engagement: "border-blue-500/20 bg-blue-500/5",
    solidarity: "border-pink-500/20 bg-pink-500/5",
    trust: "border-purple-500/20 bg-purple-500/5",
    skill: "border-yellow-500/20 bg-yellow-500/5",
    community: "border-green-500/20 bg-green-500/5",
    impact: "border-orange-500/20 bg-orange-500/5",
  };

  const borderClass = earned
    ? "border-[#00d4aa]/30"
    : "border-[#262626] opacity-45 grayscale";

  return (
    <div
      className={`rounded-2xl border p-4 transition-all duration-200 ${borderClass} ${
        earned ? "bg-[#111111]" : "bg-[#111111]/60"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
            earned ? "bg-[#00d4aa]/10 border-[#00d4aa]/20" : "bg-[#181818] border-[#262626]"
          }`}
        >
          {earned ? (
            <Icon className="h-5 w-5 text-[#00d4aa]" />
          ) : (
            <Lock className="h-4 w-4 text-[#5c5c5c]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p
              className={`text-sm font-semibold truncate ${
                earned ? "text-[#f5f5f5]" : "text-[#a3a3a3]"
              }`}
            >
              {name}
            </p>
            {earned && (
              <span className="text-[10px] font-bangers tracking-wider text-[#00d4aa] shrink-0">
                ~ débloqué ~
              </span>
            )}
          </div>
          <p className="text-xs text-[#a3a3a3] mt-0.5 line-clamp-2">
            {description}
          </p>
          {earned && earnedAt && (
            <p className="text-[10px] text-[#5c5c5c] mt-1">
              Obtenu le{" "}
              {new Date(earnedAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
