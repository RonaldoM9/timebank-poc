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
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
        <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#00d4aa]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-[#00d4aa]" />
          </div>
          <h1 className="text-2xl font-anton tracking-wide text-[#111111] mb-2">
            Mission validée par NFC
          </h1>
          <p className="text-[#6b7280] text-sm mb-6">
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
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
        <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-anton tracking-wide text-[#111111] mb-2">
            Validation impossible
          </h1>
          <p className="text-[#6b7280] text-sm mb-6">{error}</p>
          <Link
            href="/dashboard"
            className="inline-block bg-[#e5e5e5] hover:bg-[#d4d4d4] text-[#111111] font-semibold rounded-xl py-2.5 px-6 text-sm transition-colors"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <header className="border-b border-[#e5e5e5]">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-[#6b7280] hover:text-[#111111] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <Smartphone className="w-6 h-6 text-[#00d4aa]" />
            <span className="font-anton text-lg tracking-wide text-[#111111]">
              Validation NFC
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-2xl p-6 sm:p-8">
          {/* Warning */}
          <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-yellow-600 text-sm">
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

              <h1 className="text-xl font-anton tracking-wide text-[#111111] mb-4">
                {booking.serviceTitle}
              </h1>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-4 h-4 text-[#9ca3af]" />
                  <span className="text-[#6b7280]">Héros :</span>
                  <span className="text-[#111111] font-medium">{booking.providerName}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <User className="w-4 h-4 text-[#9ca3af]" />
                  <span className="text-[#6b7280]">Client :</span>
                  <span className="text-[#111111] font-medium">{booking.clientName}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-[#9ca3af]" />
                  <span className="text-[#6b7280]">Heures :</span>
                  <span className="text-[#111111] font-medium">{booking.hours}h</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Hourglass className="w-4 h-4 text-[#9ca3af]" />
                  <span className="text-[#6b7280]">TIME à libérer :</span>
                  <span className="text-[#00d4aa] font-bold">{booking.totalTime} TIME</span>
                </div>
              </div>
            </>
          )}

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <p className="text-red-600 text-sm">{submitError}</p>
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

          <p className="text-[#9ca3af] text-xs text-center mt-4">
            En confirmant, vous attestez que la mission a été réalisée conformément à la réservation via validation NFC terrain.
          </p>
        </div>
      </main>
    </div>
  );
}
