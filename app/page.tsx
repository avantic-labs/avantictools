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


import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />

      <main className="legal-page container">
        <h1>Privacy Policy</h1>

        <p>
          AVANTIC Labs respects your privacy and is committed to protecting user
          data.
        </p>

        <h2>Information Collection</h2>

        <p>
          Our tools are designed to function without requiring account creation
          or invasive tracking.
        </p>

        <h2>Advertising</h2>

        <p>
          Google AdSense and third-party advertisers may use cookies to serve
          relevant ads.
        </p>

        <h2>Contact</h2>

        <p>official.avanticlabs@gmail.com</p>
      </main>

      <Footer />
    </>
  );
}


import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <>
      <Navbar />

      <main className="legal-page container">
        <h1>Terms of Service</h1>

        <p>
          By using AVANTIC Labs tools, you agree to use the platform responsibly
          and legally.
        </p>

        <h2>Usage</h2>

        <p>
          Users may freely use the platform tools for personal and commercial
          productivity purposes.
        </p>

        <h2>Availability</h2>

        <p>
          We continuously improve our services and may update features over
          time.
        </p>

        <h2>Support</h2>

        <p>official.avanticlabs@gmail.com</p>
      </main>

      <Footer />
    </>
  );
}



import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <main className="legal-page container">
        <h1>Contact AVANTIC Labs</h1>

        <p>
          Need support, business inquiries, partnerships, or advertising
          discussions?
        </p>

        <div className="contact-box">
          <h2>Email Support</h2>

          <p>official.avanticlabs@gmail.com</p>
        </div>
      </main>

      <Footer />
    </>
  );
}

