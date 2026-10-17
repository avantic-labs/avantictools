"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { ToolId } from "@/data/tools";
import { handoffFile } from "@/lib/files/handoff";
export function ContinueWith({
  blob,
  target,
  children,
}: {
  blob: Blob;
  target: ToolId;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      className="button button-secondary"
      disabled={pending}
      aria-busy={pending}
      onClick={() => {
        handoffFile(target, blob);
        startTransition(() => router.push(`/tools/${target}`));
      }}
    >
      {pending ? "Opening workspace…" : children}
    </button>
  );
}
