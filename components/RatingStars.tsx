"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface RatingStarsProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function RatingStars({
  value,
  onChange,
  readOnly = false,
  size = "md",
}: RatingStarsProps) {
  const [hovered, setHovered] = useState(0);

  const sizeClass = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-8 h-8" : "w-6 h-6";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            className={`${readOnly ? "cursor-default" : "cursor-pointer"} transition-colors ${
              filled ? "text-yellow-400" : "text-[#333]"
            } hover:scale-110 active:scale-95 transition-transform`}
            aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
          >
            <Star className={`${sizeClass} fill-current`} />
          </button>
        );
      })}
    </div>
  );
}
