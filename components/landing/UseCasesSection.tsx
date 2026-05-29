import { Building, GraduationCap, HeartHandshake, Briefcase, Globe } from "lucide-react";

const useCases = [
  {
    icon: Building,
    title: "Quartier",
    desc: "Organiser l'entraide entre voisins.",
  },
  {
    icon: GraduationCap,
    title: "École",
    desc: "Aider les parents à s'entraider : devoirs, logistique, numérique.",
  },
  {
    icon: HeartHandshake,
    title: "Association",
    desc: "Valoriser le temps bénévole et les missions solidaires.",
  },
  {
    icon: Briefcase,
    title: "Entreprise",
    desc: "Créer une communauté d'entraide interne.",
  },
  {
    icon: Globe,
    title: "ESS / Collectivité",
    desc: "Mesurer les heures d'entraide et l'impact local.",
  },
];

export default function UseCasesSection() {
  return (
    <section className="border-t border-[#262626] py-16 md:py-20">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-[#f5f5f5] text-center mb-4">
          Pour qui ?
        </h2>
        <p className="text-center text-[#a3a3a3] text-sm mb-10 max-w-lg mx-auto">
          TimeHeroes s&apos;adapte à plusieurs communautés.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {useCases.map((uc, index) => {
            const Icon = uc.icon;
            return (
              <div
                key={index}
                className="bg-[#111111] border border-[#262626] rounded-xl p-5 text-center hover:border-[#00d4aa]/30 hover:bg-[#141414] transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#00d4aa]/10 border border-[#00d4aa]/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#00d4aa]/20 transition-colors">
                  <Icon className="w-5 h-5 text-[#00d4aa]" />
                </div>
                <h3 className="text-[#f5f5f5] font-semibold text-sm mb-1">
                  {uc.title}
                </h3>
                <p className="text-[#a3a3a3] text-xs leading-relaxed">
                  {uc.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
