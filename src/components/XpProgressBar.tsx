"use client";

interface XpProgressBarProps {
  currentXp: number;
  nextLevelXp: number | null;
  progress: number; // 0–100
}

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

      <div className="h-2.5 rounded-full bg-tb-surface-elevated border border-tb-border overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-tb-accent to-tb-accent-hover transition-all duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>

      {nextLevelXp !== null && (
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-tb-text-muted">
            {clamped}% complété
          </span>
          <span className="text-[10px] text-tb-accent font-medium">
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
