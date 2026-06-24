import {
  Users, UserPlus, Handshake, Building2,
  Globe, MapPin, Clock,
  Play, CheckCircle2, XCircle, AlertTriangle,
  UserCheck, UserX, UserMinus, UserPlus as UserJoin,
  Sparkles, HeartHandshake, Banknote,
  Eye,
} from "lucide-react";

// ─── Types de mission collective ─────────────────────────────────────────────

export const COLLECTIVE_MISSION_TYPES: Record<string, { label: string; icon: any; description: string }> = {
  ONE_TO_MANY:    { label: "Mission Mentor",    icon: UserPlus,      description: "1 → N · Un Hero transmet son savoir ou son talent à plusieurs participants : atelier, cours, initiation, transmission." },
  MANY_TO_ONE:    { label: "Escouade Renfort",  icon: Users,         description: "N → 1 · Plusieurs Heroes se rassemblent pour aider une personne face à un besoin concret." },
  MANY_TO_MANY:   { label: "Alliance Heroes",   icon: Handshake,     description: "N → N · Des Heroes unissent leurs forces pour réussir une mission commune dans le quartier." },
  ORG_TO_MANY:    { label: "Mission Publique",   icon: Building2,     description: "🏛 → N · Une association, école, mairie ou organisation lance une mission officielle pour mobiliser les Heroes." },
};

export function getCollectiveMissionTypeLabel(type: string): string {
  return COLLECTIVE_MISSION_TYPES[type]?.label ?? type;
}

export function getCollectiveMissionTypeIcon(type: string): any {
  return COLLECTIVE_MISSION_TYPES[type]?.icon ?? Users;
}

// ─── Statuts de mission ──────────────────────────────────────────────────────

export const COLLECTIVE_MISSION_STATUSES: Record<string, { label: string; color: string; icon: any }> = {
  OPEN:              { label: "Ouverte",       color: "text-blue-400 bg-blue-500/10",     icon: Globe },
  FULL:              { label: "Complète",      color: "text-amber-400 bg-amber-500/10",   icon: Users },
  IN_PROGRESS:       { label: "En cours",      color: "text-emerald-400 bg-emerald-500/10", icon: Play },
  ATTENDANCE_PENDING:{ label: "Présences à valider", color: "text-purple-400 bg-purple-500/10", icon: Clock },
  COMPLETED:         { label: "Terminée",      color: "text-emerald-400 bg-emerald-500/10", icon: CheckCircle2 },
  CANCELLED:         { label: "Annulée",       color: "text-red-400 bg-red-500/10",        icon: XCircle },
};

export function getMissionStatusLabel(status: string): string {
  return COLLECTIVE_MISSION_STATUSES[status]?.label ?? status;
}

export function getMissionStatusColor(status: string): string {
  return COLLECTIVE_MISSION_STATUSES[status]?.color ?? "text-tb-text-secondary";
}

// ─── Rôles des participants ──────────────────────────────────────────────────

export const PARTICIPANT_ROLES: Record<string, { label: string; icon: any; description: string }> = {
  ORGANIZER:    { label: "Organisateur",  icon: UserPlus,       description: "Crée et pilote la mission" },
  CONTRIBUTOR:  { label: "Contributeur",  icon: UserCheck,      description: "Donne du temps et reçoit des TIME" },
  BENEFICIARY:  { label: "Bénéficiaire",  icon: Handshake,      description: "Personne aidée" },
  FACILITATOR:  { label: "Facilitateur",  icon: HeartHandshake, description: "Valide et modère" },
  OBSERVER:     { label: "Observateur",   icon: Eye,            description: "Suivi sans TIME" },
};

export function getParticipantRoleLabel(role: string): string {
  return PARTICIPANT_ROLES[role]?.label ?? role;
}

// ─── Statuts des participants ────────────────────────────────────────────────

export const PARTICIPANT_STATUSES: Record<string, { label: string; color: string; icon: any }> = {
  JOINED:     { label: "Inscrit",     color: "text-blue-400",  icon: UserJoin },
  WAITLISTED: { label: "Liste d'attente", color: "text-amber-400", icon: Clock },
  CHECKED_IN: { label: "Présent",     color: "text-emerald-400", icon: UserCheck },
  VALIDATED:  { label: "Validé",      color: "text-emerald-400", icon: CheckCircle2 },
  NO_SHOW:    { label: "Absent",      color: "text-red-400",   icon: UserX },
  CANCELLED:  { label: "Annulé",      color: "text-gray-400",  icon: UserMinus },
};

export function getParticipantStatusLabel(status: string): string {
  return PARTICIPANT_STATUSES[status]?.label ?? status;
}

// ─── Sources de financement ──────────────────────────────────────────────────

export const FUNDING_SOURCES: Record<string, { label: string; icon: any; description: string }> = {
  NONE:          { label: "Bénévole",          icon: HeartHandshake, description: "Mission purement communautaire" },
  COMMUNITY_POT: { label: "Pot commun",        icon: Banknote,      description: "Financement via le pot commun" },
};

export function getFundingSourceLabel(source: string): string {
  return FUNDING_SOURCES[source]?.label ?? source;
}
