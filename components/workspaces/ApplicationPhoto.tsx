"use client";
import { useState } from "react";
import {
  DEFAULT_IMAGE_SETTINGS,
  fitImage,
  imageDimensions,
  prepareImage,
  type ImageSettings,
} from "@/lib/files/images";
import { FileProblem } from "@/lib/files/shared";
import { trackUtilityEvent } from "@/lib/analytics/utilities";
import { ImageEditor } from "./ImageEditor";
import {
  LocalImage,
  ResultPanel,
  TaskStatus,
  Upload,
  useLocalTask,
} from "./shared";
export function ApplicationPhoto() {
  const [mode, setMode] = useState<"photo" | "signature">("photo");
  const [file, setFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<ImageSettings>({
    ...DEFAULT_IMAGE_SETTINGS,
  });
  const [width, setWidth] = useState("400");
  const [height, setHeight] = useState("400");
  const [unit, setUnit] = useState("px");
  const [limit, setLimit] = useState("200");
  const [format, setFormat] = useState<"image/jpeg" | "image/png">(
    "image/jpeg",
  );
  const [fit, setFit] = useState<"contain" | "cover">("contain");
  const [result, setResult] = useState<{
    blob: Blob;
    width: number;
    height: number;
  } | null>(null);
  const task = useLocalTask("application-photo-signature-prep");
  function clearResult() {
    setResult(null);
    task.setError("");
  }
  async function choose(files: File[]) {
    setFile(null);
    clearResult();
    const chosen = await task.run("Opening image", async () => {
      await imageDimensions(files[0]);
      return files[0];
    });
    if (chosen) {
      setFile(chosen);
      setSettings({ ...DEFAULT_IMAGE_SETTINGS, trim: mode === "signature" });
    }
  }
  async function prepare() {
    if (!file) return;
    setResult(null);
    const output = await task.run("Preparing image", async () => {
      if (
        unit === "px" &&
        ![Number(width), Number(height)].every(Number.isInteger)
      )
        throw new FileProblem("Use whole-number pixel dimensions.");
      const factor = unit === "mm" ? 300 / 25.4 : 1;
      const outputWidth = Math.round(Number(width) * factor);
      const outputHeight = Math.round(Number(height) * factor);
      const canvas = await prepareImage(file, settings, 4000);
      try {
        const blob = await fitImage(canvas, {
          width: outputWidth,
          height: outputHeight,
          type: format,
          maxBytes: limit ? Number(limit) * 1024 : undefined,
          fit,
        });
        return { blob, ...(await imageDimensions(blob)) };
      } finally {
        canvas.width = canvas.height = 0;
      }
    });
    if (output) {
      setResult(output);
      trackUtilityEvent(
        "application-photo-signature-prep",
        "tool_completed",
        "process",
      );
    }
  }
  return (
    <div className="workspace-panel">
      <div className="tabs" aria-label="Image type">
        {(["photo", "signature"] as const).map((value) => (
          <button
            type="button"
            className="button button-secondary"
            key={value}
            disabled={task.busy}
            aria-pressed={mode === value}
            onClick={() => {
              setMode(value);
              setSettings({
                ...DEFAULT_IMAGE_SETTINGS,
                trim: value === "signature",
              });
              setWidth("400");
              setHeight(value === "signature" ? "100" : "400");
              setUnit("px");
              clearResult();
            }}
          >
            {value === "photo" ? "Photo" : "Signature"}
          </button>
        ))}
      </div>
      <Upload
        label={mode === "photo" ? "Upload a photo" : "Upload a signature image"}
        accept="image/jpeg,image/png,image/webp"
        busy={task.busy}
        onFiles={choose}
      />
      <Upload
        label="Take a photo"
        accept="image/jpeg,image/png,image/webp"
        camera
        busy={task.busy}
        onFiles={choose}
      />
      <p className="hint">
        Enter the size required by your portal. Requirements vary, so confirm
        them before exporting.
      </p>
      <TaskStatus task={task} />
      {file && (
        <>
          <fieldset className="editing-controls" disabled={task.busy}>
            <legend>Portal requirements</legend>
            <div className="paired-fields">
              <label className="field">
                Width
                <input
                  type="number"
                  min={1}
                  step="any"
                  value={width}
                  onChange={(event) => {
                    setWidth(event.target.value);
                    clearResult();
                  }}
                />
              </label>
              <label className="field">
                Height
                <input
                  type="number"
                  min={1}
                  step="any"
                  value={height}
                  onChange={(event) => {
                    setHeight(event.target.value);
                    clearResult();
                  }}
                />
              </label>
            </div>
            <label className="field">
              Unit
              <select
                aria-label="Unit"
                value={unit}
                onChange={(event) => {
                  setUnit(event.target.value);
                  clearResult();
                }}
              >
                <option value="px">Pixels</option>
                <option value="mm">Millimetres at 300 DPI</option>
              </select>
            </label>
            <div className="paired-fields">
              <label className="field">
                Maximum size (KB)
                <input
                  aria-label="Maximum size (KB)"
                  type="number"
                  min={1}
                  max={20480}
                  step={1}
                  value={limit}
                  onChange={(event) => {
                    setLimit(event.target.value);
                    clearResult();
                  }}
                />
                <span className="hint">Leave blank for no size limit.</span>
              </label>
              <label className="field">
                Format
                <select
                  aria-label="Format"
                  value={format}
                  onChange={(event) => {
                    setFormat(event.target.value as typeof format);
                    clearResult();
                  }}
                >
                  <option value="image/jpeg">JPG</option>
                  <option value="image/png">PNG</option>
                </select>
              </label>
            </div>
            <label className="field">
              Fit
              <select
                aria-label="Fit"
                value={fit}
                onChange={(event) => {
                  setFit(event.target.value as typeof fit);
                  clearResult();
                }}
              >
                <option value="contain">Keep entire image (padding)</option>
                <option value="cover">Fill frame (center crop)</option>
              </select>
            </label>
            <p className="hint">
              Proportions are preserved. Padding is white for JPG and
              transparent for PNG. Millimetres convert to pixels at 300 DPI.
            </p>
          </fieldset>
          <ImageEditor
            file={file}
            settings={settings}
            disabled={task.busy}
            signature={mode === "signature"}
            onChange={(value) => {
              setSettings(value);
              clearResult();
            }}
          />

          <div className="actions">
            <button
              type="button"
              className="button"
              disabled={task.busy}
              onClick={prepare}
            >
              Prepare image
            </button>
            <button
              type="button"
              className="button button-secondary"
              disabled={task.busy}
              onClick={() => {
                setFile(null);
                clearResult();
              }}
            >
              Clear image
            </button>
          </div>
        </>
      )}
      {result && (
        <ResultPanel
          blob={result.blob}
          filename={`avantic-${mode}.${result.blob.type === "image/png" ? "png" : "jpg"}`}
          tool="application-photo-signature-prep"
        >
          <p role="status">
            {result.width} × {result.height} pixels
          </p>
          <div className="prepared-output">
            <LocalImage
              blob={result.blob}
              alt={`Prepared ${mode} at the requested dimensions`}
            />
          </div>
        </ResultPanel>
      )}
    </div>
  );
}
