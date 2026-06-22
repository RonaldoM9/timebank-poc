"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ConnectedHeader from "@/components/ConnectedHeader";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileText,
  Loader2,
} from "lucide-react";
import {
  getOrganizationTypeLabel,
} from "@/lib/organization-labels";
import {
  IMPACT_REPORT_TYPES,
  IMPACT_REPORT_VISIBILITIES,
} from "@/lib/impact-report-labels";
import { generateImpactReportAction } from "@/app/actions/impact-reports";

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
};

export default function OrganizationReportNewClient({
  organization: org,
}: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, 1);
  const defaultStart = sixMonthsAgo.toISOString().split("T")[0];
  const defaultEnd = today.toISOString().split("T")[0];

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSubmitting(true);
      setError(null);

      const formData = new FormData(e.currentTarget);
      const result = await generateImpactReportAction(org.id, formData);

      if (result.success && result.reportId) {
        router.push(`/organizations/${org.slug}/reports/${result.reportId}`);
      } else {
        setError(result.error || "Erreur inconnue");
        setSubmitting(false);
      }
    },
    [org.id, org.slug, router]
  );

  return (
    <div className="min-h-screen bg-tb-bg">
      <ConnectedHeader />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <Link
            href={`/organizations/${org.slug}/reports`}
            className="flex items-center gap-1 text-sm text-tb-text-secondary hover:text-tb-text-primary mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Rapports d'impact
          </Link>
          <h1 className="text-2xl font-bold text-tb-text-primary flex items-center gap-2">
            <FileText className="w-6 h-6 text-tb-accent" />
            Générer un rapport d'impact
          </h1>
          <p className="text-tb-text-muted text-sm mt-1">
            {org.name}{org.city ? ` · ${org.city}` : ""}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white border border-tb-border rounded-2xl p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-tb-text-primary mb-1">
              Titre du rapport *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              maxLength={120}
              placeholder="Ex: Rapport Lien Social Seniors T1"
              className="w-full px-3 py-2 rounded-xl border border-tb-border bg-white text-tb-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-tb-accent/30 focus:border-tb-accent"
            />
          </div>

          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-tb-text-primary mb-1">
              Type de rapport *
            </label>
            <select
              id="type"
              name="type"
              required
              defaultValue="ORGANIZATION_SUMMARY"
              className="w-full px-3 py-2 rounded-xl border border-tb-border bg-white text-tb-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-tb-accent/30 focus:border-tb-accent"
            >
              {Object.entries(IMPACT_REPORT_TYPES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="periodStart" className="block text-sm font-medium text-tb-text-primary mb-1">
                Date de début *
              </label>
              <input
                type="date"
                id="periodStart"
                name="periodStart"
                required
                defaultValue={defaultStart}
                className="w-full px-3 py-2 rounded-xl border border-tb-border bg-white text-tb-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-tb-accent/30 focus:border-tb-accent"
              />
            </div>
            <div>
              <label htmlFor="periodEnd" className="block text-sm font-medium text-tb-text-primary mb-1">
                Date de fin *
              </label>
              <input
                type="date"
                id="periodEnd"
                name="periodEnd"
                required
                defaultValue={defaultEnd}
                className="w-full px-3 py-2 rounded-xl border border-tb-border bg-white text-tb-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-tb-accent/30 focus:border-tb-accent"
              />
            </div>
          </div>

          {/* Hourly rate */}
          <div>
            <label htmlFor="socialValueHourlyRate" className="block text-sm font-medium text-tb-text-primary mb-1">
              Valeur horaire estimée (€/h) *
            </label>
            <input
              type="number"
              id="socialValueHourlyRate"
              name="socialValueHourlyRate"
              required
              min={0}
              max={100}
              defaultValue={15}
              className="w-full max-w-[200px] px-3 py-2 rounded-xl border border-tb-border bg-white text-tb-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-tb-accent/30 focus:border-tb-accent"
            />
            <p className="text-xs text-tb-text-muted mt-1">
              Taux utilisé pour estimer la valeur sociale. Par défaut : 15 €/h (référence France Bénévolat).
            </p>
          </div>

          {/* Visibility */}
          <div>
            <label htmlFor="visibility" className="block text-sm font-medium text-tb-text-primary mb-1">
              Visibilité *
            </label>
            <select
              id="visibility"
              name="visibility"
              required
              defaultValue="PRIVATE"
              className="w-full px-3 py-2 rounded-xl border border-tb-border bg-white text-tb-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-tb-accent/30 focus:border-tb-accent"
            >
              {Object.entries(IMPACT_REPORT_VISIBILITIES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Options */}
          <fieldset className="border border-tb-border rounded-xl p-4 space-y-3">
            <legend className="text-sm font-medium text-tb-text-primary px-2">
              Options du rapport
            </legend>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="includeRecommendations"
                defaultChecked
                className="rounded border-tb-border text-tb-accent focus:ring-tb-accent/30"
              />
              <span className="text-sm text-tb-text-secondary">Inclure les recommandations</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="includeRisks"
                defaultChecked
                className="rounded border-tb-border text-tb-accent focus:ring-tb-accent/30"
              />
              <span className="text-sm text-tb-text-secondary">Inclure les points d'attention</span>
            </label>
          </fieldset>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-tb-accent text-white hover:bg-tb-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Générer le rapport
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
