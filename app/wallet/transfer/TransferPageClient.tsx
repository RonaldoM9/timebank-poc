"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Send,
  ArrowUpRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { transferTime, type TransferResult } from "../transfer-actions";

interface TransferPageClientProps {
  userId: string;
  userName: string;
  timeBalance: number;
}

export default function TransferPageClient({
  userId: _userId,
  userName,
  timeBalance,
}: TransferPageClientProps) {
  const router = useRouter();
  const [result, setResult] = useState<TransferResult | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setResult(null);
    try {
      const res = await transferTime(formData);
      setResult(res);
      if ("success" in res && res.success) {
        setTimeout(() => router.refresh(), 1200);
      }
    } catch (_err) {
      setResult({ error: "Une erreur inattendue s'est produite" });
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {/* Header */}
      <header className="border-b border-tb-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/wallet"
            className="text-tb-text-secondary hover:text-tb-text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-tb-accent" />
            <span className="font-anton text-lg tracking-wide text-tb-text-primary">
              TimeHeroes
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8 space-y-6">
        {/* Page title */}
        <div>
          <h1 className="text-2xl font-anton tracking-wide text-tb-text-primary">
            Transférer du TIME
          </h1>
          <p className="text-sm text-tb-text-secondary mt-1">
            Envoie du temps à un autre héros de la communauté
          </p>
        </div>

        {/* Balance card */}
        <div className="bg-tb-surface border border-tb-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-tb-text-secondary text-sm font-medium">
              Ton solde
            </span>
            <span className="text-tb-accent text-xs font-bangers tracking-wider">
              ~ disponible ~
            </span>
          </div>
          <div className="text-3xl font-bold text-tb-text-primary">
            {timeBalance}{" "}
            <span className="text-base text-tb-text-secondary font-normal">TIME</span>
          </div>
        </div>

        {/* Transfer form */}
        <div className="bg-tb-surface border border-tb-border rounded-2xl p-5">
          <h2 className="font-semibold text-tb-text-primary mb-4 flex items-center gap-2">
            <Send className="w-4 h-4 text-tb-accent" />
            Formulaire de transfert
          </h2>

          <form action={handleSubmit} className="space-y-4">
            {/* Recipient email */}
            <div>
              <label
                htmlFor="recipientEmail"
                className="block text-sm font-medium text-tb-text-secondary mb-1.5"
              >
                Email du destinataire
              </label>
              <input
                type="email"
                id="recipientEmail"
                name="recipientEmail"
                required
                placeholder="hero@exemple.com"
                className="w-full rounded-xl border border-tb-border bg-tb-bg px-4 py-2.5 text-sm text-tb-text-primary placeholder-tb-text-muted focus:outline-none focus:border-tb-accent focus:ring-1 focus:ring-tb-accent/30 transition-colors"
              />
            </div>

            {/* Amount */}
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-tb-text-secondary mb-1.5"
              >
                Montant (TIME)
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                required
                min="1"
                max={timeBalance}
                placeholder="0"
                className="w-full rounded-xl border border-tb-border bg-tb-bg px-4 py-2.5 text-sm text-tb-text-primary placeholder-tb-text-muted focus:outline-none focus:border-tb-accent focus:ring-1 focus:ring-tb-accent/30 transition-colors"
              />
              <p className="text-[10px] text-tb-text-muted mt-1">
                Maximum : {timeBalance} TIME
              </p>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={pending}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-tb-accent hover:bg-tb-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm px-4 py-3 transition-colors"
            >
              {pending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Transfert en cours…
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  Envoyer du TIME
                </>
              )}
            </button>
          </form>
        </div>

        {/* Result messages */}
        {result && (
          <div
            className={`rounded-2xl border p-4 ${
              "success" in result && result.success
                ? "bg-tb-accent/5 border-tb-accent/20"
                : "bg-red-500/5 border-red-500/20"
            }`}
          >
            {"success" in result && result.success ? (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-tb-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-tb-accent">
                    Transfert réussi&nbsp;!
                  </p>
                  <p className="text-xs text-tb-text-secondary mt-1">
                    Tu as envoyé {result.amount} TIME à {result.recipientName}.
                  </p>
                  <p className="text-xs text-tb-text-muted mt-1">
                    +30 XP gagnés pour ce don&nbsp;!
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-400">Erreur</p>
                  <p className="text-xs text-tb-text-secondary mt-1">
                    {"error" in result ? result.error : "Erreur inconnue"}
                  </p>
                  {"errors" in result && result.errors && (
                    <ul className="text-xs text-red-400 mt-1 space-y-0.5 list-disc list-inside">
                      {Object.entries(result.errors).map(([field, msgs]) =>
                        msgs.map((msg, i) => (
                          <li key={`${field}-${i}`}>
                            {field}: {msg}
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Back link */}
        <div className="text-center pt-4">
          <Link
            href="/wallet"
            className="inline-flex items-center gap-1.5 text-sm text-tb-text-secondary hover:text-tb-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au wallet
          </Link>
        </div>

        {/* Comics footer */}
        <div className="text-center">
          <span className="font-bangers text-tb-accent text-xs tracking-wider opacity-40">
            ~ donner, c&apos;est grandir ~
          </span>
        </div>
      </main>
    </>
  );
}
