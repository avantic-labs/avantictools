"use client";
import { usePageReflow } from "@/lib/use-page-reflow";
import { useEffect, useEffectEvent, useState } from "react";
import { ArrowUp, ArrowDown, RotateCw, Trash2 } from "lucide-react";
import {
  importPdf,
  organizePdf,
  type PdfPage,
  type PdfSource,
} from "@/lib/files/pdf";
import { FILE_LIMITS, FileProblem, moveItem } from "@/lib/files/shared";
import { takeHandoff } from "@/lib/files/handoff";
import { trackUtilityEvent } from "@/lib/analytics/utilities";
import {
  Upload,
  LocalImage,
  ResultPanel,
  TaskStatus,
  useLocalTask,
} from "./shared";
import { ContinueWith } from "./ContinueWith";
export function PdfOrganizer() {
  const [sources, setSources] = useState<PdfSource[]>([]);
  const [pages, setPages] = useState<PdfPage[]>([]);
  const pageGrid = usePageReflow(pages.map((page) => page.id).join(","));
  const [result, setResult] = useState<Blob | null>(null);
  const task = useLocalTask("pdf-organizer");
  async function add(files: File[]) {
    const added = await task.run("Opening PDF pages", async (report) => {
      if (
        sources.reduce((total, source) => total + source.bytes.byteLength, 0) +
          files.reduce((total, file) => total + file.size, 0) >
        FILE_LIMITS.totalBytes
      )
        throw new FileProblem(
          "Keep the combined PDFs below 80 MB. Work in smaller batches.",
        );
      const imported: Awaited<ReturnType<typeof importPdf>>[] = [];
      let count = pages.length;
      for (const file of files) {
        const item = await importPdf(file, count, report);
        imported.push(item);
        count += item.pages.length;
      }
      return imported;
    });
    if (added) {
      setSources([...sources, ...added.map((item) => item.source)]);
      setPages([...pages, ...added.flatMap((item) => item.pages)]);
      setResult(null);
    }
  }
  const acceptHandoff = useEffectEvent((file: File) => {
    void add([file]);
  });
  useEffect(() => {
    // Receive the queued file after the workspace mounts; cancel on navigation.
    const delivery = setTimeout(() => {
      const file = takeHandoff("pdf-organizer");
      if (file) acceptHandoff(file);
    }, 0);
    return () => clearTimeout(delivery);
  }, []);
  function remove(id: string) {
    const remaining = pages.filter((page) => page.id !== id);
    setPages(remaining);
    setSources(
      sources.filter((source) =>
        remaining.some((page) => page.sourceId === source.id),
      ),
    );
    setResult(null);
  }
  async function exportPdf() {
    setResult(null);
    const blob = await task.run("Organizing PDF", (report) =>
      organizePdf(sources, pages, report),
    );
    if (blob) {
      setResult(blob);
      trackUtilityEvent("pdf-organizer", "tool_completed", "process");
    }
  }
  return (
    <div className="workspace-panel">
      <Upload
        label={pages.length ? "Add PDFs" : "Upload PDFs"}
        accept="application/pdf,.pdf"
        multiple
        busy={task.busy}
        onFiles={add}
      />
      <p className="hint">
        Up to 50 pages, 40 MB per PDF and 80 MB in total. Use an unlocked PDF.
        Page content is copied; interactive links, document-level bookmarks and
        forms may not carry over.
      </p>
      <TaskStatus task={task} />
      {pages.length > 0 && (
        <>
          <h2>{pages.length} pages in this document</h2>
          <ol ref={pageGrid} className="page-grid" aria-label="PDF pages">
            {pages.map((page, index) => (
              <li className="page-tile" data-page-id={page.id} key={page.id}>
                <div className="page-thumbnail">
                  <LocalImage
                    blob={page.preview}
                    alt={`Page ${index + 1}`}
                    rotation={page.rotation}
                  />
                </div>
                <p>Page {index + 1}</p>
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
                    onClick={() => {
                      setPages(
                        pages.map((item) =>
                          item.id === page.id
                            ? { ...item, rotation: (item.rotation + 90) % 360 }
                            : item,
                        ),
                      );
                      setResult(null);
                    }}
                  >
                    <RotateCw size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    aria-label={`Delete page ${index + 1}`}
                    disabled={task.busy}
                    onClick={() => remove(page.id)}
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
                setSources([]);
                setResult(null);
                task.setError("");
              }}
            >
              Clear document
            </button>
          </div>
        </>
      )}
      {result && (
        <>
          <ResultPanel
            blob={result}
            filename="avantic-organized.pdf"
            tool="pdf-organizer"
          >
            <p className="hint">
              Review the exported document before sending it.
            </p>
          </ResultPanel>
          <ContinueWith blob={result} from="pdf-organizer" target="file-compressor">
            Compress this PDF
          </ContinueWith>
        </>
      )}
    </div>
  );
}
