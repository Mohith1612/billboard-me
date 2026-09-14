import type { Metadata } from "next";
import { MacbookPlate } from "@/components/marketing/asset-plates";
import { SellerWaitlistForm } from "@/components/waitlist/seller-form";
import { WaitlistLayout } from "@/components/waitlist/waitlist-layout";

export const metadata: Metadata = {
  title: "Sell space",
  description:
    "Join the Billboard.me seller waitlist. Tell us what you already own and carry, and what a month of it is worth.",
  alternates: { canonical: "/waitlist/seller" },
};

const STEPS = [
  ["We read it", "Every submission is read by a person, not scored by a model."],
  [
    "We may call",
    "If what you carry matches something a sponsor is already asking for, you hear from us directly.",
  ],
  [
    "You stay in control",
    "Nothing goes on your laptop or your back until you have agreed to the sponsor and the price.",
  ],
] as const;

export default function SellerWaitlistPage() {
  return (
    <WaitlistLayout
      eyebrow="Waitlist / Sellers"
      title="Sell the surfaces you already carry."
      lead="Tell us what you own and where it actually gets seen. We approve sellers by hand, so specifics move this along faster than enthusiasm does."
      steps={STEPS}
      aside={<MacbookPlate />}
    >
      <SellerWaitlistForm />
    </WaitlistLayout>
  );
}
