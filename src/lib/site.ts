export const siteConfig = {
  name: "Billboard.me",
  tagline: "Your stuff is advertising space",
  description:
    "Billboard.me turns things people already own — a MacBook lid, a jersey, a T-shirt — into advertising space brands can rent. Invite-only while we prove the loop.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contactEmail: "hello@billboard.me",
} as const;
