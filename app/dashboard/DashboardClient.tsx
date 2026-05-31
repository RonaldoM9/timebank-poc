"use client";

import Link from "next/link";
import {
  Wallet,
  Search,
  Plus,
  Layers,
  CalendarCheck,
  Calendar,
  Inbox,
  MapPin,
  Zap,
  Shield,
  Award,
} from "lucide-react";
import type { HeroLevel } from "@/lib/gamification";
import HeroLevelBadge from "@/components/HeroLevelBadge";
import XpProgressBar from "@/components/XpProgressBar";
import ConnectedHeader from "@/components/ConnectedHeader";
import DemoChecklist from "@/components/DemoChecklist";
import OnboardingBlock from "@/components/OnboardingBlock";

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
  userEmail = "",
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
  userEmail?: string;
}) {
  const isDemoAccount = userEmail === "demo@timeheroes.fr";

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <ConnectedHeader />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Hero greeting */}
        <div>
          <h1 className="text-3xl font-anton tracking-wide text-[#f5f5f5] mb-1">
            Bonjour {user.name} 👋
          </h1>
          <p className="text-[#a3a3a3] text-sm">
            Bienvenue sur votre tableau de bord TimeHeroes
          </p>
        </div>

        {/* Demo: Checklist + Onboarding */}
        {isDemoAccount && (
          <>
            <DemoChecklist />
            <OnboardingBlock />
          </>
        )}

        {/* Balance card */}
        <div className="bg-[#111111] border border-[#262626] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[#a3a3a3] text-sm font-medium">
              Solde TIME
            </span>
            <span className="text-[#00d4aa] text-xs font-bangers tracking-wider">
              ~ crédit temps ~
            </span>
          </div>
          <div className="text-4xl font-bold text-[#f5f5f5] mb-1">
            {user.timeBalance}{" "}
            <span className="text-lg text-[#a3a3a3] font-normal">TIME</span>
          </div>
          <div className="text-[#5c5c5c] text-xs font-mono mt-2">
            {user.walletAddress}
          </div>
        </div>

        {/* Hero Level card */}
        <Link
          href="/rewards"
          className="block bg-[#111111] border border-[#262626] rounded-2xl p-6 hover:border-[#00d4aa]/30 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#a3a3a3] text-sm font-medium">
              Progression Hero
            </span>
            <span className="text-[#00d4aa] text-xs font-bangers tracking-wider">
              ~ niveau ~
            </span>
          </div>
          <div className="flex items-center gap-4 mb-3">
            <div className="shrink-0">
              <HeroLevelBadge level={heroLevel} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xl font-bold text-[#f5f5f5] group-hover:text-[#00d4aa] transition-colors">
                {heroLevel.name}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-[#a3a3a3]">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-[#00d4aa]" />
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

        {/* Service stats */}
        <div className="bg-[#111111] border border-[#262626] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#a3a3a3] text-sm font-medium">
              Mes services
            </span>
            <span className="text-[#00d4aa] text-xs font-bangers tracking-wider">
              ~ super-pouvoirs ~
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div>
              <div className="text-2xl font-bold text-[#f5f5f5]">
                {activeServices}
              </div>
              <div className="text-xs text-[#a3a3a3]">actif{activeServices > 1 ? "s" : ""}</div>
            </div>
            <div className="w-px h-8 bg-[#262626]" />
            <div>
              <div className="text-2xl font-bold text-[#a3a3a3]">
                {inactiveServices}
              </div>
              <div className="text-xs text-[#5c5c5c]">inactif{inactiveServices > 1 ? "s" : ""}</div>
            </div>
            {(activeServices + inactiveServices) > 0 && (
              <Link
                href="/my-services"
                className="ml-auto text-[#00d4aa] hover:text-[#00b894] text-sm transition-colors underline underline-offset-2"
              >
                Voir tout
              </Link>
            )}
          </div>
        </div>

        {/* Booking stats */}
        <div className="bg-[#111111] border border-[#262626] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#a3a3a3] text-sm font-medium">
              Mes réservations
            </span>
            <span className="text-[#00d4aa] text-xs font-bangers tracking-wider">
              ~ missions ~
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/bookings"
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <CalendarCheck className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#f5f5f5] group-hover:text-[#00d4aa] transition-colors">
                  {myBookingsCount}
                </div>
                <div className="text-xs text-[#a3a3a3]">
                  réservation{myBookingsCount > 1 ? "s" : ""} en cours
                </div>
              </div>
            </Link>
            <div className="w-px h-10 bg-[#262626]" />
            <Link
              href="/bookings"
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Inbox className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#f5f5f5] group-hover:text-[#00d4aa] transition-colors">
                  {missionsCount}
                </div>
                <div className="text-xs text-[#a3a3a3]">
                  mission{missionsCount > 1 ? "s" : ""} reçue{missionsCount > 1 ? "s" : ""}
                </div>
              </div>
            </Link>
          </div>

          {recentTransactions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#262626]">
              <p className="text-xs text-[#5c5c5c] mb-2">Dernières transactions</p>
              {recentTransactions.map((tx) => {
                const labels: Record<string, string> = {
                  escrow: "Réservation",
                  release: "Service terminé",
                  refund: "Remboursement",
                };
                const isCredit = tx.type !== "escrow";
                return (
                  <div key={tx.id} className="flex items-center justify-between text-xs py-1">
                    <span className="text-[#a3a3a3]">{labels[tx.type] || tx.type}</span>
                    <span className={isCredit ? "text-[#00d4aa]" : "text-red-400"}>
                      {isCredit ? "+" : "-"}{tx.amount} TIME
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Ma zone d'intervention */}
        <div className="bg-[#111111] border border-[#262626] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#a3a3a3] text-sm font-medium">
              Ma zone d&apos;intervention
            </span>
            <span className="text-[#00d4aa] text-xs font-bangers tracking-wider">
              ~ local heroes ~
            </span>
          </div>
          {user.city ? (
            <div className="space-y-1">
              <p className="text-[#f5f5f5] font-semibold">
                {user.city}
                {user.department ? `, ${user.department}` : ""}
              </p>
              {user.serviceRadiusKm && (
                <p className="text-xs text-[#a3a3a3]">
                  Rayon : {user.serviceRadiusKm} km
                </p>
              )}
              <p className="text-xs text-[#a3a3a3]">
                Disponible en ligne : {user.availableOnline ? "Oui" : "Non"}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-[#5c5c5c] text-sm">
                Complète ta zone pour devenir visible comme héros local.
              </p>
            </div>
          )}
          <Link
            href="/settings/location"
            className="inline-flex items-center gap-1.5 mt-3 text-xs text-[#00d4aa] hover:text-[#00b894] transition-colors font-medium"
          >
            <MapPin className="w-3.5 h-3.5" />
            Modifier ma localisation
          </Link>
        </div>

        {/* Réputation */}
        <div className="bg-[#111111] border border-[#262626] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#a3a3a3] text-sm font-medium">
              Réputation
            </span>
            <span className="text-[#00d4aa] text-xs font-bangers tracking-wider">
              ~ confiance ~
            </span>
          </div>
          {ratingsReceivedCount > 0 ? (
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-yellow-400">
                {user.reputation.toFixed(1)}
                <span className="text-sm text-[#a3a3a3] font-normal"> / 5</span>
              </div>
              <div className="text-xs text-[#a3a3a3]">
                Basé sur {ratingsReceivedCount} avis
                {ratingsReceivedCount > 1 ? "s" : ""}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[#f5f5f5] text-lg font-semibold">
                Nouveau héros
              </p>
              <p className="text-[#5c5c5c] text-xs mt-1">
                Aucun avis pour le moment
              </p>
            </div>
          )}
        </div>

        {/* Action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/wallet"
            className="bg-[#111111] border border-[#262626] rounded-2xl p-5 hover:border-[#00d4aa]/30 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#00d4aa]/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-[#00d4aa]" />
              </div>
              <span className="font-semibold text-[#f5f5f5]">Mon Wallet</span>
            </div>
            <p className="text-[#a3a3a3] text-sm">
              Voir mes transactions et mon historique
            </p>
          </Link>

          <Link
            href="/services"
            className="bg-[#111111] border border-[#262626] rounded-2xl p-5 hover:border-[#00d4aa]/30 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#00d4aa]/10 flex items-center justify-center">
                <Search className="w-5 h-5 text-[#00d4aa]" />
              </div>
              <span className="font-semibold text-[#f5f5f5]">
                Explorer les services
              </span>
            </div>
            <p className="text-[#a3a3a3] text-sm">
              Trouve un héros et réserve avec tes TIME
            </p>
          </Link>

          <Link
            href="/urgent"
            className="bg-[#111111] border border-[#262626] rounded-2xl p-5 hover:border-[#f59e0b]/30 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#f59e0b]" />
              </div>
              <span className="font-semibold text-[#f5f5f5]">
                Aide urgente
              </span>
            </div>
            <p className="text-[#a3a3a3] text-sm">
              Publie un besoin urgent ou aide un voisin
            </p>
          </Link>

          <Link
            href="/services/new"
            className="bg-[#111111] border border-[#262626] rounded-2xl p-5 hover:border-[#00d4aa]/30 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#00d4aa]/10 flex items-center justify-center">
                <Plus className="w-5 h-5 text-[#00d4aa]" />
              </div>
              <span className="font-semibold text-[#f5f5f5]">
                Proposer un service
              </span>
            </div>
            <p className="text-[#a3a3a3] text-sm">
              Partage ton super-pouvoir et gagne des TIME
            </p>
          </Link>

          <Link
            href="/availability"
            className="bg-[#111111] border border-[#262626] rounded-2xl p-5 hover:border-[#00d4aa]/30 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#00d4aa]/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#00d4aa]" />
              </div>
              <span className="font-semibold text-[#f5f5f5]">
                Mes disponibilités
              </span>
            </div>
            <p className="text-[#a3a3a3] text-sm">
              Ajoute tes créneaux pour que les Heroes réservent
            </p>
          </Link>

          <Link
            href="/agenda"
            className="bg-[#111111] border border-[#262626] rounded-2xl p-5 hover:border-[#00d4aa]/30 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#00d4aa]/10 flex items-center justify-center">
                <CalendarCheck className="w-5 h-5 text-[#00d4aa]" />
              </div>
              <span className="font-semibold text-[#f5f5f5]">
                Mon agenda
              </span>
            </div>
            <p className="text-[#a3a3a3] text-sm">
              Voir mes missions à venir et passées
            </p>
          </Link>
        </div>

        {/* Comics footer */}
        <div className="text-center pt-6">
          <span className="font-bangers text-[#00d4aa] text-xs tracking-wider opacity-40">
            ~ nous sommes tous des super-héros du quotidien ~
          </span>
        </div>
      </main>
    </div>
  );
}
