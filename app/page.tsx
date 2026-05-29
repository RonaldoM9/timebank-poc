import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import PublicHeader from "@/components/landing/PublicHeader";
import LandingHero from "@/components/landing/LandingHero";
import ProblemSection from "@/components/landing/ProblemSection";
import SolutionSection from "@/components/landing/SolutionSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FeatureGrid from "@/components/landing/FeatureGrid";
import ComparisonSection from "@/components/landing/ComparisonSection";
import ImpactStatsSection from "@/components/landing/ImpactStatsSection";
import UseCasesSection from "@/components/landing/UseCasesSection";
import FinalCTA from "@/components/landing/FinalCTA";
import LandingFooter from "@/components/landing/LandingFooter";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <PublicHeader />
      <main>
        <LandingHero />
        <ProblemSection />
        <SolutionSection />
        <HowItWorksSection />
        <FeatureGrid />
        <ComparisonSection />
        <ImpactStatsSection />
        <UseCasesSection />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
