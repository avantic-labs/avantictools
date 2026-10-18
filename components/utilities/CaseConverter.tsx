"use client";

import { useRef, useState } from "react";
import { convertCase, type CaseMode } from "@/lib/utilities/text";
import { trackUtilityEvent } from "@/lib/analytics/utilities";
import { CopyButton } from "./CopyButton";

const modes: readonly { value: CaseMode; label: string }[] = [
  { value: "lower", label: "lowercase" },
  { value: "upper", label: "UPPERCASE" },
  { value: "title", label: "Title Case" },
  { value: "sentence", label: "Sentence case" },
];

export function CaseConverter() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<CaseMode>("lower");
  const [revision, setRevision] = useState(0);
  const input = useRef<HTMLTextAreaElement>(null);
  const completed = useRef(false);
  const output = convertCase(text, mode);

  function markCompleted(value: string) {
    if (value && !completed.current) {
      trackUtilityEvent("case-converter", "tool_started");
      trackUtilityEvent("case-converter", "tool_completed", "convert");
      completed.current = true;
    }
    setRevision((current) => current + 1);
  }

  return (
    <div className="utility-panel">
      <div className="utility-field">
        <label htmlFor="case-input">Your text</label>
        <textarea id="case-input" ref={input} className="utility-textarea" rows={6} value={text}
          onChange={(event) => { setText(event.target.value); markCompleted(event.target.value); }}
          spellCheck={false} autoComplete="off" />
      </div>
      <fieldset className="utility-options" aria-describedby="case-definition">
        <legend>Convert to</legend>
        {modes.map((option) => (
          <label key={option.value}>
            <input type="radio" name="case-mode" value={option.value} checked={mode === option.value}
              onChange={() => { setMode(option.value); markCompleted(text); }} />
            {option.label}
          </label>
        ))}
      </fieldset>
      <p id="case-definition" className="utility-hint">
        Uses English-locale Unicode casing and keeps your spacing and line breaks.
        Title Case capitalizes each word. Sentence case starts after periods, exclamation marks,
        question marks and line breaks; abbreviations and proper names may need a final check.
      </p>
      <div className="utility-field">
        <label htmlFor="case-output">Converted text</label>
        <textarea id="case-output" className="utility-textarea" rows={6} value={output} readOnly
          spellCheck={false} autoComplete="off" />
      </div>
      <div className="utility-actions">
        <CopyButton key={revision} text={output} tool="case-converter" />
        <button type="button" className="utility-button utility-button-secondary" disabled={!text}
          onClick={() => { setText(""); setRevision((current) => current + 1); input.current?.focus(); }}>
          Clear text
        </button>
      </div>
    </div>
  );
}
