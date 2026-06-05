"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownRight,
  Gift,
  Wallet,
  HeartHandshake,
  Loader2,
  CheckCircle2,
  AlertCircle,
  History,
  Users,
} from "lucide-react";
import ConnectedHeader from "@/components/ConnectedHeader";
import EmptyState from "@/components/EmptyState";
import { donateToCommunityPot, type DonateResult } from "@/lib/community-pot";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  fromId: string | null;
  toId: string | null;
  status: string;
  createdAt: string;
}

interface WalletUser {
  id: string;
  name: string;
  timeBalance: number;
  walletAddress: string;
  role: string;
}

interface PotInfo {
  id: string;
  balance: number;
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

const typeLabels: Record<string, string> = {
  mint: "Crédit de bienvenue",
  transfer: "Transfert",
  escrow: "Réservation en attente",
  release: "Service terminé",
  refund: "Remboursement",
};

const potTypeLabels: Record<string, string> = {
  DONATION: "Don au pot commun",
  FUNDING: "Financement de mission",
  ADJUSTMENT: "Ajustement",
};

const QUICK_AMOUNTS = [1, 2, 5, 10];

export default function WalletClient({
  user,
  transactions,
  pot,
  potTransactions,
}: {
  user: WalletUser;
  transactions: Transaction[];
  pot: PotInfo;
  potTransactions: PotTx[];
}) {
  const router = useRouter();
  const [customAmount, setCustomAmount] = useState("");
  const [result, setResult] = useState<DonateResult | null>(null);
  const [pending, setPending] = useState<number | "custom" | null>(null);

  async function handleDonate(amount: number) {
    setPending(amount);
    setResult(null);
    const res = await donateToCommunityPot(user.id, amount);
    setResult(res);
    setPending(null);
    if ("success" in res && res.success) {
      setTimeout(() => router.refresh(), 1200);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <ConnectedHeader />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-anton tracking-wide text-[#f5f5f5]">
          Mon Wallet
        </h1>

        {/* Balance card */}
        <div className="bg-[#111111] border border-[#262626] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#a3a3a3] text-sm font-medium">
              Solde actuel
            </span>
            <span className="text-[#00d4aa] text-xs font-bangers tracking-wider">
              ~ crédit temps ~
            </span>
          </div>
          <div className="text-5xl font-bold text-[#f5f5f5] mb-2">
            {user.timeBalance}{" "}
            <span className="text-lg text-[#a3a3a3] font-normal">TIME</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#5c5c5c] text-xs font-mono">
              {user.walletAddress}
            </span>
          </div>
        </div>

        {/* ─── Community Pot Section ──────────────────────────────── */}
        <div className="bg-[#111111] border border-[#262626] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-[#00d4aa]" />
              <span className="font-semibold text-[#f5f5f5]">
                Pot commun TimeHeroes
              </span>
            </div>
            <span className="text-[#00d4aa] text-xs font-bangers tracking-wider">
              ~ solidarité ~
            </span>
          </div>

          {/* Pot balance */}
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-3xl font-bold text-[#f5f5f5]">
              {pot.balance}
            </span>
            <span className="text-sm text-[#a3a3a3]">
              TIME disponibles pour la communauté
            </span>
          </div>

          {/* Impact message */}
          <p className="text-xs text-[#a3a3a3] mb-4 leading-relaxed">
            Le pot commun permet de financer des missions solidaires pour les
            membres qui ont besoin d&apos;aide mais pas assez de TIME. Tes TIME
            peuvent aider une personne à recevoir un coup de main.
          </p>

          {/* Quick donate buttons */}
          <div className="flex flex-wrap gap-2 mb-3">
            {QUICK_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                disabled={pending !== null || user.timeBalance < amt}
                onClick={() => handleDonate(amt)}
                className="flex items-center gap-1 rounded-lg border border-[#262626] bg-[#181818] hover:bg-[#222222] hover:border-[#00d4aa]/30 disabled:opacity-30 disabled:cursor-not-allowed text-[#f5f5f5] text-sm font-medium px-3 py-2 transition-colors"
              >
                <Gift className="w-3.5 h-3.5 text-[#00d4aa]" />
                +{amt} TIME
              </button>
            ))}
          </div>

          {/* Custom amount field */}
          <div className="flex items-center gap-2 mb-3">
            <input
              type="number"
              min="1"
              max={user.timeBalance}
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Montant libre..."
              className="flex-1 rounded-lg border border-[#262626] bg-[#181818] px-3 py-2 text-sm text-[#f5f5f5] placeholder-[#5c5c5c] focus:outline-none focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa]/30 transition-colors"
            />
            <button
              type="button"
              disabled={
                pending !== null ||
                !customAmount ||
                parseInt(customAmount) <= 0 ||
                parseInt(customAmount) > user.timeBalance
              }
              onClick={() => {
                const amt = parseInt(customAmount);
                if (amt > 0) handleDonate(amt);
              }}
              className="flex items-center gap-1 rounded-lg bg-[#00d4aa] hover:bg-[#00b894] disabled:opacity-30 disabled:cursor-not-allowed text-[#0a0a0a] font-bold text-sm px-4 py-2 transition-colors"
            >
              {pending === "custom" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Gift className="w-3.5 h-3.5" />
              )}
              Donner
            </button>
          </div>

          {/* Result feedback */}
          {result && (
            <div
              className={`rounded-xl border p-3 mb-3 ${
                result.success
                  ? "bg-[#00d4aa]/5 border-[#00d4aa]/20"
                  : "bg-red-500/5 border-red-500/20"
              }`}
            >
              {result.success ? (
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00d4aa] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-[#00d4aa]">
                      Don réussi&nbsp;!
                    </p>
                    <p className="text-xs text-[#a3a3a3]">
                      Tu as donné {result.amount} TIME au pot commun. Solde du
                      pot : {result.potBalance} TIME.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-400">Erreur</p>
                    <p className="text-xs text-[#a3a3a3]">{result.error}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recent pot transactions */}
          {potTransactions.length > 0 && (
            <div className="pt-3 border-t border-[#262626]">
              <div className="flex items-center gap-2 mb-2">
                <History className="w-3.5 h-3.5 text-[#a3a3a3]" />
                <span className="text-xs font-medium text-[#a3a3a3]">
                  Dernières transactions du pot
                </span>
              </div>
              <div className="space-y-1.5">
                {potTransactions.map((tx) => {
                  const isDonation = tx.type === "DONATION";
                  const label = potTypeLabels[tx.type] || tx.type;
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                            isDonation
                              ? "bg-[#00d4aa]/10"
                              : tx.type === "FUNDING"
                              ? "bg-yellow-500/10"
                              : "bg-[#5c5c5c]/10"
                          }`}
                        >
                          {isDonation ? (
                            <Gift className="w-3 h-3 text-[#00d4aa]" />
                          ) : tx.type === "FUNDING" ? (
                            <Users className="w-3 h-3 text-yellow-400" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 text-[#a3a3a3]" />
                          )}
                        </div>
                        <div>
                          <p className="text-[#f5f5f5] font-medium">{label}</p>
                          <p className="text-[#5c5c5c]">
                            {tx.userName && tx.type === "DONATION"
                              ? `Don de ${tx.userName}`
                              : tx.reason || ""}
                            {" · "}
                            {new Date(tx.createdAt).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "numeric",
                                month: "short",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`font-semibold ${
                          isDonation
                            ? "text-[#00d4aa]"
                            : "text-yellow-400"
                        }`}
                      >
                        {isDonation ? "+" : "-"}
                        {tx.amount} TIME
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Donner du TIME button */}
        <Link
          href="/wallet/transfer"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#00d4aa] hover:bg-[#00b894] text-[#0a0a0a] font-bold text-sm px-4 py-3 transition-colors w-full"
        >
          <Gift className="w-4 h-4" />
          Transférer du TIME à un héros
        </Link>

        {/* Transactions */}
        <div className="bg-[#111111] border border-[#262626] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#262626]">
            <h2 className="font-semibold text-[#f5f5f5]">
              Historique des transactions
            </h2>
          </div>

          {transactions.length === 0 ? (
            <EmptyState
              icon={<Wallet className="w-12 h-12" />}
              title="Aucune transaction"
              description="Ton historique TIME apparaîtra ici après tes premiers échanges."
              actionLabel="Explorer les missions"
              actionHref="/services"
            />
          ) : (
            <div className="divide-y divide-[#262626]">
              {transactions.map((tx) => {
                const isCredit =
                  tx.type === "mint" || tx.toId === user.id;
                const label = typeLabels[tx.type] || tx.type;

                return (
                  <div
                    key={tx.id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-[#181818] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isCredit
                            ? "bg-[#00d4aa]/10"
                            : "bg-red-500/10"
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownRight className="w-4 h-4 text-[#00d4aa]" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#f5f5f5]">
                          {label}
                        </div>
                        <div className="text-xs text-[#5c5c5c]">
                          {new Date(tx.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-sm font-semibold ${
                          isCredit
                            ? "text-[#00d4aa]"
                            : "text-red-400"
                        }`}
                      >
                        {isCredit ? "+" : "-"}
                        {tx.amount} TIME
                      </div>
                      <div
                        className={`text-xs ${
                          tx.status === "completed"
                            ? "text-[#00d4aa]"
                            : "text-yellow-500"
                        }`}
                      >
                        {tx.status}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Comics footer */}
        <div className="text-center pt-4">
          <span className="font-bangers text-[#00d4aa] text-xs tracking-wider opacity-40">
            ~ chaque minute compte ~
          </span>
        </div>
      </main>
    </div>
  );
}
