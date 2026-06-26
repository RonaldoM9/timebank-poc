"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Target, Clock, User, Calendar, AlertCircle } from "lucide-react"
import { createProgramMissionFromTemplateAction } from "@/app/actions/programs"
import { MISSION_PRECAUTION_TEXT } from "@/lib/senior-program-templates"

type MissionItem = {
  id: string
  title: string
  description: string
  status: string
  category: string
  createdAt: string
  provider: { name: string }
  bookingCount: number
}

type TemplateItem = {
  code: string
  name: string
  type: string
  description: string
  estimatedDurationHours: number | null
  estimatedTime: number | null
  category: string
}

type ParticipantItem = {
  id: string
  name: string
}

export default function ProgramMissionsClient({
  program,
  orgSlug,
  orgId,
  missions,
  templates,
  seniors,
  heroes,
  canManage,
  canView,
}: {
  program: { id: string; name: string; slug: string }
  orgSlug: string
  orgId: string
  missions: MissionItem[]
  templates: TemplateItem[]
  seniors: ParticipantItem[]
  heroes: ParticipantItem[]
  canManage: boolean
  canView: boolean
}) {
  const router = useRouter()
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null)
  const [selectedHero, setSelectedHero] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  async function handleCreateFromTemplate() {
    if (!selectedTemplate || !selectedHero) return
    setCreating(true)
    setError(null)

    const fd = new FormData()
    fd.set("organizationId", orgId)
    fd.set("templateCode", selectedTemplate.code)
    fd.set("providerId", selectedHero)
    fd.set("programId", program.id)

    const result = await createProgramMissionFromTemplateAction(fd)

    if ("error" in result) {
      setError(result.error as string)
      setCreating(false)
      return
    }

    setSelectedTemplate(null)
    setShowTemplatePicker(false)
    setSelectedHero("")
    setCreating(false)
    router.refresh()
  }

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    completed: "bg-blue-100 text-blue-700",
    cancelled: "bg-gray-100 text-gray-600",
  }

  const allParticipants = [...seniors, ...heroes]

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-tb-text-primary">Missions</h1>
              <p className="text-tb-text-secondary mt-1">
                {program.name} · {missions.length} mission{missions.length !== 1 ? "s" : ""}
              </p>
            </div>
            {canManage && (
              <button
                onClick={() => setShowTemplatePicker(!showTemplatePicker)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-tb-accent text-white hover:bg-tb-accent-hover transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Créer depuis un template
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Template picker */}
        {showTemplatePicker && (
          <div className="mb-6 p-5 rounded-xl bg-tb-surface border border-tb-border">
            <h3 className="font-medium text-tb-text-primary mb-4">Créer une mission depuis un template</h3>

            {error && (
              <div className="mb-3 p-2 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
            )}

            {/* Precaution text */}
            <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">{MISSION_PRECAUTION_TEXT}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 max-h-80 overflow-y-auto">
              {templates.map((t) => (
                <button
                  key={t.code}
                  onClick={() => setSelectedTemplate(t)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedTemplate?.code === t.code
                      ? "border-tb-accent bg-tb-accent/5"
                      : "border-tb-border hover:border-tb-accent/30 bg-tb-background"
                  }`}
                >
                  <p className="text-sm font-medium text-tb-text-primary">{t.name}</p>
                  <p className="text-xs text-tb-text-secondary mt-1 line-clamp-2">{t.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-tb-text-tertiary">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {t.estimatedDurationHours}h
                    </span>
                    <span>{t.type}</span>
                  </div>
                </button>
              ))}
            </div>

            {selectedTemplate && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-tb-text-primary mb-1">
                    Confier la mission à
                  </label>
                  <select
                    value={selectedHero}
                    onChange={(e) => setSelectedHero(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-tb-border bg-tb-background text-tb-text-primary focus:outline-none focus:ring-2 focus:ring-tb-accent/30"
                  >
                    <option value="">Sélectionnez un Hero</option>
                    {heroes.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setShowTemplatePicker(false)
                      setSelectedTemplate(null)
                    }}
                    className="px-4 py-2 rounded-xl bg-tb-surface-elevated text-tb-text-primary hover:bg-tb-border transition-colors text-sm border border-tb-border"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCreateFromTemplate}
                    disabled={!selectedHero || creating}
                    className="px-4 py-2 rounded-xl bg-tb-accent text-white hover:bg-tb-accent-hover transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {creating ? "Création..." : `Créer : ${selectedTemplate.name}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Missions list */}
        {missions.length > 0 ? (
          <div className="space-y-2">
            {missions.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-tb-surface border border-tb-border"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-tb-text-primary">{m.title}</h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          statusColors[m.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                    <p className="text-xs text-tb-text-secondary line-clamp-2">{m.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-tb-text-tertiary">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {m.provider.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(m.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                      {m.bookingCount > 0 && <span>{m.bookingCount} réservation{m.bookingCount > 1 ? "s" : ""}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-tb-surface-elevated flex items-center justify-center">
              <Target className="w-8 h-8 text-tb-text-tertiary" />
            </div>
            <h3 className="text-lg font-medium text-tb-text-primary mb-2">
              Aucune mission liée à ce programme
            </h3>
            <p className="text-tb-text-secondary mb-6 max-w-md mx-auto">
              Créez une première mission depuis un template senior.
            </p>
            {canManage && (
              <button
                onClick={() => setShowTemplatePicker(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-tb-accent text-white hover:bg-tb-accent-hover transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Créer depuis un template
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
