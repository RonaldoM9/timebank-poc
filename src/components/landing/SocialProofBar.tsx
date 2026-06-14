import React from 'react';

const stats = [
  '⭐ 12 842 héros',
  '34 129 heures échangées',
  '98% satisfaits',
];

const SocialProofBar: React.FC = () => {
  return (
    <div className="bg-tb-accent-soft py-2.5 px-4">
      <p className="text-center text-sm text-tb-text-secondary">
        {stats.map((stat, index) => {
          // Split on the first space or digit boundary to isolate the number part
          // e.g. "⭐ 12 842 héros" -> "12 842" / "héros"
          // e.g. "34 129 heures échangées" -> "34 129" / "heures échangées"
          const match = stat.match(/^([\w⭐\s]*?)(\d[\d\s]*)(.*)$/);
          const prefix = match ? match[1] : '';
          const number = match ? match[2] : '';
          const suffix = match ? match[3] : '';

          return (
            <React.Fragment key={index}>
              {index > 0 && <span className="mx-1">·</span>}
              {prefix && <span>{prefix}</span>}
              {number && <span className="text-tb-accent">{number}</span>}
              {suffix}
            </React.Fragment>
          );
        })}
      </p>
    </div>
  );
};

export default SocialProofBar;
