import type { MetadataRoute } from "next";
import { categories, tools } from "@/data/tools";
import { SITE_URL } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "/",
    "/about",
    "/privacy",
    ...categories.map((category) => `/categories/${category.id}`),
    ...tools.map((tool) => `/tools/${tool.slug}`),
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
