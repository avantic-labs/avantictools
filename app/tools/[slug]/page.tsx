import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { tools, getTool, categories } from "@/data/tools";
import { ToolWorkspace } from "@/components/workspaces/ToolWorkspace";
import { UtilityView } from "@/components/utilities/UtilityView";
import { SITE_URL } from "@/lib/site";
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return tools.map(({ slug }) => ({ slug }));
}
export const dynamicParams = false;
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  return tool
    ? {
        title: tool.name,
        description: `${tool.description} Free, private and on your device. A product of AVANTIC LABS.`,
        alternates: { canonical: `/tools/${slug}` },
        openGraph: {
          title: tool.name,
          description: tool.description,
          url: `/tools/${slug}`,
        },
        twitter: { title: tool.name, description: tool.description },
      }
    : {};
}
export default async function UtilityPage({ params }: Props) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();
  const category = categories.find(
    (category) => category.id === tool.category,
  )!;
  const related = tools
    .filter(
      (candidate) =>
        candidate.family === tool.family && candidate.slug !== slug,
    )
    .slice(0, 3);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    description: tool.description,
    url: `${SITE_URL}/tools/${slug}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any modern web browser",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "NGN" },
    publisher: { "@type": "Organization", name: "AVANTIC LABS" },
  };
  return (
    <main
      id="main"
      className={`utility-shell${tool.family === "files" || tool.family === "images" ? " document-workspace" : ""}`}
    >
      {tool.family === "files" && (
        <nav className="workflow-family" aria-label="AVANTIC Files">
          <span className="family-name">AVANTIC Files</span>
          {tools
            .filter((item) => item.family === "files")
            .map((item) => (
              <Link
                key={item.slug}
                href={`/tools/${item.slug}`}
                prefetch={false}
                aria-current={item.slug === slug ? "page" : undefined}
              >
                {item.name}
              </Link>
            ))}
        </nav>
      )}
      <header className="utility-heading">
        <h1>{tool.name}</h1>
        <p>{tool.description}</p>
        <p className="hint">
          {["files", "images", "business"].includes(tool.family)
            ? "Your files and details stay on this device."
            : "Works in your browser. Your input stays here."}
        </p>
      </header>
      <UtilityView tool={tool.slug} />
      <ToolWorkspace tool={tool.slug} />
      <noscript>
        <p>Enable JavaScript to use this local workspace.</p>
      </noscript>
      <nav className="utility-navigation" aria-label="Related tools">
        <h2>
          {tool.family === "files"
            ? "Continue with AVANTIC Files"
            : `More in ${category.name}`}
        </h2>
        <ul>
          {related.map((item) => (
            <li key={item.slug}>
              <Link href={`/tools/${item.slug}`} prefetch={false}>
                {item.name}
              </Link>
            </li>
          ))}
          <li>
            <Link href={`/categories/${category.id}`} prefetch={false}>
              Browse {category.name}
            </Link>
          </li>
        </ul>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
    </main>
  );
}
