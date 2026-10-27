import type { MetadataRoute } from "next";
import { BRAND_LIST, CATALOG_RACKETS } from "@/lib/catalog";
import { OWN_RACKETS } from "@/lib/own-line";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE.url, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/rackets/`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/merken/`, changeFrequency: "monthly", priority: 0.7 },
    ...BRAND_LIST.map((b) => ({ url: `${SITE.url}/merken/${b.slug}/`, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...[...CATALOG_RACKETS, ...OWN_RACKETS].map((r) => ({ url: `${SITE.url}/rackets/${r.id}/`, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
