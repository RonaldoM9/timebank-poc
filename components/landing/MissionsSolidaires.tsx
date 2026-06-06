import { Smartphone, ShoppingBag, Coffee, ArrowRight } from "lucide-react";

interface MissionCardProps {
  icon: React.ReactNode;
  title: string;
  category: string;
  categoryClass?: string;
  description: string;
  meta: string;
}

const missions = [
  {
    icon: <Smartphone className="w-5 h-5 text-tb-accent" />,
    title: "Aide smartphone pour débutants",
    category: "Tech",
    categoryClass: "bg-tb-accent-soft text-tb-accent",
    description:
      "Apprends à utiliser ton téléphone, installer des applis et naviguer sur internet.",
    meta: "2 TIME · Chez Karim",
  },
  {
    icon: <ShoppingBag className="w-5 h-5 text-amber-600" />,
    title: "Courses accompagnées",
    category: "Solidaire",
    categoryClass: "bg-amber-50 text-amber-600",
    description:
      "Accompagnement pour les courses du marché le samedi matin.",
    meta: "1 TIME · Quartier Centre",
  },
  {
    icon: <Coffee className="w-5 h-5 text-tb-accent" />,
    title: "Café partagé & papote",
    category: "Communauté",
    categoryClass: "bg-tb-accent-soft text-tb-accent",
    description:
      "Un moment convivial pour échanger autour d'un café. Zéro compétence requise.",
    meta: "0 TIME · Place du Marché",
  },
];

function MissionCard({
  icon,
  title,
  category,
  categoryClass = "bg-tb-accent-soft text-tb-accent",
  description,
  meta,
}: MissionCardProps) {
  return (
    <div className="bg-tb-surface border border-tb-border rounded-2xl overflow-hidden hover:border-tb-accent/30 transition-all shadow-sm">
      {/* Top: icon + category badge */}
      <div className="bg-tb-accent-soft p-4 flex items-center gap-3">
        {icon}
        <span
          className={`px-2 py-0.5 rounded-md text-xs font-medium ${categoryClass}`}
        >
          {category}
        </span>
      </div>

      {/* Middle: title + description */}
      <div className="p-4">
        <h3 className="font-semibold text-tb-text-primary mb-1">{title}</h3>
        <p className="text-sm text-tb-text-secondary">{description}</p>
      </div>

      {/* Bottom: meta info */}
      <div className="px-4 pb-4 flex items-center gap-2 text-xs text-tb-text-muted">
        {meta}
      </div>
    </div>
  );
}

export default function MissionsSolidaires() {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-tb-text-primary mb-2">
          Missions solidaires près de chez toi
        </h2>
        <p className="text-sm text-tb-text-secondary mb-8">
          Découvre des missions près de chez toi, proposées par des membres de
          la communauté.
        </p>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {missions.map((mission, index) => (
            <MissionCard key={index} {...mission} />
          ))}
        </div>

        {/* Link */}
        <a
          href="#"
          className="inline-flex items-center gap-1 text-tb-accent hover:underline font-medium"
        >
          Voir toutes les missions →
        </a>
      </div>
    </section>
  );
}
