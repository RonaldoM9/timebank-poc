import { HeartHandshake, CheckCircle, Sparkles, Ban } from "lucide-react";

const BADGE_CONFIG = {
  SELF_DECLARED: {
    label: "Mission à impact",
    className: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    icon: Sparkles,
  },
  VERIFIED: {
    label: "Mission solidaire vérifiée",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    icon: CheckCircle,
  },
  FUNDED: {
    label: "Financée par le pot commun",
    className: "bg-purple-500/15 text-purple-400 border-purple-500/25",
    icon: HeartHandshake,
  },
  REJECTED: {
    label: "Qualification solidaire refusée",
    className: "bg-red-500/10 text-red-400 border-red-500/20",
    icon: Ban,
  },
} as const;

type SolidarityStatus = keyof typeof BADGE_CONFIG;

interface SolidarityBadgeProps {
  status: string;
  showRejected?: boolean; // Only show REJECTED badge to owner/facilitator
  className?: string;
}

export default function SolidarityBadge({
  status,
  showRejected = false,
  className = "",
}: SolidarityBadgeProps) {
  if (status === "CLASSIC" || !status) return null;
  if (status === "REJECTED" && !showRejected) return null;

  const config = BADGE_CONFIG[status as SolidarityStatus];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-medium border rounded-full px-2.5 py-0.5 ${config.className} ${className}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

/**
 * UI labels for solidarity categories (for display in detail pages)
 */
export const SOLIDARITY_CATEGORY_LABELS: Record<string, string> = {
  SOCIAL_LINK: "Temps de lien",
  DIGITAL_HELP: "Aide numérique",
  LOCAL_SUPPORT: "Accompagnement local",
  CAREGIVER_SUPPORT: "Aidants",
  SENIOR_SUPPORT: "Seniors",
  TRANSMISSION: "Transmission",
  NEWCOMER_HELP: "Nouveaux arrivants",
  SAFE_HOME: "Maison sûre",
  URGENT_SOLIDARITY: "Urgence solidaire",
  OTHER: "Autre",
};
