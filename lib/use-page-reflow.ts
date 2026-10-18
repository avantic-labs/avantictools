"use client";
import { useLayoutEffect, useRef } from "react";

/** Animate only a changed page order. No gesture is required to reorder. */
export function usePageReflow(order: string) {
  const ref = useRef<HTMLOListElement>(null);
  const previous = useRef(new Map<string, { x: number; y: number }>());
  useLayoutEffect(() => {
    const nodes = Array.from(
      ref.current?.querySelectorAll<HTMLElement>("[data-page-id]") ?? [],
    );
    // Batch layout reads before writing animation styles.
    const positions = nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      return {
        node,
        id: node.dataset.pageId!,
        x: rect.left + scrollX,
        y: rect.top + scrollY,
      };
    });
    const animations: Animation[] = [];
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    for (const { node, id, x, y } of positions) {
      const before = previous.current.get(id);
      if (!motion.matches && before && (before.x !== x || before.y !== y)) {
        animations.push(
          node.animate(
            [
              { transform: `translate(${before.x - x}px, ${before.y - y}px)` },
              { transform: "translate(0, 0)" },
            ],
            { duration: 180, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
          ),
        );
      }
    }
    previous.current = new Map(positions.map(({ id, x, y }) => [id, { x, y }]));
    const stop = () => animations.forEach((animation) => animation.cancel());
    motion.addEventListener("change", stop);
    return () => {
      stop();
      motion.removeEventListener("change", stop);
    };
  }, [order]);
  return ref;
}
