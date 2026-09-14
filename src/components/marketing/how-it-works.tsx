import type { CSSProperties } from "react";
import { JerseyPlate } from "./asset-plates";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

const STEPS = [
  {
    number: "01",
    title: "Claim a surface",
    body: "Pick something you already own and already carry. A MacBook lid. A jersey. Tell us honestly how many people actually see it in a week.",
  },
  {
    number: "02",
    title: "Set your price",
    body: "You name the rate and the run. Thirty days of commuting, one tournament, a whole season. If nobody bites, change the number.",
  },
  {
    number: "03",
    title: "Wear the sponsor",
    body: "We handle the decal or the print and send it to you. You put it on and then go and live the life you were going to live anyway.",
  },
  {
    number: "04",
    title: "Send proof, get paid",
    body: "Photos, a short clip, a link to the post. Proof is what closes the campaign and releases the payout. No proof, no payout — for anybody.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-paper">
      <div className="mx-auto w-full max-w-[1240px] px-5 py-24 sm:px-8 lg:py-36">
        <div className="grid gap-y-16 lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-4">
            <p data-reveal className="spec text-ink-faint">
              02 / How it works
            </p>
            <h2
              data-reveal
              style={delay(80)}
              className="mt-7 font-display text-headline font-extrabold text-ink"
            >
              Four steps. No agency in the middle.
            </h2>
            <div data-reveal style={delay(200)} className="mt-14 hidden lg:block">
              <JerseyPlate />
            </div>
          </div>

          <ol className="lg:col-span-7 lg:col-start-6">
            {STEPS.map((step, index) => (
              <li
                key={step.number}
                data-reveal
                style={delay(index * 90)}
                className="grid grid-cols-[2.75rem_1fr] gap-x-5 border-t border-rule py-8 first:border-t-0 first:pt-0 sm:grid-cols-[5rem_1fr] sm:gap-x-8"
              >
                <span className="spec pt-2 text-vermilion-deep">{step.number}</span>
                <div>
                  <h3 className="font-display text-title font-bold text-ink">{step.title}</h3>
                  <p className="mt-3 max-w-[54ch] leading-relaxed text-ink-soft">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
