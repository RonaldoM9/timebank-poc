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
        <span className="text-xs text-[#a3a3a3] font-medium">
          XP Actuel
        </span>
        <span className="text-xs font-semibold text-[#f5f5f5]">
          {currentXp}{" "}
          {nextLevelXp !== null && (
            <span className="text-[#5c5c5c] font-normal">
              / {nextLevelXp}
            </span>
          )}
        </span>
      </div>

      <div className="h-2.5 rounded-full bg-[#181818] border border-[#262626] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#00d4aa] to-[#00b894] transition-all duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>

      {nextLevelXp !== null && (
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-[#5c5c5c]">
            {clamped}% complété
          </span>
          <span className="text-[10px] text-[#00d4aa] font-medium">
            +{nextLevelXp - currentXp} XP restants
          </span>
        </div>
      )}

      {nextLevelXp === null && (
        <div className="flex items-center justify-center mt-1.5">
          <span className="text-[10px] text-[#00d4aa] font-bangers tracking-wider">
            ~ niveau maximum atteint ~
          </span>
        </div>
      )}
    </div>
  );
}
