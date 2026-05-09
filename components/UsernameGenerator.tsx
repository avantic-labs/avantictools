"use client";

import { useMemo, useState } from "react";
import {
  futuristicStyles,
  randomSymbols,
  trendingWords,
} from "@/lib/utils";

export default function UsernameGenerator() {
  const [baseName, setBaseName] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const generatedUsernames = useMemo(() => {
    return Array.from({ length: 10 }).map(() => {
      const style =
        futuristicStyles[
          Math.floor(Math.random() * futuristicStyles.length)
        ];

      const symbol =
        randomSymbols[Math.floor(Math.random() * randomSymbols.length)];

      const trend =
        trendingWords[Math.floor(Math.random() * trendingWords.length)];

      return `${symbol}${style(
        `${baseName || "AVANTIC"} ${trend}`
      )}${symbol}`;
    });
  }, [baseName]);

  const generate = () => {
    setResults(generatedUsernames);
  };

  const saveFavorite = (name: string) => {
    if (!favorites.includes(name)) {
      setFavorites([...favorites, name]);
    }
  };

  return (
    <section className="generator-card">
      <div className="section-heading">
        <span className="badge">Viral Username Generator</span>

        <h2>Futuristic AI Username Generator</h2>

        <p>
          Generate aesthetic, anime, gamer, hacker, luxury, rare, and
          futuristic AI usernames instantly.
        </p>
      </div>

      <div className="generator-controls">
        <input
          type="text"
          placeholder="Enter base username..."
          value={baseName}
          onChange={(e) => setBaseName(e.target.value)}
        />

        <button className="primary-btn" onClick={generate}>
          Generate Usernames
        </button>
      </div>

      <div className="results-grid">
        {results.map((username, index) => (
          <div className="result-card" key={index}>
            <span>{username}</span>

            <div className="result-actions">
              <button
                onClick={() => navigator.clipboard.writeText(username)}
              >
                Copy
              </button>

              <button onClick={() => saveFavorite(username)}>
                Save
              </button>
            </div>
          </div>
        ))}
      </div>

      {favorites.length > 0 && (
        <div className="favorites-section">
          <h3>Saved Usernames</h3>

          <div className="bio-results">
            {favorites.map((fav, index) => (
              <div className="bio-card" key={index}>
                <p>{fav}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}