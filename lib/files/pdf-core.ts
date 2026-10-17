import { PDFArray, PDFDict, PDFDocument, PDFName, degrees } from "pdf-lib";
import { FILE_LIMITS, FileProblem, yieldToBrowser } from "./shared";

export type PdfSource = { id: string; bytes: Uint8Array; pageCount: number };
export type PdfSelection = {
  sourceId: string;
  index: number;
  rotation: number;
};

export async function openPdf(bytes: Uint8Array) {
  try {
    const document = await PDFDocument.load(bytes, {
      ignoreEncryption: false,
      throwOnInvalidObject: true,
      updateMetadata: false,
    });
    if (document.isEncrypted)
      throw new FileProblem(
        "Encrypted PDFs cannot be edited here. Export an unlocked copy from a trusted PDF app first.",
      );
    if (!document.getPageCount())
      throw new FileProblem("This PDF has no pages. Choose another file.");
    if (document.getPageCount() > FILE_LIMITS.pages)
      throw new FileProblem(
        "Choose a PDF with 50 pages or fewer. Split larger documents before uploading.",
      );
    return document;
  } catch (error) {
    if (error instanceof FileProblem) throw error;
    if (error instanceof Error && error.name === "EncryptedPDFError")
      throw new FileProblem(
        "This PDF is password-protected. Export an unlocked copy first.",
      );
    throw new FileProblem(
      "This PDF is damaged, encrypted or unsupported. Export a fresh unlocked PDF and try again.",
    );
  }
}

export async function organizePdfCore(
  sources: readonly PdfSource[],
  pages: readonly PdfSelection[],
  progress: (done: number, total: number) => void,
): Promise<Uint8Array> {
  if (!pages.length || pages.length > FILE_LIMITS.pages)
    throw new FileProblem("Add between 1 and 50 pages.");
  if (
    sources.reduce((size, source) => size + source.bytes.byteLength, 0) >
    FILE_LIMITS.totalBytes
  )
    throw new FileProblem("Keep the combined PDFs below 80 MB.");
  const output = await PDFDocument.create();
  const documents = new Map<string, PDFDocument>();
  for (const source of sources)
    if (pages.some((page) => page.sourceId === source.id))
      documents.set(source.id, await openPdf(source.bytes));
  for (const [index, page] of pages.entries()) {
    const source = documents.get(page.sourceId);
    if (
      !source ||
      !Number.isInteger(page.index) ||
      page.index < 0 ||
      page.index >= source.getPageCount()
    )
      throw new FileProblem(
        "A source page is missing. Clear this workspace and upload it again.",
      );
    const [copied] = await output.copyPages(source, [page.index]);
    copied.setRotation(
      degrees((copied.getRotation().angle + page.rotation) % 360),
    );
    output.addPage(copied);
    progress(index + 1, pages.length);
    await yieldToBrowser();
  }
  // Preserve visible page content, but do not carry executable actions, attachments
  // or external submissions into a newly assembled document.
  const pending = output.context
    .enumerateIndirectObjects()
    .map(([, object]) => object);
  const visited = new Set();
  while (pending.length) {
    const object = pending.pop()!;
    if (visited.has(object)) continue;
    visited.add(object);
    if (object instanceof PDFDict) {
      for (const key of [
        "A",
        "AA",
        "OpenAction",
        "JS",
        "JavaScript",
        "XFA",
        "EmbeddedFiles",
        "AF",
      ])
        object.delete(PDFName.of(key));
      pending.push(...object.values());
    } else if (object instanceof PDFArray) pending.push(...object.asArray());
  }
  output.setProducer("AVANTIC Tools");
  return output.save();
}
