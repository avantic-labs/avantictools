import Link from "next/link";
import { day1Categories, liveDay1Tools } from "@/data/day1-tools";

export default function HomePage() {
  const featured = liveDay1Tools.filter((tool) => tool.workflowType === "connected");

  return (
    <main className="site-shell">
      <header className="topbar">
        <Link href="/" className="brand" aria-label="AVANTIC Tools home">
          <span className="brand-mark">A</span>
          <span>
            <strong>AVANTIC</strong>
            <small>TOOLS</small>
          </span>
        </Link>
        <span className="phase-label">Phase 1 foundation</span>
      </header>

      <section className="hero-shell">
        <p className="eyebrow">AVANTIC LABS</p>
        <h1>Useful tools. Zero friction.</h1>
        <p className="hero-copy">
          AVANTIC Tools is being rebuilt as one shared platform for trustworthy AI workflows
          and fast everyday utilities.
        </p>
      </section>

      <section className="catalog-section" aria-labelledby="featured-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Connected workflows</p>
            <h2 id="featured-heading">Featured workflows</h2>
          </div>
          <p>Day-1 AI experiences are designed as complete workflows, not isolated buttons.</p>
        </div>

        <div className="tool-grid featured-grid">
          {featured.map((tool) => (
            <article className="tool-card featured-card" key={tool.slug}>
              <div>
                <span className="tool-type">Connected workflow</span>
                <h3>{tool.name}</h3>
                <p>{tool.description}</p>
              </div>
              <Link href={tool.route} className="card-link">
                Open workflow <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {day1Categories.map((category) => {
        const tools = liveDay1Tools.filter((tool) => tool.category === category.id);

        return (
          <section className="catalog-section" key={category.id} aria-labelledby={`${category.id}-heading`}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Day 1</p>
                <h2 id={`${category.id}-heading`}>{category.label}</h2>
              </div>
              <p>{category.description}</p>
            </div>

            <div className="tool-grid">
              {tools.map((tool) => (
                <article className="tool-card" key={tool.slug}>
                  <div>
                    <span className="tool-type">
                      {tool.workflowType === "connected" ? "Connected workflow" : "Client-side utility"}
                    </span>
                    <h3>{tool.name}</h3>
                    <p>{tool.description}</p>
                  </div>
                  <Link href={tool.route} className="card-link">
                    Open tool <span aria-hidden="true">→</span>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      <footer className="site-footer">
        <p>AVANTIC Tools · An AVANTIC LABS product</p>
        <p>Foundation preview — product workflows are being implemented against the approved Day-1 architecture.</p>
      </footer>
    </main>
  );
}
