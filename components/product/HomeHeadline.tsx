"use client";

import { useEffect, useRef } from "react";

export function HomeHeadline() {
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const lines = Array.from(
      heading.current?.querySelectorAll<HTMLElement>(".typing-line") ?? [],
    );
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const animations: Animation[] = [];
    let disposed = false;
    const started = performance.now();
    function finish() {
      lines.forEach((line) => (line.style.animation = "none"));
      animations.forEach((animation) => animation.cancel());
    }
    if (motion.matches) finish();
    else
      void document.fonts.ready.then(() => {
        if (disposed || motion.matches || performance.now() - started > 900) {
          if (!disposed) finish();
          return;
        }
        let delay = 40;
        for (const line of lines) {
          const text = line.firstChild;
          if (!text) continue;
          const length = text.textContent?.length ?? 0;
          const width = line.getBoundingClientRect().width;
          if (!length || !width) continue;
          const range = document.createRange();
          range.setStart(text, 0);
          const frames: Keyframe[] = [
            {
              clipPath: "inset(0 100% 0 0)",
              offset: 0,
              easing: "steps(1, end)",
            },
          ];
          for (let index = 1; index <= length; index++) {
            range.setEnd(text, index);
            const hidden = Math.max(
              0,
              100 - (range.getBoundingClientRect().width / width) * 100,
            );
            frames.push({
              clipPath: `inset(0 ${hidden}% 0 0)`,
              offset: index / length,
              easing: "steps(1, end)",
            });
          }
          const duration = length * 38;
          line.style.animation = "none";
          const animation = line.animate(frames, {
            delay,
            duration,
            fill: "both",
          });
          animations.push(animation);
          void animation.finished.then(
            () => animation.cancel(),
            () => {},
          );
          delay += duration + 110;
        }
      });
    const visibility = () =>
      animations.forEach((animation) => {
        if (
          animation.playState === "finished" ||
          animation.playState === "idle"
        )
          return;
        if (document.hidden) animation.pause();
        else animation.play();
      });
    motion.addEventListener("change", finish);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      disposed = true;
      finish();
      motion.removeEventListener("change", finish);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  return (
    <h1 ref={heading} aria-label="Useful tools. No friction.">
      <span className="typing-line">Useful tools.</span>
      <span className="typing-line">No friction.</span>
    </h1>
  );
}
