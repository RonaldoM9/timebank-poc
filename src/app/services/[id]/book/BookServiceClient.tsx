"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Loader2, Coins, User, Zap, Calendar, CheckCircle2 } from "lucide-react";
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
  const [confirmed, setConfirmed] = useState(false);

  const totalTime = 1 * hours;
  const insufficient = balance < totalTime;

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

    setConfirmed(true);
    setTimeout(() => router.push("/bookings"), 1500);
  }

  // If owner
  if (isOwner) {
    return (
      <div className="min-h-screen bg-tb-bg">
        <ConnectedHeader />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <Link
            href={`/services/${service.id}`}
            className="inline-flex items-center gap-2 text-tb-text-secondary hover:text-tb-accent transition-colors text-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au service
          </Link>
          <div className="bg-tb-surface border border-tb-border rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-tb-accent/10 flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-tb-accent" />
            </div>
            <h2 className="text-lg font-bold text-tb-text-primary mb-2">C&apos;est votre service</h2>
            <p className="text-sm text-tb-text-secondary mb-4">
              Vous ne pouvez pas réserver votre propre mission.
            </p>
            <Link
              href={`/services/${service.id}`}
              className="text-sm text-tb-accent hover:underline font-medium"
            >
              ← Retour aux détails
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Success confirmation
  if (confirmed) {
    return (
      <div className="min-h-screen bg-tb-bg">
        <ConnectedHeader />
        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-tb-accent/10 flex items-center justify-center mb-6 animate-bounce-in">
            <CheckCircle2 className="w-10 h-10 text-tb-accent" />
          </div>
          <h2 className="text-2xl font-anton tracking-wide text-tb-text-primary mb-2">
            Réservation confirmée ! 🎉
          </h2>
          <p className="text-sm text-tb-text-secondary mb-6">
            {totalTime} TIME ont été réservés pour {hours}h avec {service.provider.name}.
          </p>
          <div className="w-8 h-8 border-2 border-tb-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-tb-text-muted mt-2">Redirection vers mes réservations…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tb-bg">
      <ConnectedHeader />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href={`/services/${service.id}`}
          className="inline-flex items-center gap-2 text-tb-text-secondary hover:text-tb-accent transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au service
        </Link>

        <div className="bg-tb-surface border border-tb-border rounded-2xl p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6">
            <span className="font-bangers text-tb-accent text-xs tracking-wider">
              ~ réserve ton super-pouvoir ~
            </span>
            <h1 className="text-xl sm:text-2xl font-anton tracking-wide text-tb-text-primary mt-1">
              {service.title}
            </h1>
          </div>

          {/* Service info card */}
          <div className="bg-tb-bg border border-tb-border rounded-xl p-4 mb-6 space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-tb-text-secondary flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-tb-text-muted" />
                Héros
              </span>
              <span className="text-tb-text-primary font-semibold">{service.provider.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-tb-text-secondary flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-tb-text-muted" />
                Tarif
              </span>
              <span className="text-tb-accent font-semibold">{service.ratePerHour} TIME / heure</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-tb-text-secondary flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-tb-text-muted" />
                Ton solde
              </span>
              <span className={`font-semibold ${insufficient ? "text-red-500" : "text-tb-text-primary"}`}>
                {balance} TIME
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Step 1: Hours */}
            <div>
              <label htmlFor="hours" className="block text-xs font-semibold text-tb-text-secondary mb-1.5 uppercase tracking-wider">
                1. Nombre d&apos;heures
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setHours(Math.max(1, hours - 1))}
                  className="w-10 h-10 rounded-xl bg-tb-bg border border-tb-border flex items-center justify-center text-tb-text-primary hover:border-tb-accent transition-colors font-bold text-lg"
                >
                  −
                </button>
                <input
                  id="hours"
                  name="hours"
                  type="number"
                  min="1"
                  step="1"
                  value={hours}
                  onChange={(e) => setHours(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center bg-tb-bg border border-tb-border rounded-xl px-3 py-2.5 text-tb-text-primary text-lg font-bold focus:outline-none focus:border-tb-accent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setHours(hours + 1)}
                  className="w-10 h-10 rounded-xl bg-tb-bg border border-tb-border flex items-center justify-center text-tb-text-primary hover:border-tb-accent transition-colors font-bold text-lg"
                >
                  +
                </button>
                <span className="text-sm text-tb-text-secondary">
                  heure{hours > 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Step 2: Slot */}
            <div>
              <label className="block text-xs font-semibold text-tb-text-secondary mb-1.5 uppercase tracking-wider">
                2. Créneau (optionnel)
              </label>
              {loadingSlots ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-tb-text-muted" />
                </div>
              ) : slots.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {slots.map((slot) => {
                    const isSelected = selectedSlot?.startAt === slot.startAt && selectedSlot?.endAt === slot.endAt;
                    return (
                      <button
                        key={slot.startAt}
                        type="button"
                        onClick={() => setSelectedSlot(isSelected ? null : { startAt: slot.startAt, endAt: slot.endAt })}
                        className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                          isSelected
                            ? "border-tb-accent bg-tb-accent/10 text-tb-accent font-semibold"
                            : "border-tb-border bg-tb-bg text-tb-text-primary hover:border-tb-accent/50"
                        }`}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-tb-bg border border-tb-border rounded-xl p-3">
                  <p className="text-tb-text-secondary text-xs">
                    Le héros n&apos;a pas encore ajouté ses disponibilités. Tu pourras convenir d&apos;un créneau après la réservation.
                  </p>
                </div>
              )}
            </div>

            {selectedSlot && (
              <>
                <input type="hidden" name="startAt" value={selectedSlot.startAt} />
                <input type="hidden" name="endAt" value={selectedSlot.endAt} />
              </>
            )}

            {/* Step 3: Summary */}
            <div className="bg-tb-bg border border-tb-border rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-tb-text-muted mb-3">3. Récapitulatif</p>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-tb-text-secondary">{service.ratePerHour} TIME × {hours}h</span>
                <span className="text-tb-text-primary font-semibold">{totalTime} TIME</span>
              </div>
              <div className="border-t border-tb-border pt-2 flex items-center justify-between">
                <span className="text-tb-text-secondary text-sm font-medium">Total</span>
                <span className="text-xl font-bold text-tb-accent">{totalTime} TIME</span>
              </div>
            </div>

            {/* Insufficient balance */}
            {insufficient && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-amber-700 text-xs">
                  ⚠️ Solde insuffisant. Il te manque {totalTime - balance} TIME.{hours > 1 ? " Réduis le nombre d'heures." : ""}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={pending || insufficient}
              className="w-full bg-tb-accent hover:bg-tb-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3.5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-tb-accent/20 flex items-center justify-center gap-2 text-sm"
            >
              {pending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Réservation en cours…
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Réserver avec mes TIME
                </>
              )}
            </button>

            <p className="text-[10px] text-tb-text-muted text-center">
              Les TIME sont séquestrés jusqu&apos;à la validation de la mission
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
