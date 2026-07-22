"use client";

import ConnectedHeader from "@/components/ConnectedHeader";
import Link from "next/link";
import {
  Building2,
  Users,
  Target,
  Clock,
  Heart,
  Sparkles,
  ArrowLeft,
  Settings,
  UserPlus,
  TrendingUp,
  FileText,
  BarChart3,
  Gift,
  ShieldCheck,
  Medal,
  Rocket,
  Activity,
} from "lucide-react";
import {
  getOrganizationTypeLabel,
  getOrganizationStatusLabel,
  getOrganizationStatusColor,
  getOrganizationRoleLabel,
} from "@/lib/organization-labels";

type DashboardData = {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  isVerified: boolean;
  logoUrl: string | null;
  description: string | null;
  city: string | null;
  department: string | null;
  region: string | null;
  memberCount: number;
  activeMemberCount: number;
  activeMissions: number;
  completedMissions: number;
  totalTimeGenerated: number;
  potBalance: number;
  myRole: string | null;
};

type Props = {
  dashboard: DashboardData;
};

const statCards = [
  {
    key: "members",
    label: "Membres",
    icon: Users,
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    getValue: (d: DashboardData) => d.memberCount,
    getSub: (d: DashboardData) => `${d.activeMemberCount} actifs (30j)`,
  },
  {
    key: "missions",
    label: "Missions",
    icon: Target,
    color: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    getValue: (d: DashboardData) => d.activeMissions,
    getSub: (d: DashboardData) => `${d.completedMissions} terminées`,
  },
  {
    key: "time",
    label: "TIME mobilisés",
    icon: Clock,
    color: "from-violet-500 to-violet-600",
    bg: "bg-violet-50",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    getValue: (d: DashboardData) => d.totalTimeGenerated,
    getSub: () => "1h = 1 TIME",
  },
  {
    key: "pot",
    label: "Pot TIME",
    icon: Heart,
    color: "from-rose-500 to-rose-600",
    bg: "bg-rose-50",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    getValue: (d: DashboardData) => d.potBalance,
    getSub: () => "Au service de l'org",
  },
];

