"use client";

import { useRef, useState } from "react";
import { countText } from "@/lib/utilities/text";
import { trackUtilityEvent } from "@/lib/analytics/utilities";

export function TextCounter({ mode }: { mode: "word" | "character" }) {
  const [text, setText] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);
  const completed = useRef(false);
  const counts = countText(text);
  const primary = mode === "word" ? "words" : "characters";
  const secondary = mode === "word" ? "characters" : "words";

  function updateText(value: string) {
    setText(value);
    if (value && !completed.current) {
      trackUtilityEvent(`${mode}-counter`, "tool_completed", "count");
      completed.current = true;
    }
  }

  return (
    <div className="utility-panel">
      <div className="utility-field">
        <label htmlFor="counter-text">Your text</label>
        <textarea id="counter-text" ref={input} className="utility-textarea" rows={10}
          value={text} onChange={(event) => updateText(event.target.value)}
          aria-describedby="count-definition" spellCheck={false} autoComplete="off" />
      </div>
      <div className="utility-counts" role="status" aria-live="polite" aria-atomic="true">
        <p><strong>{counts[primary].toLocaleString("en")}</strong> {primary}</p>
        <p><strong>{counts[secondary].toLocaleString("en")}</strong> {secondary}</p>
      </div>
      <button type="button" className="utility-button utility-button-secondary" disabled={!text}
        onClick={() => { setText(""); input.current?.focus(); }}>Clear text</button>
      <p id="count-definition" className="utility-hint">
        Characters are visible text units (graphemes), including spaces and line breaks.
        An emoji or a letter with combining accents counts as one; a CRLF line ending counts as one.
        Words use English-locale Unicode word boundaries: numbers and contractions count,
        punctuation and emoji alone do not. Hyphenated parts count separately.
      </p>
    </div>
  );
}
