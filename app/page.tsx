import { pageMetadata } from "@/lib/page-metadata";
import { SITE_URL } from "@/lib/site";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Catalog } from "@/components/product/Catalog";
import { HeroMotion } from "@/components/product/HeroMotion";
import { tools, comingSoon } from "@/data/tools";
export const metadata = {
  ...pageMetadata(
    "AVANTIC Tools — useful tools, no friction",
    "Scan documents, fix files, prepare application photos, create invoices and handle everyday tasks. Free tools that work on your device.",
    "/",
  ),
  title: { absolute: "AVANTIC Tools — useful tools, no friction" },
};
export default function HomePage() {
  return (
    <main id="main" className="catalog-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "AVANTIC Tools",
            url: SITE_URL,
            description:
              "Everyday tools that process your files and inputs on your device.",
          }),
        }}
      />
      <section className="product-intro">
        <div className="intro-copy">
          <h1>
            Useful tools.
            <br />
            No friction.
          </h1>
          <p>
            Scan documents, fix files, prepare applications and handle everyday
            tasks.
          </p>
        </div>
        <HeroMotion />
      </section>
      <Catalog tools={tools}>
        <nav className="popular-actions" aria-label="Popular actions">
          <Link href="/tools/scan-to-pdf" prefetch={false}>
            Scan to PDF
          </Link>
          <Link href="/tools/file-compressor" prefetch={false}>
            Compress a file
          </Link>
          <Link href="/tools/application-photo-signature-prep" prefetch={false}>
            Prepare a photo
          </Link>
          <Link href="/tools/invoice-receipt-maker" prefetch={false}>
            Create an invoice
          </Link>
        </nav>
        <p className="trust-line">
          No account required. Your files and inputs are processed on your
          device.
        </p>
        <section
          className="featured-section"
          aria-labelledby="featured-heading"
        >
          <div className="section-title">
            <h2 id="featured-heading">Featured workflows</h2>
          </div>
          <div className="featured-strip">
            <article className="files-feature">
              <div>
                <h3>AVANTIC Files</h3>
                <p>From a photo of a page to a file ready to send.</p>
                <nav aria-label="AVANTIC Files">
                  <Link href="/tools/scan-to-pdf" prefetch={false}>
                    Scan to PDF <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                  <Link href="/tools/pdf-organizer" prefetch={false}>
                    Organize a PDF
                  </Link>
                  <Link href="/tools/file-compressor" prefetch={false}>
                    Compress a file
                  </Link>
                </nav>
              </div>
            </article>
            <article className="application-feature">
              <h3>Get an application image ready</h3>
              <p>
                Crop a photo or signature to the portal’s dimensions and file
                limit.
              </p>
              <Link
                href="/tools/application-photo-signature-prep"
                className="text-link"
                prefetch={false}
              >
                Prepare an image <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </article>
          </div>
        </section>
      </Catalog>
      <section className="coming-soon" aria-labelledby="coming-heading">
        <div className="section-title">
          <h2 id="coming-heading">Coming next</h2>
          <span>More tools are on the way.</span>
        </div>
        <div className="roadmap-grid">
          {comingSoon
            .filter((item) => item.group === "Files")
            .map((item) => (
              <article key={item.name}>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
              </article>
            ))}
        </div>
      </section>
    </main>
  );
}
