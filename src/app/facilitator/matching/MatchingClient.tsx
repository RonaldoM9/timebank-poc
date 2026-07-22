"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Sparkles,
  Users,
  HeartHandshake,
  History,
  RefreshCw,
  CheckCircle,
  XCircle,
  ExternalLink,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  Star,
  Clock,
  UserCheck,
  FileText,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Loader2,
  Eye,
} from "lucide-react";
import Link from "next/link";
import ConnectedHeader from "@/components/ConnectedHeader";
import {
  generateRecommendationsAction,
  getOpenUrgentRequestsAction,
  getOpenSolidarityMissionsAction,
  getOpenCollectiveMissionsAction,
  getRecommendationsAction,
  approveRecommendationAction,
  rejectRecommendationAction,
  addMatchFeedbackAction,
} from "./actions";
import type { ActionResult } from "./actions";

type User = { id: string; name: string; role: string };

type Props = {
  user: User;
};

type TabId = "urgent" | "solidarity" | "collective" | "history";

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: "urgent", label: "Demandes urgentes", icon: AlertTriangle },
  { id: "solidarity", label: "Missions solidaires", icon: HeartHandshake },
  { id: "collective", label: "Missions collectives", icon: Users },
  { id: "history", label: "Historique", icon: History },
];

// ─── Score label ────────────────────────────────────────────────────────────

function getScoreLabel(score: number): string {
  if (score >= 90) return "Très bon match";
  if (score >= 75) return "Bon match";
  if (score >= 60) return "Match possible";
  if (score >= 40) return "Match faible";
  return "Non recommandé";
}

function getScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-600 border-emerald-500/30 bg-emerald-50";
  if (score >= 75) return "text-green-600 border-green-500/30 bg-green-50";
  if (score >= 60) return "text-yellow-600 border-yellow-500/30 bg-yellow-50";
  if (score >= 40) return "text-orange-600 border-orange-500/30 bg-orange-50";
  return "text-red-600 border-red-500/30 bg-red-50";
}

// ─── Recomendation Card ─────────────────────────────────────────────────────

