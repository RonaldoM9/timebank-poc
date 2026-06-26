"use client";

import { Sparkles } from "lucide-react";
import type { AgendaEvent } from "./page";
import ConnectedHeader from "@/components/ConnectedHeader";
import CalendarView from "./CalendarView";

export default function AgendaClient({
  events,
  userId,
  userName,
}: {
  events: AgendaEvent[];
  userId: string;
  userName: string;
}) {
  return (
    <div className="min-h-screen bg-tb-surface-elevated animate-fade-in-up">
      <ConnectedHeader />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl font-anton tracking-wide text-tb-text-primary mb-1">
            Mon agenda
          </h1>
          <p className="text-tb-text-secondary text-sm">
            Retrouve toutes tes missions à venir et passées, {userName}.
          </p>
          <span className="inline-block mt-2 font-bangers text-tb-accent text-xs tracking-wider opacity-60">
            ~ organise ton temps de héros ~
          </span>
        </div>

        {/* Calendar view */}
        <CalendarView events={events} />

        {/* Comics footer */}
        <div className="text-center pt-8">
          <span className="font-bangers text-tb-accent text-xs tracking-wider opacity-40">
            ~ chaque mission accomplie rend le monde meilleur ~
          </span>
        </div>
      </main>
    </div>
  );
}
