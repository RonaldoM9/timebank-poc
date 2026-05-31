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
  const [total, setTotal] = useState(0);

  function calcTotal() {
    const hours = parseInt((document.querySelector<HTMLInputElement>('input[name="hours"]')?.value) || "0", 10);
    const rate = parseInt((document.querySelector<HTMLInputElement>('input[name="ratePerHour"]')?.value) || "0", 10);
    setTotal(hours * rate);
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
    <div className="min-h-screen bg-[#0a0a0a]">
      <ConnectedHeader />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/urgent"
          className="inline-flex items-center gap-2 text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux demandes urgentes
        </Link>

        <div className="bg-[#111111] border border-[#262626] rounded-2xl p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-anton tracking-wide text-[#f5f5f5] mb-1">
              Demander de l&apos;aide
            </h1>
            <span className="font-bangers text-[#f59e0b] text-xs tracking-wider">
              ~ besoin local urgent ~
            </span>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 mb-6">
            <p className="text-[#a3a3a3] text-xs">
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
              <label htmlFor="title" className="block text-sm font-medium text-[#a3a3a3] mb-1.5">
                Titre du besoin
              </label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="Ex: Aide pour monter un meuble aujourd'hui"
                className="w-full bg-[#181818] border border-[#262626] rounded-xl px-4 py-2.5 text-[#f5f5f5] placeholder:text-[#5c5c5c] focus:outline-none focus:border-[#f59e0b] transition-colors"
              />
              {errors?.title && (
                <p className="text-red-400 text-xs mt-1">{errors.title[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[#a3a3a3] mb-1.5">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Décris précisément ce dont tu as besoin…"
                className="w-full bg-[#181818] border border-[#262626] rounded-xl px-4 py-2.5 text-[#f5f5f5] placeholder:text-[#5c5c5c] focus:outline-none focus:border-[#f59e0b] transition-colors resize-vertical"
              />
              {errors?.description && (
                <p className="text-red-400 text-xs mt-1">{errors.description[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-[#a3a3a3] mb-1.5">
                  Catégorie
                </label>
                <select
                  id="category"
                  name="category"
                  defaultValue=""
                  className="w-full bg-[#181818] border border-[#262626] rounded-xl px-4 py-2.5 text-[#f5f5f5] focus:outline-none focus:border-[#f59e0b] transition-colors appearance-none"
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
                <label htmlFor="urgency" className="block text-sm font-medium text-[#a3a3a3] mb-1.5">
                  Urgence
                </label>
                <select
                  id="urgency"
                  name="urgency"
                  defaultValue="today"
                  className="w-full bg-[#181818] border border-[#262626] rounded-xl px-4 py-2.5 text-[#f5f5f5] focus:outline-none focus:border-[#f59e0b] transition-colors appearance-none"
                >
                  <option value="today">Aujourd&apos;hui</option>
                  <option value="week">Cette semaine</option>
                </select>
              </div>
            </div>

            {/* Localisation */}
            <div>
              <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Zone</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="Ville"
                  defaultValue={prefill.city || ""}
                  className="w-full bg-[#181818] border border-[#262626] rounded-xl px-4 py-2.5 text-[#f5f5f5] placeholder:text-[#5c5c5c] focus:outline-none focus:border-[#f59e0b] transition-colors"
                />
                <input
                  id="department"
                  name="department"
                  type="text"
                  placeholder="Département"
                  defaultValue={prefill.department || ""}
                  className="w-full bg-[#181818] border border-[#262626] rounded-xl px-4 py-2.5 text-[#f5f5f5] placeholder:text-[#5c5c5c] focus:outline-none focus:border-[#f59e0b] transition-colors"
                />
                <input
                  id="region"
                  name="region"
                  type="text"
                  placeholder="Région"
                  defaultValue={prefill.region || ""}
                  className="w-full bg-[#181818] border border-[#262626] rounded-xl px-4 py-2.5 text-[#f5f5f5] placeholder:text-[#5c5c5c] focus:outline-none focus:border-[#f59e0b] transition-colors"
                />
              </div>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="online"
                  className="w-4 h-4 rounded border-[#262626] bg-[#181818] text-[#f59e0b] focus:ring-[#f59e0b]"
                />
                <span className="text-[#a3a3a3] text-sm">Disponible en ligne</span>
              </label>
            </div>

            {/* TIME */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="hours" className="block text-sm font-medium text-[#a3a3a3] mb-1.5">
                  Heures estimées
                </label>
                <input
                  id="hours"
                  name="hours"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="2"
                  onChange={calcTotal}
                  className="w-full bg-[#181818] border border-[#262626] rounded-xl px-4 py-2.5 text-[#f5f5f5] placeholder:text-[#5c5c5c] focus:outline-none focus:border-[#f59e0b] transition-colors"
                />
                {errors?.hours && (
                  <p className="text-red-400 text-xs mt-1">{errors.hours[0]}</p>
                )}
              </div>
              <div>
                <label htmlFor="ratePerHour" className="block text-sm font-medium text-[#a3a3a3] mb-1.5">
                  Tarif (TIME/h)
                </label>
                <input
                  id="ratePerHour"
                  name="ratePerHour"
                  type="number"
                  min="1"
                  max="3"
                  step="1"
                  placeholder="2"
                  onChange={calcTotal}
                  className="w-full bg-[#181818] border border-[#262626] rounded-xl px-4 py-2.5 text-[#f5f5f5] placeholder:text-[#5c5c5c] focus:outline-none focus:border-[#f59e0b] transition-colors"
                />
                <p className="text-[10px] text-[#5c5c5c] mt-1">1, 2 ou 3 TIME/h max</p>
                {errors?.ratePerHour && (
                  <p className="text-red-400 text-xs mt-1">{errors.ratePerHour[0]}</p>
                )}
              </div>
            </div>

            {/* Total */}
            {total > 0 && (
              <div className="bg-[#f59e0b]/5 border border-[#f59e0b]/20 rounded-xl p-4 text-center">
                <span className="text-[#a3a3a3] text-sm">Total : </span>
                <span className="text-2xl font-bold text-[#f59e0b]">{total}</span>
                <span className="text-[#a3a3a3] text-sm"> TIME</span>
              </div>
            )}

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
