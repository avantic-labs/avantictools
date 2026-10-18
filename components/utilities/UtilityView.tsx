"use client";

import { useEffect, useRef } from "react";
import { trackUtilityEvent } from "@/lib/analytics/utilities";
import type { UtilityId } from "@/lib/utilities/catalog";

export function UtilityView({ tool }: { tool: UtilityId }) {
  const lastViewed = useRef<UtilityId | null>(null);
  useEffect(() => {
    if (lastViewed.current !== tool) {
      trackUtilityEvent(tool, "tool_viewed");
      lastViewed.current = tool;
    }
  }, [tool]);
  return null;
}
