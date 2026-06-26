"use client";

/* ══════════════════════════════════════════════════════════════════════
 * BADGES — TimeHeroes
 *
 * Premium illustrated badge images generated via DALL-E.
 * Each rarity has its own PNG image with distinct design:
 *
 *   COMMUN    → Silver shield with star
 *   RARE      → Emerald shield with gold star + laurels
 *   ÉPIQUE    → Purple shield with faceted gem + flourishes
 *   LÉGENDAIRE → Gold shield with crown + wings + red banner
 * ══════════════════════════════════════════════════════════════════════ */

interface BadgeProps {
  icon?: string; // ignored — image badges have fixed icons
  size?: "sm" | "md" | "lg" | "xl";
  rarity: "COMMUN" | "RARE" | "ÉPIQUE" | "LÉGENDAIRE";
  earned?: boolean;
  className?: string;
}

const SIZES = {
  sm: 40,
  md: 56,
  lg: 72,
  xl: 96,
};

const IMG_MAP: Record<string, string> = {
  COMMUN: "/badges/badge-commun.png",
  RARE: "/badges/badge-rare.png",
  ÉPIQUE: "/badges/badge-epic.png",
  LÉGENDAIRE: "/badges/badge-legend.png",
};

export default function RewardBadgeSVG({
  size = "md",
  rarity,
  earned = true,
  className = "",
}: BadgeProps) {
  const dim = SIZES[size];
  const src = IMG_MAP[rarity];
  const op = earned ? 1 : 0.3;

  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{ width: dim, height: dim, opacity: op }}
    >
      <img
        src={src}
        alt={`Badge ${rarity}`}
        width={dim}
        height={dim}
        className="w-full h-full object-contain"
        style={{
          filter: earned
            ? "drop-shadow(0 2px 6px rgba(0,0,0,0.15))"
            : "grayscale(1) brightness(0.6)",
          imageRendering: "auto",
        }}
      />
    </div>
  );
}

export function RarityDot({ rarity, size = 8 }: { rarity: string; size?: number }) {
  const colors: Record<string, string> = {
    COMMUN: "#9CA3AF", RARE: "#10B981", ÉPIQUE: "#8B5CF6", LÉGENDAIRE: "#F59E0B",
  };
  return (
    <span
      className="inline-block rounded-full"
      style={{ width: size, height: size, backgroundColor: colors[rarity] ?? "#9CA3AF" }}
    />
  );
}
