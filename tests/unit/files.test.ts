import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import {
  checkFileSize,
  FileProblem,
  fileMessage,
  moveItem,
} from "../../lib/files/shared";
import {
  imageDimensions,
  validateCrop,
  FULL_CROP,
} from "../../lib/files/images";
import { organizePdfCore } from "../../lib/files/pdf-core";
import type { PdfPage } from "../../lib/files/pdf";

describe("local file boundaries", () => {
  it("rejects empty and oversized files with content-free errors", () => {
    expect(() => checkFileSize(new Blob(), "image")).toThrow("empty");
    expect(() =>
      checkFileSize(new Blob([new Uint8Array(21 * 1024 * 1024)]), "image"),
    ).toThrow("under 20 MB");
    expect(fileMessage(new Error("private document data"))).not.toContain(
      "private",
    );
    expect(fileMessage(new FileProblem("Choose a smaller file."))).toBe(
      "Choose a smaller file.",
    );
  });
  it("supports accessible one-step reordering without mutating inputs", () => {
    const pages = ["a", "b", "c"];
    expect(moveItem(pages, 1, -1)).toEqual(["b", "a", "c"]);
    expect(moveItem(pages, 0, -1)).toEqual(pages);
    expect(moveItem(pages, 2, 1)).toEqual(pages);
    expect(pages).toEqual(["a", "b", "c"]);
  });
  it("validates crop geometry before processing", () => {
    expect(() => validateCrop(FULL_CROP)).not.toThrow();
    for (const crop of [
      { left: -1, top: 0, width: 100, height: 100 },
      { left: 20, top: 0, width: 90, height: 100 },
      { left: 0, top: 0, width: 0, height: 100 },
    ])
      expect(() => validateCrop(crop)).toThrow();
  });
  it("rejects active-content images and oversized pixel dimensions before decoding", async () => {
    await expect(
      imageDimensions(
        new Blob(["<svg>unsafe image</svg>"], { type: "image/svg+xml" }),
      ),
    ).rejects.toThrow("JPEG, PNG or WebP");
    const header = new Uint8Array(24);
    header.set([137, 80, 78, 71]);
    const view = new DataView(header.buffer);
    view.setUint32(16, 10000);
    view.setUint32(20, 10000);
    await expect(
      imageDimensions(new Blob([header], { type: "image/png" })),
    ).rejects.toThrow("24 megapixels");
  });
});

it("combines, removes, reorders and rotates PDF pages in the exported bytes", async () => {
  const first = await PDFDocument.create();
  first.addPage([300, 400]);
  first.addPage([400, 500]);
  const second = await PDFDocument.create();
  second.addPage([500, 600]);
  const sources = [
    { id: "one", bytes: await first.save(), pageCount: 2 },
    { id: "two", bytes: await second.save(), pageCount: 1 },
  ];
  const pages: PdfPage[] = [
    { id: "b", sourceId: "two", index: 0, rotation: 90, preview: new Blob() },
    { id: "a", sourceId: "one", index: 0, rotation: 0, preview: new Blob() },
  ];
  const result = await organizePdfCore(sources, pages, () => {});
  const output = await PDFDocument.load(result);
  expect(output.getPageCount()).toBe(2);
  expect(output.getPages().map((p) => p.getWidth())).toEqual([500, 300]);
  expect(output.getPages().map((p) => p.getRotation().angle)).toEqual([90, 0]);
});

it("removes embedded executable actions from organized PDFs", async () => {
  const { PDFName } = await import("pdf-lib");
  const source = await PDFDocument.create();
  const page = source.addPage();
  page.node.set(
    PDFName.of("AA"),
    source.context.obj({ O: { S: "JavaScript", JS: "synthetic action" } }),
  );
  const output = await organizePdfCore(
    [{ id: "source", bytes: await source.save(), pageCount: 1 }],
    [{ sourceId: "source", index: 0, rotation: 0 }],
    () => {},
  );
  expect(
    (await PDFDocument.load(output)).getPage(0).node.has(PDFName.of("AA")),
  ).toBe(false);
});

it("preserves valid resource names A and AA while removing attachment annotations", async () => {
  const {
    PDFName,
    StandardFonts,
    beginText,
    setFontAndSize,
    moveText,
    showText,
    endText,
    PDFHexString,
    PDFDict,
  } = await import("pdf-lib");
  const source = await PDFDocument.create();
  const page = source.addPage();
  const font = await source.embedFont(StandardFonts.Helvetica);
  page.node.setFontDictionary(PDFName.of("A"), font.ref);
  page.node.setFontDictionary(PDFName.of("AA"), font.ref);
  page.pushOperators(
    beginText(),
    setFontAndSize(PDFName.of("A"), 12),
    moveText(40, 700),
    showText(PDFHexString.fromText("Visible content")),
    endText(),
  );
  page.node.addAnnot(
    source.context.register(
      source.context.obj({
        Type: "Annot",
        Subtype: "FileAttachment",
        FS: { Type: "Filespec", F: "synthetic.txt" },
      }),
    ),
  );
  const bytes = await organizePdfCore(
    [{ id: "source", bytes: await source.save(), pageCount: 1 }],
    [{ sourceId: "source", index: 0, rotation: 0 }],
    () => {},
  );
  const output = await PDFDocument.load(bytes);
  const result = output.getPage(0);
  const resources = result.node
    .Resources()!
    .lookup(PDFName.of("Font"), PDFDict);
  expect(resources.has(PDFName.of("A"))).toBe(true);
  expect(resources.has(PDFName.of("AA"))).toBe(true);
  expect(result.node.Annots()?.size()).toBe(0);
});
