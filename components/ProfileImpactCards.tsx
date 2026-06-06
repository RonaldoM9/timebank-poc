"use client";

interface ProfileImpactCardsProps {
  reputation: number;
  activeServicesCount: number;
  missionsCompleted: number;
  totalTimeEarned: number;
  ratingsCount: number;
}

interface KpiCard {
  label: string;
  value: string;
  subtext: string;
  accent: boolean;
}

export default function ProfileImpactCards({
  reputation,
  activeServicesCount,
  missionsCompleted,
  totalTimeEarned,
  ratingsCount,
}: ProfileImpactCardsProps) {
  const cards: KpiCard[] = [
    {
      label: "Réputation",
      value: ratingsCount > 0 ? `${reputation.toFixed(1)}/5` : "—",
      subtext: ratingsCount > 0 ? `Basée sur ${ratingsCount} avis` : "Aucun avis",
      accent: true,
    },
    {
      label: "Services actifs",
      value: `${activeServicesCount}`,
      subtext: activeServicesCount > 0 ? "Super-pouvoirs proposés" : "Aucun service actif",
      accent: false,
    },
    {
      label: "Missions réalisées",
      value: `${missionsCompleted}`,
      subtext: missionsCompleted > 0 ? "Communauté servie" : "Encore aucun",
      accent: false,
    },
    {
      label: "TIME gagnés",
      value: `${totalTimeEarned}`,
      subtext: totalTimeEarned > 0 ? "Via les missions" : "Encore aucun",
      accent: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-tb-surface border border-tb-border rounded-2xl p-4 text-center ${
            card.accent ? "border-tb-accent/20" : ""
          }`}
        >
          <p
            className={`text-2xl font-anton tracking-wide mb-0.5 ${
              card.accent ? "text-tb-accent" : "text-tb-text-primary"
            }`}
          >
            {card.value}
          </p>
          <p className="text-xs text-tb-text-secondary font-medium">{card.label}</p>
          <p className="text-[10px] text-tb-text-muted mt-0.5">{card.subtext}</p>
        </div>
      ))}
    </div>
  );
}
