export const FILE_LIMITS = {
  imageBytes: 20 * 1024 * 1024,
  pdfBytes: 40 * 1024 * 1024,
  totalBytes: 80 * 1024 * 1024,
  pages: 50,
  imagePixels: 24_000_000,
  canvasPixels: 4_000_000,
} as const;
export type QualityPreset = "smallest" | "balanced" | "best";
export const QUALITY_PRESETS = {
  smallest: { label: "Smallest", quality: 0.5, edge: 1280, colors: 32 },
  balanced: { label: "Balanced", quality: 0.72, edge: 1920, colors: 16 },
  best: { label: "Best Quality", quality: 0.9, edge: 2560, colors: 4 },
} as const;

export class FileProblem extends Error {}
export function fileErrorCode(error: unknown) {
  if (!(error instanceof FileProblem)) return "export_failed" as const;
  const message = error.message.toLowerCase();
  if (message.includes("encrypted") || message.includes("password-protected")) return "encrypted_pdf" as const;
  if (message.includes("50 pages") || message.includes("too many") || message.includes("between 1 and 50")) return "too_many_pages" as const;
  if (message.includes("too large") || message.includes("under 20 mb") || message.includes("under 40 mb") || message.includes("below 80 mb")) return "file_too_large" as const;
  if (message.includes("memory") || message.includes("device") || message.includes("16,384")) return "memory_limit" as const;
  if (message.includes("unsupported") || message.includes("valid jpeg") || message.includes("format")) return "unsupported_format" as const;
  if (message.includes("damaged") || message.includes("could not be opened") || message.includes("empty")) return "corrupted_file" as const;
  return "export_failed" as const;
}
export function fileMessage(error: unknown): string {
  return error instanceof FileProblem
    ? error.message
    : "This file could not be processed. Try a smaller file or export a fresh copy and upload it again.";
}
export function fileSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
export function checkFileSize(file: Blob, kind: "image" | "pdf") {
  const maximum =
    kind === "pdf" ? FILE_LIMITS.pdfBytes : FILE_LIMITS.imageBytes;
  if (!file.size)
    throw new FileProblem("This file is empty. Choose another file.");
  if (file.size > maximum)
    throw new FileProblem(
      `Choose a ${kind === "pdf" ? "PDF under 40 MB" : "photo under 20 MB"}. Split large jobs into smaller batches.`,
    );
}
export async function yieldToBrowser() {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Safari needs the URL to remain alive until the download has started.
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export function moveItem<T>(
  items: readonly T[],
  index: number,
  direction: -1 | 1,
): T[] {
  const target = index + direction;
  if (
    index < 0 ||
    target < 0 ||
    index >= items.length ||
    target >= items.length
  )
    return [...items];
  const result = [...items];
  [result[index], result[target]] = [result[target], result[index]];
  return result;
}
