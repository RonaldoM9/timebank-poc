"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Rocket, Save } from "lucide-react"
import { PROGRAM_TYPE_OPTIONS } from "@/lib/program-labels"
import { createOrganizationProgramAction, createSeniorProgramFromTemplateAction } from "@/app/actions/programs"

export default function ProgramCreateClient({
  organization,
}: {
  organization: { id: string; name: string; slug: string }
}) {
  const router = useRouter()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleManualSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})

    const form = e.currentTarget
    const fd = new FormData(form)
    fd.set("organizationId", organization.id)

    const result = await createOrganizationProgramAction(fd)

    if ("error" in result) {
      setErrors({ form: result.error as string })
      setSubmitting(false)
      return
    }

    router.push(`/organizations/${organization.slug}/programs`)
    router.refresh()
  }

  async function handleTemplateCreate() {
    setSubmitting(true)
    const fd = new FormData()
    fd.set("organizationId", organization.id)

    const result = await createSeniorProgramFromTemplateAction(fd)

    if ("error" in result) {
      setErrors({ form: result.error as string })
      setSubmitting(false)
      return
    }

    router.push(`/organizations/${organization.slug}/programs`)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-tb-background">
      <div className="border-b border-tb-border bg-tb-surface">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link
            href={`/organizations/${organization.slug}/programs`}
            className="inline-flex items-center gap-2 text-sm text-tb-text-secondary hover:text-tb-text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux programmes
          </Link>
          <h1 className="text-2xl font-bold text-tb-text-primary">Créer un programme</h1>
          <p className="text-tb-text-secondary mt-1">
            Définissez un nouveau programme pour structurer vos actions locales.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Template CTA */}
        <div className="mb-8 p-5 rounded-xl bg-tb-surface border border-tb-border">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-tb-accent/10 flex items-center justify-center shrink-0">
              <Rocket className="w-5 h-5 text-tb-accent" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-tb-text-primary mb-1">
                Activer le programme Lien Social Seniors
              </h3>
              <p className="text-sm text-tb-text-secondary mb-3">
                Un programme clé en main de 12 semaines pour réduire l&apos;isolement des seniors —
                avec missions, participants et suivi d&apos;impact préconfigurés.
              </p>
              <button
                onClick={handleTemplateCreate}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-tb-accent text-white hover:bg-tb-accent-hover transition-colors text-sm font-medium disabled:opacity-50"
              >
                <Rocket className="w-4 h-4" />
                Activer le template Lien Social Seniors
              </button>
            </div>
          </div>
        </div>

        {/* Manual form */}
        <div className="p-6 rounded-xl bg-tb-surface border border-tb-border">
          <h2 className="text-lg font-semibold text-tb-text-primary mb-6">
            Ou créer un programme personnalisé
          </h2>

          <form onSubmit={handleManualSubmit} className="space-y-5">
            {errors.form && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {errors.form}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-tb-text-primary mb-1">
                Nom du programme *
              </label>
              <input
                name="name"
                required
                minLength={3}
                maxLength={100}
                placeholder="ex: Programme Lien Social Seniors"
                className="w-full px-3 py-2 rounded-xl border border-tb-border bg-tb-background text-tb-text-primary placeholder:text-tb-text-tertiary focus:outline-none focus:ring-2 focus:ring-tb-accent/30 focus:border-tb-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-tb-text-primary mb-1">
                Type de programme *
              </label>
              <select
                name="type"
                required
                className="w-full px-3 py-2 rounded-xl border border-tb-border bg-tb-background text-tb-text-primary focus:outline-none focus:ring-2 focus:ring-tb-accent/30 focus:border-tb-accent"
              >
                <option value="">Sélectionnez un type</option>
                {PROGRAM_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-tb-text-primary mb-1">
                Description courte *
              </label>
              <textarea
                name="shortDescription"
                required
                maxLength={200}
                rows={2}
                placeholder="Résumez le programme en quelques mots (max 200 caractères)"
                className="w-full px-3 py-2 rounded-xl border border-tb-border bg-tb-background text-tb-text-primary placeholder:text-tb-text-tertiary focus:outline-none focus:ring-2 focus:ring-tb-accent/30 focus:border-tb-accent resize-none"
              />
              <p className="text-xs text-tb-text-tertiary mt-1">Maximum 200 caractères</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-tb-text-primary mb-1">
                Description complète
              </label>
              <textarea
                name="description"
                rows={4}
                placeholder="Décrivez les objectifs, le public cible et le déroulement du programme"
                className="w-full px-3 py-2 rounded-xl border border-tb-border bg-tb-background text-tb-text-primary placeholder:text-tb-text-tertiary focus:outline-none focus:ring-2 focus:ring-tb-accent/30 focus:border-tb-accent resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-tb-text-primary mb-1">
                  Date de début
                </label>
                <input
                  name="startDate"
                  type="date"
                  className="w-full px-3 py-2 rounded-xl border border-tb-border bg-tb-background text-tb-text-primary focus:outline-none focus:ring-2 focus:ring-tb-accent/30 focus:border-tb-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tb-text-primary mb-1">
                  Date de fin
                </label>
                <input
                  name="endDate"
                  type="date"
                  className="w-full px-3 py-2 rounded-xl border border-tb-border bg-tb-background text-tb-text-primary focus:outline-none focus:ring-2 focus:ring-tb-accent/30 focus:border-tb-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-tb-text-primary mb-1">
                Public cible
              </label>
              <input
                name="targetAudience"
                placeholder="ex: Seniors isolés, aidants, habitants volontaires"
                className="w-full px-3 py-2 rounded-xl border border-tb-border bg-tb-background text-tb-text-primary placeholder:text-tb-text-tertiary focus:outline-none focus:ring-2 focus:ring-tb-accent/30 focus:border-tb-accent"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-tb-accent text-white hover:bg-tb-accent-hover transition-colors text-sm font-medium disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Créer le programme
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
