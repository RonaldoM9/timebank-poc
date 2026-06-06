import Link from "next/link";
import { Sparkles, Play } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-16 md:pt-28 md:pb-20">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left column */}
          <div className="flex-1 text-center lg:text-left">
            {/* Tagline */}
            <p className="text-tb-accent font-bangers text-sm tracking-[0.2em] uppercase mb-4 opacity-70">
              ~ La banque du temps des héros du quotidien ~
            </p>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-tb-text-primary mb-6 leading-tight">
              Rends service, gagne du{" "}
              <span className="text-tb-accent">TIME</span>, deviens le héros de
              ton quartier.
            </h1>

            {/* Subtitle */}
            <p className="text-tb-text-secondary text-lg md:text-xl max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              Une plateforme d&apos;entraide locale, sécurisée et solidaire.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-tb-accent text-white font-semibold hover:bg-tb-accent-hover transition-all text-sm sm:text-base"
              >
                <Sparkles className="w-4 h-4" />
                Tester la démo
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-tb-border text-tb-text-primary hover:border-tb-accent transition-all text-sm sm:text-base"
              >
                Explorer les missions
              </Link>
            </div>

            {/* Demo credentials */}
            <div className="mt-6 inline-block border border-tb-border bg-tb-surface rounded-xl px-4 py-3">
              <p className="text-xs text-tb-text-secondary mb-1">
                Compte démo :
              </p>
              <p className="text-sm font-mono text-tb-text-primary">
                demo@timeheroes.fr{" "}
                <span className="text-tb-text-muted">/</span>{" "}
                <span className="text-tb-text-muted">TimeHeroes2026!</span>
              </p>
            </div>
          </div>

          {/* Right column */}
          <div className="flex-1 w-full max-w-md">
            <div className="bg-tb-surface border border-tb-border rounded-2xl overflow-hidden shadow-sm">
              {/* Video placeholder with play button */}
              <div className="aspect-video bg-tb-accent-soft flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-tb-accent-soft flex items-center justify-center border-2 border-tb-accent/30">
                  <Play className="w-7 h-7 text-tb-accent ml-0.5" />
                </div>
              </div>

              {/* Text below */}
              <div className="p-4">
                <p className="font-semibold text-tb-text-primary mb-1">
                  Témoignage d&apos;un héros local
                </p>
                <p className="italic text-tb-text-secondary text-sm">
                  &laquo; J&apos;ai aidé une voisine, puis on est devenus amis.
                  &raquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
