// ─── Labels centralisés pour les organisations ───────────────────────

export const ORGANIZATION_TYPES: Record<string, string> = {
  CITY: "Mairie / Collectivité",
  CCAS: "CCAS",
  ASSOCIATION: "Association",
  SOCIAL_LANDLORD: "Bailleur social",
  SCHOOL: "École / Université",
  COMPANY: "Entreprise RSE",
  FOUNDATION: "Fondation",
  SENIOR_RESIDENCE: "Résidence senior",
  COMMUNITY_CENTER: "Maison de quartier",
  OTHER: "Autre",
} as const;

export const ORGANIZATION_STATUSES: Record<string, string> = {
  PENDING_REVIEW: "En attente de validation",
  VERIFIED: "Vérifiée",
  ACTIVE: "Active",
  SUSPENDED: "Suspendue",
  ARCHIVED: "Archivée",
} as const;

export const ORGANIZATION_ROLES: Record<string, string> = {
  OWNER: "Responsable principal",
  ADMIN: "Admin organisation",
  FACILITATOR: "Facilitateur organisation",
  MEMBER: "Membre",
  VIEWER: "Lecteur",
} as const;

export const ORGANIZATION_ROLES_ORDER: Record<string, number> = {
  OWNER: 0,
  ADMIN: 1,
  FACILITATOR: 2,
  MEMBER: 3,
  VIEWER: 4,
};

export const ORGANIZATION_MEMBER_STATUSES: Record<string, string> = {
  ACTIVE: "Actif",
  INVITED: "Invité",
  REMOVED: "Retiré",
} as const;

export const POT_TRANSACTION_TYPES: Record<string, string> = {
  DONATION: "Don",
  FUNDING: "Financement mission",
  ADJUSTMENT: "Ajustement",
  REFUND: "Remboursement",
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────

export function getOrganizationTypeLabel(type: string): string {
  return ORGANIZATION_TYPES[type] || type || "Non défini";
}

export function getOrganizationStatusLabel(status: string): string {
  return ORGANIZATION_STATUSES[status] || status || "Inconnu";
}

export function getOrganizationRoleLabel(role: string): string {
  return ORGANIZATION_ROLES[role] || role || "Inconnu";
}

export function getMemberStatusLabel(status: string): string {
  return ORGANIZATION_MEMBER_STATUSES[status] || status || "Inconnu";
}

export function getPotTransactionTypeLabel(type: string): string {
  return POT_TRANSACTION_TYPES[type] || type || "Inconnu";
}

// ─── Couleurs pour badges ────────────────────────────────────────────

export function getOrganizationStatusColor(status: string): string {
  switch (status) {
    case "VERIFIED":
    case "ACTIVE":
      return "text-emerald-700 bg-emerald-50 border border-emerald-200";
    case "PENDING_REVIEW":
      return "text-amber-700 bg-amber-50 border border-amber-200";
    case "SUSPENDED":
      return "text-red-700 bg-red-50 border border-red-200";
    case "ARCHIVED":
      return "text-gray-500 bg-gray-50 border border-gray-200";
    default:
      return "text-gray-500 bg-gray-50 border border-gray-200";
  }
}

export function getRoleBadgeColor(role: string): string {
  switch (role) {
    case "OWNER":
      return "text-purple-700 bg-purple-50 border border-purple-200";
    case "ADMIN":
      return "text-blue-700 bg-blue-50 border border-blue-200";
    case "FACILITATOR":
      return "text-teal-700 bg-teal-50 border border-teal-200";
    case "MEMBER":
      return "text-gray-600 bg-gray-50 border border-gray-200";
    case "VIEWER":
      return "text-gray-400 bg-gray-50 border border-gray-200";
    default:
      return "text-gray-500 bg-gray-50 border border-gray-200";
  }
}
