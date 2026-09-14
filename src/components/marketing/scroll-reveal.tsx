"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Reveals every `[data-reveal]` element on the page as it scrolls into view.
 *
 * Mounted once per layout instead of wrapping each section in a client
 * component, so the pages themselves stay server-rendered. Stagger is set on
 * the element with `style={{ "--delay": "120ms" }}`.
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (nodes.length === 0) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      for (const node of nodes) node.dataset.visible = "true";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.visible = "true";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );

    for (const node of nodes) {
      if (node.dataset.visible !== "true") observer.observe(node);
    }

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
