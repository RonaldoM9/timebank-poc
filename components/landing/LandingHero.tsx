import Link from "next/link";
import { Clock, Wallet, MapPin, Award, Sparkles } from "lucide-react";

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle gradient bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#00d4aa]/5 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 pt-20 pb-16 md:pt-28 md:pb-20 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left: text */}
          <div className="flex-1 text-center lg:text-left">
            {/* Tagline */}
            <p className="font-bangers text-[#00d4aa] text-sm tracking-[0.2em] uppercase mb-4 opacity-70">
              ~ La banque du temps des héros du quotidien ~
            </p>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#f5f5f5] mb-4 leading-tight">
              TimeHeroes
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-[#a3a3a3] max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              Rends service, gagne du <span className="text-[#00d4aa] font-semibold">TIME</span>
              , reçois de l&apos;aide et fais grandir l&apos;entraide locale.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#00d4aa] text-[#0a0a0a] font-semibold hover:bg-[#00b894] transition-all text-sm sm:text-base"
              >
                <Sparkles className="w-4 h-4" />
                Tester la démo
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#262626] text-[#f5f5f5] hover:border-[#00d4aa]/50 hover:bg-[#111111] transition-all text-sm sm:text-base"
              >
                Voir les missions
              </Link>
            </div>

            {/* Demo credentials */}
            <div className="mt-6 inline-block border border-[#262626] rounded-xl px-4 py-3 bg-[#111111]/60">
              <p className="text-xs text-[#a3a3a3] mb-1">
                Compte démo :
              </p>
              <p className="text-sm font-mono text-[#f5f5f5]">
                demo@timeheroes.fr{" "}
                <span className="text-[#5c5c5c]">/</span>{" "}
                <span className="text-[#5c5c5c]">TimeHeroes2026!</span>
              </p>
            </div>
          </div>

          {/* Right: visual cards */}
          <div className="flex-1 w-full max-w-md">
            <div className="grid grid-cols-2 gap-3">
              {/* Wallet TIME */}
              <div className="bg-[#111111] border border-[#262626] rounded-2xl p-4 hover:border-[#00d4aa]/30 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-[#00d4aa]" />
                  <span className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">
                    Wallet
                  </span>
                </div>
                <p className="text-2xl font-bold text-[#f5f5f5]">
                  128{" "}
                  <span className="text-sm font-normal text-[#a3a3a3]">TIME</span>
                </p>
                <p className="text-xs text-[#5c5c5c] mt-1">échangés</p>
              </div>

              {/* Mission */}
              <div className="bg-[#111111] border border-[#262626] rounded-2xl p-4 hover:border-[#00d4aa]/30 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-[#00d4aa]" />
                  <span className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">
                    Missions
                  </span>
                </div>
                <p className="text-2xl font-bold text-[#f5f5f5]">
                  37
                </p>
                <p className="text-xs text-[#5c5c5c] mt-1">réalisées</p>
              </div>

              {/* Badge Hero */}
              <div className="bg-[#111111] border border-[#262626] rounded-2xl p-4 hover:border-[#00d4aa]/30 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-[#00d4aa]" />
                  <span className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">
                    Heroes
                  </span>
                </div>
                <p className="text-2xl font-bold text-[#f5f5f5]">
                  18
                </p>
                <p className="text-xs text-[#5c5c5c] mt-1">actifs</p>
              </div>

              {/* Impact */}
              <div className="bg-[#111111] border border-[#262626] rounded-2xl p-4 hover:border-[#00d4aa]/30 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#00d4aa]" />
                  <span className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">
                    Badges
                  </span>
                </div>
                <p className="text-2xl font-bold text-[#f5f5f5]">
                  42
                </p>
                <p className="text-xs text-[#5c5c5c] mt-1">débloqués</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
