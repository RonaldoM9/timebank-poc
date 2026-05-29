import { Clock, ArrowRight } from "lucide-react";

export default function SolutionSection() {
  return (
    <section className="border-t border-[#262626] py-16 md:py-20">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-[#f5f5f5] text-center mb-8">
          La solution : une banque du temps moderne
        </h2>

        <div className="text-center text-[#a3a3a3] text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
          <p>
            TimeHeroes transforme chaque service rendu en crédit{" "}
            <span className="text-[#00d4aa] font-semibold">TIME</span>.
          </p>
        </div>

        {/* Formula card */}
        <div className="bg-[#111111] border border-[#262626] rounded-2xl p-6 md:p-8 max-w-xl mx-auto mb-10">
          <div className="flex items-center gap-3 text-center justify-center mb-4">
            <div className="bg-[#00d4aa]/10 border border-[#00d4aa]/20 rounded-xl px-4 py-2">
              <span className="text-[#00d4aa] font-bold text-lg">
                1 heure d&apos;aide donnée
              </span>
            </div>
            <ArrowRight className="w-5 h-5 text-[#a3a3a3]" />
            <div className="bg-[#00d4aa]/10 border border-[#00d4aa]/20 rounded-xl px-4 py-2">
              <span className="text-[#00d4aa] font-bold text-lg">
                1 TIME gagné
              </span>
            </div>
          </div>
          <p className="text-center text-[#a3a3a3] text-sm">
            Ce TIME peut ensuite être utilisé pour recevoir de l&apos;aide d&apos;un autre membre.
          </p>
        </div>

        {/* Example card */}
        <div className="bg-gradient-to-br from-[#111111] to-[#0d1a15] border border-[#262626] rounded-2xl p-6 md:p-8 max-w-xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-[#00d4aa]" />
            <span className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">
              Exemple
            </span>
          </div>
          <ul className="space-y-3 text-[#a3a3a3] text-sm md:text-base">
            <li className="flex items-start gap-2">
              <span className="text-[#00d4aa] mt-0.5">1.</span>
              <span>Tu aides quelqu&apos;un 1h à configurer son téléphone.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00d4aa] mt-0.5">2.</span>
              <span>Tu gagnes <strong className="text-[#f5f5f5]">1 TIME</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00d4aa] mt-0.5">3.</span>
              <span>
                Tu utilises ensuite ce TIME pour recevoir de l&apos;aide en
                bricolage, administratif ou soutien scolaire.
              </span>
            </li>
          </ul>
        </div>

        <p className="text-center text-xs text-[#5c5c5c] mt-6">
          Le TIME n&apos;est pas une monnaie financière — c&apos;est un crédit
          d&apos;entraide.
        </p>
      </div>
    </section>
  );
}
