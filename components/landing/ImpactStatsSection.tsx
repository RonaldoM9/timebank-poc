import { ImpactStatsCards, getEmptyMessage } from "@/components/ImpactStatsCards";
import type { ImpactStats } from "@/lib/impact";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Props {
  stats: ImpactStats;
}

export default function ImpactStatsSection({ stats }: Props) {
  const emptyMessage = getEmptyMessage(stats);

  return (
    <section id="impact" className="border-t border-[#262626] py-16 md:py-20">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-[#f5f5f5] text-center mb-4">
          L&apos;impact en chiffres
        </h2>
        <p className="text-center text-[#a3a3a3] text-sm mb-10 max-w-xl mx-auto">
          TimeHeroes rend visible ce qui reste souvent invisible : les heures d&apos;aide,
          les services rendus et l&apos;impact local généré par une communauté.
        </p>

        {emptyMessage && (
          <p className="text-center text-[#6b6b6b] text-sm py-8">
            {emptyMessage}
          </p>
        )}

        {!emptyMessage && (
          <ImpactStatsCards stats={stats} className="mb-8" />
        )}

        <div className="text-center">
          <Link
            href="/impact"
            className="inline-flex items-center gap-2 text-sm text-[#00d4aa] hover:text-[#00b894] transition-colors font-semibold"
          >
            Voir l&apos;impact complet
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-center text-xs text-[#5c5c5c] mt-6">
          * Chiffres issus de la démonstration — données réelles à venir
        </p>
      </div>
    </section>
  );
}
