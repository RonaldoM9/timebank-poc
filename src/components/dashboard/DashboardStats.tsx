"use client";

import Link from "next/link";
import { useState } from "react";
import { Clock, Inbox, Send, MessageCircle, ClipboardList, ChevronDown } from "lucide-react";
import type { DashboardStats as DashboardStatsType } from "@/lib/dashboard";

type WidgetConfig = {
  key: keyof DashboardStatsType;
  title: string;
  shortLabel: string;      // mobile label (short)
  icon: React.ReactNode;
  href: string;
  accent: string;
  emptyMessage: string;
  formatValue?: (v: number) => string;
};

const WIDGETS: WidgetConfig[] = [
  {
    key: "timeBalance",
    title: "TIME disponible",
    shortLabel: "TIME",
    icon: <Clock className="w-5 h-5" />,
    href: "/wallet",
    accent: "from-tb-accent/20 to-tb-accent-hover/5 border-tb-accent/30",
    emptyMessage: "Ton wallet est vide, propose un service pour gagner des TIME",
    formatValue: (v) => `${v} TIME`,
  },
  {
    key: "receivedBookingsCount",
    title: "Missions reçues",
    shortLabel: "Reçues",
    icon: <Inbox className="w-5 h-5" />,
    href: "/bookings?role=provider",
    accent: "from-blue-500/20 to-blue-500/5 border-blue-500/30",
    emptyMessage: "Aucune demande reçue pour le moment",
  },
  {
    key: "requestedBookingsCount",
    title: "Missions demandées",
    shortLabel: "Demandées",
    icon: <Send className="w-5 h-5" />,
    href: "/bookings?role=customer",
    accent: "from-purple-500/20 to-purple-500/5 border-purple-500/30",
    emptyMessage: "Tu n'as pas encore demandé de mission",
  },
  {
    key: "unreadMessagesCount",
    title: "Messages",
    shortLabel: "Messages",
    icon: <MessageCircle className="w-5 h-5" />,
    href: "/bookings",
    accent: "from-amber-500/20 to-amber-500/5 border-amber-500/30",
    emptyMessage: "Aucun message non lu",
  },
  {
    key: "todoActionsCount",
    title: "À faire",
    shortLabel: "À faire",
    icon: <ClipboardList className="w-5 h-5" />,
    href: "/bookings?filter=todo",
    accent: "from-rose-500/20 to-rose-500/5 border-rose-500/30",
    emptyMessage: "Tout est à jour",
  },
];

// Primary widgets shown on mobile (in order)
const MOBILE_PRIMARY_KEYS: (keyof DashboardStatsType)[] = [
  "timeBalance", "todoActionsCount", "unreadMessagesCount", "receivedBookingsCount",
];

const ICON_BG: Record<string, string> = {
  "TIME disponible": "bg-tb-accent/10 text-tb-accent",
  "Missions reçues": "bg-blue-500/10 text-blue-400",
  "Missions demandées": "bg-purple-500/10 text-purple-400",
  Messages: "bg-amber-500/10 text-amber-400",
  "À faire": "bg-rose-500/10 text-rose-400",
};

