"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Erreur lors de l'inscription"
        );
        return;
      }

      router.push("/auth/signin");
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <Clock className="w-8 h-8 text-[#00d4aa]" />
            <h1 className="text-3xl font-anton tracking-wide text-[#f5f5f5]">
              TimeBank
            </h1>
          </div>
          <p className="text-[#a3a3a3] text-sm">
            Rejoignez la communauté des super-héros du quotidien
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#111111] border border-[#262626] rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-6">Créer un compte</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[#a3a3a3] mb-1.5">
                Nom
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-[#181818] border border-[#262626] rounded-xl px-4 py-2.5 text-[#f5f5f5] placeholder-[#5c5c5c] focus:outline-none focus:border-[#00d4aa] transition-colors"
                placeholder="Votre nom"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-[#a3a3a3] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-[#181818] border border-[#262626] rounded-xl px-4 py-2.5 text-[#f5f5f5] placeholder-[#5c5c5c] focus:outline-none focus:border-[#00d4aa] transition-colors"
                placeholder="vous@exemple.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-[#a3a3a3] mb-1.5">
                Mot de passe
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-[#181818] border border-[#262626] rounded-xl px-4 py-2.5 text-[#f5f5f5] placeholder-[#5c5c5c] focus:outline-none focus:border-[#00d4aa] transition-colors"
                placeholder="6 caractères minimum"
                minLength={6}
                required
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-800/40 rounded-xl px-4 py-2.5 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00d4aa] hover:bg-[#00b894] text-[#0a0a0a] font-semibold rounded-xl px-4 py-3 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Inscription...
                </>
              ) : (
                "Créer mon compte"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[#a3a3a3] mt-6">
            Déjà un compte ?{" "}
            <Link
              href="/auth/signin"
              className="text-[#00d4aa] hover:text-[#00b894] transition-colors"
            >
              Se connecter
            </Link>
          </p>
        </div>

        {/* Comics badge */}
        <div className="text-center mt-6">
          <span className="font-bangers text-[#00d4aa] text-xs tracking-wider opacity-60">
            ~ nous sommes tous des super-héros ~
          </span>
        </div>
      </div>
    </div>
  );
}