export default function OrganizationDashboardClient({ dashboard: d }: Props) {
  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      <ConnectedHeader orgRole={d.myRole} />

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* ── Hero Banner ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#00A889] via-[#008f78] to-[#006c5b] p-6 sm:p-8">
          {/* Decorative circles */}
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/5" />
          <div className="absolute top-1/2 right-12 w-16 h-16 rounded-full bg-white/5" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <Link
                href={`/organizations/${d.slug}`}
                className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Page publique
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                <Building2 className="w-7 h-7 text-white/80" />
                {d.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-white/80">
                  {getOrganizationTypeLabel(d.type)}
                  {d.city && ` · ${d.city}${d.department ? `, ${d.department}` : ""}`}
                </span>
                {d.myRole && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white border border-white/20">
                    {getOrganizationRoleLabel(d.myRole)}
                  </span>
                )}
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrganizationStatusColor(d.status)}`}>
                  {getOrganizationStatusLabel(d.status)}
                </span>
                {d.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3" />
                    Partenaire vérifié
                  </span>
                )}
              </div>
            </div>

            {/* Quick stats in hero */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{d.memberCount}</div>
                <div className="text-xs text-white/70">Membres</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{d.activeMissions}</div>
                <div className="text-xs text-white/70">Missions</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{d.potBalance}</div>
                <div className="text-xs text-white/70">Pot TIME</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Navigation tabs ── */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { href: `/organizations/${d.slug}/members`, icon: Users, label: "Membres" },
            { href: `/organizations/${d.slug}/impact`, icon: TrendingUp, label: "Impact" },
            { href: `/organizations/${d.slug}/wellbeing`, icon: Heart, label: "Impact humain" },
            { href: `/organizations/${d.slug}/reports`, icon: FileText, label: "Rapports" },
            { href: `/organizations/${d.slug}/programs`, icon: Activity, label: "Programmes" },
            { href: `/organizations/${d.slug}/pot`, icon: Gift, label: "Pot TIME" },
            { href: `/organizations/${d.slug}/settings`, icon: Settings, label: "Paramètres" },
          ].map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-[#5F6368] hover:text-[#101010] bg-white border border-[#E0DDD8] hover:border-[#00A889]/30 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Link>
          ))}
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statCards.map((card) => (
            <div
              key={card.key}
              className="group relative overflow-hidden rounded-2xl bg-white border border-[#E0DDD8] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <div className="text-3xl font-bold text-[#101010] group-hover:text-[#00A889] transition-colors duration-300">
                {card.getValue(d)}
              </div>
              <div className="text-xs text-[#9A9EA2] mt-0.5">{card.label}</div>
              <div className="text-xs text-[#00A889] mt-1">{card.getSub(d)}</div>

              {/* Decorative bar */}
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${card.color} scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
            </div>
          ))}
        </div>

        {/* ── Quick Actions ── */}
        <div className="rounded-2xl bg-white border border-[#E0DDD8] p-6">
          <h2 className="text-lg font-semibold text-[#101010] mb-4 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-[#00A889]" />
            Actions rapides
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link
              href={`/organizations/${d.slug}/members`}
              className="group flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 hover:border-blue-300 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <UserPlus className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#101010]">Inviter des membres</p>
                <p className="text-xs text-[#9A9EA2]">Ajouter à l'organisation</p>
              </div>
            </Link>
            <Link
              href={`/organizations/${d.slug}/missions/new`}
              className="group flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 hover:border-emerald-300 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Target className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#101010]">Créer une mission</p>
                <p className="text-xs text-[#9A9EA2]">Proposer un service aux membres</p>
              </div>
            </Link>
            <Link
              href={`/organizations/${d.slug}/pot`}
              className="group flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-rose-50 to-white border border-rose-100 hover:border-rose-300 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Gift className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#101010]">Pot TIME</p>
                <p className="text-xs text-[#9A9EA2]">Voir le solde · Donner au pot</p>
              </div>
            </Link>
            <Link
              href={`/organizations/${d.slug}/impact`}
              className="group flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-violet-50 to-white border border-violet-100 hover:border-violet-300 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <BarChart3 className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#101010]">Impact & rapports</p>
                <p className="text-xs text-[#9A9EA2]">Voir l'impact · Générer un rapport</p>
              </div>
            </Link>
          </div>
        </div>

        {/* ── Two-column: Impact + Programs ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Impact preview */}
          <div className="rounded-2xl bg-white border border-[#E0DDD8] p-5 hover:shadow-sm transition-shadow">
            <h3 className="text-sm font-semibold text-[#101010] mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00A889]" />
              Impact & rapports
            </h3>
            <div className="space-y-2">
              <Link
                href={`/organizations/${d.slug}/impact`}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#F8F5F0] hover:bg-[#F0EDE8] transition-colors group"
              >
                <BarChart3 className="w-4 h-4 text-[#00A889] group-hover:scale-110 transition-transform" />
                <span className="text-sm text-[#5F6368] group-hover:text-[#101010] transition-colors">Voir l'impact</span>
                <span className="ml-auto text-xs text-[#9A9EA2]">Indicateurs en temps réel</span>
              </Link>
              <Link
                href={`/organizations/${d.slug}/reports/new`}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#F8F5F0] hover:bg-[#F0EDE8] transition-colors group"
              >
                <FileText className="w-4 h-4 text-[#00A889] group-hover:scale-110 transition-transform" />
                <span className="text-sm text-[#5F6368] group-hover:text-[#101010] transition-colors">Générer un rapport</span>
                <span className="ml-auto text-xs text-[#9A9EA2]">Rapport d'impact complet</span>
              </Link>
              <Link
                href={`/organizations/${d.slug}/reports`}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#F8F5F0] hover:bg-[#F0EDE8] transition-colors group"
              >
                <FileText className="w-4 h-4 text-[#00A889] group-hover:scale-110 transition-transform" />
                <span className="text-sm text-[#5F6368] group-hover:text-[#101010] transition-colors">Historique</span>
                <span className="ml-auto text-xs text-[#9A9EA2]">Rapports générés</span>
              </Link>
            </div>
          </div>

          {/* Programs preview */}
          <div className="rounded-2xl bg-white border border-[#E0DDD8] p-5 hover:shadow-sm transition-shadow">
            <h3 className="text-sm font-semibold text-[#101010] mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00A889]" />
              Programmes
            </h3>
            <div className="space-y-2">
              <Link
                href={`/organizations/${d.slug}/programs`}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#F8F5F0] hover:bg-[#F0EDE8] transition-colors group"
              >
                <Target className="w-4 h-4 text-[#00A889] group-hover:scale-110 transition-transform" />
                <span className="text-sm text-[#5F6368] group-hover:text-[#101010] transition-colors">Voir les programmes</span>
                <span className="ml-auto text-xs text-[#9A9EA2]">Lancer et suivre</span>
              </Link>
              <Link
                href={`/organizations/${d.slug}/wellbeing`}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#F8F5F0] hover:bg-[#F0EDE8] transition-colors group"
              >
                <Heart className="w-4 h-4 text-[#00A889] group-hover:scale-110 transition-transform" />
                <span className="text-sm text-[#5F6368] group-hover:text-[#101010] transition-colors">Impact humain</span>
                <span className="ml-auto text-xs text-[#9A9EA2]">Questionnaire wellbeing</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Recent Missions ── */}
        <div className="rounded-2xl bg-white border border-[#E0DDD8] p-5">
          <h2 className="text-sm font-semibold text-[#101010] mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00A889]" />
            Dernières missions
          </h2>
          <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-[#E0DDD8] rounded-xl bg-[#F8F5F0]">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00A889]/10 to-[#00A889]/5 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-[#00A889]/40" />
            </div>
            <p className="text-sm text-[#9A9EA2] mb-2">Les missions rattachées apparaîtront ici.</p>
            <Link
              href={`/organizations/${d.slug}/missions/new`}
              className="inline-flex items-center gap-1 text-sm font-medium text-[#00A889] hover:text-[#008f78] transition-colors group"
            >
              Créer une mission
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
        </div>

        {/* ── Members ── */}
        <div className="rounded-2xl bg-white border border-[#E0DDD8] p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#101010] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00A889]" />
              Membres
            </h2>
            <Link
              href={`/organizations/${d.slug}/members`}
              className="text-xs font-medium text-[#00A889] hover:text-[#008f78] transition-colors flex items-center gap-1"
            >
              Voir tous
              <span className="text-xs">→</span>
            </Link>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#9A9EA2]">
            <Users className="w-4 h-4" />
            <span>
              {d.memberCount} membre{d.memberCount > 1 ? "s" : ""} · {d.activeMemberCount} actif{d.activeMemberCount > 1 ? "s" : ""} (30 jours)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
