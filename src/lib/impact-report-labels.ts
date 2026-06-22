// ─── Labels centralisés pour les rapports d'impact ────────────────────

export const IMPACT_REPORT_TYPES: Record<string, string> = {
  ORGANIZATION_SUMMARY: "Synthèse organisation",
  FUNDER_REPORT: "Rapport financeur",
  RSE_REPORT: "Rapport RSE",
  BOARD_REPORT: "Rapport comité",
  ESSEC_DEMO: "Rapport démo ESSEC",
} as const;

export const IMPACT_REPORT_STATUSES: Record<string, string> = {
  DRAFT: "Brouillon",
  GENERATED: "Généré",
  ARCHIVED: "Archivé",
} as const;

export const IMPACT_REPORT_VISIBILITIES: Record<string, string> = {
  PRIVATE: "Privé",
  ORGANIZATION: "Organisation",
  SHARE_LINK: "Lien public",
  PUBLIC: "Public",
} as const;

export const METRIC_LABELS: Record<string, string> = {
  totalMembers: "Membres actifs",
  activeMembers30d: "Membres actifs (30 jours)",
  newMembers: "Nouveaux membres",
  facilitatorsCount: "Facilitateurs",
  membersWithCompletedMission: "Membres ayant participé",
  totalMissions: "Missions totales",
  activeMissions: "Missions actives",
  completedMissions: "Missions réalisées",
  collectiveMissions: "Missions collectives",
  solidarityMissions: "Missions solidaires",
  urgentRequestsLinked: "Demandes urgentes",
  averageParticipantsPerMission: "Participants moyens",
  completionRate: "Taux de complétion",
  totalTimeMobilized: "TIME mobilisés",
  timeFromCollectiveMissions: "TIME collectifs",
  timeFromSolidarityMissions: "TIME solidaires",
  organizationPotBalance: "Solde pot d'impact",
  organizationPotDonations: "Dons au pot",
  organizationPotFunded: "TIME financés par le pot",
  dormantTimeDetected: "TIME dormants",
  estimatedBeneficiaries: "Bénéficiaires estimés",
  uniqueReceivers: "Receveurs uniques",
  receiversBecameContributors: "Receveurs devenus contributeurs",
  reciprocityRate: "Taux de réciprocité",
  averageRating: "Note moyenne",
  ratingsCount: "Nombre d'avis",
  blockedRequestsResolved: "Demandes débloquées",
  averageResponseDelay: "Délai moyen de réponse",
  noShowCount: "Absences",
  safetyReportsCount: "Signalements",
  socialValueEstimated: "Valeur sociale estimée",
} as const;

export const METRIC_UNITS: Record<string, string> = {
  totalMembers: "count",
  activeMembers30d: "count",
  newMembers: "count",
  facilitatorsCount: "count",
  membersWithCompletedMission: "count",
  totalMissions: "count",
  activeMissions: "count",
  completedMissions: "count",
  collectiveMissions: "count",
  solidarityMissions: "count",
  urgentRequestsLinked: "count",
  averageParticipantsPerMission: "count",
  completionRate: "percent",
  totalTimeMobilized: "TIME",
  timeFromCollectiveMissions: "TIME",
  timeFromSolidarityMissions: "TIME",
  organizationPotBalance: "TIME",
  organizationPotDonations: "TIME",
  organizationPotFunded: "TIME",
  dormantTimeDetected: "TIME",
  estimatedBeneficiaries: "count",
  uniqueReceivers: "count",
  receiversBecameContributors: "count",
  reciprocityRate: "percent",
  averageRating: "rating",
  ratingsCount: "count",
  blockedRequestsResolved: "count",
  averageResponseDelay: "hours",
  noShowCount: "count",
  safetyReportsCount: "count",
  socialValueEstimated: "EUR",
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────

export function getReportTypeLabel(type: string): string {
  return IMPACT_REPORT_TYPES[type] || type || "Non défini";
}

export function getReportStatusLabel(status: string): string {
  return IMPACT_REPORT_STATUSES[status] || status || "Inconnu";
}

export function getReportVisibilityLabel(visibility: string): string {
  return IMPACT_REPORT_VISIBILITIES[visibility] || visibility || "Inconnu";
}

export function getMetricLabel(key: string): string {
  return METRIC_LABELS[key] || key;
}

export function getMetricUnit(key: string): string {
  return METRIC_UNITS[key] || "count";
}

export function formatMetricValue(key: string, value: number): string {
  const unit = getMetricUnit(key);
  switch (unit) {
    case "percent":
      return `${value} %`;
    case "EUR":
      return `${value.toLocaleString("fr-FR")} €`;
    case "TIME":
      return `${value.toLocaleString("fr-FR")} TIME`;
    case "rating":
      return value.toFixed(1);
    case "hours":
      return `${value}h`;
    default:
      return value.toLocaleString("fr-FR");
  }
}
