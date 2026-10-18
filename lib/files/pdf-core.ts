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
    // Remove active page/annotation entries before copying their object graph.
    // These are page dictionaries, not resource dictionaries where any name is valid.
    const original = source.getPage(page.index);
    original.node.delete(PDFName.of("AA"));
    original.node.delete(PDFName.of("AF"));
    const annotations = original.node.Annots();
    if (annotations)
      for (let i = annotations.size() - 1; i >= 0; i--) {
        const annotation = source.context.lookup(annotations.get(i));
        if (!(annotation instanceof PDFDict)) continue;
        const subtype = annotation.get(PDFName.of("Subtype"))?.toString();
        if (
          ["/FileAttachment", "/RichMedia", "/Movie", "/Sound"].includes(
            subtype ?? "",
          )
        )
          annotations.remove(i);
        else {
          annotation.delete(PDFName.of("A"));
          annotation.delete(PDFName.of("AA"));
        }
      }
    const [copied] = await output.copyPages(source, [page.index]);
    copied.setRotation(
      degrees((copied.getRotation().angle + page.rotation) % 360),
    );
    output.addPage(copied);
    progress(index + 1, pages.length);
    await yieldToBrowser();
  }
  // An action field must resolve to an actual action dictionary. Names such as
  // /A and /AA are also legal font/image resource names and must remain intact.
  const actionKinds = new Set([
    "/GoTo",
    "/GoToR",
    "/GoToE",
    "/Launch",
    "/Thread",
    "/URI",
    "/Sound",
    "/Movie",
    "/Hide",
    "/Named",
    "/SubmitForm",
    "/ResetForm",
    "/ImportData",
    "/JavaScript",
    "/SetOCGState",
    "/Rendition",
    "/Trans",
    "/GoTo3DView",
  ]);
  function isAction(object: unknown): object is PDFDict {
    return (
      object instanceof PDFDict &&
      actionKinds.has(object.get(PDFName.of("S"))?.toString() ?? "")
    );
  }
  const pending = output.context
    .enumerateIndirectObjects()
    .map(([, object]) => object);
  const visited = new Set();
  while (pending.length) {
    const object = pending.pop()!;
    if (visited.has(object)) continue;
    visited.add(object);
    if (object instanceof PDFDict) {
      if (isAction(output.context.lookup(object.get(PDFName.of("A")))))
        object.delete(PDFName.of("A"));
      const additional = output.context.lookup(object.get(PDFName.of("AA")));
      if (
        additional instanceof PDFDict &&
        additional
          .values()
          .some((value) => isAction(output.context.lookup(value)))
      )
        object.delete(PDFName.of("AA"));
      if (
        isAction(object) &&
        object.get(PDFName.of("S"))?.toString() === "/JavaScript"
      )
        object.delete(PDFName.of("JS"));
      pending.push(...object.values());
    } else if (object instanceof PDFArray) pending.push(...object.asArray());
  }
  output.setProducer("AVANTIC Tools");
  return output.save();
}
