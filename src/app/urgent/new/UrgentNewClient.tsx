"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUrgentRequest } from "@/app/urgent/actions";
import { ArrowLeft, Zap, Loader2 } from "lucide-react";
import Link from "next/link";
import ConnectedHeader from "@/components/ConnectedHeader";

const CATEGORIES = [
  "Tech", "Design", "Langues", "Career", "Bricolage",
  "Cuisine", "Bien-être", "Administratif", "Communauté", "Autre",
];

export default function UrgentNewClient({ prefill }: { prefill: { city?: string; department?: string; region?: string } }) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const [pending, setPending] = useState(false);
  const [timeMode, setTimeMode] = useState<'hours' | 'time'>('hours');
  const [inputHours, setInputHours] = useState('');
  const [inputTime, setInputTime] = useState('');

  function calcFromHours() {
    // no-op: heures drive time now
  }

  function calcFromTime() {
    // no-op: time drives heures
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setErrors(null);

    const formData = new FormData(e.currentTarget);
    const result = await createUrgentRequest(formData);

    if (result && "errors" in result && result.errors) {
      setErrors(result.errors as Record<string, string[]>);
      setPending(false);
      return;
    }

    if (result && "error" in result) {
      setErrors({ _form: [result.error as string] });
      setPending(false);
      return;
    }

    router.push("/urgent");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ConnectedHeader />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/urgent"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux demandes urgentes
        </Link>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-anton tracking-wide text-gray-900 mb-1">
              Demander de l&apos;aide
            </h1>
            <span className="font-bangers text-[#f59e0b] text-xs tracking-wider">
              ~ besoin local urgent ~
            </span>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 mb-6">
            <p className="text-gray-500 text-xs">
              Pour les urgences médicales ou de sécurité, contactez les services d&apos;urgence (15, 17, 18, 112).
              TimeHeroes est un réseau d&apos;entraide locale, pas un service de secours.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errors?._form && (
              <div className="bg-red-900/20 border border-red-800 rounded-xl p-3">
                <p className="text-red-400 text-sm">{errors._form[0]}</p>
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-500 mb-1.5">
                Titre du besoin
              </label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="Ex: Aide pour monter un meuble aujourd'hui"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#f59e0b] transition-colors"
              />
              {errors?.title && (
                <p className="text-red-400 text-xs mt-1">{errors.title[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-500 mb-1.5">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Décris précisément ce dont tu as besoin…"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#f59e0b] transition-colors resize-vertical"
              />
              {errors?.description && (
                <p className="text-red-400 text-xs mt-1">{errors.description[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-500 mb-1.5">
                  Catégorie
                </label>
                <select
                  id="category"
                  name="category"
                  defaultValue=""
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:border-[#f59e0b] transition-colors appearance-none"
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

              <div>
                <label htmlFor="urgency" className="block text-sm font-medium text-gray-500 mb-1.5">
                  Urgence
                </label>
                <select
                  id="urgency"
                  name="urgency"
                  defaultValue="today"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:border-[#f59e0b] transition-colors appearance-none"
                >
                  <option value="today">Aujourd&apos;hui</option>
                  <option value="week">Cette semaine</option>
                </select>
              </div>
            </div>

            {/* Localisation */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Zone</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="Ville"
                  defaultValue={prefill.city || ""}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#f59e0b] transition-colors"
                />
                <input
                  id="department"
                  name="department"
                  type="text"
                  placeholder="Département"
                  defaultValue={prefill.department || ""}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#f59e0b] transition-colors"
                />
                <input
                  id="region"
                  name="region"
                  type="text"
                  placeholder="Région"
                  defaultValue={prefill.region || ""}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#f59e0b] transition-colors"
                />
              </div>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="online"
                  className="w-4 h-4 rounded border-gray-200 bg-white text-[#f59e0b] focus:ring-[#f59e0b]"
                />
                <span className="text-gray-500 text-sm">Disponible en ligne</span>
              </label>
            </div>

            {/* TIME — choix basculant Heures ↔ TIME */}
            <div className="bg-[#f59e0b]/5 border border-[#f59e0b]/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-center justify-center">
                <span className="text-xs font-medium text-gray-500">Je sais combien de</span>
                <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden text-sm">
                  <button
                    type="button"
                    onClick={() => { setTimeMode('hours'); calcFromHours(); }}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${timeMode === 'hours' ? 'bg-[#f59e0b] text-black' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    heures
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTimeMode('time'); calcFromTime(); }}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${timeMode === 'time' ? 'bg-[#f59e0b] text-black' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    TIME
                  </button>
                </div>
              </div>

              <input type="hidden" name="ratePerHour" value="1" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="hours" className="block text-xs font-medium text-gray-500 mb-1">
                    Heures estimées
                  </label>
                  <input
                    id="hours"
                    name="hours"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="2"
                    value={inputHours}
                    onChange={(e) => { setInputHours(e.target.value); setTimeMode('hours'); setInputTime(String(Number(e.target.value) || 0)); }}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#f59e0b] transition-colors"
                  />
                  {errors?.hours && (
                    <p className="text-red-400 text-xs mt-1">{errors.hours[0]}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="timeAmount" className="block text-xs font-medium text-gray-500 mb-1">
                    TIME
                  </label>
                  <input
                    id="timeAmount"
                    name="timeAmount"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="2"
                    value={inputTime}
                    onChange={(e) => { setInputTime(e.target.value); setTimeMode('time'); setInputHours(String(Number(e.target.value) || 0)); }}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#f59e0b] transition-colors"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">1 h = 1 TIME</p>
                  {errors?.timeAmount && (
                    <p className="text-red-400 text-xs mt-1">{errors.timeAmount[0]}</p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-xl py-3 transition-colors flex items-center justify-center gap-2"
            >
              {pending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publication…
                </>
              ) : (
                "Publier ma demande"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
