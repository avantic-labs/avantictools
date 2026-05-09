export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-glow hero-glow-left" />
      <div className="hero-glow hero-glow-right" />

      <div className="container hero-content">
        <span className="badge">AVANTIC TOOLS AI Ecosystem</span>

        <h1>
          Premium
          <span className="gradient-text"> AI Creator Tools</span>
        </h1>

        <p>
          Futuristic AI-powered utility tools designed for creators,
          developers, gamers, startups, and digital brands.
        </p>

        <div className="hero-buttons">
          <button className="primary-btn">Explore Tools</button>

          <button className="secondary-btn">Start Free</button>
        </div>
      </div>
    </section>
  );
}