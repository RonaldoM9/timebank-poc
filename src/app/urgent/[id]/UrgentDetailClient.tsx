"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowLeft, Zap, MapPin, Calendar, Clock, Users,
  User, Loader2, AlertCircle, CheckCircle, MessageSquare,
  XCircle, Star,
} from "lucide-react";
import { acceptOffer, proposeHelp } from "@/app/urgent/actions";
import {
  generateRecommendationsAction,
  getRecommendationsAction,
  approveRecommendationAction,
  rejectRecommendationAction,
} from "@/app/facilitator/matching/actions";
import ConnectedHeader from "@/components/ConnectedHeader";

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
  userRole,
}: {
  request: UrgentDetail;
  isRequester: boolean;
  hasOffered: boolean;
  userRole: string | null;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Recommendations state
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [recsGenerating, setRecsGenerating] = useState(false);
  const [recsError, setRecsError] = useState<string | null>(null);
  const [approvingRec, setApprovingRec] = useState<string | null>(null);
  const [rejectingRec, setRejectingRec] = useState<string | null>(null);

  const isFacilitator =
    userRole === "FACILITATOR" || userRole === "ADMIN" ||
    (session?.user as any)?.role === "FACILITATOR" ||
    (session?.user as any)?.role === "ADMIN";

  // Load existing recommendations on mount for facilitators
  useEffect(() => {
    if (isFacilitator) {
      loadRecommendations();
    }
  }, [isFacilitator]);

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

  // ─── Recommendations helpers ───────────────────────────────────────────

  async function loadRecommendations() {
    setRecsLoading(true);
    setRecsError(null);
    const result = await getRecommendationsAction("URGENT_REQUEST", request.id);
    if (!result.success) {
      setRecsError(result.error);
      setRecommendations([]);
    } else {
      setRecommendations(result.data ?? []);
    }
    setRecsLoading(false);
  }

  async function handleGenerateRecommendations() {
    setRecsGenerating(true);
    setRecsError(null);

    // Si des recommandations existent déjà, on recharge simplement
    if (recommendations.length > 0) {
      await loadRecommendations();
      setSuccess("Recommandations rechargées !");
      setRecsGenerating(false);
      return;
    }

    const result = await generateRecommendationsAction("URGENT_REQUEST", request.id);
    if (!result.success) {
      setRecsError(result.error);
    } else {
      const newRecs = result.data?.recommendations ?? [];
      if (newRecs.length === 0) {
        // Tous les candidats déjà proposés — on charge les existantes
        await loadRecommendations();
        if (recommendations.length > 0) {
          setSuccess("Recommandations déjà existantes — les voici.");
        } else {
          setRecsError("Aucun nouveau candidat trouvé. Tous les héros disponibles ont déjà été proposés ou sont exclus.");
        }
      } else {
        setRecommendations(newRecs);
        setSuccess("Recommandations générées avec succès !");
      }
    }
    setRecsGenerating(false);
  }

  async function handleApproveRecommendation(recId: string) {
    setApprovingRec(recId);
    setRecsError(null);
    const result = await approveRecommendationAction(recId);
    if (!result.success) {
      setRecsError(result.error);
    } else {
      await loadRecommendations();
      setSuccess("Recommandation approuvée !");
    }
    setApprovingRec(null);
  }

  async function handleRejectRecommendation(recId: string) {
    setRejectingRec(recId);
    setRecsError(null);
    const result = await rejectRecommendationAction(recId);
    if (!result.success) {
      setRecsError(result.error);
    } else {
      await loadRecommendations();
      setSuccess("Recommandation rejetée.");
    }
    setRejectingRec(null);
  }

  const isOpen = request.status === "open";
  const isMatched = request.status === "matched";

  return (
    <div className="min-h-screen bg-gray-50">
      <ConnectedHeader />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/urgent"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux demandes urgentes
        </Link>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
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
                  <span className="text-xs font-bangers tracking-wider text-tb-accent bg-tb-accent/10 rounded-full px-2.5 py-0.5 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    HÉROS TROUVÉ
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-anton tracking-wide text-gray-900 mb-1">
                {request.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <Link
                    href={`/profile/${request.requester.id}`}
                    className="hover:text-[#f59e0b] transition-colors"
                  >
                    {request.requester.name}
                  </Link>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {request.online
                    ? "En ligne"
                    : [request.city, request.department, request.region]
                        .filter(Boolean)
                        .join(" / ") || "Non spécifié"}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
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
              <div className="text-xs text-gray-400">TIME</div>
            </div>
          </div>

          <div className="border-t border-gray-200 mb-6" />

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Description du besoin
            </h2>
            <p className="text-gray-900 leading-relaxed whitespace-pre-wrap text-sm">
              {request.description}
            </p>
          </div>

          {/* Détails */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">
                Heures estimées
              </span>
              <p className="text-gray-900 text-lg font-semibold mt-1">
                {request.hours}h
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">
                Tarif horaire
              </span>
              <p className="text-gray-900 text-lg font-semibold mt-1">
                {request.ratePerHour} TIME/h
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">
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
              <p className="text-gray-500 text-xs">
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
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                Proposer mon aide
              </h2>
              <div className="space-y-3">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Dis au demandeur quand tu es disponible…"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#f59e0b] transition-colors text-sm resize-none"
                />
                <p className="text-[10px] text-gray-400 text-right">{message.length}/500</p>
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
              <p className="text-gray-500 text-xs mt-1">
                En attente de la réponse du demandeur.
              </p>
            </div>
          )}

          {/* Non connecté */}
          {!session && (
            <div className="text-center border-t border-gray-200 pt-6 mb-6">
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
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Offres reçues ({request.offers.length})
                </h2>
              </div>

              {request.offers.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">
                  Aucune offre pour le moment. Les héros arrivent bientôt !
                </p>
              )}

              <div className="space-y-3">
                {request.offers.map((offer) => (
                  <div
                    key={offer.id}
                    className={`bg-gray-50 border rounded-xl p-4 ${
                      offer.status === "accepted"
                        ? "border-tb-accent"
                        : offer.status === "declined"
                          ? "border-gray-300 opacity-60"
                          : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-gray-400" />
                          <Link
                            href={`/profile/${offer.provider.id}`}
                            className="text-gray-900 font-semibold hover:text-tb-accent transition-colors text-sm"
                          >
                            {offer.provider.name}
                          </Link>
                          <span className={`text-xs font-bangers tracking-wider ${
                            offer.status === "accepted"
                              ? "text-tb-accent"
                              : offer.status === "declined"
                                ? "text-gray-400"
                                : "text-[#f59e0b]"
                          }`}>
                            {offer.status === "accepted" ? "✓ Accepté" : offer.status === "declined" ? "✗ Décliné" : "En attente"}
                          </span>
                        </div>
                        {offer.message && (
                          <p className="text-gray-500 text-sm mt-1">{offer.message}</p>
                        )}
                        <p className="text-[10px] text-gray-400 mt-1">
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
                          className="shrink-0 bg-tb-accent hover:bg-tb-accent-hover disabled:opacity-50 text-black font-semibold rounded-xl px-4 py-2 text-xs transition-colors flex items-center gap-1"
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
            <div className="border-t border-gray-200 pt-6 mt-6 text-center">
              <p className="text-gray-500 text-sm mb-3">
                {isRequester
                  ? "Un héros a été sélectionné. Rendez-vous dans le tableau de bord pour suivre la mission."
                  : "Cette demande a été attribuée."}
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-tb-accent hover:text-tb-accent-hover transition-colors text-sm font-semibold"
              >
                Voir le tableau de bord →
              </Link>
            </div>
          )}

          {/* ─── Recommandations de Heroes (FACILITATOR / ADMIN only) ─── */}
          {isFacilitator && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#f59e0b]" />
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Recommandations de Heroes
                  </h2>
                </div>
                <button
                  onClick={handleGenerateRecommendations}
                  disabled={recsGenerating}
                  className="text-xs bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-xl px-3 py-1.5 transition-colors flex items-center gap-1.5"
                >
                  {recsGenerating ? (
                    <><Loader2 className="w-3 h-3 animate-spin" /> Génération…</>
                  ) : (
                    <><Zap className="w-3 h-3" /> Générer des recommandations</>
                  )}
                </button>
              </div>

              {recsError && (
                <div className="bg-red-900/20 border border-red-800 rounded-xl p-3 mb-4">
                  <p className="text-red-400 text-sm">{recsError}</p>
                </div>
              )}

              {!recsLoading && recommendations.length === 0 && !recsError && (
                <p className="text-gray-400 text-sm text-center py-4">
                  Aucune recommandation pour le moment. Cliquez sur "Générer des recommandations" pour trouver les meilleurs héros.
                </p>
              )}

              {recsLoading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-tb-accent" />
                </div>
              )}

              {recommendations.length > 0 && (
                <div className="space-y-3">
                  {recommendations.map((rec) => {
                    const reasons = rec.reasonsJson ? JSON.parse(rec.reasonsJson) : [];
                    const risks = rec.risksJson ? JSON.parse(rec.risksJson) : [];
                    const statusColors: Record<string, string> = {
                      PENDING_REVIEW: "text-[#f59e0b]",
                      APPROVED: "text-tb-accent",
                      REJECTED: "text-red-400",
                      CONTACTED: "text-blue-400",
                      ASSIGNED_MANUALLY: "text-purple-400",
                      DISMISSED: "text-gray-400",
                    };
                    const statusLabels: Record<string, string> = {
                      PENDING_REVIEW: "En attente",
                      APPROVED: "Approuvé",
                      REJECTED: "Rejeté",
                      CONTACTED: "Contacté",
                      ASSIGNED_MANUALLY: "Assigné",
                      DISMISSED: "Ignoré",
                    };
                    const isPending = rec.status === "PENDING_REVIEW";

                    return (
                      <div
                        key={rec.id}
                        className={`border rounded-xl p-4 ${
                          rec.status === "APPROVED"
                            ? "border-tb-accent bg-tb-accent/5"
                            : rec.status === "REJECTED"
                              ? "border-red-800/30 bg-red-900/10 opacity-70"
                              : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-900 font-semibold text-sm">
                                {rec.candidate?.name ?? "Utilisateur inconnu"}
                              </span>
                              {rec.candidate?.reputation != null && (
                                <span className="text-xs text-gray-400">
                                  ★ {rec.candidate.reputation.toFixed(1)}
                                </span>
                              )}
                              <span className={`text-xs font-bangers tracking-wider ${statusColors[rec.status] ?? "text-gray-400"}`}>
                                {statusLabels[rec.status] ?? rec.status}
                              </span>
                            </div>
                            {rec.candidate?.city && (
                              <p className="text-[10px] text-gray-400">{rec.candidate.city}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-lg font-bold text-tb-accent">
                              {Math.round(rec.score)}
                            </div>
                            <div className="text-[10px] text-gray-400">/100</div>
                          </div>
                        </div>

                        {/* Score breakdown bar */}
                        <div className="flex gap-1 mb-2">
                          {[
                            { label: "Comp.", value: rec.skillScore, color: "bg-blue-500" },
                            { label: "Loc.", value: rec.locationScore, color: "bg-green-500" },
                            { label: "Dispo.", value: rec.availabilityScore, color: "bg-yellow-500" },
                            { label: "Conf.", value: rec.trustScore, color: "bg-purple-500" },
                            { label: "Récip.", value: rec.reciprocityScore, color: "bg-pink-500" },
                            { label: "Comm.", value: rec.communityHealthScore, color: "bg-indigo-500" },
                          ].map((s) => (
                            <div key={s.label} className="flex-1" title={`${s.label}: ${Math.round(s.value)}`}>
                              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${s.color} rounded-full transition-all`}
                                  style={{ width: `${Math.min(100, s.value)}%` }}
                                />
                              </div>
                              <p className="text-[9px] text-gray-400 text-center mt-0.5">{s.label}</p>
                            </div>
                          ))}
                        </div>

                        {/* Reasons */}
                        {reasons.length > 0 && (
                          <div className="mb-1.5">
                            <p className="text-[10px] text-gray-400 mb-0.5">Pourquoi ce match :</p>
                            <ul className="space-y-0.5">
                              {reasons.map((r: string, i: number) => (
                                <li key={i} className="text-xs text-green-600 flex items-start gap-1">
                                  <span className="mt-0.5">✓</span>
                                  <span>{r}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Risks */}
                        {risks.length > 0 && (
                          <div className="mb-2">
                            <p className="text-[10px] text-gray-400 mb-0.5">Risques :</p>
                            <ul className="space-y-0.5">
                              {risks.map((r: string, i: number) => (
                                <li key={i} className="text-xs text-amber-600 flex items-start gap-1">
                                  <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                                  <span>{r}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Score breakdown detail */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-400 mb-2">
                          <span>Comp.: {Math.round(rec.skillScore)}</span>
                          <span>Loc.: {Math.round(rec.locationScore)}</span>
                          <span>Dispo.: {Math.round(rec.availabilityScore)}</span>
                          <span>Conf.: {Math.round(rec.trustScore)}</span>
                          <span>Récip.: {Math.round(rec.reciprocityScore)}</span>
                          <span>Comm.: {Math.round(rec.communityHealthScore)}</span>
                        </div>

                        {/* Approve / Reject buttons */}
                        {isPending && (
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                            <button
                              onClick={() => handleApproveRecommendation(rec.id)}
                              disabled={approvingRec === rec.id}
                              className="flex-1 bg-tb-accent hover:bg-tb-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-xl py-1.5 text-xs transition-colors flex items-center justify-center gap-1"
                            >
                              {approvingRec === rec.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle className="w-3 h-3" />
                              )}
                              Approuver
                            </button>
                            <button
                              onClick={() => handleRejectRecommendation(rec.id)}
                              disabled={rejectingRec === rec.id}
                              className="flex-1 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-red-400 font-semibold rounded-xl py-1.5 text-xs transition-colors flex items-center justify-center gap-1 border border-red-800/30"
                            >
                              {rejectingRec === rec.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              Rejeter
                            </button>
                          </div>
                        )}

                        {/* Decision info */}
                        {!isPending && rec.decisionNote && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-[10px] text-gray-400 italic">
                              Note : {rec.decisionNote}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
