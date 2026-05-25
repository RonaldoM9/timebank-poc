"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, User, Shield, Calendar, CheckCircle, XCircle, Hourglass, AlertTriangle } from "lucide-react";
import { completeBooking, cancelBooking } from "@/app/services/actions";

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
                  Client : {booking.client.name}
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#5c5c5c]" />
                  Héros : {booking.service.provider.name}
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
