"use client";

import { useState, useCallback } from "react";
import {
  ShieldCheck,
  Activity,
  AlertTriangle,
  Users,
  UserCheck,
  Clock,
  HeartHandshake,
  ArrowUpDown,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  XCircle,
  FileText,
  Sparkles,
  AlertCircle,
  UserX,
  Timer,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import ConnectedHeader from "@/components/ConnectedHeader";
import { resolveAlertAction, dismissAlertAction, addFacilitatorNoteAction, refreshNetworkAlertsAction } from "./actions";
import type {
  NetworkDashboard,
  BlockedRequestItem,
  OverusedHero,
  UnderusedHero,
  DormantTimeUser,
  NetworkAlert,
} from "@/lib/facilitator-network";

type Props = {
  user: { id: string; name: string; role: string };
  initialDashboard: NetworkDashboard;
};

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "text-red-400 bg-red-500/20 border-red-500/30",
  HIGH: "text-orange-400 bg-orange-500/20 border-orange-500/30",
  MEDIUM: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
  LOW: "text-blue-400 bg-blue-500/20 border-blue-500/30",
};

const TABS = [
  { id: "blocked", label: "Demandes bloquées", icon: AlertTriangle },
  { id: "overused", label: "Heroes à protéger", icon: Users },
  { id: "underused", label: "Heroes à activer", icon: UserCheck },
  { id: "dormant", label: "TIME dormants", icon: Timer },
  { id: "alerts", label: "Alertes", icon: AlertCircle },
] as const;

