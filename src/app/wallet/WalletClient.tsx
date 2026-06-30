"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Wallet,
  Clock,
  HeartHandshake,
  Gift,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  History,
  Search,
  Plus,
  Calendar,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  Gavel,
  ChevronDown,
} from "lucide-react";
import ConnectedHeader from "@/components/ConnectedHeader";
import EmptyState from "@/components/EmptyState";
import type { WalletDashboard, WalletTransaction } from "@/lib/wallet-dashboard";
import { getTransactionLabel, getTransactionStatusLabel, getPotTransactionLabel } from "@/lib/wallet-dashboard";
import { donateToCommunityPot } from "./community-pot-actions";
import type { DonateResult } from "./community-pot-actions";
import {
  formatTimeAmount,
  formatDuration,
  formatTimeWithDuration,
  getLedgerTransactionLabel,
} from "@/lib/time-labels";

interface WalletUser {
  id: string;
  name: string;
  timeBalance: number;
  walletAddress: string;
  role: string;
  city: string | null;
  department: string | null;
}

interface SubBalance {
  key: string;
  label: string;
  minutes: number;
  sublabel: string;
}

interface NewWallet {
  id: string;
  userId: string;
  availableMinutes: number;
  pendingMinutes: number;
  lockedMinutes: number;
  disputedMinutes: number;
  earnedMinutes: number;
  giftedMinutes: number;
  communityMinutes: number;
  expiredMinutes: number;
  totalReceivedMinutes: number;
  totalSentMinutes: number;
  totalImpactMinutes: number;
}

interface PotTx {
  id: string;
  userId: string | null;
  userName: string | null;
  bookingId: string | null;
  amount: number;
  type: string;
  reason: string | null;
  createdAt: string;
}

const QUICK_AMOUNTS = [1, 2, 5, 10];

type FilterMode = "all" | "received" | "spent" | "pending" | "pot";

const FILTERS: { key: FilterMode; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "received", label: "Reçus" },
  { key: "spent", label: "Dépensés" },
  { key: "pending", label: "En attente" },
  { key: "pot", label: "Pot commun" },
];

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;

  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

function groupTransactionsByPeriod(txs: WalletTransaction[]): Map<string, WalletTransaction[]> {
  const groups = new Map<string, WalletTransaction[]>();

  for (const tx of txs) {
    const period = formatRelativeTime(new Date(tx.createdAt));
    if (!groups.has(period)) groups.set(period, []);
    groups.get(period)!.push(tx);
  }

  const order = ["Aujourd'hui", "Hier"];
  const sorted = new Map<string, WalletTransaction[]>();
  for (const key of order) {
    if (groups.has(key)) sorted.set(key, groups.get(key)!);
  }
  for (const [key, val] of groups) {
    if (!order.includes(key)) sorted.set(key, val);
  }

  return sorted;
}

