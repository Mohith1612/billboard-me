import type { Metadata } from "next";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Premise } from "@/components/marketing/premise";
import { SurfaceTicker } from "@/components/marketing/surface-ticker";
import { TwoDoors } from "@/components/marketing/two-doors";
import { WhereWeAre } from "@/components/marketing/where-we-are";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <SurfaceTicker />
      <Premise />
      <HowItWorks />
      <WhereWeAre />
      <TwoDoors />
    </>
  );
}
