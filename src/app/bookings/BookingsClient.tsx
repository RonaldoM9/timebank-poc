"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, ExternalLink, CheckCircle, XCircle, Sparkles, MessageSquare, Calendar } from "lucide-react";
import { completeBooking, cancelBooking } from "@/app/services/actions";
import type { BookingItem } from "@/app/services/actions";
import ConnectedHeader from "@/components/ConnectedHeader";
import EmptyState from "@/components/EmptyState";

function formatRelativeTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "à l'instant";
  if (diffMins < 60) return `il y a ${diffMins} min`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `il y a ${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `il y a ${diffDays}j`;

  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

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
    <div className="bg-tb-surface border border-tb-border rounded-2xl p-5 hover:border-tb-accent/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-tb-accent/5 hover:border-tb-accent/30 group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-tb-text-primary truncate group-hover:text-tb-accent transition-colors">
              {booking.service.title}
            </h3>
            <StatusBadge status={booking.status} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-tb-text-secondary">
            {isClient ? (
              <span>
                Prestataire :{" "}
                <span className="text-tb-text-primary">{booking.service.provider.name}</span>
              </span>
            ) : (
              <span>
                Client :{" "}
                <span className="text-tb-text-primary">{booking.client.name}</span>
              </span>
            )}
            <span>
              {booking.hours}h × {booking.service.ratePerHour} TIME/h ={" "}
              <span className="text-tb-accent font-semibold">{booking.totalTime} TIME</span>
            </span>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-tb-text-muted font-mono mb-3">
        {new Date(booking.createdAt).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>

      {/* Discussion indicator */}
      {booking._count.messages > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1 text-[10px] text-tb-text-muted">
            <MessageSquare className="w-3 h-3" />
            <span>
              {booking._count.messages} message{booking._count.messages > 1 ? "s" : ""}
            </span>
          </div>
          {booking.lastMessageAt && (
            <div className="text-[10px] text-tb-text-muted">
              · Dernier message : {formatRelativeTime(booking.lastMessageAt)}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-tb-border">
        <Link
          href={`/bookings/${booking.id}`}
          className="inline-flex items-center gap-1 bg-tb-surface-elevated hover:bg-tb-surface-elevated border border-tb-border rounded-xl px-3 py-1.5 text-xs text-tb-text-secondary hover:text-tb-text-primary transition-colors"
        >
          Détails
          <ExternalLink className="w-3 h-3" />
        </Link>

        {isPending && isClient && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleComplete}
              disabled={acting}
              className="inline-flex items-center gap-1 bg-tb-accent/10 hover:bg-tb-accent/20 border border-tb-accent/20 rounded-xl px-3 py-1.5 text-xs text-tb-accent transition-colors disabled:opacity-50"
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
    <>
      {/* Header */}
      <ConnectedHeader />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in-up">
        {/* Hero */}
        <div>
          <h1 className="text-3xl font-anton tracking-wide text-tb-text-primary mb-1">
            Mes réservations
          </h1>
          <p className="text-tb-text-secondary text-sm">
            Suis tes missions et celles que tu as confiées, {userName}.
          </p>
          <span className="inline-block mt-2 font-bangers text-tb-accent text-xs tracking-wider opacity-60">
            ~ le temps est la monnaie la plus précieuse ~
          </span>
        </div>

        {/* Section : Mes réservations (client) */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold text-tb-text-primary">
              Missions confiées
            </h2>
            <span className="font-bangers text-tb-accent text-xs tracking-wider opacity-60">
              ~ mes réservations ~
            </span>
          </div>

          {clientBookings.length === 0 ? (
            <EmptyState
              icon={<Calendar className="w-7 h-7 text-tb-text-muted" />}
              title="Tu n'as pas encore de réservation"
              description="Explore les missions disponibles et réserve un créneau avec ton TIME."
              actionLabel="Voir les missions"
              actionHref="/services"
            />
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
            <h2 className="text-lg font-semibold text-tb-text-primary">
              Missions reçues
            </h2>
            <span className="font-bangers text-tb-accent text-xs tracking-wider opacity-60">
              ~ clients venus à toi ~
            </span>
          </div>

          {providerBookings.length === 0 ? (
            <div className="text-center py-10 bg-tb-surface border border-tb-border rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-tb-accent/5 hover:border-tb-accent/30">
              <Sparkles className="w-10 h-10 text-tb-text-muted mx-auto mb-3" />
              <p className="text-tb-text-secondary text-sm">
                Aucune mission reçue pour le moment.
              </p>
              <Link
                href="/my-services"
                className="inline-block mt-3 text-tb-accent hover:text-tb-accent-hover text-sm transition-colors underline underline-offset-2"
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
          <span className="font-bangers text-tb-accent text-xs tracking-wider opacity-40">
            ~ chaque mission accomplie rend le monde meilleur ~
          </span>
        </div>
      </main>
    </>
  );
}
