import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { Wordmark } from "./wordmark";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-ink text-chalk">
      <div className="mx-auto w-full max-w-[1240px] px-5 py-16 sm:px-8">
        <div className="flex flex-col gap-10 border-b border-rule-dark pb-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Wordmark className="text-2xl" />
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-chalk-muted">
              Physical advertising inventory. Invite-only while we prove the loop with real,
              paid, finished campaigns.
            </p>
          </div>

          <nav className="flex flex-col gap-3" aria-label="Footer">
            <span className="spec text-chalk-muted">Waitlist</span>
            <Link href="/waitlist/seller" className="link-draw w-fit text-[0.9375rem] text-chalk">
              I want to sell space
            </Link>
            <Link href="/waitlist/brand" className="link-draw w-fit text-[0.9375rem] text-chalk">
              I&rsquo;m a brand
            </Link>
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="link-draw mt-2 w-fit text-[0.9375rem] text-chalk"
            >
              {siteConfig.contactEmail}
            </a>
          </nav>
        </div>

        <div className="flex flex-col gap-2 pt-6 spec text-chalk-muted sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} {siteConfig.name}</span>
          <span>Stage: invite-only &middot; 2 asset types</span>
        </div>
      </div>
    </footer>
  );
}
