import Link from "next/link";
import type { ReactNode } from "react";

export function WaitlistLayout({
  eyebrow,
  title,
  lead,
  steps,
  aside,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  steps: ReadonlyArray<readonly [string, string]>;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-[1240px] px-5 py-12 sm:px-8 lg:py-20">
      <Link href="/" className="spec link-draw text-ink-faint hover:text-ink">
        &larr; Back
      </Link>

      <div className="mt-12 grid gap-y-16 lg:mt-16 lg:grid-cols-12 lg:gap-x-16">
        <div className="lg:col-span-5">
          <p className="spec text-ink-faint">{eyebrow}</p>
          <h1 className="mt-6 font-display text-headline font-extrabold text-ink">{title}</h1>
          <p className="mt-7 max-w-[40ch] text-lead text-ink-soft">{lead}</p>

          <dl className="mt-14 border-t border-rule">
            {steps.map(([term, description], index) => (
              <div
                key={term}
                className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-b border-rule py-5"
              >
                <dt className="spec pt-1.5 text-vermilion-deep">
                  {String(index + 1).padStart(2, "0")}
                </dt>
                <dd>
                  <p className="font-display font-bold text-ink">{term}</p>
                  <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-soft">
                    {description}
                  </p>
                </dd>
              </div>
            ))}
          </dl>

          {aside ? <div className="mt-14 hidden lg:block">{aside}</div> : null}
        </div>

        <div className="lg:col-span-6 lg:col-start-7">{children}</div>
      </div>
    </section>
  );
}
