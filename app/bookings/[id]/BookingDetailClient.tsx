"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, User, Shield, Calendar, CheckCircle, XCircle, Hourglass, AlertTriangle } from "lucide-react";
import { completeBooking, cancelBooking } from "@/app/services/actions";
import { createRatingAction } from "@/app/ratings/actions";
import RatingStars from "@/components/RatingStars";
import { useState } from "react";

interface BookingDetailData {
  id: string;
  serviceId: string;
  clientId: string;
  hours: number;
  totalTime: number;
  status: string;
  createdAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  service: {
    id: string;
    title: string;
    description: string;
    ratePerHour: number;
    provider: {
      id: string;
      name: string;
    };
  };
  client: {
    id: string;
    name: string;
  };
  transactions: {
    id: string;
    type: string;
    amount: number;
    status: string;
    createdAt: string;
  }[];
  rating: {
    id: string;
    score: number;
    comment: string | null;
    fromId: string;
    toId: string;
    createdAt: string;
  } | null;
  providerReputation: number;
}

const statusConfig: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  pending: {
    label: "EN ATTENTE",
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    icon: <Hourglass className="w-3.5 h-3.5" />,
  },
  completed: {
    label: "TERMINÉ",
    bg: "bg-green-500/10",
    text: "text-green-400",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  cancelled: {
    label: "ANNULÉ",
    bg: "bg-[#5c5c5c]/10",
    text: "text-[#a3a3a3]",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

const txTypeLabels: Record<string, string> = {
  mint: "Mint initial",
  escrow: "Mise sous séquestre",
  release: "Libération au provider",
  refund: "Remboursement au client",
  transfer: "Transfert",
};

export default function BookingDetailClient({
  booking,
  userId,
  isClient,
}: {
  booking: BookingDetailData;
  userId: string;
  isClient: boolean;
}) {
  const router = useRouter();
  const status = statusConfig[booking.status] || statusConfig.pending;
  const isPending = booking.status === "pending";
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [ratingSuccess, setRatingSuccess] = useState(false);

  async function handleComplete() {
    if (!confirm("Marquer cette réservation comme terminée ? Le montant sera libéré au provider.")) return;
    const result = await completeBooking(booking.id);
    if ("error" in result) {
      alert(result.error);
      return;
    }
    router.refresh();
  }

  async function handleCancel() {
    if (!confirm("Annuler cette réservation ? Le montant sera remboursé sur votre wallet.")) return;
    const result = await cancelBooking(booking.id);
    if ("error" in result) {
      alert(result.error);
      return;
    }
    router.refresh();
  }

  async function handleRatingSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (ratingScore < 1) {
      setRatingError("Veuillez sélectionner une note.");
      return;
    }
    setRatingSubmitting(true);
    setRatingError(null);

    const form = new FormData();
    form.set("bookingId", booking.id);
    form.set("score", String(ratingScore));
    if (ratingComment.trim()) form.set("comment", ratingComment.trim());

    const result = await createRatingAction(form);
    if (result?.error) {
      setRatingError(result.error);
      setRatingSubmitting(false);
    } else {
      setRatingSuccess(true);
      setRatingSubmitting(false);
    }
  }

  const isCompleted = booking.status === "completed";
  const existingRating = booking.rating;
  const showRatingForm = isCompleted && isClient && !existingRating && !ratingSuccess;
  const showRatingDisplay = existingRating || ratingSuccess;
  const isProvider = !isClient;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#262626]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-[#00d4aa]" />
            <span className="font-anton text-lg tracking-wide text-[#f5f5f5]">
              TimeBank
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau de bord
        </Link>

        <div className="bg-[#111111] border border-[#262626] rounded-2xl p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bangers tracking-wider rounded-full px-2.5 py-0.5 ${status.bg} ${status.text}`}
                >
                  {status.icon}
                  {status.label}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-anton tracking-wide text-[#f5f5f5] mb-1">
                {booking.service.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-[#a3a3a3] mt-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#5c5c5c]" />
                  Client :{" "}
                  <Link
                    href={`/profile/${booking.clientId}`}
                    className="hover:text-[#00d4aa] transition-colors"
                  >
                    {booking.client.name}
                  </Link>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#5c5c5c]" />
                  Héros :{" "}
                  <Link
                    href={`/profile/${booking.service.provider.id}`}
                    className="hover:text-[#00d4aa] transition-colors"
                  >
                    {booking.service.provider.name}
                  </Link>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#5c5c5c]" />
                  {new Date(booking.createdAt).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-bold text-[#00d4aa]">
                {booking.totalTime}
              </div>
              <div className="text-xs text-[#5c5c5c]">TIME</div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#262626] mb-6" />

          {/* Description courte */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-[#a3a3a3] mb-2 uppercase tracking-wider">
              Description du service
            </h2>
            <p className="text-[#f5f5f5] leading-relaxed whitespace-pre-wrap text-sm">
              {booking.service.description}
            </p>
          </div>

          {/* Détails */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-[#181818] border border-[#262626] rounded-xl p-4">
              <span className="text-[#a3a3a3] text-xs uppercase tracking-wider font-semibold">
                Heures réservées
              </span>
              <p className="text-[#f5f5f5] text-lg font-semibold mt-1">
                {booking.hours}h
              </p>
            </div>
            <div className="bg-[#181818] border border-[#262626] rounded-xl p-4">
              <span className="text-[#a3a3a3] text-xs uppercase tracking-wider font-semibold">
                Tarif horaire
              </span>
              <p className="text-[#f5f5f5] text-lg font-semibold mt-1">
                {booking.service.ratePerHour} TIME/h
              </p>
            </div>
            <div className="bg-[#181818] border border-[#262626] rounded-xl p-4">
              <span className="text-[#a3a3a3] text-xs uppercase tracking-wider font-semibold">
                Total
              </span>
              <p className="text-[#00d4aa] text-lg font-semibold mt-1">
                {booking.totalTime} TIME
              </p>
            </div>
            <div className="bg-[#181818] border border-[#262626] rounded-xl p-4">
              <span className="text-[#a3a3a3] text-xs uppercase tracking-wider font-semibold">
                Date de réservation
              </span>
              <p className="text-[#f5f5f5] text-sm font-semibold mt-1">
                {new Date(booking.createdAt).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Dates de complétion / annulation */}
          {(booking.completedAt || booking.cancelledAt) && (
            <div className="bg-[#181818] border border-[#262626] rounded-xl p-4 mb-6">
              {booking.completedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  <span className="text-[#a3a3a3]">Complété le</span>
                  <span className="text-[#f5f5f5] font-medium">
                    {new Date(booking.completedAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
              {booking.cancelledAt && (
                <div className="flex items-center gap-2 text-sm">
                  <XCircle className="w-4 h-4 text-[#a3a3a3] shrink-0" />
                  <span className="text-[#a3a3a3]">Annulé le</span>
                  <span className="text-[#f5f5f5] font-medium">
                    {new Date(booking.cancelledAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
              {booking.cancellationReason && (
                <div className="flex items-start gap-2 text-sm mt-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                  <span className="text-[#a3a3a3]">Raison :</span>
                  <span className="text-[#f5f5f5]">{booking.cancellationReason}</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {isPending && isClient && (
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                onClick={handleComplete}
                className="flex-1 bg-[#00d4aa] hover:bg-[#00b894] text-black font-semibold rounded-xl py-3 text-center transition-colors text-sm"
              >
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Marquer comme terminé
                </span>
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold rounded-xl py-3 text-center transition-colors text-sm border border-red-500/20"
              >
                <span className="flex items-center justify-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Annuler la réservation
                </span>
              </button>
            </div>
          )}

          {isPending && !isClient && (
            <div className="bg-[#181818] border border-[#262626] rounded-xl p-4 mb-6 text-center">
              <p className="text-[#a3a3a3] text-sm">
                Réservation en attente — le client peut la marquer comme terminée ou l&apos;annuler
              </p>
            </div>
          )}

          {/* Transactions */}
          {booking.transactions.length > 0 && (
            <div className="border-t border-[#262626] pt-6">
              <h2 className="text-sm font-semibold text-[#a3a3a3] mb-3 uppercase tracking-wider">
                Transactions liées
              </h2>
              <div className="divide-y divide-[#262626]">
                {booking.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="py-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm text-[#f5f5f5] font-medium">
                        {txTypeLabels[tx.type] || tx.type}
                      </div>
                      <div className="text-xs text-[#5c5c5c]">
                        {new Date(tx.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-sm font-semibold ${
                          tx.type === "escrow"
                            ? "text-yellow-400"
                            : tx.type === "release"
                              ? "text-[#00d4aa]"
                              : tx.type === "refund"
                                ? "text-blue-400"
                                : "text-[#f5f5f5]"
                        }`}
                      >
                        {tx.type === "escrow" ? "-" : "+"}
                        {tx.amount} TIME
                      </div>
                      <div
                        className={`text-xs ${
                          tx.status === "completed"
                            ? "text-green-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {tx.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rating Section */}
          {isCompleted && (
            <div className="border-t border-[#262626] pt-6 mt-6">
              <h2 className="text-sm font-semibold text-[#a3a3a3] mb-3 uppercase tracking-wider flex items-center gap-1.5">
                Avis
              </h2>

              {/* Provider reputation */}
              <div className="bg-[#181818] border border-[#262626] rounded-xl p-4 mb-4">
                <p className="text-xs text-[#a3a3a3]">
                  Réputation de {booking.service.provider.name} :{" "}
                  <span className="text-[#f5f5f5] font-semibold">
                    {booking.providerReputation > 0
                      ? `${booking.providerReputation} / 5`
                      : "Nouveau héros"}
                  </span>
                </p>
              </div>

              {/* Pending / Cancelled — no rating */}
              {booking.status === "pending" && (
                <p className="text-[#5c5c5c] text-sm">
                  La mission doit être terminée avant de pouvoir laisser un avis.
                </p>
              )}
              {booking.status === "cancelled" && (
                <p className="text-[#5c5c5c] text-sm">
                  Une mission annulée ne peut pas être notée.
                </p>
              )}

              {/* Client — rating form */}
              {showRatingForm && (
                <form onSubmit={handleRatingSubmit} className="space-y-4">
                  <p className="text-[#a3a3a3] text-sm">
                    Votre retour aide la communauté à identifier les héros de confiance.
                  </p>
                  <div>
                    <label className="block text-xs text-[#a3a3a3] mb-2">Votre note</label>
                    <RatingStars value={ratingScore} onChange={setRatingScore} />
                  </div>
                  <div>
                    <label className="block text-xs text-[#a3a3a3] mb-2">
                      Commentaire (optionnel)
                    </label>
                    <textarea
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      maxLength={500}
                      rows={3}
                      placeholder="Partagez votre expérience…"
                      className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl px-4 py-2.5 text-[#f5f5f5] placeholder:text-[#5c5c5c] focus:outline-none focus:border-[#00d4aa] transition-colors text-sm resize-none"
                    />
                    <p className="text-[10px] text-[#5c5c5c] mt-1 text-right">
                      {ratingComment.length}/500
                    </p>
                  </div>
                  {ratingError && (
                    <p className="text-red-400 text-xs">{ratingError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={ratingSubmitting}
                    className="bg-[#00d4aa] hover:bg-[#00b894] disabled:opacity-50 text-black font-semibold rounded-xl py-2.5 px-6 text-sm transition-colors"
                  >
                    {ratingSubmitting ? "Publication…" : "Publier mon avis"}
                  </button>
                </form>
              )}

              {/* Rating display for client (already rated) */}
              {isClient && showRatingDisplay && (
                <div className="bg-[#00d4aa]/5 border border-[#00d4aa]/20 rounded-xl p-4">
                  <p className="text-[#00d4aa] text-xs font-semibold mb-2">
                    Avis déjà publié
                  </p>
                  <RatingStars value={(existingRating?.score ?? 5)} readOnly />
                  {existingRating?.comment && (
                    <p className="text-[#f5f5f5] text-sm mt-2">
                      {existingRating.comment}
                    </p>
                  )}
                  <p className="text-[#5c5c5c] text-xs mt-1">
                    {existingRating?.createdAt
                      ? new Date(existingRating.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "À l'instant"}
                  </p>
                </div>
              )}

              {/* Provider — show rating received */}
              {!isClient && existingRating && (
                <div className="bg-[#00d4aa]/5 border border-[#00d4aa]/20 rounded-xl p-4">
                  <p className="text-[#00d4aa] text-xs font-semibold mb-2">Avis reçu</p>
                  <RatingStars value={existingRating.score} readOnly />
                  {existingRating.comment && (
                    <p className="text-[#f5f5f5] text-sm mt-2">{existingRating.comment}</p>
                  )}
                  <p className="text-[#5c5c5c] text-xs mt-1">
                    {new Date(existingRating.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}

              {!isClient && !existingRating && (
                <p className="text-[#5c5c5c] text-sm">
                  Le client n&apos;a pas encore laissé d&apos;avis.
                </p>
              )}
            </div>
          )}

          {/* Lien vers le service */}
          <div className="mt-6 pt-4 border-t border-[#262626]">
            <Link
              href={`/services/${booking.service.id}`}
              className="text-[#00d4aa] hover:text-[#00b894] text-sm transition-colors underline underline-offset-2"
            >
              Voir le service
            </Link>
          </div>
        </div>

        {/* Comics footer */}
        <div className="text-center pt-8">
          <span className="font-bangers text-[#00d4aa] text-xs tracking-wider opacity-40">
            ~ chaque minute compte ~
          </span>
        </div>
      </main>
    </div>
  );
}
