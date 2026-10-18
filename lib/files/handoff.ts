import type { ToolId } from "@/data/tools";
let pending: { target: ToolId; blob: Blob } | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
export function handoffFile(target: ToolId, blob: Blob) {
  if (timer) clearTimeout(timer);
  pending = { target, blob };
  timer = setTimeout(() => {
    pending = null;
    timer = null;
  }, 60_000);
}
export function takeHandoff(target: ToolId): File | null {
  if (!pending || pending.target !== target) return null;
  const { blob } = pending;
  pending = null;
  if (timer) clearTimeout(timer);
  timer = null;
  return new File([blob], "avantic-document.pdf", { type: blob.type });
}
