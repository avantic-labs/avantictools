"use client";

import { useState } from "react";
import { bioTemplates } from "@/lib/utils";

export default function BioGenerator() {
  const [name, setName] = useState("");
  const [tone, setTone] = useState("futuristic");
  const [bios, setBios] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const generate = () => {
    const selected =
      bioTemplates[tone as keyof typeof bioTemplates];

    const generated = selected.map((template) =>
      template.replace("{name}", name || "Creator")
    );

    setBios(generated);
  };

  return (
    <section className="generator-card">
      <div className="section-heading">
        <span className="badge">AI Bio Writer</span>

        <h2>Premium AI Bio Generator</h2>

        <p>
          Generate futuristic, aesthetic, luxury, motivational, anime, and
          hacker-style creator bios instantly.
        </p>
      </div>

      <div className="generator-controls">
        <input
          type="text"
          placeholder="Enter name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
        >
          <option value="futuristic">Futuristic AI</option>
          <option value="hacker">Hacker</option>
          <option value="luxury">Luxury</option>
          <option value="aesthetic">Aesthetic</option>
          <option value="motivational">Motivational</option>
          <option value="professional">Professional</option>
          <option value="darktech">Dark Tech</option>
        </select>

        <button className="primary-btn" onClick={generate}>
          Generate Bios
        </button>
      </div>

      <div className="bio-results">
        {bios.map((bio, index) => (
          <div className="bio-card" key={index}>
            <p>{bio}</p>

            <div className="result-actions">
              <button onClick={() => navigator.clipboard.writeText(bio)}>
                Copy
              </button>

              <button
                onClick={() => {
                  if (!favorites.includes(bio)) {
                    setFavorites([...favorites, bio]);
                  }
                }}
              >
                Save
              </button>
            </div>
          </div>
        ))}
      </div>

      {favorites.length > 0 && (
        <div className="favorites-section">
          <h3>Saved Bios</h3>

          <div className="bio-results">
            {favorites.map((bio, index) => (
              <div className="bio-card" key={index}>
                <p>{bio}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}