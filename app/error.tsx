"use client";
import Link from "next/link";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="prose-page">
      <h1>This workspace couldn’t open.</h1>
      <p>
        Try opening it again. Any unfinished work may need to be entered again;
        downloaded files remain on your device.
      </p>
      <div className="actions">
        <button className="button" type="button" onClick={reset}>
          Try again
        </button>
        <Link className="button button-secondary" href="/" prefetch={false}>
          Browse tools
        </Link>
      </div>
    </main>
  );
}
