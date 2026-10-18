"use client";

import { useEffect, useRef } from "react";

type Dot = {
  x: number;
  y: number;
  radius: number;
  speed: number;
  phase: number;
  offsetX: number;
  offsetY: number;
  velocityX: number;
  velocityY: number;
};

// A small, self-contained canvas keeps this motion off every tool route.
export function HeroMotion() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const region = canvas?.closest<HTMLElement>(".home-catalog");
    if (!canvas || !context || !region) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");
    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let origin = { x: 0, y: 0 };
    let protectedAreas: Pick<DOMRect, "left" | "right" | "top" | "bottom">[] =
      [];
    let visible = false;
    let frame = 0;
    let lastFrame = 0;
    let elapsed = 0;
    let layoutFrame = 0;
    let pointer = { x: -1000, y: -1000 };

    function draw(seconds: number, step = 0) {
      if (!context) return;
      context.clearRect(0, 0, width, height);

      const compact = width < 640;
      const centerX = width * (compact ? 0.94 : 0.8);
      const centerY = height * (compact ? 0.3 : 0.46);
      const spreadX = width * (compact ? 0.55 : 0.36);
      const spreadY = height * 0.64;

      // Keep every foreground text area clear, including on narrow phones.
      context.save();
      context.beginPath();
      context.rect(0, 0, width, height);
      for (const area of protectedAreas)
        context.rect(
          area.left,
          area.top,
          area.right - area.left,
          area.bottom - area.top,
        );
      context.clip("evenodd");
      context.strokeStyle = "rgba(108, 135, 146, 0.12)";
      context.lineWidth = 1;
      for (const scale of compact ? [0.9] : [0.58, 0.94]) {
        context.beginPath();
        context.ellipse(
          centerX,
          centerY,
          spreadX * scale,
          spreadY * scale,
          -0.18,
          0,
          Math.PI * 2,
        );
        context.stroke();
      }

      for (const dot of dots) {
        const drift = seconds * dot.speed + dot.phase;
        let x = centerX + dot.x * spreadX + Math.sin(drift) * 7;
        let y = centerY + dot.y * spreadY + Math.cos(drift * 0.8) * 7;
        let targetX = 0;
        let targetY = 0;
        if (finePointer.matches && !motion.matches) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const range = 72;
          const distance = Math.hypot(dx, dy);
          if (distance > 0 && distance < range) {
            const force = ((range - distance) / range) ** 2 * 18;
            targetX = (dx / distance) * force;
            targetY = (dy / distance) * force;
          }
        }
        if (motion.matches) {
          dot.offsetX = dot.offsetY = dot.velocityX = dot.velocityY = 0;
        } else if (step > 0) {
          const damping = 0.78 ** step;
          dot.velocityX =
            (dot.velocityX + (targetX - dot.offsetX) * 0.1 * step) * damping;
          dot.velocityY =
            (dot.velocityY + (targetY - dot.offsetY) * 0.1 * step) * damping;
          dot.offsetX += dot.velocityX * step;
          dot.offsetY += dot.velocityY * step;
        }
        x += dot.offsetX;
        y += dot.offsetY;
        context.beginPath();
        context.arc(x, y, dot.radius, 0, Math.PI * 2);
        context.fillStyle =
          dot.radius > 2
            ? "rgba(108, 135, 146, 0.58)"
            : "rgba(108, 135, 146, 0.32)";
        context.fill();
      }
      context.restore();
    }

    function tick(time: number) {
      if (!visible || motion.matches || document.hidden) {
        frame = 0;
        return;
      }
      if (!lastFrame) lastFrame = time;
      const delta = time - lastFrame;
      if (delta >= (width < 640 ? 40 : 32)) {
        elapsed += Math.min(delta, 64) / 1000;
        draw(elapsed, Math.min(delta / 33, 2));
        lastFrame = time;
      }
      frame = requestAnimationFrame(tick);
    }

    function start() {
      cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = 0;
      draw(motion.matches ? 0 : elapsed);
      if (visible && !motion.matches && !document.hidden)
        frame = requestAnimationFrame(tick);
    }

    function measure() {
      const bounds = canvas!.getBoundingClientRect();
      origin = {
        x: bounds.left + window.scrollX,
        y: bounds.top + window.scrollY,
      };
      protectedAreas = [];
      const foreground = region!.querySelectorAll(
        ".intro-copy, .catalog-search, .popular-actions, .trust-line, .section-title, .featured-strip, .category-nav, .catalog-card, .group-heading, .roadmap-grid article",
      );
      for (const element of foreground) {
        const rect = element.getBoundingClientRect();
        if (rect.bottom < bounds.top || rect.top > bounds.bottom) continue;
        let area = {
          left: rect.left - bounds.left - 8,
          right: rect.right - bounds.left + 8,
          top: rect.top - bounds.top - 8,
          bottom: rect.bottom - bounds.top + 8,
        };
        // Union overlapping protection rectangles so clipping never reopens text.
        for (let index = 0; index < protectedAreas.length; index++) {
          const other = protectedAreas[index];
          if (
            area.left > other.right ||
            area.right < other.left ||
            area.top > other.bottom ||
            area.bottom < other.top
          )
            continue;
          area = {
            left: Math.min(area.left, other.left),
            right: Math.max(area.right, other.right),
            top: Math.min(area.top, other.top),
            bottom: Math.max(area.bottom, other.bottom),
          };
          protectedAreas.splice(index, 1);
          index = -1;
        }
        protectedAreas.push(area);
      }
    }

    function queueMeasure() {
      if (layoutFrame || document.hidden) return;
      layoutFrame = requestAnimationFrame(() => {
        layoutFrame = 0;
        measure();
        if (motion.matches) draw(0);
      });
    }

    function resize() {
      const bounds = canvas!.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      measure();
      const count = width < 640 ? 24 : 56;
      if (dots.length !== count)
        dots = Array.from({ length: count }, (_, index) => {
          const angle = index * 2.399963229728653;
          const distance = Math.sqrt((index + 0.5) / count);
          return {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            radius: index % 9 === 0 ? 2.7 : index % 3 === 0 ? 1.8 : 1.2,
            speed: 0.2 + (index % 7) * 0.047,
            phase: index * 0.73,
            offsetX: 0,
            offsetY: 0,
            velocityX: 0,
            velocityY: 0,
          };
        });
      const ratio = Math.min(
        window.devicePixelRatio || 1,
        width < 640 ? 1.5 : 2,
      );
      canvas!.width = Math.round(width * ratio);
      canvas!.height = Math.round(height * ratio);
      context!.setTransform(ratio, 0, 0, ratio, 0, 0);
      start();
    }

    function move(event: PointerEvent) {
      if (finePointer.matches)
        pointer = { x: event.pageX - origin.x, y: event.pageY - origin.y };
    }

    function leave() {
      pointer = { x: -1000, y: -1000 };
    }

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    resizeObserver.observe(canvas);
    resizeObserver.observe(region);
    intersectionObserver.observe(region);
    const contentObserver = new MutationObserver(queueMeasure);
    contentObserver.observe(region, { childList: true, subtree: true });
    window.addEventListener("scroll", queueMeasure, { passive: true });
    region.addEventListener("pointermove", move, { passive: true });
    region.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", start);
    motion.addEventListener("change", start);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(layoutFrame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      contentObserver.disconnect();
      window.removeEventListener("scroll", queueMeasure);
      region.removeEventListener("pointermove", move);
      region.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", start);
      motion.removeEventListener("change", start);
    };
  }, []);

  return (
    <div className="hero-motion" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
