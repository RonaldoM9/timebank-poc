import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getHeroPassport } from "@/lib/heroPassport";
import HeroPassportForm from "./HeroPassportForm";

export default async function HeroPassportPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, city: true },
  });
  if (!user) redirect("/auth/signin");

  const passport = await getHeroPassport(user.id);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-anton tracking-wide text-[#f5f5f5] mb-1">
            Hero Passport
          </h1>
          <p className="text-[#a3a3a3] text-sm">
            Complète ton profil pour aider les autres héros à mieux te connaître
          </p>
        </div>

        <HeroPassportForm
          initialData={passport}
          hasLocation={!!user.city}
        />
      </main>
    </div>
  );
}
