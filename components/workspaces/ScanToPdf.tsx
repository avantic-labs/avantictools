"use client";
import { usePageReflow } from "@/lib/use-page-reflow";
import { useCompactLayout } from "@/lib/use-compact-layout";
import { useState } from "react";
import { ArrowUp, ArrowDown, RotateCw, Trash2 } from "lucide-react";
import {
  prepareImage,
  canvasBlob,
  DEFAULT_IMAGE_SETTINGS,
  type ImageSettings,
} from "@/lib/files/images";
import { scanToPdf } from "@/lib/files/pdf";
import { FILE_LIMITS, FileProblem, moveItem } from "@/lib/files/shared";
import { trackUtilityEvent } from "@/lib/analytics/utilities";
import { ImageEditor } from "./ImageEditor";
import {
  Upload,
  LocalImage,
  ResultPanel,
  TaskStatus,
  useLocalTask,
} from "./shared";
import { ContinueWith } from "./ContinueWith";
type Page = { id: string; file: File; preview: Blob; settings: ImageSettings };

export function ScanToPdf() {
  const compact = useCompactLayout();
  const [pages, setPages] = useState<Page[]>([]);
  const [selected, setSelected] = useState("");
  const pageGrid = usePageReflow(pages.map((page) => page.id).join(","));
  const [result, setResult] = useState<Blob | null>(null);
  const task = useLocalTask();
  const current = pages.find((page) => page.id === selected) ?? pages[0];
  async function add(files: File[]) {
    const added = await task.run("Opening photos", async () => {
      if (pages.length + files.length > FILE_LIMITS.pages)
        throw new FileProblem(
          "Keep this scan to 50 pages. Download this batch before adding more.",
        );
      if (
        [...pages.map((page) => page.file), ...files].reduce(
          (total, file) => total + file.size,
          0,
        ) > FILE_LIMITS.totalBytes
      )
        throw new FileProblem(
          "This batch is too large. Keep the combined photos below 80 MB.",
        );
      const added: Page[] = [];
      for (const file of files) {
        const canvas = await prepareImage(file, DEFAULT_IMAGE_SETTINGS, 360);
        let preview: Blob;
        try {
          preview = await canvasBlob(canvas, "image/jpeg", 0.7);
        } finally {
          canvas.width = canvas.height = 0;
        }
        added.push({
          id: crypto.randomUUID(),
          file,
          preview,
          settings: { ...DEFAULT_IMAGE_SETTINGS },
        });
      }
      return added;
    });
    if (added) {
      setPages([...pages, ...added]);
      setSelected(added[0]?.id ?? selected);
      setResult(null);
    }
  }
  function update(id: string, settings: ImageSettings) {
    setPages(
      pages.map((page) => (page.id === id ? { ...page, settings } : page)),
    );
    setResult(null);
  }
  async function exportPdf() {
    setResult(null);
    const blob = await task.run("Preparing PDF", (report) =>
      scanToPdf(pages, report),
    );
    if (blob) {
      setResult(blob);
      trackUtilityEvent("scan-to-pdf", "tool_completed", "process");
    }
  }
  const cameraUpload = (
    <Upload
      label="Take a photo"
      accept="image/jpeg,image/png,image/webp"
      camera
      busy={task.busy}
      onFiles={add}
    />
  );
  return (
    <div className="workspace-panel">
      <div className="capture-options">
        {compact && cameraUpload}
        <Upload
          label={pages.length ? "Add pages" : "Upload photos"}
          accept="image/jpeg,image/png,image/webp"
          multiple
          busy={task.busy}
          onFiles={add}
        />
        {!compact && cameraUpload}
      </div>
      <p className="hint">
        JPEG, PNG or WebP. Up to 50 pages, 20 MB per photo and 80 MB per batch.
      </p>
      <TaskStatus task={task} />
      {current && (
        <>
          <div className="section-title">
            <h2>Prepare page {pages.indexOf(current) + 1}</h2>
            <span className="hint">
              {pages.length} {pages.length === 1 ? "page" : "pages"}
            </span>
          </div>
          <ImageEditor
            documentMode
            key={current.id}
            file={current.file}
            settings={current.settings}
            disabled={task.busy}
            onChange={(settings) => update(current.id, settings)}
          />
          <ol ref={pageGrid} className="page-grid" aria-label="Scanned pages">
            {pages.map((page, index) => (
              <li className="page-tile" data-page-id={page.id} key={page.id}>
                <div className="page-thumbnail">
                  <LocalImage
                    blob={page.preview}
                    alt={`Page ${index + 1}`}
                    rotation={page.settings.rotation}
                  />
                </div>
                <button
                  type="button"
                  className="button button-ghost"
                  aria-pressed={current.id === page.id}
                  disabled={task.busy}
                  onClick={() => setSelected(page.id)}
                >
                  Edit page {index + 1}
                </button>
                <div className="page-controls">
                  <button
                    type="button"
                    className="button button-secondary"
                    aria-label={`Move page ${index + 1} earlier`}
                    disabled={task.busy || index === 0}
                    onClick={() => {
                      setPages(moveItem(pages, index, -1));
                      setResult(null);
                    }}
                  >
                    <ArrowUp size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    aria-label={`Move page ${index + 1} later`}
                    disabled={task.busy || index === pages.length - 1}
                    onClick={() => {
                      setPages(moveItem(pages, index, 1));
                      setResult(null);
                    }}
                  >
                    <ArrowDown size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    aria-label={`Rotate page ${index + 1}`}
                    disabled={task.busy}
                    onClick={() =>
                      update(page.id, {
                        ...page.settings,
                        rotation: (page.settings.rotation + 90) % 360,
                      })
                    }
                  >
                    <RotateCw size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    aria-label={`Delete page ${index + 1}`}
                    disabled={task.busy}
                    onClick={() => {
                      setPages(pages.filter((item) => item.id !== page.id));
                      setResult(null);
                    }}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ol>
          <div className="actions">
            <button
              type="button"
              className="button"
              disabled={task.busy}
              onClick={exportPdf}
            >
              Create PDF
            </button>
            <button
              type="button"
              className="button button-secondary"
              disabled={task.busy}
              onClick={() => {
                setPages([]);
                setSelected("");
                setResult(null);
                task.setError("");
              }}
            >
              Clear scan
            </button>
          </div>
        </>
      )}
      {result && (
        <>
          <ResultPanel
            blob={result}
            filename="avantic-scan.pdf"
            tool="scan-to-pdf"
          >
            <p className="hint">
              {pages.length} prepared {pages.length === 1 ? "page" : "pages"} in
              one A4 PDF.
            </p>
          </ResultPanel>
          <div className="actions">
            <ContinueWith blob={result} target="pdf-organizer">
              Organize this PDF
            </ContinueWith>
            <ContinueWith blob={result} target="file-compressor">
              Compress this PDF
            </ContinueWith>
          </div>
        </>
      )}
    </div>
  );
}
