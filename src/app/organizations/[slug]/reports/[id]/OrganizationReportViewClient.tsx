"use client";

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import ConnectedHeader from "@/components/ConnectedHeader";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  Download,
  Archive,
  FileText,
  Users,
  Target,
  Clock,
  Heart,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Award,
  ShieldCheck,
} from "lucide-react";
import {
  getReportTypeLabel,
  getReportStatusLabel,
  getMetricLabel,
  formatMetricValue,
} from "@/lib/impact-report-labels";
import { archiveImpactReportAction } from "@/app/actions/impact-reports";

type Props = {
  organization: { id: string; name: string; slug: string };
  report: {
    id: string;
    title: string;
    type: string;
    status: string;
    periodStart: string;
    periodEnd: string;
    summary: string | null;
    metrics: Record<string, number> | null;
    highlights: string[];
    risks: string[];
    recommendations: string[];
    socialValueHourlyRate: number;
    socialValueEstimated: number;
    visibility: string;
    generatedById: string | null;
    generatedAt: string | null;
    createdAt: string;
  };
  canArchive: boolean;
  wellbeingStats: {
    totalResponses: number;
    beforeAverage: number | null;
    afterAverage: number | null;
    evolution: number | null;
    isolationAvg: number;
    supportAvg: number;
    usefulnessAvg: number;
    trustAvg: number;
    contributionAvg: number;
  } | null;
};

const kpiKeys = [
  "totalMembers",
  "completedMissions",
  "totalTimeMobilized",
  "solidarityMissions",
  "collectiveMissions",
  "reciprocityRate",
  "organizationPotBalance",
  "socialValueEstimated",
];

