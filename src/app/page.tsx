import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import PublicHeader from "@/components/landing/PublicHeader";
import LandingFooter from "@/components/landing/LandingFooter";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-tb-bg flex flex-col">
      <PublicHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-3xl w-full text-center space-y-8">
          {/* ─── CORE MESSAGE ─── */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-tb-accent-soft text-tb-accent-dark font-bold text-sm px-4 py-1.5 rounded-full">
              ⏱️ Échange de temps · Entraide locale · Zéro euro
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-tb-text-primary leading-tight">
              Échangez du <span className="text-tb-accent">temps</span>,<br />
              pas de l&apos;<span className="line-through text-tb-text-muted">argent</span>
            </h1>
            <p className="text-lg sm:text-xl text-tb-text-secondary max-w-xl mx-auto leading-relaxed">
              TimeHeroes met en relation des personnes de confiance dans ton quartier.
              Tu donnes une heure, tu reçois une heure. Simple, gratuit, solidaire.
            </p>
          </div>

          {/* ─── 2 CTAS ─── */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/auth/signin"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-tb-accent hover:bg-tb-accent-hover text-white font-bold text-base px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-tb-accent/20"
            >
              🤝 Je veux aider
            </a>
            <a
              href="/auth/signin"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-tb-border hover:border-tb-accent text-tb-text-primary hover:text-tb-accent font-bold text-base px-8 py-3.5 rounded-xl transition-all"
            >
              🔍 J&apos;ai besoin d&apos;aide
            </a>
          </div>

          {/* ─── DEMO BOX ─── */}
          <div className="bg-white border border-tb-border rounded-2xl p-5 max-w-md mx-auto text-left">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">🎮</span>
              <span className="text-sm font-bold text-tb-text-primary">Démo sans inscription</span>
            </div>
            <div className="bg-tb-bg rounded-xl p-3 font-mono text-xs text-tb-text-secondary space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-tb-text-muted w-16 shrink-0">Email :</span>
                <span className="text-tb-text-primary font-medium">demo@timeheroes.fr</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-tb-text-muted w-16 shrink-0">Mot de passe :</span>
                <span className="text-tb-text-primary font-medium">TimeHeroes2026</span>
              </div>
            </div>
            <a
              href="/auth/signin"
              className="mt-3 block w-full text-center bg-tb-accent hover:bg-tb-accent-hover text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
            >
              Tester la démo →
            </a>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
