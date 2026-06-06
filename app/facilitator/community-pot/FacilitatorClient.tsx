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
} from "lucide-react";
import type { FacilitatorDashboardData, RequestWithDetails } from "@/lib/facilitator";
import { approveCommunityPotRequest, rejectCommunityPotRequest } from "./actions";

type Props = {
  user: { id: string; name: string; role: string };
  dashboard: FacilitatorDashboardData;
  requests: RequestWithDetails[];
};

export default function FacilitatorClient({ user, dashboard, requests }: Props) {
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

  async function handleAction(requestId: string, action: "approve" | "reject", note?: string) {
    setActionLoading(requestId);
    setError(null);
    setSuccess(null);

    const fn = action === "approve" ? approveCommunityPotRequest : rejectCommunityPotRequest;
    const result = await fn(requestId, note || undefined);

    if (!result.success) {
      setError(result.error);
    } else {
      // Move from pending to history
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

  return (
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
          <div className="mb-6 p-4 rounded-xl bg-red-900/30 border border-red-800/50 text-red-300 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-900/30 border border-emerald-800/50 text-emerald-300 text-sm">
            {success}
          </div>
        )}

        {/* A. Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {/* Pot Balance */}
          <div className="rounded-2xl bg-tb-surface border border-tb-border p-4">
            <div className="flex items-center gap-2 text-tb-text-secondary text-xs mb-2">
              <HeartHandshake className="w-4 h-4 text-tb-accent" />
              Solde du pot
            </div>
            <p className="text-2xl font-bold">{dashboard.potBalance} TIME</p>
          </div>
          {/* Donations this month */}
          <div className="rounded-2xl bg-tb-surface border border-tb-border p-4">
            <div className="flex items-center gap-2 text-tb-text-secondary text-xs mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Dons (mois)
            </div>
            <p className="text-2xl font-bold">{dashboard.donationsThisMonth}</p>
          </div>
          {/* Fundings this month */}
          <div className="rounded-2xl bg-tb-surface border border-tb-border p-4">
            <div className="flex items-center gap-2 text-tb-text-secondary text-xs mb-2">
              <TrendingDown className="w-4 h-4 text-amber-400" />
              TIME utilisés
            </div>
            <p className="text-2xl font-bold">{dashboard.fundingsThisMonth} TIME</p>
          </div>
          {/* Pending requests */}
          <div className="rounded-2xl bg-tb-surface border border-tb-border p-4">
            <div className="flex items-center gap-2 text-tb-text-secondary text-xs mb-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Demandes
            </div>
            <p className="text-2xl font-bold">
              {dashboard.pendingRequests}
              {dashboard.pendingRequests > 0 && (
                <span className="text-xs ml-1 text-blue-400">en attente</span>
              )}
            </p>
          </div>
          {/* Funded missions */}
          <div className="rounded-2xl bg-tb-surface border border-tb-border p-4">
            <div className="flex items-center gap-2 text-tb-text-secondary text-xs mb-2">
              <Users className="w-4 h-4 text-purple-400" />
              Missions
            </div>
            <p className="text-2xl font-bold">{dashboard.fundedMissions}</p>
          </div>
        </div>

        {/* B. Pending Requests */}
        <section className="mb-8">
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
  );
}