function RecommendationCard({
  rec,
  facilitatorId,
  onRefresh,
}: {
  rec: any;
  facilitatorId: string;
  onRefresh: () => void;
}) {
  const [note, setNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [feedbackResult, setFeedbackResult] = useState<string | null>(null);

  const reasons: string[] = rec.reasonsJson ? JSON.parse(rec.reasonsJson) : [];
  const risks: string[] = rec.risksJson ? JSON.parse(rec.risksJson) : [];
  const breakdown: Record<string, number> = rec.scoreBreakdownJson
    ? JSON.parse(rec.scoreBreakdownJson)
    : {};

  const label = getScoreLabel(rec.score);
  const scoreColor = getScoreColor(rec.score);
  const statusColor: Record<string, string> = {
    PENDING_REVIEW: "text-yellow-700 border-yellow-500/20 bg-yellow-50",
    APPROVED: "text-emerald-700 border-emerald-500/20 bg-emerald-50",
    REJECTED: "text-red-700 border-red-500/20 bg-red-50",
    CONTACTED: "text-blue-700 border-blue-500/20 bg-blue-50",
    DISMISSED: "text-gray-500 border-gray-500/20 bg-gray-50",
  };

  const statusLabel: Record<string, string> = {
    PENDING_REVIEW: "En attente",
    APPROVED: "Approuvé",
    REJECTED: "Rejeté",
    CONTACTED: "Contacté",
    DISMISSED: "Ignoré",
  };

  async function handleApprove() {
    setPending("approve");
    const res = await approveRecommendationAction(rec.id, note || undefined);
    if (res.success) {
      setFeedbackResult("Recommandation approuvée !");
      setTimeout(() => { setFeedbackResult(null); onRefresh(); }, 1500);
    }
    setPending(null);
  }

  async function handleReject() {
    setPending("reject");
    const res = await rejectRecommendationAction(rec.id, note || undefined);
    if (res.success) {
      setFeedbackResult("Recommandation rejetée.");
      setTimeout(() => { setFeedbackResult(null); onRefresh(); }, 1500);
    }
    setPending(null);
  }

  async function handleFeedback(decision: string) {
    setPending(decision);
    const res = await addMatchFeedbackAction(rec.id, decision, note || undefined);
    if (res.success) {
      setFeedbackResult(`Feedback "${decision}" enregistré.`);
      setTimeout(() => { setFeedbackResult(null); onRefresh(); }, 1500);
    }
    setPending(null);
  }

  const isPending = pending !== null;
  const canDecide = rec.status === "PENDING_REVIEW";

  return (
    <div className="bg-tb-surface border border-tb-border rounded-2xl p-5 space-y-4">
      {/* Rang + Hero + Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tb-accent/20 to-tb-accent/5 border border-tb-accent/20 flex items-center justify-center text-lg font-bold text-tb-accent">
            {rec.candidate?.name?.charAt(0) || "?"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-tb-text-primary font-semibold">{rec.candidate?.name}</span>
              {rec.status !== "PENDING_REVIEW" && (
                <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor[rec.status] || ""}`}>
                  {statusLabel[rec.status] || rec.status}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-tb-text-secondary mt-0.5">
              {rec.candidate?.city && (
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{rec.candidate.city}</span>
              )}
              {rec.candidate?.reputation != null && (
                <span className="flex items-center gap-1"><Star className="w-3 h-3" />{rec.candidate.reputation.toFixed(1)}/5</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-tb-accent">
            {rec.score}/100
          </div>
          <div className={`text-xs px-2 py-0.5 rounded-full border inline-block mt-1 ${scoreColor}`}>
            {label}
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-6 gap-2 text-center">
        {[
          { key: "skillScore", label: "Compétence" },
          { key: "locationScore", label: "Proximité" },
          { key: "availabilityScore", label: "Disponibilité" },
          { key: "trustScore", label: "Fiabilité" },
          { key: "reciprocityScore", label: "Réciprocité" },
          { key: "communityHealthScore", label: "Réseau" },
        ].map(({ key, label }) => (
          <div key={key} className="bg-tb-surface-elevated rounded-xl p-2">
            <div className="text-tb-text-primary font-bold text-sm">{(breakdown as any)[key] ?? 0}</div>
            <div className="text-tb-text-muted text-xs truncate">{label}</div>
          </div>
        ))}
      </div>

      {/* Explication */}
      {reasons.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-tb-accent mb-2">Pourquoi ce match ?</h4>
          <ul className="space-y-1">
            {reasons.map((r, i) => (
              <li key={i} className="text-sm text-tb-text-primary flex items-start gap-2">
                <span className="text-tb-accent mt-0.5">✓</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risques */}
      {risks.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-orange-600 mb-2">Points de vigilance</h4>
          <ul className="space-y-1">
            {risks.map((r, i) => (
              <li key={i} className="text-sm text-tb-text-primary flex items-start gap-2">
                <span className="text-orange-600 mt-0.5">•</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Feedback banner */}
      {feedbackResult && (
        <div className="bg-tb-accent/5 border border-tb-accent/20 rounded-xl p-3 text-sm text-tb-accent">
          {feedbackResult}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-tb-border">
        <a
          href={`/profile/${rec.candidateId}`}
          target="_blank"
          className="flex items-center gap-1 text-xs text-tb-text-secondary hover:text-tb-text-primary transition-colors px-3 py-1.5 rounded-lg bg-tb-surface-elevated hover:bg-tb-border"
        >
          <ExternalLink className="w-3 h-3" />
          Voir profil
        </a>

        {canDecide && (
          <>
            <button
              disabled={isPending}
              onClick={handleApprove}
              className="flex items-center gap-1 text-xs text-emerald-600 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 border border-emerald-500/30"
            >
              {isPending && pending === "approve" ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
              Valider
            </button>
            <button
              disabled={isPending}
              onClick={handleReject}
              className="flex items-center gap-1 text-xs text-red-600 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-600 border border-red-500/30"
            >
              {isPending && pending === "reject" ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
              Rejeter
            </button>
            <button
              onClick={() => setShowNoteInput(!showNoteInput)}
              className="flex items-center gap-1 text-xs text-tb-text-secondary hover:text-tb-text-primary transition-colors px-3 py-1.5 rounded-lg bg-tb-surface-elevated hover:bg-tb-border"
            >
              <MessageSquare className="w-3 h-3" />
              Note
            </button>
          </>
        )}

        {/* Quick feedback options */}
        {canDecide && (
          <div className="flex gap-1 ml-auto">
            {["GOOD_MATCH", "BAD_MATCH", "CONTACTED"].map((d) => (
              <button
                key={d}
                disabled={isPending}
                onClick={() => handleFeedback(d)}
                className="text-xs px-2 py-1 rounded-lg bg-tb-surface-elevated hover:bg-tb-border text-tb-text-secondary hover:text-tb-text-primary transition-colors"
              >
                {d === "GOOD_MATCH" ? "✓ Bon" : d === "BAD_MATCH" ? "✗ Mauvais" : "📞 Contacté"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Note input */}
      {showNoteInput && (
        <div className="flex gap-2">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note de décision..."
            className="flex-1 bg-tb-surface-elevated border border-tb-border rounded-xl px-3 py-2 text-sm text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent/50"
          />
        </div>
      )}
    </div>
  );
}

// ─── Target Item ────────────────────────────────────────────────────────────

function TargetItem({
  target,
  targetType,
  facilitator,
}: {
  target: any;
  targetType: string;
  facilitator: User;
  onTargetSelect: (type: string, id: string) => void;
  isSelected: boolean;
}) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await getRecommendationsAction(targetType, target.id);
    if (!res.success) {
      setError(res.error ?? "Erreur de chargement");
      setLoading(false);
      return;
    }
    setRecommendations(res.data ?? []);
    setLoading(false);
  }, [targetType, target.id]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    const res = await generateRecommendationsAction(targetType as any, target.id);
    if (res.success) {
      await loadRecommendations();
    } else {
      setError(res.error ?? "Erreur de génération");
    }
    setGenerating(false);
    setExpanded(true);
  };

  const toggleExpand = () => {
    if (!expanded) {
      loadRecommendations();
    }
    setExpanded(!expanded);
  };

  const typeLabel = {
    URGENT_REQUEST: "Urgence",
    SOLIDARITY_MISSION: "Solidaire",
    COLLECTIVE_MISSION: "Collective",
  }[targetType] || targetType;

  return (
    <div className="bg-tb-surface border border-tb-border rounded-2xl overflow-hidden transition-colors">
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-tb-surface-elevated transition-colors"
        onClick={toggleExpand}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              targetType === "URGENT_REQUEST" ? "text-red-700 bg-red-50 border border-red-200" :
              targetType === "SOLIDARITY_MISSION" ? "text-purple-700 bg-purple-50 border border-purple-200" :
              "text-blue-700 bg-blue-50 border border-blue-200"
            }`}>
              {typeLabel}
            </span>
            <h3 className="text-tb-text-primary font-semibold truncate">{target.title}</h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-tb-text-secondary mt-1">
            {target.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{target.city}</span>}
            {target.requester?.name && <span>par {target.requester.name}</span>}
            {target.category && <span className="text-tb-accent/70">{target.category}</span>}
            {target.hours && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{target.hours}h</span>}
            {target._count?.participants != null && (
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{target._count.participants}/{target.maxParticipants || "?"}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {/* Lien vers le détail de la mission */}
          {targetType === "URGENT_REQUEST" && (
            <Link
              href={`/urgent/${target.id}`}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-tb-text-secondary hover:text-tb-text-primary transition-colors px-3 py-1.5 rounded-lg bg-tb-surface-elevated hover:bg-tb-border"
            >
              <Eye className="w-3 h-3" />
              Voir
            </Link>
          )}
          {targetType === "SOLIDARITY_MISSION" && (
            <Link
              href={`/services/${target.id}`}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-tb-text-secondary hover:text-tb-text-primary transition-colors px-3 py-1.5 rounded-lg bg-tb-surface-elevated hover:bg-tb-border"
            >
              <Eye className="w-3 h-3" />
              Voir
            </Link>
          )}
          {targetType === "COLLECTIVE_MISSION" && (
            <Link
              href={`/collective-missions/${target.id}`}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-tb-text-secondary hover:text-tb-text-primary transition-colors px-3 py-1.5 rounded-lg bg-tb-surface-elevated hover:bg-tb-border"
            >
              <Eye className="w-3 h-3" />
              Voir
            </Link>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); handleGenerate(); }}
            disabled={generating}
            className="flex items-center gap-1 text-xs text-tb-accent hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-tb-accent/10 hover:bg-tb-accent border border-tb-accent/30 disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {generating ? "Analyse..." : "Trouver des Heroes"}
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-tb-text-muted" /> : <ChevronDown className="w-4 h-4 text-tb-text-muted" />}
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-tb-text-secondary p-3">
              <Loader2 className="w-4 h-4 animate-spin" />
              Chargement des recommandations...
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
              {error}
            </div>
          )}

          {!loading && recommendations.length === 0 && (
            <div className="text-sm text-tb-text-muted p-3 text-center border border-dashed border-tb-border rounded-xl">
              {generating ? "Analyse en cours..." : "Aucune recommandation pour cette cible. Cliquez sur « Trouver des Heroes » pour en générer."}
            </div>
          )}

          {recommendations.map((rec: any) => (
            <RecommendationCard
              key={rec.id}
              rec={rec}
              facilitatorId={facilitator.id}
              onRefresh={loadRecommendations}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function MatchingClient({ user }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("urgent");
  const [targets, setTargets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTargets = useCallback(async () => {
    setLoading(true);
    setError(null);
    let res: ActionResult;

    switch (activeTab) {
      case "urgent":
        res = await getOpenUrgentRequestsAction();
        break;
      case "solidarity":
        res = await getOpenSolidarityMissionsAction();
        break;
      case "collective":
        res = await getOpenCollectiveMissionsAction();
        break;
      default:
        res = { success: true, data: [] };
    }

    if (res.success) {
      setTargets(res.data ?? []);
    } else {
      setError(res.error ?? "Erreur de chargement");
      setTargets([]);
    }
    setLoading(false);
  }, [activeTab]);

  useEffect(() => {
    fetchTargets();
  }, [fetchTargets]);

  return (
    <div className="min-h-screen bg-tb-bg">
      <ConnectedHeader />

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-tb-text-primary flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-tb-accent" />
              Matchmaking assisté
            </h1>
            <p className="text-tb-text-secondary text-sm mt-1">
              L&apos;IA recommande, le facilitateur décide. Aucune assignation automatique.
            </p>
          </div>
          <button
            onClick={fetchTargets}
            disabled={loading}
            className="flex items-center gap-1 text-xs text-tb-text-secondary hover:text-tb-text-primary transition-colors px-3 py-1.5 rounded-lg bg-tb-surface-elevated hover:bg-tb-border"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-tb-surface rounded-2xl p-1 border border-tb-border">
          {TABS.filter(t => t.id !== "history").map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-1 justify-center ${
                activeTab === tab.id
                  ? "bg-tb-accent/10 text-tb-accent border border-tb-accent/20"
                  : "text-tb-text-secondary hover:text-tb-text-primary hover:bg-tb-surface-elevated"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-6 h-6 animate-spin text-tb-accent" />
          </div>
        )}

        {/* Target list */}
        {!loading && targets.length === 0 && activeTab !== "history" && (
          <div className="text-center p-12 border border-dashed border-tb-border rounded-2xl">
            <Sparkles className="w-12 h-12 text-tb-border mx-auto mb-3" />
            <p className="text-tb-text-muted">Aucune {activeTab === "urgent" ? "demande urgente" : activeTab === "solidarity" ? "mission solidaire" : "mission collective"} ouverte pour le moment.</p>
          </div>
        )}

        {/* Targets */}
        {!loading && targets.map((target: any) => (
          <TargetItem
            key={target.id}
            target={{
              ...target,
              requester: target.requester || target.provider || target.organizer || { name: "N/A" },
            }}
            targetType={
              activeTab === "urgent" ? "URGENT_REQUEST" :
              activeTab === "solidarity" ? "SOLIDARITY_MISSION" :
              "COLLECTIVE_MISSION"
            }
            facilitator={user}
            onTargetSelect={() => {}}
            isSelected={false}
          />
        ))}

        {/* History tab */}
        {activeTab === "history" && (
          <div className="text-center p-12 border border-dashed border-tb-border rounded-2xl">
            <History className="w-12 h-12 text-tb-border mx-auto mb-3" />
            <p className="text-tb-text-muted">L&apos;historique des recommandations sera affiché ici — toutes cibles confondues.</p>
          </div>
        )}

        {/* Safety reminder */}
        <div className="bg-tb-accent/5 border border-tb-accent/10 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-tb-accent mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-tb-text-primary font-medium">Aucune décision automatique</p>
              <p className="text-xs text-tb-text-muted mt-1">
                TimeHeroes recommande des candidats, le facilitateur valide. Aucun booking, aucun mouvement TIME, aucune assignation n&apos;est créé automatiquement. Toutes les recommandations sont explicables.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
