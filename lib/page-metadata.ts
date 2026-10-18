import type { Metadata } from "next";
import { SITE_URL } from "./site";

export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  const url = `${SITE_URL}${path}`;
  const images = [
    {
      url: `${SITE_URL}/opengraph-image`,
      width: 1200,
      height: 630,
      alt: "AVANTIC Tools — a product of AVANTIC LABS",
    },
  ];
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: "AVANTIC Tools",
      title,
      description,
      url,
      images,
      locale: "en_NG",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((image) => image.url),
    },
  };
}
