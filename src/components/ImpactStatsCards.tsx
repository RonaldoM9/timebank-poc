import { Clock, CheckCircle, Users, Star, Briefcase, Award, ArrowRightLeft, AlertTriangle, MessageSquare, MessagesSquare, Calendar, CalendarClock, Zap, Flag, Lock, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ImpactStats } from "@/lib/impact";

// ─── KPI definitions with icons and labels ────────────────────────────────

export interface KpiDef {
  key: keyof ImpactStats;
  icon: LucideIcon;
  label: string;
  suffix?: string;
  explanation: string;
  formatValue?: (value: number | null) => string;
}

export const KPI_DEFINITIONS: Record<string, KpiDef> = {
  totalTimeExchanged: {
    key: "totalTimeExchanged",
    icon: Clock,
    label: "TIME échangés",
    explanation: "Heures d'entraide validées après mission terminée.",
    formatValue: (v) => `${Math.round(v ?? 0)}`,
  },
  completedMissions: {
    key: "completedMissions",
    icon: CheckCircle,
    label: "Missions terminées",
    explanation: "Nombre de réservations complétées avec succès.",
  },
  activeHeroes: {
    key: "activeHeroes",
    icon: Users,
    label: "Heroes actifs",
    explanation: "Membres ayant participé à au moins une action.",
  },
  availableServices: {
    key: "availableServices",
    icon: Briefcase,
    label: "Services disponibles",
    explanation: "Missions proposées par la communauté.",
  },
  averageRating: {
    key: "averageRating",
    icon: Star,
    label: "Satisfaction",
    suffix: "/ 5",
    explanation: "Note moyenne des missions complétées.",
    formatValue: (v) => {
      if (v === null || v === undefined) return "—";
      return v.toFixed(1);
    },
  },
  unlockedBadges: {
    key: "unlockedBadges",
    icon: Award,
    label: "Badges débloqués",
    explanation: "Récompenses obtenues après missions, dons ou contributions.",
  },
  transferredTime: {
    key: "transferredTime",
    icon: ArrowRightLeft,
    label: "TIME transféré",
    explanation: "TIME partagé entre Heroes (hors missions).",
    formatValue: (v) => `${Math.round(v ?? 0)}`,
  },
  resolvedUrgentHelps: {
    key: "resolvedUrgentHelps",
    icon: AlertTriangle,
    label: "Aides urgentes",
    explanation: "Demandes urgentes traitées avec succès.",
  },
  discussionsCreated: {
    key: "discussionsCreated",
    icon: MessageSquare,
    label: "Discussions créées",
    explanation: "Réservations ayant activé un échange sécurisé.",
  },
  messagesExchanged: {
    key: "messagesExchanged",
    icon: MessagesSquare,
    label: "Messages échangés",
    explanation: "Messages dans les discussions sécurisées.",
  },
  scheduledMissions: {
    key: "scheduledMissions",
    icon: Calendar,
    label: "Missions planifiées",
    explanation: "Missions réservées sur un créneau agenda.",
  },
  activeAvailabilitySlots: {
    key: "activeAvailabilitySlots",
    icon: CalendarClock,
    label: "Créneaux dispo.",
    explanation: "Disponibilités actives des Heroes.",
  },
  totalXpGenerated: {
    key: "totalXpGenerated",
    icon: Zap,
    label: "XP générée",
    explanation: "Points d'expérience accumulés par la communauté.",
    formatValue: (v) => {
      const val = v ?? 0;
      if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
      return `${val}`;
    },
  },
  completedQuests: {
    key: "completedQuests",
    icon: Flag,
    label: "Quêtes terminées",
    explanation: "Quêtes accomplies par les Heroes.",
  },
  escrowedTime: {
    key: "escrowedTime",
    icon: Lock,
    label: "TIME en escrow",
    explanation: "TIME bloqué sur des missions en cours.",
    formatValue: (v) => `${Math.round(v ?? 0)}`,
  },
  transferCount: {
    key: "transferCount",
    icon: TrendingUp,
    label: "Transferts",
    explanation: "Nombre total de transferts de TIME.",
  },

  // Lot 19 — Missions collectives
  collectiveMissionsCompleted: {
    key: "collectiveMissionsCompleted",
    icon: CheckCircle,
    label: "Missions collectives",
    explanation: "Missions collectives terminées avec succès.",
  },
  collectiveParticipantsValidated: {
    key: "collectiveParticipantsValidated",
    icon: Users,
    label: "Participants validés",
    explanation: "Participants ayant contribué à des missions collectives.",
  },
  collectiveTimeDistributed: {
    key: "collectiveTimeDistributed",
    icon: Clock,
    label: "TIME distribués",
    explanation: "TIME redistribués via les missions collectives.",
    formatValue: (v) => `${Math.round(v ?? 0)}`,
  },
  collectiveHours: {
    key: "collectiveHours",
    icon: Clock,
    label: "Heures collectives",
    explanation: "Heures validées dans les missions collectives.",
    formatValue: (v) => `${Math.round(v ?? 0)}`,
  },
};

// ─── Empty state message ──────────────────────────────────────────────────

export function getEmptyMessage(stats: ImpactStats): string | null {
  const hasData = Object.values(stats).some((v) => {
    if (typeof v === "number") return v > 0;
    return v !== null;
  });
  if (!hasData) {
    return "Les chiffres d'impact apparaîtront dès que les premières missions seront réalisées.";
  }
  return null;
}

