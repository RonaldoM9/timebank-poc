"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Clock, ArrowLeft, Calendar, User, Shield } from "lucide-react";

interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  ratePerHour: number;
  status: string;
  createdAt: string;
  provider: {
    id: string;
    name: string;
    walletAddress: string;
  };
}

export default function ServiceDetailClient({ service, isOwner }: { service: ServiceDetail; isOwner: boolean }) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="border-b border-[#262626]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-[#00d4aa]" />
            <span className="font-anton text-lg tracking-wide text-[#f5f5f5]">
              TimeBank
            </span>
          </div>
          <Link
            href="/services"
            className="text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors text-sm"
          >
            Marketplace
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la marketplace
        </Link>

        <div className="bg-[#111111] border border-[#262626] rounded-2xl p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bangers tracking-wider text-[#00d4aa] bg-[#00d4aa]/5 rounded-full px-2.5 py-0.5">
                  {service.category}
                </span>
                {service.status === "inactive" && (
                  <span className="text-xs font-bangers tracking-wider text-[#5c5c5c] bg-[#5c5c5c]/10 rounded-full px-2.5 py-0.5">
                    INACTIF
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-anton tracking-wide text-[#f5f5f5] mb-1">
                {service.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-[#a3a3a3] mt-2">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#5c5c5c]" />
                  {service.provider.name}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#5c5c5c]" />
                  Publié le {new Date(service.createdAt).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-bold text-[#00d4aa]">
                {service.ratePerHour}
              </div>
              <div className="text-xs text-[#5c5c5c]">TIME / heure</div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#262626] mb-6" />

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-[#a3a3a3] mb-2 uppercase tracking-wider">
              Description
            </h2>
            <p className="text-[#f5f5f5] leading-relaxed whitespace-pre-wrap">
              {service.description}
            </p>
          </div>

          {/* Provider info */}
          <div className="bg-[#181818] border border-[#262626] rounded-xl p-4 mb-6">
            <h2 className="text-xs font-semibold text-[#a3a3a3] mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              À propos du héros
            </h2>
            <p className="text-[#f5f5f5] font-semibold">{service.provider.name}</p>
            <p className="text-[#a3a3a3] text-xs mt-0.5">
              {service.provider.walletAddress
                ? `Wallet : ${service.provider.walletAddress.slice(0, 16)}…`
                : "Nouveau héros — aucune transaction encore"}
            </p>
            <p className="text-[10px] text-[#5c5c5c] font-bangers tracking-wider mt-1">
              RÉPUTATION : NOUVEAU HÉROS
            </p>
          </div>

          {/* CTA */}
          {isOwner ? (
            <div className="bg-[#00d4aa]/5 border border-[#00d4aa]/20 rounded-xl p-4 text-center">
              <p className="text-[#00d4aa] text-sm font-semibold mb-2">
                C&apos;est votre service
              </p>
              <Link
                href="/my-services"
                className="text-[#a3a3a3] hover:text-[#f5f5f5] text-sm underline transition-colors"
              >
                Gérer mes services
              </Link>
            </div>
          ) : session ? (
            <div className="bg-[#181818] border border-[#262626] rounded-xl p-4 text-center">
              <p className="text-[#a3a3a3] text-sm mb-2">
                Réserver ce service avec mes TIME
              </p>
              <button
                disabled
                className="bg-[#00d4aa]/30 text-black/50 font-semibold rounded-xl px-6 py-2.5 cursor-not-allowed text-sm"
              >
                Réserver avec mes TIME
              </button>
              <p className="text-[#5c5c5c] text-xs mt-2">
                La réservation arrive au Lot 2B
              </p>
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="block w-full bg-[#00d4aa] hover:bg-[#00b894] text-black font-semibold rounded-xl py-3 text-center transition-colors text-sm"
            >
              Se connecter pour réserver
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
