export default function ComparisonSection() {
  return (
    <section className="border-t border-[#262626] py-16 md:py-20">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-[#f5f5f5] text-center mb-4">
          Pas une marketplace de plus
        </h2>
        <p className="text-center text-[#a3a3a3] text-sm mb-10 max-w-xl mx-auto">
          Les plateformes classiques permettent de trouver quelqu&apos;un à payer.
          <br />
          TimeHeroes propose une autre logique : faire circuler le temps dans une
          communauté.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-w-3xl mx-auto border border-[#262626] rounded-2xl overflow-hidden">
          {/* Header row */}
          <div className="bg-[#111111] p-4 md:p-5 border-b border-r border-[#262626]">
            <span className="text-sm font-semibold text-[#a3a3a3] uppercase tracking-wider">
              Marketplace classique
            </span>
          </div>
          <div className="bg-[#111111] p-4 md:p-5 border-b border-[#262626]">
            <span className="text-sm font-semibold text-[#00d4aa] uppercase tracking-wider">
              TimeHeroes
            </span>
          </div>

          {/* Rows */}
          {[
            ["Paiement en euros", "Échange en TIME"],
            ["Relation client / prestataire", "Relation entre Heroes"],
            ["Prestation ponctuelle", "Entraide suivie"],
            ["Note commerciale", "Réputation d'engagement"],
            ["Service payé", "Temps donné, reçu et valorisé"],
          ].map(([traditional, timeheroes], i) => (
            <>
              <div
                key={`t-${i}`}
                className="p-4 md:p-5 border-r border-[#262626] bg-[#0a0a0a]"
              >
                <p className="text-sm text-[#a3a3a3]">{traditional}</p>
              </div>
              <div
                key={`th-${i}`}
                className="p-4 md:p-5 border-b border-[#262626] last:border-b-0 bg-[#0a0a0a]"
              >
                <p className="text-sm text-[#f5f5f5] font-medium">{timeheroes}</p>
              </div>
            </>
          ))}
        </div>

        <p className="text-center text-xs text-[#5c5c5c] mt-6 max-w-lg mx-auto">
          Ici, l&apos;utilisateur n&apos;est pas un prestataire ou un client.
          C&apos;est un <strong className="text-[#a3a3a3]">Hero</strong> qui
          aide, reçoit de l&apos;aide et construit sa réputation d&apos;engagement.
        </p>
      </div>
    </section>
  );
}
