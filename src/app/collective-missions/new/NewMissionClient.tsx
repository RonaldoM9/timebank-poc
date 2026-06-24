"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCollectiveMissionAction } from "../actions";
import {
  ArrowLeft,
  Clock,
  Loader2,
  HeartHandshake,
  MapPin,
  Globe,
  Users,
  DollarSign,
  CalendarClock,
  CheckCircle2,
  AlertCircle,
  Target,
} from "lucide-react";
import Link from "next/link";

// ─── Constants ─────────────────────────────────────────────────────────────────

const MISSION_TYPES: { value: string; label: string; tagline: string; description: string }[] = [
  { value: "ONE_TO_MANY", label: "Mission Mentor",    tagline: "1 → N · Transmets ton talent",         description: "Un Hero transmet son savoir ou son talent à plusieurs participants : atelier, cours, initiation, transmission." },
  { value: "MANY_TO_ONE", label: "Escouade Renfort",  tagline: "N → 1 · Mobilise-toi pour aider",       description: "Plusieurs Heroes se rassemblent pour aider une personne face à un besoin concret." },
  { value: "MANY_TO_MANY", label: "Alliance Heroes",   tagline: "N → N · Unissez vos forces",            description: "Des Heroes unissent leurs forces pour réussir une mission commune dans le quartier." },
  { value: "ORG_TO_MANY", label: "Mission Publique",   tagline: "🏛 → N · Réponds à l'appel citoyen",     description: "Une association, école, mairie ou organisation lance une mission officielle pour mobiliser les Heroes." },
];

const CATEGORIES: { value: string; label: string }[] = [
  { value: "Aide numérique", label: "Aide numérique" },
  { value: "Soutien scolaire", label: "Soutien scolaire" },
  { value: "Bricolage simple", label: "Bricolage simple" },
  { value: "Aide administrative", label: "Aide administrative" },
  { value: "Déménagement léger", label: "Déménagement léger" },
  { value: "Seniors", label: "Seniors" },
  { value: "Informatique", label: "Informatique" },
  { value: "Cuisine", label: "Cuisine" },
  { value: "Transport", label: "Transport" },
  { value: "Career", label: "Career" },
  { value: "Langues", label: "Langues" },
  { value: "Jardinage", label: "Jardinage" },
];

const SOLIDARITY_CATEGORIES: { value: string; label: string }[] = [
  { value: "DIGITAL_HELP", label: "Dépannage Numérique" },
  { value: "SENIOR_SUPPORT", label: "Visite aux Seniors" },
  { value: "LOCAL_SUPPORT", label: "Entraide de Quartier" },
];

