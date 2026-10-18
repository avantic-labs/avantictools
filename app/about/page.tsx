import Link from "next/link";
import { SocialLinks } from "@/components/product/SocialLinks";
import { pageMetadata } from "@/lib/page-metadata";
export const metadata = pageMetadata(
  "About",
  "Why AVANTIC Tools exists, how we choose useful tools, and what you can expect from our approach to privacy and everyday tasks.",
  "/about",
);
export default function About() {
  return (
    <main id="main" className="prose-page">
      <h1>Useful software for everyday tasks.</h1>
      <p>
        AVANTIC Tools is a product of AVANTIC LABS focused on removing friction
        from everyday digital tasks. It brings document preparation, text tools,
        business documents and quick calculations into one place, without
        requiring an account.
      </p>
      <h2>Built around the job you need to finish</h2>
      <p>
        A file is too large to upload. An application portal rejects a photo. A
        customer needs an invoice. These tasks are small, but finding the right
        software and learning how to use it can take longer than the work
        itself.
      </p>
      <p>
        We choose tools for problems that people encounter repeatedly. Related
        actions belong in the same workspace: PDF Organizer combines, rotates
        and reorders pages; Application Photo &amp; Signature Prep handles
        cropping, dimensions and file limits together.
      </p>
      <h2>A clear workspace, with fewer distractions</h2>
      <p>
        The tool should be the focus. We use direct language, consistent
        controls and layouts that adapt to phones and larger screens. Keyboard
        access, readable text and clear errors are part of the product, not
        optional extras.
      </p>
      <p>
        AVANTIC Files connects scanning, organizing and compression. You can
        prepare a document and continue to the next task without uploading it to
        a server.
      </p>
      <h2>Privacy through local processing</h2>
      <p>
        Our twelve current tools process their inputs in your browser. Files,
        photos, signatures, text, dates, invoice details and generated passwords
        are not uploaded by the tools. Downloads, clipboard access and sharing
        happen when you choose those actions.
      </p>
      <p>
        We do not save workspace drafts to an account or browser storage.
        Download anything you want to keep before leaving. Ordinary requests to
        load the website still reach our hosting provider; the{" "}
        <Link href="/privacy">Privacy Policy</Link> explains the distinction.
      </p>
      <h2>What to expect</h2>
      <p>
        Available tools are ready to use. Items marked Coming next are not yet
        available. We improve existing workflows before adding more, and keep
        limits visible when a browser or device cannot safely handle a file.
      </p>
      <p>
        Review important outputs before using them. Portal requirements can
        change, PDF compression can reduce quality, and invoices and receipts
        reflect the information you enter. Our{" "}
        <Link href="/terms">Terms of Use</Link> describe these responsibilities.
      </p>
      <h2>AVANTIC LABS</h2>
      <p>
        AVANTIC LABS develops AVANTIC Tools. Follow its official accounts for
        product updates and community conversations. These links open other
        services in a new tab; their privacy policies apply there.
      </p>
      <SocialLinks />
      <div>
        <Link href="/#tools" className="button" prefetch={false}>
          Browse tools
        </Link>
      </div>
    </main>
  );
}
