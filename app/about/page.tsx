import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
export const metadata: Metadata = {
  title: "About AVANTIC Tools",
  description:
    "AVANTIC Tools is a product of AVANTIC LABS, built to make recurring everyday tasks easier.",
  alternates: { canonical: "/about" },
};
export default function About() {
  return (
    <main id="main" className="prose-page">
      <h1>Small tasks. Less friction.</h1>
      <p>AVANTIC Tools — a product of AVANTIC LABS.</p>
      <p>
        We build useful software for the tasks that interrupt a day: a document
        that needs organizing, a photo a portal won’t accept, an invoice to
        send, or a quick calculation.
      </p>
      <p>
        The available tools work on your device without an account. Your files
        and the information you enter stay in your browser.
      </p>
      <Image
        className="about-logo"
        src="/avantic-tools-logo.jpg"
        width={252}
        height={256}
        alt="The approved AVANTIC Tools lockup: charcoal A above a blue-gray infinity mark"
      />
      <Link href="/#tools" className="button" prefetch={false}>
        Browse tools
      </Link>
    </main>
  );
}
