import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AVANTIC Tools",
    template: "%s — AVANTIC Tools",
  },
  description:
    "Free, useful tools from AVANTIC LABS for AI workflows and everyday productivity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
