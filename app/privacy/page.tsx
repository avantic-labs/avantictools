import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Privacy and local processing",
  description:
    "How AVANTIC Tools handles files, text, dates, invoices and generated passwords on your device.",
  alternates: { canonical: "/privacy" },
};
export default function Privacy() {
  return (
    <main id="main" className="prose-page">
      <h1>Your work stays on your device.</h1>
      <p>
        Files, photos, signatures, text, dates, invoice details and generated
        passwords are processed in your browser. These tools do not upload their
        contents or save them to an AVANTIC account.
      </p>
      <h2>Downloads and sharing</h2>
      <p>
        Downloads create a new file on your device. Share uses your device’s
        share sheet only when you choose it. Copy writes to your clipboard only
        when you press Copy.
      </p>
      <h2>Product events</h2>
      <p>
        The application emits local product events containing only the tool name
        and a fixed action such as download. It does not include your inputs,
        filenames, file contents or generated results. No external analytics
        transport or session recording is enabled.
      </p>
      <h2>Page requests</h2>
      <p>
        Your browser requests the application, fonts and processing code from
        the site. The hosting service handles these ordinary page requests; your
        working files are not part of them.
      </p>
      <h2>Clearing your work</h2>
      <p>
        Use Clear or leave the page to discard the workspace. Downloads and
        clipboard contents remain under your device’s control.
      </p>
    </main>
  );
}
