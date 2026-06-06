"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Loader2, Coins, User, Zap, Calendar } from "lucide-react";
import Link from "next/link";
import { createBooking } from "@/app/services/actions";
import { getProviderSlots } from "@/app/availability/actions";
import type { AvailableSlot } from "@/app/availability/actions";
import ConnectedHeader from "@/components/ConnectedHeader";

interface ServiceBook {
  id: string;
  title: string;
  description: string;
  category: string;
  ratePerHour: number;
  status: string;
  createdAt: string;
  provider: {
    id: string;
    name: string;
    walletAddress: string;
  };
}

export default function BookServiceClient({
  service,
  balance,
  isOwner,
}: {
  service: ServiceBook;
  balance: number;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [hours, setHours] = useState<number>(1);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{ startAt: string; endAt: string } | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const totalTime = service.ratePerHour * hours;
  const insufficient = balance < totalTime;

  // Fetch available slots when hours change
  useEffect(() => {
    if (isOwner) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    getProviderSlots(service.provider.id, hours)
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [hours, service.provider.id, isOwner]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createBooking(service.id, formData);

    if ("error" in result) {
      setError(result.error);
      setPending(false);
      return;
    }

    router.push("/bookings");
  }

  // Si le client est le provider, on ne montre pas le formulaire
  if (isOwner) {
    return (
      <div className="min-h-screen bg-[#f5f5f5]">
        <ConnectedHeader />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <Link
            href={`/services/${service.id}`}
            className="inline-flex items-center gap-2 text-[#6b7280] hover:text-[#111111] transition-colors text-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au service
          </Link>
          <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-2xl p-6 sm:p-8 text-center">
            <div className="bg-[#00d4aa]/5 border border-tb-accent/20 rounded-xl p-4">
              <p className="text-tb-accent text-sm font-semibold">
                Vous êtes le héros de ce service
              </p>
              <p className="text-[#6b7280] text-xs mt-1">
                Vous ne pouvez pas réserver votre propre service
              </p>
              <Link
                href={`/services/${service.id}`}
                className="inline-block mt-3 text-[#6b7280] hover:text-[#111111] text-sm underline transition-colors"
              >
                Retour aux détails
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <ConnectedHeader />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href={`/services/${service.id}`}
          className="inline-flex items-center gap-2 text-[#6b7280] hover:text-[#111111] transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au service
        </Link>

        <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-2xl p-6 sm:p-8">
          {/* En-tête avec label comics */}
          <div className="mb-6">
            <span className="font-bangers text-tb-accent text-xs tracking-wider">
              ~ réserve ton super-pouvoir ~
            </span>
            <h1 className="text-2xl font-anton tracking-wide text-[#111111] mt-1">
              {service.title}
            </h1>
          </div>

          {/* Infos service */}
          <div className="bg-[#f0f0f0] border border-[#e5e5e5] rounded-xl p-4 mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#6b7280] text-sm">
                <User className="w-4 h-4 text-[#9ca3af]" />
                Héros
              </div>
              <span className="text-[#111111] font-semibold text-sm">
                {service.provider.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#6b7280] text-sm">
                <Zap className="w-4 h-4 text-[#9ca3af]" />
                Tarif
              </div>
              <span className="text-tb-accent font-semibold text-sm">
                {service.ratePerHour} TIME / heure
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#6b7280] text-sm">
                <Coins className="w-4 h-4 text-[#9ca3af]" />
                Ton solde
              </div>
              <span
                className={`font-semibold text-sm ${
                  insufficient ? "text-red-600" : "text-[#111111]"
                }`}
              >
                {balance} TIME
              </span>
            </div>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="hours"
                className="block text-sm font-medium text-[#6b7280] mb-1.5"
              >
                Nombre d&apos;heures
              </label>
              <input
                id="hours"
                name="hours"
                type="number"
                min="1"
                step="1"
                value={hours}
                onChange={(e) => setHours(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-[#f0f0f0] border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-[#111111] focus:outline-none focus:border-tb-accent transition-colors"
              />
            </div>

            {/* Sélecteur de créneaux */}
            <div>
              <label className="block text-sm font-medium text-[#6b7280] mb-1.5">
                <Calendar className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                Créneau disponible
              </label>
              {loadingSlots ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-[#6b7280]" />
                </div>
              ) : slots.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {slots.map((slot) => {
                    const isSelected =
                      selectedSlot?.startAt === slot.startAt &&
                      selectedSlot?.endAt === slot.endAt;
                    return (
                      <button
                        key={slot.startAt}
                        type="button"
                        onClick={() =>
                          setSelectedSlot(
                            isSelected
                              ? null
                              : { startAt: slot.startAt, endAt: slot.endAt }
                          )
                        }
                        className={`text-left px-4 py-3 rounded-xl border text-sm transition-colors ${
                          isSelected
                            ? "border-tb-accent bg-tb-accent/10 text-tb-accent"
                            : "border-[#e5e5e5] bg-[#f0f0f0] text-[#111111] hover:border-[#cccccc]"
                        }`}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-[#f0f0f0] border border-[#e5e5e5] rounded-xl p-3">
                  <p className="text-[#6b7280] text-xs">
                    Ce Hero n&apos;a pas encore ajouté de disponibilité. La
                    réservation sans créneau reste possible.
                  </p>
                </div>
              )}
            </div>

            {/* Champs cachés pour le créneau sélectionné */}
            {selectedSlot && (
              <>
                <input type="hidden" name="startAt" value={selectedSlot.startAt} />
                <input type="hidden" name="endAt" value={selectedSlot.endAt} />
              </>
            )}

            {/* Récapitulatif */}
            <div className="bg-[#f0f0f0] border border-[#e5e5e5] rounded-xl p-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-[#6b7280]">
                  {service.ratePerHour} TIME × {hours}h
                </span>
                <span className="text-[#111111] font-semibold">
                  {totalTime} TIME
                </span>
              </div>
              <div className="border-t border-[#e5e5e5] pt-2 flex items-center justify-between">
                <span className="text-[#6b7280] text-sm font-medium">
                  Total
                </span>
                <span className="text-xl font-bold text-tb-accent">
                  {totalTime} TIME
                </span>
              </div>
            </div>

            {insufficient && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                <p className="text-yellow-600 text-xs">
                  Solde insuffisant. Il te manque {totalTime - balance} TIME.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={pending || insufficient}
              className="w-full bg-[#00d4aa] hover:bg-[#00b894] disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-xl py-3 transition-colors flex items-center justify-center gap-2"
            >
              {pending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Réservation…
                </>
              ) : (
                "Réserver avec mes TIME"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
