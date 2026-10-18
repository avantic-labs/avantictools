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