// ─── Single stat card ─────────────────────────────────────────────────────

interface StatCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  suffix?: string;
  explanation: string;
}

export function StatCard({ icon: Icon, value, label, suffix, explanation }: StatCardProps) {
  return (
    <div className="bg-tb-surface border border-tb-border rounded-2xl p-5 hover:border-tb-accent/30 transition-all group">
      <div className="w-10 h-10 rounded-xl bg-tb-accent/10 border border-tb-accent/20 flex items-center justify-center mb-3 group-hover:bg-tb-accent/20 transition-colors">
        <Icon className="w-5 h-5 text-tb-accent" />
      </div>
      <p className="text-3xl md:text-4xl font-bold text-tb-text-primary mb-1 font-anton tracking-wide">
        {value}
        {suffix && <span className="text-lg md:text-xl text-tb-text-secondary font-sans ml-1">{suffix}</span>}
      </p>
      <p className="text-sm font-semibold text-tb-text-primary mb-1">{label}</p>
      <p className="text-xs text-tb-text-muted leading-relaxed">{explanation}</p>
    </div>
  );
}

// ─── Stat card with size variant ──────────────────────────────────────────

interface StatCardLargeProps {
  icon: LucideIcon;
  value: string;
  label: string;
  suffix?: string;
  explanation: string;
}

export function StatCardLarge({ icon: Icon, value, label, suffix, explanation }: StatCardLargeProps) {
  return (
    <div className="bg-tb-surface border border-tb-border rounded-2xl p-6 md:p-8 hover:border-tb-accent/30 transition-all group">
      <div className="w-12 h-12 rounded-xl bg-tb-accent/10 border border-tb-accent/20 flex items-center justify-center mb-4 group-hover:bg-tb-accent/20 transition-colors">
        <Icon className="w-6 h-6 text-tb-accent" />
      </div>
      <p className="text-4xl md:text-5xl font-bold text-tb-text-primary mb-2 font-anton tracking-wide">
        {value}
        {suffix && <span className="text-xl md:text-2xl text-tb-text-secondary font-sans ml-1">{suffix}</span>}
      </p>
      <p className="text-base font-semibold text-tb-text-primary mb-1">{label}</p>
      <p className="text-sm text-tb-text-muted leading-relaxed">{explanation}</p>
    </div>
  );
}

// ─── Helper to render a value from stats ──────────────────────────────────

function renderValue(stats: ImpactStats, def: KpiDef): string {
  if (def.formatValue) {
    return def.formatValue(stats[def.key] as number | null);
  }
  const val = stats[def.key] as number | null;
  return val !== null && val !== undefined ? `${val}` : "0";
}

// ─── Section 1: Hero Impact (4 big KPIs) ─────────────────────────────────

interface SectionHeroImpactProps {
  stats: ImpactStats;
}

export function SectionHeroImpact({ stats }: SectionHeroImpactProps) {
  const bigKpis: KpiDef[] = [
    KPI_DEFINITIONS.totalTimeExchanged,
    KPI_DEFINITIONS.completedMissions,
    KPI_DEFINITIONS.activeHeroes,
    KPI_DEFINITIONS.averageRating,
  ];

  return (
    <section className="mb-16">
      <h2 className="text-2xl md:text-3xl font-bold text-tb-text-primary mb-2">
        L&apos;impact TimeHeroes en chiffres
      </h2>
      <p className="text-tb-text-secondary text-sm mb-8 max-w-xl">
        Chaque mission, chaque heure donnée et chaque badge raconte une contribution concrète à l&apos;entraide locale.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {bigKpis.map((def) => (
          <StatCardLarge
            key={def.key}
            icon={def.icon}
            value={renderValue(stats, def)}
            label={def.label}
            suffix={def.suffix}
            explanation={def.explanation}
          />
        ))}
      </div>
    </section>
  );
}

// ─── Section 2: Activité de la plateforme ────────────────────────────────

interface SectionGridProps {
  stats: ImpactStats;
  title: string;
  keys: (keyof ImpactStats)[];
}

export function SectionGrid({ stats, title, keys }: SectionGridProps) {
  return (
    <section className="mb-16">
      <h2 className="text-xl md:text-2xl font-bold text-tb-text-primary mb-2">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {keys.map((key) => {
          const def = KPI_DEFINITIONS[key];
          if (!def) return null;
          return (
            <StatCard
              key={key}
              icon={def.icon}
              value={renderValue(stats, def)}
              label={def.label}
              suffix={def.suffix}
              explanation={def.explanation}
            />
          );
        })}
      </div>
    </section>
  );
}

// ─── ImpactStatsCards — compact variant for landing page ──────────────────

interface ImpactStatsCardsProps {
  stats: ImpactStats;
  className?: string;
}

export function ImpactStatsCards({ stats, className = "" }: ImpactStatsCardsProps) {
  const cards: KpiDef[] = [
    KPI_DEFINITIONS.totalTimeExchanged,
    KPI_DEFINITIONS.completedMissions,
    KPI_DEFINITIONS.activeHeroes,
    KPI_DEFINITIONS.averageRating,
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 ${className}`}>
      {cards.map((def) => (
        <StatCard
          key={def.key}
          icon={def.icon}
          value={renderValue(stats, def)}
          label={def.label}
          suffix={def.suffix}
          explanation={def.explanation}
        />
      ))}
    </div>
  );
}
