import { HeartHandshake } from "lucide-react";
import Link from "next/link";

export default function PotCommunSection() {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-tb-text-primary mb-2">
          Le pot commun finance les missions solidaires.
        </h2>
        <p className="text-sm text-tb-text-secondary mb-8">
          Un facilitateur veille à ce que les TIME soient distribués
          équitablement pour les missions de la communauté.
        </p>

        <div className="bg-tb-surface border border-tb-border rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="bg-tb-accent-soft rounded-2xl w-fit p-3 shrink-0">
              <HeartHandshake className="w-12 h-12 text-tb-accent" />
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-tb-text-secondary">
                Des membres donnent leurs TIME inutilisés. Un facilitateur
                valide les demandes. Les TIME servent à aider ceux qui en ont
                besoin.
              </p>
              <div>
                <Link
                  href="/wallet"
                  className="inline-block bg-tb-accent text-white rounded-xl px-6 py-3 font-medium hover:opacity-90 transition-opacity"
                >
                  Contribuer au pot commun
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
