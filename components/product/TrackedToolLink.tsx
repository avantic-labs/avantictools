"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import type { ToolId } from "@/data/tools";
import { trackEvent } from "@/lib/analytics/utilities";

export function TrackedToolLink({ tool, ...props }: { tool: ToolId } & ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        trackEvent({ name: "popular_action_selected", properties: { tool_id: tool } });
        props.onClick?.(event);
      }}
    />
  );
}
