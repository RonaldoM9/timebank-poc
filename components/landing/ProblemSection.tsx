export default function ProblemSection() {
  return (
    <section className="border-t border-[#262626] py-16 md:py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#f5f5f5] mb-8">
          Pourquoi TimeHeroes ?
        </h2>

        <div className="space-y-4 text-[#a3a3a3] text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
          <p>
            L&apos;entraide existe partout : entre voisins, parents, collègues,
            associations ou membres d&apos;un quartier.
          </p>
          <p>
            Mais elle reste souvent dispersée dans des groupes WhatsApp, des
            échanges informels ou des plateformes de services payants.
          </p>
          <p>
            Résultat : le temps donné est rarement reconnu, suivi ou valorisé.
          </p>
        </div>

        <div className="mt-8 p-6 rounded-2xl border border-[#262626] bg-[#111111]/50 max-w-xl mx-auto">
          <p className="text-[#f5f5f5] font-semibold text-base md:text-lg">
            Le problème n&apos;est pas le manque de solidarité.
          </p>
          <p className="text-[#00d4aa] font-semibold text-base md:text-lg mt-1">
            Le problème, c&apos;est qu&apos;elle est mal organisée.
          </p>
        </div>
      </div>
    </section>
  );
}
