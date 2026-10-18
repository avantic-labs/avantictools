"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { ToolId } from "@/data/tools";
import { handoffFile } from "@/lib/files/handoff";
import { trackEvent } from "@/lib/analytics/utilities";
export function ContinueWith({
  blob,
  from,
  target,
  children,
}: {
  blob: Blob;
  from: ToolId;
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
        trackEvent({ name: "workflow_handoff", properties: { from_tool: from, to_tool: target } });
        startTransition(() => router.push(`/tools/${target}`));
      }}
    >
      {pending ? "Opening workspace…" : children}
    </button>
  );
}
