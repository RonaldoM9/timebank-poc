"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, ExternalLink, CheckCircle, XCircle, Sparkles } from "lucide-react";
import { completeBooking, cancelBooking } from "@/app/services/actions";
import type { BookingItem } from "@/app/services/actions";

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; classes: string }> = {
    pending: {
      label: "En attente",
      classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    completed: {
      label: "Terminé",
      classes: "bg-green-500/10 text-green-400 border-green-500/20",
    },
    cancelled: {
      label: "Annulé",
      classes: "bg-red-500/10 text-red-400 border-red-500/20",
    },
  };

  const c = config[status] ?? {
    label: status,
    classes: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.classes}`}
    >
      {c.label}
    </span>
  );
}

function BookingCard({
  booking,
  isClient,
  onAction,
}: {
  booking: BookingItem;
  isClient: boolean;
  onAction: () => void;
}) {
  const [acting, setActing] = useState(false);

  const handleComplete = async () => {
    if (!confirm("Confirmer que la mission est terminée ?")) return;
    setActing(true);
    const result = await completeBooking(booking.id);
    setActing(false);
    if ("error" in result) {
      alert(result.error);
      return;
    }
    onAction();
  };

  const handleCancel = async () => {
    if (!confirm("Annuler cette réservation ? Le TIME sera remboursé.")) return;
    const reason = prompt("Motif d'annulation (optionnel) :");
    setActing(true);
    const result = await cancelBooking(booking.id, reason ?? undefined);
    setActing(false);
    if ("error" in result) {
      alert(result.error);
      return;
    }
    onAction();
  };

  const isPending = booking.status === "pending";

  return (
    <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5 hover:border-[#00d4aa]/20 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-[#f5f5f5] truncate group-hover:text-[#00d4aa] transition-colors">
              {booking.service.title}
            </h3>
            <StatusBadge status={booking.status} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#a3a3a3]">
            {isClient ? (
              <span>
                Prestataire :{" "}
                <span className="text-[#f5f5f5]">{booking.service.provider.name}</span>
              </span>
            ) : (
              <span>
                Client :{" "}
                <span className="text-[#f5f5f5]">{booking.client.name}</span>
              </span>
            )}
            <span>
              {booking.hours}h × {booking.service.ratePerHour} TIME/h ={" "}
              <span className="text-[#00d4aa] font-semibold">{booking.totalTime} TIME</span>
            </span>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-[#5c5c5c] font-mono mb-3">
        {new Date(booking.createdAt).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[#262626]">
        <Link
          href={`/bookings/${booking.id}`}
          className="inline-flex items-center gap-1 bg-[#181818] hover:bg-[#222] border border-[#262626] rounded-xl px-3 py-1.5 text-xs text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors"
        >
          Détails
          <ExternalLink className="w-3 h-3" />
        </Link>

        {isPending && isClient && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleComplete}
              disabled={acting}
              className="inline-flex items-center gap-1 bg-[#00d4aa]/10 hover:bg-[#00d4aa]/20 border border-[#00d4aa]/20 rounded-xl px-3 py-1.5 text-xs text-[#00d4aa] transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-3 h-3" />
              Terminé
            </button>
            <button
              onClick={handleCancel}
              disabled={acting}
              className="inline-flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl px-3 py-1.5 text-xs text-red-400 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-3 h-3" />
              Annuler
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingsClient({
  initialClientBookings,
  initialProviderBookings,
  userName,
}: {
  initialClientBookings: BookingItem[];
  initialProviderBookings: BookingItem[];
  userName: string;
}) {
  const router = useRouter();
  const [clientBookings, setClientBookings] = useState(initialClientBookings);
  const [providerBookings, setProviderBookings] = useState(initialProviderBookings);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#262626]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-[#00d4aa]" />
            <span className="font-anton text-lg tracking-wide text-[#f5f5f5]">
              TimeBank
            </span>
          </div>
          <Link
            href="/dashboard"
            className="text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors text-sm"
          >
            Tableau de bord
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <div>
          <h1 className="text-3xl font-anton tracking-wide text-[#f5f5f5] mb-1">
            Mes réservations
          </h1>
          <p className="text-[#a3a3a3] text-sm">
            Suis tes missions et celles que tu as confiées, {userName}.
          </p>
          <span className="inline-block mt-2 font-bangers text-[#00d4aa] text-xs tracking-wider opacity-60">
            ~ le temps est la monnaie la plus précieuse ~
          </span>
        </div>

        {/* Section : Mes réservations (client) */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold text-[#f5f5f5]">
              Missions confiées
            </h2>
            <span className="font-bangers text-[#00d4aa] text-xs tracking-wider opacity-60">
              ~ mes réservations ~
            </span>
          </div>

          {clientBookings.length === 0 ? (
            <div className="text-center py-10 bg-[#111111] border border-[#262626] rounded-2xl">
              <Sparkles className="w-10 h-10 text-[#5c5c5c] mx-auto mb-3" />
              <p className="text-[#a3a3a3] text-sm">Aucune réservation pour le moment.</p>
              <Link
                href="/services"
                className="inline-block mt-3 text-[#00d4aa] hover:text-[#00b894] text-sm transition-colors underline underline-offset-2"
              >
                Explorer les services
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {clientBookings.map((b) => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  isClient={true}
                  onAction={refresh}
                />
              ))}
            </div>
          )}
        </section>

        {/* Section : Missions reçues (provider) */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold text-[#f5f5f5]">
              Missions reçues
            </h2>
            <span className="font-bangers text-[#00d4aa] text-xs tracking-wider opacity-60">
              ~ clients venus à toi ~
            </span>
          </div>

          {providerBookings.length === 0 ? (
            <div className="text-center py-10 bg-[#111111] border border-[#262626] rounded-2xl">
              <Sparkles className="w-10 h-10 text-[#5c5c5c] mx-auto mb-3" />
              <p className="text-[#a3a3a3] text-sm">
                Aucune mission reçue pour le moment.
              </p>
              <Link
                href="/my-services"
                className="inline-block mt-3 text-[#00d4aa] hover:text-[#00b894] text-sm transition-colors underline underline-offset-2"
              >
                Voir mes services
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {providerBookings.map((b) => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  isClient={false}
                  onAction={refresh}
                />
              ))}
            </div>
          )}
        </section>

        {/* Comics footer */}
        <div className="text-center pt-6">
          <span className="font-bangers text-[#00d4aa] text-xs tracking-wider opacity-40">
            ~ chaque mission accomplie rend le monde meilleur ~
          </span>
        </div>
      </main>
    </div>
  );
}
