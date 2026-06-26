"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { startTransition } from "react"
import { FolderKanban, Plus, Rocket, Archive, AlertCircle } from "lucide-react"
import { PROGRAM_TYPES, PROGRAM_STATUSES } from "@/lib/program-labels"
import { createOrganizationProgramAction, activateProgramAction, archiveProgramAction } from "@/app/actions/programs"

type ProgramItem = {
  id: string
  name: string
  slug: string
  type: string
  status: string
  shortDescription: string | null
  createdAt: string
  participantCount: number
}

export default function ProgramsListClient({
  organization,
  programs,
  canManage,
  isFacilitator,
}: {
  organization: { id: string; name: string; slug: string }
  programs: ProgramItem[]
  canManage: boolean
  isFacilitator: boolean
}) {
  const router = useRouter()

  const activePrograms = programs.filter((p) => p.status === "ACTIVE")
  const draftPrograms = programs.filter((p) => p.status === "DRAFT")
  const completedPrograms = programs.filter((p) => ["COMPLETED", "ARCHIVED"].includes(p.status))

  return (
    <div className="min-h-screen bg-tb-background">
      {/* Header */}
      <div className="border-b border-tb-border bg-tb-surface">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-tb-text-primary">Programmes</h1>
              <p className="text-tb-text-secondary mt-1">
                Structurez vos actions locales avec des programmes suivis, mesurables et activables.
              </p>
            </div>
            {canManage && (
              <div className="flex gap-3">
                <Link
                  href={`/organizations/${organization.slug}/programs/new`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-tb-accent text-white hover:bg-tb-accent-hover transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Créer un programme
                </Link>
                <form
                  action={async () => {
                    const fd = new FormData()
                    fd.set("organizationId", organization.id)
                    startTransition(() => {
                      const form = document.createElement("form")
                      form.method = "POST"
                      // Use the template action
                      const input = document.createElement("input")
                      input.name = "organizationId"
                      input.value = organization.id
                      form.appendChild(input)
                      document.body.appendChild(form)
                      form.requestSubmit()
                    })
                  }}
                >
                  <button
                    type="submit"
                    formAction={async (fd) => {
                      fd.set("organizationId", organization.id)
                      await createOrganizationProgramAction(fd)
                      router.refresh()
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-tb-surface-elevated text-tb-text-primary hover:bg-tb-border transition-colors text-sm font-medium border border-tb-border"
                  >
                    <Rocket className="w-4 h-4 text-tb-accent" />
                    Activer le programme Lien Social Seniors
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {/* Active programs */}
        {activePrograms.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-tb-text-primary mb-4">
              Programmes actifs ({activePrograms.length})
            </h2>
            <div className="grid gap-4">
              {activePrograms.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  orgSlug={organization.slug}
                  canManage={canManage}
                />
              ))}
            </div>
          </section>
        )}

        {/* Draft programs */}
        {draftPrograms.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-tb-text-primary mb-4">
              Brouillons ({draftPrograms.length})
            </h2>
            <div className="grid gap-4">
              {draftPrograms.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  orgSlug={organization.slug}
                  canManage={canManage}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {programs.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-tb-surface-elevated flex items-center justify-center">
              <FolderKanban className="w-8 h-8 text-tb-text-tertiary" />
            </div>
            <h3 className="text-lg font-medium text-tb-text-primary mb-2">
              Aucun programme pour le moment
            </h3>
            <p className="text-tb-text-secondary mb-6 max-w-md mx-auto">
              Créez un premier programme pour organiser vos actions locales.
            </p>
            {canManage && (
              <Link
                href={`/organizations/${organization.slug}/programs/new`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-tb-accent text-white hover:bg-tb-accent-hover transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Créer un programme
              </Link>
            )}
          </div>
        )}

        {/* Completed/Archived */}
        {completedPrograms.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-tb-text-primary mb-4">
              Archivés ({completedPrograms.length})
            </h2>
            <div className="grid gap-4">
              {completedPrograms.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  orgSlug={organization.slug}
                  canManage={canManage}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function ProgramCard({
  program,
  orgSlug,
  canManage,
}: {
  program: ProgramItem
  orgSlug: string
  canManage: boolean
}) {
  const statusLabel = PROGRAM_STATUSES[program.status] || program.status
  const typeLabel = PROGRAM_TYPES[program.type] || program.type

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    DRAFT: "bg-gray-100 text-gray-600",
    COMPLETED: "bg-blue-100 text-blue-700",
    ARCHIVED: "bg-orange-100 text-orange-600",
  }

  return (
    <Link
      href={`/organizations/${orgSlug}/programs/${program.slug}`}
      className="block p-5 rounded-xl bg-tb-surface border border-tb-border hover:border-tb-accent/30 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-base font-semibold text-tb-text-primary truncate">
              {program.name}
            </h3>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[program.status] || "bg-gray-100 text-gray-600"}`}
            >
              {statusLabel}
            </span>
          </div>
          {program.shortDescription && (
            <p className="text-sm text-tb-text-secondary line-clamp-2 mb-2">
              {program.shortDescription}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-tb-text-tertiary">
            <span>{typeLabel}</span>
            <span>{program.participantCount} participant{program.participantCount !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
