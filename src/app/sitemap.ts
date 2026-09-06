import type { MetadataRoute } from "next";
import { EGGS } from "@/data/steal-an-egg";
import { absolute } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: absolute("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...EGGS.map((egg) => ({
      url: absolute(`/egg/${egg.id}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
