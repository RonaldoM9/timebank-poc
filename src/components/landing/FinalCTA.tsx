import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="border-t border-tb-border py-16 md:py-20">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-tb-text-primary mb-4">
          Et si ton quartier avait déjà ses héros ?
        </h2>
        <p className="text-tb-text-secondary text-sm md:text-base mb-8 max-w-lg mx-auto leading-relaxed">
          Teste TimeHeroes et découvre comment le temps peut redevenir une force collective.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
            Voir les missions
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
