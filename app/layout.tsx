import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./globals.css";
import { SiteHeader, SiteFooter } from "@/components/product/SiteChrome";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AVANTIC Tools",
    template: "%s — AVANTIC Tools",
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
  },
  twitter: {
    card: "summary_large_image",
    title: "AVANTIC Tools",
    description: "Everyday tasks, sorted. A product of AVANTIC LABS.",
  },
  robots: {
    index: process.env.VERCEL_ENV !== "preview",
    follow: process.env.VERCEL_ENV !== "preview",
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
