import { FileProblem } from "../files/shared";
import { daysBetween, parseDate } from "../utilities/calculations";
export type InvoiceItem = {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
};
export type BusinessDocument = {
  kind: "invoice" | "receipt";
  business: string;
  customer: string;
  number: string;
  issueDate: string;
  dueDate: string;
  notes: string;
  payment: string;
  paymentMethod: string;
  discount: string;
  tax: string;
  items: InvoiceItem[];
};
const zero = BigInt(0);
const hundred = BigInt(100);
const thousand = BigInt(1000);
const percentScale = BigInt(10000);
function decimal(value: string, places: number, label: string): bigint {
  if (!new RegExp(`^\\d{1,12}(?:\\.\\d{1,${places}})?$`).test(value.trim()))
    throw new FileProblem(
      `${label}: use a non-negative number with up to ${places} decimal places.`,
    );
  const [whole, fraction = ""] = value.trim().split(".");
  return BigInt(whole + fraction.padEnd(places, "0"));
}
export function invoiceTotals(
  items: readonly InvoiceItem[],
  discount: string,
  tax: string,
) {
  if (!items.length || items.length > 50)
    throw new FileProblem("Add between 1 and 50 line items.");
  const lines = items.map((item) => {
    const quantity = decimal(item.quantity, 3, "Quantity");
    if (quantity <= zero)
      throw new FileProblem("Each quantity must be greater than zero.");
    const price = decimal(item.unitPrice, 2, "Unit price");
    return (quantity * price + BigInt(500)) / thousand;
  });
  const subtotal = lines.reduce((sum, line) => sum + line, zero);
  const discountRate = decimal(discount || "0", 2, "Discount");
  const taxRate = decimal(tax || "0", 2, "Tax");
  if (discountRate > percentScale || taxRate > percentScale)
    throw new FileProblem("Discount and tax must be between 0 and 100%.");
  const discountAmount =
    (subtotal * discountRate + BigInt(5000)) / percentScale;
  const taxable = subtotal - discountAmount;
  const taxAmount = (taxable * taxRate + BigInt(5000)) / percentScale;
  const total = taxable + taxAmount;
  if (total > BigInt("1000000000000000"))
    throw new FileProblem(
      "This total is too large. Split the document into smaller invoices.",
    );
  return { lines, subtotal, discount: discountAmount, tax: taxAmount, total };
}
export function naira(kobo: bigint): string {
  const whole = kobo / hundred;
  const fraction = String(kobo % hundred).padStart(2, "0");
  return `₦${new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(whole)}.${fraction}`;
}
export function validateBusinessDocument(document: BusinessDocument) {
  if (
    !document.business.trim() ||
    !document.customer.trim() ||
    !document.number.trim()
  )
    throw new FileProblem(
      "Add your business name, customer name and document number.",
    );
  if (
    document.business.length > 100 ||
    document.customer.length > 100 ||
    document.number.length > 60 ||
    document.notes.length > 2000 ||
    document.payment.length > 1000 ||
    document.paymentMethod.length > 100
  )
    throw new FileProblem(
      "Shorten the business details or notes to fit the document.",
    );
  for (const item of document.items)
    if (!item.description.trim() || item.description.length > 500)
      throw new FileProblem(
        "Give each line item a description of 500 characters or fewer.",
      );
  try {
    parseDate(document.issueDate);
    if (
      document.kind === "invoice" &&
      document.dueDate &&
      daysBetween(document.issueDate, document.dueDate) < 0
    )
      throw new Error();
  } catch {
    throw new FileProblem(
      "Choose valid dates. The due date cannot be before the issue date.",
    );
  }
  return invoiceTotals(document.items, document.discount, document.tax);
}
