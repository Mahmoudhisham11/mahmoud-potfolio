import type { MetadataRoute } from "next";
import { CONFIG, PROJECTS, SITE } from "@/lib/data";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      images: [new URL(CONFIG.photo, SITE.url).toString(), ...PROJECTS.map((p) => new URL(p.image.src, SITE.url).toString())],
    },
  ];
}
