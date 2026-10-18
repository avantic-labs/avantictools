"use client";
import { useEffect, useId, useRef, useState, type DragEvent } from "react";
import { AlertCircle, Download, Share2 } from "lucide-react";
import {
  downloadBlob,
  fileMessage,
  fileSize,
  yieldToBrowser,
} from "@/lib/files/shared";
import { trackUtilityEvent } from "@/lib/analytics/utilities";
import type { ToolId } from "@/data/tools";

export function useLocalTask() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState({ done: 0, total: 0, message: "" });
  const active = useRef(false);
  const locked = useRef(false);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  async function run<T>(
    message: string,
    operation: (report: (done: number, total: number) => void) => Promise<T>,
  ): Promise<T | undefined> {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError("");
    setProgress({ done: 0, total: 0, message });
    try {
      await yieldToBrowser();
      const result = await operation((done, total) => {
        if (!active.current) throw new Error("Stopped");
        setProgress({ done, total, message });
      });
      return active.current ? result : undefined;
    } catch (problem) {
      if (active.current) setError(fileMessage(problem));
    } finally {
      locked.current = false;
      if (active.current) setBusy(false);
    }
  }
  return { busy, error, setError, progress, run };
}

export function TaskStatus({
  task,
}: {
  task: ReturnType<typeof useLocalTask>;
}) {
  return (
    <>
      {task.error && (
        <p className="error-message" role="alert">
          <AlertCircle size={20} strokeWidth={1.5} aria-hidden="true" />
          {task.error}
        </p>
      )}
      {task.busy && (
        <div className="progress-block" role="status">
          <p>
            {task.progress.message}
            {task.progress.total
              ? ` ${task.progress.done} of ${task.progress.total} pages`
              : "…"}
          </p>
          <progress
            aria-label="Processing progress"
            max={task.progress.total || 1}
            value={task.progress.total ? task.progress.done : undefined}
          />
        </div>
      )}
    </>
  );
}

export function Upload({
  label = "Upload files",
  accept,
  multiple = false,
  camera = false,
  busy = false,
  onFiles,
}: {
  label?: string;
  accept: string;
  multiple?: boolean;
  camera?: boolean;
  busy?: boolean;
  onFiles: (files: File[]) => void;
}) {
  const id = useId();
  function drop(event: DragEvent) {
    event.preventDefault();
    if (!busy) onFiles(Array.from(event.dataTransfer.files));
  }
  return (
    <div
      className={`upload-zone${camera ? " upload-camera" : ""}`}
      onDragOver={(event) => event.preventDefault()}
      onDrop={drop}
    >
      <div className="upload-control">
        <label className="button button-secondary" htmlFor={id}>
          {label}
        </label>
        <input
          className="upload-input"
          id={id}
          type="file"
          accept={accept}
          multiple={multiple}
          capture={camera ? "environment" : undefined}
          disabled={busy}
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            if (files.length) onFiles(files);
            event.target.value = "";
          }}
        />
      </div>
      <p className="hint">
        {camera ? (
          "Uses your camera where supported. You can upload an image instead."
        ) : (
          <>
            <span className="desktop-only">
              Drop files here, or choose them above.{" "}
            </span>
            <span className="mobile-only">Choose files from your device. </span>
            Files stay on this device.
          </>
        )}
      </p>
    </div>
  );
}

export function LocalImage({
  blob,
  alt,
  rotation = 0,
  onSize,
}: {
  blob: Blob;
  alt: string;
  rotation?: number;
  onSize?: (width: number, height: number) => void;
}) {
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const url = URL.createObjectURL(blob);
    node.src = url;
    return () => {
      node.removeAttribute("src");
      URL.revokeObjectURL(url);
    };
  }, [blob]);
  // Blob URLs must never go through a server image optimizer.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      alt={alt}
      loading="lazy"
      style={{ transform: rotation ? `rotate(${rotation}deg)` : undefined }}
      onLoad={(event) =>
        onSize?.(
          event.currentTarget.naturalWidth,
          event.currentTarget.naturalHeight,
        )
      }
    />
  );
}

export function ResultPanel({
  blob,
  tool,
  filename,
  originalSize,
  children,
}: {
  blob: Blob;
  tool: ToolId;
  filename: string;
  originalSize?: number;
  children?: React.ReactNode;
}) {
  const [message, setMessage] = useState("");
  const file = new File([blob], filename, { type: blob.type });
  const canShare =
    typeof navigator !== "undefined" &&
    Boolean(navigator.canShare?.({ files: [file] }));
  async function share() {
    try {
      await navigator.share({ files: [file], title: "AVANTIC Tools" });
      trackUtilityEvent(tool, "tool_completed", "share");
      setMessage("Shared.");
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        setMessage(
          "Sharing is unavailable. Download the file and attach it instead.",
        );
    }
  }
  return (
    <section className="result-panel" aria-label="Your result">
      <h2>Ready to download</h2>
      {children}
      <dl className="file-metrics">
        {originalSize !== undefined && (
          <div>
            <dt>Original size</dt>
            <dd>{fileSize(originalSize)}</dd>
          </div>
        )}
        <div>
          <dt>Result size</dt>
          <dd>{fileSize(blob.size)}</dd>
        </div>
      </dl>
      <div className="actions">
        <button
          type="button"
          className="button"
          onClick={() => {
            downloadBlob(blob, filename);
            trackUtilityEvent(tool, "tool_completed", "download");
            setMessage("Download started.");
          }}
        >
          <Download size={20} strokeWidth={1.5} aria-hidden="true" />
          Download{blob.type === "application/pdf" ? " PDF" : " image"}
        </button>
        {canShare && (
          <button
            type="button"
            className="button button-secondary"
            onClick={share}
          >
            <Share2 size={20} strokeWidth={1.5} aria-hidden="true" />
            Share
          </button>
        )}
      </div>
      <p className="utility-status" role="status">
        {message}
      </p>
    </section>
  );
}
