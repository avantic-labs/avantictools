/// <reference lib="webworker" />
// Third-party parsers can log malformed document tokens. Disable their console
// only in this disposable processing worker, never on the application window.
for (const method of ["log", "info", "warn", "error", "debug"] as const)
  console[method] = () => {};
import {
  openPdf,
  organizePdfCore,
  type PdfSource,
  type PdfSelection,
} from "./pdf-core";
import { fileMessage } from "./shared";
export type PdfWorkerRequest =
  | { operation: "inspect"; bytes: Uint8Array }
  | { operation: "organize"; sources: PdfSource[]; pages: PdfSelection[] };
self.onmessage = async (event: MessageEvent<PdfWorkerRequest>) => {
  try {
    const request = event.data;
    if (request.operation === "inspect")
      self.postMessage({
        result: (await openPdf(request.bytes)).getPageCount(),
      });
    else {
      const bytes = await organizePdfCore(
        request.sources,
        request.pages,
        (done, total) => self.postMessage({ progress: { done, total } }),
      );
      const buffer = new Uint8Array(bytes).buffer;
      self.postMessage({ result: buffer }, { transfer: [buffer] });
    }
  } catch (error) {
    self.postMessage({ error: fileMessage(error) });
  }
};
