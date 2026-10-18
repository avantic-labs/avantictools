import Link from "next/link";
import { pageMetadata } from "@/lib/page-metadata";
export const metadata = pageMetadata(
  "Privacy Policy",
  "How AVANTIC Tools processes files and inputs locally, what reaches our hosting provider, and how downloads, sharing and product events work.",
  "/privacy",
);
export default function Privacy() {
  return (
    <main id="main" className="prose-page">
      <h1>Privacy Policy</h1>
      <p className="hint">Updated 18 October 2026</p>
      <p>
        This policy describes the current AVANTIC Tools website, a product of
        AVANTIC LABS. It distinguishes the information you use inside a tool
        from the ordinary requests needed to load the website.
      </p>
      <h2>Information processed by the tools</h2>
      <p>
        The tools may work with documents, photographs, signatures, text, links,
        dates, invoice items, customer names, business and bank-transfer
        details, and generated passwords. These inputs and outputs are processed
        on your device in your browser. The current tools do not upload them to
        AVANTIC servers or an external processing service.
      </p>
      <p>
        Search also runs locally. Search phrases are not placed in the address
        bar, saved to browser storage or sent to an analytics service.
      </p>
      <h2>Files, camera and temporary work</h2>
      <p>
        You choose which files to open. Where supported, the camera option opens
        your device’s capture interface; you can use an existing photo instead.
        The application does not request access to your microphone or location.
      </p>
      <p>
        Workspaces keep temporary data in browser memory. They do not create
        accounts or save drafts to local storage, session storage or a database.
        Moving a file between AVANTIC Files tools uses a temporary in-memory
        handoff that expires after one minute if it is not used. Reloading or
        closing the page discards that workspace.
      </p>
      <p>
        Temporary image and download references are released when no longer
        needed. This is resource cleanup, not a guarantee of secure erasure from
        your device’s memory, caches or operating system.
      </p>
      <h2>Downloads, copying and sharing</h2>
      <p>
        Download saves an output through your browser. Copy writes the selected
        output to your clipboard only after you press Copy. Share, where
        supported, opens your device’s share sheet only after you choose Share.
      </p>
      <p>
        Saved files, clipboard history, device backups and the apps or
        recipients you select are controlled by you and those services. Clearing
        a workspace does not delete a downloaded file or clear your device’s
        clipboard.
      </p>
      <h2>Product events and analytics</h2>
      <p>
        The application creates explicit product events for actions such as
        viewing, starting or completing a tool, choosing a search result,
        downloading an output or moving between AVANTIC Files tools. Event
        names and properties pass through a fixed allowlist before any analytics
        provider can receive them.
      </p>
      <p>
        Those events exclude entered text, search phrases, file contents and
        names, passwords, photos, signatures, dates of birth, invoice details,
        customer names and bank information. We do not send the content of an
        error or a workspace to analytics.
      </p>
      <p>
        PostHog is the supported product-analytics service. Analytics transport
        operates only when the production deployment has a valid PostHog public
        project key and regional ingestion host. When it is configured, PostHog
        receives the allowlisted event, a random identifier held only in memory
        for the current page session, coarse device and viewport classes, and
        strictly approved campaign attribution. AVANTIC Tools tells PostHog not
        to create person profiles.
      </p>
      <p>
        The application does not enable analytics autocapture, session replay,
        heatmaps, advertising tracking or fingerprinting. Raw search phrases
        are never sent; search measurement contains only a result-count bucket,
        a selected tool and its result position. Performance measurement reduces
        LCP, INP and CLS to a standard good, needs-improvement or poor rating.
      </p>
      <p>
        Analytics requests necessarily expose ordinary network information such
        as an IP address to the provider in transit, even though it is not an
        event property created by AVANTIC Tools. Read{" "}
        <a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer">
          PostHog’s Privacy Notice (opens in a new tab)
        </a>{" "}
        for its service practices.
      </p>
      <h2>Hosting and technical requests</h2>
      <p>
        Vercel hosts this website. Loading a page requires requests for the
        page, application code, fonts, icons and other assets. The hosting
        infrastructure can receive technical information such as your IP
        address, requested URL, browser information and request timing. Your
        working files and form contents are not included in those requests by
        our tools.
      </p>
      <p>
        Hosting services may maintain operational and security logs under their
        own policies. This application does not set a separate retention period
        for those provider records. Read{" "}
        <a
          href="https://vercel.com/legal/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
        >
          Vercel’s Privacy Policy (opens in a new tab)
        </a>{" "}
        for information about its practices.
      </p>
      <h2>Cookies and third-party services</h2>
      <p>
        The public application does not set advertising, analytics or account
        cookies and does not save its analytics identifier in local or session
        storage. Hosting infrastructure may use security mechanisms, and
        restricted review deployments may use access cookies. These do not store
        the contents of a tool workspace.
      </p>
      <p>
        Social and community links are ordinary links, not embedded feeds.
        Opening one takes you to another service, whose own terms and privacy
        policy apply. Downloading the site’s processing libraries does not send
        your files to their authors.
      </p>
      <h2>Security and your choices</h2>
      <p>
        The site uses HTTPS and browser security headers. File processing has
        size and page limits to reduce memory failures, and generated passwords
        use the browser’s cryptographic random-number generator. These measures
        cannot guarantee security on a compromised device or against every
        browser extension.
      </p>
      <p>
        You can use the tools without an account, decline camera access, avoid
        sharing, clear a workspace or close the page. Use a device you trust for
        sensitive documents and review the destination before sharing them.
      </p>
      <h2>Changes and questions</h2>
      <p>
        We will update this policy when the application’s practices change. The
        date above identifies this version. Any future server-side document
        processing would need its own privacy and security decision and clear
        notice.
      </p>
      <p>
        For product questions, use an official AVANTIC LABS community or social
        account listed on the <Link href="/about">About page</Link>. Do not post
        sensitive files, passwords or account details in public channels.
      </p>
    </main>
  );
}
