"use client";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Search, ArrowUpRight } from "lucide-react";
import { categories, type Tool, type CategoryId } from "@/data/tools";
import { ToolIcon } from "./ToolIcon";
import { matchesTool } from "@/lib/utilities/search";
import { resultCountBucket, trackEvent } from "@/lib/analytics/utilities";
export function Catalog({
  tools,
  category,
  children,
}: {
  tools: readonly Tool[];
  category?: CategoryId;
  children?: ReactNode;
}) {
  const rail = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    if (!category) return;
    const node = rail.current;
    const current = node?.querySelector<HTMLElement>("[aria-current]");
    if (node && current)
      node.scrollLeft =
        current.offsetLeft -
        node.offsetLeft -
        (node.clientWidth - current.clientWidth) / 2;
  }, [category]);
  const results = useRef<HTMLElement>(null);
  const [query, setQuery] = useState("");
  const filtered = tools.filter(
    (tool) =>
      (!category || tool.category === category) && matchesTool(tool, query),
  );
  const opened = useRef(false);
  useEffect(() => {
    if (!query.trim()) return;
    const timer = window.setTimeout(() => trackEvent({
      name: "search_used",
      properties: { result_count_bucket: resultCountBucket(filtered.length) },
    }), 500);
    return () => window.clearTimeout(timer);
  }, [filtered.length, query]);
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
            placeholder="PDF, photo, discount"
            autoComplete="off"
            aria-controls="tools"
            onFocus={() => {
              if (!opened.current) {
                trackEvent({ name: "search_opened", properties: {} });
                opened.current = true;
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                results.current?.querySelector<HTMLAnchorElement>("a")?.focus();
              }
              if (event.key === "Escape") setQuery("");
            }}
          />
        </div>
        <p className="sr-only" role="status">
          {filtered.length} tools found
        </p>
      </section>
      {!query.trim() && children}
      <nav
        ref={rail}
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
            onClick={() => trackEvent({ name: "category_selected", properties: { category: item.id } })}
          >
            <span className="category-full">{item.name}</span>
            <span className="category-short" aria-hidden="true">
              {
                {
                  files: "Files",
                  applications: "Applications",
                  writing: "Writing",
                  business: "Business",
                  everyday: "Everyday",
                }[item.id]
              }
            </span>
          </Link>
        ))}
      </nav>
      <section
        ref={results}
        onKeyDown={(event) => {
          if (!["ArrowDown", "ArrowUp", "Escape"].includes(event.key)) return;
          const links = Array.from(
            results.current?.querySelectorAll<HTMLAnchorElement>(
              ".catalog-card a",
            ) ?? [],
          );
          const index = links.indexOf(event.target as HTMLAnchorElement);
          if (index < 0) return;
          event.preventDefault();
          if (
            event.key === "Escape" ||
            (event.key === "ArrowUp" && index === 0)
          )
            document.getElementById("tool-search")?.focus();
          else
            links[
              Math.min(
                links.length - 1,
                Math.max(0, index + (event.key === "ArrowDown" ? 1 : -1)),
              )
            ]?.focus();
        }}
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
                  .map((tool, resultIndex) => (
                    <article className="catalog-card" key={tool.slug}>
                      <ToolIcon name={tool.icon} />
                      <h3>
                        <Link
                          href={`/tools/${tool.slug}`}
                          prefetch={false}
                          onClick={() => {
                            if (query.trim()) trackEvent({
                              name: "search_result_selected",
                              properties: { tool_id: tool.slug, result_position: resultIndex + 1 },
                            });
                          }}
                        >
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
