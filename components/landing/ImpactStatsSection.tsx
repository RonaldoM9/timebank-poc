import { Clock, CheckCircle, Users, Award, Star } from "lucide-react";

const stats = [
  { icon: Clock, value: "128", label: "TIME échangés" },
  { icon: CheckCircle, value: "37", label: "Missions réalisées" },
  { icon: Users, value: "18", label: "Heroes actifs" },
  { icon: Award, value: "42", label: "Badges débloqués" },
  { icon: Star, value: "4,7 / 5", label: "Satisfaction" },
];

export default function ImpactStatsSection() {
  return (
    <section id="impact" className="border-t border-[#262626] py-16 md:py-20">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-[#f5f5f5] text-center mb-4">
          L&apos;impact en chiffres
        </h2>
        <p className="text-center text-[#a3a3a3] text-sm mb-10 max-w-xl mx-auto">
          TimeHeroes permet de rendre visible ce qui reste souvent invisible : les
          heures d&apos;aide, les services rendus et l&apos;impact local généré par
          une communauté.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-[#111111] to-[#0d1a15] border border-[#262626] rounded-2xl p-5 text-center hover:border-[#00d4aa]/30 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#00d4aa]/10 border border-[#00d4aa]/20 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-[#00d4aa]" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-[#f5f5f5] mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-[#a3a3a3]">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-[#5c5c5c] mt-6">
          * Chiffres issus de la démonstration — données réelles à venir
        </p>
      </div>
    </section>
  );
}
