"use client";
import dynamic from "next/dynamic";
import type { ToolId } from "@/data/tools";
import { TextCounter } from "@/components/utilities/TextCounter";
import { CaseConverter } from "@/components/utilities/CaseConverter";

import { PasswordGenerator } from "@/components/utilities/PasswordGenerator";
function Loading() {
  return (
    <div className="workspace-panel" role="status">
      Opening workspace…
    </div>
  );
}
// Heavy document/image modules are separate route-level chunks. The catalog,
// text tools and calculators do not import PDF libraries or their worker.
const QrCodeGenerator = dynamic(
  () =>
    import("@/components/utilities/QrCodeGenerator").then(
      (m) => m.QrCodeGenerator,
    ),
  { loading: Loading },
);
const Scan = dynamic(() => import("./ScanToPdf").then((m) => m.ScanToPdf), {
  ssr: false,
  loading: Loading,
});
const Organizer = dynamic(
  () => import("./PdfOrganizer").then((m) => m.PdfOrganizer),
  { ssr: false, loading: Loading },
);
const Compressor = dynamic(
  () => import("./FileCompressor").then((m) => m.FileCompressor),
  { ssr: false, loading: Loading },
);
const Application = dynamic(
  () => import("./ApplicationPhoto").then((m) => m.ApplicationPhoto),
  { ssr: false, loading: Loading },
);
const Invoice = dynamic(
  () => import("./InvoiceMaker").then((m) => m.InvoiceMaker),
  { ssr: false, loading: Loading },
);
const Percentage = dynamic(
  () => import("./PercentageCalculator").then((m) => m.PercentageCalculator),
  { ssr: false, loading: Loading },
);
const AgeDate = dynamic(
  () => import("./AgeDateCalculator").then((m) => m.AgeDateCalculator),
  { ssr: false, loading: Loading },
);
export function ToolWorkspace({ tool }: { tool: ToolId }) {
  return (
    <div className="workspace-stage">
      <WorkspaceContent tool={tool} />
    </div>
  );
}
function WorkspaceContent({ tool }: { tool: ToolId }) {
  switch (tool) {
    case "scan-to-pdf":
      return <Scan />;
    case "pdf-organizer":
      return <Organizer />;
    case "file-compressor":
      return <Compressor />;
    case "application-photo-signature-prep":
      return <Application />;
    case "invoice-receipt-maker":
      return <Invoice />;
    case "percentage-discount-calculator":
      return <Percentage />;
    case "age-date-calculator":
      return <AgeDate />;
    case "word-counter":
      return <TextCounter mode="word" />;
    case "character-counter":
      return <TextCounter mode="character" />;
    case "case-converter":
      return <CaseConverter />;
    case "qr-code-generator":
      return <QrCodeGenerator />;
    case "password-generator":
      return <PasswordGenerator />;
  }
}
