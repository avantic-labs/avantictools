import {
  naira,
  type BusinessDocument,
  type invoiceTotals,
} from "@/lib/business/invoice";
import { LocalImage } from "./shared";

export function InvoicePreview({
  data,
  logo,
  totals,
}: {
  data: BusinessDocument;
  logo: Blob | null;
  totals: ReturnType<typeof invoiceTotals> | null;
}) {
  const title = data.kind === "invoice" ? "Invoice" : "Sales receipt";
  return (
    <aside
      className="invoice-preview"
      aria-label="Live document preview"
      tabIndex={0}
    >
      <p className="hint">
        Document preview · Your PDF may span more than one page.
      </p>
      <div className="document-paper">
        {logo && (
          <div className="logo-preview">
            <LocalImage blob={logo} alt="Business logo in document preview" />
          </div>
        )}
        <h2>{data.business || "Your business"}</h2>
        <div className="document-meta">
          <h3>{title}</h3>
          <p>{data.number}</p>
        </div>
        <dl className="preview-details">
          <div>
            <dt>Customer</dt>
            <dd>{data.customer || "Customer name"}</dd>
          </div>
          <div>
            <dt>Issued</dt>
            <dd>{data.issueDate || "Choose a date"}</dd>
          </div>
          {data.kind === "invoice" && data.dueDate && (
            <div>
              <dt>Due</dt>
              <dd>{data.dueDate}</dd>
            </div>
          )}
        </dl>
        <table>
          <caption className="sr-only">
            Items in your {title.toLowerCase()}
          </caption>
          <thead>
            <tr>
              <th scope="col">Description</th>
              <th scope="col">Qty</th>
              <th scope="col">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={item.id}>
                <td>{item.description || "Item or service"}</td>
                <td>{item.quantity || "—"}</td>
                <td>{totals ? naira(totals.lines[index]) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <dl className="preview-totals">
          <div>
            <dt>Subtotal</dt>
            <dd>{totals ? naira(totals.subtotal) : "—"}</dd>
          </div>
          <div>
            <dt>Discount ({data.discount || "0"}%)</dt>
            <dd>{totals ? naira(totals.discount) : "—"}</dd>
          </div>
          <div>
            <dt>Tax ({data.tax || "0"}%)</dt>
            <dd>{totals ? naira(totals.tax) : "—"}</dd>
          </div>
          <div className="preview-total">
            <dt>Total</dt>
            <dd>{totals ? naira(totals.total) : "—"}</dd>
          </div>
        </dl>
        {(data.kind === "invoice" ? data.payment : data.paymentMethod) && (
          <section>
            <h3>Payment details</h3>
            <p>{data.kind === "invoice" ? data.payment : data.paymentMethod}</p>
          </section>
        )}
        {data.notes && (
          <section>
            <h3>Notes</h3>
            <p>{data.notes}</p>
          </section>
        )}
        {data.kind === "receipt" && (
          <p className="hint">
            Merchant-entered record. AVANTIC does not independently verify
            payment.
          </p>
        )}
      </div>
    </aside>
  );
}
