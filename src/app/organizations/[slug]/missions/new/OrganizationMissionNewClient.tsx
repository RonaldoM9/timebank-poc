"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createService } from "@/app/services/actions";
import { ArrowLeft, Clock, Loader2, HeartHandshake } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  "Tech", "Design", "Langues", "Career", "Bricolage",
  "Cuisine", "Bien-être", "Administratif", "Communauté", "Autre",
];

const SOLIDARITY_CATEGORIES = [
  { value: "SOCIAL_LINK", label: "Temps de lien" },
  { value: "DIGITAL_HELP", label: "Dépannage Numérique" },
  { value: "LOCAL_SUPPORT", label: "Entraide de Quartier" },
  { value: "CAREGIVER_SUPPORT", label: "Aidants" },
  { value: "SENIOR_SUPPORT", label: "Visite aux Seniors" },
  { value: "TRANSMISSION", label: "Transmission" },
  { value: "NEWCOMER_HELP", label: "Nouveaux arrivants" },
  { value: "SAFE_HOME", label: "Maison sûre" },
  { value: "URGENT_SOLIDARITY", label: "Urgence solidaire" },
  { value: "OTHER", label: "Autre" },
];

type Props = {
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
};

export default function OrganizationMissionNewClient({
  organizationId,
  organizationSlug,
  organizationName,
}: Props) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const [pending, setPending] = useState(false);
  const [isSolidarity, setIsSolidarity] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setErrors(null);

    const formData = new FormData(e.currentTarget);
    formData.set("organizationId", organizationId);
    const result = await createService(formData);

    if (result?.errors) {
      setErrors(result.errors as Record<string, string[]>);
      setPending(false);
      return;
    }

    if (result?.error) {
      setErrors({ _form: [result.error] });
      setPending(false);
      return;
    }

    router.push(`/organizations/${organizationSlug}/dashboard`);
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
          href={`/organizations/${organizationSlug}/dashboard`}
          className="inline-flex items-center gap-2 text-tb-text-secondary hover:text-tb-text-primary transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau de bord
        </Link>

        <div className="bg-white border border-tb-border rounded-2xl p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-anton tracking-wide text-tb-text-primary mb-1">
              Nouvelle mission — {organizationName}
            </h1>
            <span className="font-bangers text-tb-accent text-xs tracking-wider">
              ~ crée une mission pour les membres de ton organisation ~
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input type="hidden" name="organizationId" value={organizationId} />

            {errors?._form && (
              <div className="bg-red-900/20 border border-red-800 rounded-xl p-3">
                <p className="text-red-400 text-sm">{errors._form[0]}</p>
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-tb-text-secondary mb-1.5">
                Titre de la mission
              </label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="Ex: Aide Next.js pour débutant"
                className="w-full bg-tb-bg border border-tb-border rounded-xl px-4 py-2.5 text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent transition-colors"
              />
              {errors?.title && (
                <p className="text-red-400 text-xs mt-1">{errors.title[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-tb-text-secondary mb-1.5">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Décris ce que tu proposes en détail…"
                className="w-full bg-tb-bg border border-tb-border rounded-xl px-4 py-2.5 text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent transition-colors resize-vertical"
              />
              {errors?.description && (
                <p className="text-red-400 text-xs mt-1">{errors.description[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="category" className="block text-sm font-medium text-tb-text-secondary mb-1.5">
                  Catégorie
                </label>
                <select
                  id="category"
                  name="category"
                  defaultValue=""
                  className="w-full bg-tb-bg border border-tb-border rounded-xl px-4 py-2.5 text-tb-text-primary focus:outline-none focus:border-tb-accent transition-colors appearance-none"
                >
                  <option value="" disabled>Choisis une catégorie</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors?.category && (
                  <p className="text-red-400 text-xs mt-1">{errors.category[0]}</p>
                )}
              </div>
            </div>

            <div className="bg-tb-bg border border-tb-border rounded-xl px-4 py-3">
              <p className="text-sm text-tb-text-secondary flex items-center gap-2">
                <Clock className="w-4 h-4 text-tb-accent" />
                <span>1h de service = <strong className="text-tb-accent">1 TIME</strong> — le temps est la seule monnaie.</span>
              </p>
            </div>

            {/* Missions Solidaires */}
            <div className="border-t border-tb-border pt-5">
              <div className="flex items-center gap-2 mb-3">
                <HeartHandshake className="w-5 h-5 text-tb-accent" />
                <h2 className="text-sm font-semibold text-tb-text-primary">
                  Dimension solidaire
                </h2>
              </div>
              <p className="text-xs text-tb-text-secondary mb-3 leading-relaxed">
                Une mission solidaire répond à un besoin essentiel : lien social, aide numérique,
                soutien à un senior, accompagnement local, aide aux aidants ou transmission.
              </p>

              <div className="space-y-3">
                <label className="flex items-center gap-3 bg-tb-bg border border-tb-border rounded-xl px-4 py-3 cursor-pointer hover:border-tb-accent/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={isSolidarity}
                    onChange={(e) => setIsSolidarity(e.target.checked)}
                    className="w-4 h-4 accent-[#00d4aa]"
                  />
                  <span className="text-sm text-tb-text-primary">
                    Oui, c&apos;est une mission solidaire
                  </span>
                </label>

                {isSolidarity && (
                  <div className="bg-white border border-tb-border rounded-xl p-4 space-y-4">
                    <input type="hidden" name="isSolidarityMission" value="true" />

                    <div>
                      <label htmlFor="solidarityCategory" className="block text-sm font-medium text-tb-text-secondary mb-1.5">
                        Catégorie solidaire
                      </label>
                      <select
                        id="solidarityCategory"
                        name="solidarityCategory"
                        defaultValue=""
                        className="w-full bg-tb-bg border border-tb-border rounded-xl px-4 py-2.5 text-tb-text-primary focus:outline-none focus:border-tb-accent transition-colors appearance-none text-sm"
                      >
                        <option value="" disabled>Choisis une catégorie</option>
                        {SOLIDARITY_CATEGORIES.map((cat) => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                      {errors?.solidarityCategory && (
                        <p className="text-red-400 text-xs mt-1">{errors.solidarityCategory[0]}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="solidarityReason" className="block text-sm font-medium text-tb-text-secondary mb-1.5">
                        Pourquoi cette mission est-elle solidaire&nbsp;?
                      </label>
                      <textarea
                        id="solidarityReason"
                        name="solidarityReason"
                        rows={2}
                        placeholder="Ex: Ma mère a besoin d'aide avec son téléphone."
                        className="w-full bg-tb-bg border border-tb-border rounded-xl px-4 py-2.5 text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent transition-colors resize-none text-sm"
                      />
                      <p className="text-[10px] text-tb-text-muted mt-1">
                        Pas de données sensibles (médical, adresse, tel, email, finances).
                      </p>
                      {errors?.solidarityReason && (
                        <p className="text-red-400 text-xs mt-1">{errors.solidarityReason[0]}</p>
                      )}
                    </div>
                  </div>
                )}
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
                  Publication…
                </>
              ) : (
                "Publier la mission"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
