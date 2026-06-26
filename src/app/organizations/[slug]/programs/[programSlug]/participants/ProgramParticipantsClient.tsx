"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, UserPlus, X, Pause, User, Users } from "lucide-react"
import { PROGRAM_PARTICIPANT_ROLES, PROGRAM_PARTICIPANT_ROLE_OPTIONS } from "@/lib/program-labels"
import {
  addProgramParticipantAction,
  removeProgramParticipantAction,
  pauseProgramParticipantAction,
} from "@/app/actions/programs"

type ParticipantItem = {
  id: string
  userId: string
  role: string
  status: string
  joinedAt: string
  removedAt: string | null
  user: { name: string; email: string; avatar: string | null }
}

type AvailableUser = {
  id: string
  name: string
  email: string
}

export default function ProgramParticipantsClient({
  program,
  orgSlug,
  participants,
  availableUsers,
  canManage,
}: {
  program: { id: string; name: string; slug: string }
  orgSlug: string
  participants: ParticipantItem[]
  availableUsers: AvailableUser[]
  canManage: boolean
}) {
  const router = useRouter()
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState("")
  const [selectedRole, setSelectedRole] = useState("SENIOR")
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  const activeParticipants = participants.filter((p) => p.status === "ACTIVE")
  const pausedParticipants = participants.filter((p) => p.status === "PAUSED")
  const removedParticipants = participants.filter((p) => p.status === "REMOVED")

  async function handleAdd() {
    if (!selectedUserId) return
    setAdding(true)
    setError(null)
    const fd = new FormData()
    fd.set("programId", program.id)
    fd.set("userId", selectedUserId)
    fd.set("role", selectedRole)
    fd.set("organizationId", orgSlug)

    const result = await addProgramParticipantAction(fd)

    if ("error" in result) {
      setError(result.error as string)
      setAdding(false)
      return
    }

    setShowAddForm(false)
    setSelectedUserId("")
    setSelectedRole("SENIOR")
    setAdding(false)
    router.refresh()
  }

  async function handleRemove(userId: string) {
    const fd = new FormData()
    fd.set("programId", program.id)
    fd.set("userId", userId)
    fd.set("organizationId", orgSlug)
    await removeProgramParticipantAction(fd)
    router.refresh()
  }

  async function handlePause(userId: string) {
    const fd = new FormData()
    fd.set("programId", program.id)
    fd.set("userId", userId)
    fd.set("organizationId", orgSlug)
    await pauseProgramParticipantAction(fd)
    router.refresh()
  }

  function getRoleBadgeColor(role: string) {
    const colors: Record<string, string> = {
      SENIOR: "bg-purple-100 text-purple-700",
      HERO: "bg-blue-100 text-blue-700",
      CAREGIVER: "bg-indigo-100 text-indigo-700",
      FACILITATOR: "bg-amber-100 text-amber-700",
      OBSERVER: "bg-gray-100 text-gray-600",
    }
    return colors[role] || "bg-gray-100 text-gray-600"
  }

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-tb-text-primary">Participants</h1>
              <p className="text-tb-text-secondary mt-1">
                {program.name} · {activeParticipants.length} participant{activeParticipants.length !== 1 ? "s" : ""} actif{activeParticipants.length !== 1 ? "s" : ""}
              </p>
            </div>
            {canManage && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-tb-accent text-white hover:bg-tb-accent-hover transition-colors text-sm font-medium"
              >
                <UserPlus className="w-4 h-4" />
                Ajouter un participant
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Add form */}
        {showAddForm && canManage && (
          <div className="mb-6 p-5 rounded-xl bg-tb-surface border border-tb-border">
            <h3 className="font-medium text-tb-text-primary mb-4">Ajouter un participant</h3>
            {error && (
              <div className="mb-3 p-2 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
            )}
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium text-tb-text-primary mb-1">
                  Utilisateur
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-tb-border bg-tb-background text-tb-text-primary focus:outline-none focus:ring-2 focus:ring-tb-accent/30"
                >
                  <option value="">Sélectionnez un membre de l'organisation</option>
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-tb-text-primary mb-1">
                  Rôle
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-tb-border bg-tb-background text-tb-text-primary focus:outline-none focus:ring-2 focus:ring-tb-accent/30"
                >
                  {PROGRAM_PARTICIPANT_ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded-xl bg-tb-surface-elevated text-tb-text-primary hover:bg-tb-border transition-colors text-sm border border-tb-border"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!selectedUserId || adding}
                  className="px-4 py-2 rounded-xl bg-tb-accent text-white hover:bg-tb-accent-hover transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {adding ? "Ajout..." : "Ajouter"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active participants */}
        {activeParticipants.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-tb-text-primary mb-3">Actifs</h2>
            <div className="space-y-2">
              {activeParticipants.map((p) => (
                <ParticipantRow
                  key={p.id}
                  participant={p}
                  canManage={canManage}
                  onRemove={() => handleRemove(p.userId)}
                  onPause={() => handlePause(p.userId)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {participants.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-tb-surface-elevated flex items-center justify-center">
              <Users className="w-8 h-8 text-tb-text-tertiary" />
            </div>
            <h3 className="text-lg font-medium text-tb-text-primary mb-2">
              Aucun participant ajouté
            </h3>
            <p className="text-tb-text-secondary mb-6 max-w-md mx-auto">
              Ajoutez des seniors, Heroes ou facilitateurs pour démarrer le programme.
            </p>
          </div>
        )}

        {/* Paused participants */}
        {pausedParticipants.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-tb-text-primary mb-3">En pause ({pausedParticipants.length})</h2>
            <div className="space-y-2">
              {pausedParticipants.map((p) => (
                <ParticipantRow
                  key={p.id}
                  participant={p}
                  canManage={canManage}
                  onRemove={() => handleRemove(p.userId)}
                  onPause={() => handlePause(p.userId)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Removed participants */}
        {removedParticipants.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-tb-text-primary mb-3">Retirés ({removedParticipants.length})</h2>
            <div className="space-y-2">
              {removedParticipants.map((p) => (
                <ParticipantRow
                  key={p.id}
                  participant={p}
                  canManage={false}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function ParticipantRow({
  participant,
  canManage,
  onRemove,
  onPause,
}: {
  participant: ParticipantItem
  canManage: boolean
  onRemove?: () => void
  onPause?: () => void
}) {
  const roleLabel = PROGRAM_PARTICIPANT_ROLES[participant.role] || participant.role
  const initials = participant.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const statusColors: Record<string, string> = {
    ACTIVE: "",
    PAUSED: "opacity-60",
    REMOVED: "opacity-40 line-through",
  }

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl bg-tb-surface border border-tb-border ${statusColors[participant.status] || ""}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-tb-accent/10 flex items-center justify-center text-xs font-semibold text-tb-accent">
          {initials}
        </div>
        <div>
          <p className="text-sm font-medium text-tb-text-primary">{participant.user.name}</p>
          <p className="text-xs text-tb-text-tertiary">{participant.user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          participant.role === "SENIOR" ? "bg-purple-100 text-purple-700" :
          participant.role === "HERO" ? "bg-blue-100 text-blue-700" :
          participant.role === "CAREGIVER" ? "bg-indigo-100 text-indigo-700" :
          participant.role === "FACILITATOR" ? "bg-amber-100 text-amber-700" :
          "bg-gray-100 text-gray-600"
        }`}>
          {roleLabel}
        </span>
        {canManage && participant.status === "ACTIVE" && (
          <>
            <button
              onClick={onPause}
              className="p-1.5 rounded-lg hover:bg-tb-border transition-colors text-tb-text-tertiary hover:text-tb-text-primary"
              title="Mettre en pause"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRemove}
              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-tb-text-tertiary hover:text-red-600"
              title="Retirer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
