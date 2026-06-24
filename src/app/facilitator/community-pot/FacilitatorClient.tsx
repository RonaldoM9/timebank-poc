"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  AlertTriangle,
  HeartHandshake,
  FileText,
  Sparkles,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import type { FacilitatorDashboardData, RequestWithDetails, PotTransactionWithDetails } from "@/lib/facilitator";
import { approveCommunityPotRequest, rejectCommunityPotRequest } from "./actions";
import { verifySolidarityMission, rejectSolidarityMission } from "@/app/services/solidarity-actions";
import SolidarityBadge, { SOLIDARITY_CATEGORY_LABELS } from "@/components/SolidarityBadge";
import ConnectedHeader from "@/components/ConnectedHeader";

type KpiFilter = "balance" | "donations" | "fundings" | "requests" | "missions" | null;

type Props = {
  user: { id: string; name: string; role: string };
  dashboard: FacilitatorDashboardData;
  requests: RequestWithDetails[];
  transactions: PotTransactionWithDetails[];
};

export default function FacilitatorClient({ user, dashboard, requests, transactions }: Props) {
  const [pendingRequests, setPendingRequests] = useState(
    requests.filter((r) => r.status === "PENDING")
  );
  const [historyRequests, setHistoryRequests] = useState(
    requests.filter((r) => r.status !== "PENDING")
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [decisionModal, setDecisionModal] = useState<{
    action: "approve" | "reject";
    requestId: string;
  } | null>(null);
  const [decisionNote, setDecisionNote] = useState("");
  const [activeKpi, setActiveKpi] = useState<KpiFilter>(null);

  async function handleAction(requestId: string, action: "approve" | "reject", note?: string) {
    setActionLoading(requestId);
    setError(null);
    setSuccess(null);

    const fn = action === "approve" ? approveCommunityPotRequest : rejectCommunityPotRequest;
    const result = await fn(requestId, note || undefined);

    if (!result.success) {
      setError(result.error);
    } else {
      const done = pendingRequests.find((r) => r.id === requestId);
      if (done) {
        const updated = {
          ...done,
          status: action === "approve" ? "APPROVED" : "REJECTED",
          decidedAt: new Date(),
          decidedByName: user.name,
          decisionNote: note || null,
        };
        setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
        setHistoryRequests((prev) => [updated, ...prev]);
      }
      setSuccess(
        action === "approve"
          ? "✅ Demande approuvée avec succès !"
          : "✅ Demande refusée."
      );
      setTimeout(() => setSuccess(null), 3000);
    }
    setActionLoading(null);
  }

  function confirmAction(action: "approve" | "reject", requestId: string) {
    setDecisionModal({ action, requestId });
    setDecisionNote("");
  }

  async function submitDecision() {
    if (!decisionModal) return;
    await handleAction(
      decisionModal.requestId,
      decisionModal.action,
      decisionNote || undefined
    );
    setDecisionModal(null);
  }

  function scrollTo(id: string) {
    setActiveKpi(null);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  const kpiCards = [
    {
      key: "balance" as KpiFilter,
      label: "Solde du pot",
      value: `${dashboard.potBalance} TIME`,
      icon: <HeartHandshake className="w-4 h-4 text-tb-accent" />,
      color: "text-tb-accent",
      onClick: () => setActiveKpi(activeKpi === "balance" ? null : "balance"),
      desc: "Voir les transactions du pot",
    },
    {
      key: "donations" as KpiFilter,
      label: "Dons (mois)",
      value: String(dashboard.donationsThisMonth),
      icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
      color: "text-emerald-400",
      onClick: () => setActiveKpi(activeKpi === "donations" ? null : "donations"),
      desc: "Voir les dons reçus",
    },
    {
      key: "fundings" as KpiFilter,
      label: "TIME utilisés",
      value: `${dashboard.fundingsThisMonth} TIME`,
      icon: <TrendingDown className="w-4 h-4 text-amber-400" />,
      color: "text-amber-400",
      onClick: () => setActiveKpi(activeKpi === "fundings" ? null : "fundings"),
      desc: "Voir les financements accordés",
    },
    {
      key: "requests" as KpiFilter,
      label: "Demandes",
      value: `${dashboard.pendingRequests} en attente`,
      icon: <Clock className="w-4 h-4 text-blue-400" />,
      color: "text-blue-400",
      onClick: () => scrollTo("demandes-en-attente"),
      desc: "Voir les demandes en attente",
    },
    {
      key: "missions" as KpiFilter,
      label: "Missions financées",
      value: String(dashboard.fundedMissions),
      icon: <Users className="w-4 h-4 text-purple-400" />,
      color: "text-purple-400",
      onClick: () => window.location.href = "/bookings",
      desc: "Voir les réservations",
    },
  ];

  const filteredTransactions = activeKpi === "balance"
    ? transactions
    : activeKpi === "donations"
    ? transactions.filter((t) => t.type === "DONATION")
    : activeKpi === "fundings"
    ? transactions.filter((t) => t.type === "FUNDING")
    : [];

  const showTransactions = activeKpi === "balance" || activeKpi === "donations" || activeKpi === "fundings";

  return (
    <>
    <ConnectedHeader />
    <div className="text-tb-text-primary">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <ShieldCheck className="w-8 h-8 text-tb-accent" />
          <div>
            <h1 className="text-2xl font-bold">Espace Facilitateur</h1>
            <p className="text-tb-text-secondary text-sm">
              {user.role === "ADMIN" ? "Administrateur" : "Gardien des TIME"} · Gestion du pot commun
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-700 border border-red-600 text-white text-sm font-medium shadow-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-700 border border-emerald-600 text-white text-sm font-medium shadow-lg">
            {success}
          </div>
        )}

        {/* A. Summary Cards - all clickable */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {kpiCards.map((kpi) => (
            <button
              key={kpi.key}
              onClick={kpi.onClick}
              className={`rounded-2xl bg-tb-surface border p-4 text-left transition-all ${
                activeKpi === kpi.key
                  ? "border-tb-accent ring-1 ring-tb-accent/40"
                  : "border-tb-border hover:bg-tb-surface-hover hover:border-tb-text-muted"
              }`}
            >
              <div className="flex items-center gap-2 text-tb-text-secondary text-xs mb-2">
                {kpi.icon}
                {kpi.label}
              </div>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              <p className="text-[10px] text-tb-text-muted mt-1">{kpi.desc}</p>
            </button>
          ))}
          {/* Open collective missions */}
          <a
            href="/collective-missions"
            className="rounded-2xl bg-tb-surface border border-tb-border p-4 hover:bg-tb-surface-hover transition block"
          >
            <div className="flex items-center gap-2 text-tb-text-secondary text-xs mb-2">
              <Users className="w-4 h-4 text-teal-400" />
              Collectives
            </div>
            <p className="text-2xl font-bold text-teal-400">{dashboard.openCollectiveMissions}</p>
            <p className="text-[10px] text-tb-text-muted mt-1">Voir les missions collectives</p>
          </a>
        </div>

        {/* Transactions detail panel */}
        {showTransactions && (
          <section id="pot-transactions" className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-tb-accent" />
              Transactions du pot
              {activeKpi === "donations" && (
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                  Dons uniquement
                </span>
              )}
              {activeKpi === "fundings" && (
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
                  Financements uniquement
                </span>
              )}
              <button
                onClick={() => setActiveKpi(null)}
                className="ml-auto text-xs text-tb-text-muted hover:text-tb-text-secondary transition"
              >
                ✕ Fermer
              </button>
            </h2>

            {filteredTransactions.length === 0 ? (
              <div className="rounded-2xl bg-tb-surface border border-tb-border p-8 text-center text-tb-text-secondary">
                <Banknote className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Aucune transaction trouvée.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="rounded-2xl bg-tb-surface border border-tb-border p-4 flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`mt-0.5 ${
                        tx.type === "DONATION" ? "text-emerald-400" : "text-amber-400"
                      }`}>
                        {tx.type === "DONATION" ? (
                          <ArrowUpRight className="w-5 h-5" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            tx.type === "DONATION"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}>
                            {tx.type === "DONATION" ? "Don" : "Financement"}
                          </span>
                          <span className="font-medium">{tx.userName || "Système"}</span>
                          {tx.bookingId && (
                            <a
                              href={`/bookings/${tx.bookingId}`}
                              className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Voir la mission
                            </a>
                          )}
                        </div>
                        {tx.reason && (
                          <p className="text-sm text-tb-text-secondary mt-0.5">{tx.reason}</p>
                        )}
                        <p className="text-xs text-tb-text-muted mt-0.5">
                          {new Date(tx.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <span className={`font-bold text-lg shrink-0 ${
                      tx.type === "DONATION" ? "text-emerald-400" : "text-amber-400"
                    }`}>
                      {tx.type === "DONATION" ? "+" : "-"}{tx.amount} TIME
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* B. Pending Requests */}
        <section id="demandes-en-attente" className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Demandes en attente
            {pendingRequests.length > 0 && (
              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </h2>

          {pendingRequests.length === 0 ? (
            <div className="rounded-2xl bg-tb-surface border border-tb-border p-8 text-center text-tb-text-secondary">
              <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-500/50" />
              <p>Aucune demande en attente.</p>
              <p className="text-xs mt-1">Les nouvelles demandes apparaîtront ici.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-2xl bg-tb-surface border border-tb-border p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-medium">{req.userName}</span>
                        <span className="text-tb-accent font-bold">{req.amount} TIME</span>
                        {req.bookingId && (
                          <a
                            href={`/bookings/${req.bookingId}`}
                            className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Voir la mission
                          </a>
                        )}
                      </div>
                      {req.reason && (
                        <p className="text-sm text-tb-text-secondary">
                          <span className="text-tb-text-primary">Raison :</span> {req.reason}
                        </p>
                      )}
                      {req.message && (
                        <p className="text-sm text-tb-text-secondary mt-1">
                          <span className="text-tb-text-primary">Message :</span> {req.message}
                        </p>
                      )}
                      {/* Solidarity info */}
                      {req.solidarityStatus && req.solidarityStatus !== "CLASSIC" && (
                        <div className="mt-2 pt-2 border-t border-tb-border space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-teal-400" />
                            <SolidarityBadge status={req.solidarityStatus} showRejected />
                          </div>
                          {req.solidarityCategory && (
                            <p className="text-xs text-tb-text-secondary">
                              Catégorie : {SOLIDARITY_CATEGORY_LABELS[req.solidarityCategory] || req.solidarityCategory}
                            </p>
                          )}
                          {req.solidarityReason && (
                            <p className="text-xs text-tb-text-secondary">
                              Justification : {req.solidarityReason}
                            </p>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-tb-text-secondary mt-1">
                        {new Date(req.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => confirmAction("approve", req.id)}
                        disabled={actionLoading === req.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition text-sm disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Valider
                      </button>
                      <button
                        onClick={() => confirmAction("reject", req.id)}
                        disabled={actionLoading === req.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition text-sm disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Refuser
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* C. History */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-tb-text-secondary" />
            Historique des décisions
          </h2>

          {historyRequests.length === 0 ? (
            <div className="rounded-2xl bg-tb-surface border border-tb-border p-8 text-center text-tb-text-secondary">
              <p>Aucune décision pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {historyRequests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-2xl bg-tb-surface border border-tb-border p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`
                          text-xs font-medium px-2 py-0.5 rounded-full
                          ${req.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}
                        `}>
                          {req.status === "APPROVED" ? "Approuvée" : "Refusée"}
                        </span>
                        <span className="font-medium">{req.userName}</span>
                        <span className="text-tb-text-secondary">{req.amount} TIME</span>
                      </div>
                      {req.reason && (
                        <p className="text-sm text-tb-text-secondary">Raison : {req.reason}</p>
                      )}
                      {req.solidarityStatus && req.solidarityStatus !== "CLASSIC" && (
                        <div className="mt-1 flex items-center gap-1.5">
                          <SolidarityBadge status={req.solidarityStatus} showRejected />
                          {req.solidarityCategory && (
                            <span className="text-[10px] text-tb-text-muted">
                              · {SOLIDARITY_CATEGORY_LABELS[req.solidarityCategory] || req.solidarityCategory}
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-tb-text-secondary mt-1">
                        {new Date(req.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {req.decidedByName && (
                          <> · Par {req.decidedByName}</>
                        )}
                        {req.decisionNote && (
                          <> · Note : {req.decisionNote}</>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Decision Modal */}
      {decisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-tb-surface-elevated border border-tb-border rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-2">
              {decisionModal.action === "approve" ? "✅ Valider la demande" : "❌ Refuser la demande"}
            </h3>
            <p className="text-sm text-tb-text-secondary mb-4">
              {decisionModal.action === "approve"
                ? "Cette action débitera le pot commun et créera une transaction FUNDING."
                : "Cette action marquera la demande comme refusée sans débiter le pot."}
            </p>

            <div className="mb-4">
              <label className="text-sm text-tb-text-secondary block mb-1">
                Note de décision (optionnelle)
              </label>
              <textarea
                value={decisionNote}
                onChange={(e) => setDecisionNote(e.target.value)}
                placeholder="Pourquoi cette décision ?"
                rows={3}
                className="w-full rounded-xl bg-tb-surface border border-tb-border px-3 py-2 text-sm text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent transition resize-none"
              />
            </div>

            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setDecisionModal(null)}
                className="px-4 py-2 rounded-lg text-sm text-tb-text-secondary hover:text-tb-text-primary transition"
              >
                Annuler
              </button>
              <button
                onClick={submitDecision}
                disabled={actionLoading === decisionModal.requestId}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 ${
                  decisionModal.action === "approve"
                    ? "bg-emerald-600 text-white hover:bg-emerald-500"
                    : "bg-red-600 text-white hover:bg-red-500"
                }`}
              >
                {actionLoading === decisionModal.requestId
                  ? "Traitement..."
                  : decisionModal.action === "approve"
                  ? "✅ Valider"
                  : "❌ Refuser"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
