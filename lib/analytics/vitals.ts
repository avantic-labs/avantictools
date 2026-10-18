export type VitalMeasurement = {
  name: "LCP" | "INP" | "CLS";
  rating: "good" | "needs-improvement" | "poor";
};

function rating(name: VitalMeasurement["name"], value: number): VitalMeasurement["rating"] {
  const [good, poor] = name === "LCP" ? [2500, 4000] : name === "INP" ? [200, 500] : [0.1, 0.25];
  return value <= good ? "good" : value <= poor ? "needs-improvement" : "poor";
}

/**
 * Coarse, content-free field signals. Values are reduced to standard ratings
 * before leaving the browser, so no timing fingerprint or workspace data is sent.
 */
export function observeWebVitals(report: (measurement: VitalMeasurement) => void) {
  if (typeof PerformanceObserver === "undefined") return () => undefined;
  let lcp = 0;
  let cls = 0;
  let inp = 0;
  let reported = false;
  const observers: PerformanceObserver[] = [];
  const observe = (type: string, handle: (entry: PerformanceEntry) => void) => {
    try {
      const observer = new PerformanceObserver((list) => list.getEntries().forEach(handle));
      observer.observe({ type, buffered: true });
      observers.push(observer);
    } catch {
      // Older browsers simply omit the unsupported metric.
    }
  };
  observe("largest-contentful-paint", (entry) => { lcp = Math.max(lcp, entry.startTime); });
  observe("layout-shift", (entry) => {
    const shift = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
    if (!shift.hadRecentInput) cls += shift.value ?? 0;
  });
  observe("event", (entry) => { inp = Math.max(inp, entry.duration); });
  const flush = () => {
    if (reported) return;
    reported = true;
    if (lcp) report({ name: "LCP", rating: rating("LCP", lcp) });
    report({ name: "CLS", rating: rating("CLS", cls) });
    if (inp) report({ name: "INP", rating: rating("INP", inp) });
  };
  const visibility = () => { if (document.visibilityState === "hidden") flush(); };
  document.addEventListener("visibilitychange", visibility);
  const timer = window.setTimeout(flush, 10_000);
  return () => {
    window.clearTimeout(timer);
    document.removeEventListener("visibilitychange", visibility);
    observers.forEach((observer) => observer.disconnect());
  };
}
