import { getImpactStats } from "@/lib/impact";
import { getEmptyMessage, SectionHeroImpact, SectionGrid, KPI_DEFINITIONS } from "@/components/ImpactStatsCards";
import ConnectedHeader from "@/components/ConnectedHeader";
import EmptyState from "@/components/EmptyState";
import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";

export const metadata = {
  title: "Impact TimeHeroes — Chiffres clés",
  description:
    "Découvrez l'impact de TimeHeroes : TIME échangé, missions terminées, Heroes actifs, et plus encore.",
};

export default async function ImpactPage() {
  const stats = await getImpactStats();
  const emptyMessage = getEmptyMessage(stats);

  return (
    <>
      {/* Header minimal */}
      <ConnectedHeader />

      <main className="max-w-6xl mx-auto px-4 py-12">
        {emptyMessage && (
          <EmptyState icon={<BarChart3 />} title="Pas encore de données d'impact" description="Les chiffres d'impact apparaîtront dès les premières missions réalisées." actionLabel="Explorer les missions" actionHref="/services" />
        )}

        {!emptyMessage && (
          <>
            {/* Section 1 — Hero Impact (4 big KPIs) */}
            <SectionHeroImpact stats={stats} />

            {/* Section 2 — Activité de la plateforme */}
            <SectionGrid
              stats={stats}
              title="Activité de la plateforme"
              keys={[
                "availableServices",
                "completedMissions",
                "scheduledMissions",
                "resolvedUrgentHelps",
                "discussionsCreated",
                "messagesExchanged",
              ]}
            />

            {/* Section 3 — Circulation du TIME */}
            <SectionGrid
              stats={stats}
              title="Circulation du TIME"
              keys={[
                "totalTimeExchanged",
                "transferredTime",
                "escrowedTime",
                "transferCount",
              ]}
            />

            {/* Section 4 — Reconnaissance & engagement */}
            <SectionGrid
              stats={stats}
              title="Reconnaissance &amp; engagement"
              keys={[
                "unlockedBadges",
                "totalXpGenerated",
                "completedQuests",
                "activeHeroes",
              ]}
            />

            {/* Section 5 — Récit d'impact */}
            <section className="border-t border-tb-border pt-12 mt-16">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-xl md:text-2xl font-bold text-tb-text-primary mb-4 font-anton tracking-wide">
                  Pourquoi ces chiffres comptent
                </h2>
                <p className="text-tb-text-secondary text-sm leading-relaxed mb-4">
                  TimeHeroes rend visible ce qui reste souvent invisible : le temps donné,
                  les services rendus, les échanges de confiance et l&apos;engagement local.
                </p>
                <p className="text-tb-text-secondary text-sm leading-relaxed">
                  Grâce au wallet TIME, aux réservations planifiées, aux preuves QR/NFC,
                  aux discussions sécurisées et aux badges, chaque contribution devient
                  traçable et valorisable.
                </p>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer minimal */}
      <footer className="border-t border-tb-border py-8 mt-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs text-tb-text-muted">
            TimeHeroes — Banque du temps des héros du quotidien.
          </p>
        </div>
      </footer>
    </>
  );
}
