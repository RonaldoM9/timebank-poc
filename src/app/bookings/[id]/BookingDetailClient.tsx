"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, User, Shield, Calendar, CheckCircle, XCircle, Hourglass, AlertTriangle, QrCode, RefreshCw, Smartphone, Copy, HeartHandshake } from "lucide-react";
import { completeBooking, cancelBooking } from "@/app/services/actions";
import { fundBookingFromCommunityPot } from "@/app/wallet/community-pot-actions";
import { generateQRToken } from "@/app/services/qr-actions";
import { generateNFCToken } from "@/app/services/nfc-actions";
import { createRatingAction } from "@/app/ratings/actions";
import RatingStars from "@/components/RatingStars";
import BookingDiscussion from "@/components/BookingDiscussion";
import ConnectedHeader from "@/components/ConnectedHeader";
import SuccessAlert from "@/components/SuccessAlert";
import SolidarityBadge from "@/components/SolidarityBadge";
import { useState, useEffect } from "react";
import QRCode from "react-qr-code";

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
    isSolidarityMission?: boolean;
    solidarityStatus?: string;
    solidarityCategory?: string | null;
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
  proofOfCompletion: {
    id: string;
    method: string;
    validatorName: string;
    providerName: string;
    status: string;
    createdAt: string;
  } | null;
  fundedByCommunityPot: boolean;
  communityPotAmount: number;
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
    bg: "bg-tb-surface-elevated",
    text: "text-tb-text-secondary",
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
  isProvider,
  userRole,
}: {
  booking: BookingDetailData;
  userId: string;
  isClient: boolean;
  isProvider: boolean;
  userRole?: string;
}) {
  const router = useRouter();
  const status = statusConfig[booking.status] || statusConfig.pending;
  const isPending = booking.status === "pending";
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [ratingSuccess, setRatingSuccess] = useState(false);

  // QR state
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [qrExpiresAt, setQrExpiresAt] = useState<string | null>(null);
  const [qrGenerating, setQrGenerating] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [qrSuccessMsg, setQrSuccessMsg] = useState<string | null>(null);

  // NFC state
  const [nfcToken, setNfcToken] = useState<string | null>(null);
  const [nfcUrl, setNfcUrl] = useState<string | null>(null);
  const [nfcExpiresAt, setNfcExpiresAt] = useState<string | null>(null);
  const [nfcGenerating, setNfcGenerating] = useState(false);
  const [nfcError, setNfcError] = useState<string | null>(null);
  const [nfcSuccessMsg, setNfcSuccessMsg] = useState<string | null>(null);
  const [nfcCopied, setNfcCopied] = useState(false);

  // Community Pot funding state (staff only)
  const [fundAmount, setFundAmount] = useState(booking.totalTime);
  const [fundReason, setFundReason] = useState("");
  const [fundSubmitting, setFundSubmitting] = useState(false);
  const [fundError, setFundError] = useState<string | null>(null);
  const [fundSuccess, setFundSuccess] = useState(false);
  const [fundModalOpen, setFundModalOpen] = useState(false);

  // For countdown display
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!qrExpiresAt) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const exp = new Date(qrExpiresAt).getTime();
      const diff = exp - now;
      if (diff <= 0) {
        setTimeLeft("Expiré");
        clearInterval(interval);
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}:${secs.toString().padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [qrExpiresAt]);

  // NFC countdown
  const [nfcTimeLeft, setNfcTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!nfcExpiresAt) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const exp = new Date(nfcExpiresAt).getTime();
      const diff = exp - now;
      if (diff <= 0) {
        setNfcTimeLeft("Expiré");
        clearInterval(interval);
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setNfcTimeLeft(`${mins}:${secs.toString().padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [nfcExpiresAt]);

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

  async function handleGenerateQR() {
    setQrGenerating(true);
    setQrError(null);
    setQrSuccessMsg(null);

    const result = await generateQRToken(booking.id);
    if ("error" in result) {
      setQrError(result.error);
      setQrGenerating(false);
      return;
    }

    setQrToken(result.token);
    setQrExpiresAt(result.expiresAt);
    setQrGenerating(false);
    setQrSuccessMsg("QR code généré. Montrez-le au client pour valider la mission.");
  }

  function getQRUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://204.168.193.43:3096";
    return `${baseUrl}/complete/qr/${qrToken}`;
  }

  async function handleGenerateNFC() {
    setNfcGenerating(true);
    setNfcError(null);
    setNfcSuccessMsg(null);

    const result = await generateNFCToken(booking.id);
    if ("error" in result) {
      setNfcError(result.error);
      setNfcGenerating(false);
      return;
    }

    setNfcToken(result.token);
    setNfcUrl(result.nfcUrl);
    setNfcExpiresAt(result.expiresAt);
    setNfcGenerating(false);
    setNfcSuccessMsg("Lien NFC généré. Écrivez ce lien dans un tag NFC ou partagez-le avec le client.");
  }

  function getNFCUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://204.168.193.43:3096";
    return `${baseUrl}/complete/nfc/${nfcToken}`;
  }

  async function handleCopyNFC() {
    if (!nfcUrl) return;
    try {
      await navigator.clipboard.writeText(nfcUrl);
      setNfcCopied(true);
      setTimeout(() => setNfcCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = nfcUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setNfcCopied(true);
      setTimeout(() => setNfcCopied(false), 2000);
    }
  }

  async function handleFundFromCommunityPot() {
    if (!fundAmount || fundAmount <= 0) {
      setFundError("Le montant doit être supérieur à 0.");
      return;
    }
    setFundSubmitting(true);
    setFundError(null);

    const result = await fundBookingFromCommunityPot(
      booking.id,
      fundAmount,
      fundReason.trim() || undefined
    );

    if ("error" in result) {
      setFundError(result.error);
      setFundSubmitting(false);
    } else {
      setFundSuccess(true);
      setFundSubmitting(false);
      setFundModalOpen(false);
      setTimeout(() => {
        router.refresh();
      }, 1500);
    }
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
  const hasProof = booking.proofOfCompletion;
  const hasReleaseTx = booking.transactions.some((tx) => tx.type === "release");

  return (
    <>
      {/* Header */}
      <ConnectedHeader />

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-tb-text-secondary hover:text-tb-text-primary transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau de bord
        </Link>

        <div className="bg-tb-surface border border-tb-border rounded-2xl p-6 sm:p-8">
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
                <SolidarityBadge status={booking.service.solidarityStatus || "CLASSIC"} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-anton tracking-wide text-tb-text-primary mb-1">
                {booking.service.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-tb-text-secondary mt-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-tb-text-muted" />
                  Client :{" "}
                  <Link
                    href={`/profile/${booking.clientId}`}
                    className="hover:text-tb-accent transition-colors"
                  >
                    {booking.client.name}
                  </Link>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-tb-text-muted" />
                  Héros :{" "}
                  <Link
                    href={`/profile/${booking.service.provider.id}`}
                    className="hover:text-tb-accent transition-colors"
                  >
                    {booking.service.provider.name}
                  </Link>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-tb-text-muted" />
                  {new Date(booking.createdAt).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-bold text-tb-accent">
                {booking.totalTime}
              </div>
              <div className="text-xs text-tb-text-muted">TIME</div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-tb-border mb-6" />

          {/* Description courte */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-tb-text-secondary mb-2 uppercase tracking-wider">
              Description du service
            </h2>
            <p className="text-tb-text-primary leading-relaxed whitespace-pre-wrap text-sm">
              {booking.service.description}
            </p>
          </div>

          {/* Détails */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-tb-surface-elevated border border-tb-border rounded-xl p-4">
              <span className="text-tb-text-secondary text-xs uppercase tracking-wider font-semibold">
                Heures réservées
              </span>
              <p className="text-tb-text-primary text-lg font-semibold mt-1">
                {booking.hours}h
              </p>
            </div>
            <div className="bg-tb-surface-elevated border border-tb-border rounded-xl p-4">
              <span className="text-tb-text-secondary text-xs uppercase tracking-wider font-semibold">
                Valeur horaire
              </span>
              <p className="text-tb-text-primary text-lg font-semibold mt-1">
                1 TIME/h
              </p>
            </div>
            <div className="bg-tb-surface-elevated border border-tb-border rounded-xl p-4">
              <span className="text-tb-text-secondary text-xs uppercase tracking-wider font-semibold">
                Total
              </span>
              <p className="text-tb-accent text-lg font-semibold mt-1">
                {booking.totalTime} TIME
              </p>
            </div>
            <div className="bg-tb-surface-elevated border border-tb-border rounded-xl p-4">
              <span className="text-tb-text-secondary text-xs uppercase tracking-wider font-semibold">
                Date de réservation
              </span>
              <p className="text-tb-text-primary text-sm font-semibold mt-1">
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

          {/* Community Pot indicator */}
          {booking.fundedByCommunityPot && (
            <div className="bg-tb-accent/5 border border-tb-accent/20 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-tb-accent/10 flex items-center justify-center shrink-0">
                <HeartHandshake className="w-5 h-5 text-tb-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-tb-accent">
                  Mission financée par le pot commun
                </p>
                <p className="text-xs text-tb-text-secondary mt-0.5">
                  Cette mission est financée par le pot commun TimeHeroes
                  ({booking.communityPotAmount} TIME).
                </p>
              </div>
            </div>
          )}

          {/* ─── ACTION TOOLBAR ─── */}
          {isPending && !hasProof && (
            <div className="border-t border-tb-border pt-6 mb-6">
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-[10px] font-semibold text-tb-text-muted uppercase tracking-widest">
                  Actions disponibles
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {/* ── Pot Commun (staff only) ── */}
                {(userRole === "ADMIN" || userRole === "FACILITATOR") && !booking.fundedByCommunityPot && (
                  fundSuccess ? (
                    <div className="bg-tb-accent/10 border border-tb-accent/20 rounded-xl px-3 py-2 text-xs text-tb-accent flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Financé ({fundAmount} TIME)
                    </div>
                  ) : fundModalOpen ? (
                    <div className="w-full bg-tb-surface-elevated border border-tb-border rounded-xl p-3 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={1}
                          value={fundAmount}
                          onChange={(e) => setFundAmount(Number(e.target.value))}
                          className="flex-1 bg-tb-surface border border-tb-border rounded-lg px-3 py-1.5 text-xs text-tb-text-primary focus:outline-none focus:border-tb-accent"
                          placeholder="Montant"
                        />
                        <button
                          onClick={handleFundFromCommunityPot}
                          disabled={fundSubmitting}
                          className="bg-tb-accent hover:bg-tb-accent-hover disabled:opacity-50 text-white font-semibold rounded-lg px-3 py-1.5 text-xs transition-colors"
                        >
                          {fundSubmitting ? "..." : "Confirmer"}
                        </button>
                        <button
                          onClick={() => { setFundModalOpen(false); setFundError(null); }}
                          className="text-tb-text-muted hover:text-tb-text-secondary text-xs px-2"
                        >
                          ✕
                        </button>
                      </div>
                      {fundError && <p className="text-red-400 text-[10px]">{fundError}</p>}
                    </div>
                  ) : (
                    <button
                      onClick={() => setFundModalOpen(true)}
                      className="inline-flex items-center gap-1.5 bg-tb-surface-elevated border border-tb-border rounded-xl px-3 py-2 text-xs font-medium text-tb-text-primary hover:bg-tb-accent/10 hover:border-tb-accent/30 hover:text-tb-accent transition-all"
                    >
                      <HeartHandshake className="w-3.5 h-3.5" />
                      Pot commun
                    </button>
                  )
                )}

                {/* ── QR Validation (provider only) ── */}
                {isProvider && !qrToken && (
                  <button
                    onClick={handleGenerateQR}
                    disabled={qrGenerating}
                    className="inline-flex items-center gap-1.5 bg-tb-surface-elevated border border-tb-border rounded-xl px-3 py-2 text-xs font-medium text-tb-text-primary hover:bg-tb-accent/10 hover:border-tb-accent/30 hover:text-tb-accent transition-all disabled:opacity-50"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    {qrGenerating ? "..." : "QR validation"}
                  </button>
                )}

                {/* ── NFC Validation (provider only) ── */}
                {isProvider && !nfcToken && (
                  <button
                    onClick={handleGenerateNFC}
                    disabled={nfcGenerating}
                    className="inline-flex items-center gap-1.5 bg-tb-surface-elevated border border-tb-border rounded-xl px-3 py-2 text-xs font-medium text-tb-text-primary hover:bg-tb-accent/10 hover:border-tb-accent/30 hover:text-tb-accent transition-all disabled:opacity-50"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    {nfcGenerating ? "..." : "NFC"}
                  </button>
                )}

                {/* ── Client: mark completed ── */}
                {isClient && (
                  <button
                    onClick={handleComplete}
                    className="inline-flex items-center gap-1.5 bg-tb-surface-elevated border border-tb-border rounded-xl px-3 py-2 text-xs font-medium text-tb-text-primary hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 transition-all"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Terminer
                  </button>
                )}

                {/* ── Cancel (client or provider) ── */}
                {(isClient || isProvider) && (
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center gap-1.5 bg-tb-surface-elevated border border-tb-border rounded-xl px-3 py-2 text-xs font-medium text-tb-text-primary hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Annuler
                  </button>
                )}
              </div>

              {/* ── QR generated display ── */}
              {isProvider && qrToken && (
                <div className="mt-3 bg-tb-surface-elevated border border-tb-border rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <QrCode className="w-4 h-4 text-tb-accent" />
                    <span className="text-xs font-semibold text-tb-text-primary">QR généré</span>
                    {timeLeft && timeLeft !== "Expiré" ? (
                      <span className="text-[10px] text-yellow-400 font-mono ml-auto">{timeLeft}</span>
                    ) : timeLeft === "Expiré" ? (
                      <span className="text-[10px] text-red-400 ml-auto">Expiré</span>
                    ) : null}
                  </div>
                  {qrSuccessMsg && <p className="text-[10px] text-tb-accent mb-2">{qrSuccessMsg}</p>}
                  <div className="flex items-center gap-3">
                    <div className="bg-white rounded-lg p-1 shrink-0">
                      <QRCode value={getQRUrl()} size={80} />
                    </div>
                    <button
                      onClick={handleGenerateQR}
                      disabled={qrGenerating}
                      className="text-[10px] text-tb-text-muted hover:text-tb-text-primary underline transition-colors"
                    >
                      {qrGenerating ? "..." : "Régénérer"}
                    </button>
                  </div>
                </div>
              )}

              {/* ── NFC generated display ── */}
              {isProvider && nfcToken && (
                <div className="mt-2 bg-tb-surface-elevated border border-tb-border rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Smartphone className="w-4 h-4 text-tb-accent" />
                    <span className="text-xs font-semibold text-tb-text-primary">Lien NFC</span>
                    {nfcTimeLeft && nfcTimeLeft !== "Expiré" ? (
                      <span className="text-[10px] text-yellow-400 font-mono ml-auto">{nfcTimeLeft}</span>
                    ) : nfcTimeLeft === "Expiré" ? (
                      <span className="text-[10px] text-red-400 ml-auto">Expiré</span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-[10px] text-tb-accent font-mono truncate bg-tb-surface rounded px-2 py-1">{getNFCUrl()}</code>
                    <button
                      onClick={handleCopyNFC}
                      className="text-[10px] text-tb-text-muted hover:text-tb-text-primary underline shrink-0 transition-colors"
                    >
                      {nfcCopied ? "Copié" : "Copier"}
                    </button>
                    <button
                      onClick={handleGenerateNFC}
                      disabled={nfcGenerating}
                      className="text-[10px] text-tb-text-muted hover:text-tb-text-primary underline shrink-0 transition-colors"
                    >
                      {nfcGenerating ? "..." : "Régén."}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Empty state when pending but no actions available ── */}
          {isPending && !isClient && !hasProof && !qrToken && !isProvider && (
            <div className="bg-tb-surface-elevated border border-tb-border rounded-xl p-4 mb-6 text-center">
              <p className="text-tb-text-secondary text-sm">
                Réservation en attente — le prestataire pourra générer un QR de validation une fois prêt.
              </p>
            </div>
          )}

          {/* Transactions */}
          {booking.transactions.length > 0 && (
            <div className="border-t border-tb-border pt-6">
              <h2 className="text-sm font-semibold text-tb-text-secondary mb-3 uppercase tracking-wider">
                Transactions liées
              </h2>
              <div className="divide-y divide-tb-border">
                {booking.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="py-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm text-tb-text-primary font-medium">
                        {txTypeLabels[tx.type] || tx.type}
                      </div>
                      <div className="text-xs text-tb-text-muted">
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
                              ? "text-tb-accent"
                              : tx.type === "refund"
                                ? "text-blue-400"
                                : "text-tb-text-primary"
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
            <div className="border-t border-tb-border pt-6 mt-6">
              <h2 className="text-sm font-semibold text-tb-text-secondary mb-3 uppercase tracking-wider flex items-center gap-1.5">
                Avis
              </h2>

              {/* Provider reputation */}
              <div className="bg-tb-surface-elevated border border-tb-border rounded-xl p-4 mb-4">
                <p className="text-xs text-tb-text-secondary">
                  Réputation de {booking.service.provider.name} :{" "}
                  <span className="text-tb-text-primary font-semibold">
                    {booking.providerReputation > 0
                      ? `${booking.providerReputation} / 5`
                      : "Nouveau héros"}
                  </span>
                </p>
              </div>

              {/* Pending / Cancelled — no rating */}
              {booking.status === "pending" && (
                <p className="text-tb-text-muted text-sm">
                  La mission doit être terminée avant de pouvoir laisser un avis.
                </p>
              )}
              {booking.status === "cancelled" && (
                <p className="text-tb-text-muted text-sm">
                  Une mission annulée ne peut pas être notée.
                </p>
              )}

              {/* Client — rating form */}
              {showRatingForm && (
                <form onSubmit={handleRatingSubmit} className="space-y-4">
                  <p className="text-tb-text-secondary text-sm">
                    Votre retour aide la communauté à identifier les héros de confiance.
                  </p>
                  <div>
                    <label className="block text-xs text-tb-text-secondary mb-2">Votre note</label>
                    <RatingStars value={ratingScore} onChange={setRatingScore} />
                  </div>
                  <div>
                    <label className="block text-xs text-tb-text-secondary mb-2">
                      Commentaire (optionnel)
                    </label>
                    <textarea
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      maxLength={500}
                      rows={3}
                      placeholder="Partagez votre expérience…"
                      className="w-full bg-tb-surface border border-tb-border rounded-xl px-4 py-2.5 text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent transition-colors text-sm resize-none"
                    />
                    <p className="text-[10px] text-tb-text-muted mt-1 text-right">
                      {ratingComment.length}/500
                    </p>
                  </div>
                  {ratingError && (
                    <p className="text-red-400 text-xs">{ratingError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={ratingSubmitting}
                    className="bg-tb-accent hover:bg-tb-accent-hover disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 px-6 text-sm transition-colors"
                  >
                    {ratingSubmitting ? "Publication…" : "Publier mon avis"}
                  </button>
                </form>
              )}

              {/* Rating display for client (already rated) */}
              {isClient && showRatingDisplay && (
                <div className="bg-tb-accent/5 border border-tb-accent/20 rounded-xl p-4">
                  <p className="text-tb-accent text-xs font-semibold mb-2">
                    Avis déjà publié
                  </p>
                  <RatingStars value={(existingRating?.score ?? 5)} readOnly />
                  {existingRating?.comment && (
                    <p className="text-tb-text-primary text-sm mt-2">
                      {existingRating.comment}
                    </p>
                  )}
                </div>
              )}

              {/* Provider — cannot rate own booking */}
              {isProvider && (
                <p className="text-tb-text-muted text-sm">
                  Vous ne pouvez pas laisser un avis sur votre propre mission.
                </p>
              )}
            </div>
          )}
        </div>

          {/* ─── Lot 14 — Discussion sécurisée par booking ─── */}
          <BookingDiscussion bookingId={booking.id} userId={userId} />
      </main>

      <SuccessAlert
        message="Mission validée. Le TIME peut être libéré."
        visible={Boolean(hasProof) && !hasReleaseTx}
      />
      <SuccessAlert
        message="TIME libéré"
        visible={hasReleaseTx}
      />
      <SuccessAlert
        message="Merci pour ton avis"
        visible={ratingSuccess}
        onClose={() => setRatingSuccess(false)}
      />
    </>
  );
}
