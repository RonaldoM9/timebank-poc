"use client";

import Link from "next/link";
import { Clock, Inbox, Send, MessageCircle, ClipboardList } from "lucide-react";
import type { DashboardStats as DashboardStatsType } from "@/lib/dashboard";

type WidgetConfig = {
  key: keyof DashboardStatsType;
  title: string;
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
    icon: <Clock className="w-5 h-5" />,
    href: "/wallet",
    accent: "from-[#00d4aa]/20 to-[#00b894]/5 border-[#00d4aa]/30",
    emptyMessage: "Ton wallet est vide, propose un service pour gagner des TIME",
    formatValue: (v) => `${v} TIME`,
  },
  {
    key: "receivedBookingsCount",
    title: "Missions reçues",
    icon: <Inbox className="w-5 h-5" />,
    href: "/bookings?role=provider",
    accent: "from-blue-500/20 to-blue-500/5 border-blue-500/30",
    emptyMessage: "Aucune demande reçue pour le moment",
  },
  {
    key: "requestedBookingsCount",
    title: "Missions demandées",
    icon: <Send className="w-5 h-5" />,
    href: "/bookings?role=customer",
    accent: "from-purple-500/20 to-purple-500/5 border-purple-500/30",
    emptyMessage: "Tu n'as pas encore demandé de mission",
  },
  {
    key: "unreadMessagesCount",
    title: "Messages",
    icon: <MessageCircle className="w-5 h-5" />,
    href: "/bookings",
    accent: "from-amber-500/20 to-amber-500/5 border-amber-500/30",
    emptyMessage: "Aucun message non lu",
  },
  {
    key: "todoActionsCount",
    title: "À faire",
    icon: <ClipboardList className="w-5 h-5" />,
    href: "/bookings?filter=todo",
    accent: "from-rose-500/20 to-rose-500/5 border-rose-500/30",
    emptyMessage: "Tout est à jour",
  },
];

const ICON_BG: Record<string, string> = {
  "TIME disponible": "bg-[#00d4aa]/10 text-[#00d4aa]",
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

  return (
    <div className="space-y-4">
      {/* Widgets grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {WIDGETS.map((w) => {
          const value = stats[w.key];
          const displayValue = w.formatValue
            ? w.formatValue(value)
            : String(value);

          return (
            <Link
              key={w.key}
              href={w.href}
              className={`group relative bg-[#111111] border border-[#262626] rounded-xl p-4 hover:border-[#00d4aa]/30 transition-all overflow-hidden ${
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
                <div className="text-2xl font-bold text-[#f5f5f5] group-hover:text-[#00d4aa] transition-colors">
                  {displayValue}
                </div>

                {/* Label */}
                <div className="text-xs text-[#a3a3a3] font-medium">
                  {w.title}
                </div>

                {/* Empty state hint */}
                {value === 0 && (
                  <div className="text-[10px] text-[#5c5c5c] leading-tight pt-1">
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

      {/* Activity summary */}
      <div className="bg-[#111111] border border-[#262626] rounded-xl px-4 py-3">
        {hasActions ? (
          <p className="text-sm text-[#a3a3a3]">
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
          <p className="text-sm text-[#5c5c5c]">
            Tout est à jour. Continue à proposer ton aide ou découvre les
            missions proches de toi.
          </p>
        )}
      </div>
    </div>
  );
}
