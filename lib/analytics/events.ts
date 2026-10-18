import { categories, getTool, type CategoryId, type ToolId } from "@/data/tools";

export const ANALYTICS_EVENT = "avantic:analytics";
export const completionActions = ["count", "convert", "generate", "copy", "process", "calculate"] as const;
export type CompletionAction = (typeof completionActions)[number];
export const outputTypes = ["pdf", "png", "jpeg", "webp", "text"] as const;
export type OutputType = (typeof outputTypes)[number];
export const errorCodes = [
  "unsupported_format", "file_too_large", "too_many_pages", "corrupted_file",
  "encrypted_pdf", "memory_limit", "camera_unavailable", "share_unavailable",
  "export_failed", "invalid_input", "browser_unsupported",
] as const;
export type AnalyticsErrorCode = (typeof errorCodes)[number];
export const pageIds = ["home", "tool", "category", "about", "privacy", "terms", "not_found"] as const;
export type PageId = (typeof pageIds)[number];
export const trafficSources = ["instagram", "x", "youtube", "facebook", "telegram", "whatsapp", "github", "avantic"] as const;
export type TrafficSource = (typeof trafficSources)[number];
export const trafficMedia = ["social", "community", "organic", "referral"] as const;
export type TrafficMedium = (typeof trafficMedia)[number];
export const campaigns = ["tools_launch"] as const;
export type Campaign = (typeof campaigns)[number];
export type Attribution = { traffic_source?: TrafficSource; traffic_medium?: TrafficMedium; campaign?: Campaign };

export type AnalyticsEvent =
  | { name: "page_view"; properties: { page_id: PageId; tool_id?: ToolId; category?: CategoryId; device_class: "mobile" | "tablet" | "desktop"; viewport_category: "small" | "medium" | "large" | "wide" } & Attribution }
  | { name: "tool_viewed"; properties: { tool_id: ToolId; category: CategoryId } }
  | { name: "tool_started"; properties: { tool_id: ToolId } }
  | { name: "tool_completed"; properties: { tool_id: ToolId; completion_action: CompletionAction } }
  | { name: "tool_error"; properties: { tool_id: ToolId; error_code: AnalyticsErrorCode } }
  | { name: "search_opened"; properties: Record<string, never> }
  | { name: "search_used"; properties: { result_count_bucket: "none" | "one" | "two_to_four" | "five_plus" } }
  | { name: "search_result_selected"; properties: { tool_id: ToolId; result_position: number } }
  | { name: "popular_action_selected"; properties: { tool_id: ToolId } }
  | { name: "category_selected"; properties: { category: CategoryId } }
  | { name: "workflow_handoff"; properties: { from_tool: ToolId; to_tool: ToolId } }
  | { name: "download_completed"; properties: { tool_id: ToolId; output_type: OutputType } }
  | { name: "share_started"; properties: { tool_id: ToolId; output_type: OutputType } }
  | { name: "web_vital"; properties: { metric: "LCP" | "INP" | "CLS"; rating: "good" | "needs_improvement" | "poor"; page_id: PageId; tool_id?: ToolId } };

export interface AnalyticsClient { capture(event: AnalyticsEvent): void | Promise<void> }

