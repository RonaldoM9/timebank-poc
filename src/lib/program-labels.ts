// ─── Labels et constantes pour les programmes organisation ──────────────

export const PROGRAM_TYPES: Record<string, string> = {
  SENIOR_SOCIAL_LINK: "Lien Social Seniors",
  DIGITAL_INCLUSION: "Inclusion numérique",
  YOUTH_ENGAGEMENT: "Engagement jeunes",
  CAREGIVER_SUPPORT: "Soutien aux aidants",
  NEIGHBORHOOD_SOLIDARITY: "Solidarité de quartier",
  OTHER: "Autre",
} as const

export const PROGRAM_STATUSES: Record<string, string> = {
  DRAFT: "Brouillon",
  ACTIVE: "Actif",
  COMPLETED: "Terminé",
  ARCHIVED: "Archivé",
} as const

export const PROGRAM_PARTICIPANT_ROLES: Record<string, string> = {
  SENIOR: "Senior accompagné",
  HERO: "Hero bénévole",
  CAREGIVER: "Aidant / proche",
  FACILITATOR: "Facilitateur",
  OBSERVER: "Observateur",
} as const

export const PROGRAM_TYPE_OPTIONS = Object.entries(PROGRAM_TYPES).map(([value, label]) => ({
  value,
  label,
}))

export const PROGRAM_STATUS_OPTIONS = Object.entries(PROGRAM_STATUSES).map(([value, label]) => ({
  value,
  label,
}))

export const PROGRAM_PARTICIPANT_ROLE_OPTIONS = Object.entries(PROGRAM_PARTICIPANT_ROLES).map(
  ([value, label]) => ({ value, label })
)

export type ProgramType = keyof typeof PROGRAM_TYPES
export type ProgramStatus = keyof typeof PROGRAM_STATUSES
export type ProgramParticipantRole = keyof typeof PROGRAM_PARTICIPANT_ROLES
