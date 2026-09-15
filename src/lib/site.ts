import { publicEnv } from "./env/public";

export const siteConfig = {
  name: "Billboard.me",
  tagline: "Your stuff is advertising space",
  description:
    "Billboard.me turns things people already own — a MacBook lid, a jersey, a T-shirt — into advertising space brands can rent. Invite-only while we prove the loop.",
  url: publicEnv.siteUrl,
  contactEmail: "hello@billboard.me",
} as const;
