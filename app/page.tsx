"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import UsernameGenerator from "@/components/UsernameGenerator";
import BioGenerator from "@/components/BioGenerator";
import ToolCard from "@/components/ToolCard";
import { tools } from "@/data/tools";

export default function HomePage() {
  return (
    <main className="site-wrapper">
      <Navbar />

      <Hero />

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="badge">AI Utility Platform</span>

            <h2>Daily AI Tools Built for Modern Creators</h2>

            <p>
              Powerful tools engineered for creators, gamers, developers,
              students, startups, and internet power users.
            </p>
          </div>

          <div className="tool-grid">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <UsernameGenerator />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <BioGenerator />
        </div>
      </section>

      <section className="section adsense-block">
        <div className="container">
          <div className="adsense-placeholder">
            <span>Google AdSense Placement Area</span>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}