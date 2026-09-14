import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/waitlist/seller", "/waitlist/brand"].map((path) => ({
    url: new URL(path, siteConfig.url).toString(),
    lastModified: new Date(),
  }));
}
