import Link from "next/link";
import { Clock, Heart } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="border-t border-[#262626] py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#00d4aa]" />
            <span className="font-anton text-base tracking-wide text-[#f5f5f5]">
              TimeHeroes
            </span>
          </div>

          <nav className="flex items-center gap-6 text-xs text-[#a3a3a3]">
            <Link href="/services" className="hover:text-[#f5f5f5] transition-colors">
              Missions
            </Link>
            <a href="#impact" className="hover:text-[#f5f5f5] transition-colors">
              Impact
            </a>
            <a href="#how-it-works" className="hover:text-[#f5f5f5] transition-colors">
              Comment ça marche
            </a>
            <Link href="/auth/signup" className="hover:text-[#f5f5f5] transition-colors">
              S&apos;inscrire
            </Link>
          </nav>

          <p className="text-xs text-[#5c5c5c] flex items-center gap-1">
            Fait avec <Heart className="w-3 h-3 text-[#00d4aa]" /> pour l&apos;entraide
          </p>
        </div>
      </div>
    </footer>
  );
}
