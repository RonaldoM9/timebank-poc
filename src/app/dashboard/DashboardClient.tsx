"use client";

import Link from "next/link";
import ConnectedHeader from "@/components/ConnectedHeader";

interface Tx {
  id: string;
  type: string;
  amount: number;
  createdAt: string;
}

interface Props {
  user: { id: string; name: string; timeBalance: number; city: string | null };
  pendingCount: number;
  recentTransactions: Tx[];
  serviceCount: number;
  walletBalance: number;
}

const TX_LABEL: Record<string, string> = {
  escrow: "📅 Réservation",
  release: "✅ Mission terminée",
  refund: "↩️ Remboursement",
};

export default function DashboardClient({
  user,
  pendingCount,
  recentTransactions,
  serviceCount,
  walletBalance,
}: Props) {
  return (
    <>
      <ConnectedHeader />

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* ─── GREETING + BALANCE ─── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-tb-text-primary">
              Bonjour {user.name} 👋
            </h1>
            <p className="text-sm text-tb-text-secondary mt-0.5">
              Qu&apos;est-ce que tu veux faire aujourd&apos;hui&nbsp;?
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user.city && (
              <span className="hidden sm:inline text-xs text-tb-text-muted">
                📍 {user.city}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 bg-tb-accent-soft text-tb-accent-dark font-bold px-3.5 py-1.5 rounded-full text-sm">
              ⏱️ {user.timeBalance} TIME
            </span>
          </div>
        </div>

        {/* ─── 2 BIG BUTTONS ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/services"
            className="group bg-gradient-to-br from-tb-accent to-[#1a8f6a] rounded-2xl p-6 sm:p-8 text-white hover:shadow-lg hover:shadow-tb-accent/20 hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="text-3xl mb-3">🔍</div>
            <h2 className="text-lg sm:text-xl font-bold">Trouver de l&apos;aide</h2>
            <p className="text-sm text-white/75 mt-1 leading-relaxed">
              Parcours les missions près de chez toi et réserve avec tes TIME
            </p>
            <span className="inline-block mt-3 text-xs font-bold bg-white/20 text-white px-3 py-1 rounded-full">
              {serviceCount > 0
                ? `${serviceCount} mission${serviceCount > 1 ? "s" : ""} disponible${serviceCount > 1 ? "s" : ""}`
                : "Explorer →"}
            </span>
          </Link>

          <Link
            href="/services/new"
            className="group bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="text-3xl mb-3">🤝</div>
            <h2 className="text-lg sm:text-xl font-bold">Proposer mon temps</h2>
            <p className="text-sm text-white/75 mt-1 leading-relaxed">
              Partage tes compétences avec ta communauté et gagne des TIME
            </p>
            <span className="inline-block mt-3 text-xs font-bold bg-white/20 text-white px-3 py-1 rounded-full">
              +1 TIME / heure
            </span>
          </Link>
        </div>

        {/* ─── MINI CARDS ROW ─── */}
        <div className="flex flex-wrap gap-2">
          {pendingCount > 0 && (
            <Link
              href="/bookings"
              className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-amber-800 hover:bg-amber-100 transition-colors"
            >
              <span>📩</span>
              <span>
                {pendingCount} demande{pendingCount > 1 ? "s" : ""} en attente
              </span>
            </Link>
          )}
          <Link
            href="/wallet"
            className="flex items-center gap-2 bg-tb-surface border border-tb-border rounded-xl px-3.5 py-2.5 text-sm font-medium text-tb-text-primary hover:bg-tb-bg/50 transition-colors"
          >
            <span>👛</span>
            <span>Mon wallet — {walletBalance} TIME</span>
          </Link>
        </div>

        {/* ─── ACTIVITÉ RÉCENTE ─── */}
        {recentTransactions.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-tb-text-muted mb-2">
              Activité récente
            </h3>
            <div className="bg-tb-surface border border-tb-border rounded-xl divide-y divide-tb-border overflow-hidden">
              {recentTransactions.map((tx) => {
                const isCredit = tx.type !== "escrow";
                const ago = getTimeAgo(tx.createdAt);
                return (
                  <Link
                    key={tx.id}
                    href="/wallet"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-tb-bg/50 transition-colors group"
                  >
                    <span className="text-base">
                      {TX_LABEL[tx.type]?.split(" ")[0] || "📄"}
                    </span>
                    <span className="flex-1 text-sm text-tb-text-primary">
                      {TX_LABEL[tx.type] || tx.type}
                    </span>
                    <span className="text-xs text-tb-text-muted">{ago}</span>
                    <span
                      className={`text-sm font-bold ${
                        isCredit ? "text-tb-accent" : "text-rose-500"
                      }`}
                    >
                      {isCredit ? "+" : "-"}
                      {tx.amount} TIME
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── EMPTY STATE ─── */}
        {pendingCount === 0 && recentTransactions.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto rounded-full bg-tb-accent-soft flex items-center justify-center mb-4">
              <span className="text-2xl">✨</span>
            </div>
            <h3 className="text-lg font-bold text-tb-text-primary">
              Bienvenue sur TimeHeroes&nbsp;!
            </h3>
            <p className="text-sm text-tb-text-secondary mt-2 max-w-sm mx-auto">
              Commence par proposer ton premier service ou explore les missions
              disponibles.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <Link
                href="/services/new"
                className="inline-flex items-center gap-2 bg-tb-accent hover:bg-tb-accent-hover text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                + Proposer mon temps
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 border border-tb-border hover:border-tb-accent text-tb-text-secondary hover:text-tb-accent text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                🔍 Explorer
              </Link>
            </div>
          </div>
        )}

        <div className="text-center pt-1 pb-4">
          <span className="text-tb-accent text-xs tracking-wider opacity-30 font-semibold">
            ~ chaque heure donnée est un TIME gagné ~
          </span>
        </div>
      </main>
    </>
  );
}

function getTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `il y a ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `il y a ${days}j`;
}
