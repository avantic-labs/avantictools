import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AVANTIC Tools — Premium AI Utility Tools",
  description:
    "AVANTIC Tools provides premium AI-powered utility tools including futuristic username generators, AI bio generators, productivity tools, and creator utilities.",
  keywords: [
    "AI tools",
    "username generator",
    "bio generator",
    "AI SaaS",
    "AVANTIC Tools",
    "creator tools",
    "SEO tools",
  ],
  openGraph: {
    title: "AVANTIC Tools",
    description: "Premium AI-powered utility platform.",
    siteName: "AVANTIC Tools",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}