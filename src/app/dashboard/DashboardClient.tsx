"use client";

import Link from "next/link";
import {
  Wallet,
  Search,
  Plus,
  CalendarCheck,
  Calendar,
  MapPin,
  Zap,
  Shield,
  Award,
  HeartHandshake,
  Clock,
  TrendingUp,
  Sparkles,
  User,
} from "lucide-react";
import type { HeroLevel } from "@/lib/gamification";
import HeroLevelBadge from "@/components/HeroLevelBadge";
import XpProgressBar from "@/components/XpProgressBar";
import ConnectedHeader from "@/components/ConnectedHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import type { DashboardStats as DashboardStatsType } from "@/lib/dashboard";

interface DashboardUser {
  id: string;
  name: string;
  timeBalance: number;
  walletAddress: string;
  reputation: number;
  city: string | null;
  department: string | null;
  serviceRadiusKm: number | null;
  availableOnline: boolean | null;
}

interface MiniTx {
  id: string;
  type: string;
  amount: number;
  fromId: string | null;
  toId: string | null;
  createdAt: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function HeroBanner({
  user,
  heroLevel,
  communityPotBalance,
}: {
  user: DashboardUser;
  heroLevel: HeroLevel;
  communityPotBalance: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-tb-accent via-[#008f78] to-[#006c5b] p-6 animate-fade-in-up">
      {/* Decorative circles */}
      <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5" />
      <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/[0.03]" />
      <div className="absolute top-1/2 right-12 w-16 h-16 rounded-full bg-white/[0.04]" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Avatar + Greeting + Tagline */}
        <div className="flex items-center gap-4">
          {/* Avatar circle */}
          <div className="w-14 h-14 rounded-full bg-white/20 ring-2 ring-white/30 flex items-center justify-center shrink-0 shadow-lg">
            <span className="font-anton text-xl text-white">{getInitials(user.name)}</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-anton tracking-wide text-white">
              Bonjour {user.name} 👋
            </h1>
            <div className="flex items-center gap-3 mt-1">
              {user.city && (
                <span className="inline-flex items-center gap-1 text-xs text-white/70">
                  <MapPin className="w-3 h-3" />
                  {user.city}{user.department ? `, ${user.department}` : ""}
                  {user.serviceRadiusKm && ` · ${user.serviceRadiusKm} km`}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-xs text-yellow-300/90 font-medium">
                <Sparkles className="w-3 h-3" />
                Niveau {heroLevel.level} — {heroLevel.name}
              </span>
            </div>
            <p className="text-xs text-white/60 mt-2 italic">
              {heroLevel.nextLevelXp !== null
                ? `Plus que ${heroLevel.nextLevelXp - heroLevel.currentXp} XP pour le prochain niveau 🔥`
                : "~ niveau maximum atteint ~"}
            </p>
          </div>
        </div>

        {/* Right: Pot commun */}
        <Link
          href="/wallet"
          className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5 text-white hover:bg-white/25 transition-all group shrink-0"
        >
          <HeartHandshake className="w-4 h-4 text-yellow-300" />
          <span className="text-xs font-medium text-white/80">Pot commun</span>
          <span className="font-bold text-sm">{communityPotBalance} TIME</span>
          <span className="text-xs text-white/50 group-hover:text-white/80 transition-colors">→</span>
        </Link>
      </div>
    </div>
  );
}

const cardHover = "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-tb-accent/5";
const borderHover = "hover:border-tb-accent/30";

export default function DashboardClient({
  user,
  activeServices,
  inactiveServices,
  myBookingsCount,
  missionsCount,
  recentTransactions = [],
  ratingsReceivedCount = 0,
  heroLevel,
  badgesCount = 0,
  dashboardStats,
  communityPotBalance = 0,
}: {
  user: DashboardUser;
  activeServices: number;
  inactiveServices: number;
  myBookingsCount: number;
  missionsCount: number;
  recentTransactions: MiniTx[];
  ratingsReceivedCount: number;
  heroLevel: HeroLevel;
  badgesCount: number;
  dashboardStats: DashboardStatsType;
  communityPotBalance?: number;
}) {
  return (
    <>
      <ConnectedHeader />

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {/* ─── HERO BANNER ─── */}
        <HeroBanner
          user={user}
          heroLevel={heroLevel}
          communityPotBalance={communityPotBalance}
        />

        {/* ─── Activity widgets (DashboardStats) ─── */}
        <DashboardStats stats={dashboardStats} />

        {/* ─── Impact flash (remplace la bannière orange) ─── */}
        {dashboardStats.todoActionsCount > 0 || dashboardStats.unreadMessagesCount > 0 ? (
          <div className="bg-gradient-to-r from-amber-50 to-amber-50/50 border border-amber-200/60 rounded-xl px-4 py-3 animate-fade-in-up-slow">
            <p className="text-sm text-amber-800/80">
              ⚡ Tu as{" "}
              {[
                dashboardStats.todoActionsCount > 0 &&
                  `${dashboardStats.todoActionsCount} action${dashboardStats.todoActionsCount > 1 ? "s" : ""} à traiter`,
                dashboardStats.unreadMessagesCount > 0 &&
                  `${dashboardStats.unreadMessagesCount} message${dashboardStats.unreadMessagesCount > 1 ? "s" : ""} non lu${dashboardStats.unreadMessagesCount > 1 ? "s" : ""}`,
              ]
                .filter(Boolean)
                .join(" et ")}{" "}
              en attente.
            </p>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-tb-accent-soft to-tb-accent-soft/30 border border-tb-accent/10 rounded-xl px-4 py-3 animate-fade-in-up-slow">
            <p className="text-sm text-tb-accent/80">
              ✨ Tout est à jour ! Continue à proposer ton aide ou découvre les missions proches de toi.
            </p>
          </div>
        )}

        {/* ─── Missions collectives ─── */}
        <Link
          href="/collective-missions"
          className={`block bg-tb-surface border border-tb-border rounded-2xl p-4 ${cardHover} ${borderHover} group animate-fade-in-up-slow`}
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <HeartHandshake className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <span className="text-tb-text-secondary text-sm font-medium">Missions collectives</span>
                <p className="text-xs text-tb-text-muted mt-0.5">
                  {dashboardStats.collectiveMissionsOpen} ouverte{dashboardStats.collectiveMissionsOpen > 1 ? "s" : ""}
                  {" · "}
                  {dashboardStats.collectiveMissionsParticipation} participation{dashboardStats.collectiveMissionsParticipation > 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <span className="text-xs text-tb-accent group-hover:text-tb-accent-hover transition-all group-hover:translate-x-0.5 inline-flex items-center gap-1">
              Voir <span className="hidden sm:inline">→</span>
            </span>
          </div>
        </Link>

        {/* ─── Grille 2 colonnes pour les cartes secondaires ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>

          {/* Carte gauche : Hero Level + Progression */}
          <Link
            href="/rewards"
            className={`block bg-tb-surface border border-tb-border rounded-2xl p-5 ${cardHover} ${borderHover} group`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-tb-text-secondary text-sm font-medium">Progression Hero</span>
              <span className="text-tb-accent text-xs font-bangers tracking-wider">~ niveau ~</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="shrink-0 group-hover:animate-float">
                <HeroLevelBadge level={heroLevel} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-bold text-tb-text-primary group-hover:text-tb-accent transition-colors">
                  {heroLevel.name}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-tb-text-secondary">
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-tb-accent" />
                    {badgesCount} badge{badgesCount > 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-yellow-400" />
                    {heroLevel.currentXp} XP
                  </span>
                </div>
              </div>
            </div>
            <XpProgressBar
              currentXp={heroLevel.currentXp}
              nextLevelXp={heroLevel.nextLevelXp}
              progress={heroLevel.progress}
            />
          </Link>

          {/* Carte droite : Réputation + Services */}
          <div className={`bg-tb-surface border border-tb-border rounded-2xl p-5 ${cardHover} ${borderHover}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-tb-text-secondary text-sm font-medium">Réputation & Services</span>
              <span className="text-tb-accent text-xs font-bangers tracking-wider">~ confiance ~</span>
            </div>
            <div className="flex items-start gap-6">
              {/* Réputation */}
              <div className="flex-1">
                {ratingsReceivedCount > 0 ? (
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">
                      {user.reputation.toFixed(1)}
                      <span className="text-sm text-tb-text-secondary font-normal"> / 5</span>
                    </div>
                    <div className="text-xs text-tb-text-secondary mt-0.5">
                      {ratingsReceivedCount} avis
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-tb-text-primary font-semibold">Nouveau héros</p>
                    <p className="text-xs text-tb-text-muted mt-1">Aucun avis pour le moment</p>
                  </div>
                )}
              </div>
              {/* Séparateur */}
              <div className="w-px h-16 bg-tb-border shrink-0" />
              {/* Services */}
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-tb-text-primary">{activeServices}</div>
                    <div className="text-xs text-tb-text-secondary">actif{activeServices > 1 ? "s" : ""}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-tb-text-muted">{inactiveServices}</div>
                    <div className="text-xs text-tb-text-muted">inactif{inactiveServices > 1 ? "s" : ""}</div>
                  </div>
                </div>
                {(activeServices + inactiveServices) > 0 && (
                  <Link
                    href="/my-services"
                    className="inline-block mt-2 text-xs text-tb-accent hover:text-tb-accent-hover transition-colors underline underline-offset-2"
                  >
                    Gérer mes services →
                  </Link>
                )}
                <Link
                  href="/services?solidarity=true"
                  className="inline-block mt-1.5 text-xs text-teal-400/80 hover:text-teal-400 transition-colors underline underline-offset-2"
                >
                  <HeartHandshake className="w-3 h-3 inline mr-1" />
                  Explorer les missions solidaires
                </Link>
              </div>
            </div>
          </div>

          {/* Carte gauche bas : Missions en cours + transactions */}
          <div className={`bg-tb-surface border border-tb-border rounded-2xl p-5 ${cardHover} ${borderHover}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-tb-text-secondary text-sm font-medium">Missions en cours</span>
              <span className="text-tb-accent text-xs font-bangers tracking-wider">~ actif ~</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/bookings" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <CalendarCheck className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-tb-text-primary group-hover:text-tb-accent transition-colors">
                    {myBookingsCount}
                  </div>
                  <div className="text-xs text-tb-text-secondary">réservation{myBookingsCount > 1 ? "s" : ""}</div>
                </div>
              </Link>
              <div className="w-px h-10 bg-tb-border" />
              <Link href="/bookings" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-tb-text-primary group-hover:text-tb-accent transition-colors">
                    {missionsCount}
                  </div>
                  <div className="text-xs text-tb-text-secondary">mission{missionsCount > 1 ? "s" : ""} reçue{missionsCount > 1 ? "s" : ""}</div>
                </div>
              </Link>
            </div>

            {/* Transactions récentes */}
            {recentTransactions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-tb-border">
                <p className="text-xs text-tb-text-muted mb-2">Dernières transactions</p>
                {recentTransactions.map((tx) => {
                  const labels: Record<string, string> = {
                    escrow: "Réservation",
                    release: "Service terminé",
                    refund: "Remboursement",
                  };
                  const isCredit = tx.type !== "escrow";
                  return (
                    <div key={tx.id} className="flex items-center justify-between text-xs py-1">
                      <span className="text-tb-text-secondary">{labels[tx.type] || tx.type}</span>
                      <span className={isCredit ? "text-tb-accent" : "text-red-400"}>
                        {isCredit ? "+" : "-"}{tx.amount} TIME
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty state friendly */}
            {myBookingsCount === 0 && missionsCount === 0 && recentTransactions.length === 0 && (
              <p className="text-xs text-tb-text-muted mt-1 italic">
                Aucune mission en cours… <Link href="/services" className="text-tb-accent hover:underline">explore les missions disponibles</Link> 🎯
              </p>
            )}
          </div>

          {/* Carte droite bas : Calendrier / Actions rapides */}
          <div className={`bg-tb-surface border border-tb-border rounded-2xl p-5 ${cardHover} ${borderHover}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-tb-text-secondary text-sm font-medium">Actions rapides</span>
              <span className="text-tb-accent text-xs font-bangers tracking-wider">~ go ~</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/services"
                className="flex items-center gap-2 bg-tb-surface-elevated rounded-xl px-3 py-3 hover:bg-tb-accent/5 hover:shadow-sm hover:shadow-tb-accent/10 transition-all duration-300 group"
              >
                <div className="w-8 h-8 rounded-lg bg-tb-accent/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-tb-accent/20 transition-all duration-300">
                  <Search className="w-4 h-4 text-tb-accent" />
                </div>
                <span className="text-xs font-medium text-tb-text-primary group-hover:text-tb-accent transition-colors">Explorer</span>
              </Link>
              <Link
                href="/services/new"
                className="flex items-center gap-2 bg-tb-surface-elevated rounded-xl px-3 py-3 hover:bg-tb-accent/5 hover:shadow-sm hover:shadow-tb-accent/10 transition-all duration-300 group"
              >
                <div className="w-8 h-8 rounded-lg bg-tb-accent/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-tb-accent/20 transition-all duration-300">
                  <Plus className="w-4 h-4 text-tb-accent" />
                </div>
                <span className="text-xs font-medium text-tb-text-primary group-hover:text-tb-accent transition-colors">Proposer</span>
              </Link>
              <Link
                href="/agenda"
                className="flex items-center gap-2 bg-tb-surface-elevated rounded-xl px-3 py-3 hover:bg-purple-500/5 hover:shadow-sm hover:shadow-purple-500/10 transition-all duration-300 group"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300">
                  <Calendar className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-xs font-medium text-tb-text-primary group-hover:text-purple-400 transition-colors">Agenda</span>
              </Link>
              <Link
                href="/availability"
                className="flex items-center gap-2 bg-tb-surface-elevated rounded-xl px-3 py-3 hover:bg-amber-500/5 hover:shadow-sm hover:shadow-amber-500/10 transition-all duration-300 group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-300">
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-xs font-medium text-tb-text-primary group-hover:text-amber-400 transition-colors">Dispos</span>
              </Link>
              <Link
                href="/urgent"
                className="flex items-center gap-2 bg-tb-surface-elevated rounded-xl px-3 py-3 hover:bg-[#f59e0b]/10 hover:shadow-sm hover:shadow-[#f59e0b]/10 transition-all duration-300 group col-span-2"
              >
                <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#f59e0b]/20 transition-all duration-300">
                  <Zap className="w-4 h-4 text-[#f59e0b]" />
                </div>
                <span className="text-xs font-medium text-tb-text-primary group-hover:text-[#f59e0b] transition-colors">Aide urgente</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ─── Community Pot bar (compact) ─── */}
        <Link
          href="/wallet"
          className={`block bg-gradient-to-r from-tb-surface to-tb-surface border border-tb-border rounded-xl p-3 ${cardHover} ${borderHover} group animate-fade-in-up`}
          style={{ animationDelay: "0.3s" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-tb-accent group-hover:scale-110 transition-transform duration-300" />
              <span className="text-sm text-tb-text-secondary">Pot commun</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-tb-accent">{communityPotBalance} TIME</span>
              <span className="text-xs text-tb-text-muted group-hover:text-tb-accent transition-colors">Voir →</span>
            </div>
          </div>
        </Link>

        {/* ─── Cartes d'action principales (2 grandes) ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
          <Link
            href="/services"
            className={`group relative bg-tb-surface border border-tb-border rounded-2xl p-5 ${cardHover} ${borderHover} overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-tb-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-tb-accent/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-tb-accent/20 transition-all duration-300">
                <Search className="w-6 h-6 text-tb-accent" />
              </div>
              <div>
                <div className="font-semibold text-tb-text-primary group-hover:text-tb-accent transition-colors">
                  Explorer les services
                </div>
                <p className="text-xs text-tb-text-secondary mt-0.5">
                  Trouve un héros et réserve avec tes TIME
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/services/new"
            className={`group relative bg-tb-surface border border-tb-accent/20 rounded-2xl p-5 ${cardHover} hover:border-tb-accent/60 overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-tb-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-tb-accent/15 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-tb-accent/25 transition-all duration-300">
                <Plus className="w-6 h-6 text-tb-accent" />
              </div>
              <div>
                <div className="font-semibold text-tb-text-primary group-hover:text-tb-accent transition-colors">
                  Proposer un service
                </div>
                <p className="text-xs text-tb-text-secondary mt-0.5">
                  Partage ton super-pouvoir et gagne des TIME
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* ─── Comics footer ─── */}
        <div className="text-center pt-4 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <span className="font-bangers text-tb-accent text-xs tracking-wider opacity-40">
            ~ nous sommes tous des super-héros du quotidien ~
          </span>
        </div>
      </main>
    </>
  );
}
