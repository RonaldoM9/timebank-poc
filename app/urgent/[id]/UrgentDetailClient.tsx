"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowLeft, Zap, MapPin, Calendar, Clock, Users,
  User, Loader2, AlertCircle, CheckCircle, MessageSquare,
} from "lucide-react";
import { acceptOffer, proposeHelp } from "@/app/urgent/actions";

interface UrgentOffer {
  id: string;
  message: string | null;
  status: string;
  createdAt: string;
  provider: {
    id: string;
    name: string;
    reputation: number;
  };
}

interface UrgentDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  city: string | null;
  department: string | null;
  region: string | null;
  online: boolean;
  urgency: string;
  hours: number;
  ratePerHour: number;
  totalTime: number;
  status: string;
  createdAt: string;
  offersCount: number;
  requester: {
    id: string;
    name: string;
    reputation: number;
  };
  offers: UrgentOffer[];
}

export default function UrgentDetailClient({
  request,
  isRequester,
  hasOffered,
}: {
  request: UrgentDetail;
  isRequester: boolean;
  hasOffered: boolean;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleProposeHelp() {
    setSubmitting(true);
    setError(null);
    const result = await proposeHelp(request.id, message || undefined);
    if ("error" in result) {
      setError(result.error);
      setSubmitting(false);
    } else {
      setSuccess("Proposition envoyée ! Le demandeur pourra l'accepter.");
      setSubmitting(false);
    }
  }

  async function handleAcceptOffer(offerId: string) {
    if (!confirm("Accepter cette offre ? Un booking sera créé avec escrow TIME.")) return;
    setAccepting(offerId);
    setError(null);
    const result = await acceptOffer(request.id, offerId);
    if ("error" in result) {
      setError(result.error);
      setAccepting(null);
    } else {
      setSuccess("Offre acceptée ! Le booking a été créé. Voir dans le tableau de bord.");
      router.refresh();
    }
  }

  const isOpen = request.status === "open";
  const isMatched = request.status === "matched";

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="border-b border-[#262626]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-[#f59e0b]" />
            <span className="font-anton text-lg tracking-wide text-[#f5f5f5]">
              TimeHeroes — Urgent
            </span>
          </div>
          <Link
            href="/urgent"
            className="text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors text-sm"
          >
            Retour aux demandes
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/urgent"
          className="inline-flex items-center gap-2 text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux demandes urgentes
        </Link>

        <div className="bg-[#111111] border border-[#262626] rounded-2xl p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-bangers tracking-wider text-[#f59e0b] bg-[#f59e0b]/5 rounded-full px-2.5 py-0.5">
                  {request.category}
                </span>
                {request.urgency === "today" ? (
                  <span className="text-xs font-bangers tracking-wider text-red-400 bg-red-500/10 rounded-full px-2.5 py-0.5 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Aujourd&apos;hui
                  </span>
                ) : (
                  <span className="text-xs font-bangers tracking-wider text-yellow-400 bg-yellow-500/10 rounded-full px-2.5 py-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Cette semaine
                  </span>
                )}
                {isMatched && (
                  <span className="text-xs font-bangers tracking-wider text-[#00d4aa] bg-[#00d4aa]/10 rounded-full px-2.5 py-0.5 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    HÉROS TROUVÉ
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-anton tracking-wide text-[#f5f5f5] mb-1">
                {request.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-[#a3a3a3] mt-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#5c5c5c]" />
                  <Link
                    href={`/profile/${request.requester.id}`}
                    className="hover:text-[#f59e0b] transition-colors"
                  >
                    {request.requester.name}
                  </Link>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#5c5c5c]" />
                  {request.online
                    ? "En ligne"
                    : [request.city, request.department, request.region]
                        .filter(Boolean)
                        .join(" / ") || "Non spécifié"}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#5c5c5c]" />
                  {new Date(request.createdAt).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-bold text-[#f59e0b]">
                {request.totalTime}
              </div>
              <div className="text-xs text-[#5c5c5c]">TIME</div>
            </div>
          </div>

          <div className="border-t border-[#262626] mb-6" />

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-[#a3a3a3] mb-2 uppercase tracking-wider">
              Description du besoin
            </h2>
            <p className="text-[#f5f5f5] leading-relaxed whitespace-pre-wrap text-sm">
              {request.description}
            </p>
          </div>

          {/* Détails */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#181818] border border-[#262626] rounded-xl p-4">
              <span className="text-[#a3a3a3] text-xs uppercase tracking-wider font-semibold">
                Heures estimées
              </span>
              <p className="text-[#f5f5f5] text-lg font-semibold mt-1">
                {request.hours}h
              </p>
            </div>
            <div className="bg-[#181818] border border-[#262626] rounded-xl p-4">
              <span className="text-[#a3a3a3] text-xs uppercase tracking-wider font-semibold">
                Tarif horaire
              </span>
              <p className="text-[#f5f5f5] text-lg font-semibold mt-1">
                {request.ratePerHour} TIME/h
              </p>
            </div>
            <div className="bg-[#181818] border border-[#262626] rounded-xl p-4">
              <span className="text-[#a3a3a3] text-xs uppercase tracking-wider font-semibold">
                Total
              </span>
              <p className="text-[#f59e0b] text-lg font-semibold mt-1">
                {request.totalTime} TIME
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-[#a3a3a3] text-xs">
                Pour les urgences médicales ou de sécurité, contactez les services d&apos;urgence.
              </p>
            </div>
          </div>

          {/* Error / Success */}
          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-xl p-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-900/20 border border-green-800 rounded-xl p-3 mb-4">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          {/* Proposer son aide (si autre user connecté) */}
          {session && !isRequester && isOpen && !hasOffered && (
            <div className="border-t border-[#262626] pt-6 mb-6">
              <h2 className="text-sm font-semibold text-[#a3a3a3] mb-3 uppercase tracking-wider">
                Proposer mon aide
              </h2>
              <div className="space-y-3">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Dis au demandeur quand tu es disponible…"
                  className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl px-4 py-2.5 text-[#f5f5f5] placeholder:text-[#5c5c5c] focus:outline-none focus:border-[#f59e0b] transition-colors text-sm resize-none"
                />
                <p className="text-[10px] text-[#5c5c5c] text-right">{message.length}/500</p>
                <button
                  onClick={handleProposeHelp}
                  disabled={submitting}
                  className="w-full bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-xl py-2.5 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Envoi…</>
                  ) : (
                    <><MessageSquare className="w-4 h-4" /> Proposer mon aide</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Déjà proposé */}
          {session && !isRequester && hasOffered && (
            <div className="bg-[#f59e0b]/5 border border-[#f59e0b]/20 rounded-xl p-4 mb-6 text-center">
              <p className="text-[#f59e0b] text-sm font-semibold">
                ✅ Vous avez déjà proposé votre aide
              </p>
              <p className="text-[#a3a3a3] text-xs mt-1">
                En attente de la réponse du demandeur.
              </p>
            </div>
          )}

          {/* Non connecté */}
          {!session && (
            <div className="text-center border-t border-[#262626] pt-6 mb-6">
              <Link
                href="/auth/signin"
                className="inline-flex items-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold rounded-xl px-6 py-2.5 transition-colors text-sm"
              >
                Connectez-vous pour proposer votre aide
              </Link>
            </div>
          )}

          {/* Offres reçues (requester only) */}
          {isRequester && (
            <div className="border-t border-[#262626] pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-[#a3a3a3]" />
                <h2 className="text-sm font-semibold text-[#a3a3a3] uppercase tracking-wider">
                  Offres reçues ({request.offers.length})
                </h2>
              </div>

              {request.offers.length === 0 && (
                <p className="text-[#5c5c5c] text-sm text-center py-4">
                  Aucune offre pour le moment. Les héros arrivent bientôt !
                </p>
              )}

              <div className="space-y-3">
                {request.offers.map((offer) => (
                  <div
                    key={offer.id}
                    className={`bg-[#181818] border rounded-xl p-4 ${
                      offer.status === "accepted"
                        ? "border-[#00d4aa]"
                        : offer.status === "declined"
                          ? "border-[#5c5c5c] opacity-60"
                          : "border-[#262626]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-[#5c5c5c]" />
                          <Link
                            href={`/profile/${offer.provider.id}`}
                            className="text-[#f5f5f5] font-semibold hover:text-[#00d4aa] transition-colors text-sm"
                          >
                            {offer.provider.name}
                          </Link>
                          <span className={`text-xs font-bangers tracking-wider ${
                            offer.status === "accepted"
                              ? "text-[#00d4aa]"
                              : offer.status === "declined"
                                ? "text-[#5c5c5c]"
                                : "text-[#f59e0b]"
                          }`}>
                            {offer.status === "accepted" ? "✓ Accepté" : offer.status === "declined" ? "✗ Décliné" : "En attente"}
                          </span>
                        </div>
                        {offer.message && (
                          <p className="text-[#a3a3a3] text-sm mt-1">{offer.message}</p>
                        )}
                        <p className="text-[10px] text-[#5c5c5c] mt-1">
                          {new Date(offer.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {isOpen && offer.status === "pending" && (
                        <button
                          onClick={() => handleAcceptOffer(offer.id)}
                          disabled={accepting === offer.id}
                          className="shrink-0 bg-[#00d4aa] hover:bg-[#00b894] disabled:opacity-50 text-black font-semibold rounded-xl px-4 py-2 text-xs transition-colors flex items-center gap-1"
                        >
                          {accepting === offer.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3 h-3" />
                          )}
                          Accepter
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Liens vers dashboard */}
          {isMatched && (
            <div className="border-t border-[#262626] pt-6 mt-6 text-center">
              <p className="text-[#a3a3a3] text-sm mb-3">
                {isRequester
                  ? "Un héros a été sélectionné. Rendez-vous dans le tableau de bord pour suivre la mission."
                  : "Cette demande a été attribuée."}
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-[#00d4aa] hover:text-[#00b894] transition-colors text-sm font-semibold"
              >
                Voir le tableau de bord →
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
