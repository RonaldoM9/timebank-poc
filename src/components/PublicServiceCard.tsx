"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface PublicServiceCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  ratePerHour: number;
}

export default function PublicServiceCard({
  id,
  title,
  description,
  category,
  ratePerHour,
}: PublicServiceCardProps) {
  return (
    <div className="bg-tb-surface border border-tb-border rounded-2xl p-5 hover:border-tb-accent/20 transition-all group flex flex-col">
      <div className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs font-bangers tracking-wider text-tb-accent bg-tb-accent/5 rounded-full px-2 py-0.5">
            {category}
          </span>
          <span className="text-tb-accent font-semibold text-sm whitespace-nowrap ml-2">
            {ratePerHour} TIME/h
          </span>
        </div>
        <h3 className="font-semibold text-tb-text-primary mb-1 line-clamp-1 group-hover:text-tb-accent transition-colors">
          {title}
        </h3>
        <p className="text-tb-text-secondary text-sm line-clamp-2 mb-3">
          {description}
        </p>
      </div>
      <div className="pt-3 border-t border-tb-border">
        <Link
          href={`/services/${id}`}
          className="inline-flex items-center gap-1 bg-tb-surface hover:bg-tb-border border border-tb-border rounded-xl px-3 py-1.5 text-xs text-tb-text-secondary hover:text-tb-text-primary transition-colors"
        >
          Voir le service
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
