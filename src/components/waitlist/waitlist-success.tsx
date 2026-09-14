import Link from "next/link";
import type { Ref } from "react";

export function WaitlistSuccess({
  body,
  ref,
}: {
  body: string;
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="status"
      // scroll-mt keeps focus() from tucking this under the sticky header
      className="scroll-mt-28 border border-ink bg-paper p-8 outline-none sm:p-12"
    >
      <span className="inline-block -rotate-2 border-2 border-vermilion px-3 py-1.5 spec text-vermilion-deep">
        Received
      </span>
      <h2 className="mt-8 font-display text-title font-extrabold text-ink">
        You&rsquo;re on the list.
      </h2>
      <p className="mt-4 max-w-[48ch] leading-relaxed text-ink-soft">{body}</p>
      <Link href="/" className="btn btn-ghost mt-10">
        Back to the start
      </Link>
    </div>
  );
}
