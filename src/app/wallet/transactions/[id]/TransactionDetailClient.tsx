"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  User,
  Calendar,
  FileText,
  Tag,
  Shield,
  Info,
  AlertTriangle,
  HeartHandshake,
  Wallet,
  Gavel,
} from "lucide-react";
import ConnectedHeader from "@/components/ConnectedHeader";
import { formatTimeAmount, formatDuration, getLedgerTransactionLabel } from "@/lib/time-labels";

type TxDetail = {
  id: string;
  userId: string;
  counterpartyId: string | null;
  bookingId: string | null;
  missionId: string | null;
  organizationId: string | null;
  communityPotId: string | null;
  amountMinutes: number;
  direction: string;
  type: string;
  status: string;
  source: string;
  reason: string | null;
  createdById: string | null;
  metadata: string | null;
  reversedTransactionId: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string };
  counterparty: { id: string; name: string } | null;
  booking: { id: string; status: string; service: { title: string } } | null;
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  created: { label: "Créée", color: "text-blue-400" },
  pending: { label: "En attente", color: "text-amber-400" },
  locked: { label: "Bloqué", color: "text-amber-400" },
  completed: { label: "Validé", color: "text-green-400" },
  released: { label: "Libéré", color: "text-tb-accent" },
  refunded: { label: "Remboursé", color: "text-blue-400" },
  disputed: { label: "En litige", color: "text-red-400" },
  frozen: { label: "Gelé", color: "text-red-400" },
  reversed: { label: "Annulé", color: "text-tb-text-muted" },
  expired: { label: "Expiré", color: "text-tb-text-muted" },
  adjusted: { label: "Ajusté", color: "text-yellow-400" },
  failed: { label: "Échoué", color: "text-red-500" },
};

const SOURCE_LABELS: Record<string, string> = {
  system: "Système TimeHeroes",
  booking: "Réservation",
  mission: "Mission solidaire",
  community_pot: "Pot commun",
  organization: "Organisation",
  facilitator: "Facilitateur",
  demo_seed: "Données de démonstration",
  migration: "Migration ancien système",
  manual: "Correction manuelle",
};

function getTypeMeta(type: string): { icon: React.ReactNode; accent: string } {
  const base = "w-5 h-5";
  switch (type) {
    case "booking_release":
    case "mission_reward":
    case "welcome_mint":
    case "admin_mint":
      return { icon: <ArrowDownLeft className={`${base} text-tb-accent`} />, accent: "bg-tb-accent/10" };
    case "booking_lock":
    case "transfer_out":
      return { icon: <ArrowUpRight className={`${base} text-amber-400`} />, accent: "bg-amber-500/10" };
    case "booking_refund":
      return { icon: <ArrowDownLeft className={`${base} text-blue-400`} />, accent: "bg-blue-500/10" };
    case "dispute_freeze":
    case "dispute_resolution":
      return { icon: <Gavel className={`${base} text-red-400`} />, accent: "bg-red-500/10" };
    case "community_pot_deposit":
    case "community_pot_withdrawal":
      return { icon: <HeartHandshake className={`${base} text-rose-400`} />, accent: "bg-rose-500/10" };
    case "manual_adjustment":
      return { icon: <AlertTriangle className={`${base} text-yellow-400`} />, accent: "bg-yellow-500/10" };
    case "opening_balance":
      return { icon: <Wallet className={`${base} text-purple-400`} />, accent: "bg-purple-500/10" };
    default:
      return { icon: <Clock className={`${base} text-tb-text-muted`} />, accent: "bg-tb-surface-elevated" };
  }
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-tb-border last:border-b-0">
      <span className="text-xs text-tb-text-secondary shrink-0 mr-4 w-28">{label}</span>
      <div className="text-xs text-tb-text-primary text-right">{children}</div>
    </div>
  );
}

