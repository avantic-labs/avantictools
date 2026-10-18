import type { Metadata } from "next";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/inter/latin-ext-400.css";
import "@fontsource/inter/latin-ext-600.css";
import "@fontsource/inter/latin-ext-700.css";
import "./globals.css";
import { SiteHeader, SiteFooter } from "@/components/product/SiteChrome";
import { SITE_URL, ALLOW_INDEXING } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AVANTIC Tools",
    template: "%s | AVANTIC Tools",
  },
  description:
    "Free everyday tools to scan documents, fix files, prepare application photos, create invoices and work with text.",
  applicationName: "AVANTIC Tools",
  openGraph: {
    type: "website",
    siteName: "AVANTIC Tools",
    title: "AVANTIC Tools",
    description: "Everyday tasks, sorted. A product of AVANTIC LABS.",
    locale: "en_NG",
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "AVANTIC Tools — a product of AVANTIC LABS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [`${SITE_URL}/opengraph-image`],
    title: "AVANTIC Tools",
    description: "Everyday tasks, sorted. A product of AVANTIC LABS.",
  },
  robots: {
    index: ALLOW_INDEXING,
    follow: ALLOW_INDEXING,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
