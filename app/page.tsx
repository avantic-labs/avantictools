import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ScanLine } from "lucide-react";
import { Catalog } from "@/components/product/Catalog";
import { tools, comingSoon } from "@/data/tools";
export const metadata: Metadata = {
  title: { absolute: "AVANTIC Tools — useful tools, no friction" },
  description:
    "Scan documents, fix files, prepare application photos, create invoices and handle everyday tasks. Free tools that work on your device.",
  alternates: { canonical: "/" },
};
export default function HomePage() {
  return (
    <main id="main" className="catalog-shell">
      <section className="product-intro">
        <h1>
          Useful tools.
          <br />
          No friction.
        </h1>
        <p>
          Scan documents, fix files, work with text and handle everyday tasks
          without complicated software.
        </p>
      </section>
      <section className="featured-section" aria-labelledby="featured-heading">
        <div className="section-title">
          <h2 id="featured-heading">Featured workflows</h2>
          <span>Work from start to finish</span>
        </div>
        <div className="featured-strip">
          <article className="files-feature">
            <div className="feature-icon">
              <ScanLine size={24} strokeWidth={1.5} aria-hidden="true" />
            </div>
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
      <Catalog tools={tools} />
      <section className="coming-soon" aria-labelledby="coming-heading">
        <div className="section-title">
          <h2 id="coming-heading">Coming soon</h2>
          <span>Planned, not available yet</span>
        </div>
        <div className="roadmap-grid">
          {comingSoon.map((item) => (
            <article key={item.name}>
              <span className="caption">
                {item.group === "Candidate"
                  ? "Candidate"
                  : `Coming soon · ${item.group}`}
              </span>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
