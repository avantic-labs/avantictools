import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
export default function robots(): MetadataRoute.Robots {
  return {
    rules:
      process.env.VERCEL_ENV === "preview"
        ? { userAgent: "*", disallow: "/" }
        : { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
