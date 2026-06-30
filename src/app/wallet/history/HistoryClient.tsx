"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  History,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Gavel,
  HeartHandshake,
  Wallet,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import ConnectedHeader from "@/components/ConnectedHeader";
import { formatTimeAmount, formatDuration, getLedgerTransactionLabel } from "@/lib/time-labels";

type LedgerTx = {
  id: string;
  userId: string;
  counterpartyId: string | null;
  bookingId: string | null;
  amountMinutes: number;
  direction: string;
  type: string;
  status: string;
  source: string;
  reason: string | null;
  createdAt: string;
  counterparty: { id: string; name: string } | null;
  booking: { status: string; service: { title: string } } | null;
};

const FILTER_OPTIONS = [
  { key: "", label: "Tout" },
  { key: "booking_release", label: "Reçu" },
  { key: "booking_lock", label: "Bloqué" },
  { key: "booking_refund", label: "Remboursé" },
  { key: "dispute_freeze", label: "Litige" },
  { key: "community_pot_deposit", label: "Pot commun" },
  { key: "mission_reward", label: "Mission" },
  { key: "manual_adjustment", label: "Ajustement" },
  { key: "opening_balance", label: "Migration" },
];

const STATUS_LABELS: Record<string, string> = {
  created: "Créée",
  pending: "En attente",
  locked: "Bloqué",
  completed: "Validé",
  released: "Libéré",
  refunded: "Remboursé",
  disputed: "En litige",
  frozen: "Gelé",
  reversed: "Annulé",
  expired: "Expiré",
  adjusted: "Ajusté",
  failed: "Échoué",
};

function getTypeIcon(type: string): React.ReactNode {
  const base = "w-4 h-4";
  switch (type) {
    case "booking_release":
    case "mission_reward":
    case "welcome_mint":
    case "admin_mint":
      return <ArrowDownLeft className={`${base} text-tb-accent`} />;
    case "booking_lock":
    case "transfer_out":
      return <ArrowUpRight className={`${base} text-amber-400`} />;
    case "booking_refund":
      return <ArrowDownLeft className={`${base} text-blue-400`} />;
    case "dispute_freeze":
      return <Gavel className={`${base} text-red-400`} />;
    case "community_pot_deposit":
    case "community_pot_withdrawal":
      return <HeartHandshake className={`${base} text-rose-400`} />;
    case "manual_adjustment":
      return <AlertTriangle className={`${base} text-yellow-400`} />;
    case "opening_balance":
      return <Wallet className={`${base} text-purple-400`} />;
    default:
      return <Clock className={`${base} text-tb-text-muted`} />;
  }
}

function getTypeAccent(type: string): string {
  switch (type) {
    case "booking_release":
    case "mission_reward":
    case "welcome_mint":
    case "admin_mint":
      return "bg-tb-accent/10";
    case "booking_lock":
    case "transfer_out":
      return "bg-amber-500/10";
    case "booking_refund":
      return "bg-blue-500/10";
    case "dispute_freeze":
      return "bg-red-500/10";
    case "community_pot_deposit":
    case "community_pot_withdrawal":
      return "bg-rose-500/10";
    case "manual_adjustment":
      return "bg-yellow-500/10";
    case "opening_balance":
      return "bg-purple-500/10";
    default:
      return "bg-tb-surface-elevated";
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryClient({
  transactions,
  total,
  page,
  totalPages,
  currentType,
}: {
  transactions: LedgerTx[];
  total: number;
  page: number;
  totalPages: number;
  currentType?: string;
}) {
  const router = useRouter();

  function handleFilterChange(type: string) {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    router.push(`/wallet/history?${params.toString()}`);
  }

  return (
    <>
      <ConnectedHeader />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/wallet"
              className="inline-flex items-center gap-1 text-xs text-tb-text-secondary hover:text-tb-text-primary transition-colors mb-2"
            >
              <ArrowLeft className="w-3 h-3" />
              Retour au wallet
            </Link>
            <h1 className="text-2xl font-anton tracking-wide text-tb-text-primary">
              Historique TIME
            </h1>
            <p className="text-sm text-tb-text-secondary mt-1">
              Chaque mouvement de ton compte est tracé ici.
            </p>
          </div>
          <div className="text-xs text-tb-text-muted">
            {total} transaction{total > 1 ? "s" : ""}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-1.5">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => handleFilterChange(opt.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                (currentType || "") === opt.key
                  ? "bg-tb-accent text-white"
                  : "bg-tb-surface-elevated text-tb-text-secondary hover:bg-tb-accent/10 hover:text-tb-accent"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Transactions list */}
        {transactions.length === 0 ? (
          <div className="bg-tb-surface border border-tb-border rounded-2xl p-12 text-center">
            <History className="w-12 h-12 text-tb-text-muted mx-auto mb-3" />
            <p className="text-tb-text-secondary font-medium">
              Aucune transaction trouvée
            </p>
            <p className="text-xs text-tb-text-muted mt-1">
              {currentType
                ? "Essaie un autre filtre."
                : "Propose un service ou demande de l'aide pour commencer."}
            </p>
          </div>
        ) : (
          <div className="bg-tb-surface border border-tb-border rounded-2xl divide-y divide-tb-border overflow-hidden">
            {transactions.map((tx) => (
              <Link
                key={tx.id}
                href={`/wallet/transactions/${tx.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-tb-surface-elevated transition-colors"
              >
                {/* Icon */}
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${getTypeAccent(tx.type)}`}
                >
                  {getTypeIcon(tx.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-tb-text-primary truncate">
                      {getLedgerTransactionLabel(tx.type)}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      tx.status === "completed" || tx.status === "released" || tx.status === "refunded"
                        ? "text-green-400 bg-green-500/10"
                        : tx.status === "locked" || tx.status === "pending"
                          ? "text-amber-400 bg-amber-500/10"
                          : tx.status === "disputed" || tx.status === "frozen"
                            ? "text-red-400 bg-red-500/10"
                            : "text-tb-text-muted bg-tb-surface-elevated"
                    }`}>
                      {STATUS_LABELS[tx.status] || tx.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-tb-text-secondary mt-0.5">
                    {tx.booking?.service?.title && (
                      <span>{tx.booking.service.title}</span>
                    )}
                    {tx.counterparty?.name && (
                      <span>— {tx.counterparty.name}</span>
                    )}
                    <span className="text-tb-text-muted">· {formatDate(tx.createdAt)}</span>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                  <div className={`text-sm font-bold ${
                    tx.direction === "credit" ? "text-tb-accent" : "text-rose-400"
                  }`}>
                    {tx.direction === "credit" ? "+" : "-"}
                    {formatTimeAmount(tx.amountMinutes)}
                  </div>
                  <div className="text-[10px] text-tb-text-muted">
                    {formatDuration(tx.amountMinutes)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            {page > 1 && (
              <button
                onClick={() => handleFilterChange(currentType || "")}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-tb-surface border border-tb-border text-tb-text-secondary hover:text-tb-text-primary transition-colors"
              >
                ← Page {page - 1}
              </button>
            )}
            <span className="text-xs text-tb-text-muted">
              Page {page} / {totalPages}
            </span>
            {page < totalPages && (
              <button
                onClick={() => {
                  const params = new URLSearchParams();
                  if (currentType) params.set("type", currentType);
                  params.set("page", String(page + 1));
                  router.push(`/wallet/history?${params.toString()}`);
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-tb-surface border border-tb-border text-tb-text-secondary hover:text-tb-text-primary transition-colors"
              >
                Page {page + 1} →
              </button>
            )}
          </div>
        )}
      </main>
    </>
  );
}
