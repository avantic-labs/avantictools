import { it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { createCanvas } from "@napi-rs/canvas";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { invoicePdf } from "../../lib/business/invoice-pdf";

it("renders all invoice title letters, including embedded font outlines", async () => {
  const font = new Uint8Array(await readFile("assets/fonts/Inter-Regular.ttf"))
    .buffer;
  const data = {
    kind: "invoice" as const,
    business: "Ọmọ Studio",
    customer: "Example customer",
    number: "INV-001",
    issueDate: "2026-10-17",
    dueDate: "",
    notes: "",
    payment: "",
    paymentMethod: "",
    discount: "0",
    tax: "0",
    items: [
      {
        id: "1",
        description: "Design services",
        quantity: "1",
        unitPrice: "15000",
      },
    ],
  };
  const output = await invoicePdf(data, undefined, font);
  const task = getDocument({
    data: new Uint8Array(await output.arrayBuffer()),
    verbosity: 0,
  });
  const pdf = await task.promise;
  try {
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    const canvas = createCanvas(
      Math.ceil(viewport.width),
      Math.ceil(viewport.height),
    );
    const context = canvas.getContext("2d");
    // Native canvas is a test-only equivalent of the browser rendering surface.
    await page.render({
      canvas: canvas as unknown as HTMLCanvasElement,
      canvasContext: context as unknown as CanvasRenderingContext2D,
      viewport,
    }).promise;
    // INVOICE begins at x=40, baseline=40 from top. Each expected glyph column
    // must contain visible ink; text extraction alone missed variable-font loss.
    for (const [left, right] of [
      [42, 45],
      [48, 62],
      [66, 81],
      [82, 97],
      [101, 104],
      [108, 121],
      [125, 137],
    ]) {
      const pixels = context.getImageData(left, 18, right - left, 24).data;
      expect(
        Array.from(pixels).filter(
          (value, index) => index % 4 !== 3 && value < 100,
        ).length,
      ).toBeGreaterThan(3);
    }
    const text = (await page.getTextContent()).items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    expect(text).toContain("₦15,000.00");
    expect(text).toContain("Ọmọ");
  } finally {
    await task.destroy();
  }
});
