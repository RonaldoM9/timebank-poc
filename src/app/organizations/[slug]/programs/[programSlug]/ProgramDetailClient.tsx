"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Users,
  Heart,
  FileText,
  Target,
  Clock,
  Award,
  Activity,
  UserPlus,
  Archive,
  TrendingUp,
  MessageSquare,
  Calendar,
} from "lucide-react"
import { PROGRAM_TYPES, PROGRAM_STATUSES } from "@/lib/program-labels"
import { activateProgramAction, archiveProgramAction } from "@/app/actions/programs"
import type { ProgramStats } from "@/lib/programs"

type ProgramData = {
  id: string
  name: string
  slug: string
  type: string
  status: string
  description: string | null
  shortDescription: string | null
  startDate: string | null
  endDate: string | null
  targetAudience: string | null
  goalsJson: string | null
  settingsJson: string | null
  createdAt: string
  organization: { name: string; slug: string }
  participantCount: number
}

type WellbeingData = {
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

export default function ProgramDetailClient({
  program,
  orgSlug,
  orgName,
  stats,
  wellbeingStats,
  canManage,
  canFacilitate,
}: {
  program: ProgramData
  orgSlug: string
  orgName: string
  stats: ProgramStats
  wellbeingStats: WellbeingData | null
  canManage: boolean
  canFacilitate: boolean
}) {
  const router = useRouter()
  const typeLabel = PROGRAM_TYPES[program.type] || program.type
  const statusLabel = PROGRAM_STATUSES[program.status] || program.status

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    DRAFT: "bg-gray-100 text-gray-600",
    COMPLETED: "bg-blue-100 text-blue-700",
    ARCHIVED: "bg-orange-100 text-orange-600",
  }

  let goals: string[] = []
  try {
    if (program.goalsJson) goals = JSON.parse(program.goalsJson)
  } catch {}

  return (
    <div className="min-h-screen bg-tb-background">
      {/* Header */}
      <div className="border-b border-tb-border bg-tb-surface">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link
            href={`/organizations/${orgSlug}/programs`}
            className="inline-flex items-center gap-2 text-sm text-tb-text-secondary hover:text-tb-text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux programmes
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-tb-text-primary">{program.name}</h1>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[program.status] || "bg-gray-100 text-gray-600"}`}
                >
                  {statusLabel}
                </span>
              </div>
              <p className="text-sm text-tb-text-secondary">
                Organisation : {orgName}
                {program.startDate && (
                  <> · {new Date(program.startDate).toLocaleDateString("fr-FR")}</>
                )}
                {program.endDate && (
                  <> → {new Date(program.endDate).toLocaleDateString("fr-FR")}</>
                )}
              </p>
              {program.shortDescription && (
                <p className="text-sm text-tb-text-secondary mt-1">{program.shortDescription}</p>
              )}
            </div>

            <div className="flex gap-2">
              {(program.status === "DRAFT" || program.status === "ACTIVE") && canManage && (
                <>
                  {program.status === "DRAFT" && (
                    <button
                      onClick={async () => {
                        const fd = new FormData()
                        fd.set("programId", program.id)
                        fd.set("organizationId", orgSlug)
                        await activateProgramAction(fd)
                        router.refresh()
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <Activity className="w-4 h-4" />
                      Activer
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      const fd = new FormData()
                      fd.set("programId", program.id)
                      fd.set("organizationId", orgSlug)
                      await archiveProgramAction(fd)
                      router.refresh()
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-tb-surface-elevated text-tb-text-primary hover:bg-tb-border transition-colors text-sm font-medium border border-tb-border"
                  >
                    <Archive className="w-4 h-4" />
                    Archiver
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Quick actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          {canFacilitate && (
            <Link
              href={`/organizations/${orgSlug}/programs/${program.slug}/participants`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-tb-accent text-white hover:bg-tb-accent-hover transition-colors text-sm font-medium"
            >
              <UserPlus className="w-4 h-4" />
              Ajouter un participant
            </Link>
          )}
          {canFacilitate && (
            <Link
              href={`/organizations/${orgSlug}/programs/${program.slug}/missions`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-tb-surface-elevated text-tb-text-primary hover:bg-tb-border transition-colors text-sm font-medium border border-tb-border"
            >
              <Target className="w-4 h-4" />
              Créer une mission
            </Link>
          )}
          <Link
            href={`/organizations/${orgSlug}/programs/${program.slug}/wellbeing`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-tb-surface-elevated text-tb-text-primary hover:bg-tb-border transition-colors text-sm font-medium border border-tb-border"
          >
            <Heart className="w-4 h-4" />
            Impact humain
          </Link>
          <Link
            href={`/organizations/${orgSlug}/programs/${program.slug}/impact`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-tb-surface-elevated text-tb-text-primary hover:bg-tb-border transition-colors text-sm font-medium border border-tb-border"
          >
            <TrendingUp className="w-4 h-4" />
            Voir l'impact
          </Link>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <KpiCard icon={<Heart className="w-5 h-5" />} label="Seniors accompagnés" value={stats.seniorCount} color="text-purple-600" />
          <KpiCard icon={<Users className="w-5 h-5" />} label="Heroes mobilisés" value={stats.heroCount} color="text-blue-600" />
          <KpiCard icon={<Target className="w-5 h-5" />} label="Missions réalisées" value={stats.completedMissionCount} color="text-green-600" />
          <KpiCard icon={<Clock className="w-5 h-5" />} label="Heures mobilisées" value={`${stats.totalHours}h`} color="text-amber-600" />
          <KpiCard icon={<Award className="w-5 h-5" />} label="TIME distribués" value={stats.totalTime} color="text-tb-accent" />
          <KpiCard icon={<Users className="w-5 h-5" />} label="Aidants impliqués" value={stats.caregiverCount} color="text-indigo-600" />
          {wellbeingStats?.summary?.averageScore != null && (
            <KpiCard
              icon={<Activity className="w-5 h-5" />}
              label="Score wellbeing moyen"
              value={`${wellbeingStats.summary.averageScore}/100`}
              color="text-teal-600"
            />
          )}
          {wellbeingStats?.comparison?.evolution != null && (
            <KpiCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Évolution wellbeing"
              value={`${wellbeingStats.comparison.evolution > 0 ? "+" : ""}${wellbeingStats.comparison.evolution.toFixed(1)}`}
              color={wellbeingStats.comparison.evolution > 0 ? "text-green-600" : "text-red-600"}
            />
          )}
        </div>

        {/* Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Participants */}
          <div className="p-5 rounded-xl bg-tb-surface border border-tb-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-tb-text-primary flex items-center gap-2">
                <Users className="w-4 h-4 text-tb-accent" />
                Participants
              </h3>
              {canFacilitate && (
                <Link
                  href={`/organizations/${orgSlug}/programs/${program.slug}/participants`}
                  className="text-sm text-tb-accent hover:underline"
                >
                  Gérer
                </Link>
              )}
            </div>
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
            </div>
          </div>

          {/* Missions */}
          <div className="p-5 rounded-xl bg-tb-surface border border-tb-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-tb-text-primary flex items-center gap-2">
                <Target className="w-4 h-4 text-tb-accent" />
                Missions
              </h3>
              {canFacilitate && (
                <Link
                  href={`/organizations/${orgSlug}/programs/${program.slug}/missions`}
                  className="text-sm text-tb-accent hover:underline"
                >
                  Gérer
                </Link>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-tb-text-secondary">
                <span>Missions créées</span>
                <span className="font-medium text-tb-text-primary">{stats.missionCount}</span>
              </div>
              <div className="flex justify-between text-tb-text-secondary">
                <span>Missions terminées</span>
                <span className="font-medium text-tb-text-primary">{stats.completedMissionCount}</span>
              </div>
              <div className="flex justify-between text-tb-text-secondary">
                <span>Taux de complétion</span>
                <span className="font-medium text-tb-text-primary">
                  {stats.missionCount > 0
                    ? `${Math.round((stats.completedMissionCount / stats.missionCount) * 100)}%`
                    : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Impact humain */}
          <div className="p-5 rounded-xl bg-tb-surface border border-tb-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-tb-text-primary flex items-center gap-2">
                <Heart className="w-4 h-4 text-tb-accent" />
                Impact humain
              </h3>
              <Link
                href={`/organizations/${orgSlug}/programs/${program.slug}/wellbeing`}
                className="text-sm text-tb-accent hover:underline"
              >
                Voir
              </Link>
            </div>
            {wellbeingStats?.summary ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-tb-text-secondary">
                  <span>Réponses</span>
                  <span className="font-medium text-tb-text-primary">
                    {wellbeingStats.summary.totalResponses}
                  </span>
                </div>
                <div className="flex justify-between text-tb-text-secondary">
                  <span>Score moyen</span>
                  <span className="font-medium text-tb-text-primary">
                    {wellbeingStats.summary.averageScore ?? "—"}/100
                  </span>
                </div>
                {wellbeingStats.comparison != null && (
                  <div className="flex justify-between text-tb-text-secondary">
                    <span>Évolution</span>
                    <span
                      className={`font-medium ${
                        (wellbeingStats.comparison.afterAverage ?? 0) >= (wellbeingStats.comparison.beforeAverage ?? 0)
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {(wellbeingStats.comparison.beforeAverage ?? 0) > 0
                        ? `${(wellbeingStats.comparison.afterAverage ?? 0) - (wellbeingStats.comparison.beforeAverage ?? 0) > 0 ? "+" : ""}${((wellbeingStats.comparison.afterAverage ?? 0) - (wellbeingStats.comparison.beforeAverage ?? 0)).toFixed(1)}`
                        : "—"}
                    </span>
                  </div>
                )}
                {wellbeingStats.commentCount > 0 && (
                  <div className="flex justify-between text-tb-text-secondary">
                    <span>Témoignages</span>
                    <span className="font-medium text-tb-text-primary">
                      {wellbeingStats.commentCount}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-tb-text-tertiary">
                Aucune donnée d&apos;impact humain pour le moment.
              </p>
            )}
          </div>

          {/* Objectifs */}
          <div className="p-5 rounded-xl bg-tb-surface border border-tb-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-tb-text-primary flex items-center gap-2">
                <Target className="w-4 h-4 text-tb-accent" />
                Objectifs
              </h3>
            </div>
            {goals.length > 0 ? (
              <ul className="space-y-1.5">
                {goals.map((goal, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-tb-text-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-tb-accent mt-1.5 shrink-0" />
                    {goal}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-tb-text-tertiary">
                Aucun objectif défini.
              </p>
            )}
          </div>
        </div>

        {/* Rapport d'impact link */}
        <div className="mt-6 p-4 rounded-xl bg-tb-surface border border-tb-border">
          <Link
            href={`/organizations/${orgSlug}/reports`}
            className="flex items-center gap-3 text-tb-text-primary hover:text-tb-accent transition-colors"
          >
            <FileText className="w-5 h-5 text-tb-accent" />
            <div>
              <p className="font-medium text-sm">Générer un rapport d&apos;impact</p>
              <p className="text-xs text-tb-text-tertiary">
                Créez un rapport complet combinant activité et impact humain.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  icon,
  label,
  value,
  color = "text-tb-accent",
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  color?: string
}) {
  return (
    <div className="p-4 rounded-xl bg-tb-surface border border-tb-border">
      <div className={`mb-2 ${color}`}>{icon}</div>
      <div className="text-2xl font-bold text-tb-text-primary">{value}</div>
      <div className="text-xs text-tb-text-secondary mt-1">{label}</div>
    </div>
  )
}
