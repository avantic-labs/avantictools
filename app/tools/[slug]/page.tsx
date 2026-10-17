import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { utilityTools, isUtilityId } from "@/lib/utilities/catalog";
import { TextCounter } from "@/components/utilities/TextCounter";
import { CaseConverter } from "@/components/utilities/CaseConverter";
import { PasswordGenerator } from "@/components/utilities/PasswordGenerator";
import { QrCodeGenerator } from "@/components/utilities/QrCodeGenerator";
import { UtilityView } from "@/components/utilities/UtilityView";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return utilityTools.map(({ slug }) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = utilityTools.find((candidate) => candidate.slug === slug);
  return tool ? { title: tool.name, description: tool.description } : {};
}

export default async function UtilityPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = utilityTools.find((candidate) => candidate.slug === slug);
  if (!tool || !isUtilityId(slug)) notFound();

  return (
    <div className="site-shell">
      <a className="skip-link" href="#utility">Skip to tool</a>
      <header className="topbar">
        <Link href="/" prefetch={false} className="brand">
          <span className="brand-mark" aria-hidden="true">A</span>
          <span><strong>AVANTIC</strong>{" "}<small>TOOLS</small></span>
        </Link>
        <Link href="/" prefetch={false}>All tools</Link>
      </header>
      <main id="utility" className="utility-shell">
        <header className="utility-heading">
          <p className="eyebrow">Productivity &amp; Utility Tools</p>
          <h1>{tool.name}</h1>
          <p>{tool.description}</p>
          <p className="utility-hint">Your input stays in this browser. No sign-in or upload.</p>
        </header>
        <UtilityView tool={slug} />
        {slug === "word-counter" && <TextCounter mode="word" />}
        {slug === "character-counter" && <TextCounter mode="character" />}
        {slug === "case-converter" && <CaseConverter />}
        {slug === "qr-code-generator" && <QrCodeGenerator />}
        {slug === "password-generator" && <PasswordGenerator />}
        <noscript><p>Enable JavaScript to use this browser-only tool.</p></noscript>
        <nav className="utility-navigation" aria-label="More utilities">
          <h2>More utilities</h2>
          <ul>{utilityTools.filter((candidate) => candidate.slug !== slug).map((candidate) => (
            <li key={candidate.slug}><Link href={candidate.route} prefetch={false}>{candidate.name}</Link></li>
          ))}</ul>
        </nav>
      </main>
    </div>
  );
}
