import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Page not found",
  description:
    "This address does not lead to a tool. Search AVANTIC Tools or browse the catalog to find the task you need.",
  robots: { index: false, follow: false },
};
export default function NotFound() {
  return (
    <main id="main" className="not-found">
      <p className="caption">Page not found</p>
      <h1>Let’s find what you need.</h1>
      <p>
        This address doesn’t lead to a tool. Browse the catalog or search for
        the task you want to finish.
      </p>
      <div className="utility-actions">
        <Link href="/#tools" className="button" prefetch={false}>
          Browse tools
        </Link>
        <Link
          href="/#search"
          className="button button-secondary"
          prefetch={false}
        >
          Search tools
        </Link>
      </div>
      <nav aria-label="Popular workflows">
        <Link href="/tools/scan-to-pdf" prefetch={false}>
          Scan to PDF
        </Link>
        <Link href="/tools/invoice-receipt-maker" prefetch={false}>
          Create an invoice
        </Link>
        <Link href="/tools/application-photo-signature-prep" prefetch={false}>
          Prepare a photo
        </Link>
      </nav>
    </main>
  );
}
