import { describe, expect, it } from "vitest";
import {
  invoiceTotals,
  naira,
  validateBusinessDocument,
  type BusinessDocument,
} from "../../lib/business/invoice";
const item = (quantity: string, unitPrice: string) => ({
  id: "1",
  description: "A service",
  quantity,
  unitPrice,
});
describe("invoice arithmetic in integer kobo", () => {
  it("calculates lines, discount, configurable tax and NGN formatting", () => {
    const total = invoiceTotals(
      [item("2", "1500.50"), item("1.5", "200")],
      "10",
      "7.5",
    );
    expect(total.subtotal).toBe(BigInt(330100));
    expect(total.discount).toBe(BigInt(33010));
    expect(total.tax).toBe(BigInt(22282));
    expect(total.total).toBe(BigInt(319372));
    expect(naira(total.total)).toBe("₦3,193.72");
  });
  it("handles zero, decimal quantities and half-kobo rounding", () => {
    expect(invoiceTotals([item("1", "0")], "0", "0").total).toBe(BigInt(0));
    expect(invoiceTotals([item("0.5", "0.01")], "0", "0").total).toBe(
      BigInt(1),
    );
    expect(invoiceTotals([item("3", "0.10")], "0", "0").total).toBe(BigInt(30));
  });
  it("rejects negatives, invalid precision, zero quantities and invalid percentages", () => {
    for (const row of [
      item("0", "5"),
      item("-1", "2"),
      item("1", "-2"),
      item("1", "0.001"),
    ])
      expect(() => invoiceTotals([row], "0", "0")).toThrow();
    expect(() => invoiceTotals([item("1", "2")], "101", "0")).toThrow();
  });
  it("validates required fields, line descriptions and calendar dates", () => {
    const doc: BusinessDocument = {
      kind: "invoice",
      business: "A",
      customer: "B",
      number: "1",
      issueDate: "2026-10-17",
      dueDate: "2026-10-18",
      notes: "",
      payment: "",
      paymentMethod: "",
      discount: "0",
      tax: "0",
      items: [item("1", "10")],
    };
    expect(() => validateBusinessDocument(doc)).not.toThrow();
    expect(() =>
      validateBusinessDocument({ ...doc, dueDate: "2026-10-16" }),
    ).toThrow();
    expect(() => validateBusinessDocument({ ...doc, business: "" })).toThrow();
    expect(() =>
      validateBusinessDocument({
        ...doc,
        items: [{ ...item("1", "10"), description: "" }],
      }),
    ).toThrow();
  });
});

it("exports paginated Unicode invoices with a real naira-capable font", async () => {
  const { readFile } = await import("node:fs/promises");
  const { invoicePdf } = await import("../../lib/business/invoice-pdf");
  const { PDFDocument } = await import("pdf-lib");
  const font = await readFile("assets/fonts/Inter-Regular.ttf");
  const bytes = new Uint8Array(font).buffer;
  const data = {
    kind: "invoice" as const,
    business: "Ọmọ shop",
    customer: "Synthetic buyer",
    number: "W".repeat(60),
    issueDate: "2026-10-17",
    dueDate: "",
    notes: "A useful note. ".repeat(100),
    payment: "Synthetic transfer instructions",
    paymentMethod: "",
    discount: "10",
    tax: "7.5",
    items: Array.from({ length: 20 }, (_, id) => ({
      id: String(id),
      description: "Long service description ".repeat(15),
      quantity: "1.5",
      unitPrice: "100.50",
    })),
  };
  const blob = await invoicePdf(data, undefined, bytes);
  const pdf = await PDFDocument.load(await blob.arrayBuffer());
  expect(pdf.getPageCount()).toBeGreaterThan(2);
  expect(pdf.getTitle()).toBe("Invoice");
  await expect(
    invoicePdf({ ...data, business: "😀" }, undefined, bytes),
  ).rejects.toThrow("characters");
});
