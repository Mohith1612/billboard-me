import type { Metadata } from "next";
import { JerseyPlate } from "@/components/marketing/asset-plates";
import { BrandWaitlistForm } from "@/components/waitlist/brand-form";
import { WaitlistLayout } from "@/components/waitlist/waitlist-layout";

export const metadata: Metadata = {
  title: "For brands",
  description:
    "Join the Billboard.me brand waitlist. Physical placements on people your customers already watch.",
  alternates: { canonical: "/waitlist/brand" },
};

const STEPS = [
  ["We read it", "Every enquiry is read by a person, usually within a few days."],
  [
    "We match by hand",
    "No self-serve inventory yet. We go and find the sellers who fit what you described.",
  ],
  [
    "You approve everything",
    "Placement, seller and proof. Nothing runs until you have signed off on all three.",
  ],
] as const;

export default function BrandWaitlistPage() {
  return (
    <WaitlistLayout
      eyebrow="Waitlist / Brands"
      title="Rent attention that leaves the browser."
      lead="Tell us the budget, the timing and who you are trying to reach. We come back with what is genuinely available, or we tell you there is nothing yet."
      steps={STEPS}
      aside={<JerseyPlate />}
    >
      <BrandWaitlistForm />
    </WaitlistLayout>
  );
}
