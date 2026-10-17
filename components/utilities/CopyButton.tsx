"use client";

import { useEffect, useRef, useState } from "react";
import { trackUtilityEvent } from "@/lib/analytics/utilities";
import type { UtilityId } from "@/lib/utilities/catalog";

export function CopyButton({ text, tool }: { text: string; tool: UtilityId }) {
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = useRef(false);

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function copy() {
    if (!text || busy) return;
    if (timer.current) clearTimeout(timer.current);
    setBusy(true);
    setFeedback("");
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
      if (!active.current) return;
      setFeedback("Copied to clipboard.");
      trackUtilityEvent(tool, "tool_completed", "copy");
    } catch {
      if (active.current) setFeedback("Copy unavailable. Select the output and copy it manually.");
    } finally {
      if (active.current) {
        setBusy(false);
        timer.current = setTimeout(() => setFeedback(""), 5000);
      }
    }
  }

  return (
    <div className="utility-copy">
      <button type="button" className="utility-button" onClick={copy} disabled={!text || busy}>
        {busy ? "Copying…" : "Copy output"}
      </button>
      <span className="utility-status" role="status">{feedback}</span>
    </div>
  );
}
