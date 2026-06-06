"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageSquare,
  Send,
  AlertTriangle,
  Flag,
  Info,
  Shield,
  User,
} from "lucide-react";
import {
  getBookingMessages,
  createBookingMessage,
  reportBookingMessage,
} from "@/app/bookings/messages/actions";
import type { BookingMessageItem } from "@/app/bookings/messages/actions";

// ─── Quick replies ──────────────────────────────────────────────────────────

const QUICK_REPLIES = [
  "Confirmer le besoin",
  "Demander plus de détails",
  "Confirmer l'horaire",
  "Préciser le matériel nécessaire",
  "Dire que je suis en route",
  "Confirmer que la mission est terminée",
];

// ─── Report reasons ─────────────────────────────────────────────────────────

const REPORT_REASONS = [
  { value: "HARASSMENT", label: "Harcèlement" },
  { value: "PERSONAL_CONTACT", label: "Partage de coordonnées" },
  { value: "SPAM", label: "Spam" },
  { value: "INAPPROPRIATE", label: "Contenu inapproprié" },
  { value: "OTHER", label: "Autre" },
];

// ─── Props ──────────────────────────────────────────────────────────────────

interface BookingDiscussionProps {
  bookingId: string;
  userId: string;
}

// ─── Format date ────────────────────────────────────────────────────────────

function formatMessageDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Il y a ${diffHours}h`;

  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function BookingDiscussion({
  bookingId,
  userId,
}: BookingDiscussionProps) {
  const [messages, setMessages] = useState<BookingMessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("HARASSMENT");
  const [reportComment, setReportComment] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load messages
  const loadMessages = useCallback(async () => {
    const result = await getBookingMessages(bookingId);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setMessages(result);
    setLoading(false);
  }, [bookingId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content || sending) return;

    setSending(true);
    setWarning(null);
    setError(null);

    const result = await createBookingMessage(bookingId, content);
    if ("error" in result) {
      setError(result.error);
      setSending(false);
      return;
    }

    if (result.warning) {
      setWarning(result.warning);
      // Auto-hide warning after 5 seconds
      setTimeout(() => setWarning(null), 5000);
    }

    setMessages((prev) => [...prev, result.message]);
    setInputValue("");
    setSending(false);
    setShowQuickReplies(false);
  };

  // Handle key press (Enter to send, Shift+Enter for newline)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick reply click
  const handleQuickReply = (text: string) => {
    setInputValue(text);
    setShowQuickReplies(false);
    // Focus the input
    inputRef.current?.focus();
  };

  // Report message
  const handleReport = async (messageId: string) => {
    if (!reportReason) return;
    setReportSubmitting(true);
    setError(null);

    const result = await reportBookingMessage(
      messageId,
      reportReason,
      reportComment.trim() || undefined
    );

    if ("error" in result) {
      setError(result.error);
      setReportSubmitting(false);
      return;
    }

    setReportingId(null);
    setReportReason("HARASSMENT");
    setReportComment("");
    setReportSubmitting(false);
  };

  return (
    <div className="border-t border-tb-border pt-6 mt-6">
      {/* Section title */}
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-tb-accent" />
        <h2 className="text-sm font-semibold text-tb-text-primary uppercase tracking-wider">
          Discussion de mission
        </h2>
      </div>

      {/* ─── Security block ─── */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 mb-4">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-300/80 leading-relaxed">
            Pour votre sécurité, gardez les échanges dans TimeHeroes.
            Ne partagez pas votre numéro de téléphone, email personnel ou adresse complète.
            En cas de comportement inapproprié, vous pouvez signaler un message.
          </div>
        </div>
      </div>

      {/* ─── Messages list ─── */}
      <div className="space-y-3 mb-4 max-h-96 overflow-y-auto pr-1">
        {loading ? (
          <div className="text-center py-6">
            <div className="animate-pulse text-tb-text-muted text-sm">
              Chargement des messages…
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-6">
            <MessageSquare className="w-8 h-8 text-tb-text-muted mx-auto mb-2" />
            <p className="text-tb-text-muted text-sm">
              Aucun message pour le moment. Lancez la discussion !
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id}>
              {msg.type === "SYSTEM" ? (
                /* ── System message ── */
                <div className="flex items-center justify-center gap-2 py-1">
                  <div className="flex items-center gap-1.5 bg-tb-surface border border-tb-border rounded-full px-3 py-1">
                    <Info className="w-3 h-3 text-tb-text-muted" />
                    <span className="text-tb-text-muted text-xs italic">
                      {msg.content}
                    </span>
                  </div>
                </div>
              ) : (
                /* ── User message ── */
                <div
                  className={`flex ${
                    msg.authorId === userId
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] ${
                      msg.authorId === userId
                        ? "bg-tb-accent/10 border-tb-accent/20"
                        : "bg-tb-surface border-tb-border"
                    } border rounded-xl p-3`}
                  >
                    {/* Author + time */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-tb-text-secondary">
                        {msg.authorId === userId
                          ? "Vous"
                          : msg.author?.name ?? "Utilisateur"}
                      </span>
                      <span className="text-[10px] text-tb-text-muted">
                        {formatMessageDate(msg.createdAt)}
                      </span>
                    </div>

                    {/* Content */}
                    <p className="text-sm text-tb-text-primary whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>

                    {/* Flagged badge */}
                    {msg.isFlagged && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <AlertTriangle className="w-3 h-3 text-yellow-400" />
                        <span className="text-[10px] text-yellow-400">
                          Coordonnées détectées
                        </span>
                      </div>
                    )}

                    {/* Report button (not on own messages) */}
                    {msg.authorId !== userId && (
                      <div className="mt-1.5 flex justify-end">
                        {reportingId === msg.id ? (
                          /* Report form */
                          <div className="bg-tb-surface border border-tb-border rounded-xl p-2 w-full">
                            <select
                              value={reportReason}
                              onChange={(e) => setReportReason(e.target.value)}
                              className="w-full bg-tb-surface border border-tb-border rounded-lg px-2 py-1 text-xs text-tb-text-primary mb-1.5 focus:outline-none focus:border-tb-accent"
                            >
                              {REPORT_REASONS.map((r) => (
                                <option key={r.value} value={r.value}>
                                  {r.label}
                                </option>
                              ))}
                            </select>
                            <textarea
                              value={reportComment}
                              onChange={(e) =>
                                setReportComment(e.target.value)
                              }
                              placeholder="Commentaire (optionnel)"
                              maxLength={500}
                              rows={2}
                              className="w-full bg-tb-surface border border-tb-border rounded-lg px-2 py-1 text-xs text-tb-text-primary placeholder:text-tb-text-muted mb-1.5 focus:outline-none focus:border-tb-accent resize-none"
                            />
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleReport(msg.id)}
                                disabled={reportSubmitting}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg px-2 py-1 text-[10px] font-semibold transition-colors disabled:opacity-50"
                              >
                                {reportSubmitting
                                  ? "Envoi…"
                                  : "Confirmer le signalement"}
                              </button>
                              <button
                                onClick={() => setReportingId(null)}
                                className="text-tb-text-muted hover:text-tb-text-secondary text-[10px] transition-colors"
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setReportingId(msg.id);
                              setReportReason("HARASSMENT");
                              setReportComment("");
                            }}
                            className="inline-flex items-center gap-1 text-tb-text-muted hover:text-yellow-400 transition-colors"
                            title="Signaler ce message"
                          >
                            <Flag className="w-3 h-3" />
                            <span className="text-[10px]">Signaler</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ─── Error / Warning ─── */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2 mb-3">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}
      {warning && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-2 mb-3">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <p className="text-yellow-400 text-xs">{warning}</p>
          </div>
        </div>
      )}

      {/* ─── Quick replies ─── */}
      {showQuickReplies && (
        <div className="mb-3">
          <p className="text-[10px] text-tb-text-muted mb-1.5">
            Suggestions de messages :
          </p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_REPLIES.map((text) => (
              <button
                key={text}
                onClick={() => handleQuickReply(text)}
                className="bg-tb-surface hover:bg-tb-accent/5 border border-tb-border rounded-full px-2.5 py-1 text-[11px] text-tb-text-secondary hover:text-tb-text-primary transition-colors"
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Input area ─── */}
      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrire un message…"
          maxLength={1000}
          rows={2}
          className="flex-1 bg-tb-surface border border-tb-border rounded-xl px-4 py-2.5 text-sm text-tb-text-primary placeholder:text-tb-text-muted focus:outline-none focus:border-tb-accent transition-colors resize-none"
        />
        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || sending}
          className="bg-tb-accent hover:bg-tb-accent/80 disabled:opacity-30 disabled:cursor-not-allowed text-black rounded-xl p-2.5 transition-colors shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      <div className="flex justify-between items-center mt-1">
        <span className="text-[10px] text-tb-text-muted">
          Entrée pour envoyer · Maj+Entrée pour sauter une ligne
        </span>
        <span className="text-[10px] text-tb-text-muted">
          {inputValue.length}/1000
        </span>
      </div>
    </div>
  );
}
