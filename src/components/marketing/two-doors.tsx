import Link from "next/link";
import type { CSSProperties } from "react";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

export function TwoDoors() {
  return (
    <section className="bg-paper-deep">
      <div className="mx-auto w-full max-w-[1240px] px-5 py-24 sm:px-8 lg:py-36">
        <p data-reveal className="spec text-ink-faint">
          04 / Get on the list
        </p>
        <h2
          data-reveal
          style={delay(80)}
          className="mt-7 max-w-[16ch] font-display text-headline font-extrabold text-ink"
        >
          Two doors. Pick the one that&rsquo;s yours.
        </h2>

        <div className="mt-16 grid gap-6 lg:grid-cols-12">
          <div
            data-reveal
            style={delay(120)}
            className="flex flex-col border border-paper-edge bg-paper p-8 sm:p-11 lg:col-span-7"
          >
            <p className="spec text-vermilion-deep">For people with surfaces</p>
            <h3 className="mt-6 max-w-[14ch] font-display text-title font-extrabold text-ink">
              You are already carrying an audience.
            </h3>
            <p className="mt-4 max-w-[48ch] leading-relaxed text-ink-soft">
              Tell us what you own, where it gets seen and what you think a month of it is
              worth. We approve sellers by hand, so the more specific you are, the faster
              this moves.
            </p>
            <div className="mt-10 pt-2">
              <Link href="/waitlist/seller" className="btn btn-primary">
                I want to sell space
              </Link>
            </div>
          </div>

          <div
            data-reveal
            style={delay(220)}
            className="flex flex-col bg-ink p-8 text-chalk sm:p-11 lg:col-span-5"
          >
            <p className="spec text-flare">For brands</p>
            <h3 className="mt-6 max-w-[14ch] font-display text-title font-extrabold">
              Buy attention that leaves the browser.
            </h3>
            <p className="mt-4 leading-relaxed text-chalk-muted">
              Small, specific, physical placements on people your customers already watch.
              Tell us the budget and the timing and we will come back with real inventory.
            </p>
            <div className="mt-10 pt-2">
              <Link href="/waitlist/brand" className="btn btn-invert">
                I&rsquo;m a brand
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
