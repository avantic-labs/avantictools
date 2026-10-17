"use client";
import { useRouter } from "next/navigation";
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
  return (
    <button
      type="button"
      className="button button-secondary"
      onClick={() => {
        handoffFile(target, blob);
        router.push(`/tools/${target}`);
      }}
    >
      {children}
    </button>
  );
}
