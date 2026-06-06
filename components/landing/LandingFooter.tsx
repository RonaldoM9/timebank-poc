import Link from "next/link";
import { Clock } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="border-t border-tb-border py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-tb-accent" />
            <span className="font-anton text-base tracking-wide text-tb-text-primary">
              TimeHeroes
            </span>
          </div>

          <nav className="flex items-center gap-6 text-xs text-tb-text-secondary">
            <Link href="/services" className="hover:text-tb-accent transition-colors">
              Missions
            </Link>
            <a href="#impact" className="hover:text-tb-accent transition-colors">
              Impact
            </a>
            <a href="#how-it-works" className="hover:text-tb-accent transition-colors">
              Comment ça marche
            </a>
            <Link href="/auth/signup" className="hover:text-tb-accent transition-colors">
              S&apos;inscrire
            </Link>
          </nav>

          <p className="text-xs text-tb-text-muted flex items-center gap-1">
            Fait avec ❤️ pour l&apos;entraide
          </p>
        </div>
      </div>
    </footer>
  );
}
