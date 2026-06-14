import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function ProfileNotFound() {
  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-white border border-[#e5e7eb] rounded-full flex items-center justify-center mx-auto mb-6">
          <SearchX className="w-10 h-10 text-[#9ca3af]" />
        </div>
        <h1 className="text-2xl font-anton tracking-wide text-[#111827] mb-2">
          Héros introuvable
        </h1>
        <p className="text-sm text-[#6b7280] mb-8">
          Ce profil n&apos;existe pas ou n&apos;est plus disponible.
        </p>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 bg-[#00d4aa] text-[#0a0a0a] font-medium rounded-xl px-5 py-2.5 hover:bg-[#00b894] transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la marketplace
        </Link>
      </div>
    </div>
  );
}
