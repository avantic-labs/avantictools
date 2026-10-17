import type { AnalyticsEvent } from "./events";
import { isUtilityId, type UtilityId } from "../utilities/catalog";

export const UTILITY_ANALYTICS_EVENT = "avantic:analytics";
export type UtilityAction = "count" | "convert" | "generate" | "copy" | "download";
type UtilityEventName = "tool_viewed" | "tool_completed";
const actions: readonly UtilityAction[] = ["count", "convert", "generate", "copy", "download"];

/**
 * A deliberately narrow, browser-local bridge to the foundation analytics contract.
 * A future PostHog adapter can consume these events with autocapture/replay disabled.
 * Never accept arbitrary properties, URLs, input, counts, options or error objects.
 */
export function createUtilityEvent(
  tool: UtilityId,
  name: UtilityEventName,
  action?: UtilityAction,
): AnalyticsEvent | null {
  // Validate at runtime too: TypeScript is not a privacy boundary.
  if (!isUtilityId(tool) || (name !== "tool_viewed" && name !== "tool_completed")) return null;
  if (name === "tool_completed" && (!action || !actions.includes(action))) return null;

  return {
    name,
    properties: name === "tool_viewed" ? { tool_id: tool } : { tool_id: tool, action },
  };
}

export function trackUtilityEvent(tool: UtilityId, name: UtilityEventName, action?: UtilityAction) {
  const event = createUtilityEvent(tool, name, action);
  if (!event || typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AnalyticsEvent>(UTILITY_ANALYTICS_EVENT, { detail: event }));
}
