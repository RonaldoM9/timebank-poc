"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle, Clock, User, Shield, Hourglass, AlertTriangle, Smartphone } from "lucide-react";
import { validateNFCProof } from "@/app/services/nfc-actions";
import { useState } from "react";
import Link from "next/link";

interface BookingInfo {
  id: string;
  serviceTitle: string;
  providerName: string;
  providerId: string;
  clientName: string;
  clientId: string;
  hours: number;
  totalTime: number;
  status: string;
}

export default function NFCCompleteClient({
  token,
  booking,
  error,
  userId,
}: {
  token: string;
  booking: BookingInfo | null;
  error: string | null;
  userId: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleConfirm() {
    if (!confirm("Confirmer que la mission a bien été réalisée ? Les TIME seront libérés au provider."))
      return;

    setSubmitting(true);
    setSubmitError(null);

    const result = await validateNFCProof(token);
    if ("error" in result) {
      setSubmitError(result.error);
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setSubmitting(false);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-[#111111] border border-[#262626] rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#00d4aa]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-[#00d4aa]" />
          </div>
          <h1 className="text-2xl font-anton tracking-wide text-[#f5f5f5] mb-2">
            Mission validée par NFC
          </h1>
          <p className="text-[#a3a3a3] text-sm mb-6">
            Les TIME ont été libérés au provider.
          </p>
          <Link
            href={`/bookings/${booking?.id}`}
            className="inline-block bg-[#00d4aa] hover:bg-[#00b894] text-black font-semibold rounded-xl py-2.5 px-6 text-sm transition-colors"
          >
            Voir la réservation
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-[#111111] border border-[#262626] rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-anton tracking-wide text-[#f5f5f5] mb-2">
            Validation impossible
          </h1>
          <p className="text-[#a3a3a3] text-sm mb-6">{error}</p>
          <Link
            href="/dashboard"
            className="inline-block bg-[#262626] hover:bg-[#333333] text-[#f5f5f5] font-semibold rounded-xl py-2.5 px-6 text-sm transition-colors"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="border-b border-[#262626]">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <Smartphone className="w-6 h-6 text-[#00d4aa]" />
            <span className="font-anton text-lg tracking-wide text-[#f5f5f5]">
              Validation NFC
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-[#111111] border border-[#262626] rounded-2xl p-6 sm:p-8">
          {/* Warning */}
          <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
            <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-yellow-400 text-sm">
              Confirmez uniquement si la mission a bien été réalisée. Cette action libère les TIME au provider et ne peut pas être annulée.
            </p>
          </div>

          {/* Booking Summary */}
          {booking && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Smartphone className="w-4 h-4 text-[#00d4aa]" />
                <span className="text-xs text-[#00d4aa] font-semibold uppercase tracking-wider">
                  Validation terrain par NFC
                </span>
              </div>

              <h1 className="text-xl font-anton tracking-wide text-[#f5f5f5] mb-4">
                {booking.serviceTitle}
              </h1>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-4 h-4 text-[#5c5c5c]" />
                  <span className="text-[#a3a3a3]">Héros :</span>
                  <span className="text-[#f5f5f5] font-medium">{booking.providerName}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <User className="w-4 h-4 text-[#5c5c5c]" />
                  <span className="text-[#a3a3a3]">Client :</span>
                  <span className="text-[#f5f5f5] font-medium">{booking.clientName}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-[#5c5c5c]" />
                  <span className="text-[#a3a3a3]">Heures :</span>
                  <span className="text-[#f5f5f5] font-medium">{booking.hours}h</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Hourglass className="w-4 h-4 text-[#5c5c5c]" />
                  <span className="text-[#a3a3a3]">TIME à libérer :</span>
                  <span className="text-[#00d4aa] font-bold">{booking.totalTime} TIME</span>
                </div>
              </div>
            </>
          )}

          {submitError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
              <p className="text-red-400 text-sm">{submitError}</p>
            </div>
          )}

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="w-full bg-[#00d4aa] hover:bg-[#00b894] disabled:opacity-50 text-black font-bold rounded-xl py-4 text-center transition-colors text-base"
          >
            <span className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {submitting ? "Confirmation…" : "Confirmer et libérer les TIME"}
            </span>
          </button>

          <p className="text-[#5c5c5c] text-xs text-center mt-4">
            En confirmant, vous attestez que la mission a été réalisée conformément à la réservation via validation NFC terrain.
          </p>
        </div>
      </main>
    </div>
  );
}
