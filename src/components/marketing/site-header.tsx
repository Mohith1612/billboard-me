"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Wordmark } from "./wordmark";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24);
        queued = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
        scrolled ? "border-rule bg-paper" : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1240px] items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="shrink-0" aria-label="Billboard.me home">
          <Wordmark className="text-[1.0625rem]" />
        </Link>

        <nav className="flex items-center gap-5 sm:gap-7" aria-label="Primary">
          <Link href="/waitlist/seller" className="spec link-draw hidden text-ink-soft hover:text-ink sm:inline-block">
            Sell space
          </Link>
          <Link
            href="/waitlist/brand"
            className="btn btn-primary h-10 px-4 text-[0.6875rem] tracking-[0.12em]"
          >
            I&rsquo;m a brand
          </Link>
        </nav>
      </div>
    </header>
  );
}
