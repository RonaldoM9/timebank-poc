"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Gift,
} from "lucide-react";

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
}

const typeLabels: Record<string, string> = {
  mint: "Crédit de bienvenue",
  transfer: "Transfert",
  escrow: "Réservation en attente",
  release: "Service terminé",
  refund: "Remboursement",
};

export default function WalletClient({
  user,
  transactions,
}: {
  user: WalletUser;
  transactions: Transaction[];
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#262626]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-[#00d4aa]" />
            <span className="font-anton text-lg tracking-wide text-[#f5f5f5]">
              TimeBank
            </span>
          </div>
        </div>
      </header>

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

        {/* Donner du TIME button */}
        <Link
          href="/wallet/transfer"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#00d4aa] hover:bg-[#00b894] text-[#0a0a0a] font-bold text-sm px-4 py-3 transition-colors w-full"
        >
          <Gift className="w-4 h-4" />
          Donner du TIME
        </Link>

        {/* Transactions */}
        <div className="bg-[#111111] border border-[#262626] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#262626]">
            <h2 className="font-semibold text-[#f5f5f5]">
              Historique des transactions
            </h2>
          </div>

          {transactions.length === 0 ? (
            <div className="px-6 py-8 text-center text-[#5c5c5c] text-sm">
              Aucune transaction pour le moment
            </div>
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