export default function OrganizationReportViewClient({
  organization: org,
  report,
  canArchive,
  wellbeingStats,
}: Props) {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateShort = (iso: string) => {
    return new Date(iso).toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });
  };

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleArchive = useCallback(async () => {
    if (!confirm("Archiver ce rapport ?")) return;
    const result = await archiveImpactReportAction(report.id);
    if ((result as any).success) {
      router.push(`/organizations/${org.slug}/reports`);
    } else {
      alert(result.error);
    }
  }, [report.id, org.slug, router]);

  const handleCsvExport = useCallback(async () => {
    const { exportImpactReportCsvAction } = await import(
      "@/app/actions/impact-reports"
    );
    const result = await exportImpactReportCsvAction(report.id);
    if (result.success && result.csv) {
      // Download CSV
      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rapport-impact-${org.slug}-${report.id.slice(0, 8)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      alert(result.error || "Erreur d'export CSV");
    }
  }, [report.id, org.slug]);

  const metrics = report.metrics || {};
  const highlights = report.highlights || [];
  const risks = report.risks || [];
  const recommendations = report.recommendations || [];

  return (
    <>
      {/* ─── Toolbar (hidden on print) ───────────────────────────────── */}
      <div className="min-h-screen bg-tb-bg print:bg-white">
        <ConnectedHeader />
        <div className="max-w-5xl mx-auto px-4 py-4 no-print">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <Link
              href={`/organizations/${org.slug}/reports`}
              className="flex items-center gap-1 text-sm text-tb-text-secondary hover:text-tb-text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux rapports
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-tb-text-secondary hover:text-tb-text-primary bg-tb-surface-elevated hover:bg-tb-border transition-colors"
              >
                <Printer className="w-4 h-4" />
                Imprimer / Export PDF
              </button>
              <button
                onClick={handleCsvExport}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-tb-text-secondary hover:text-tb-text-primary bg-tb-surface-elevated hover:bg-tb-border transition-colors"
              >
                <Download className="w-4 h-4" />
                Exporter CSV
              </button>
              {canArchive && report.status !== "ARCHIVED" && (
                <button
                  onClick={handleArchive}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <Archive className="w-4 h-4" />
                  Archiver
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── Report Content ───────────────────────────────────────── */}
        <div ref={printRef} className="max-w-4xl mx-auto px-4 pb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-tb-border print:shadow-none print:border-none overflow-hidden">
            {/* Cover / Header */}
            <div className="bg-gradient-to-br from-tb-accent/5 to-tb-accent/10 border-b border-tb-border p-8 print:p-6 print:border-b-2 print:border-tb-accent">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-tb-accent" />
                <span className="text-xs font-medium uppercase tracking-wider text-tb-accent">
                  {getReportTypeLabel(report.type)}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-tb-text-primary mb-2 print:text-2xl">
                Rapport d'impact — {org.name}
              </h1>
              <p className="text-lg text-tb-text-secondary">
                {formatDateShort(report.periodStart)} à {formatDateShort(report.periodEnd)}
              </p>
              <div className="flex items-center gap-3 mt-4 text-xs text-tb-text-muted">
                <span>Généré le {report.generatedAt ? formatDate(report.generatedAt) : formatDate(report.createdAt)}</span>
                {report.status === "GENERATED" && (
                  <span className="px-2 py-0.5 rounded-full text-emerald-700 bg-emerald-50 border border-emerald-200">
                    {getReportStatusLabel(report.status)}
                  </span>
                )}
              </div>
            </div>

            {/* Executive Summary */}
            {report.summary && (
              <div className="p-8 border-b border-tb-border print:p-6 print:break-inside-avoid">
                <h2 className="text-lg font-semibold text-tb-text-primary mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-tb-accent" />
                  Résumé exécutif
                </h2>
                <p className="text-tb-text-secondary leading-relaxed">
                  {report.summary}
                </p>
              </div>
            )}

            {/* KPI Cards */}
            <div className="p-8 border-b border-tb-border print:p-6 print:break-inside-avoid">
              <h2 className="text-lg font-semibold text-tb-text-primary mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-tb-accent" />
                Indicateurs d'impact
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {kpiKeys.map((key) => {
                  const value = metrics[key];
                  if (value === undefined || value === null) return null;
                  return (
                    <div
                      key={key}
                      className="bg-tb-surface-elevated rounded-xl p-4 text-center print:bg-gray-50"
                    >
                      <div className="text-2xl font-bold text-tb-accent print:text-xl">
                        {formatMetricValue(key, value as number)}
                      </div>
                      <div className="text-xs text-tb-text-muted mt-1">
                        {getMetricLabel(key)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mission Activity */}
            <div className="p-8 border-b border-tb-border print:p-6 print:break-inside-avoid">
              <h2 className="text-lg font-semibold text-tb-text-primary mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-tb-accent" />
                Activité des missions
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-tb-text-secondary">Total missions</span>
                    <span className="font-medium text-tb-text-primary">{metrics.totalMissions || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-tb-text-secondary">Complétées</span>
                    <span className="font-medium text-tb-text-primary">{metrics.completedMissions || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-tb-text-secondary">Taux de complétion</span>
                    <span className="font-medium text-tb-text-primary">{metrics.completionRate || 0} %</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-tb-text-secondary">Collectives</span>
                    <span className="font-medium text-tb-text-primary">{metrics.collectiveMissions || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-tb-text-secondary">Solidaires</span>
                    <span className="font-medium text-tb-text-primary">{metrics.solidarityMissions || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-tb-text-secondary">Participants/mission</span>
                    <span className="font-medium text-tb-text-primary">{metrics.averageParticipantsPerMission || 0}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-tb-text-secondary">Actives</span>
                    <span className="font-medium text-tb-text-primary">{metrics.activeMissions || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-tb-text-secondary">Urgentes liées</span>
                    <span className="font-medium text-tb-text-primary">{metrics.urgentRequestsLinked || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TIME & Pot */}
            <div className="p-8 border-b border-tb-border print:p-6 print:break-inside-avoid">
              <h2 className="text-lg font-semibold text-tb-text-primary mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-tb-accent" />
                TIME et pot d'impact
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="text-xl font-bold text-tb-text-primary">{formatMetricValue("totalTimeMobilized", metrics.totalTimeMobilized || 0)}</div>
                  <div className="text-xs text-tb-text-muted">TIME mobilisés</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-tb-text-primary">{formatMetricValue("timeFromCollectiveMissions", metrics.timeFromCollectiveMissions || 0)}</div>
                  <div className="text-xs text-tb-text-muted">Issus des collectives</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-tb-text-primary">{formatMetricValue("timeFromSolidarityMissions", metrics.timeFromSolidarityMissions || 0)}</div>
                  <div className="text-xs text-tb-text-muted">Issus des solidaires</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-tb-accent">{formatMetricValue("organizationPotBalance", metrics.organizationPotBalance || 0)}</div>
                  <div className="text-xs text-tb-text-muted">Solde pot d'impact</div>
                </div>
              </div>
              {metrics.organizationPotDonations > 0 && (
                <p className="text-xs text-tb-text-muted mt-3">
                  {metrics.organizationPotDonations} TIME donnés au pot sur la période · {metrics.organizationPotFunded} TIME financés par le pot
                </p>
              )}
            </div>

            {/* Reciprocity */}
            <div className="p-8 border-b border-tb-border print:p-6 print:break-inside-avoid">
              <h2 className="text-lg font-semibold text-tb-text-primary mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-tb-accent" />
                Réciprocité et bénéficiaires
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="text-xl font-bold text-tb-accent">{metrics.reciprocityRate || 0} %</div>
                  <div className="text-xs text-tb-text-muted">Taux de réciprocité</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-tb-text-primary">{metrics.totalMembers || 0}</div>
                  <div className="text-xs text-tb-text-muted">Membres engagés</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-tb-text-primary">{metrics.estimatedBeneficiaries || 0}</div>
                  <div className="text-xs text-tb-text-muted">Bénéficiaires estimés</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-tb-text-primary">{metrics.receiversBecameContributors || 0}</div>
                  <div className="text-xs text-tb-text-muted">Receveurs devenus contributeurs</div>
                </div>
              </div>
            </div>

            {/* Wellbeing / Impact humain */}
            {wellbeingStats && wellbeingStats.totalResponses > 0 && (
              <div className="p-8 border-b border-tb-border print:p-6 print:break-inside-avoid">
                <h2 className="text-lg font-semibold text-tb-text-primary mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-tb-accent" />
                  Impact humain
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-xl font-bold text-tb-accent">{wellbeingStats.totalResponses}</div>
                    <div className="text-xs text-tb-text-muted">Réponses collectées</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-tb-text-primary">
                      {wellbeingStats.beforeAverage !== null ? `${wellbeingStats.beforeAverage}/100` : "—"}
                    </div>
                    <div className="text-xs text-tb-text-muted">Score moyen avant</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-tb-text-primary">
                      {wellbeingStats.afterAverage !== null ? `${wellbeingStats.afterAverage}/100` : "—"}
                    </div>
                    <div className="text-xs text-tb-text-muted">Score moyen après</div>
                  </div>
                  <div>
                    <div className={`text-xl font-bold ${(wellbeingStats.evolution ?? 0) > 0 ? "text-tb-accent" : "text-tb-text-muted"}`}>
                      {wellbeingStats.evolution !== null
                        ? `${wellbeingStats.evolution > 0 ? "+" : ""}${wellbeingStats.evolution}`
                        : "—"}
                    </div>
                    <div className="text-xs text-tb-text-muted">Évolution</div>
                  </div>
                </div>

                {/* Detailed dimension scores */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
                  {[
                    { label: "Isolement", value: wellbeingStats.isolationAvg },
                    { label: "Soutien", value: wellbeingStats.supportAvg },
                    { label: "Utilité", value: wellbeingStats.usefulnessAvg },
                    { label: "Confiance", value: wellbeingStats.trustAvg },
                    { label: "Contribution", value: wellbeingStats.contributionAvg },
                  ].map((d) => (
                    <div key={d.label} className="bg-tb-accent-soft/30 rounded-xl p-2">
                      <div className="font-semibold text-tb-text-primary">{d.value}/5</div>
                      <div className="text-[10px] text-tb-text-muted mt-0.5">{d.label}</div>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-tb-text-muted mt-4 italic">
                  Ces résultats sont déclaratifs et doivent être lus comme des indicateurs d&apos;impact humain, non comme une mesure médicale.
                </p>
              </div>
            )}

            {/* Highlights */}
            {highlights.length > 0 && (
              <div className="p-8 border-b border-tb-border print:p-6 print:break-inside-avoid">
                <h2 className="text-lg font-semibold text-tb-text-primary mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-tb-accent" />
                  Points forts
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {highlights.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-800"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                      {h}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risks */}
            {risks.length > 0 && (
              <div className="p-8 border-b border-tb-border print:p-6 print:break-inside-avoid">
                <h2 className="text-lg font-semibold text-tb-text-primary mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Points d'attention
                </h2>
                <div className="space-y-2">
                  {risks.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100 text-sm text-amber-800"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="p-8 border-b border-tb-border print:p-6 print:break-inside-avoid">
                <h2 className="text-lg font-semibold text-tb-text-primary mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-tb-accent" />
                  Recommandations
                </h2>
                <ul className="space-y-2">
                  {recommendations.map((r, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 p-3 rounded-xl bg-tb-accent/5 border border-tb-accent/10 text-sm text-tb-text-secondary"
                    >
                      <span className="w-5 h-5 rounded-full bg-tb-accent/10 text-tb-accent flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Methodology */}
            <div className="p-8 print:p-6">
              <h2 className="text-lg font-semibold text-tb-text-primary mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-tb-accent" />
                Méthodologie
              </h2>
              <div className="text-xs text-tb-text-muted space-y-2 leading-relaxed">
                <p>
                  Ce rapport d'impact a été généré par TimeHeroes à partir des données réelles de l'activité
                  de l'organisation sur la plateforme.
                </p>
                <p>
                  Les métriques présentées sont calculées à partir des missions, transactions et engagements
                  des membres sur la période sélectionnée.
                </p>
                <p>
                  <strong>Valeur sociale estimée</strong> : calculée sur la base de {report.socialValueHourlyRate} €
                  par heure mobilisée (référence : valeur du bénévolat en France, France Bénévolat).
                  Cette estimation est indicative et ne constitue pas une valorisation comptable officielle.
                </p>
                <p>
                  Aucune donnée personnelle (nom, email, adresse) n'est exposée dans ce rapport.
                  Les données sont agrégées et anonymisées.
                </p>
                <p className="pt-2 text-tb-text-muted">
                  Rapport généré le {report.generatedAt ? formatDate(report.generatedAt) : formatDate(report.createdAt)}
                  · TimeHeroes · {new Date().getFullYear()}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-tb-text-muted pb-6 print:pb-4">
              <hr className="border-tb-border mb-4 mx-8" />
              <p>TimeHeroes — Plateforme d'échange de temps et d'impact social</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Print styles ────────────────────────────────────────── */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .print\\:bg-white {
            background: white !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-none {
            border: none !important;
          }
          .print\\:p-6 {
            padding: 1.5rem !important;
          }
          .print\\:text-xl {
            font-size: 1.25rem !important;
          }
          .print\\:text-2xl {
            font-size: 1.5rem !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .print\\:border-tb-accent {
            border-color: #22c55e !important;
          }
          .print\\:border-b-2 {
            border-bottom-width: 2px !important;
          }
          .print\\:bg-gray-50 {
            background-color: #f9fafb !important;
          }
          @page {
            margin: 1.5cm;
            size: A4;
          }
        }
      `}</style>
    </>
  );
}
