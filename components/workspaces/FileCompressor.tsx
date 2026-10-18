"use client";
import { useEffect, useEffectEvent, useState } from "react";
import { compressImage, imageDimensions } from "@/lib/files/images";
import { compressPdf } from "@/lib/files/pdf";
import {
  checkFileSize,
  FileProblem,
  fileSize,
  QUALITY_PRESETS,
  type QualityPreset,
} from "@/lib/files/shared";
import { takeHandoff } from "@/lib/files/handoff";
import { trackUtilityEvent } from "@/lib/analytics/utilities";
import { Upload, ResultPanel, TaskStatus, useLocalTask } from "./shared";
export function FileCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<QualityPreset>("balanced");
  const [result, setResult] = useState<Blob | null>(null);
  const task = useLocalTask("file-compressor");
  const isPdf =
    file?.type === "application/pdf" ||
    file?.name.toLowerCase().endsWith(".pdf");
  async function choose(files: File[]) {
    setFile(null);
    setResult(null);
    const chosen = await task.run("Checking file", async () => {
      if (files.length !== 1)
        throw new FileProblem("Choose one file at a time.");
      const next = files[0];
      if (
        next.type === "application/pdf" ||
        next.name.toLowerCase().endsWith(".pdf")
      )
        checkFileSize(next, "pdf");
      else await imageDimensions(next);
      return next;
    });
    if (chosen) {
      setFile(chosen);
      setResult(null);
    }
  }
  const acceptHandoff = useEffectEvent((next: File) => {
    void choose([next]);
  });
  useEffect(() => {
    // Receive the queued file after the workspace mounts; cancel on navigation.
    const delivery = setTimeout(() => {
      const next = takeHandoff("file-compressor");
      if (next) acceptHandoff(next);
    }, 0);
    return () => clearTimeout(delivery);
  }, []);
  async function compress() {
    if (!file) return;
    setResult(null);
    const blob = await task.run("Compressing file", (report) =>
      isPdf ? compressPdf(file, preset, report) : compressImage(file, preset),
    );
    if (blob) {
      setResult(blob);
      trackUtilityEvent("file-compressor", "tool_completed", "process");
    }
  }
  const extension =
    result?.type === "application/pdf"
      ? "pdf"
      : result?.type === "image/png"
        ? "png"
        : result?.type === "image/webp"
          ? "webp"
          : "jpg";
  return (
    <div className="workspace-panel">
      <Upload
        label="Upload a file"
        accept="application/pdf,image/jpeg,image/png,image/webp,.pdf"
        busy={task.busy}
        onFiles={choose}
      />
      <p className="hint">
        PDF up to 40 MB / 50 pages. JPEG, PNG or WebP up to 20 MB / 24
        megapixels.
      </p>
      <TaskStatus task={task} />
      {file && (
        <>
          <p className="hint">
            Selected file: {isPdf ? "PDF" : "image"}, {fileSize(file.size)}
          </p>
          <label className="field">
            Compression
            <select
              aria-label="Compression"
              value={preset}
              disabled={task.busy}
              onChange={(event) => {
                setPreset(event.target.value as QualityPreset);
                setResult(null);
              }}
            >
              {Object.entries(QUALITY_PRESETS).map(([value, option]) => (
                <option key={value} value={value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <p className="hint">
            {isPdf
              ? "PDF compression creates image-based pages. Text selection, links, forms and digital signatures will not be kept. Keep your original for those features."
              : "Smaller presets reduce dimensions and image quality. PNG compression also reduces color precision while keeping transparency."}{" "}
            Reduction depends on the file.
          </p>
          <div className="actions">
            <button
              type="button"
              className="button"
              disabled={task.busy}
              onClick={compress}
            >
              Compress
            </button>
            <button
              type="button"
              className="button button-secondary"
              disabled={task.busy}
              onClick={() => {
                setFile(null);
                setResult(null);
                task.setError("");
              }}
            >
              Clear file
            </button>
          </div>
        </>
      )}
      {result && file && (
        <ResultPanel
          blob={result}
          filename={`avantic-compressed.${extension}`}
          tool="file-compressor"
          originalSize={file.size}
        >
          <p className="hint" role="status">
            {result.size < file.size
              ? "A smaller file is ready."
              : "The original was already smaller. It has been kept unchanged."}
          </p>
        </ResultPanel>
      )}
    </div>
  );
}
