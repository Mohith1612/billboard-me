import type { CSSProperties } from "react";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

export function Premise() {
  return (
    <section className="bg-paper-deep">
      <div className="mx-auto w-full max-w-[1240px] px-5 py-24 sm:px-8 lg:py-36">
        <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-7">
            <p data-reveal className="spec text-ink-faint">
              01 / The premise
            </p>
            <h2
              data-reveal
              style={delay(80)}
              className="mt-7 max-w-[15ch] font-display text-headline font-extrabold text-ink"
            >
              Attention doesn&rsquo;t only live on screens.
            </h2>
          </div>

          <div className="self-end lg:col-span-4 lg:col-start-9">
            <p data-reveal style={delay(180)} className="text-lead text-ink-soft">
              Media buyers rent surfaces for a living — buildings, buses, boards. Meanwhile
              the most-looked-at surface in a café is the lid of somebody&rsquo;s laptop,
              and nobody is selling it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
