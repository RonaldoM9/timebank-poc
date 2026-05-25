"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { Clock, LogOut, Wallet, Search, Plus, Layers } from "lucide-react";

interface DashboardUser {
  id: string;
  name: string;
  timeBalance: number;
  walletAddress: string;
}

export default function DashboardClient({
  user,
  activeServices,
  inactiveServices,
}: {
  user: DashboardUser;
  activeServices: number;
  inactiveServices: number;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#262626]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-[#00d4aa]" />
            <span className="font-anton text-lg tracking-wide text-[#f5f5f5]">
              TimeBank
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="flex items-center gap-2 text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Hero greeting */}
        <div>
          <h1 className="text-3xl font-anton tracking-wide text-[#f5f5f5] mb-1">
            Bonjour {user.name} 👋
          </h1>
          <p className="text-[#a3a3a3] text-sm">
            Bienvenue sur votre tableau de bord TimeBank
          </p>
        </div>

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