// ─── Sub-balance card ────────────────────────────────────────────────────
function SubBalanceCard({
  icon,
  label,
  minutes,
  sublabel,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  minutes: number;
  sublabel: string;
  accent: string;
}) {
  return (
    <div className="bg-tb-surface border border-tb-border rounded-xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-tb-accent/5">
      <div className="flex items-start justify-between mb-2">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent}`}>
          {icon}
        </div>
      </div>
      <div className="text-lg font-bold text-tb-text-primary">
        {formatTimeAmount(minutes)}
      </div>
      <div className="text-[10px] text-tb-text-secondary font-medium mt-0.5">{label}</div>
      <div className="text-[9px] text-tb-text-muted mt-0.5 leading-tight">{sublabel}</div>
    </div>
  );
}

export default function WalletClient({
  user,
  dashboard,
  newWallet,
  breakdown,
  potTransactions,
}: {
  user: WalletUser;
  dashboard: WalletDashboard;
  newWallet: NewWallet;
  breakdown: SubBalance[];
  potTransactions: PotTx[];
}) {
  const router = useRouter();
  const [customAmount, setCustomAmount] = useState("");
  const [result, setResult] = useState<DonateResult | null>(null);
  const [pending, setPending] = useState<number | "custom" | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [copied, setCopied] = useState(false);
  const [showSubBalances, setShowSubBalances] = useState(false);

  async function handleDonate(amount: number) {
    setPending(amount);
    setResult(null);
    setShowSuccess(false);
    const res = await donateToCommunityPot(user.id, amount);
    setResult(res);
    setPending(null);
    if (res.success) {
      setCustomAmount("");
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.refresh();
      }, 3000);
    }
  }

  const handleCopy = async () => {
    if (user.walletAddress) {
      try {
        await navigator.clipboard.writeText(user.walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
    }
  };

  // Filter transactions
  const filteredTxs = useMemo(() => {
    let txs = dashboard.transactions;
    switch (filter) {
      case "received":
        return txs.filter((tx) => tx.toId === user.id && ["release", "escrow_release", "bonus", "mint"].includes(tx.type));
      case "spent":
        return txs.filter((tx) => tx.fromId === user.id && ["escrow", "escrow_hold", "transfer"].includes(tx.type));
      case "pending":
        return txs.filter((tx) => ["escrow", "escrow_hold"].includes(tx.type) && (tx.status === "pending" || tx.bookingStatus === "pending"));
      case "pot":
        return potTransactions.map((ptx) => ({
          id: ptx.id,
          type: ptx.type,
          amount: ptx.amount,
          fromId: ptx.userId,
          toId: null,
          status: "completed",
          label: getPotTransactionLabel(ptx.type),
          statusLabel: "Validé",
          bookingStatus: null,
          bookingId: ptx.bookingId,
          missionTitle: null,
          otherPartyName: null,
          createdAt: new Date(ptx.createdAt),
        }));
      default:
        return txs;
    }
  }, [filter, dashboard.transactions, potTransactions, user.id]);

  const groupedTxs = useMemo(() => groupTransactionsByPeriod(filteredTxs), [filteredTxs]);

  const potPercent = Math.min(
    Math.round((dashboard.communityPotBalance / dashboard.communityPotMonthlyGoal) * 100),
    100
  );

  const subBalanceSections = breakdown || [
    { key: "available", label: "Disponible", minutes: newWallet.availableMinutes, sublabel: "Tu peux utiliser ce TIME pour réserver une aide." },
    { key: "locked", label: "TIME bloqué", minutes: newWallet.lockedMinutes, sublabel: "Ce TIME est réservé pour une mission en cours." },
    { key: "pending", label: "En attente", minutes: newWallet.pendingMinutes, sublabel: "TIME en attente de validation." },
    { key: "disputed", label: "TIME en litige", minutes: newWallet.disputedMinutes, sublabel: "Ce TIME est gelé le temps de résoudre un problème." },
  ];

  return (
    <>
      <ConnectedHeader />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fade-in-up">
        {/* ─── Header ─── */}
        <div>
          <h1 className="text-2xl font-anton tracking-wide text-tb-text-primary">
            Ton compte TIME
          </h1>
          <p className="text-sm text-tb-text-secondary mt-1">
            Suis ton temps disponible, bloqué ou en attente.
          </p>
        </div>

        {/* ─── Success banner ─── */}
        {showSuccess && result && result.success && (
          <div className="bg-tb-accent/10 border-2 border-tb-accent/30 rounded-2xl p-5 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-tb-accent/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7 text-tb-accent" />
              </div>
              <div>
                <p className="text-lg font-bold text-tb-accent">✅ Don réussi !</p>
                <p className="text-sm text-tb-text-primary">
                  Tu as donné <strong>{result.amount} TIME</strong> au pot
                  commun. Nouveau solde du pot : <strong>{result.potBalance} TIME</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── Carte principale — Disponible ─── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-tb-accent via-[#008f78] to-[#006c5b] p-6">
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/[0.03]" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bangers tracking-wider text-white/60">
                ~ temps disponible ~
              </span>
              {user.walletAddress && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70 transition-colors font-mono"
                  title="Copier l'adresse wallet"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-tb-accent" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  {copied ? "Copié !" : `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`}
                </button>
              )}
            </div>

            {/* ─── Solde principal — clic pour détail ─── */}
            <button
              onClick={() => setShowSubBalances(!showSubBalances)}
              className="text-left w-full group cursor-pointer"
            >
              <div className="flex items-end gap-2">
                <div className="text-5xl font-bold text-white mb-1">
                  {formatTimeAmount(newWallet.availableMinutes)}
                </div>
                <div className="text-white/60 mb-2 flex items-center gap-1 transition-transform duration-300"
                  style={{ transform: showSubBalances ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </button>
            <p className="text-sm text-white/60 mb-1">
              {formatDuration(newWallet.availableMinutes)}
            </p>
            <p className="text-xs text-white/40 mb-5">
              Disponible maintenant — tu peux utiliser ce TIME pour réserver une aide.
              {newWallet.lockedMinutes > 0 || newWallet.disputedMinutes > 0 || newWallet.pendingMinutes > 0 ? (
                <button
                  onClick={() => setShowSubBalances(!showSubBalances)}
                  className="ml-1 underline underline-offset-2 hover:text-white/60 transition-colors"
                >
                  Voir le détail →
                </button>
              ) : null}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-medium rounded-xl px-5 py-2.5 transition-all duration-300"
              >
                <Search className="w-4 h-4" />
                Utiliser mes TIME
              </Link>
              <Link
                href="/services/new"
                className="inline-flex items-center gap-2 bg-white hover:bg-white/90 text-tb-accent text-sm font-semibold rounded-xl px-5 py-2.5 transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                Gagner des TIME
              </Link>
            </div>
          </div>
        </div>

        {/* ─── Sous-soldes (accordéon) ─── */}
        {showSubBalances && (
        <>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {subBalanceSections.map((sb) => {
            const accentMap: Record<string, string> = {
              available: "bg-tb-accent/10 text-tb-accent",
              locked: "bg-amber-500/10 text-amber-400",
              pending: "bg-blue-500/10 text-blue-400",
              disputed: "bg-red-500/10 text-red-400",
            };
            const iconMap: Record<string, React.ReactNode> = {
              available: <Wallet className="w-4 h-4" />,
              locked: <Clock className="w-4 h-4" />,
              pending: <AlertTriangle className="w-4 h-4" />,
              disputed: <Gavel className="w-4 h-4" />,
            };
            return (
              <SubBalanceCard
                key={sb.key}
                icon={iconMap[sb.key] || <Wallet className="w-4 h-4" />}
                label={sb.label}
                minutes={sb.minutes}
                sublabel={sb.sublabel}
                accent={accentMap[sb.key] || "bg-tb-accent/10 text-tb-accent"}
              />
            );
          })}
        </div>

        {/* ─── Stats ─── */}
        {newWallet.totalReceivedMinutes > 0 || newWallet.totalSentMinutes > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-tb-surface border border-tb-border rounded-xl p-4">
              <div className="text-xs text-tb-text-secondary mb-1">Reçu (total)</div>
              <div className="text-lg font-bold text-emerald-400">{formatTimeAmount(newWallet.totalReceivedMinutes)}</div>
            </div>
            <div className="bg-tb-surface border border-tb-border rounded-xl p-4">
              <div className="text-xs text-tb-text-secondary mb-1">Donné (total)</div>
              <div className="text-lg font-bold text-rose-400">{formatTimeAmount(newWallet.totalSentMinutes)}</div>
            </div>
            <div className="bg-tb-surface border border-tb-border rounded-xl p-4">
              <div className="text-xs text-tb-text-secondary mb-1">Gagné</div>
              <div className="text-lg font-bold text-tb-accent">{formatTimeAmount(newWallet.earnedMinutes)}</div>
            </div>
            <div className="bg-tb-surface border border-tb-border rounded-xl p-4">
              <div className="text-xs text-tb-text-secondary mb-1">Impact</div>
              <div className="text-lg font-bold text-purple-400">{formatTimeAmount(newWallet.totalImpactMinutes)}</div>
            </div>
          </div>
        ) : null}
        </>
        )}

        {/* ─── Historique LINK ─── */}
        <div className="flex items-center justify-end">
          <Link
            href="/wallet/history"
            className="inline-flex items-center gap-1.5 text-xs text-tb-accent hover:text-tb-accent-hover transition-colors font-medium"
          >
            <History className="w-3.5 h-3.5" />
            Voir tout l'historique
            <span className="text-lg leading-none">→</span>
          </Link>
        </div>

        {/* ─── TIME en attente (legacy) ─── */}
        {dashboard.pendingTransactions.length > 0 && (
          <div className="bg-tb-surface border border-tb-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-medium text-tb-text-primary">
                TIME en attente
              </span>
            </div>
            <p className="text-xs text-tb-text-secondary mb-3">
              {dashboard.pendingBalance} TIME sont actuellement bloqué{dashboard.pendingBalance > 1 ? "s" : ""} dans des réservations en cours.
            </p>
            <div className="space-y-2">
              {dashboard.pendingTransactions.slice(0, 5).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between bg-amber-50/50 border border-amber-100 rounded-lg px-3 py-2"
                >
                  <div>
                    <span className="text-xs text-tb-text-primary font-medium">{tx.label}</span>
                    <span className="text-[10px] text-amber-500 ml-2 bg-amber-100/50 rounded-full px-1.5 py-0.5">
                      {tx.statusLabel}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-amber-600">-{tx.amount} TIME</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Pot commun solidaire ─── */}
        <div id="community-pot" className="bg-tb-surface border border-tb-border rounded-2xl p-5 scroll-mt-20">
          <div className="flex items-center gap-2 mb-3">
            <HeartHandshake className="w-5 h-5 text-tb-accent" />
            <span className="text-sm font-medium text-tb-text-primary">
              Pot commun solidaire
            </span>
          </div>

          <p className="text-xs text-tb-text-secondary mb-3">
            {dashboard.communityPotBalance} TIME disponibles pour financer des missions solidaires.
          </p>

          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-tb-text-primary font-medium">{dashboard.communityPotBalance} / {dashboard.communityPotMonthlyGoal} TIME</span>
              <span className="text-tb-text-muted">Objectif mensuel</span>
            </div>
            <div className="h-2.5 rounded-full bg-tb-surface-elevated border border-tb-border overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-tb-accent to-tb-accent-hover transition-all duration-700"
                style={{ width: `${potPercent}%` }}
              />
            </div>
          </div>

          {dashboard.donatedTotal > 0 && (
            <p className="text-xs text-tb-accent font-medium mb-3 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Tu as déjà donné {dashboard.donatedTotal} TIME au pot commun.
            </p>
          )}

          <div>
            <p className="text-xs text-tb-text-secondary mb-2 font-medium">Ajouter au pot</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {QUICK_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleDonate(amount)}
                  disabled={pending !== null || user.timeBalance < amount}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                    pending === amount
                      ? "bg-tb-accent text-white border-tb-accent"
                      : user.timeBalance < amount
                        ? "bg-tb-surface-elevated text-tb-text-muted border-tb-border cursor-not-allowed"
                        : "bg-tb-surface text-tb-accent border-tb-accent/30 hover:bg-tb-accent/10 hover:border-tb-accent/60"
                  }`}
                >
                  {pending === amount ? (
                    <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                  ) : (
                    `+${amount} TIME`
                  )}
                </button>
              ))}
              {user.timeBalance >= 1 && (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    max={user.timeBalance}
                    placeholder="Libre"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-20 bg-tb-surface border border-tb-border rounded-xl px-3 py-2 text-xs text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent/50"
                  />
                  <button
                    onClick={() => {
                      const val = parseInt(customAmount);
                      if (val > 0 && val <= user.timeBalance) handleDonate(val);
                    }}
                    disabled={pending === "custom" || !customAmount || parseInt(customAmount) <= 0}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-tb-surface border border-tb-accent/30 text-tb-accent hover:bg-tb-accent/10 transition-all disabled:opacity-40"
                  >
                    {pending === "custom" ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      "Donner"
                    )}
                  </button>
                </div>
              )}
            </div>
            {result && !result.success && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {result.error}
              </p>
            )}
          </div>
        </div>

        {/* ─── Actions rapides ─── */}
        <div className="bg-tb-surface border border-tb-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-tb-accent" />
            <span className="text-sm font-medium text-tb-text-primary">
              Que veux-tu faire maintenant ?
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/services"
              className="flex items-center gap-3 bg-tb-surface-elevated rounded-xl px-4 py-3 hover:bg-tb-accent/5 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-lg bg-tb-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Search className="w-5 h-5 text-tb-accent" />
              </div>
              <div>
                <span className="text-sm font-medium text-tb-text-primary group-hover:text-tb-accent transition-colors">Recevoir de l'aide</span>
                <p className="text-xs text-tb-text-secondary">Trouve un membre pour t'aider près de chez toi.</p>
              </div>
            </Link>
            <Link
              href="/services/new"
              className="flex items-center gap-3 bg-tb-surface-elevated rounded-xl px-4 py-3 hover:bg-tb-accent/5 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-lg bg-tb-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-5 h-5 text-tb-accent" />
              </div>
              <div>
                <span className="text-sm font-medium text-tb-text-primary group-hover:text-tb-accent transition-colors">Proposer un service</span>
                <p className="text-xs text-tb-text-secondary">Gagne des TIME en aidant la communauté.</p>
              </div>
            </Link>
            <Link
              href="/wallet/history"
              className="flex items-center gap-3 bg-tb-surface-elevated rounded-xl px-4 py-3 hover:bg-tb-accent/5 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <History className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <span className="text-sm font-medium text-tb-text-primary group-hover:text-blue-400 transition-colors">Mon historique</span>
                <p className="text-xs text-tb-text-secondary">Consulte chaque mouvement de ton compte TIME.</p>
              </div>
            </Link>
            <Link
              href="/wallet#community-pot"
              className="flex items-center gap-3 bg-tb-surface-elevated rounded-xl px-4 py-3 hover:bg-rose-500/5 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <HeartHandshake className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <span className="text-sm font-medium text-tb-text-primary group-hover:text-rose-400 transition-colors">Contribuer au pot</span>
                <p className="text-xs text-tb-text-secondary">Finance une mission solidaire.</p>
              </div>
            </Link>
          </div>
        </div>

        {/* ─── Historique inline ─── */}
        <div className="bg-tb-surface border border-tb-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-tb-text-secondary" />
              <span className="text-sm font-medium text-tb-text-primary">Historique</span>
            </div>
            <Link
              href="/wallet/history"
              className="text-xs text-tb-accent hover:text-tb-accent-hover transition-colors"
            >
              Voir tout →
            </Link>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === f.key
                    ? "bg-tb-accent text-white"
                    : "bg-tb-surface-elevated text-tb-text-secondary hover:bg-tb-accent/10 hover:text-tb-accent"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Empty state */}
          {filteredTxs.length === 0 && (
            <div className="py-8 text-center">
              <History className="w-10 h-10 text-tb-text-muted mx-auto mb-2" />
              <p className="text-sm text-tb-text-secondary font-medium">
                Aucune transaction pour le moment.
              </p>
              <p className="text-xs text-tb-text-muted mt-1">
                Propose un service ou demande de l'aide pour commencer.
              </p>
            </div>
          )}

          {/* Transaction groups */}
          {filteredTxs.length > 0 && (
            <div className="space-y-4">
              {Array.from(groupedTxs.entries()).map(([period, txs]) => (
                <div key={period}>
                  <p className="text-[10px] uppercase tracking-wider text-tb-text-muted font-semibold mb-2">
                    {period}
                  </p>
                  <div className="space-y-1">
                    {txs.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between py-2 px-1 rounded-lg hover:bg-tb-surface-elevated transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              tx.amount > 0 || tx.toId === user.id
                                ? "bg-tb-accent/10"
                                : "bg-rose-500/10"
                            }`}
                          >
                            {tx.amount > 0 || tx.toId === user.id ? (
                              <ArrowDownLeft className="w-4 h-4 text-tb-accent" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4 text-rose-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-tb-text-primary truncate">
                              {tx.label}
                            </p>
                            {tx.missionTitle && (
                              <p className="text-[11px] text-tb-text-secondary truncate mt-0.5 leading-tight">
                                {tx.missionTitle}
                                {tx.otherPartyName && (
                                  <span className="text-tb-text-muted">
                                    {" "}— avec {tx.otherPartyName}
                                  </span>
                                )}
                              </p>
                            )}
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[10px] ${
                                tx.status === "pending" || tx.bookingStatus === "pending"
                                  ? "text-amber-500"
                                  : tx.status === "cancelled"
                                    ? "text-red-400"
                                    : "text-tb-text-muted"
                              }`}>
                                {tx.statusLabel}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-semibold shrink-0 ml-2 ${
                            tx.amount > 0 ? "text-tb-accent" : "text-rose-400"
                          }`}
                        >
                          {tx.toId === user.id ? "+" : ""}{tx.amount} TIME
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

// ─── KPI Card (legacy fallback) ──────────────────────────────────────────
function KpiCard({
  icon,
  value,
  label,
  sublabel,
  accent,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  sublabel: string;
  accent: string;
}) {
  return (
    <div className="bg-tb-surface border border-tb-border rounded-xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-tb-accent/5">
      <div className="flex items-start justify-between mb-2">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-tb-text-primary">{value}</div>
      <div className="text-xs text-tb-text-secondary font-medium mt-0.5">{label}</div>
      <div className="text-[10px] text-tb-text-muted mt-0.5">{sublabel}</div>
    </div>
  );
}
