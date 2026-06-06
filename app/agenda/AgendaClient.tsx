"use client";

import Link from "next/link";
import { Clock, Sparkles, Calendar, CalendarCheck } from "lucide-react";
import type { AgendaBooking } from "./page";
import ConnectedHeader from "@/components/ConnectedHeader";
import EmptyState from "@/components/EmptyState";

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; classes: string }> = {
    pending: {
      label: "En attente",
      classes: "bg-amber-100 text-amber-700 border-amber-300",
    },
    confirmed: {
      label: "Confirmé",
      classes: "bg-amber-100 text-amber-700 border-amber-300",
    },
    in_progress: {
      label: "En cours",
      classes: "bg-blue-100 text-blue-700 border-blue-300",
    },
    completed: {
      label: "Terminé",
      classes: "bg-green-100 text-green-700 border-green-300",
    },
    cancelled: {
      label: "Annulé",
      classes: "bg-gray-100 text-gray-600 border-gray-300",
    },
  };

  const c = config[status] ?? {
    label: status,
    classes: "bg-gray-100 text-gray-600 border-gray-300",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.classes}`}
    >
      {c.label}
    </span>
  );
}

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AgendaCard({
  booking,
  userId,
}: {
  booking: AgendaBooking;
  userId: string;
}) {
  const isClient = booking.clientId === userId;
  const roleLabel = isClient ? "En tant que client" : "En tant que Hero";
  const roleEmoji = isClient ? "🙋" : "🦸";
  const formattedDate = formatDate(booking.startAt);

  return (
    <Link href={`/bookings/${booking.id}`}>
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 hover:border-[#00d4aa]/20 transition-all group cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-[#111827] truncate group-hover:text-[#00d4aa] transition-colors">
                {booking.service.title}
              </h3>
              <StatusBadge status={booking.status} />
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6b7280] mt-1">
              <span>
                {roleEmoji} {roleLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-[#6b7280]">
          {formattedDate ? (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#9ca3af]" />
              {formattedDate}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[#9ca3af]">
              <Calendar className="w-3.5 h-3.5" />
              Date non définie
            </span>
          )}
          <span className="text-[#00d4aa] font-semibold">
            {booking.totalTime} TIME
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function AgendaClient({
  upcoming,
  past,
  userId,
  userName,
}: {
  upcoming: AgendaBooking[];
  past: AgendaBooking[];
  userId: string;
  userName: string;
}) {
  const hasNoBookings = upcoming.length === 0 && past.length === 0;

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <ConnectedHeader />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <div>
          <h1 className="text-3xl font-anton tracking-wide text-[#111827] mb-1">
            Mon agenda
          </h1>
          <p className="text-[#6b7280] text-sm">
            Retrouve toutes tes missions à venir et passées, {userName}.
          </p>
          <span className="inline-block mt-2 font-bangers text-[#00d4aa] text-xs tracking-wider opacity-60">
            ~ organise ton temps de héros ~
          </span>
        </div>

        {hasNoBookings ? (
          <EmptyState
            icon={<CalendarCheck className="w-12 h-12" />}
            title="Aucune mission planifiée pour le moment"
            description="Explore les missions disponibles et réserve un créneau."
            actionLabel="Explorer les missions"
            actionHref="/services"
          />
        ) : (
          <>
            {/* Missions à venir */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-semibold text-[#111827]">
                  Missions à venir
                </h2>
                <span className="font-bangers text-[#00d4aa] text-xs tracking-wider opacity-60">
                  ~ à l&apos;horizon ~
                </span>
              </div>

              {upcoming.length === 0 ? null : (
                <div className="grid grid-cols-1 gap-4">
                  {upcoming.map((b) => (
                    <AgendaCard key={b.id} booking={b} userId={userId} />
                  ))}
                </div>
              )}
            </section>

            {/* Missions passées */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-semibold text-[#111827]">
                  Missions passées
                </h2>
                <span className="font-bangers text-[#00d4aa] text-xs tracking-wider opacity-60">
                  ~ accomplissements ~
                </span>
              </div>

              {past.length === 0 ? null : (
                <div className="grid grid-cols-1 gap-4">
                  {past.map((b) => (
                    <AgendaCard key={b.id} booking={b} userId={userId} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

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
