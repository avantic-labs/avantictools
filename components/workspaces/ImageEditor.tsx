"use client";
import { useEffect, useRef, useState } from "react";
import { Crop as CropIcon, RotateCw, Undo2 } from "lucide-react";
import {
  prepareImage,
  FULL_CROP,
  type Crop,
  type ImageSettings,
} from "@/lib/files/images";
import { fileMessage } from "@/lib/files/shared";
import { FULL_PAGE_CORNERS, type PageCorners } from "@/lib/files/perspective";
import { LocalImage } from "./shared";

function PreparedPreview({
  file,
  settings,
}: {
  file: Blob;
  settings: ImageSettings;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    const node = ref.current;
    const controller = new AbortController();
    prepareImage(file, settings, 960, controller.signal)
      .then((canvas) => {
        if (!cancelled && node) {
          node.width = canvas.width;
          node.height = canvas.height;
          node.getContext("2d")?.drawImage(canvas, 0, 0);
          setError("");
        }
        canvas.width = canvas.height = 0;
      })
      .catch((problem) => {
        if (!cancelled) setError(fileMessage(problem));
      });
    return () => {
      cancelled = true;
      controller.abort();
      if (node) node.width = node.height = 0;
    };
  }, [file, settings]);
  return (
    <div className="editor-preview">
      <canvas ref={ref} role="img" aria-label="Prepared image preview" />
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function CropControls({
  file,
  crop,
  onChange,
}: {
  file: Blob;
  crop: Crop;
  onChange: (crop: Crop) => void;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState(1);
  const corners = [
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
  ] as const;
  function update(corner: (typeof corners)[number], x: number, y: number) {
    let left = crop.left;
    let top = crop.top;
    let right = left + crop.width;
    let bottom = top + crop.height;
    if (corner.endsWith("left")) left = Math.min(right - 1, Math.max(0, x));
    else right = Math.max(left + 1, Math.min(100, x));
    if (corner.startsWith("top")) top = Math.min(bottom - 1, Math.max(0, y));
    else bottom = Math.max(top + 1, Math.min(100, y));
    onChange({ left, top, width: right - left, height: bottom - top });
  }
  return (
    <div className="crop-editor">
      <div className="crop-stage" ref={stage} style={{ aspectRatio: ratio }}>
        <LocalImage
          blob={file}
          alt="Original image with adjustable crop corners"
          onSize={(width, height) => setRatio(width / height)}
        />
        <div
          className="crop-outline"
          style={{
            left: `${crop.left}%`,
            top: `${crop.top}%`,
            width: `${crop.width}%`,
            height: `${crop.height}%`,
          }}
        />
        {corners.map((corner) => {
          const x = corner.endsWith("left")
            ? crop.left
            : crop.left + crop.width;
          const y = corner.startsWith("top")
            ? crop.top
            : crop.top + crop.height;
          return (
            <button
              key={corner}
              type="button"
              className="crop-handle"
              style={{ left: `${x}%`, top: `${y}%` }}
              aria-label={`${corner.replace("-", " ")} crop corner`}
              onPointerDown={(event) =>
                event.currentTarget.setPointerCapture(event.pointerId)
              }
              onPointerMove={(event) => {
                if (
                  !event.currentTarget.hasPointerCapture(event.pointerId) ||
                  !stage.current
                )
                  return;
                const rect = stage.current.getBoundingClientRect();
                update(
                  corner,
                  ((event.clientX - rect.left) / rect.width) * 100,
                  ((event.clientY - rect.top) / rect.height) * 100,
                );
              }}
              onKeyDown={(event) => {
                if (
                  !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
                    event.key,
                  )
                )
                  return;
                event.preventDefault();
                update(
                  corner,
                  x +
                    (event.key === "ArrowLeft"
                      ? -1
                      : event.key === "ArrowRight"
                        ? 1
                        : 0),
                  y +
                    (event.key === "ArrowUp"
                      ? -1
                      : event.key === "ArrowDown"
                        ? 1
                        : 0),
                );
              }}
            >
              <span aria-hidden="true" />
            </button>
          );
        })}
      </div>
      <p className="hint">
        Drag the corners to keep the part you need. Arrow keys adjust a focused
        corner.
      </p>
      <details>
        <summary>Set an exact crop</summary>
        <div className="crop-inputs">
          {(["left", "top", "width", "height"] as const).map((field) => (
            <label key={field}>
              {field[0].toUpperCase() + field.slice(1)} (%)
              <input
                type="number"
                min={field === "width" || field === "height" ? 1 : 0}
                max={100}
                step={1}
                value={Math.round(crop[field])}
                onChange={(event) =>
                  onChange({ ...crop, [field]: Number(event.target.value) })
                }
              />
            </label>
          ))}
        </div>
      </details>
    </div>
  );
}

function PageCornerControls({
  file,
  corners,
  onChange,
}: {
  file: Blob;
  corners: PageCorners;
  onChange: (corners: PageCorners) => void;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState(1);
  const labels = ["Top left", "Top right", "Bottom right", "Bottom left"];
  function update(index: number, x: number, y: number) {
    onChange(
      corners.map((point, i) =>
        i === index
          ? {
              x: Math.max(0, Math.min(100, x)),
              y: Math.max(0, Math.min(100, y)),
            }
          : point,
      ) as unknown as PageCorners,
    );
  }
  return (
    <div className="crop-editor">
      <div className="crop-stage" ref={stage} style={{ aspectRatio: ratio }}>
        <LocalImage
          blob={file}
          alt="Original document photo with four page corners"
          onSize={(width, height) => setRatio(width / height)}
        />
        <svg
          className="corners-outline"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polygon
            points={corners.map((point) => `${point.x},${point.y}`).join(" ")}
          />
        </svg>
        {corners.map((point, index) => (
          <button
            type="button"
            key={index}
            className="crop-handle"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
            aria-label={`${labels[index]} page corner`}
            onPointerDown={(event) =>
              event.currentTarget.setPointerCapture(event.pointerId)
            }
            onPointerMove={(event) => {
              if (
                !event.currentTarget.hasPointerCapture(event.pointerId) ||
                !stage.current
              )
                return;
              const rect = stage.current.getBoundingClientRect();
              update(
                index,
                ((event.clientX - rect.left) / rect.width) * 100,
                ((event.clientY - rect.top) / rect.height) * 100,
              );
            }}
            onKeyDown={(event) => {
              if (
                !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
                  event.key,
                )
              )
                return;
              event.preventDefault();
              update(
                index,
                point.x +
                  (event.key === "ArrowLeft"
                    ? -1
                    : event.key === "ArrowRight"
                      ? 1
                      : 0),
                point.y +
                  (event.key === "ArrowUp"
                    ? -1
                    : event.key === "ArrowDown"
                      ? 1
                      : 0),
              );
            }}
          >
            <span aria-hidden="true" />
          </button>
        ))}
      </div>
      <p className="hint">
        Place a handle on each corner of the physical page. The result
        straightens the selected page; it does not detect corners automatically.
      </p>
      <details>
        <summary>Set exact page corners</summary>
        <div className="crop-inputs">
          {corners.map((point, index) =>
            ["x", "y"].map((axis) => (
              <label key={`${index}-${axis}`}>
                {labels[index]} {axis.toUpperCase()} (%)
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={Math.round(point[axis as "x" | "y"])}
                  onChange={(event) =>
                    update(
                      index,
                      axis === "x" ? Number(event.target.value) : point.x,
                      axis === "y" ? Number(event.target.value) : point.y,
                    )
                  }
                />
              </label>
            )),
          )}
        </div>
      </details>
    </div>
  );
}

export function ImageEditor({
  file,
  settings,
  onChange,
  disabled = false,
  signature = false,
  documentMode = false,
}: {
  file: Blob;
  settings: ImageSettings;
  onChange: (settings: ImageSettings) => void;
  disabled?: boolean;
  signature?: boolean;
  documentMode?: boolean;
}) {
  const [cropping, setCropping] = useState<"crop" | "corners" | null>(null);
  const cropButton = useRef<HTMLButtonElement>(null);
  return (
    <fieldset disabled={disabled} className="image-editor">
      <legend className="sr-only">Prepare image</legend>
      {cropping === "crop" ? (
        <CropControls
          file={file}
          crop={settings.crop}
          onChange={(crop) =>
            onChange({ ...settings, crop, corners: undefined })
          }
        />
      ) : cropping === "corners" ? (
        <PageCornerControls
          file={file}
          corners={settings.corners ?? FULL_PAGE_CORNERS}
          onChange={(corners) =>
            onChange({ ...settings, crop: FULL_CROP, corners })
          }
        />
      ) : (
        <PreparedPreview file={file} settings={settings} />
      )}
      <div className="actions">
        <button
          type="button"
          ref={cropButton}
          className="button button-secondary"
          onClick={() => {
            setCropping((value) => (value === "crop" ? null : "crop"));
            if (settings.corners) onChange({ ...settings, corners: undefined });
          }}
        >
          <CropIcon size={20} strokeWidth={1.5} aria-hidden="true" />
          {cropping === "crop" ? "Apply crop" : "Crop"}
        </button>
        {documentMode && (
          <button
            type="button"
            className="button button-secondary"
            onClick={() => {
              if (cropping === "corners") setCropping(null);
              else {
                onChange({
                  ...settings,
                  crop: FULL_CROP,
                  corners: settings.corners ?? FULL_PAGE_CORNERS,
                });
                setCropping("corners");
              }
            }}
          >
            {cropping === "corners" ? "Apply corners" : "Correct page corners"}
          </button>
        )}
        <button
          type="button"
          className="button button-secondary"
          onClick={() =>
            onChange({ ...settings, rotation: (settings.rotation + 90) % 360 })
          }
        >
          <RotateCw size={20} strokeWidth={1.5} aria-hidden="true" />
          Rotate
        </button>
        <button
          type="button"
          className="button button-ghost"
          onClick={() => {
            onChange({
              crop: FULL_CROP,
              rotation: 0,
              straighten: 0,
              mode: "original",
              trim: false,
            });
            setCropping(null);
          }}
        >
          <Undo2 size={20} strokeWidth={1.5} aria-hidden="true" />
          Reset edits
        </button>
      </div>
      <div className="editing-controls">
        <label className="field">
          Straighten ({settings.straighten}°)
          <input
            type="range"
            min={-15}
            max={15}
            step={0.5}
            value={settings.straighten}
            onChange={(event) =>
              onChange({ ...settings, straighten: Number(event.target.value) })
            }
          />
        </label>
        {!signature && (
          <label className="field">
            Readability
            <select
              aria-label="Readability"
              value={settings.mode}
              onChange={(event) =>
                onChange({
                  ...settings,
                  mode: event.target.value as ImageSettings["mode"],
                })
              }
            >
              <option value="original">Original</option>
              <option value="clean">Clean</option>
              <option value="grayscale">Grayscale</option>
            </select>
          </label>
        )}
        {signature && (
          <label className="check-label">
            <input
              type="checkbox"
              checked={Boolean(settings.trim)}
              onChange={(event) =>
                onChange({ ...settings, trim: event.target.checked })
              }
            />
            Trim blank space around the signature
          </label>
        )}
      </div>
    </fieldset>
  );
}
