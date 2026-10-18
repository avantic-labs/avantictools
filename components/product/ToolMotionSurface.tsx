"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { ToolId } from "@/data/tools";

export function ToolMotionSurface({
  tool,
  children,
}: {
  tool: ToolId;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const update = () => {
      element.dataset.running = String(
        visible && !document.hidden && !reduced.matches,
      );
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    reduced.addEventListener("change", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="tool-motion"
      data-tool={tool}
      data-running="false"
      aria-hidden="true"
    >
      {children}
    </div>
  );
}