const categoryIds = new Set<string>(categories.map(({ id }) => id));
export function isToolId(value: unknown): value is ToolId { return typeof value === "string" && Boolean(getTool(value)); }
export function isCategoryId(value: unknown): value is CategoryId { return typeof value === "string" && categoryIds.has(value); }
function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]) {
  const expected = [...keys].sort();
  const actual = Object.keys(value).sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

/** Runtime privacy boundary: reject unknown events, values, and extra properties. */
export function sanitizeAnalyticsEvent(value: unknown): AnalyticsEvent | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as { name?: unknown; properties?: unknown };
  if (typeof candidate.name !== "string" || !candidate.properties || typeof candidate.properties !== "object") return null;
  const properties = candidate.properties as Record<string, unknown>;
  const tool = properties.tool_id;
  switch (candidate.name) {
    case "tool_viewed":
      return hasOnlyKeys(properties, ["category", "tool_id"]) && isToolId(tool) && isCategoryId(properties.category) && getTool(tool)?.category === properties.category ? candidate as AnalyticsEvent : null;
    case "tool_started":
      return hasOnlyKeys(properties, ["tool_id"]) && isToolId(tool) ? candidate as AnalyticsEvent : null;
    case "tool_completed":
      return hasOnlyKeys(properties, ["completion_action", "tool_id"]) && isToolId(tool) && completionActions.includes(properties.completion_action as CompletionAction) ? candidate as AnalyticsEvent : null;
    case "tool_error":
      return hasOnlyKeys(properties, ["error_code", "tool_id"]) && isToolId(tool) && errorCodes.includes(properties.error_code as AnalyticsErrorCode) ? candidate as AnalyticsEvent : null;
    case "search_opened":
      return Object.keys(properties).length === 0 ? candidate as AnalyticsEvent : null;
    case "search_used":
      return hasOnlyKeys(properties, ["result_count_bucket"]) && ["none", "one", "two_to_four", "five_plus"].includes(String(properties.result_count_bucket)) ? candidate as AnalyticsEvent : null;
    case "search_result_selected":
      return hasOnlyKeys(properties, ["result_position", "tool_id"]) && isToolId(tool) && Number.isInteger(properties.result_position) && Number(properties.result_position) >= 1 && Number(properties.result_position) <= 12 ? candidate as AnalyticsEvent : null;
    case "popular_action_selected":
      return hasOnlyKeys(properties, ["tool_id"]) && isToolId(tool) ? candidate as AnalyticsEvent : null;
    case "category_selected":
      return hasOnlyKeys(properties, ["category"]) && isCategoryId(properties.category) ? candidate as AnalyticsEvent : null;
    case "workflow_handoff":
      return hasOnlyKeys(properties, ["from_tool", "to_tool"]) && isToolId(properties.from_tool) && isToolId(properties.to_tool) ? candidate as AnalyticsEvent : null;
    case "download_completed":
    case "share_started":
      return hasOnlyKeys(properties, ["output_type", "tool_id"]) && isToolId(tool) && outputTypes.includes(properties.output_type as OutputType) ? candidate as AnalyticsEvent : null;
    case "page_view": {
      const allowed = new Set(["page_id", "tool_id", "category", "device_class", "viewport_category", "traffic_source", "traffic_medium", "campaign"]);
      if (Object.keys(properties).some((key) => !allowed.has(key))) return null;
      if (!pageIds.includes(properties.page_id as PageId)) return null;
      if (!["mobile", "tablet", "desktop"].includes(String(properties.device_class))) return null;
      if (!["small", "medium", "large", "wide"].includes(String(properties.viewport_category))) return null;
      if (properties.tool_id !== undefined && !isToolId(properties.tool_id)) return null;
      if (properties.category !== undefined && !isCategoryId(properties.category)) return null;
      if (properties.traffic_source !== undefined && !trafficSources.includes(properties.traffic_source as TrafficSource)) return null;
      if (properties.traffic_medium !== undefined && !trafficMedia.includes(properties.traffic_medium as TrafficMedium)) return null;
      if (properties.campaign !== undefined && !campaigns.includes(properties.campaign as Campaign)) return null;
      return candidate as AnalyticsEvent;
    }
    case "web_vital":
      return (hasOnlyKeys(properties, ["metric", "page_id", "rating"]) || hasOnlyKeys(properties, ["metric", "page_id", "rating", "tool_id"])) && ["LCP", "INP", "CLS"].includes(String(properties.metric)) && ["good", "needs_improvement", "poor"].includes(String(properties.rating)) && pageIds.includes(properties.page_id as PageId) && (properties.tool_id === undefined || isToolId(properties.tool_id)) ? candidate as AnalyticsEvent : null;
    default:
      return null;
  }
}
