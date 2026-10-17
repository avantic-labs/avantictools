"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  invoiceTotals,
  naira,
  type BusinessDocument,
  type InvoiceItem,
} from "@/lib/business/invoice";
import { localToday } from "@/lib/utilities/calculations";
import { canvasBlob, prepareImage } from "@/lib/files/images";
import { trackUtilityEvent } from "@/lib/analytics/utilities";
import {
  LocalImage,
  ResultPanel,
  TaskStatus,
  Upload,
  useLocalTask,
} from "./shared";
function initialDocument(): BusinessDocument {
  const today = localToday();
  return {
    kind: "invoice",
    business: "",
    customer: "",
    number: `INV-${today.replaceAll("-", "")}`,
    issueDate: today,
    dueDate: "",
    notes: "",
    payment: "",
    paymentMethod: "",
    discount: "0",
    tax: "0",
    items: [{ id: "first", description: "", quantity: "1", unitPrice: "" }],
  };
}
export function InvoiceMaker() {
  const [data, setData] = useState<BusinessDocument>(initialDocument);
  const [logo, setLogo] = useState<Blob | null>(null);
  const [discount, setDiscount] = useState(false);
  const [tax, setTax] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const task = useLocalTask();
  let totals: ReturnType<typeof invoiceTotals> | null = null;
  try {
    totals = invoiceTotals(data.items, data.discount, data.tax);
  } catch {
    /* Incomplete fields are validated on export, not every keystroke. */
  }
  function update<K extends keyof BusinessDocument>(
    key: K,
    value: BusinessDocument[K],
  ) {
    setData({ ...data, [key]: value });
    setResult(null);
    task.setError("");
  }
  function updateItem(id: string, key: keyof InvoiceItem, value: string) {
    update(
      "items",
      data.items.map((item) =>
        item.id === id ? { ...item, [key]: value } : item,
      ),
    );
  }
  async function chooseLogo(files: File[]) {
    const image = await task.run("Preparing logo", async () => {
      const canvas = await prepareImage(files[0], undefined, 512);
      try {
        return await canvasBlob(canvas, "image/png");
      } finally {
        canvas.width = canvas.height = 0;
      }
    });
    if (image) {
      setLogo(image);
      setResult(null);
    }
  }
  async function exportDocument() {
    setResult(null);
    const blob = await task.run("Creating document", async () => {
      const { invoicePdf } = await import("@/lib/business/invoice-pdf");
      return invoicePdf(data, logo ?? undefined);
    });
    if (blob) {
      setResult(blob);
      trackUtilityEvent("invoice-receipt-maker", "tool_completed", "generate");
    }
  }
  return (
    <div className="workspace-panel">
      <div className="tabs" aria-label="Document type">
        {(["invoice", "receipt"] as const).map((kind) => (
          <button
            type="button"
            className="button button-secondary"
            aria-pressed={data.kind === kind}
            disabled={task.busy}
            key={kind}
            onClick={() => update("kind", kind)}
          >
            {kind === "invoice" ? "Invoice" : "Sales receipt"}
          </button>
        ))}
      </div>
      {data.kind === "receipt" && (
        <p className="hint">
          A sales receipt is a merchant-entered record. AVANTIC does not verify
          that payment was received. This is not a bank or payment-processor
          confirmation.
        </p>
      )}
      <p className="hint">* Required. Amounts are in Nigerian naira (NGN).</p>
      <TaskStatus task={task} />
      <fieldset className="editing-controls" disabled={task.busy}>
        <legend>Business and customer</legend>
        <label className="field">
          Business name *
          <input
            type="text"
            maxLength={100}
            value={data.business}
            autoComplete="off"
            onChange={(event) => update("business", event.target.value)}
          />
        </label>
        <label className="field">
          Customer name *
          <input
            type="text"
            maxLength={100}
            value={data.customer}
            autoComplete="off"
            onChange={(event) => update("customer", event.target.value)}
          />
        </label>
        <Upload
          label="Business logo (optional)"
          accept="image/jpeg,image/png,image/webp"
          busy={task.busy}
          onFiles={chooseLogo}
        />
        {logo && (
          <div className="logo-preview">
            <LocalImage blob={logo} alt="Your business logo" />
            <button
              type="button"
              className="button button-ghost"
              onClick={() => {
                setLogo(null);
                setResult(null);
              }}
            >
              Remove logo
            </button>
          </div>
        )}
        <label className="field">
          {data.kind === "invoice" ? "Invoice number *" : "Receipt number *"}
          <input
            aria-label={
              data.kind === "invoice" ? "Invoice number *" : "Receipt number *"
            }
            type="text"
            maxLength={60}
            value={data.number}
            autoComplete="off"
            onChange={(event) => update("number", event.target.value)}
          />
          <span className="hint">Use your business’s own numbering.</span>
        </label>
        <div className="paired-fields invoice-dates">
          <label className="field">
            Issue date *
            <input
              type="date"
              min="0100-01-01"
              max="9999-12-31"
              value={data.issueDate}
              onChange={(event) => update("issueDate", event.target.value)}
            />
          </label>
          {data.kind === "invoice" && (
            <label className="field">
              Due date
              <input
                type="date"
                min={data.issueDate || "0100-01-01"}
                max="9999-12-31"
                value={data.dueDate}
                onChange={(event) => update("dueDate", event.target.value)}
              />
            </label>
          )}
        </div>
      </fieldset>
      <fieldset className="editing-controls" disabled={task.busy}>
        <legend>Items and services</legend>
        {data.items.map((item, index) => (
          <div className="invoice-item" key={item.id}>
            <label className="field">
              Item {index + 1} *
              <textarea
                rows={2}
                maxLength={500}
                value={item.description}
                autoComplete="off"
                spellCheck={false}
                onChange={(event) =>
                  updateItem(item.id, "description", event.target.value)
                }
              />
            </label>
            <label className="field">
              Quantity *
              <input
                type="text"
                inputMode="decimal"
                value={item.quantity}
                onChange={(event) =>
                  updateItem(item.id, "quantity", event.target.value)
                }
              />
            </label>
            <label className="field">
              Unit price (₦) *
              <input
                type="text"
                inputMode="decimal"
                value={item.unitPrice}
                onChange={(event) =>
                  updateItem(item.id, "unitPrice", event.target.value)
                }
              />
            </label>
            <button
              type="button"
              className="button button-secondary"
              aria-label={`Remove item ${index + 1}`}
              disabled={data.items.length === 1}
              onClick={() =>
                update(
                  "items",
                  data.items.filter((row) => row.id !== item.id),
                )
              }
            >
              <Trash2 size={20} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="button button-secondary"
          disabled={data.items.length >= 50}
          onClick={() =>
            update("items", [
              ...data.items,
              {
                id: crypto.randomUUID(),
                description: "",
                quantity: "1",
                unitPrice: "",
              },
            ])
          }
        >
          Add item
        </button>
      </fieldset>
      <fieldset className="editing-controls" disabled={task.busy}>
        <legend>Adjustments</legend>
        <label className="check-label">
          <input
            type="checkbox"
            checked={discount}
            onChange={(event) => {
              setDiscount(event.target.checked);
              if (!event.target.checked) update("discount", "0");
              setResult(null);
            }}
          />
          Add a discount
        </label>
        {discount && (
          <label className="field">
            Discount (%)
            <input
              type="text"
              inputMode="decimal"
              value={data.discount}
              onChange={(event) => update("discount", event.target.value)}
            />
          </label>
        )}
        <label className="check-label">
          <input
            type="checkbox"
            checked={tax}
            onChange={(event) => {
              setTax(event.target.checked);
              if (!event.target.checked) update("tax", "0");
              setResult(null);
            }}
          />
          Add tax
        </label>
        {tax && (
          <label className="field">
            Tax (%)
            <input
              aria-label="Tax (%)"
              type="text"
              inputMode="decimal"
              value={data.tax}
              onChange={(event) => update("tax", event.target.value)}
            />
            <span className="hint">
              Use the rate applicable to your transaction. Tax is calculated
              after discount.
            </span>
          </label>
        )}
      </fieldset>
      <dl className="invoice-summary" aria-label="Document totals">
        {(
          [
            ["Subtotal", totals?.subtotal],
            ["Discount", totals?.discount],
            ["Tax", totals?.tax],
            ["Total (NGN)", totals?.total],
          ] as const
        ).map(([label, value]) => (
          <div
            key={label}
            className={label === "Total (NGN)" ? "total" : undefined}
          >
            <dt>{label}</dt>
            <dd>{value === undefined ? "—" : naira(value)}</dd>
          </div>
        ))}
      </dl>
      <fieldset className="editing-controls" disabled={task.busy}>
        <legend>Additional details</legend>
        {data.kind === "invoice" ? (
          <label className="field">
            Payment / bank-transfer details
            <textarea
              rows={3}
              maxLength={1000}
              value={data.payment}
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => update("payment", event.target.value)}
            />
          </label>
        ) : (
          <label className="field">
            Payment method
            <input
              type="text"
              maxLength={100}
              value={data.paymentMethod}
              autoComplete="off"
              onChange={(event) => update("paymentMethod", event.target.value)}
            />
          </label>
        )}
        <label className="field">
          Notes (optional)
          <textarea
            rows={3}
            maxLength={2000}
            value={data.notes}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => update("notes", event.target.value)}
          />
        </label>
      </fieldset>
      <div className="actions">
        <button
          type="button"
          className="button"
          disabled={task.busy}
          onClick={exportDocument}
        >
          Create {data.kind === "invoice" ? "invoice" : "sales receipt"}
        </button>
        <button
          type="button"
          className="button button-secondary"
          disabled={task.busy}
          onClick={() => {
            setData(initialDocument());
            setLogo(null);
            setDiscount(false);
            setTax(false);
            setResult(null);
            task.setError("");
          }}
        >
          Clear document
        </button>
      </div>
      {result && (
        <ResultPanel
          blob={result}
          filename={`avantic-${data.kind}.pdf`}
          tool="invoice-receipt-maker"
        >
          <p className="hint">
            Review the details before sending.{" "}
            {data.kind === "receipt"
              ? "This is your merchant record, not independently verified proof of payment."
              : "No account or customer details have been uploaded."}
          </p>
        </ResultPanel>
      )}
    </div>
  );
}
