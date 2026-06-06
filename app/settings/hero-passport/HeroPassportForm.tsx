"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Save, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { updateHeroPassport } from "@/lib/heroPassport";
import type { HeroPassportData } from "@/lib/heroPassport";

export default function HeroPassportForm({
  initialData,
  hasLocation,
}: {
  initialData: HeroPassportData;
  hasLocation: boolean;
}) {
  const [bio, setBio] = useState(initialData.bio ?? "");
  const [offeredSkills, setOfferedSkills] = useState(
    initialData.offeredSkills ?? ""
  );
  const [wantedHelp, setWantedHelp] = useState(initialData.wantedHelp ?? "");
  const [motivations, setMotivations] = useState(
    initialData.motivations ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [completion, setCompletion] = useState(initialData.completionPercent);
  const router = useRouter();

  const currentCompletion = useCallback(() => {
    let pct = 0;
    if (bio.trim()) pct += 25;
    if (offeredSkills.trim()) pct += 30;
    if (wantedHelp.trim()) pct += 20;
    if (motivations.trim()) pct += 25;
    return pct;
  }, [bio, offeredSkills, wantedHelp, motivations]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const fd = new FormData();
    fd.set("bio", bio);
    fd.set("offeredSkills", offeredSkills);
    fd.set("wantedHelp", wantedHelp);
    fd.set("motivations", motivations);

    const result = await updateHeroPassport(fd);

    if ("error" in result) {
      setMessage({ type: "error", text: result.error! });
    } else if ("errors" in result) {
      setMessage({ type: "error", text: "Certains champs sont invalides." });
    } else {
      setCompletion(result.completionPercent);
      setMessage({ type: "success", text: "Hero Passport sauvegardé !" });
      router.refresh();
    }

    setSaving(false);
  }

  const liveCompletion = currentCompletion();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Completion score */}
      <div className="bg-tb-surface border border-tb-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-tb-text-secondary font-medium">
            Complétion du profil
          </span>
          <span
            className={`text-lg font-bold font-anton tracking-wide ${
              liveCompletion >= 80
                ? "text-tb-accent"
                : liveCompletion >= 50
                  ? "text-yellow-400"
                  : "text-tb-text-secondary"
            }`}
          >
            {liveCompletion}%
          </span>
        </div>
        <div className="h-2 bg-tb-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              liveCompletion >= 80
                ? "bg-tb-accent"
                : liveCompletion >= 50
                  ? "bg-yellow-400"
                  : "bg-tb-text-secondary"
            }`}
            style={{ width: `${liveCompletion}%` }}
          />
        </div>
        {liveCompletion >= 80 && (
          <div className="mt-3 flex items-center gap-2 text-tb-accent text-sm">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">Profil complété</span>
          </div>
        )}
        {liveCompletion < 100 && (
          <p className="mt-2 text-xs text-tb-text-muted">
            Complète ton profil pour être mieux visible par la communauté.
          </p>
        )}
      </div>

      {/* Bio */}
      <div className="bg-tb-surface border border-tb-border rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-tb-accent" />
          <label className="text-sm text-tb-text-primary font-medium">Bio</label>
          <span className="text-[10px] text-tb-text-muted">
            +25% si rempli
          </span>
        </div>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Parle un peu de toi... tes passions, ton quartier, ce qui te motive au quotidien."
          maxLength={500}
          rows={3}
          className="w-full bg-tb-surface-elevated border border-tb-border rounded-xl px-4 py-3 text-sm text-tb-text-primary placeholder-tb-text-muted focus:outline-none focus:border-tb-accent/50 transition-colors resize-none"
        />
        <div className="text-right text-[10px] text-tb-text-muted">
          {bio.length}/500
        </div>
      </div>

      {/* Compétences offertes */}
      <div className="bg-tb-surface border border-tb-border rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-tb-accent" />
          <label className="text-sm text-tb-text-primary font-medium">
            Compétences offertes
          </label>
          <span className="text-[10px] text-tb-text-muted">
            +30% si rempli
          </span>
        </div>
        <textarea
          value={offeredSkills}
          onChange={(e) => setOfferedSkills(e.target.value)}
          placeholder="Ce que tu peux proposer aux autres héros. Ex: aide numérique, bricolage, cours, accompagnement..."
          maxLength={1000}
          rows={3}
          className="w-full bg-tb-surface-elevated border border-tb-border rounded-xl px-4 py-3 text-sm text-tb-text-primary placeholder-tb-text-muted focus:outline-none focus:border-tb-accent/50 transition-colors resize-none"
        />
        <div className="text-right text-[10px] text-tb-text-muted">
          {offeredSkills.length}/1000
        </div>
      </div>

      {/* Aides recherchées */}
      <div className="bg-tb-surface border border-tb-border rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-tb-accent" />
          <label className="text-sm text-tb-text-primary font-medium">
            Aides recherchées
          </label>
          <span className="text-[10px] text-tb-text-muted">
            +20% si rempli
          </span>
        </div>
        <textarea
          value={wantedHelp}
          onChange={(e) => setWantedHelp(e.target.value)}
          placeholder="De quoi tu aurais besoin ? Ex: aide pour un déménagement, cours de langue, conseils jardinage..."
          maxLength={1000}
          rows={3}
          className="w-full bg-tb-surface-elevated border border-tb-border rounded-xl px-4 py-3 text-sm text-tb-text-primary placeholder-tb-text-muted focus:outline-none focus:border-tb-accent/50 transition-colors resize-none"
        />
        <div className="text-right text-[10px] text-tb-text-muted">
          {wantedHelp.length}/1000
        </div>
      </div>

      {/* Motivations */}
      <div className="bg-tb-surface border border-tb-border rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-tb-accent" />
          <label className="text-sm text-tb-text-primary font-medium">
            Motivations
          </label>
          <span className="text-[10px] text-tb-text-muted">
            +25% si rempli
          </span>
        </div>
        <textarea
          value={motivations}
          onChange={(e) => setMotivations(e.target.value)}
          placeholder="Pourquoi tu fais partie de TimeHeroes ? Ex: créer du lien, aider les autres, transmettre mes compétences..."
          maxLength={1000}
          rows={3}
          className="w-full bg-tb-surface-elevated border border-tb-border rounded-xl px-4 py-3 text-sm text-tb-text-primary placeholder-tb-text-muted focus:outline-none focus:border-tb-accent/50 transition-colors resize-none"
        />
        <div className="text-right text-[10px] text-tb-text-muted">
          {motivations.length}/1000
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-tb-accent text-white font-semibold rounded-xl px-6 py-3 hover:bg-tb-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Save className="w-4 h-4" />
        {saving ? "Sauvegarde..." : "Sauvegarder"}
      </button>

      {/* Message */}
      {message && (
        <div
          className={`flex items-center gap-2 text-sm rounded-xl px-4 py-3 ${
            message.type === "success"
              ? "bg-tb-accent/10 text-tb-accent border border-tb-accent/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {message.text}
        </div>
      )}
    </form>
  );
}