export default function DashboardStats({
  stats,
}: {
  stats: DashboardStatsType;
}) {
  const hasActions =
    stats.todoActionsCount > 0 || stats.unreadMessagesCount > 0;
  const [accordionOpen, setAccordionOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* ─── MOBILE: 4 compact widgets (hidden on md+) ─── */}
      <div className="grid grid-cols-2 gap-2 md:hidden">
        {MOBILE_PRIMARY_KEYS.map((key) => {
          const w = WIDGETS.find((x) => x.key === key)!;
          const value = stats[key];
          const displayValue = w.formatValue
            ? w.formatValue(value)
            : String(value);

          return (
            <Link
              key={key}
              href={w.href}
              className={`flex items-center gap-3 bg-tb-surface border border-tb-border rounded-xl px-3 py-3 hover:border-tb-accent/30 transition-all ${value === 0 ? "opacity-70" : ""}`}
            >
              {/* Icon */}
              <div
                className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${ICON_BG[w.title]}`}
              >
                {w.icon}
              </div>
              {/* Value + label */}
              <div className="min-w-0">
                <div className="text-lg font-bold text-tb-text-primary leading-tight">
                  {displayValue}
                </div>
                <div className="text-[11px] text-tb-text-secondary font-medium truncate">
                  {w.shortLabel}
                  {key === "unreadMessagesCount" && value > 0 && (
                    <span className="text-amber-400 ml-1">
                      · {value} non lu{value > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ─── MOBILE: Activity summary (hidden on md+) ─── */}
      <div className="md:hidden">
        {hasActions ? (
          <p className="text-sm text-tb-text-secondary">
            Tu as{" "}
            {[
              stats.todoActionsCount > 0 &&
                `${stats.todoActionsCount} action${stats.todoActionsCount > 1 ? "s" : ""} à traiter`,
              stats.unreadMessagesCount > 0 &&
                `${stats.unreadMessagesCount} message${stats.unreadMessagesCount > 1 ? "s" : ""} non lu${stats.unreadMessagesCount > 1 ? "s" : ""}`,
            ]
              .filter(Boolean)
              .join(" et ")}
            .
          </p>
        ) : (
          <p className="text-sm text-tb-text-muted">
            Tout est à jour. Tu peux explorer les missions proches de toi.
          </p>
        )}
      </div>

      {/* ─── MOBILE: Accordion "Voir plus" (hidden on md+) ─── */}
      <div className="md:hidden">
        <button
          onClick={() => setAccordionOpen(!accordionOpen)}
          className="w-full flex items-center justify-between gap-2 bg-tb-surface border border-tb-border rounded-xl px-4 py-2.5 text-sm text-tb-text-secondary hover:text-tb-text-primary hover:border-tb-accent/30 transition-all"
        >
          <span>Voir plus de statistiques</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${accordionOpen ? "rotate-180" : ""}`}
          />
        </button>

        {accordionOpen && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {/* Missions demandées (not in primary 4) */}
            {(() => {
              const w = WIDGETS.find((x) => x.key === "requestedBookingsCount")!;
              const value = stats.requestedBookingsCount;
              return (
                <Link
                  key="requestedBookingsCount"
                  href={w.href}
                  className="flex items-center gap-3 bg-tb-surface border border-tb-border rounded-xl px-3 py-3 hover:border-tb-accent/30 transition-all"
                >
                  <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${ICON_BG[w.title]}`}>
                    {w.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-lg font-bold text-tb-text-primary leading-tight">{value}</div>
                    <div className="text-[11px] text-tb-text-secondary font-medium truncate">{w.shortLabel}</div>
                  </div>
                </Link>
              );
            })()}

            {/* Lien vers le profil/récompenses */}
            <Link
              href="/rewards"
              className="flex items-center gap-3 bg-tb-surface border border-tb-border rounded-xl px-3 py-3 hover:border-tb-accent/30 transition-all"
            >
              <div className="w-8 h-8 shrink-0 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <span className="text-yellow-400 text-sm font-bold">XP</span>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-tb-text-primary leading-tight">Progression</div>
                <div className="text-[11px] text-tb-text-secondary font-medium truncate">Niveau & badges</div>
              </div>
            </Link>

            {/* Lien vers les avis */}
            <Link
              href="/ratings"
              className="flex items-center gap-3 bg-tb-surface border border-tb-border rounded-xl px-3 py-3 hover:border-tb-accent/30 transition-all"
            >
              <div className="w-8 h-8 shrink-0 rounded-lg bg-yellow-400/10 flex items-center justify-center">
                <span className="text-yellow-400 text-sm">⭐</span>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-tb-text-primary leading-tight">Réputation</div>
                <div className="text-[11px] text-tb-text-secondary font-medium truncate">Avis reçus</div>
              </div>
            </Link>

            {/* Lien vers l'impact */}
            <Link
              href="/impact"
              className="flex items-center gap-3 bg-tb-surface border border-tb-border rounded-xl px-3 py-3 hover:border-tb-accent/30 transition-all"
            >
              <div className="w-8 h-8 shrink-0 rounded-lg bg-tb-accent/10 flex items-center justify-center">
                <span className="text-tb-accent text-sm font-bold">🌍</span>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-tb-text-primary leading-tight">Impact</div>
                <div className="text-[11px] text-tb-text-secondary font-medium truncate">Ton engagement</div>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* ─── DESKTOP: Full 5-widget grid (hidden on <md) ─── */}
      <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {WIDGETS.map((w) => {
          const value = stats[w.key];
          const displayValue = w.formatValue
            ? w.formatValue(value)
            : String(value);

          return (
            <Link
              key={w.key}
              href={w.href}
              className={`group relative bg-tb-surface border border-tb-border rounded-xl p-4 hover:border-tb-accent/30 transition-all overflow-hidden ${
                value === 0 ? "opacity-70" : ""
              }`}
            >
              {/* Subtle gradient on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${w.accent} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
              />

              <div className="relative z-10 space-y-2">
                {/* Icon */}
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    ICON_BG[w.title]
                  }`}
                >
                  {w.icon}
                </div>

                {/* Value */}
                <div className="text-2xl font-bold text-tb-text-primary group-hover:text-tb-accent transition-colors">
                  {displayValue}
                </div>

                {/* Label */}
                <div className="text-xs text-tb-text-secondary font-medium">
                  {w.title}
                </div>

                {/* Empty state hint */}
                {value === 0 && (
                  <div className="text-[10px] text-tb-text-muted leading-tight pt-1">
                    {w.emptyMessage}
                  </div>
                )}

                {/* Badge for unread messages */}
                {w.key === "unreadMessagesCount" && value > 0 && (
                  <div className="text-[10px] text-amber-400 font-semibold">
                    {value} non lu{value > 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* ─── DESKTOP: Activity summary (hidden on <md) ─── */}
      <div className="hidden md:block bg-tb-surface border border-tb-border rounded-xl px-4 py-3">
        {hasActions ? (
          <p className="text-sm text-tb-text-secondary">
            Tu as{" "}
            {[
              stats.todoActionsCount > 0 &&
                `${stats.todoActionsCount} action${stats.todoActionsCount > 1 ? "s" : ""} à traiter`,
              stats.unreadMessagesCount > 0 &&
                `${stats.unreadMessagesCount} message${stats.unreadMessagesCount > 1 ? "s" : ""} non lu${stats.unreadMessagesCount > 1 ? "s" : ""}`,
            ]
              .filter(Boolean)
              .join(" et ")}
            .
          </p>
        ) : (
          <p className="text-sm text-tb-text-muted">
            Tout est à jour. Continue à proposer ton aide ou découvre les
            missions proches de toi.
          </p>
        )}
      </div>
    </div>
  );
}
