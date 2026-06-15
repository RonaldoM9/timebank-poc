import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getCollectiveMissionById } from "@/lib/collective-missions";
import ConnectedHeader from "@/components/ConnectedHeader";
import CollectiveMissionDetailClient from "./CollectiveMissionDetailClient";

export const metadata = {
  title: "Mission collective — TimeHeroes",
  description: "Détails d'une mission collective TimeHeroes.",
};

export default async function CollectiveMissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  const viewerId = (session?.user as { id?: string })?.id;
  const viewerName = (session?.user as { name?: string })?.name;
  const viewerRole = (session?.user as { role?: string })?.role ?? "USER";

  const data = await getCollectiveMissionById(id, viewerId);
  if (!data) notFound();

  const { mission, participants } = data;

  return (
    <>
      <ConnectedHeader />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <CollectiveMissionDetailClient
          mission={mission}
          participants={participants}
          viewer={{
            id: viewerId ?? "",
            name: viewerName ?? "Visiteur",
            role: viewerRole,
          }}
        />
      </main>

      <footer className="border-t border-tb-border py-8 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs text-tb-text-muted">
            TimeHeroes — Banque du temps des héros du quotidien.
          </p>
        </div>
      </footer>
    </>
  );
}
