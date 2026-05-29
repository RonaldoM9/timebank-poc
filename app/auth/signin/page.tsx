import { Anton, Bangers } from "next/font/google";
import { Clock } from "lucide-react";

const anton = Anton({ subsets: ["latin"], weight: "400", display: "swap" });
const bangers = Bangers({ subsets: ["latin"], weight: "400", display: "swap" });

const errorMessages: Record<string, string> = {
  invalid: "Email ou mot de passe incorrect",
  missing: "Veuillez remplir tous les champs",
  server: "Erreur serveur, réessayez",
};

export default async function SigninPage(props: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const searchParams = await props.searchParams;
  const error = searchParams?.error;
  const errorMsg = error ? errorMessages[error] || "Erreur inconnue" : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#0a0a0a", color: "#f5f5f5" }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <Clock className="w-8 h-8" style={{ color: "#00d4aa" }} />
            <h1 className="text-3xl tracking-wide" style={{ fontFamily: anton.style.fontFamily, color: "#f5f5f5" }}>
              TimeHeroes
            </h1>
          </div>
          <p className="text-sm" style={{ color: "#a3a3a3" }}>
            Content de vous revoir
          </p>
        </div>

        {/* Card */}
        <div className="border rounded-2xl p-8" style={{ backgroundColor: "#111111", borderColor: "#262626" }}>
          <h2 className="text-xl font-semibold mb-6">Connexion</h2>

          {errorMsg && (
            <div className="mb-4 border rounded-xl px-4 py-2.5 text-sm" style={{ backgroundColor: "rgba(220,38,38,0.2)", borderColor: "rgba(220,38,38,0.4)", color: "#f87171" }}>
              {errorMsg}
            </div>
          )}

          {/* Native HTML form — POST to custom login endpoint (no CSRF needed) */}
          <form action="/api/auth/login" method="POST" className="space-y-4">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: "#a3a3a3" }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full border rounded-xl px-4 py-2.5"
                style={{
                  backgroundColor: "#181818",
                  borderColor: "#262626",
                  color: "#f5f5f5",
                }}
                placeholder="vous@exemple.com"
              />
            </div>

            <div>
              <label className="block text-sm mb-1.5" style={{ color: "#a3a3a3" }}>
                Mot de passe
              </label>
              <input
                type="password"
                name="password"
                required
                className="w-full border rounded-xl px-4 py-2.5"
                style={{
                  backgroundColor: "#181818",
                  borderColor: "#262626",
                  color: "#f5f5f5",
                }}
                placeholder="Votre mot de passe"
              />
            </div>

            <button
              type="submit"
              className="w-full font-semibold rounded-xl px-4 py-3 transition-colors"
              style={{ backgroundColor: "#00d4aa", color: "#0a0a0a" }}
            >
              Se connecter
            </button>
          </form>

          {/* ─── Connexion démo 1-clic ── */}
          <div className="mt-6 pt-6 border-t" style={{ borderColor: "#262626" }}>
            <form action="/api/auth/login" method="POST" className="space-y-2">
              <input type="hidden" name="email" value="demo@timeheroes.fr" />
              <input type="hidden" name="password" value="TimeHeroes2026!" />
              <button
                type="submit"
                className="w-full font-semibold rounded-xl px-4 py-3 transition-colors text-sm"
                style={{ backgroundColor: "#1a3a2a", border: "1px solid #00d4aa", color: "#00d4aa" }}
              >
                ⚡ Connexion démo
              </button>
            </form>
            <p className="text-xs mt-2 text-center" style={{ color: "#666" }}>
              Compte démo : demo@timeheroes.fr / TimeHeroes2026!
            </p>
          </div>

          <p className="text-center text-sm mt-6" style={{ color: "#a3a3a3" }}>
            Pas encore de compte ?{" "}
            <a href="/auth/signup" style={{ color: "#00d4aa" }}>
              S&apos;inscrire
            </a>
          </p>
        </div>

        {/* Comics badge */}
        <div className="text-center mt-6">
          <span
            className="text-xs tracking-wider"
            style={{
              fontFamily: bangers.style.fontFamily,
              color: "#00d4aa",
              opacity: 0.6,
            }}
          >
            ~ prêt à échanger du temps ? ~
          </span>
        </div>
      </div>
    </div>
  );
}
