"use client";
import Link from "next/link";
import { useRef } from "react";
import { categories } from "@/data/tools";

export function MobileMenu() {
  const menu = useRef<HTMLDetailsElement>(null);
  return (
    <details ref={menu} className="mobile-menu">
      <summary>Menu</summary>
      <nav
        aria-label="Mobile"
        onClick={(event) => {
          if ((event.target as Element).closest("a"))
            menu.current?.removeAttribute("open");
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            menu.current?.removeAttribute("open");
            menu.current?.querySelector("summary")?.focus();
          }
        }}
      >
        <Link href="/#tools" prefetch={false}>
          Browse tools
        </Link>
        {categories.map((category) => (
          <Link
            href={`/categories/${category.id}`}
            key={category.id}
            prefetch={false}
          >
            {category.name}
          </Link>
        ))}
      </nav>
    </details>
  );
}
