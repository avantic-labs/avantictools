import { getTool, type ToolId } from "@/data/tools";
import {
  ANALYTICS_EVENT,
  sanitizeAnalyticsEvent,
  type AnalyticsErrorCode,
  type AnalyticsEvent,
  type CompletionAction,
  type OutputType,
} from "./events";

export { ANALYTICS_EVENT as UTILITY_ANALYTICS_EVENT };
export type UtilityAction = CompletionAction;
type Subscriber = (event: AnalyticsEvent) => void;
const subscribers = new Set<Subscriber>();
const pending: AnalyticsEvent[] = [];
const startedTools = new Set<ToolId>();

export function createUtilityEvent(
  tool: ToolId,
  name: "tool_viewed" | "tool_started" | "tool_completed" | "tool_error",
  detail?: CompletionAction | AnalyticsErrorCode,
): AnalyticsEvent | null {
  const catalogTool = getTool(tool);
  if (!catalogTool) return null;
  if (name === "tool_viewed") return sanitizeAnalyticsEvent({ name, properties: { tool_id: tool, category: catalogTool.category } });
  if (name === "tool_started") return sanitizeAnalyticsEvent({ name, properties: { tool_id: tool } });
  if (name === "tool_completed") return sanitizeAnalyticsEvent({ name, properties: { tool_id: tool, completion_action: detail } });
  return sanitizeAnalyticsEvent({ name, properties: { tool_id: tool, error_code: detail } });
}

export function trackEvent(value: AnalyticsEvent) {
  const event = sanitizeAnalyticsEvent(value);
  if (!event || typeof window === "undefined") return;
  if (subscribers.size) for (const subscriber of subscribers) subscriber(event);
  else {
    pending.push(event);
    if (pending.length > 50) pending.shift();
  }
  window.dispatchEvent(new CustomEvent<AnalyticsEvent>(ANALYTICS_EVENT, { detail: event }));
}

export function subscribeAnalytics(subscriber: Subscriber) {
  subscribers.add(subscriber);
  for (const event of pending.splice(0)) subscriber(event);
  return () => {
    subscribers.delete(subscriber);
  };
}

export function trackUtilityEvent(tool: ToolId, name: "tool_viewed" | "tool_started" | "tool_completed" | "tool_error", detail?: CompletionAction | AnalyticsErrorCode) {
  if (name === "tool_viewed") startedTools.delete(tool);
  if (name === "tool_started") {
    if (startedTools.has(tool)) return;
    startedTools.add(tool);
  }
  const event = createUtilityEvent(tool, name, detail);
  if (event) trackEvent(event);
}

export function trackOutputEvent(tool: ToolId, name: "download_completed" | "share_started", outputType: OutputType) {
  trackEvent({ name, properties: { tool_id: tool, output_type: outputType } });
}

export function resultCountBucket(count: number) {
  return count === 0 ? "none" : count === 1 ? "one" : count <= 4 ? "two_to_four" : "five_plus";
}
