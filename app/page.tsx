import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getImpactStats } from "@/lib/impact";
import PublicHeader from "@/components/landing/PublicHeader";
import SocialProofBar from "@/components/landing/SocialProofBar";
import HeroSection from "@/components/landing/HeroSection";
import TrustRow from "@/components/landing/TrustRow";
import ActionCards from "@/components/landing/ActionCards";
import MissionsSolidaires from "@/components/landing/MissionsSolidaires";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import PotCommunSection from "@/components/landing/PotCommunSection";
import ImpactSection from "@/components/landing/ImpactSection";
import FinalCTA from "@/components/landing/FinalCTA";
import LandingFooter from "@/components/landing/LandingFooter";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    redirect("/dashboard");
  }

  const stats = await getImpactStats();

  return (
    <div className="min-h-screen bg-tb-bg">
      <PublicHeader />
      <SocialProofBar />
      <main>
        <HeroSection />
        <TrustRow />
        <ActionCards />
        <MissionsSolidaires />
        <HowItWorksSection />
        <PotCommunSection />
        <ImpactSection stats={stats} />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
