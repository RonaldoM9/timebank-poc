"use client";

import Link from "next/link";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#181818] border border-[#262626] flex items-center justify-center mb-4">
        {icon ?? <Inbox className="w-7 h-7 text-[#5c5c5c]" />}
      </div>
      <h3 className="text-lg font-semibold text-[#f5f5f5] mb-1">{title}</h3>
      <p className="text-sm text-[#a3a3a3] max-w-xs mb-6">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00d4aa] text-[#0a0a0a] font-semibold text-sm hover:bg-[#00b894] transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
