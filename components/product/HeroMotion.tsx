"use client";

import { useEffect, useRef } from "react";

type Dot = {
  x: number;
  y: number;
  radius: number;
  speed: number;
  phase: number;
};

// A small, self-contained canvas keeps this motion off every tool route.
export function HeroMotion() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !context) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");
    const dots: Dot[] = Array.from({ length: 64 }, (_, index) => {
      const angle = index * 2.399963229728653;
      const distance = Math.sqrt((index + 0.5) / 64);
      return {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        radius: index % 9 === 0 ? 2.7 : index % 3 === 0 ? 1.8 : 1.2,
        speed: 0.2 + (index % 7) * 0.047,
        phase: index * 0.73,
      };
    });

    let width = 0;
    let height = 0;
    let visible = false;
    let frame = 0;
    let lastFrame = 0;
    let pointer = { x: -1000, y: -1000 };

    function draw(time: number) {
      if (!context) return;
      context.fillStyle = "#1f2430";
      context.fillRect(0, 0, width, height);

      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const spreadX = width * 0.39;
      const spreadY = height * 0.36;
      const seconds = motion.matches ? 0 : time / 1000;

      context.strokeStyle = "rgba(194, 211, 217, 0.13)";
      context.lineWidth = 1;
      for (const scale of [0.58, 0.94]) {
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
        if (finePointer.matches && !motion.matches) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const range = 72;
          const distance = Math.hypot(dx, dy);
          if (distance > 0 && distance < range) {
            const force = ((range - distance) / range) ** 2 * 18;
            x += (dx / distance) * force;
            y += (dy / distance) * force;
          }
        }
        context.beginPath();
        context.arc(x, y, dot.radius, 0, Math.PI * 2);
        context.fillStyle = dot.radius > 2 ? "#e9f0f0" : "#8fa8b1";
        context.fill();
      }
    }

    function tick(time: number) {
      if (!visible || motion.matches || document.hidden) {
        frame = 0;
        return;
      }
      if (time - lastFrame >= 32) {
        draw(time);
        lastFrame = time;
      }
      frame = requestAnimationFrame(tick);
    }

    function start() {
      cancelAnimationFrame(frame);
      frame = 0;
      draw(motion.matches ? 0 : performance.now());
      if (visible && !motion.matches && !document.hidden)
        frame = requestAnimationFrame(tick);
    }

    function resize() {
      const bounds = canvas!.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(width * ratio);
      canvas!.height = Math.round(height * ratio);
      context!.setTransform(ratio, 0, 0, ratio, 0, 0);
      start();
    }

    function move(event: PointerEvent) {
      const bounds = canvas!.getBoundingClientRect();
      pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
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
    intersectionObserver.observe(canvas);
    canvas.addEventListener("pointermove", move, { passive: true });
    canvas.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", start);
    motion.addEventListener("change", start);
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerleave", leave);
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
