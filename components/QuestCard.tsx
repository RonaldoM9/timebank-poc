"use client";

import { Flag, CheckCircle2, Circle } from "lucide-react";

interface QuestCardProps {
  title: string;
  description: string;
  progress: number; // current progress value
  targetValue: number; // target to complete
  completed: boolean;
  rewardXp?: number;
}

export default function QuestCard({
  title,
  description,
  progress,
  targetValue,
  completed,
  rewardXp = 0,
}: QuestCardProps) {
  const percentage =
    targetValue > 0
      ? Math.min(Math.round((progress / targetValue) * 100), 100)
      : 0;

  return (
    <div
      className={`rounded-2xl border p-4 transition-all duration-200 ${
        completed
          ? "border-[#00d4aa]/30 bg-[#111111]"
          : "border-[#262626] bg-[#111111]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
            completed
              ? "bg-[#00d4aa]/10 border-[#00d4aa]/20"
              : "bg-[#181818] border-[#262626]"
          }`}
        >
          {completed ? (
            <CheckCircle2 className="h-5 w-5 text-[#00d4aa]" />
          ) : (
            <Flag className="h-5 w-5 text-[#00d4aa]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p
                className={`text-sm font-semibold truncate ${
                  completed ? "text-[#00d4aa]" : "text-[#f5f5f5]"
                }`}
              >
                {title}
              </p>
              <p className="text-xs text-[#a3a3a3] mt-0.5 line-clamp-2">
                {description}
              </p>
            </div>
            {rewardXp > 0 && (
              <span className="shrink-0 text-[11px] font-bold text-[#00d4aa] bg-[#00d4aa]/10 px-2 py-0.5 rounded-lg whitespace-nowrap">
                +{rewardXp} XP
              </span>
            )}
          </div>

          {!completed && (
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#a3a3a3]">
                  {progress} / {targetValue}
                </span>
                <span className="text-[#5c5c5c]">{percentage}%</span>
              </div>
              <div className="h-2 rounded-full bg-[#181818] border border-[#262626] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#00d4aa] to-[#00b894] transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )}

          {completed && (
            <div className="mt-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#00d4aa]" />
              <span className="text-xs font-bangers tracking-wider text-[#00d4aa]">
                ~ quête accomplie ~
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
