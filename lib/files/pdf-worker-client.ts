import { FileProblem } from "./shared";
import type { PdfWorkerRequest } from "./pdf-worker";
export function pdfWorker<T>(
  request: PdfWorkerRequest,
  progress: (done: number, total: number) => void = () => {},
): Promise<T> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./pdf-worker.ts", import.meta.url), {
      type: "module",
    });
    // Bounded processing time also handles a worker killed by a device memory limit.
    const timeout = setTimeout(
      () =>
        finish(
          new FileProblem(
            "This PDF is too complex for this device. Try fewer pages or a smaller file.",
          ),
        ),
      45_000,
    );
    function finish(error?: Error, result?: T) {
      clearTimeout(timeout);
      worker.terminate();
      if (error) reject(error);
      else resolve(result as T);
    }
    worker.onerror = () =>
      finish(
        new FileProblem(
          "PDF processing stopped. Try a smaller document or close other tabs.",
        ),
      );
    worker.onmessage = (
      event: MessageEvent<{
        result?: T;
        error?: string;
        progress?: { done: number; total: number };
      }>,
    ) => {
      if (event.data.progress) {
        try {
          progress(event.data.progress.done, event.data.progress.total);
        } catch {
          finish(new FileProblem("Processing stopped."));
        }
      } else if (event.data.error) finish(new FileProblem(event.data.error));
      else finish(undefined, event.data.result);
    };
    worker.postMessage(request);
  });
}
