"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import type { AgendaEvent } from "./page";

const DAYS_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const STATUS_STYLES: Record<
  string,
  { dot: string; bg: string; label: string }
> = {
  pending: { dot: "bg-amber-400", bg: "bg-amber-50 text-amber-700 border-amber-200", label: "En attente" },
  confirmed: { dot: "bg-emerald-500", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Confirmé" },
  accepted: { dot: "bg-emerald-500", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Accepté" },
  in_progress: { dot: "bg-blue-500", bg: "bg-blue-50 text-blue-700 border-blue-200", label: "En cours" },
  completed: { dot: "bg-green-500", bg: "bg-green-50 text-green-700 border-green-200", label: "Terminé" },
  cancelled: { dot: "bg-gray-400", bg: "bg-gray-50 text-gray-500 border-gray-200", label: "Annulé" },
  open: { dot: "bg-sky-400", bg: "bg-sky-50 text-sky-700 border-sky-200", label: "Ouvert" },
  FULL: { dot: "bg-purple-400", bg: "bg-purple-50 text-purple-700 border-purple-200", label: "Complet" },
  JOINED: { dot: "bg-teal-400", bg: "bg-teal-50 text-teal-700 border-teal-200", label: "Inscrit" },
  WAITLISTED: { dot: "bg-amber-300", bg: "bg-amber-50 text-amber-600 border-amber-200", label: "Liste d'attente" },
  CHECKED_IN: { dot: "bg-blue-400", bg: "bg-blue-50 text-blue-700 border-blue-200", label: "Présent" },
  NO_SHOW: { dot: "bg-red-400", bg: "bg-red-50 text-red-700 border-red-200", label: "Absent" },
  VALIDATED: { dot: "bg-green-500", bg: "bg-green-50 text-green-700 border-green-200", label: "Validé" },
};

function getMonthGrid(year: number, month: number) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1);
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const cells: (number | null)[] = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startOffset + 1;
    cells.push(dayNum >= 1 && dayNum <= daysInMonth ? dayNum : null);
  }
  return cells;
}

const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

/* ─── Event type icon map ──────────────────────────────────────────── */
const TYPE_ICONS: Record<string, string> = {
  booking: "📋",
  collective: "👥",
  urgent: "🆘",
};

/* ─── Single event pill in the grid ────────────────────────────────── */
function EventPill({ event }: { event: AgendaEvent }) {
  const s = STATUS_STYLES[event.status] ?? { dot: "bg-gray-400" };

  return (
    <Link
      href={event.href}
      className="group flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] leading-tight hover:bg-tb-accent-soft/60 transition-colors cursor-pointer"
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      <span className="truncate text-tb-text-primary group-hover:text-tb-accent transition-colors">
        {event.roleIcon} {event.title}
      </span>
      {event.totalTime != null && (
        <span className="shrink-0 text-tb-accent font-semibold ml-auto">
          {event.totalTime}h
        </span>
      )}
    </Link>
  );
}

/* ─── Calendar view component ──────────────────────────────────────── */
export default function CalendarView({
  events,
}: {
  events: AgendaEvent[];
}) {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(() => new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const cells = useMemo(() => getMonthGrid(year, month), [year, month]);

  // Group events by date (day of month)
  const eventsByDay = useMemo(() => {
    const map: Record<number, AgendaEvent[]> = {};
    for (const e of events) {
      if (!e.date) continue;
      const d = new Date(e.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(e);
      }
    }
    return map;
  }, [events, year, month]);

  // Events without a date
  const noDateEvents = useMemo(
    () => events.filter((e) => !e.date),
    [events],
  );

  // Week rows
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const goPrevMonth = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goNextMonth = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const goToday = () => setViewDate(new Date());

  const monthLabel = `${MONTHS_FR[month]} ${year}`;
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;

  return (
    <div className="animate-fade-in-up">
      {/* Header navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-tb-text-primary">
            {monthLabel}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={goPrevMonth}
              className="p-1.5 rounded-lg hover:bg-tb-border/50 text-tb-text-secondary transition-colors"
              aria-label="Mois précédent"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goNextMonth}
              className="p-1.5 rounded-lg hover:bg-tb-border/50 text-tb-text-secondary transition-colors"
              aria-label="Mois suivant"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <button
          onClick={goToday}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${
            isCurrentMonth
              ? "bg-tb-accent text-white border-tb-accent cursor-default"
              : "bg-white text-tb-text-primary border-tb-border hover:border-tb-accent hover:text-tb-accent"
          }`}
        >
          Aujourd&apos;hui
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_SHORT.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-semibold text-tb-text-muted uppercase tracking-wider py-2"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="bg-tb-surface border border-tb-border rounded-2xl overflow-hidden">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-tb-border last:border-b-0">
            {week.map((day, di) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${wi}-${di}`}
                    className="min-h-[100px] bg-tb-surface-elevated/50 border-r border-tb-border last:border-r-0 p-1"
                  />
                );
              }

              const dayEvents = eventsByDay[day] ?? [];
              const isToday =
                today.getDate() === day &&
                today.getMonth() === month &&
                today.getFullYear() === year;

              return (
                <div
                  key={`day-${day}`}
                  className={`min-h-[100px] border-r border-tb-border last:border-r-0 p-1.5 transition-colors ${
                    isToday ? "bg-tb-accent-soft/40" : "hover:bg-tb-accent-soft/20"
                  }`}
                >
                  {/* Day number */}
                  <div className="flex items-center justify-center mb-1">
                    <span
                      className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? "bg-tb-accent text-white"
                          : "text-tb-text-secondary"
                      }`}
                    >
                      {day}
                    </span>
                  </div>

                  {/* Events */}
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 4).map((e) => (
                      <EventPill key={`${e.type}-${e.id}`} event={e} />
                    ))}
                    {dayEvents.length > 4 && (
                      <div className="text-xs text-tb-text-muted text-center pt-0.5">
                        +{dayEvents.length - 4} autres
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Events without a date */}
      {noDateEvents.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <CalendarIcon className="w-4 h-4 text-tb-text-muted" />
            <h3 className="text-sm font-semibold text-tb-text-primary">
              Événements sans date planifiée
            </h3>
            <span className="text-xs text-tb-text-muted">
              ({noDateEvents.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {noDateEvents.map((e) => {
              const s = STATUS_STYLES[e.status] ?? { dot: "bg-gray-400", bg: "bg-gray-50 text-gray-500 border-gray-200" };
              return (
                <Link
                  key={`${e.type}-${e.id}`}
                  href={e.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border ${s.bg} hover:opacity-80 transition-opacity`}
                >
                  <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                  <span>{e.roleIcon}</span>
                  {e.title}
                  {e.totalTime != null && (
                    <span className="font-semibold ml-1">{e.totalTime}h</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-tb-border">
        <div className="flex items-center gap-4 text-xs text-tb-text-muted flex-wrap">
          <span className="font-medium text-tb-text-secondary">Légende :</span>
          {Object.entries(STATUS_STYLES).filter(([k]) => !["NO_SHOW", "WAITLISTED", "CHECKED_IN", "VALIDATED", "FULL", "OPEN", "JOINED", "accepted"].includes(k)).map(([key, val]) => (
            <span key={key} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${val.dot}`} />
              {val.label}
            </span>
          ))}
          <span className="ml-2 text-tb-text-muted">|</span>
          <span className="flex items-center gap-2">
            <span>📋 Réservation</span>
            <span>👥 Collective</span>
            <span>🆘 Urgente</span>
          </span>
        </div>
      </div>
    </div>
  );
}
