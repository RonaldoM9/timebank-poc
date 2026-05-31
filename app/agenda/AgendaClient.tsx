"use client";

import Link from "next/link";
import { Clock, Sparkles, ArrowLeft, Calendar } from "lucide-react";
import type { AgendaBooking } from "./page";

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; classes: string }> = {
    pending: {
      label: "En attente",
      classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    confirmed: {
      label: "Confirmé",
      classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    in_progress: {
      label: "En cours",
      classes: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    completed: {
      label: "Terminé",
      classes: "bg-green-500/10 text-green-400 border-green-500/20",
    },
    cancelled: {
      label: "Annulé",
      classes: "bg-gray-500/10 text-gray-400 border-gray-500/20",
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
      <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5 hover:border-[#00d4aa]/20 transition-all group cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-[#f5f5f5] truncate group-hover:text-[#00d4aa] transition-colors">
                {booking.service.title}
              </h3>
              <StatusBadge status={booking.status} />
            </div>
            <div className="flex items-center gap-2 text-xs text-[#a3a3a3] mt-1">
              <span>
                {roleEmoji} {roleLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-[#a3a3a3]">
          {formattedDate ? (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#5c5c5c]" />
              {formattedDate}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[#5c5c5c]">
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

function EmptyState({
  icon,
  title,
  description,
  linkHref,
  linkLabel,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  linkHref?: string;
  linkLabel?: string;
}) {
  return (
    <div className="text-center py-12 bg-[#111111] border border-[#262626] rounded-2xl">
      <div className="flex justify-center mb-3">{icon}</div>
      <p className="text-[#a3a3a3] text-sm font-medium">{title}</p>
      <p className="text-[#5c5c5c] text-xs mt-1">{description}</p>
      {linkHref && linkLabel && (
        <Link
          href={linkHref}
          className="inline-block mt-3 text-[#00d4aa] hover:text-[#00b894] text-sm transition-colors underline underline-offset-2"
        >
          {linkLabel}
        </Link>
      )}
    </div>
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
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#262626]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-[#00d4aa]" />
            <span className="font-anton text-lg tracking-wide text-[#f5f5f5]">
              TimeHeroes
            </span>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Tableau de bord
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <div>
          <h1 className="text-3xl font-anton tracking-wide text-[#f5f5f5] mb-1">
            Mon agenda
          </h1>
          <p className="text-[#a3a3a3] text-sm">
            Retrouve toutes tes missions à venir et passées, {userName}.
          </p>
          <span className="inline-block mt-2 font-bangers text-[#00d4aa] text-xs tracking-wider opacity-60">
            ~ organise ton temps de héros ~
          </span>
        </div>

        {/* Missions à venir */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold text-[#f5f5f5]">
              Missions à venir
            </h2>
            <span className="font-bangers text-[#00d4aa] text-xs tracking-wider opacity-60">
              ~ à l&apos;horizon ~
            </span>
          </div>

          {upcoming.length === 0 ? (
            <EmptyState
              icon={<Sparkles className="w-10 h-10 text-[#5c5c5c]" />}
              title="Aucune mission à venir"
              description="Tu n'as pas de missions planifiées pour le moment."
              linkHref="/services"
              linkLabel="Explorer les services"
            />
          ) : (
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
            <h2 className="text-lg font-semibold text-[#f5f5f5]">
              Missions passées
            </h2>
            <span className="font-bangers text-[#00d4aa] text-xs tracking-wider opacity-60">
              ~ accomplissements ~
            </span>
          </div>

          {past.length === 0 ? (
            <EmptyState
              icon={<Clock className="w-10 h-10 text-[#5c5c5c]" />}
              title="Aucune mission passée"
              description="Ton historique de missions est vide pour l'instant."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {past.map((b) => (
                <AgendaCard key={b.id} booking={b} userId={userId} />
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
