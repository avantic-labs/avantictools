import Link from "next/link";
import { pageMetadata } from "@/lib/page-metadata";
export const metadata = pageMetadata(
  "Terms of Use",
  "Your responsibilities when using AVANTIC Tools, including file preparation, generated documents, output review and merchant-entered receipts.",
  "/terms",
);
export default function Terms() {
  return (
    <main id="main" className="prose-page">
      <h1>Terms of Use</h1>
      <p className="hint">Updated 17 October 2026</p>
      <p>
        These terms apply to AVANTIC Tools, a product of AVANTIC LABS. By using
        the website, you agree to use it in accordance with these terms. If you
        do not agree, please do not use the service.
      </p>
      <h2>Using the service</h2>
      <p>
        AVANTIC Tools provides browser-based utilities for everyday document,
        image, text, business and calculation tasks. The current tools are free
        to use and do not require an account. They are general-purpose
        utilities, not professional legal, financial, tax or
        identity-verification services.
      </p>
      <h2>Your files and information</h2>
      <p>
        You are responsible for the material you choose to process and for
        having the necessary rights or permission to use it. Do not process
        someone else’s private information without appropriate authorization.
        You retain any rights you hold in your content; using a tool does not
        transfer ownership of that content to AVANTIC LABS.
      </p>
      <p>
        The current tools process inputs locally as described in our{" "}
        <Link href="/privacy">Privacy Policy</Link>. Save outputs you need
        before leaving a workspace. The service is not a backup or
        document-storage system.
      </p>
      <h2>Acceptable use</h2>
      <p>
        Do not use the service for fraud, impersonation, unlawful activity,
        infringement or creating deceptive documents. Do not attempt to disrupt
        the website, bypass security controls, distribute malicious files or
        interfere with other users’ access.
      </p>
      <h2>Reviewing outputs</h2>
      <p>
        You are responsible for checking generated results before relying on or
        sending them. Confirm document details, calculations, page order, image
        dimensions and readability. Keep an original copy of important files.
        Compression, conversion and image preparation may change quality or
        remove features from a document.
      </p>
      <p>
        AVANTIC does not guarantee that every output will be accurate for your
        situation or accepted by every device, application, institution or
        online portal. Date calculations and financial totals are utilities;
        they do not determine legal eligibility, tax obligations or payment
        status.
      </p>
      <h2>Application photos and signatures</h2>
      <p>
        Use the current instructions supplied by your application portal.
        Requirements can change. Custom dimensions and file limits are settings
        you choose, not official requirements endorsed by a school, employer,
        immigration authority or government body.
      </p>
      <p>
        The photo and signature tool prepares your existing image through
        cropping, resizing and compression. It does not verify identity, create
        official documents or authorize use of another person’s signature.
      </p>
      <h2>Invoices and sales receipts</h2>
      <p>
        Invoices and receipts contain merchant-entered information. You are
        responsible for customer details, items, prices, discounts, applicable
        tax rates and payment statements. A sales receipt generated here is your
        transaction record; AVANTIC does not independently verify that payment
        was received.
      </p>
      <p>
        Do not present an AVANTIC-generated document as a bank transfer
        confirmation, bank alert, payment-processor verification, official POS
        confirmation or government document. Do not use the service to
        misrepresent a transaction.
      </p>
      <h2>Intellectual property</h2>
      <p>
        The AVANTIC names, marks and original website materials belong to their
        respective rights holders. These terms do not grant permission to
        impersonate AVANTIC LABS or use its identity in a way that suggests
        endorsement. Third-party software remains subject to its own licenses.
      </p>
      <p>
        You may use the outputs you generate for your intended lawful purposes,
        subject to rights in the content you provide and any applicable
        third-party rights. AVANTIC does not guarantee that your source material
        or resulting output is free of other people’s rights.
      </p>
      <h2>Availability and service limits</h2>
      <p>
        The service is provided on an “as is” and “as available” basis. To the
        extent permitted by applicable law, we do not make warranties of
        uninterrupted access, error-free operation or fitness for a particular
        purpose. File limits, supported formats and browser capabilities may
        restrict what a tool can process.
      </p>
      <p>
        To the extent permitted by applicable law, AVANTIC LABS is not
        responsible for losses caused by reliance on unchecked outputs, loss of
        unsaved work, service interruptions or third-party systems. Nothing in
        these terms excludes rights or responsibilities that cannot lawfully be
        excluded.
      </p>
      <h2>Third-party services and links</h2>
      <p>
        The website is hosted on Vercel and includes links to external services
        and official community accounts. Those services have their own policies.
        You choose whether to open an external link or send an output through
        another app; AVANTIC does not control those destinations.
      </p>
      <h2>Changes and restrictions</h2>
      <p>
        We may improve, change or discontinue features, and may restrict access
        where necessary to protect the service or address misuse. We may update
        these terms as the service changes. The date above identifies the
        current version; continued use after an update means you accept the
        revised terms.
      </p>
      <h2>Questions</h2>
      <p>
        Official AVANTIC LABS social and community links are listed on the{" "}
        <Link href="/about">About page</Link>. Keep sensitive documents and
        private transaction details out of public conversations.
      </p>
    </main>
  );
}
