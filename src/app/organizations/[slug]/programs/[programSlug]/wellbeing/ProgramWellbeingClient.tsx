"use client"

import Link from "next/link"
import { ArrowLeft, Heart, MessageSquare, TrendingUp, Activity, AlertCircle } from "lucide-react"

type WellbeingDisplayData = {
  summary: {
    totalResponses: number
    averageScore: number
    beforeAverage: number | null
    afterAverage: number | null
    evolution: number | null
  } | null
  comparison: {
    beforeAverage: number | null
    afterAverage: number | null
    evolution: number | null
  } | null
  comments: string[]
}

export default function ProgramWellbeingClient({
  program,
  orgSlug,
  wellbeingStats,
  canViewResults,
}: {
  program: { id: string; name: string; slug: string }
  orgSlug: string
  wellbeingStats: WellbeingDisplayData | null
  canViewResults: boolean
}) {
  return (
    <div className="min-h-screen bg-tb-background">
      <div className="border-b border-tb-border bg-tb-surface">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link
            href={`/organizations/${orgSlug}/programs/${program.slug}`}
            className="inline-flex items-center gap-2 text-sm text-tb-text-secondary hover:text-tb-text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au programme
          </Link>
          <h1 className="text-2xl font-bold text-tb-text-primary">Impact humain</h1>
          <p className="text-tb-text-secondary mt-1">
            {program.name} · Évolution du bien-être des participants
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {!canViewResults ? (
          <div className="p-6 rounded-xl bg-tb-surface border border-tb-border text-center">
            <p className="text-tb-text-secondary">Vous n&apos;avez pas accès aux résultats d&apos;impact humain.</p>
          </div>
        ) : !wellbeingStats || !wellbeingStats.summary ? (
          /* Empty state */
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-tb-surface-elevated flex items-center justify-center">
              <Heart className="w-8 h-8 text-tb-text-tertiary" />
            </div>
            <h3 className="text-lg font-medium text-tb-text-primary mb-2">
              Aucune donnée d&apos;impact humain
            </h3>
            <p className="text-tb-text-secondary mb-4 max-w-md mx-auto">
              Ajoutez des réponses BEFORE et AFTER pour mesurer l&apos;évolution.
            </p>
            <Link
              href={`/organizations/${orgSlug}/wellbeing/new?programId=${program.id}&phase=BEFORE`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-tb-accent text-white hover:bg-tb-accent-hover transition-colors text-sm font-medium"
            >
              <Activity className="w-4 h-4" />
              Ajouter une réponse BEFORE
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-tb-surface border border-tb-border">
                <div className="text-tb-accent mb-2">
                  <Heart className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-tb-text-primary">
                  {wellbeingStats.summary.totalResponses}
                </div>
                <div className="text-xs text-tb-text-secondary mt-1">Réponses totales</div>
              </div>

              <div className="p-4 rounded-xl bg-tb-surface border border-tb-border">
                <div className="text-blue-600 mb-2">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-tb-text-primary">
                  {wellbeingStats.summary.averageScore ?? "—"}
                </div>
                <div className="text-xs text-tb-text-secondary mt-1">Score moyen /100</div>
              </div>

              {wellbeingStats.comparison && (
                <>
                  <div className="p-4 rounded-xl bg-tb-surface border border-tb-border">
                    <div className="text-green-600 mb-2">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-bold text-tb-text-primary">
                      {wellbeingStats.comparison.beforeAverage != null
                        ? `${wellbeingStats.comparison.beforeAverage.toFixed(1)}`
                        : "—"}
                    </div>
                    <div className="text-xs text-tb-text-secondary mt-1">Moyenne BEFORE</div>
                  </div>

                  <div className="p-4 rounded-xl bg-tb-surface border border-tb-border">
                    <div className="text-indigo-600 mb-2">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-bold text-tb-text-primary">
                      {wellbeingStats.comparison.afterAverage != null
                        ? `${wellbeingStats.comparison.afterAverage.toFixed(1)}`
                        : "—"}
                    </div>
                    <div className="text-xs text-tb-text-secondary mt-1">Moyenne AFTER</div>
                  </div>
                </>
              )}
            </div>

            {/* Evolution */}
            {wellbeingStats.comparison && (wellbeingStats.comparison.beforeAverage != null || wellbeingStats.comparison.afterAverage != null) && (
              <div className="p-5 rounded-xl bg-tb-surface border border-tb-border">
                <h3 className="font-semibold text-tb-text-primary mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-tb-accent" />
                  Évolution
                </h3>
                {wellbeingStats.comparison.beforeAverage != null && wellbeingStats.comparison.afterAverage != null ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-tb-text-secondary">Avant (BEFORE)</span>
                      <span className="text-sm font-medium text-tb-text-primary">
                        {wellbeingStats.comparison.beforeAverage.toFixed(1)}/100
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-tb-text-secondary">Après (AFTER)</span>
                      <span className="text-sm font-medium text-tb-text-primary">
                        {wellbeingStats.comparison.afterAverage.toFixed(1)}/100
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-tb-border">
                      <span className="text-sm font-medium text-tb-text-primary">Évolution</span>
                      <span
                        className={`text-sm font-bold ${
                          (wellbeingStats.comparison.afterAverage - wellbeingStats.comparison.beforeAverage) > 0
                            ? "text-green-600"
                            : (wellbeingStats.comparison.afterAverage - wellbeingStats.comparison.beforeAverage) < 0
                            ? "text-red-600"
                            : "text-tb-text-primary"
                        }`}
                      >
                        {(wellbeingStats.comparison.afterAverage - wellbeingStats.comparison.beforeAverage) > 0 ? "+" : ""}
                        {(wellbeingStats.comparison.afterAverage - wellbeingStats.comparison.beforeAverage).toFixed(1)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-tb-text-tertiary">
                    {!wellbeingStats.comparison.beforeAverage
                      ? "Ajoutez des réponses BEFORE pour mesurer l'évolution."
                      : "Ajoutez des réponses AFTER pour mesurer l'évolution."}
                  </p>
                )}
              </div>
            )}

            {/* Comments */}
            {wellbeingStats.comments.length > 0 && (
              <div className="p-5 rounded-xl bg-tb-surface border border-tb-border">
                <h3 className="font-semibold text-tb-text-primary mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-tb-accent" />
                  Témoignages anonymes
                </h3>
                <div className="space-y-3">
                  {wellbeingStats.comments.map((comment, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-tb-background border border-tb-border"
                    >
                      <p className="text-sm text-tb-text-secondary italic">
                        &ldquo;{comment}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="flex gap-3">
              <Link
                href={`/organizations/${orgSlug}/wellbeing/new?programId=${program.id}&phase=BEFORE`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-tb-accent text-white hover:bg-tb-accent-hover transition-colors text-sm font-medium"
              >
                <Activity className="w-4 h-4" />
                Ajouter une réponse BEFORE
              </Link>
              <Link
                href={`/organizations/${orgSlug}/wellbeing/new?programId=${program.id}&phase=AFTER`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-tb-surface-elevated text-tb-text-primary hover:bg-tb-border transition-colors text-sm font-medium border border-tb-border"
              >
                <Activity className="w-4 h-4" />
                Ajouter une réponse AFTER
              </Link>
              <Link
                href={`/organizations/${orgSlug}/wellbeing`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-tb-surface-elevated text-tb-text-primary hover:bg-tb-border transition-colors text-sm font-medium border border-tb-border"
              >
                Voir tous les résultats
              </Link>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">
                Ces données permettent à l&apos;organisation de suivre l&apos;impact social du programme,
                en combinant activité mesurée et ressenti humain déclaré.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
