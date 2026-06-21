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
  AlertTriangle,
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

export default function OrganizationDashboardClient({ dashboard: d }: Props) {
  return (
    <div className="min-h-screen bg-tb-bg">
      <ConnectedHeader />
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <Link
              href={`/organizations/${d.slug}`}
              className="flex items-center gap-1 text-sm text-tb-text-secondary hover:text-tb-text-primary mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Page publique
            </Link>
            <h1 className="text-2xl font-bold text-tb-text-primary flex items-center gap-2">
              <Building2 className="w-6 h-6 text-tb-accent" />
              {d.name}
            </h1>
            <p className="text-tb-text-muted text-sm mt-1">
              {getOrganizationTypeLabel(d.type)}
              {d.city && ` · ${d.city}${d.department ? `, ${d.department}` : ""}`}
              {d.myRole && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-tb-accent/10 text-tb-accent border border-tb-accent/20">
                  {getOrganizationRoleLabel(d.myRole)}
                </span>
              )}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getOrganizationStatusColor(d.status)}`}>
                {getOrganizationStatusLabel(d.status)}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/organizations/${d.slug}/members`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-tb-text-secondary hover:text-tb-text-primary bg-tb-surface-elevated hover:bg-tb-border transition-colors"
            >
              <Users className="w-4 h-4" />
              Membres
            </Link>
            <Link
              href={`/organizations/${d.slug}/settings`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-tb-text-secondary hover:text-tb-text-primary bg-tb-surface-elevated hover:bg-tb-border transition-colors"
            >
              <Settings className="w-4 h-4" />
              Paramètres
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-tb-border rounded-2xl p-4 space-y-1">
            <Users className="w-5 h-5 text-tb-accent" />
            <div className="text-2xl font-bold text-tb-text-primary">{d.memberCount}</div>
            <div className="text-xs text-tb-text-muted">Membres</div>
            <div className="text-xs text-tb-accent">{d.activeMemberCount} actifs (30j)</div>
          </div>
          <div className="bg-white border border-tb-border rounded-2xl p-4 space-y-1">
            <Target className="w-5 h-5 text-tb-accent" />
            <div className="text-2xl font-bold text-tb-text-primary">{d.activeMissions}</div>
            <div className="text-xs text-tb-text-muted">Missions actives</div>
            <div className="text-xs text-tb-text-muted">{d.completedMissions} terminées</div>
          </div>
          <div className="bg-white border border-tb-border rounded-2xl p-4 space-y-1">
            <Clock className="w-5 h-5 text-tb-accent" />
            <div className="text-2xl font-bold text-tb-text-primary">{d.totalTimeGenerated}</div>
            <div className="text-xs text-tb-text-muted">TIME mobilisés</div>
          </div>
          <div className="bg-white border border-tb-border rounded-2xl p-4 space-y-1">
            <Heart className="w-5 h-5 text-tb-accent" />
            <div className="text-2xl font-bold text-tb-text-primary">{d.potBalance}</div>
            <div className="text-xs text-tb-text-muted">Pot TIME</div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white border border-tb-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-tb-text-primary mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link
              href={`/organizations/${d.slug}/members`}
              className="flex items-center gap-3 p-3 rounded-xl bg-tb-surface-elevated hover:bg-tb-border transition-colors"
            >
              <UserPlus className="w-5 h-5 text-tb-accent" />
              <div>
                <p className="text-sm font-medium text-tb-text-primary">Inviter des membres</p>
                <p className="text-xs text-tb-text-muted">Ajouter à l'organisation</p>
              </div>
            </Link>
            <Link
              href="/services/new"
              className="flex items-center gap-3 p-3 rounded-xl bg-tb-surface-elevated hover:bg-tb-border transition-colors"
            >
              <Target className="w-5 h-5 text-tb-accent" />
              <div>
                <p className="text-sm font-medium text-tb-text-primary">Créer une mission</p>
                <p className="text-xs text-tb-text-muted">Service ou collective</p>
              </div>
            </Link>
            <Link
              href={`/organizations/${d.slug}/pot`}
              className="flex items-center gap-3 p-3 rounded-xl bg-tb-surface-elevated hover:bg-tb-border transition-colors"
            >
              <Heart className="w-5 h-5 text-tb-accent" />
              <div>
                <p className="text-sm font-medium text-tb-text-primary">Pot TIME</p>
                <p className="text-xs text-tb-text-muted">Voir et donner</p>
              </div>
            </Link>
            <Link
              href="/impact"
              className="flex items-center gap-3 p-3 rounded-xl bg-tb-surface-elevated hover:bg-tb-border transition-colors"
            >
              <TrendingUp className="w-5 h-5 text-tb-accent" />
              <div>
                <p className="text-sm font-medium text-tb-text-primary">Impact</p>
                <p className="text-xs text-tb-text-muted">Statistiques</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent missions (placeholder) */}
        <div className="bg-white border border-tb-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-tb-text-primary mb-4">Dernières missions</h2>
          <div className="text-center py-8 border border-dashed border-tb-border rounded-xl">
            <Sparkles className="w-8 h-8 text-tb-border mx-auto mb-2" />
            <p className="text-tb-text-muted text-sm">Les missions rattachées apparaîtront ici.</p>
            <Link
              href="/services/new"
              className="inline-block mt-3 text-sm text-tb-accent hover:text-tb-accent-hover transition-colors"
            >
              Créer une mission →
            </Link>
          </div>
        </div>

        {/* Recent members */}
        <div className="bg-white border border-tb-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-tb-text-primary">Membres</h2>
            <Link
              href={`/organizations/${d.slug}/members`}
              className="text-sm text-tb-accent hover:text-tb-accent-hover transition-colors"
            >
              Voir tous les membres →
            </Link>
          </div>
          <div className="flex items-center gap-2 text-tb-text-muted text-sm">
            <Users className="w-4 h-4" />
            {d.memberCount} membre{d.memberCount > 1 ? "s" : ""} · {d.activeMemberCount} actif{d.activeMemberCount > 1 ? "s" : ""} (30 jours)
          </div>
        </div>
      </div>
    </div>
  );
}