export default function NetworkClient({ user, initialDashboard }: Props) {
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [activeTab, setActiveTab] = useState<string>("blocked");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Alert action modal
  const [alertModal, setAlertModal] = useState<{
    action: "resolve" | "dismiss";
    alertId: string;
  } | null>(null);
  const [alertNote, setAlertNote] = useState("");

  // Note modal
  const [noteModal, setNoteModal] = useState<{
    entityType: string;
    entityId: string;
    entityLabel: string;
  } | null>(null);
  const [noteContent, setNoteContent] = useState("");

  const showError = useCallback((msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 4000);
  }, []);

  const showSuccess = useCallback((msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  }, []);

  async function handleRefresh() {
    setLoading("refresh");
    setError(null);

    const result = await refreshNetworkAlertsAction();
    if (!result.success) {
      showError(result.error);
    } else {
      // Reload full dashboard
      const { getFacilitatorNetworkDashboard } = await import("@/lib/facilitator-network");
      // Can't call server function directly from client — reload via action
      const { getNetworkDashboardAction } = await import("./actions");
      const dashResult = await getNetworkDashboardAction();
      if (dashResult.success && dashResult.data) {
        setDashboard(dashResult.data as NetworkDashboard);
      }
      showSuccess(`✅ ${(result.data as any)?.created ?? 0} nouvelles alertes générées`);
    }
    setLoading(null);
  }

  async function handleAlertAction(action: "resolve" | "dismiss") {
    if (!alertModal) return;
    setLoading(alertModal.alertId);
    setError(null);

    const fn = action === "resolve" ? resolveAlertAction : dismissAlertAction;
    const result = await fn(alertModal.alertId, alertNote || undefined);

    if (!result.success) {
      showError(result.error);
    } else {
      // Update local state
      setDashboard((prev) => ({
        ...prev,
        alerts: prev.alerts.map((a) =>
          a.id === alertModal.alertId
            ? { ...a, status: action === "resolve" ? "RESOLVED" : "DISMISSED", resolutionNote: alertNote || null }
            : a
        ),
      }));
      showSuccess(action === "resolve" ? "✅ Alerte résolue" : "✅ Alerte ignorée");
    }

    setAlertModal(null);
    setAlertNote("");
    setLoading(null);
  }

  async function handleAddNote() {
    if (!noteModal || !noteContent.trim()) return;
    setLoading("note");
    setError(null);

    const result = await addFacilitatorNoteAction(noteModal.entityType, noteModal.entityId, noteContent);
    if (!result.success) {
      showError(result.error);
    } else {
      showSuccess("✅ Note ajoutée");
      setNoteContent("");
    }

    setNoteModal(null);
    setLoading(null);
  }

  const hs = dashboard.healthStats;

  // ─── Severity badge ──────────────────────────────────────────────────
  function SeverityBadge({ severity }: { severity: string }) {
    const colors = SEVERITY_COLORS[severity] || SEVERITY_COLORS.LOW;
    return (
      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${colors}`}>
        {severity}
      </span>
    );
  }

  // ─── Age display ─────────────────────────────────────────────────────
  function AgeDisplay({ hours }: { hours: number }) {
    if (hours < 24) return <span>{Math.round(hours)}h</span>;
    const days = Math.round(hours / 24);
    return <span>{days}j {Math.round(hours % 24)}h</span>;
  }

  // ─── Status badge ────────────────────────────────────────────────────
  function AlertStatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
      OPEN: "bg-blue-500/20 text-blue-400",
      RESOLVED: "bg-emerald-500/20 text-emerald-400",
      DISMISSED: "bg-gray-500/20 text-gray-400",
    };
    const labels: Record<string, string> = {
      OPEN: "Ouverte",
      RESOLVED: "Résolue",
      DISMISSED: "Ignorée",
    };
    return (
      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${colors[status] || colors.OPEN}`}>
        {labels[status] || status}
      </span>
    );
  }

  return (
    <>
      <ConnectedHeader />
      <div className="text-tb-text-primary">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* ── Header ──────────────────────────────────────────────── */}
          <div className="flex items-start justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-tb-accent" />
              <div>
                <h1 className="text-2xl font-bold">Intelligence réseau</h1>
                <p className="text-tb-text-secondary text-sm">
                  Pilotez la santé de la communauté, les demandes bloquées et la circulation des TIME.
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading === "refresh"}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-tb-accent/20 text-tb-accent hover:bg-tb-accent/30 transition text-sm disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${loading === "refresh" ? "animate-spin" : ""}`} />
              Rafraîchir
            </button>
          </div>

          {/* ── Error / Success ──────────────────────────────────────── */}
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

          {/* ── KPI Grid (Bloc 1) ────────────────────────────────────── */}
          <div className="mb-8">
            <p className="text-xs text-tb-text-muted mb-3">
              Ce score mesure la capacité de la communauté à répondre, échanger et faire circuler les TIME.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Health Score */}
              <div className="rounded-2xl bg-tb-surface border border-tb-border p-4">
                <div className="flex items-center gap-2 text-tb-text-secondary text-xs mb-2">
                  <Activity className="w-4 h-4 text-tb-accent" />
                  Score santé réseau
                </div>
                <p className="text-2xl font-bold">
                  {hs.networkHealthScore}
                  <span className="text-sm ml-1 text-tb-text-muted">/100</span>
                </p>
              </div>
              {/* Blocked requests */}
              <div className="rounded-2xl bg-tb-surface border border-tb-border p-4">
                <div className="flex items-center gap-2 text-tb-text-secondary text-xs mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  Demandes bloquées
                </div>
                <p className="text-2xl font-bold">{hs.blockedRequestsCount}</p>
              </div>
              {/* Overused heroes */}
              <div className="rounded-2xl bg-tb-surface border border-tb-border p-4">
                <div className="flex items-center gap-2 text-tb-text-secondary text-xs mb-2">
                  <Users className="w-4 h-4 text-orange-400" />
                  Heroes sur-sollicités
                </div>
                <p className="text-2xl font-bold">{hs.overusedHeroesCount}</p>
              </div>
              {/* Underused heroes */}
              <div className="rounded-2xl bg-tb-surface border border-tb-border p-4">
                <div className="flex items-center gap-2 text-tb-text-secondary text-xs mb-2">
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  Heroes sous-utilisés
                </div>
                <p className="text-2xl font-bold">{hs.underusedHeroesCount}</p>
              </div>
              {/* Dormant time */}
              <div className="rounded-2xl bg-tb-surface border border-tb-border p-4">
                <div className="flex items-center gap-2 text-tb-text-secondary text-xs mb-2">
                  <Timer className="w-4 h-4 text-purple-400" />
                  TIME dormants
                </div>
                <p className="text-2xl font-bold">{hs.dormantTimeUsersCount}</p>
              </div>
              {/* Reciprocity */}
              <div className="rounded-2xl bg-tb-surface border border-tb-border p-4">
                <div className="flex items-center gap-2 text-tb-text-secondary text-xs mb-2">
                  <ArrowUpDown className="w-4 h-4 text-emerald-400" />
                  Réciprocité
                </div>
                <p className="text-2xl font-bold">
                  {hs.reciprocityPercent}
                  <span className="text-sm ml-1 text-tb-text-muted">%</span>
                </p>
              </div>
              {/* Avg response time */}
              <div className="rounded-2xl bg-tb-surface border border-tb-border p-4">
                <div className="flex items-center gap-2 text-tb-text-secondary text-xs mb-2">
                  <Clock className="w-4 h-4 text-teal-400" />
                  Délai moyen réponse
                </div>
                <p className="text-2xl font-bold">
                  {hs.averageResponseTimeHours !== null
                    ? `${hs.averageResponseTimeHours}h`
                    : "—"}
                </p>
              </div>
              {/* Critical alerts */}
              <div className="rounded-2xl bg-tb-surface border border-tb-border p-4">
                <div className="flex items-center gap-2 text-tb-text-secondary text-xs mb-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  Alertes critiques
                </div>
                <p className="text-2xl font-bold">{hs.criticalAlertsCount}</p>
              </div>
            </div>
          </div>

          {/* ── Tabs ──────────────────────────────────────────────────── */}
          <div className="flex items-center gap-1 border-b border-tb-border mb-6 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const tabCount =
                tab.id === "blocked" ? dashboard.blockedRequests.length
                : tab.id === "overused" ? dashboard.overusedHeroes.length
                : tab.id === "underused" ? dashboard.underusedHeroes.length
                : tab.id === "dormant" ? dashboard.dormantTimeUsers.length
                : dashboard.alerts.filter((a) => a.status === "OPEN").length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-tb-accent text-tb-text-primary"
                      : "border-transparent text-tb-text-secondary hover:text-tb-text-primary"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tabCount > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.id ? "bg-tb-accent/20 text-tb-accent" : "bg-tb-surface-elevated text-tb-text-muted"
                    }`}>
                      {tabCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Tab Content ────────────────────────────────────────────── */}

          {/* ── Tab: Demandes bloquées (Bloc 2) ────────────────────────── */}
          {activeTab === "blocked" && (
            <section>
              <p className="text-xs text-tb-text-muted mb-4">
                Ces demandes nécessitent peut-être une intervention humaine pour trouver le bon Hero.
              </p>
              {dashboard.blockedRequests.length === 0 ? (
                <div className="rounded-2xl bg-tb-surface border border-tb-border p-8 text-center text-tb-text-secondary">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-500/50" />
                  <p>Aucune demande bloquée.</p>
                  <p className="text-xs mt-1">Tout est fluide sur le réseau.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {dashboard.blockedRequests.map((item, idx) => (
                    <div key={idx} className="rounded-2xl bg-tb-surface border border-tb-border p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <SeverityBadge severity={item.severity} />
                            <span className="text-xs text-tb-text-muted uppercase">{item.type}</span>
                            <span className="text-xs text-tb-text-muted">
                              <AgeDisplay hours={item.ageHours} />
                            </span>
                          </div>
                          <p className="font-medium">{item.title}</p>
                          {item.city && (
                            <p className="text-xs text-tb-text-secondary mt-0.5">📍 {item.city}</p>
                          )}
                          <p className="text-xs text-tb-text-muted mt-1">
                            Statut : {item.status} · Sévérité : {item.severity}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <a
                            href={item.link}
                            className="flex items-center gap-1 text-xs text-blue-400 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Voir
                          </a>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-tb-border">
                        <p className="text-xs text-tb-text-secondary">
                          <span className="text-tb-text-primary">Action :</span> {item.recommendedAction}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── Tab: Heroes à protéger (Bloc 3) ────────────────────────── */}
          {activeTab === "overused" && (
            <section>
              <p className="text-xs text-tb-text-muted mb-4">
                Ces membres donnent beaucoup. Pensez à les préserver pour éviter l'épuisement.
              </p>
              {dashboard.overusedHeroes.length === 0 ? (
                <div className="rounded-2xl bg-tb-surface border border-tb-border p-8 text-center text-tb-text-secondary">
                  <Users className="w-10 h-10 mx-auto mb-2 text-emerald-500/50" />
                  <p>Aucun Hero sur-sollicité.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {dashboard.overusedHeroes.map((hero) => (
                    <div key={hero.userId} className="rounded-2xl bg-tb-surface border border-tb-border p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{hero.name}</span>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${
                              hero.risk === "HIGH" ? "text-red-400 bg-red-500/20 border-red-500/30"
                              : hero.risk === "MEDIUM" ? "text-yellow-400 bg-yellow-500/20 border-yellow-500/30"
                              : "text-blue-400 bg-blue-500/20 border-blue-500/30"
                            }`}>
                              {hero.risk}
                            </span>
                            <span className="text-xs text-tb-text-muted">Score: {hero.overuseScore}</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs">
                            <div className="bg-tb-bg/50 rounded-lg p-2">
                              <span className="text-tb-text-muted">Missions 30j</span>
                              <p className="font-bold">{hero.missions30d}</p>
                            </div>
                            <div className="bg-tb-bg/50 rounded-lg p-2">
                              <span className="text-tb-text-muted">Heures données</span>
                              <p className="font-bold">{hero.hoursGiven}h</p>
                            </div>
                            <div className="bg-tb-bg/50 rounded-lg p-2">
                              <span className="text-tb-text-muted">Bookings pending</span>
                              <p className="font-bold">{hero.pendingCount}</p>
                            </div>
                            <div className="bg-tb-bg/50 rounded-lg p-2">
                              <span className="text-tb-text-muted">Solde TIME</span>
                              <p className="font-bold">{hero.timeBalance}</p>
                            </div>
                          </div>
                          <p className="text-xs text-tb-text-secondary mt-2">
                            <span className="text-tb-text-primary">Recommandation :</span> {hero.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── Tab: Heroes à activer (Bloc 4) ─────────────────────────── */}
          {activeTab === "underused" && (
            <section>
              <p className="text-xs text-tb-text-muted mb-4">
                Ces membres ont des compétences disponibles mais sont peu mobilisés.
              </p>
              {dashboard.underusedHeroes.length === 0 ? (
                <div className="rounded-2xl bg-tb-surface border border-tb-border p-8 text-center text-tb-text-secondary">
                  <UserCheck className="w-10 h-10 mx-auto mb-2 text-emerald-500/50" />
                  <p>Aucun Hero sous-utilisé.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {dashboard.underusedHeroes.map((hero) => (
                    <div key={hero.userId} className="rounded-2xl bg-tb-surface border border-tb-border p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{hero.name}</span>
                            {hero.city && (
                              <span className="text-xs text-tb-text-muted">📍 {hero.city}</span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs">
                            <div className="bg-tb-bg/50 rounded-lg p-2">
                              <span className="text-tb-text-muted">Compétences</span>
                              <p className="font-bold truncate">{hero.skills || "—"}</p>
                            </div>
                            <div className="bg-tb-bg/50 rounded-lg p-2">
                              <span className="text-tb-text-muted">Services actifs</span>
                              <p className="font-bold">{hero.activeServices}</p>
                            </div>
                            <div className="bg-tb-bg/50 rounded-lg p-2">
                              <span className="text-tb-text-muted">Passport</span>
                              <p className="font-bold">{hero.passportCompletion}%</p>
                            </div>
                            <div className="bg-tb-bg/50 rounded-lg p-2">
                              <span className="text-tb-text-muted">Dernière activité</span>
                              <p className="font-bold">J-{hero.lastActivityDays}</p>
                            </div>
                          </div>
                          <p className="text-xs text-tb-text-secondary mt-2">
                            <span className="text-tb-text-primary">Recommandation :</span> {hero.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── Tab: TIME dormants (Bloc 5) ────────────────────────────── */}
          {activeTab === "dormant" && (
            <section>
              <p className="text-xs text-tb-text-muted mb-4">
                Ces TIME ne circulent plus. Le facilitateur peut encourager un don au pot commun ou suggérer une mission à recevoir.
              </p>
              {dashboard.dormantTimeUsers.length === 0 ? (
                <div className="rounded-2xl bg-tb-surface border border-tb-border p-8 text-center text-tb-text-secondary">
                  <Timer className="w-10 h-10 mx-auto mb-2 text-emerald-500/50" />
                  <p>Aucun TIME dormant.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {dashboard.dormantTimeUsers.map((user) => (
                    <div key={user.userId} className="rounded-2xl bg-tb-surface border border-tb-border p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{user.name}</span>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${
                              user.status === "Strong" ? "text-orange-400 bg-orange-500/20 border-orange-500/30"
                              : user.status === "TimeRich" ? "text-purple-400 bg-purple-500/20 border-purple-500/30"
                              : user.status === "TimePoor" ? "text-red-400 bg-red-500/20 border-red-500/30"
                              : "text-blue-400 bg-blue-500/20 border-blue-500/30"
                            }`}>
                              {user.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-xs">
                            <div className="bg-tb-bg/50 rounded-lg p-2">
                              <span className="text-tb-text-muted">Solde</span>
                              <p className="font-bold">{user.balance} TIME</p>
                            </div>
                            <div className="bg-tb-bg/50 rounded-lg p-2">
                              <span className="text-tb-text-muted">Dernière dépense</span>
                              <p className="font-bold">
                                {user.lastSpendDays !== null ? `J-${user.lastSpendDays}` : "Jamais"}
                              </p>
                            </div>
                            <div className="bg-tb-bg/50 rounded-lg p-2">
                              <span className="text-tb-text-muted">TIME donnés au pot</span>
                              <p className="font-bold">{user.potDonations}</p>
                            </div>
                          </div>
                          <p className="text-xs text-tb-text-secondary mt-2">
                            <span className="text-tb-text-primary">Suggestion :</span> {user.suggestion}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── Tab: Alertes (Bloc 6) ──────────────────────────────────── */}
          {activeTab === "alerts" && (
            <section>
              <p className="text-xs text-tb-text-muted mb-4">
                Alertes réseau priorisées. Gérez-les rapidement pour maintenir la santé de la communauté.
              </p>
              {dashboard.alerts.length === 0 ? (
                <div className="rounded-2xl bg-tb-surface border border-tb-border p-8 text-center text-tb-text-secondary">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-500/50" />
                  <p>Aucune alerte.</p>
                  <p className="text-xs mt-1">Cliquez sur "Rafraîchir" pour générer les alertes.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {dashboard.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`rounded-2xl border p-4 ${
                        alert.status === "OPEN"
                          ? "bg-tb-surface border-tb-border"
                          : "bg-tb-surface/50 border-tb-border opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            {alert.status === "OPEN" && <SeverityBadge severity={alert.severity} />}
                            <AlertStatusBadge status={alert.status} />
                            <span className="text-xs text-tb-text-muted uppercase">{alert.type}</span>
                          </div>
                          <p className="font-medium">{alert.title}</p>
                          {alert.description && (
                            <p className="text-sm text-tb-text-secondary mt-1">{alert.description}</p>
                          )}
                          {alert.recommendedAction && (
                            <p className="text-xs text-tb-text-muted mt-1">
                              <span className="text-tb-text-primary">Action recommandée :</span> {alert.recommendedAction}
                            </p>
                          )}
                          {alert.resolutionNote && (
                            <p className="text-xs text-tb-text-muted mt-1">
                              <span className="text-tb-text-primary">Note de résolution :</span> {alert.resolutionNote}
                            </p>
                          )}
                          <p className="text-[10px] text-tb-text-muted mt-1">
                            {new Date(alert.createdAt).toLocaleDateString("fr-FR", {
                              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </div>

                        {/* Actions */}
                        {alert.status === "OPEN" && (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => setAlertModal({ action: "resolve", alertId: alert.id })}
                              disabled={loading === alert.id}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition text-xs disabled:opacity-50"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Résoudre
                            </button>
                            <button
                              onClick={() => setAlertModal({ action: "dismiss", alertId: alert.id })}
                              disabled={loading === alert.id}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 transition text-xs disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Ignorer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── Sous-scores de santé ────────────────────────────────────── */}
          <details className="mt-8 group">
            <summary className="text-sm text-tb-text-secondary cursor-pointer hover:text-tb-text-primary transition flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Détail du score santé réseau
            </summary>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: "Liquidité", score: hs.liquidityScore, weight: "25%" },
                { label: "Réponse", score: hs.responseScore, weight: "20%" },
                { label: "Réciprocité", score: hs.reciprocityScore, weight: "20%" },
                { label: "Activité", score: hs.activityScore, weight: "20%" },
                { label: "Sécurité", score: hs.safetyScore, weight: "15%" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-tb-surface border border-tb-border p-3">
                  <p className="text-xs text-tb-text-muted">{item.label}</p>
                  <p className="text-lg font-bold">{item.score}<span className="text-xs ml-0.5 text-tb-text-muted">/100</span></p>
                  <p className="text-[10px] text-tb-text-muted">Poids: {item.weight}</p>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>

      {/* ── Alert Action Modal ──────────────────────────────────────────── */}
      {alertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-tb-surface-elevated border border-tb-border rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-2">
              {alertModal.action === "resolve" ? "✅ Résoudre l'alerte" : "❌ Ignorer l'alerte"}
            </h3>
            <p className="text-sm text-tb-text-secondary mb-4">
              {alertModal.action === "resolve"
                ? "L'alerte sera marquée comme résolue et n'apparaîtra plus dans la liste des alertes ouvertes."
                : "L'alerte sera masquée. Vous pourrez toujours la retrouver dans l'historique."}
            </p>

            <div className="mb-4">
              <label className="text-sm text-tb-text-secondary block mb-1">
                Note (optionnelle)
              </label>
              <textarea
                value={alertNote}
                onChange={(e) => setAlertNote(e.target.value)}
                placeholder="Pourquoi cette décision ?"
                rows={3}
                maxLength={500}
                className="w-full rounded-xl bg-tb-surface border border-tb-border px-3 py-2 text-sm text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent transition resize-none"
              />
            </div>

            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => { setAlertModal(null); setAlertNote(""); }}
                className="px-4 py-2 rounded-lg text-sm text-tb-text-secondary hover:text-tb-text-primary transition"
              >
                Annuler
              </button>
              <button
                onClick={() => handleAlertAction(alertModal.action)}
                disabled={loading === alertModal.alertId}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 ${
                  alertModal.action === "resolve"
                    ? "bg-emerald-600 text-white hover:bg-emerald-500"
                    : "bg-gray-600 text-white hover:bg-gray-500"
                }`}
              >
                {loading === alertModal.alertId
                  ? "Traitement..."
                  : alertModal.action === "resolve"
                  ? "✅ Résoudre"
                  : "Ignorer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
