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
          ? "border-tb-accent/30 bg-tb-surface"
          : "border-tb-border bg-tb-surface"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
            completed
              ? "bg-tb-accent/10 border-tb-accent/20"
              : "bg-tb-surface border-tb-border"
          }`}
        >
          {completed ? (
            <CheckCircle2 className="h-5 w-5 text-tb-accent" />
          ) : (
            <Flag className="h-5 w-5 text-tb-accent" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p
                className={`text-sm font-semibold truncate ${
                  completed ? "text-tb-accent" : "text-tb-text-primary"
                }`}
              >
                {title}
              </p>
              <p className="text-xs text-tb-text-secondary mt-0.5 line-clamp-2">
                {description}
              </p>
            </div>
            {rewardXp > 0 && (
              <span className="shrink-0 text-[11px] font-bold text-tb-accent bg-tb-accent/10 px-2 py-0.5 rounded-lg whitespace-nowrap">
                +{rewardXp} XP
              </span>
            )}
          </div>

          {!completed && (
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-tb-text-secondary">
                  {progress} / {targetValue}
                </span>
                <span className="text-tb-text-muted">{percentage}%</span>
              </div>
              <div className="h-2 rounded-full bg-tb-surface border border-tb-border overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-tb-accent to-tb-accent/80 transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )}

          {completed && (
            <div className="mt-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-tb-accent" />
              <span className="text-xs font-bangers tracking-wider text-tb-accent">
                ~ quête accomplie ~
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
