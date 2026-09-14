import Link from "next/link";
import type { CSSProperties } from "react";
import { MacbookPlate } from "./asset-plates";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

export function Hero() {
  return (
    <section className="relative">
      <div className="relative mx-auto w-full max-w-[1240px] px-5 pb-20 sm:px-8 lg:pb-28">
        {/* Faint column guides — a spec-sheet grid rather than a decorative glow. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-5 inset-y-0 hidden opacity-60 sm:inset-x-8 lg:block"
          style={{
            backgroundImage: "linear-gradient(to right, var(--color-rule) 1px, transparent 1px)",
            backgroundSize: "calc(100% / 6) 100%",
            maskImage: "linear-gradient(to bottom, transparent, #000 20%, #000 60%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 20%, #000 60%, transparent)",
          }}
        />

        <div className="relative">
          <div
            className="rise flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-t border-rule pt-3 spec text-ink-faint"
            style={delay(0)}
          >
            <span>Billboard.me — physical ad inventory</span>
            <span className="hidden md:inline">Stage / invite-only</span>
            <span>Surfaces live / 02</span>
          </div>

          <div className="mt-12 grid gap-y-16 lg:mt-16 lg:grid-cols-12 lg:gap-x-10">
            <div className="lg:col-span-7">
              <h1
                className="rise font-display text-display font-extrabold text-ink"
                style={delay(140)}
              >
                Your stuff is
                <br />
                <span className="mark">advertising</span>
                <br />
                space.
              </h1>

              <p
                className="rise mt-11 max-w-[42ch] text-lead text-ink-soft"
                style={delay(260)}
              >
                The laptop lid you open in every café. The jersey you wear to every match.
                Brands already pay for attention like that — you just were never the one
                charging for it.
              </p>

              <div className="rise mt-11 flex flex-col gap-3 sm:flex-row" style={delay(380)}>
                <Link href="/waitlist/seller" className="btn btn-primary">
                  I want to sell space
                </Link>
                <Link href="/waitlist/brand" className="btn btn-ghost">
                  I&rsquo;m a brand
                </Link>
              </div>

              <p className="rise mt-7 spec text-ink-faint" style={delay(480)}>
                No fees while we&rsquo;re invite-only &middot; every seller approved by hand
              </p>
            </div>

            <div className="rise lg:col-span-4 lg:col-start-9 lg:mt-28" style={delay(560)}>
              <MacbookPlate />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
