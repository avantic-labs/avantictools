"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { tools } from "@/data/tools";
import { matchesTool } from "@/lib/utilities/search";
export function SearchDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const results = tools.filter((tool) => matchesTool(tool, query));
  return (
    <>
      <button
        type="button"
        className="nav-search"
        aria-label="Search tools"
        onClick={() => {
          dialog.current?.showModal();
          search.current?.focus();
        }}
      >
        <Search size={20} strokeWidth={1.5} aria-hidden="true" />
        <span>Search</span>
      </button>
      <dialog
        ref={dialog}
        className="search-dialog"
        aria-labelledby="search-dialog-title"
        onClose={() => setQuery("")}
      >
        <div className="section-title">
          <h2 id="search-dialog-title">Find a tool</h2>
          <button
            type="button"
            className="button button-ghost"
            aria-label="Close search"
            onClick={() => dialog.current?.close()}
          >
            <X size={20} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
        <label className="field">
          What do you need?
          <input
            ref={search}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try ‘photo size’ or ‘PDF’"
            autoComplete="off"
          />
        </label>
        <p className="hint" role="status">
          {results.length} {results.length === 1 ? "tool" : "tools"} found
        </p>
        {results.length ? (
          <ul className="search-results">
            {results.map((tool) => (
              <li key={tool.slug}>
                <Link
                  href={`/tools/${tool.slug}`}
                  prefetch={false}
                  onClick={() => dialog.current?.close()}
                >
                  <strong>{tool.name}</strong>
                  <span>{tool.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="hint">Try a shorter phrase, or browse the catalog.</p>
        )}
      </dialog>
    </>
  );
}
