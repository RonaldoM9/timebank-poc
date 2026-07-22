"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrganizationAction } from "@/app/actions/organizations";
import { ArrowLeft, Clock, Loader2, Save, Building2 } from "lucide-react";
import Link from "next/link";

type OrganizationData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  websiteUrl: string | null;
  contactName: string | null;
  contactEmail: string | null;
  logoUrl: string | null;
};

type Props = {
  organization: OrganizationData;
};

export default function OrganizationSettingsClient({
  organization,
}: Props) {
  const router = useRouter();
  const org = organization;
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateOrganizationAction(org.id, formData);

    if (result?.error) {
      setError(result.error);
      setPending(false);
      return;
    }

    setSuccess("Organisation mise à jour !");
    setPending(false);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-tb-bg">
      <header className="border-b border-tb-border bg-white">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-tb-accent" />
            <span className="font-anton text-lg tracking-wide text-tb-text-primary">
              TimeHeroes
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href={`/organizations/${org.slug}/dashboard`}
          className="inline-flex items-center gap-2 text-tb-text-secondary hover:text-tb-text-primary transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau de bord
        </Link>

        <div className="bg-white border border-tb-border rounded-2xl p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-xl font-anton tracking-wide text-tb-text-primary flex items-center gap-2 mb-1">
              <Building2 className="w-5 h-5 text-tb-accent" />
              Paramètres — {org.name}
            </h1>
            <p className="text-xs text-tb-text-muted">
              Modifie les informations de ton organisation
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-xl p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-tb-accent/10 border border-tb-accent/20 rounded-xl p-3">
                <p className="text-tb-accent text-sm">{success}</p>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-tb-text-secondary mb-1.5">
                Nom de l&apos;organisation
              </label>
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={org.name}
                className="w-full bg-tb-bg border border-tb-border rounded-xl px-4 py-2.5 text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent transition-colors"
              />
            </div>

            <div>
              <label htmlFor="shortDescription" className="block text-sm font-medium text-tb-text-secondary mb-1.5">
                Description courte
              </label>
              <input
                id="shortDescription"
                name="shortDescription"
                type="text"
                defaultValue={org.shortDescription || ""}
                placeholder="Une phrase qui résume votre organisation"
                maxLength={180}
                className="w-full bg-tb-bg border border-tb-border rounded-xl px-4 py-2.5 text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent transition-colors"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-tb-text-secondary mb-1.5">
                Description complète
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={org.description || ""}
                placeholder="Décrivez votre organisation en détail…"
                className="w-full bg-tb-bg border border-tb-border rounded-xl px-4 py-2.5 text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent transition-colors resize-vertical"
              />
            </div>

            <div>
              <label htmlFor="websiteUrl" className="block text-sm font-medium text-tb-text-secondary mb-1.5">
                Site web
              </label>
              <input
                id="websiteUrl"
                name="websiteUrl"
                type="url"
                defaultValue={org.websiteUrl || ""}
                placeholder="https://example.org"
                className="w-full bg-tb-bg border border-tb-border rounded-xl px-4 py-2.5 text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent transition-colors"
              />
            </div>

            <div>
              <label htmlFor="logoUrl" className="block text-sm font-medium text-tb-text-secondary mb-1.5">
                URL du logo
              </label>
              <input
                id="logoUrl"
                name="logoUrl"
                type="url"
                defaultValue={org.logoUrl || ""}
                placeholder="https://example.org/logo.png"
                className="w-full bg-tb-bg border border-tb-border rounded-xl px-4 py-2.5 text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent transition-colors"
              />
            </div>

            <div className="border-t border-tb-border pt-5">
              <h2 className="text-sm font-semibold text-tb-text-primary mb-3">
                Coordonnées
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contactName" className="block text-sm font-medium text-tb-text-secondary mb-1.5">
                    Nom du contact
                  </label>
                  <input
                    id="contactName"
                    name="contactName"
                    type="text"
                    defaultValue={org.contactName || ""}
                    placeholder="Nom du responsable"
                    className="w-full bg-tb-bg border border-tb-border rounded-xl px-4 py-2.5 text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-tb-text-secondary mb-1.5">
                    Email de contact
                  </label>
                  <input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    defaultValue={org.contactEmail || ""}
                    placeholder="contact@example.org"
                    className="w-full bg-tb-bg border border-tb-border rounded-xl px-4 py-2.5 text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent transition-colors"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-tb-accent hover:bg-tb-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-xl py-3 transition-colors flex items-center justify-center gap-2"
            >
              {pending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enregistrement…
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Enregistrer les modifications
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
