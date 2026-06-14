"use client";

import Link from "next/link";
import { Star, MessageSquare, User } from "lucide-react";

interface PublicRatingCardProps {
  score: number;
  comment: string | null;
  createdAt: string;
  clientName: string;
  clientId: string;
  serviceTitle: string;
}

export default function PublicRatingCard({
  score,
  comment,
  createdAt,
  clientName,
  clientId,
  serviceTitle,
}: PublicRatingCardProps) {
  const date = new Date(createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-tb-surface border border-tb-border rounded-2xl p-4">
      {/* Score stars */}
      <div className="flex items-center gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= score
                ? "fill-yellow-400 text-yellow-400"
                : "text-tb-border"
            }`}
          />
        ))}
        <span className="text-sm text-tb-text-secondary ml-1">
          {score}/5
        </span>
      </div>

      {/* Commentaire */}
      {comment && (
        <div className="flex items-start gap-2 mb-2">
          <MessageSquare className="w-3.5 h-3.5 text-tb-text-muted mt-0.5 flex-shrink-0" />
          <p className="text-sm text-tb-text-primary italic leading-relaxed">
            &ldquo;{comment}&rdquo;
          </p>
        </div>
      )}

      {/* Client + date + service */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-tb-text-muted mt-2 pt-2 border-t border-tb-border">
        <div className="flex items-center gap-1">
          <User className="w-3 h-3" />
          <Link
            href={`/profile/${clientId}`}
            className="text-tb-text-secondary hover:text-tb-accent transition-colors"
          >
            {clientName}
          </Link>
        </div>
        <span>—</span>
        <span>Service : {serviceTitle}</span>
        <span className="ml-auto">{date}</span>
      </div>
    </div>
  );
}
