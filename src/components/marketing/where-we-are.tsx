import type { CSSProperties } from "react";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

const FACTS: ReadonlyArray<readonly [string, string]> = [
  ["Stage", "Invite-only"],
  ["Surfaces live", "MacBook · Jersey / T-shirt"],
  ["Sellers", "Recruited by hand"],
  ["Public listings", "Not yet"],
  ["What we count", "Closed, paid campaigns"],
];

export function WhereWeAre() {
  return (
    <section className="bg-ink text-chalk">
      <div className="mx-auto w-full max-w-[1240px] px-5 py-24 sm:px-8 lg:py-36">
        <div className="grid gap-y-14 lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-6">
            <p data-reveal className="spec text-flare">
              03 / Straight answer
            </p>
            <h2
              data-reveal
              style={delay(80)}
              className="mt-7 font-display text-headline font-extrabold"
            >
              Where we actually are.
            </h2>
            <p
              data-reveal
              style={delay(160)}
              className="mt-8 max-w-[46ch] text-lead text-chalk-muted"
            >
              We are not pretending to be a marketplace yet. Today this is a short list, a
              founder who calls people himself, and a small number of campaigns we intend to
              finish properly — sponsor happy, proof filed, seller paid.
            </p>
            <p data-reveal style={delay(240)} className="mt-6 max-w-[46ch] text-chalk-muted">
              If that sounds slow, it is. It is also the only way to find out whether any of
              this is worth building.
            </p>
          </div>

          <dl data-reveal style={delay(160)} className="lg:col-span-5 lg:col-start-8">
            {FACTS.map(([term, value]) => (
              <div
                key={term}
                className="flex items-baseline justify-between gap-6 border-b border-rule-dark py-4 first:border-t first:border-rule-dark"
              >
                <dt className="spec text-chalk-muted">{term}</dt>
                <dd className="text-right text-[0.9375rem] text-chalk">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
