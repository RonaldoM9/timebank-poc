"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createService } from "@/app/services/actions";
import { ArrowLeft, Clock, Loader2 } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  "Tech", "Design", "Langues", "Career", "Bricolage",
  "Cuisine", "Bien-être", "Administratif", "Communauté", "Autre",
];

export default function ServiceNewClient() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setErrors(null);

    const formData = new FormData(e.currentTarget);
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

    router.push("/my-services");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="border-b border-[#262626]">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-[#00d4aa]" />
            <span className="font-anton text-lg tracking-wide text-[#f5f5f5]">
              TimeBank
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau de bord
        </Link>

        <div className="bg-[#111111] border border-[#262626] rounded-2xl p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-anton tracking-wide text-[#f5f5f5] mb-1">
              Proposer un service
            </h1>
            <span className="font-bangers text-[#00d4aa] text-xs tracking-wider">
              ~ partage ton super-pouvoir avec la communauté et gagne des TIME ~
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errors?._form && (
              <div className="bg-red-900/20 border border-red-800 rounded-xl p-3">
                <p className="text-red-400 text-sm">{errors._form[0]}</p>
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-[#a3a3a3] mb-1.5">
                Titre du service
              </label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="Aide Next.js pour débutant"
                className="w-full bg-[#181818] border border-[#262626] rounded-xl px-4 py-2.5 text-[#f5f5f5] placeholder:text-[#5c5c5c] focus:outline-none focus:border-[#00d4aa] transition-colors"
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
                placeholder="Décris ce que tu proposes en détail…"
                className="w-full bg-[#181818] border border-[#262626] rounded-xl px-4 py-2.5 text-[#f5f5f5] placeholder:text-[#5c5c5c] focus:outline-none focus:border-[#00d4aa] transition-colors resize-vertical"
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
                  className="w-full bg-[#181818] border border-[#262626] rounded-xl px-4 py-2.5 text-[#f5f5f5] focus:outline-none focus:border-[#00d4aa] transition-colors appearance-none"
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
                <label htmlFor="ratePerHour" className="block text-sm font-medium text-[#a3a3a3] mb-1.5">
                  Tarif (TIME/h)
                </label>
                <input
                  id="ratePerHour"
                  name="ratePerHour"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="2"
                  className="w-full bg-[#181818] border border-[#262626] rounded-xl px-4 py-2.5 text-[#f5f5f5] placeholder:text-[#5c5c5c] focus:outline-none focus:border-[#00d4aa] transition-colors"
                />
                {errors?.ratePerHour && (
                  <p className="text-red-400 text-xs mt-1">{errors.ratePerHour[0]}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-[#00d4aa] hover:bg-[#00b894] disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-xl py-3 transition-colors flex items-center justify-center gap-2"
            >
              {pending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publication…
                </>
              ) : (
                "Publier mon service"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
