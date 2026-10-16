export type AnalyticsEventName =
  | "tool_viewed"
  | "tool_completed"
  | "workflow_step_completed"
  | "workflow_completed"
  | "audit_submitted"
  | "audit_abandoned"
  | "cta_clicked"
  | "artifact_shared"
  | "search_query"
  | "cross_tool_navigation"
  | "ai_cost";

export type AnalyticsProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

export type AnalyticsEvent = {
  name: AnalyticsEventName;
  properties?: AnalyticsProperties;
};

/**
 * Provider-specific analytics wiring belongs behind this interface.
 * Day-1 system of record: PostHog.
 */
export interface AnalyticsClient {
  capture(event: AnalyticsEvent): void | Promise<void>;
}
