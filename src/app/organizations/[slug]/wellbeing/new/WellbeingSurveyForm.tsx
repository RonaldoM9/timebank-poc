"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart, Send } from "lucide-react";
import ConnectedHeader from "@/components/ConnectedHeader";
import { submitWellbeingSurveyAction } from "@/app/actions/wellbeing";

const QUESTIONS = [
  { key: "isolationScore", label: "Je me sens entouré et moins isolé." },
  { key: "supportScore", label: "Je sais à qui demander de l'aide si besoin." },
  { key: "usefulnessScore", label: "Je me sens utile à ma communauté." },
  { key: "trustScore", label: "J'ai confiance dans les personnes autour de moi." },
  { key: "contributionScore", label: "J'ai envie de contribuer à mon tour." },
] as const;

const SCALE_LABELS = [
  "Pas du tout",
  "Un peu",
  "Moyennement",
  "Oui",
  "Tout à fait",
];

type Props = {
  organization: { id: string; name: string; slug: string };
  programId?: string;
  phase?: "BEFORE" | "AFTER" | "FOLLOW_UP";
};

export default function WellbeingSurveyForm({
  organization: org,
  programId,
  phase: initialPhase = "BEFORE",
}: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState(initialPhase);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const allAnswered = QUESTIONS.every((q) => typeof scores[q.key] === "number");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allAnswered) return;
    setSubmitting(true);
    setError(null);

    const fd = new FormData();
    fd.set("organizationId", org.id);
    fd.set("programId", programId ?? "");
    fd.set("contextType", programId ? "PROGRAM" : "ORGANIZATION");
    fd.set("contextId", programId ?? "");
    fd.set("phase", phase);
    fd.set("isolationScore", String(scores.isolationScore));
    fd.set("supportScore", String(scores.supportScore));
    fd.set("usefulnessScore", String(scores.usefulnessScore));
    fd.set("trustScore", String(scores.trustScore));
    fd.set("contributionScore", String(scores.contributionScore));
    fd.set("comment", comment);

    const result = await submitWellbeingSurveyAction(fd);
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push(`/organizations/${org.slug}/wellbeing`);
        router.refresh();
      }, 1500);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-tb-surface-elevated flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-tb-accent-soft flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-tb-accent" />
          </div>
          <h2 className="text-xl font-bold text-tb-text-primary mb-1">
            Merci pour votre réponse !
          </h2>
          <p className="text-sm text-tb-text-secondary">
            Votre contribution aide à mesurer l&apos;impact humain de TimeHeroes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tb-surface-elevated animate-fade-in-up">
      <ConnectedHeader />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href={`/organizations/${org.slug}/wellbeing`}
          className="inline-flex items-center gap-1 text-sm text-tb-text-secondary hover:text-tb-accent transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <div className="bg-tb-surface border border-tb-border rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-tb-accent-soft flex items-center justify-center">
              <Heart className="w-5 h-5 text-tb-accent" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-tb-text-primary">
                Questionnaire bien-être
              </h1>
              <p className="text-xs text-tb-text-muted">
                {org.name} · Phase{" "}
                {phase === "BEFORE" ? "avant" : phase === "AFTER" ? "après" : "suivi"}
              </p>
            </div>
          </div>

          {/* Phase selector */}
          <div className="flex gap-2 mb-6">
            {(["BEFORE", "AFTER", "FOLLOW_UP"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPhase(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  phase === p
                    ? "bg-tb-accent text-white"
                    : "bg-tb-border/50 text-tb-text-secondary hover:bg-tb-border"
                }`}
              >
                {p === "BEFORE" ? "Avant" : p === "AFTER" ? "Après" : "Suivi"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Questions */}
            {QUESTIONS.map((q) => (
              <div key={q.key}>
                <p className="text-sm font-medium text-tb-text-primary mb-3">
                  {q.label}
                </p>
                <div className="flex gap-1 sm:gap-2">
                  {SCALE_LABELS.map((label, i) => {
                    const val = i + 1;
                    const selected = scores[q.key] === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() =>
                          setScores((s) => ({ ...s, [q.key]: val }))
                        }
                        className={`flex-1 py-2.5 rounded-lg text-center text-xs font-medium transition-all ${
                          selected
                            ? "bg-tb-accent text-white shadow-md scale-105"
                            : "bg-tb-surface-elevated text-tb-text-secondary border border-tb-border hover:border-tb-accent"
                        }`}
                      >
                        {val}
                        <span className="block text-[9px] opacity-70 mt-0.5">
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Comment */}
            <div>
              <label className="text-sm font-medium text-tb-text-primary block mb-2">
                Commentaire libre (optionnel)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 500))}
                placeholder="Partagez votre expérience..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-tb-border bg-tb-surface text-sm text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:ring-2 focus:ring-tb-accent/30 focus:border-tb-accent resize-none"
              />
              <p className="text-[10px] text-tb-text-muted mt-1">
                {comment.length}/500 caractères
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!allAnswered || submitting}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                allAnswered && !submitting
                  ? "bg-tb-accent text-white hover:bg-tb-accent-hover"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
              {submitting ? "Envoi..." : "Envoyer mes réponses"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
