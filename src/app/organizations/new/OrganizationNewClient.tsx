"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConnectedHeader from "@/components/ConnectedHeader";
import { createOrganizationAction } from "@/app/actions/organizations";
import { ORGANIZATION_TYPES } from "@/lib/organization-labels";
import { Building2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function OrganizationNewClient() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);

    const form = new FormData(e.currentTarget);
    const result = await createOrganizationAction(form);

    setPending(false);
    if (result.error) {
      setError(result.error);
    } else if (result.success && result.slug) {
      router.push(`/organizations/${result.slug}/dashboard`);
    }
  }

  return (
    <div className="min-h-screen bg-tb-bg">
      <ConnectedHeader />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/organizations"
          className="flex items-center gap-1 text-sm text-tb-text-secondary hover:text-tb-text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux organisations
        </Link>

        <h1 className="text-2xl font-bold text-tb-text-primary flex items-center gap-2 mb-2">
          <Building2 className="w-6 h-6 text-tb-accent" />
          Créer une organisation
        </h1>
        <p className="text-tb-text-secondary text-sm mb-8">
          Créez un espace partenaire pour votre mairie, association, école,
          entreprise ou collectivité. Après création, un administrateur TimeHeroes
          vérifiera votre organisation.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-tb-border rounded-2xl p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-tb-text-primary mb-1">
              Nom de l'organisation <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              required
              minLength={3}
              placeholder="Ville d'Écouen, Association Les Voisins..."
              className="w-full bg-tb-surface-elevated border border-tb-border rounded-xl px-4 py-2.5 text-sm text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent/50"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-tb-text-primary mb-1">
              Type d'organisation <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              required
              className="w-full bg-tb-surface-elevated border border-tb-border rounded-xl px-4 py-2.5 text-sm text-tb-text-primary focus:outline-none focus:border-tb-accent/50"
            >
              <option value="">Sélectionnez un type...</option>
              {Object.entries(ORGANIZATION_TYPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Short description */}
          <div>
            <label className="block text-sm font-medium text-tb-text-primary mb-1">
              Description courte <span className="text-red-500">*</span>
            </label>
            <textarea
              name="shortDescription"
              required
              maxLength={180}
              rows={2}
              placeholder="En quelques mots, décrivez votre organisation..."
              className="w-full bg-tb-surface-elevated border border-tb-border rounded-xl px-4 py-2.5 text-sm text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent/50 resize-none"
            />
            <p className="text-xs text-tb-text-muted mt-1">Max 180 caractères</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-tb-text-primary mb-1">
              Description complète
            </label>
            <textarea
              name="description"
              maxLength={1500}
              rows={4}
              placeholder="Décrivez votre organisation, ses missions, ses objectifs..."
              className="w-full bg-tb-surface-elevated border border-tb-border rounded-xl px-4 py-2.5 text-sm text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent/50 resize-none"
            />
            <p className="text-xs text-tb-text-muted mt-1">Max 1500 caractères — optionnel</p>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-tb-text-primary mb-1">
                Ville <span className="text-red-500">*</span>
              </label>
              <input
                name="city"
                required
                placeholder="Paris"
                className="w-full bg-tb-surface-elevated border border-tb-border rounded-xl px-4 py-2.5 text-sm text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-tb-text-primary mb-1">
                Département
              </label>
              <input
                name="department"
                placeholder="Val-d'Oise"
                className="w-full bg-tb-surface-elevated border border-tb-border rounded-xl px-4 py-2.5 text-sm text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-tb-text-primary mb-1">
                Région
              </label>
              <input
                name="region"
                placeholder="Île-de-France"
                className="w-full bg-tb-surface-elevated border border-tb-border rounded-xl px-4 py-2.5 text-sm text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent/50"
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-tb-text-primary mb-1">
                Nom du contact
              </label>
              <input
                name="contactName"
                placeholder="Nom du responsable"
                className="w-full bg-tb-surface-elevated border border-tb-border rounded-xl px-4 py-2.5 text-sm text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-tb-text-primary mb-1">
                Email de contact
              </label>
              <input
                name="contactEmail"
                type="email"
                placeholder="contact@exemple.fr"
                className="w-full bg-tb-surface-elevated border border-tb-border rounded-xl px-4 py-2.5 text-sm text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent/50"
              />
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-tb-text-primary mb-1">
              Site web
            </label>
            <input
              name="websiteUrl"
              type="url"
              placeholder="https://mon-site.fr"
              className="w-full bg-tb-surface-elevated border border-tb-border rounded-xl px-4 py-2.5 text-sm text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent/50"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-tb-accent text-white hover:bg-tb-accent-hover transition-colors disabled:opacity-50"
          >
            {pending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <Building2 className="w-4 h-4" />
                Créer l'organisation
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
