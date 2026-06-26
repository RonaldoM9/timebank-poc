"use client";

interface XpProgressBarProps {
  currentXp: number;
  nextLevelXp: number | null;
  progress: number; // 0–100
}

/**
 * Power-meter style XP bar with gradient segments, shimmer, and milestone dots.
 */
export default function XpProgressBar({
  currentXp,
  nextLevelXp,
  progress,
}: XpProgressBarProps) {
  const clamped = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-tb-text-secondary font-medium">
          XP Actuel
        </span>
        <span className="text-xs font-semibold text-tb-text-primary">
          {currentXp}{" "}
          {nextLevelXp !== null && (
            <span className="text-tb-text-muted font-normal">
              / {nextLevelXp}
            </span>
          )}
        </span>
      </div>

      {/* Power meter track */}
      <div className="relative h-3 rounded-full bg-tb-surface-elevated border border-tb-border overflow-hidden">
        {/* Power bar with multi-stop gradient */}
        <div
          className="h-full rounded-full bg-gradient-to-r from-tb-accent via-[#02bf9a] to-tb-accent-hover transition-all duration-700 ease-out relative overflow-hidden"
          style={{ width: `${clamped}%` }}
        >
          {/* Shimmer overlay */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%] animate-shimmer" />
        </div>

        {/* Milestone dots (every 25%) */}
        {[25, 50, 75].map((mark) => (
          <div
            key={mark}
            className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 transition-colors duration-300 ${
              clamped >= mark
                ? "bg-white border-tb-accent-hover"
                : "bg-tb-surface-elevated border-tb-border"
            }`}
            style={{ left: `${mark}%`, marginLeft: "-4px" }}
          />
        ))}
      </div>

      {nextLevelXp !== null && (
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-tb-text-muted">
            {clamped}% complété
          </span>
          <span className="text-[10px] text-tb-accent font-medium animate-pulse-accent">
            +{nextLevelXp - currentXp} XP restants
          </span>
        </div>
      )}

      {nextLevelXp === null && (
        <div className="flex items-center justify-center mt-1.5">
          <span className="text-[10px] text-tb-accent font-bangers tracking-wider">
            ~ niveau maximum atteint ~
          </span>
        </div>
      )}
    </div>
  );
}
