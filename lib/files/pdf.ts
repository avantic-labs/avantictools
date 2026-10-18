import type { PDFPageProxy, PageViewport } from "pdfjs-dist";
import {
  FILE_LIMITS,
  FileProblem,
  checkFileSize,
  QUALITY_PRESETS,
  type QualityPreset,
  yieldToBrowser,
} from "./shared";
import { canvasBlob, prepareImage, type ImageSettings } from "./images";

import { pdfWorker } from "./pdf-worker-client";
import type { PdfSource } from "./pdf-core";
export type { PdfSource } from "./pdf-core";
export type PdfPage = {
  id: string;
  sourceId: string;
  index: number;
  rotation: number;
  preview: Blob;
};

async function withinLimit<T>(
  operation: Promise<T>,
  cancel: () => void = () => {},
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout>;
  const deadline = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      reject(
        new FileProblem(
          "This PDF is too complex for this device. Try fewer pages or a smaller file.",
        ),
      );
      cancel();
    }, 30_000);
  });
  try {
    return await Promise.race([operation, deadline]);
  } finally {
    clearTimeout(timeout!);
  }
}

async function renderPage(
  page: PDFPageProxy,
  canvas: HTMLCanvasElement,
  viewport: PageViewport,
) {
  const task = page.render({ canvas, viewport });
  await withinLimit(task.promise, () => task.cancel());
}

async function renderer(bytes: Uint8Array) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = "/vendor/pdf.worker.min.mjs";
  const task = pdfjs.getDocument({
    data: bytes.slice(),
    verbosity: 0,
    stopAtErrors: true,
    enableXfa: false,
    useWorkerFetch: false,
    useSystemFonts: false,
    standardFontDataUrl: "/vendor/standard_fonts/",
    wasmUrl: "/vendor/wasm/",
    cMapUrl: "/vendor/cmaps/",
    cMapPacked: true,
    maxImageSize: FILE_LIMITS.imagePixels,
    canvasMaxAreaInBytes: FILE_LIMITS.canvasPixels * 4,
  });
  try {
    return await withinLimit(task.promise);
  } catch {
    await task.destroy();
    throw new FileProblem(
      "This PDF cannot be previewed. Try a smaller, unlocked PDF exported from its original app.",
    );
  }
}

export async function importPdf(
  file: File,
  existingPages: number,
  progress: (done: number, total: number) => void,
): Promise<{ source: PdfSource; pages: PdfPage[] }> {
  checkFileSize(file, "pdf");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const count = await pdfWorker<number>({ operation: "inspect", bytes });
  if (count + existingPages > FILE_LIMITS.pages)
    throw new FileProblem(
      "Keep this workspace to 50 pages. Download this batch before adding more.",
    );
  const rendered = await renderer(bytes);
  const source = { id: crypto.randomUUID(), bytes, pageCount: count };
  const pages: PdfPage[] = [];
  try {
    for (let index = 0; index < count; index++) {
      const page = await withinLimit(rendered.getPage(index + 1));
      const initial = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({
        scale: Math.min(1, 360 / Math.max(initial.width, initial.height)),
      });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      try {
        await renderPage(page, canvas, viewport);
        pages.push({
          id: crypto.randomUUID(),
          sourceId: source.id,
          index,
          rotation: 0,
          preview: await canvasBlob(canvas, "image/jpeg", 0.7),
        });
      } finally {
        canvas.width = canvas.height = 0;
        page.cleanup();
      }
      progress(index + 1, count);
      await yieldToBrowser();
    }
    return { source, pages };
  } finally {
    await rendered.loadingTask.destroy();
  }
}

export async function organizePdf(
  sources: readonly PdfSource[],
  pages: readonly PdfPage[],
  progress: (done: number, total: number) => void,
): Promise<Blob> {
  const bytes = await pdfWorker<ArrayBuffer>(
    {
      operation: "organize",
      sources: [...sources],
      pages: pages.map(({ sourceId, index, rotation }) => ({
        sourceId,
        index,
        rotation,
      })),
    },
    progress,
  );
  return new Blob([bytes], { type: "application/pdf" });
}

export async function scanToPdf(
  pages: readonly { file: Blob; settings: ImageSettings }[],
  progress: (done: number, total: number) => void,
): Promise<Blob> {
  if (!pages.length || pages.length > FILE_LIMITS.pages)
    throw new FileProblem("Add between 1 and 50 pages.");
  const { PDFDocument } = await import("pdf-lib");
  const output = await PDFDocument.create();
  for (const [index, source] of pages.entries()) {
    const canvas = await prepareImage(source.file, source.settings);
    try {
      const context = canvas.getContext("2d")!;
      context.globalCompositeOperation = "destination-over";
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.globalCompositeOperation = "source-over";
      const blob = await canvasBlob(canvas, "image/jpeg", 0.9);
      const image = await output.embedJpg(await blob.arrayBuffer());
      // Fit the photo inside A4 with a small, deliberate printable margin.
      const landscape = canvas.width > canvas.height;
      const [width, height] = landscape ? [841.89, 595.28] : [595.28, 841.89];
      const page = output.addPage([width, height]);
      const scale = Math.min(
        (width - 32) / image.width,
        (height - 32) / image.height,
      );
      page.drawImage(image, {
        x: (width - image.width * scale) / 2,
        y: (height - image.height * scale) / 2,
        width: image.width * scale,
        height: image.height * scale,
      });
    } finally {
      canvas.width = canvas.height = 0;
    }
    progress(index + 1, pages.length);
    await yieldToBrowser();
  }
  output.setProducer("AVANTIC Tools");
  return new Blob([new Uint8Array(await output.save())], {
    type: "application/pdf",
  });
}

export async function compressPdf(
  file: File,
  preset: QualityPreset,
  progress: (done: number, total: number) => void,
): Promise<Blob> {
  checkFileSize(file, "pdf");
  const bytes = new Uint8Array(await file.arrayBuffer());
  await pdfWorker<number>({ operation: "inspect", bytes });
  const source = await renderer(bytes);
  const { PDFDocument } = await import("pdf-lib");
  const output = await PDFDocument.create();
  const options = QUALITY_PRESETS[preset];
  try {
    for (let number = 1; number <= source.numPages; number++) {
      const original = await withinLimit(source.getPage(number));
      const size = original.getViewport({ scale: 1 });
      const scale = Math.min(
        options.edge / Math.max(size.width, size.height),
        Math.sqrt(FILE_LIMITS.canvasPixels / (size.width * size.height)),
      );
      const viewport = original.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      try {
        await renderPage(original, canvas, viewport);
        const image = await output.embedJpg(
          await (
            await canvasBlob(canvas, "image/jpeg", options.quality)
          ).arrayBuffer(),
        );
        const page = output.addPage([size.width, size.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: size.width,
          height: size.height,
        });
      } finally {
        canvas.width = canvas.height = 0;
        original.cleanup();
      }
      progress(number, source.numPages);
      await yieldToBrowser();
    }
    output.setProducer("AVANTIC Tools");
    const result = new Blob([new Uint8Array(await output.save())], {
      type: "application/pdf",
    });
    return result.size < file.size ? result : file;
  } finally {
    await source.loadingTask.destroy();
  }
}
