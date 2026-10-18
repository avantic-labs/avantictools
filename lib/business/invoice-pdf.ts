import { PDFDocument, rgb, type PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { FileProblem } from "../files/shared";
import { readableDate } from "../utilities/calculations";
import {
  naira,
  validateBusinessDocument,
  type BusinessDocument,
} from "./invoice";

export async function invoicePdf(
  data: BusinessDocument,
  logo?: Blob,
  fontBytes?: ArrayBuffer,
): Promise<Blob> {
  const totals = validateBusinessDocument(data);
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const bytes =
    fontBytes ??
    (await (
      await fetch("/fonts/Inter-Regular.ttf", {
        credentials: "same-origin",
        cache: "force-cache",
      })
    ).arrayBuffer());
  const font = await pdf.embedFont(bytes, { subset: true });
  const supported = new Set(font.getCharacterSet());
  const content = [
    data.business,
    data.customer,
    data.number,
    data.notes,
    data.payment,
    data.paymentMethod,
    ...data.items.map((item) => item.description),
  ].join("");
  if (
    [...content].some(
      (character) =>
        !["\n", "\r", "\t"].includes(character) &&
        !supported.has(character.codePointAt(0)!),
    )
  )
    throw new FileProblem(
      "Some characters cannot be displayed in this PDF font. Use Latin-script text without emoji and try again.",
    );
  const dark = rgb(31 / 255, 36 / 255, 48 / 255);
  const gray = rgb(86 / 255, 83 / 255, 77 / 255);
  const accent = rgb(108 / 255, 135 / 255, 146 / 255);
  const width = 595.28;
  const height = 841.89;
  const margin = 40;
  const usable = width - margin * 2;
  let page = pdf.addPage([width, height]);
  let y = height - margin;
  function newPage() {
    page = pdf.addPage([width, height]);
    y = height - margin;
  }
  function ensure(space: number) {
    if (y - space < margin + 48) newPage();
  }
  function write(text: string, x = margin, size = 11, color = dark) {
    page.drawText(text.replace(/\r?\n|\t/g, " "), { x, y, size, font, color });
  }
  function paragraph(text: string, size = 11, color = dark, maxWidth = usable) {
    for (const line of wrap(text, font, size, maxWidth)) {
      ensure(size * 1.6);
      write(line, margin, size, color);
      y -= size * 1.6;
    }
  }
  write(data.kind === "invoice" ? "INVOICE" : "SALES RECEIPT", margin, 24);
  y -= 32;
  paragraph(data.number, 11, gray, logo ? usable - 120 : usable);
  y -= 12;
  if (data.kind === "receipt") {
    paragraph("Merchant-entered transaction record", 11, gray);
    y -= 12;
  }
  if (logo) {
    try {
      const raw = await logo.arrayBuffer();
      const image =
        logo.type === "image/png"
          ? await pdf.embedPng(raw)
          : await pdf.embedJpg(raw);
      const scale = Math.min(96 / image.width, 64 / image.height);
      page.drawImage(image, {
        x: width - margin - image.width * scale,
        y: height - margin - image.height * scale,
        width: image.width * scale,
        height: image.height * scale,
      });
    } catch {
      throw new FileProblem(
        "The logo could not be added. Use a JPEG or PNG logo, or remove it and try again.",
      );
    }
  }
  paragraph(data.business, 16);
  y -= 16;
  paragraph(`Customer: ${data.customer}`);
  y -= 8;
  paragraph(`Issued: ${readableDate(data.issueDate)}`, 10, gray);
  if (data.kind === "invoice" && data.dueDate)
    paragraph(`Due: ${readableDate(data.dueDate)}`, 10, gray);
  if (data.kind === "receipt" && data.paymentMethod.trim())
    paragraph(`Payment method: ${data.paymentMethod}`, 10, gray);
  y -= 24;
  function tableHeader() {
    ensure(64);
    page.drawLine({
      start: { x: margin, y: y + 12 },
      end: { x: width - margin, y: y + 12 },
      thickness: 1,
      color: accent,
    });
    write("Item / service", margin, 10, gray);
    write("Qty × unit price", 285, 10, gray);
    write("Amount", 465, 10, gray);
    y -= 24;
  }
  tableHeader();
  for (const [index, item] of data.items.entries()) {
    const lines = wrap(item.description, font, 10, 230);
    const needed = Math.max(lines.length * 16, 32);
    if (y - needed < margin + 48) {
      newPage();
      tableHeader();
    }
    const top = y;
    for (const line of lines) {
      write(line, margin, 10);
      y -= 16;
    }
    const unit = naira(
      BigInt(item.unitPrice.trim().split(".")[0]) * BigInt(100) +
        BigInt((item.unitPrice.trim().split(".")[1] ?? "").padEnd(2, "0")),
    );
    const quantityPrice = `${item.quantity} × ${unit}`;
    const priceLines = wrap(quantityPrice, font, 9, 160);
    let py = top;
    for (const line of priceLines) {
      page.drawText(line, { x: 285, y: py, size: 9, font, color: gray });
      py -= 14;
    }
    const amount = naira(totals.lines[index]);
    const amountLines = wrap(amount, font, 9, 86);
    py = top;
    for (const line of amountLines) {
      page.drawText(line, { x: 465, y: py, size: 9, font, color: dark });
      py -= 14;
    }
    y =
      Math.min(
        y,
        top - Math.max(32, priceLines.length * 14, amountLines.length * 14),
      ) - 12;
  }
  y -= 12;
  ensure(112);
  for (const [label, amount] of [
    ["Subtotal", totals.subtotal],
    ["Discount", totals.discount],
    ["Tax (after discount)", totals.tax],
    ["Total (NGN)", totals.total],
  ] as const) {
    write(label, 285, 11);
    const text = naira(amount);
    write(text, width - margin - font.widthOfTextAtSize(text, 11), 11);
    y -= 24;
  }
  y -= 16;
  if (data.kind === "invoice" && data.payment.trim()) {
    paragraph("Payment details", 12);
    paragraph(data.payment, 10, gray);
    y -= 16;
  }
  if (data.notes.trim()) {
    paragraph("Notes", 12);
    paragraph(data.notes, 10, gray);
  }
  if (data.kind === "receipt") {
    y -= 24;
    paragraph(
      "Merchant-issued record. Details entered by the business. AVANTIC has not independently verified that payment was received.",
      10,
      gray,
    );
  }
  const pages = pdf.getPages();
  pages.forEach((p, index) => {
    p.drawText(`Created with AVANTIC Tools · A product of AVANTIC LABS.`, {
      x: margin,
      y: 28,
      size: 8,
      font,
      color: gray,
    });
    p.drawText(`${index + 1} / ${pages.length}`, {
      x: width - margin - 32,
      y: 28,
      size: 8,
      font,
      color: gray,
    });
  });
  pdf.setTitle(data.kind === "invoice" ? "Invoice" : "Merchant sales receipt");
  pdf.setProducer("AVANTIC Tools");
  return new Blob([new Uint8Array(await pdf.save())], {
    type: "application/pdf",
  });
}

function wrap(
  text: string,
  font: PDFFont,
  size: number,
  width: number,
): string[] {
  const lines: string[] = [];
  for (const paragraph of text.replace(/\r\n/g, "\n").split("\n")) {
    let line = "";
    for (const word of paragraph.replace(/\t/g, " ").split(/ +/)) {
      if (line && font.widthOfTextAtSize(`${line} ${word}`, size) <= width) {
        line += ` ${word}`;
        continue;
      }
      if (line) {
        lines.push(line);
        line = "";
      }
      // Long identifiers still wrap safely without splitting ordinary words.
      for (const character of word) {
        if (line && font.widthOfTextAtSize(line + character, size) > width) {
          lines.push(line);
          line = "";
        }
        line += character;
      }
    }
    lines.push(line);
  }
  return lines;
}
