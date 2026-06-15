"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Sparkles, HeartHandshake } from "lucide-react";

export default function CollectiveMissionsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSolidarity = searchParams.get("solidarity") === "true";

  const setSolidarityFilter = useCallback(
    (solidarity: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      if (solidarity) {
        params.set("solidarity", "true");
      } else {
        params.delete("solidarity");
      }
      router.push(`/collective-missions?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={() => setSolidarityFilter(false)}
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
          !currentSolidarity
            ? "bg-tb-accent text-white border-tb-accent shadow-sm"
            : "bg-tb-surface text-tb-text-secondary border-tb-border hover:border-tb-accent/50"
        }`}
      >
        <Sparkles className="w-4 h-4" />
        Toutes les missions
      </button>

      <button
        onClick={() => setSolidarityFilter(true)}
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
          currentSolidarity
            ? "bg-pink-500 text-white border-pink-500 shadow-sm"
            : "bg-tb-surface text-tb-text-secondary border-tb-border hover:border-pink-500/50"
        }`}
      >
        <HeartHandshake className="w-4 h-4" />
        Missions solidaires
      </button>
    </div>
  );
}
