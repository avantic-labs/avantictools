"use client";

import { useState } from "react";
import {
  generatePassword, PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH, PASSWORD_CLASSES,
  type PasswordClass, validatePasswordOptions,
} from "@/lib/utilities/password";
import { trackUtilityEvent } from "@/lib/analytics/utilities";
import { CopyButton } from "./CopyButton";

const classLabels: Record<PasswordClass, string> = {
  lowercase: "Lowercase (a–z)", uppercase: "Uppercase (A–Z)",
  numbers: "Numbers (0–9)", symbols: "Symbols (!@#…)",
};
const allClasses = Object.keys(PASSWORD_CLASSES) as PasswordClass[];

export function PasswordGenerator() {
  const [length, setLength] = useState("20");
  const [classes, setClasses] = useState<PasswordClass[]>(allClasses);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [revision, setRevision] = useState(0);
  const options = { length: Number(length), classes };
  const validation = validatePasswordOptions(options);

  function clearResult() {
    setPassword("");
    setMessage("");
    setRevision((current) => current + 1);
  }

  function generate() {
    if (validation) return;
    trackUtilityEvent("password-generator", "tool_started");
    try {
      setPassword(generatePassword(options));
      setRevision((current) => current + 1);
      setMessage("New password generated.");
      trackUtilityEvent("password-generator", "tool_completed", "generate");
    } catch {
      trackUtilityEvent("password-generator", "tool_error", "browser_unsupported");
      setPassword("");
      setMessage("Secure generation is unavailable in this browser. Try a current browser over HTTPS.");
    }
  }

  return (
    <div className="utility-panel">
      <div className="utility-field">
        <label htmlFor="password-length">Password length</label>
        <input id="password-length" className="utility-number" type="number" inputMode="numeric"
          min={PASSWORD_MIN_LENGTH} max={PASSWORD_MAX_LENGTH} step={1} value={length}
          aria-invalid={Boolean(validation)} aria-describedby="password-options-help password-validation"
          onChange={(event) => { setLength(event.target.value); clearResult(); }} />
      </div>
      <fieldset className="utility-options">
        <legend>Character classes</legend>
        {allClasses.map((characterClass) => (
          <label key={characterClass}>
            <input type="checkbox" checked={classes.includes(characterClass)}
              disabled={classes.length === 1 && classes.includes(characterClass)}
              onChange={(event) => {
                setClasses(event.target.checked ? [...classes, characterClass] : classes.filter((value) => value !== characterClass));
                clearResult();
              }} />
            {classLabels[characterClass]}
          </label>
        ))}
      </fieldset>
      <p id="password-options-help" className="utility-hint">
        Choose {PASSWORD_MIN_LENGTH}–{PASSWORD_MAX_LENGTH} characters; use at least 16 for a stronger password.
        Keep at least one class selected. Every selected class appears in the result.
        Changing options clears the previous password.
      </p>
      <p id="password-validation" className="utility-status" role="status">{validation ?? ""}</p>
      <button type="button" className="utility-button" disabled={Boolean(validation)} onClick={generate}>
        Generate password
      </button>
      <div className="utility-field">
        <label htmlFor="password-output">Generated password</label>
        <textarea id="password-output" className="utility-textarea utility-secret" rows={3} value={password}
          readOnly autoComplete="off" autoCapitalize="off" spellCheck={false}
          aria-describedby="password-privacy" />
      </div>
      <p className="utility-status" role="status">{message}</p>
      <div className="utility-actions">
        <CopyButton key={revision} text={password} tool="password-generator" />
        <button type="button" className="utility-button utility-button-secondary" disabled={!password}
          onClick={clearResult}>Clear password</button>
      </div>
      <p id="password-privacy" className="utility-hint">
        Generated securely in your browser. Passwords and settings are never sent or saved.
        Copy only when needed; your clipboard is managed by your device.
      </p>
    </div>
  );
}
