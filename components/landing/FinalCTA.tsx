import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="border-t border-[#262626] py-16 md:py-20">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#f5f5f5] mb-4">
          Prêt à tester TimeHeroes ?
        </h2>
        <p className="text-[#a3a3a3] text-sm md:text-base mb-8 max-w-lg mx-auto leading-relaxed">
          Explore la démo, découvre les missions, consulte ton wallet TIME et vois
          comment l&apos;entraide peut devenir mesurable.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
            Explorer les missions
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/impact"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#262626] text-[#a3a3a3] hover:border-[#00d4aa]/30 hover:text-[#f5f5f5] transition-all text-sm sm:text-base"
          >
            Voir l'impact
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Demo credentials again */}
        <div className="mt-8 inline-block border border-[#262626] rounded-xl px-4 py-3 bg-[#111111]/60">
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
    </section>
  );
}
