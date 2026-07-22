"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, ExternalLink, CheckCircle, XCircle, Sparkles, MessageSquare, Calendar, User, ArrowLeft, ArrowRight } from "lucide-react";
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

  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; classes: string }> = {
    pending: { label: "En attente", classes: "bg-amber-100 text-amber-700 border-amber-200" },
    completed: { label: "Terminé", classes: "bg-green-100 text-green-700 border-green-200" },
    cancelled: { label: "Annulé", classes: "bg-red-100 text-red-600 border-red-200" },
  };
  const c = config[status] ?? { label: status, classes: "bg-gray-100 text-gray-600 border-gray-200" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${c.classes}`}>
      {c.label}
    </span>
  );
}

function BookingCard({ booking, isClient, onAction }: { booking: BookingItem; isClient: boolean; onAction: () => void }) {
  const [acting, setActing] = useState(false);

  const handleComplete = async () => {
    if (!confirm("Confirmer que la mission est terminée ?")) return;
    setActing(true);
    const result = await completeBooking(booking.id);
    setActing(false);
    if ("error" in result) { alert(result.error); return; }
    onAction();
  };

  const handleCancel = async () => {
    if (!confirm("Annuler cette réservation ? Le TIME sera remboursé.")) return;
    const reason = prompt("Motif d'annulation (optionnel) :");
    setActing(true);
    const result = await cancelBooking(booking.id, reason ?? undefined);
    setActing(false);
    if ("error" in result) { alert(result.error); return; }
    onAction();
  };

  const isPending = booking.status === "pending";

  return (
    <div className="bg-tb-surface border border-tb-border rounded-xl p-4 hover:border-tb-accent/30 transition-all group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-tb-text-primary truncate group-hover:text-tb-accent transition-colors">
              {booking.service.title}
            </h3>
            <StatusBadge status={booking.status} />
          </div>
          <div className="flex items-center gap-3 text-xs text-tb-text-secondary">
            {isClient ? (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-tb-text-muted" />
                {booking.service.provider.name}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-tb-text-muted" />
                {booking.client.name}
              </span>
            )}
            <span className="text-tb-accent font-semibold">{booking.totalTime} TIME</span>
          </div>
          <div className="text-[10px] text-tb-text-muted mt-1">
            {new Date(booking.createdAt).toLocaleDateString("fr-FR", {
              day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
            })}
          </div>
        </div>

        {/* Quick actions */}
        {isPending && (
          <div className="flex items-center gap-1.5 shrink-0">
            {isClient && (
              <button
                onClick={handleComplete}
                disabled={acting}
                className="inline-flex items-center gap-1 bg-tb-accent hover:bg-tb-accent-hover text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-3 h-3" />
                Terminer
              </button>
            )}
            <button
              onClick={handleCancel}
              disabled={acting}
              className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-500 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 border border-red-200"
            >
              <XCircle className="w-3 h-3" />
              Annuler
            </button>
          </div>
        )}
      </div>

      {/* Messages indicator */}
      {booking._count.messages > 0 && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-tb-border">
          <div className="flex items-center gap-1 text-[10px] text-tb-text-muted">
            <MessageSquare className="w-3 h-3" />
            <span>{booking._count.messages} message{booking._count.messages > 1 ? "s" : ""}</span>
          </div>
          {booking.lastMessageAt && (
            <span className="text-[10px] text-tb-text-muted">· {formatRelativeTime(booking.lastMessageAt)}</span>
          )}
          <Link href={`/bookings/${booking.id}`} className="ml-auto text-[10px] text-tb-accent hover:underline font-medium">
            Détails →
          </Link>
        </div>
      )}

      {booking._count.messages === 0 && (
        <div className="mt-3 pt-3 border-t border-tb-border flex justify-end">
          <Link href={`/bookings/${booking.id}`} className="text-[10px] text-tb-accent hover:underline font-medium">
            Voir les détails →
          </Link>
        </div>
      )}
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
  const [activeTab, setActiveTab] = useState<"client" | "provider">("client");

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const clientPending = clientBookings.filter(b => b.status === "pending").length;
  const providerPending = providerBookings.filter(b => b.status === "pending").length;
  const totalPending = clientPending + providerPending;

  return (
    <>
      <ConnectedHeader />

      <main className="max-w-3xl mx-auto px-4 py-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-anton tracking-wide text-tb-text-primary">
              Mes réservations
            </h1>
            <p className="text-sm text-tb-text-secondary mt-1">
              {totalPending > 0
                ? `${totalPending} réservation${totalPending > 1 ? "s" : ""} en attente`
                : "Tout est à jour"}
            </p>
          </div>
          {totalPending > 0 && (
            <div className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full">
              {totalPending} en attente
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-tb-bg border border-tb-border rounded-xl p-1 mb-5">
          <button
            onClick={() => setActiveTab("client")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "client"
                ? "bg-tb-surface text-tb-text-primary shadow-sm border border-tb-border"
                : "text-tb-text-secondary hover:text-tb-text-primary"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Mes demandes
            {clientPending > 0 && (
              <span className="bg-tb-accent text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{clientPending}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("provider")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "provider"
                ? "bg-tb-surface text-tb-text-primary shadow-sm border border-tb-border"
                : "text-tb-text-secondary hover:text-tb-text-primary"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Demandes reçues
            {providerPending > 0 && (
              <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{providerPending}</span>
            )}
          </button>
        </div>

        {/* Client bookings */}
        {activeTab === "client" && (
          clientBookings.length === 0 ? (
            <EmptyState
              icon={<Calendar className="w-7 h-7 text-tb-text-muted" />}
              title="Tu n'as pas encore de réservation"
              description="Explore les missions disponibles et réserve un créneau avec ton TIME."
              actionLabel="Voir les missions"
              actionHref="/services"
            />
          ) : (
            <div className="space-y-3">
              {clientBookings.map(b => (
                <BookingCard key={b.id} booking={b} isClient={true} onAction={refresh} />
              ))}
            </div>
          )
        )}

        {/* Provider bookings */}
        {activeTab === "provider" && (
          providerBookings.length === 0 ? (
            <div className="text-center py-12 bg-tb-surface border border-tb-border rounded-xl">
              <Sparkles className="w-10 h-10 text-tb-text-muted mx-auto mb-3" />
              <p className="text-tb-text-secondary text-sm font-medium">Aucune mission reçue pour le moment</p>
              <p className="text-xs text-tb-text-muted mt-1">Quand quelqu&apos;un réservera ton service, il apparaîtra ici.</p>
              <Link
                href="/my-services"
                className="inline-block mt-4 text-xs text-tb-accent hover:underline font-medium"
              >
                Voir mes services →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {providerBookings.map(b => (
                <BookingCard key={b.id} booking={b} isClient={false} onAction={refresh} />
              ))}
            </div>
          )
        )}

        {/* Footer */}
        <div className="text-center pt-8">
          <span className="font-bangers text-tb-accent text-xs tracking-wider opacity-30">
            ~ chaque mission accomplie rend le monde meilleur ~
          </span>
        </div>
      </main>
    </>
  );
}
