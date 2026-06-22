"use client";

import ConnectedHeader from "@/components/ConnectedHeader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  ArrowLeft,
  Download,
  Archive,
  Eye,
  Clock,
} from "lucide-react";
import {
  getOrganizationTypeLabel,
} from "@/lib/organization-labels";
import {
  getReportTypeLabel,
  getReportStatusLabel,
  formatMetricValue,
} from "@/lib/impact-report-labels";
import { archiveImpactReportAction } from "@/app/actions/impact-reports";
import { useCallback } from "react";

type ReportData = {
  id: string;
  title: string;
  type: string;
  status: string;
  periodStart: string;
  periodEnd: string;
  generatedById: string | null;
  generatedAt: string | null;
  createdAt: string;
  socialValueEstimated: number;
  summary: string | null;
};

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
  reports: ReportData[];
  canGenerate: boolean;
  canArchive: boolean;
};

export default function OrganizationReportsListClient({
  organization: org,
  reports,
  canGenerate,
  canArchive,
}: Props) {
  const router = useRouter();

  const handleArchive = useCallback(
    async (reportId: string) => {
      if (!confirm("Archiver ce rapport ?")) return;
      const result = await archiveImpactReportAction(reportId);
      if ((result as any).success) {
        router.refresh();
      } else {
        alert(result.error);
      }
    },
    [router]
  );

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

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
              <FileText className="w-6 h-6 text-tb-accent" />
              Rapports d'impact
            </h1>
            <p className="text-tb-text-muted text-sm mt-1">
              {org.name}{org.city ? ` · ${org.city}` : ""}
            </p>
          </div>
          {canGenerate && (
            <Link
              href={`/organizations/${org.slug}/reports/new`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-tb-accent text-white hover:bg-tb-accent-hover transition-colors"
            >
              <Download className="w-4 h-4" />
              Générer un nouveau rapport
            </Link>
          )}
        </div>

        {/* Reports list */}
        {reports.length === 0 ? (
          <div className="bg-white border border-tb-border rounded-2xl p-8 text-center">
            <FileText className="w-12 h-12 text-tb-border mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-tb-text-primary mb-2">
              Aucun rapport généré
            </h3>
            <p className="text-sm text-tb-text-muted mb-4">
              Les rapports d'impact générés apparaîtront ici.
            </p>
            {canGenerate && (
              <Link
                href={`/organizations/${org.slug}/reports/new`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-tb-accent text-white hover:bg-tb-accent-hover transition-colors"
              >
                <Download className="w-4 h-4" />
                Générer un rapport
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white border border-tb-border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-tb-border bg-tb-surface-elevated">
                  <th className="text-left px-4 py-3 font-medium text-tb-text-primary">Titre</th>
                  <th className="text-left px-4 py-3 font-medium text-tb-text-primary hidden sm:table-cell">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-tb-text-primary hidden md:table-cell">Période</th>
                  <th className="text-left px-4 py-3 font-medium text-tb-text-primary">Statut</th>
                  <th className="text-left px-4 py-3 font-medium text-tb-text-primary hidden lg:table-cell">Valeur sociale</th>
                  <th className="text-right px-4 py-3 font-medium text-tb-text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-tb-border hover:bg-tb-surface-elevated/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-tb-text-primary">{report.title}</div>
                      <div className="text-xs text-tb-text-muted mt-0.5">
                        {formatDate(report.createdAt)}
                        {report.generatedAt && ` · ${formatDate(report.generatedAt)}`}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-tb-text-secondary hidden sm:table-cell">
                      {getReportTypeLabel(report.type)}
                    </td>
                    <td className="px-4 py-3 text-tb-text-secondary hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(report.periodStart)} — {formatDate(report.periodEnd)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          report.status === "GENERATED"
                            ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                            : report.status === "DRAFT"
                            ? "text-amber-700 bg-amber-50 border border-amber-200"
                            : "text-gray-500 bg-gray-50 border border-gray-200"
                        }`}
                      >
                        {getReportStatusLabel(report.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-tb-text-secondary hidden lg:table-cell">
                      {report.socialValueEstimated.toLocaleString("fr-FR")} €
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/organizations/${org.slug}/reports/${report.id}`}
                          className="p-2 rounded-lg text-tb-text-secondary hover:text-tb-accent hover:bg-tb-accent/5 transition-colors"
                          title="Voir le rapport"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {canArchive && report.status !== "ARCHIVED" && (
                          <button
                            onClick={() => handleArchive(report.id)}
                            className="p-2 rounded-lg text-tb-text-secondary hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Archiver"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