const FUNDING_SOURCES: { value: string; label: string }[] = [
  { value: "NONE", label: "Aucun financement" },
  { value: "COMMUNITY_POT", label: "Pot commun (TIME)" },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function NewMissionClient() {
  const router = useRouter();

  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSolidarity, setIsSolidarity] = useState(false);
  const [online, setOnline] = useState(false);
  const [selectedType, setSelectedType] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setSuccess(null);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const rawStartsAtDate = formData.get("startsAtDate") as string;
    const rawStartsAtTime = formData.get("startsAtTime") as string;
    const rawEndsAtDate = formData.get("endsAtDate") as string;
    const rawEndsAtTime = formData.get("endsAtTime") as string;

    const startsAt = rawStartsAtDate && rawStartsAtTime
      ? `${rawStartsAtDate}T${rawStartsAtTime}`
      : rawStartsAtDate
      ? `${rawStartsAtDate}T00:00`
      : undefined;

    const endsAt = rawEndsAtDate && rawEndsAtTime
      ? `${rawEndsAtDate}T${rawEndsAtTime}`
      : rawEndsAtDate
      ? `${rawEndsAtDate}T00:00`
      : undefined;

    const data = {
      title: (formData.get("title") as string).trim(),
      description: (formData.get("description") as string).trim(),
      type: formData.get("type") as string,
      category: (formData.get("category") as string) || undefined,
      city: (formData.get("city") as string).trim() || undefined,
      department: (formData.get("department") as string).trim() || undefined,
      region: (formData.get("region") as string).trim() || undefined,
      locationLabel: (formData.get("locationLabel") as string).trim() || undefined,
      online: online,
      startsAt,
      endsAt,
      durationHours: parseInt(formData.get("durationHours") as string, 10),
      maxParticipants: parseInt(formData.get("maxParticipants") as string, 10),
      fundingSource: (formData.get("fundingSource") as string) || undefined,
      isSolidarity: isSolidarity,
      solidarityCategory: isSolidarity ? (formData.get("solidarityCategory") as string) || undefined : undefined,
      solidarityReason: isSolidarity ? (formData.get("solidarityReason") as string).trim() || undefined : undefined,
    };

    const result = await createCollectiveMissionAction(data);

    if (!result.success) {
      setError(result.error);
      setPending(false);
      return;
    }

    setSuccess("Mission collective créée avec succès !");
    setPending(false);

    if (result.id) {
      setTimeout(() => {
        router.push(`/collective-missions/${result.id}`);
      }, 800);
    }
  }

  return (
    <div className="min-h-screen bg-tb-bg">
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/collective-missions"
          className="inline-flex items-center gap-2 text-tb-text-secondary hover:text-tb-text-primary transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux missions collectives
        </Link>

        <div className="bg-tb-surface border border-tb-border rounded-2xl p-6 sm:p-8">
          {/* ── Header ────────────────────────────────────────────── */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <Target className="w-6 h-6 text-tb-accent" />
              <h1 className="text-2xl font-anton tracking-wide text-tb-text-primary">
                Créer une mission collective
              </h1>
            </div>
            <span className="font-bangers text-tb-accent text-xs tracking-wider">
              ~ mobilise la communauté autour d&apos;un objectif commun ~
            </span>
          </div>

          {/* ── Success Banner ────────────────────────────────────── */}
          {success && (
            <div className="flex items-center gap-3 bg-emerald-900/20 border border-emerald-800 rounded-xl p-4 mb-6">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-emerald-300 text-sm font-medium">{success}</p>
            </div>
          )}

          {/* ── Error Alert ───────────────────────────────────────── */}
          {error && (
            <div className="flex items-start gap-3 bg-red-900/20 border border-red-800 rounded-xl p-4 mb-6">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 text-sm font-medium">Erreur</p>
                <p className="text-red-300 text-xs mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* ── Form ──────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── Title ──────────────────────────────────────────── */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-tb-text-secondary mb-1.5">
                Titre de la mission <span className="text-tb-accent">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                minLength={5}
                placeholder="Ex: Atelier jardinage collectif au parc"
                className="w-full bg-tb-bg border border-tb-border rounded-xl px-4 py-2.5 text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent transition-colors"
              />
              <p className="text-[10px] text-tb-text-muted mt-1">Au moins 5 caractères</p>
            </div>

            {/* ── Description ─────────────────────────────────────── */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-tb-text-secondary mb-1.5">
                Description <span className="text-tb-accent">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                minLength={20}
                rows={4}
                placeholder="Décris l'objectif, le déroulement, ce que les participants doivent apporter…"
                className="w-full bg-tb-bg border border-tb-border rounded-xl px-4 py-2.5 text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent transition-colors resize-vertical"
              />
              <p className="text-[10px] text-tb-text-muted mt-1">Au moins 20 caractères</p>
            </div>

            {/* ── Type + Category ─────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-tb-text-secondary mb-1.5">
                  Type de mission <span className="text-tb-accent">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  defaultValue=""
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-tb-bg border border-tb-border rounded-xl px-4 py-2.5 text-tb-text-primary focus:outline-none focus:border-tb-accent transition-colors appearance-none"
                >
                  <option value="" disabled>Choisis un type</option>
                  {MISSION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label} — {t.tagline}</option>
                  ))}
                </select>
                {/* Microcopy dynamique */}
                {selectedType && (() => {
                  const type = MISSION_TYPES.find(t => t.value === selectedType);
                  return type ? (
                    <p className="mt-1.5 text-xs text-tb-text-secondary leading-relaxed bg-tb-accent/5 rounded-lg px-3 py-2 border border-tb-accent/10">
                      {type.description}
                    </p>
                  ) : null;
                })()}
              </div>

              <div>
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
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── Location ─────────────────────────────────────────── */}
            <div className="border-t border-tb-border pt-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-tb-accent" />
                <h2 className="text-sm font-semibold text-tb-text-primary">Localisation</h2>
              </div>

              <div className="space-y-4">
                {/* Online checkbox */}
                <label className="flex items-center gap-3 bg-tb-bg border border-tb-border rounded-xl px-4 py-3 cursor-pointer hover:border-tb-accent/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={online}
                    onChange={(e) => setOnline(e.target.checked)}
                    className="w-4 h-4 accent-[#00d4aa]"
                  />
                  <Globe className="w-4 h-4 text-tb-accent" />
                  <span className="text-sm text-tb-text-primary">Mission en ligne (distanciel)</span>
                </label>

                {!online && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-tb-text-secondary mb-1.5">
                        Ville <span className="text-tb-text-muted">(requis si présentiel)</span>
                      </label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        placeholder="Ex: Paris"
                        className="w-full bg-tb-bg border border-tb-border rounded-xl px-4 py-2.5 text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-tb-text-secondary mb-1.5">
                        Département <span className="text-tb-text-muted">(requis si présentiel)</span>
                      </label>
                      <input
                        id="department"
                        name="department"
                        type="text"
                        placeholder="Ex: 75"
                        className="w-full bg-tb-bg border border-tb-border rounded-xl px-4 py-2.5 text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="region" className="block text-sm font-medium text-tb-text-secondary mb-1.5">
                        Région <span className="text-tb-text-muted">(optionnel)</span>
                      </label>
                      <input
                        id="region"
                        name="region"
                        type="text"
                        placeholder="Ex: Île-de-France"
                        className="w-full bg-tb-bg border border-tb-border rounded-xl px-4 py-2.5 text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="locationLabel" className="block text-sm font-medium text-tb-text-secondary mb-1.5">
                        Lieu précis <span className="text-tb-text-muted">(optionnel)</span>
                      </label>
                      <input
                        id="locationLabel"
                        name="locationLabel"
                        type="text"
                        placeholder="Ex: Jardin du Luxembourg, entrée est"
                        className="w-full bg-tb-bg border border-tb-border rounded-xl px-4 py-2.5 text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent transition-colors"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Schedule ─────────────────────────────────────────── */}
            <div className="border-t border-tb-border pt-5">
              <div className="flex items-center gap-2 mb-3">
                <CalendarClock className="w-5 h-5 text-tb-accent" />
                <h2 className="text-sm font-semibold text-tb-text-primary">Planning</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-tb-text-secondary mb-1.5">
                    Début
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="startsAtDate"
                      name="startsAtDate"
                      type="date"
                      className="flex-1 min-w-0 bg-tb-bg border border-tb-border rounded-xl px-4 py-2.5 text-tb-text-primary focus:outline-none focus:border-tb-accent transition-colors"
                    />
                    <input
                      id="startsAtTime"
                      name="startsAtTime"
                      type="time"
                      defaultValue="09:00"
                      className="w-[130px] shrink-0 bg-tb-bg border border-tb-border rounded-xl px-4 py-2.5 text-tb-text-primary focus:outline-none focus:border-tb-accent transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-tb-text-secondary mb-1.5">
                    Fin
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="endsAtDate"
                      name="endsAtDate"
                      type="date"
                      className="flex-1 min-w-0 bg-tb-bg border border-tb-border rounded-xl px-4 py-2.5 text-tb-text-primary focus:outline-none focus:border-tb-accent transition-colors"
                    />
                    <input
                      id="endsAtTime"
                      name="endsAtTime"
                      type="time"
                      defaultValue="17:00"
                      className="w-[130px] shrink-0 bg-tb-bg border border-tb-border rounded-xl px-4 py-2.5 text-tb-text-primary focus:outline-none focus:border-tb-accent transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Duration + Participants ──────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="durationHours" className="block text-sm font-medium text-tb-text-secondary mb-1.5">
                  <Clock className="w-3.5 h-3.5 inline mr-1 text-tb-accent" />
                  Durée (heures) <span className="text-tb-accent">*</span>
                </label>
                <input
                  id="durationHours"
                  name="durationHours"
                  type="number"
                  required
                  min="1"
                  max="8"
                  defaultValue={2}
                  className="w-full bg-tb-bg border border-tb-border rounded-xl px-4 py-2.5 text-tb-text-primary focus:outline-none focus:border-tb-accent transition-colors"
                />
                <p className="text-[10px] text-tb-text-muted mt-1">Entre 1 et 8 heures</p>
              </div>

              <div>
                <label htmlFor="maxParticipants" className="block text-sm font-medium text-tb-text-secondary mb-1.5">
                  <Users className="w-3.5 h-3.5 inline mr-1 text-tb-accent" />
                  Participants max <span className="text-tb-accent">*</span>
                </label>
                <input
                  id="maxParticipants"
                  name="maxParticipants"
                  type="number"
                  required
                  min="2"
                  max="100"
                  defaultValue={10}
                  className="w-full bg-tb-bg border border-tb-border rounded-xl px-4 py-2.5 text-tb-text-primary focus:outline-none focus:border-tb-accent transition-colors"
                />
                <p className="text-[10px] text-tb-text-muted mt-1">Entre 2 et 100</p>
              </div>
            </div>

            {/* ── Funding Source ───────────────────────────────────── */}
            <div>
              <label htmlFor="fundingSource" className="block text-sm font-medium text-tb-text-secondary mb-1.5">
                <DollarSign className="w-3.5 h-3.5 inline mr-1 text-tb-accent" />
                Financement
              </label>
              <select
                id="fundingSource"
                name="fundingSource"
                defaultValue="NONE"
                className="w-full bg-tb-bg border border-tb-border rounded-xl px-4 py-2.5 text-tb-text-primary focus:outline-none focus:border-tb-accent transition-colors appearance-none"
              >
                {FUNDING_SOURCES.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <p className="text-[10px] text-tb-text-muted mt-1">
                Le pot commun permet de rémunérer les participants en TIME depuis le pot commun.
              </p>
            </div>

            {/* ── Solidarity ─────────────────────────────────────── */}
            <div className="border-t border-tb-border pt-5">
              <div className="flex items-center gap-2 mb-3">
                <HeartHandshake className="w-5 h-5 text-tb-accent" />
                <h2 className="text-sm font-semibold text-tb-text-primary">
                  Dimension solidaire
                </h2>
              </div>
              <p className="text-xs text-tb-text-secondary mb-3 leading-relaxed">
                Une mission solidaire répond à un besoin essentiel : lien social, aide numérique,
                soutien à un senior ou accompagnement local.
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
                  <div className="bg-tb-surface border border-tb-border rounded-xl p-4 space-y-4">
                    <div>
                      <label htmlFor="solidarityCategory" className="block text-sm font-medium text-tb-text-secondary mb-1.5">
                        Catégorie solidaire <span className="text-tb-accent">*</span>
                      </label>
                      <select
                        id="solidarityCategory"
                        name="solidarityCategory"
                        defaultValue=""
                        className="w-full bg-tb-bg border border-tb-border rounded-xl px-4 py-2.5 text-tb-text-primary focus:outline-none focus:border-tb-accent transition-colors appearance-none text-sm"
                      >
                        <option value="" disabled>Choisis une catégorie</option>
                        {SOLIDARITY_CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="solidarityReason" className="block text-sm font-medium text-tb-text-secondary mb-1.5">
                        Pourquoi cette mission est-elle solidaire&nbsp;? <span className="text-tb-accent">*</span>
                      </label>
                      <textarea
                        id="solidarityReason"
                        name="solidarityReason"
                        rows={2}
                        placeholder="Ex: Nous allons aider les seniors du quartier à installer des outils numériques."
                        className="w-full bg-tb-bg border border-tb-border rounded-xl px-4 py-2.5 text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent transition-colors resize-none text-sm"
                      />
                      <p className="text-[10px] text-tb-text-muted mt-1">
                        Pas de données sensibles (médical, adresse, tel, email, finances).
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Submit ──────────────────────────────────────────── */}
            <button
              type="submit"
              disabled={pending}
              className="w-full bg-tb-accent hover:bg-tb-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-xl py-3 transition-colors flex items-center justify-center gap-2"
            >
              {pending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Création…
                </>
              ) : (
                "Créer la mission collective"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
