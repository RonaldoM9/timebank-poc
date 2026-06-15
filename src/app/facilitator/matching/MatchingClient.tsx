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
} from "lucide-react";
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
  if (score >= 90) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
  if (score >= 75) return "text-green-400 border-green-500/30 bg-green-500/10";
  if (score >= 60) return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
  if (score >= 40) return "text-orange-400 border-orange-500/30 bg-orange-500/10";
  return "text-red-400 border-red-500/30 bg-red-500/10";
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
    PENDING_REVIEW: "text-yellow-400 border-yellow-500/20 bg-yellow-500/10",
    APPROVED: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
    REJECTED: "text-red-400 border-red-500/20 bg-red-500/10",
    CONTACTED: "text-blue-400 border-blue-500/20 bg-blue-500/10",
    DISMISSED: "text-gray-400 border-gray-500/20 bg-gray-500/10",
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
    <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5 space-y-4">
      {/* Rang + Hero + Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4aa]/20 to-[#00d4aa]/5 border border-[#00d4aa]/20 flex items-center justify-center text-lg font-bold text-[#00d4aa]">
            {rec.candidate?.name?.charAt(0) || "?"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[#f5f5f5] font-semibold">{rec.candidate?.name}</span>
              {rec.status !== "PENDING_REVIEW" && (
                <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor[rec.status] || ""}`}>
                  {statusLabel[rec.status] || rec.status}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-[#a3a3a3] mt-0.5">
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
          <div className={`text-2xl font-bold ${scoreColor.includes("emerald") ? "text-emerald-400" : scoreColor.includes("green") ? "text-green-400" : scoreColor.includes("yellow") ? "text-yellow-400" : scoreColor.includes("orange") ? "text-orange-400" : "text-red-400"}`}>
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
          <div key={key} className="bg-[#181818] rounded-xl p-2">
            <div className="text-white font-bold text-sm">{(breakdown as any)[key] ?? 0}</div>
            <div className="text-[#a3a3a3] text-xs truncate">{label}</div>
          </div>
        ))}
      </div>

      {/* Explication */}
      {reasons.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-[#00d4aa] mb-2">Pourquoi ce match ?</h4>
          <ul className="space-y-1">
            {reasons.map((r, i) => (
              <li key={i} className="text-sm text-[#d4d4d4] flex items-start gap-2">
                <span className="text-[#00d4aa] mt-0.5">✓</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risques */}
      {risks.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-orange-400 mb-2">Points de vigilance</h4>
          <ul className="space-y-1">
            {risks.map((r, i) => (
              <li key={i} className="text-sm text-[#d4d4d4] flex items-start gap-2">
                <span className="text-orange-400 mt-0.5">•</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Feedback banner */}
      {feedbackResult && (
        <div className="bg-[#00d4aa]/10 border border-[#00d4aa]/30 rounded-xl p-3 text-sm text-[#00d4aa]">
          {feedbackResult}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#262626]">
        <a
          href={`/profile/${rec.candidateId}`}
          target="_blank"
          className="flex items-center gap-1 text-xs text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors px-3 py-1.5 rounded-lg bg-[#181818] hover:bg-[#222]"
        >
          <ExternalLink className="w-3 h-3" />
          Voir profil
        </a>

        {canDecide && (
          <>
            <button
              disabled={isPending}
              onClick={handleApprove}
              className="flex items-center gap-1 text-xs text-emerald-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20"
            >
              {isPending && pending === "approve" ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
              Valider
            </button>
            <button
              disabled={isPending}
              onClick={handleReject}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20"
            >
              {isPending && pending === "reject" ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
              Rejeter
            </button>
            <button
              onClick={() => setShowNoteInput(!showNoteInput)}
              className="flex items-center gap-1 text-xs text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors px-3 py-1.5 rounded-lg bg-[#181818] hover:bg-[#222]"
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
                className="text-xs px-2 py-1 rounded-lg bg-[#181818] hover:bg-[#222] text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors"
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
            className="flex-1 bg-[#181818] border border-[#262626] rounded-xl px-3 py-2 text-sm text-[#f5f5f5] placeholder:text-[#5a5a5a] focus:outline-none focus:border-[#00d4aa]/50"
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
  onTargetSelect,
  isSelected,
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
  const [localNote, setLocalNote] = useState("");
  const [showFeedbackBtns, setShowFeedbackBtns] = useState(false);

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
    <div className={`bg-[#111111] border ${isSelected ? "border-[#00d4aa]/40" : "border-[#262626]"} rounded-2xl overflow-hidden transition-colors`}>
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#181818] transition-colors"
        onClick={toggleExpand}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              targetType === "URGENT_REQUEST" ? "text-red-400 bg-red-500/10 border border-red-500/20" :
              targetType === "SOLIDARITY_MISSION" ? "text-purple-400 bg-purple-500/10 border border-purple-500/20" :
              "text-blue-400 bg-blue-500/10 border border-blue-500/20"
            }`}>
              {typeLabel}
            </span>
            <h3 className="text-[#f5f5f5] font-semibold truncate">{target.title}</h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#a3a3a3] mt-1">
            {target.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{target.city}</span>}
            {target.requester?.name && <span>par {target.requester.name}</span>}
            {target.category && <span className="text-[#00d4aa]/70">{target.category}</span>}
            {target.hours && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{target.hours}h</span>}
            {target._count?.participants != null && (
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{target._count.participants}/{target.maxParticipants || "?"}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={(e) => { e.stopPropagation(); handleGenerate(); }}
            disabled={generating}
            className="flex items-center gap-1 text-xs text-[#00d4aa] hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-[#00d4aa]/10 hover:bg-[#00d4aa]/20 border border-[#00d4aa]/20 disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {generating ? "Analyse..." : "Trouver des Heroes"}
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-[#a3a3a3]" /> : <ChevronDown className="w-4 h-4 text-[#a3a3a3]" />}
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-[#a3a3a3] p-3">
              <Loader2 className="w-4 h-4 animate-spin" />
              Chargement des recommandations...
            </div>
          )}

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              {error}
            </div>
          )}

          {!loading && recommendations.length === 0 && (
            <div className="text-sm text-[#a3a3a3] p-3 text-center border border-dashed border-[#262626] rounded-xl">
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
    <div className="min-h-screen bg-[#0a0a0a]">
      <ConnectedHeader />

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#f5f5f5] flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#00d4aa]" />
              Matchmaking assisté
            </h1>
            <p className="text-[#a3a3a3] text-sm mt-1">
              L&apos;IA recommande, le facilitateur décide. Aucune assignation automatique.
            </p>
          </div>
          <button
            onClick={fetchTargets}
            disabled={loading}
            className="flex items-center gap-1 text-xs text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors px-3 py-1.5 rounded-lg bg-[#181818] hover:bg-[#222]"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#111111] rounded-2xl p-1 border border-[#262626]">
          {TABS.filter(t => t.id !== "history").map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-1 justify-center ${
                activeTab === tab.id
                  ? "bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20"
                  : "text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-[#181818]"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-6 h-6 animate-spin text-[#00d4aa]" />
          </div>
        )}

        {/* Target list */}
        {!loading && targets.length === 0 && activeTab !== "history" && (
          <div className="text-center p-12 border border-dashed border-[#262626] rounded-2xl">
            <Sparkles className="w-12 h-12 text-[#262626] mx-auto mb-3" />
            <p className="text-[#a3a3a3]">Aucune {activeTab === "urgent" ? "demande urgente" : activeTab === "solidarity" ? "mission solidaire" : "mission collective"} ouverte pour le moment.</p>
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
          <div className="text-center p-12 border border-dashed border-[#262626] rounded-2xl">
            <History className="w-12 h-12 text-[#262626] mx-auto mb-3" />
            <p className="text-[#a3a3a3]">L&apos;historique des recommandations sera affiché ici — toutes cibles confondues.</p>
          </div>
        )}

        {/* Safety reminder */}
        <div className="bg-[#00d4aa]/5 border border-[#00d4aa]/10 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#00d4aa] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-[#d4d4d4] font-medium">Aucune décision automatique</p>
              <p className="text-xs text-[#a3a3a3] mt-1">
                TimeHeroes recommande des candidats, le facilitateur valide. Aucun booking, aucun mouvement TIME, aucune assignation n&apos;est créé automatiquement. Toutes les recommandations sont explicables.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