export default function TransactionDetailClient({
  transaction,
}: {
  transaction: TxDetail;
}) {
  const meta = getTypeMeta(transaction.type);
  const statusInfo = STATUS_LABELS[transaction.status] || { label: transaction.status, color: "text-tb-text-muted" };

  let parsedMetadata: Record<string, unknown> | null = null;
  if (transaction.metadata) {
    try {
      parsedMetadata = JSON.parse(transaction.metadata);
    } catch {}
  }

  return (
    <>
      <ConnectedHeader />

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6 animate-fade-in-up">
        {/* Back link */}
        <Link
          href="/wallet/history"
          className="inline-flex items-center gap-1 text-xs text-tb-text-secondary hover:text-tb-text-primary transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Retour à l'historique
        </Link>

        {/* Header */}
        <div className="bg-tb-surface border border-tb-border rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${meta.accent}`}>
              {meta.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-anton tracking-wide text-tb-text-primary">
                {getLedgerTransactionLabel(transaction.type)}
              </h1>
              <p className="text-xs text-tb-text-muted mt-0.5 font-mono">
                {transaction.id}
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className={`text-2xl font-bold ${
                transaction.direction === "credit" ? "text-tb-accent" : "text-rose-400"
              }`}>
                {transaction.direction === "credit" ? "+" : "-"}
                {formatTimeAmount(transaction.amountMinutes)}
              </div>
              <div className="text-xs text-tb-text-muted">
                {formatDuration(transaction.amountMinutes)}
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="bg-tb-surface-elevated border border-tb-border rounded-xl p-4 space-y-1">
            <DetailRow label="Type">
              <span className="font-medium">{getLedgerTransactionLabel(transaction.type)}</span>
            </DetailRow>
            <DetailRow label="Montant">
              <span className="font-semibold">
                {transaction.direction === "credit" ? "+" : "-"}
                {formatTimeAmount(transaction.amountMinutes)}
              </span>
              <span className="text-tb-text-muted ml-1">({formatDuration(transaction.amountMinutes)})</span>
            </DetailRow>
            <DetailRow label="Direction">
              <span className={transaction.direction === "credit" ? "text-tb-accent" : "text-rose-400"}>
                {transaction.direction === "credit" ? "Crédit (reçu)" : "Débit (donné)"}
              </span>
            </DetailRow>
            <DetailRow label="Statut">
              <span className={`font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
            </DetailRow>
            <DetailRow label="Source">
              <span>{SOURCE_LABELS[transaction.source] || transaction.source}</span>
            </DetailRow>
            <DetailRow label="Date">
              <span>{new Date(transaction.createdAt).toLocaleDateString("fr-FR", {
                year: "numeric", month: "long", day: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}</span>
            </DetailRow>

            {transaction.counterparty && (
              <DetailRow label="Avec">
                <span className="font-medium">{transaction.counterparty.name}</span>
              </DetailRow>
            )}

            {transaction.booking && (
              <DetailRow label="Booking lié">
                <span className="font-medium">{transaction.booking.service.title}</span>
                <span className={`text-[10px] ml-1 ${transaction.booking.status === "completed" ? "text-green-400" : "text-amber-400"}`}>
                  ({transaction.booking.status})
                </span>
              </DetailRow>
            )}

            {transaction.reason && (
              <DetailRow label="Raison">
                <span className="italic text-tb-text-secondary">{transaction.reason}</span>
              </DetailRow>
            )}

            {transaction.reversedTransactionId && (
              <DetailRow label="Annule">
                <span className="font-mono text-[10px] text-tb-text-muted">{transaction.reversedTransactionId}</span>
              </DetailRow>
            )}
          </div>

          {/* Metadata section */}
          {parsedMetadata && Object.keys(parsedMetadata).length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-semibold text-tb-text-secondary mb-2 uppercase tracking-wider">
                Données complémentaires
              </h3>
              <div className="bg-tb-surface-elevated border border-tb-border rounded-xl p-4">
                <pre className="text-[10px] text-tb-text-secondary font-mono whitespace-pre-wrap break-all">
                  {JSON.stringify(parsedMetadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Microcopy */}
        <div className="bg-tb-accent/5 border border-tb-accent/10 rounded-xl p-4">
          <p className="text-xs text-tb-text-secondary">
            <span className="font-medium text-tb-accent">Détail du mouvement TIME</span>
            <br />
            Retrouve l'origine, le statut et la durée associée.
          </p>
        </div>
      </main>
    </>
  );
}
