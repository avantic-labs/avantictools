"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, ArrowUpRight } from "lucide-react";
import { categories, type Tool, type CategoryId } from "@/data/tools";
import { ToolIcon } from "./ToolIcon";
import { matchesTool } from "@/lib/utilities/search";
export function Catalog({
  tools,
  category,
}: {
  tools: readonly Tool[];
  category?: CategoryId;
}) {
  const [query, setQuery] = useState("");
  const filtered = tools.filter(
    (tool) =>
      (!category || tool.category === category) && matchesTool(tool, query),
  );
  return (
    <>
      <section id="search" className="catalog-search" aria-label="Find a tool">
        <label htmlFor="tool-search">Find what you need</label>
        <div className="search-field">
          <Search size={20} strokeWidth={1.5} aria-hidden="true" />
          <input
            id="tool-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try ‘photo size’, ‘PDF’ or ‘discount’"
            autoComplete="off"
          />
        </div>
        <p className="sr-only" role="status">
          {filtered.length} tools found
        </p>
      </section>
      <nav
        id="categories"
        className="category-nav"
        aria-label="Tool categories"
      >
        <Link
          href="/#tools"
          prefetch={false}
          aria-current={!category ? "page" : undefined}
        >
          All tools
        </Link>
        {categories.map((item) => (
          <Link
            key={item.id}
            href={`/categories/${item.id}`}
            prefetch={false}
            aria-current={category === item.id ? "page" : undefined}
          >
            {item.name}
          </Link>
        ))}
      </nav>
      <section
        id="tools"
        className="available-tools"
        aria-label="Available tools"
      >
        {filtered.length === 0 && (
          <div className="empty-state">
            <h2>No matching tools</h2>
            <p>Try a shorter phrase, or browse the categories.</p>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setQuery("")}
            >
              Clear search
            </button>
          </div>
        )}
        {categories
          .filter((item) => filtered.some((tool) => tool.category === item.id))
          .map((item) => (
            <section
              className="catalog-group"
              key={item.id}
              aria-labelledby={`category-${item.id}`}
            >
              {!category && (
                <div className="group-heading">
                  <h2 id={`category-${item.id}`}>{item.name}</h2>
                  <p>{item.description}</p>
                </div>
              )}
              {category && (
                <h2 id={`category-${item.id}`} className="sr-only">
                  Available {item.name} tools
                </h2>
              )}
              <div className="catalog-grid">
                {filtered
                  .filter((tool) => tool.category === item.id)
                  .map((tool) => (
                    <article className="catalog-card" key={tool.slug}>
                      <ToolIcon name={tool.icon} />
                      <h3>
                        <Link href={`/tools/${tool.slug}`} prefetch={false}>
                          {tool.name}
                        </Link>
                      </h3>
                      <p>{tool.description}</p>
                      <ArrowUpRight
                        size={20}
                        strokeWidth={1.5}
                        className="card-arrow"
                        aria-hidden="true"
                      />
                    </article>
                  ))}
              </div>
            </section>
          ))}
      </section>
    </>
  );
}
