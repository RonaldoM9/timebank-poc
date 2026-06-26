"use client";

import Link from "next/link";
import {
  Heart,
  ArrowLeft,
  Users,
  TrendingUp,
  MessageSquareQuote,
  ClipboardCheck,
  Sparkles,
} from "lucide-react";
import ConnectedHeader from "@/components/ConnectedHeader";
import EmptyState from "@/components/EmptyState";

type Props = {
  organization: { id: string; name: string; slug: string };
  summary: {
    totalResponses: number;
    averageScore: number;
    beforeAverage: number | null;
    afterAverage: number | null;
    evolution: number | null;
    isolationAvg: number;
    supportAvg: number;
    usefulnessAvg: number;
    trustAvg: number;
    contributionAvg: number;
  } | null;
  comments: string[];
  canSurvey: boolean;
  canViewResults: boolean;
};

function StatCard({
  label,
  value,
  icon,
  color,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-tb-surface border border-tb-border rounded-2xl p-4 text-center">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
        style={{ backgroundColor: color + "20" }}
      >
        {icon}
      </div>
      <p className="text-2xl font-anton tracking-wide text-tb-text-primary">
        {value}
      </p>
      <p className="text-xs text-tb-text-secondary font-medium mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-tb-text-muted mt-0.5">{sub}</p>}
    </div>
  );
}

export default function WellbeingResultsClient({
  organization: org,
  summary,
  comments,
  canSurvey,
  canViewResults,
}: Props) {
  const hasData = summary && summary.totalResponses > 0;

  return (
    <div className="min-h-screen bg-tb-surface-elevated animate-fade-in-up">
      <ConnectedHeader />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Back + Header */}
        <div>
          <Link
            href={`/organizations/${org.slug}`}
            className="inline-flex items-center gap-1 text-sm text-tb-text-secondary hover:text-tb-accent transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à {org.name}
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-5 h-5 text-tb-accent" />
            <h1 className="text-2xl font-anton tracking-wide text-tb-text-primary">
              Impact humain
            </h1>
          </div>
          <p className="text-sm text-tb-text-secondary">
            Mesurer comment TimeHeroes influence le lien social, la confiance et le sentiment d&apos;utilité.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="bg-tb-accent-soft border border-tb-accent/20 rounded-2xl p-4 text-xs text-tb-text-secondary">
          <Sparkles className="w-4 h-4 text-tb-accent inline mr-1" />
          Ces données sont déclaratives et anonymisées. Elles permettent de comprendre comment
          TimeHeroes influence le lien social, la confiance et le sentiment d&apos;utilité.
        </div>

        {/* CTA Survey */}
        {canSurvey && (
          <Link
            href={`/organizations/${org.slug}/wellbeing/new`}
            className="inline-flex items-center gap-2 px-5 py-3 bg-tb-accent text-white rounded-xl text-sm font-semibold hover:bg-tb-accent-hover transition-colors"
          >
            <ClipboardCheck className="w-4 h-4" />
            Répondre au questionnaire bien-être
          </Link>
        )}

        {/* Results */}
        {canViewResults && (
          <>
            {!hasData ? (
              <EmptyState
                icon={<Heart className="w-12 h-12" />}
                title="Aucune réponse pour le moment"
                description="Les résultats apparaîtront ici quand des membres auront répondu au questionnaire."
                actionLabel="Voir le questionnaire"
                actionHref={`/organizations/${org.slug}/wellbeing/new`}
              />
            ) : (
              <>
                {/* KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard
                    label="Réponses collectées"
                    value={summary!.totalResponses}
                    icon={<Users className="w-5 h-5 text-tb-accent" />}
                    color="#00A889"
                  />
                  <StatCard
                    label="Score moyen"
                    value={`${summary!.averageScore}/25`}
                    icon={<ClipboardCheck className="w-5 h-5 text-blue-500" />}
                    color="#3B82F6"
                  />
                  <StatCard
                    label="Avant"
                    value={summary!.beforeAverage !== null ? `${summary!.beforeAverage}/100` : "—"}
                    icon={<TrendingUp className="w-5 h-5 text-amber-500" />}
                    color="#F59E0B"
                    sub={summary!.beforeAverage !== null ? `${summary!.totalResponses} réponses` : undefined}
                  />
                  <StatCard
                    label="Après"
                    value={summary!.afterAverage !== null ? `${summary!.afterAverage}/100` : "—"}
                    icon={<TrendingUp className="w-5 h-5 text-tb-accent" />}
                    color="#00A889"
                    sub={summary!.afterAverage !== null ? `${summary!.totalResponses} réponses` : undefined}
                  />
                </div>

                {/* Évolution */}
                {summary!.evolution !== null && (
                  <div
                    className={`rounded-2xl p-4 text-center border ${
                      summary!.evolution > 0
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-gray-50 border-gray-200 text-gray-600"
                    }`}
                  >
                    <p className="text-lg font-bold">
                      {summary!.evolution > 0 ? "+" : ""}
                      {summary!.evolution} points d&apos;évolution
                    </p>
                    <p className="text-xs mt-1 opacity-70">
                      Score moyen avant vs après
                    </p>
                  </div>
                )}

                {/* Detailed scores */}
                <div>
                  <h2 className="text-lg font-anton tracking-wide text-tb-text-primary mb-4">
                    Scores détaillés
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { label: "Isolement", key: "isolationAvg", value: summary!.isolationAvg },
                      { label: "Capacité à demander de l'aide", key: "supportAvg", value: summary!.supportAvg },
                      { label: "Utilité ressentie", key: "usefulnessAvg", value: summary!.usefulnessAvg },
                      { label: "Confiance", key: "trustAvg", value: summary!.trustAvg },
                      { label: "Envie de contribuer", key: "contributionAvg", value: summary!.contributionAvg },
                    ].map((item) => {
                      const pct = Math.round((item.value / 5) * 100);
                      return (
                        <div
                          key={item.key}
                          className="bg-tb-surface border border-tb-border rounded-2xl p-4"
                        >
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-tb-text-primary font-medium">{item.label}</span>
                            <span className="text-tb-text-secondary font-semibold">
                              {item.value}/5
                            </span>
                          </div>
                          <div className="h-2.5 bg-tb-border rounded-full overflow-hidden">
                            <div
                              className="h-full bg-tb-accent rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Verbatims */}
                {comments.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquareQuote className="w-4 h-4 text-tb-text-muted" />
                      <h2 className="text-sm font-semibold text-tb-text-primary">
                        Témoignages anonymes
                      </h2>
                    </div>
                    <div className="space-y-2">
                      {comments.map((c, i) => (
                        <div
                          key={i}
                          className="bg-tb-surface border border-tb-border rounded-2xl p-4 italic text-sm text-tb-text-secondary"
                        >
                          &ldquo;{c}&rdquo;
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* No access */}
        {!canViewResults && (
          <EmptyState
            icon={<Heart className="w-12 h-12" />}
            title="Accès réservé"
            description="Seuls les administrateurs et facilitateurs peuvent voir les résultats."
          />
        )}
      </main>
    </div>
  );
}
