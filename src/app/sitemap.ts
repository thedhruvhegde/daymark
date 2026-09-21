import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://daymark-daily.vercel.app", lastModified: new Date(), changeFrequency: "weekly", priority: 1 }];
}
