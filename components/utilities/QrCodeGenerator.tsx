"use client";

import { useRef, useState, type FormEvent } from "react";
import { trackOutputEvent, trackUtilityEvent } from "@/lib/analytics/utilities";
import {
  generateQrPng,
  QR_MAX_BYTES,
  qrInputByteLength,
  validateQrInput,
} from "@/lib/utilities/qr";

export function QrCodeGenerator() {
  const [input, setInput] = useState("");
  const [png, setPng] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const revision = useRef(0);
  const generationInProgress = useRef(false);

  function updateInput(value: string) {
    revision.current += 1;
    setInput(value);
    setPng(null);
    setInputError(null);
    setActionError(null);
    setStatus("");
  }

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    trackUtilityEvent("qr-code-generator", "tool_started");
    if (generationInProgress.current) return;

    const error = validateQrInput(input);
    setInputError(error);
    setActionError(null);
    setPng(null);
    setStatus("");
    if (error) return;

    const currentRevision = ++revision.current;
    generationInProgress.current = true;
    setIsGenerating(true);

    try {
      const result = await generateQrPng(input);
      // Editing while generation is in flight must not display or download a
      // QR code for an earlier value, or report that stale work as completed.
      if (currentRevision !== revision.current) return;

      setPng(result);
      setStatus("QR code ready. You can download the PNG image.");
      trackUtilityEvent("qr-code-generator", "tool_completed", "generate");
    } catch {
      trackUtilityEvent("qr-code-generator", "tool_error", "export_failed");
      if (currentRevision === revision.current) {
        setActionError("The QR code could not be generated. Please try again.");
      }
    } finally {
      generationInProgress.current = false;
      setIsGenerating(false);
    }
  }

  function download() {
    if (!png) return;
    setActionError(null);

    try {
      const link = document.createElement("a");
      link.href = png;
      link.download = "avantic-qr-code.png";
      document.body.appendChild(link);
      try {
        link.click();
      } finally {
        link.remove();
      }
      setStatus("PNG download started.");
      trackOutputEvent("qr-code-generator", "download_completed", "png");
    } catch {
      trackUtilityEvent("qr-code-generator", "tool_error", "export_failed");
      setActionError("The PNG download could not start. Please try again.");
    }
  }

  return (
    <section className="utility-panel" aria-label="QR code generator">
      <form onSubmit={generate}>
        <div className="utility-field">
          <label htmlFor="qr-input">Text or URL</label>
          <p className="utility-hint" id="qr-input-hint">
            Generate a QR code in your browser. Your content is not uploaded or
            saved. Shorter content is easier to scan.
          </p>
          <textarea
            className="utility-textarea"
            id="qr-input"
            value={input}
            onChange={(event) => updateInput(event.target.value)}
            rows={5}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="none"
            aria-invalid={Boolean(inputError)}
            aria-describedby={`qr-input-hint qr-input-count${inputError ? " qr-input-error" : ""}`}
          />
          <p className="utility-hint" id="qr-input-count">
            {qrInputByteLength(input).toLocaleString("en-US")} /{" "}
            {QR_MAX_BYTES.toLocaleString("en-US")} UTF-8 bytes. Emoji and some
            other characters use multiple bytes.
          </p>
          {inputError && (
            <p className="utility-status" id="qr-input-error" role="alert">
              {inputError}
            </p>
          )}
        </div>
        <div className="utility-actions">
          <button
            className="utility-button"
            type="submit"
            disabled={isGenerating}
          >
            {isGenerating ? "Generating…" : "Generate QR code"}
          </button>
          <button
            className="utility-button"
            type="button"
            onClick={download}
            disabled={!png || isGenerating}
          >
            Download PNG
          </button>
        </div>
      </form>
      {actionError && (
        <p className="utility-status" role="alert">
          {actionError}
        </p>
      )}
      <p className="utility-status" role="status" aria-live="polite">
        {isGenerating ? "Generating QR code…" : status}
      </p>
      {png && (
        <div className="utility-result">
          {/* This local data URL must bypass image optimization: QR payloads
              must never be sent to a server or an external image service. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={png}
            alt="Generated QR code for your text or URL"
            width={384}
            height={384}
            style={{ maxWidth: "100%", height: "auto", imageRendering: "pixelated" }}
          />
          <p className="utility-hint">
            Scan with a QR reader or download the PNG to use elsewhere.
          </p>
        </div>
      )}
    </section>
  );
}
