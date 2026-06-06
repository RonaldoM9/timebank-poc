import type { ImpactStats } from "@/lib/impact";

interface ImpactSectionProps {
  stats: ImpactStats;
}

function formatValue(value: number, suffix?: string): string {
  if (value === 0) return "—";
  return suffix ? `${value}${suffix}` : String(value);
}

export default function ImpactSection({ stats }: ImpactSectionProps) {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-tb-text-primary">
          L&apos;impact TimeHeroes en chiffres
        </h2>
        <p className="text-tb-text-secondary mt-2">
          Découvrez comment notre communauté transforme le temps en solidarité.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
          {/* Card 1 - Heures échangées */}
          <div className="bg-tb-surface border border-tb-border rounded-2xl p-6 shadow-sm hover:border-tb-accent/30 transition-all">
            <p className="text-4xl md:text-5xl font-bold text-tb-accent font-anton tracking-wide">
              {formatValue(stats.totalTimeExchanged, "h")}
            </p>
            <p className="text-tb-text-primary font-semibold mt-1">
              Heures échangées
            </p>
            <p className="text-tb-text-muted text-xs mt-1">
              Temps donné et reçu par la communauté
            </p>
          </div>

          {/* Card 2 - Missions solidaires */}
          <div className="bg-tb-surface border border-tb-border rounded-2xl p-6 shadow-sm hover:border-tb-accent/30 transition-all">
            <p className="text-4xl md:text-5xl font-bold text-tb-accent font-anton tracking-wide">
              {formatValue(stats.completedMissions)}
            </p>
            <p className="text-tb-text-primary font-semibold mt-1">
              Missions solidaires
            </p>
            <p className="text-tb-text-muted text-xs mt-1">
              Services rendus entre héros du quotidien
            </p>
          </div>

          {/* Card 3 - Héros actifs */}
          <div className="bg-tb-surface border border-tb-border rounded-2xl p-6 shadow-sm hover:border-tb-accent/30 transition-all">
            <p className="text-4xl md:text-5xl font-bold text-tb-accent font-anton tracking-wide">
              {formatValue(stats.activeHeroes)}
            </p>
            <p className="text-tb-text-primary font-semibold mt-1">
              Héros actifs
            </p>
            <p className="text-tb-text-muted text-xs mt-1">
              Membres engagés dans l&apos;entraide locale
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
