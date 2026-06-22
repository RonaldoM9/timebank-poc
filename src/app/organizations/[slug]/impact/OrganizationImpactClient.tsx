"use client";

import { useState, useCallback } from "react";
import ConnectedHeader from "@/components/ConnectedHeader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  Target,
  Clock,
  Heart,
  Sparkles,
  ArrowLeft,
  TrendingUp,
  ShieldCheck,
  Download,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import {
  getOrganizationTypeLabel,
} from "@/lib/organization-labels";
import {
  formatMetricValue,
} from "@/lib/impact-report-labels";
import { getOrganizationImpactLiveStats } from "@/lib/impact-reports";

type ImpactMetrics = Awaited<ReturnType<typeof getOrganizationImpactLiveStats>>;

type Props = {
  organization: {
    id: string;
    name: string;
    slug: string;
    type: string;
    city: string | null;
    department: string | null;
    isVerified: boolean;
    logoUrl: string | null;
  };
  initialMetrics: ImpactMetrics;
  canGenerate: boolean;
};

export default function OrganizationImpactClient({
  organization: org,
  initialMetrics,
  canGenerate,
}: Props) {
  const router = useRouter();

  const metrics = initialMetrics;

  // Period filter
  const [periodLabel, setPeriodLabel] = useState("12 derniers mois");

  const kpiCards = metrics
    ? [
        {
          icon: <Users className="w-5 h-5" />,
          label: "Membres engagés",
          value: formatMetricValue("totalMembers", metrics.totalMembers),
          sub: `${metrics.activeMembers30d} actifs (30j)`,
        },
        {
          icon: <Target className="w-5 h-5" />,
          label: "Missions réalisées",
          value: formatMetricValue("completedMissions", metrics.completedMissions),
          sub: `${metrics.activeMissions} en cours`,
        },
        {
          icon: <Clock className="w-5 h-5" />,
          label: "TIME mobilisés",
          value: formatMetricValue("totalTimeMobilized", metrics.totalTimeMobilized),
          sub: `↓ ${metrics.totalMissions} missions`,
        },
        {
          icon: <Heart className="w-5 h-5" />,
          label: "Missions solidaires",
          value: formatMetricValue("solidarityMissions", metrics.solidarityMissions),
          sub: `${metrics.collectiveMissions} collectives`,
        },
        {
          icon: <TrendingUp className="w-5 h-5" />,
          label: "Taux de réciprocité",
          value: `${metrics.reciprocityRate} %`,
          sub: metrics.reciprocityRate >= 20 ? "👍 En progression" : "À renforcer",
        },
        {
          icon: <Heart className="w-5 h-5" />,
          label: "Pot d'impact",
          value: formatMetricValue("organizationPotBalance", metrics.organizationPotBalance),
          sub: `${metrics.organizationPotDonations} TIME donnés`,
        },
        {
          icon: <Sparkles className="w-5 h-5" />,
          label: "Valeur sociale estimée",
          value: formatMetricValue("socialValueEstimated", metrics.socialValueEstimated),
          sub: "Estimation indicative",
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-tb-bg">
      <ConnectedHeader />
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <Link
              href={`/organizations/${org.slug}/dashboard`}
              className="flex items-center gap-1 text-sm text-tb-text-secondary hover:text-tb-text-primary mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Tableau de bord
            </Link>
            <h1 className="text-2xl font-bold text-tb-text-primary flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-tb-accent" />
              Impact — {org.name}
            </h1>
            <p className="text-tb-text-muted text-sm mt-1">
              {getOrganizationTypeLabel(org.type)}
              {org.city && ` · ${org.city}${org.department ? `, ${org.department}` : ""}`}
            </p>
          </div>
          {canGenerate && (
            <Link
              href={`/organizations/${org.slug}/reports/new`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-tb-accent text-white hover:bg-tb-accent-hover transition-colors"
            >
              <Download className="w-4 h-4" />
              Générer un rapport
            </Link>
          )}
        </div>

        {/* Period info */}
        <div className="bg-white border border-tb-border rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-tb-text-secondary">
            <Clock className="w-4 h-4 text-tb-accent" />
            Période affichée : {periodLabel}
          </div>
          <Link
            href={`/organizations/${org.slug}/reports`}
            className="text-sm text-tb-accent hover:text-tb-accent-hover transition-colors"
          >
            Historique des rapports →
          </Link>
        </div>

        {/* Microcopy */}
        <p className="text-xs text-tb-text-muted">
          Ces indicateurs mesurent l'activité générée par cet espace partenaire sur TimeHeroes.
        </p>

        {/* KPI Cards */}
        {metrics ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {kpiCards.map((kpi, i) => (
              <div
                key={i}
                className="bg-white border border-tb-border rounded-2xl p-4 space-y-1 hover:shadow-sm transition-shadow"
              >
                <div className="text-tb-accent">{kpi.icon}</div>
                <div className="text-2xl font-bold text-tb-text-primary">{kpi.value}</div>
                <div className="text-xs text-tb-text-muted">{kpi.label}</div>
                <div className="text-xs text-tb-accent">{kpi.sub}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-tb-border rounded-2xl p-8 text-center">
            <AlertTriangle className="w-8 h-8 text-tb-border mx-auto mb-3" />
            <p className="text-tb-text-muted">Aucune donnée d'impact disponible pour cette période.</p>
          </div>
        )}

        {/* Missions breakdown */}
        {metrics && metrics.totalMissions > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-tb-border rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-tb-text-primary mb-4">Missions par type</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-tb-text-secondary">Missions individuelles</span>
                  <span className="text-sm font-medium text-tb-text-primary">
                    {metrics.totalMissions - metrics.collectiveMissions - metrics.solidarityMissions}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-tb-text-secondary">Missions collectives</span>
                  <span className="text-sm font-medium text-tb-text-primary">{metrics.collectiveMissions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-tb-text-secondary">Missions solidaires</span>
                  <span className="text-sm font-medium text-tb-text-primary">{metrics.solidarityMissions}</span>
                </div>
                <div className="border-t border-tb-border pt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-tb-text-primary">Total</span>
                  <span className="text-sm font-bold text-tb-accent">{metrics.totalMissions}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-tb-border rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-tb-text-primary mb-4">Pot d'impact</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-tb-text-secondary">Solde actuel</span>
                  <span className="text-sm font-bold text-tb-accent">
                    {metrics.organizationPotBalance} TIME
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-tb-text-secondary">Dons sur la période</span>
                  <span className="text-sm font-medium text-tb-text-primary">
                    {metrics.organizationPotDonations} TIME
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-tb-text-secondary">Financements</span>
                  <span className="text-sm font-medium text-tb-text-primary">
                    {metrics.organizationPotFunded} TIME
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Réciprocité & Valeur sociale */}
        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-tb-border rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-tb-text-primary mb-4">Réciprocité</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-tb-text-secondary">Taux de réciprocité</span>
                  <span className="text-lg font-bold text-tb-accent">{metrics.reciprocityRate} %</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-tb-text-secondary">Bénéficiaires estimés</span>
                  <span className="text-sm font-medium text-tb-text-primary">{metrics.estimatedBeneficiaries}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-tb-text-secondary">Receveurs devenus contributeurs</span>
                  <span className="text-sm font-medium text-tb-text-primary">{metrics.receiversBecameContributors}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-tb-border rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-tb-text-primary mb-4">Valeur sociale estimée</h3>
              <div className="text-3xl font-bold text-tb-accent mb-2">
                {metrics.socialValueEstimated.toLocaleString("fr-FR")} €
              </div>
              <p className="text-xs text-tb-text-muted">
                Estimation basée sur {metrics.socialValueHourlyRate} € par heure mobilisée.
                Cette estimation est indicative et ne constitue pas une valorisation comptable officielle.
              </p>
            </div>
          </div>
        )}

        {/* CTA generate */}
        {canGenerate && (
          <div className="bg-tb-accent/5 border border-tb-accent/20 rounded-2xl p-6 text-center">
            <h2 className="text-lg font-semibold text-tb-text-primary mb-2">
              Prêt à formaliser votre impact ?
            </h2>
            <p className="text-sm text-tb-text-muted mb-4">
              Générez un rapport d'impact complet, imprimable et partageable.
            </p>
            <Link
              href={`/organizations/${org.slug}/reports/new`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-tb-accent text-white hover:bg-tb-accent-hover transition-colors"
            >
              <Download className="w-4 h-4" />
              Générer un rapport
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
