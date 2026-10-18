import type { Metadata } from "next";
import localFont from "next/font/local";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./globals.css";
import { SiteHeader, SiteFooter } from "@/components/product/SiteChrome";
import { SITE_URL, ALLOW_INDEXING } from "@/lib/site";

// Preload the three UI weights; retain Unicode-range Inter fallbacks for user text.
const interfaceFont = localFont({
  src: [
    {
      path: "../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../node_modules/@fontsource/inter/files/inter-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-avantic",
  display: "swap",
  adjustFontFallback: false,
});

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
    <html lang="en" className={interfaceFont.variable}>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
