"use client"

import Link from "next/link"
import {
  ArrowLeft,
  Heart,
  Users,
  Target,
  Clock,
  Award,
  TrendingUp,
  Activity,
  AlertCircle,
  FileText,
  UserCheck,
  RefreshCw,
} from "lucide-react"
import type { ProgramStats } from "@/lib/programs"

type WellbeingSummary = {
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
  commentCount: number
}

export default function ProgramImpactClient({
  program,
  orgSlug,
  orgName,
  stats,
  wellbeingStats,
  canViewFull,
}: {
  program: { id: string; name: string; slug: string }
  orgSlug: string
  orgName: string
  stats: ProgramStats
  wellbeingStats: WellbeingSummary | null
  canViewFull: boolean
}) {
  const completionRate = stats.missionCount > 0
    ? Math.round((stats.completedMissionCount / stats.missionCount) * 100)
    : 0

  const metrics = [
    { label: "Seniors accompagnés", value: stats.seniorCount, icon: <Heart className="w-5 h-5" />, color: "text-purple-600" },
    { label: "Missions terminées", value: stats.completedMissionCount, icon: <Target className="w-5 h-5" />, color: "text-green-600" },
    { label: "Heures mobilisées", value: `${stats.totalHours}h`, icon: <Clock className="w-5 h-5" />, color: "text-amber-600" },
    { label: "TIME distribués", value: stats.totalTime, icon: <Award className="w-5 h-5" />, color: "text-tb-accent" },
    { label: "Score wellbeing moyen", value: wellbeingStats?.summary?.averageScore != null ? `${wellbeingStats.summary.averageScore}/100` : "—", icon: <Activity className="w-5 h-5" />, color: "text-teal-600" },
    { label: "Évolution wellbeing", value: wellbeingStats?.comparison?.evolution != null ? `${wellbeingStats.comparison.evolution > 0 ? "+" : ""}${wellbeingStats.comparison.evolution.toFixed(1)}` : "—", icon: <TrendingUp className="w-5 h-5" />, color: wellbeingStats?.comparison?.evolution != null && wellbeingStats.comparison.evolution > 0 ? "text-green-600" : "text-red-600" },
    { label: "Taux de complétion", value: `${completionRate}%`, icon: <RefreshCw className="w-5 h-5" />, color: "text-blue-600" },
    { label: "Heroes récurrents", value: stats.heroCount > 1 ? stats.heroCount : "—", icon: <UserCheck className="w-5 h-5" />, color: "text-indigo-600" },
  ]

  return (
    <div className="min-h-screen bg-tb-background">
      <div className="border-b border-tb-border bg-tb-surface">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Link
            href={`/organizations/${orgSlug}/programs/${program.slug}`}
            className="inline-flex items-center gap-2 text-sm text-tb-text-secondary hover:text-tb-text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au programme
          </Link>
          <h1 className="text-2xl font-bold text-tb-text-primary">Impact du programme</h1>
          <p className="text-tb-text-secondary mt-1">
            {program.name} · {orgName}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        {/* Metric grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="p-4 rounded-xl bg-tb-surface border border-tb-border"
            >
              <div className={`mb-2 ${m.color}`}>{m.icon}</div>
              <div className="text-2xl font-bold text-tb-text-primary">{m.value}</div>
              <div className="text-xs text-tb-text-secondary mt-1">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Participant breakdown */}
        <div className="p-5 rounded-xl bg-tb-surface border border-tb-border">
          <h3 className="font-semibold text-tb-text-primary mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-tb-accent" />
            Participants
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-tb-text-secondary">
              <span>Seniors accompagnés</span>
              <span className="font-medium text-tb-text-primary">{stats.seniorCount}</span>
            </div>
            <div className="flex justify-between text-tb-text-secondary">
              <span>Heroes mobilisés</span>
              <span className="font-medium text-tb-text-primary">{stats.heroCount}</span>
            </div>
            <div className="flex justify-between text-tb-text-secondary">
              <span>Aidants impliqués</span>
              <span className="font-medium text-tb-text-primary">{stats.caregiverCount}</span>
            </div>
            <div className="flex justify-between text-tb-text-secondary">
              <span>Facilitateurs</span>
              <span className="font-medium text-tb-text-primary">{stats.facilitatorCount}</span>
            </div>
            <div className="flex justify-between text-tb-text-secondary pt-1 border-t border-tb-border">
              <span className="font-medium text-tb-text-primary">Total participants</span>
              <span className="font-bold text-tb-text-primary">{stats.totalParticipants}</span>
            </div>
          </div>
        </div>

        {/* Wellbeing */}
        {wellbeingStats?.summary && (
          <div className="p-5 rounded-xl bg-tb-surface border border-tb-border">
            <h3 className="font-semibold text-tb-text-primary mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-tb-accent" />
              Impact humain
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-tb-text-secondary">
                <span>Score wellbeing BEFORE</span>
                <span className="font-medium text-tb-text-primary">
                  {wellbeingStats.comparison?.beforeAverage != null
                    ? wellbeingStats.comparison.beforeAverage.toFixed(1)
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between text-tb-text-secondary">
                <span>Score wellbeing AFTER</span>
                <span className="font-medium text-tb-text-primary">
                  {wellbeingStats.comparison?.afterAverage != null
                    ? wellbeingStats.comparison.afterAverage.toFixed(1)
                    : "—"}
                </span>
              </div>
              {wellbeingStats.comparison?.evolution != null && (
                <div className="flex justify-between text-tb-text-secondary pt-1 border-t border-tb-border">
                  <span className="font-medium text-tb-text-primary">Évolution</span>
                  <span
                    className={`font-bold ${
                      wellbeingStats.comparison.evolution > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {wellbeingStats.comparison.evolution > 0 ? "+" : ""}
                    {wellbeingStats.comparison.evolution.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
            {wellbeingStats.commentCount > 0 && (
              <div className="mt-3">
                <Link
                  href={`/organizations/${orgSlug}/programs/${program.slug}/wellbeing`}
                  className="text-sm text-tb-accent hover:underline"
                >
                  Voir les {wellbeingStats.commentCount} témoignage{wellbeingStats.commentCount > 1 ? "s" : ""} anonymisé{wellbeingStats.commentCount > 1 ? "s" : ""}
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Verbatims if any */}
        {wellbeingStats && wellbeingStats.commentCount > 0 && (
          <div className="p-5 rounded-xl bg-tb-surface border border-tb-border">
            <h3 className="font-semibold text-tb-text-primary mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-tb-accent" />
              Verbatims anonymisés
            </h3>
            <Link
              href={`/organizations/${orgSlug}/programs/${program.slug}/wellbeing`}
              className="text-sm text-tb-accent hover:underline"
            >
              Voir les témoignages anonymes
            </Link>
          </div>
        )}

        {/* Report link */}
        <div className="p-5 rounded-xl bg-tb-surface border border-tb-border">
          <Link
            href={`/organizations/${orgSlug}/reports`}
            className="flex items-center gap-3 text-tb-text-primary hover:text-tb-accent transition-colors"
          >
            <FileText className="w-5 h-5 text-tb-accent" />
            <div>
              <p className="font-medium text-sm">Générer un rapport d&apos;impact complet</p>
              <p className="text-xs text-tb-text-tertiary">
                Incluez ces données dans un rapport structuré pour vos financeurs et partenaires.
              </p>
            </div>
          </Link>
        </div>

        {/* Disclaimer */}
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700">
            Ces données permettent à l&apos;organisation de suivre l&apos;impact social du programme,
            en combinant activité mesurée et ressenti humain déclaré.
          </p>
        </div>
      </div>
    </div>
  )
}
