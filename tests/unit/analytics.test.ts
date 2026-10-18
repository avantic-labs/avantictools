import { describe, expect, it, vi, afterEach } from "vitest";
import { createUtilityEvent, trackUtilityEvent, UTILITY_ANALYTICS_EVENT } from "../../lib/analytics/utilities";
import { sanitizeAnalyticsEvent } from "../../lib/analytics/events";
import { createPostHogClient, postHogPayload, validatePostHogConfig } from "../../lib/analytics/provider";
import { utilityIds, utilityTools } from "../../lib/utilities/catalog";

afterEach(() => vi.unstubAllGlobals());

describe("utility analytics privacy boundary", () => {
  it("only emits canonical event names and constant identifiers/actions", () => {
    expect(createUtilityEvent("password-generator", "tool_completed", "generate")).toEqual({
      name: "tool_completed", properties: { tool_id: "password-generator", completion_action: "generate" },
    });
    expect(createUtilityEvent("word-counter", "tool_viewed", "count")).toEqual({
      name: "tool_viewed", properties: { tool_id: "word-counter", category: "writing" },
    });
  });

  it("rejects user content or unknown values even if types are bypassed", () => {
    // @ts-expect-error Simulate an untyped caller attempting to include content.
    expect(createUtilityEvent("entered text", "tool_completed", "generate")).toBeNull();
    // @ts-expect-error Action names are a runtime allowlist, not just a TS union.
    expect(createUtilityEvent("qr-code-generator", "tool_completed", "https://private.test")).toBeNull();
    // @ts-expect-error Unknown event names cannot cross the boundary.
    expect(createUtilityEvent("word-counter", "input_changed", "count")).toBeNull();
    expect(createUtilityEvent("case-converter", "tool_completed")).toBeNull();
  });

  it("dispatches only locally with no properties supplied by the caller", () => {
    const dispatchEvent = vi.fn();
    vi.stubGlobal("window", { dispatchEvent });
    trackUtilityEvent("password-generator", "tool_completed", "copy");
    const event = dispatchEvent.mock.calls[0][0] as CustomEvent;
    expect(event.type).toBe(UTILITY_ANALYTICS_EVENT);
    expect(event.detail).toEqual({ name: "tool_completed", properties: { tool_id: "password-generator", completion_action: "copy" } });
  });

  it("does nothing on the server", () => {
    vi.stubGlobal("window", undefined);
    expect(() => trackUtilityEvent("word-counter", "tool_viewed")).not.toThrow();
  });
});

describe("production analytics boundary", () => {
  it("rejects unknown properties and every representative content-bearing value", () => {
    const prohibited = ["raw text", "filename.pdf", "01-01-2000", "customer name", "bank details"];
    for (const privateValue of prohibited) {
      expect(sanitizeAnalyticsEvent({ name: "tool_started", properties: { tool_id: "word-counter", privateValue } })).toBeNull();
      expect(sanitizeAnalyticsEvent({ name: "search_used", properties: { result_count_bucket: "one", query: privateValue } })).toBeNull();
      expect(sanitizeAnalyticsEvent({ name: "tool_error", properties: { tool_id: "scan-to-pdf", error_code: "export_failed", message: privateValue } })).toBeNull();
    }
  });

  it("allows only documented attribution and fixed error values", () => {
    expect(sanitizeAnalyticsEvent({ name: "page_view", properties: {
      page_id: "home", device_class: "mobile", viewport_category: "small",
      traffic_source: "instagram", traffic_medium: "social", campaign: "tools_launch",
    } })).not.toBeNull();
    expect(sanitizeAnalyticsEvent({ name: "page_view", properties: {
      page_id: "home", device_class: "mobile", viewport_category: "small", traffic_source: "newsletter",
    } })).toBeNull();
    expect(sanitizeAnalyticsEvent({ name: "tool_error", properties: {
      tool_id: "pdf-organizer", error_code: "encrypted_pdf",
    } })).not.toBeNull();
  });

  it("creates an anonymous personless PostHog payload and rejects unsafe configuration", () => {
    const event = createUtilityEvent("file-compressor", "tool_started")!;
    const payload = postHogPayload(event, "phc_public_project_key", "anon_12345678-1234-1234-1234-123456789abc");
    expect(payload).toEqual({
      api_key: "phc_public_project_key",
      event: "tool_started",
      properties: {
        distinct_id: "anon_12345678-1234-1234-1234-123456789abc",
        $process_person_profile: false,
        tool_id: "file-compressor",
      },
    });
    expect(JSON.stringify(payload)).not.toMatch(/filename|query|customer|password|content/);
    expect(validatePostHogConfig("phc_public_project_key", "https://us.i.posthog.com")).toEqual({ apiKey: "phc_public_project_key", host: "https://us.i.posthog.com" });
    expect(validatePostHogConfig("phc_public_project_key", "https://example.com")).toBeNull();
    expect(validatePostHogConfig("secret", "https://us.i.posthog.com")).toBeNull();
  });

  it("sends only the sanitized payload without credentials or referrer", async () => {
    const fetch = vi.fn(() => Promise.resolve(new Response(null, { status: 204 })));
    vi.stubGlobal("fetch", fetch);
    const event = createUtilityEvent("word-counter", "tool_completed", "count")!;
    createPostHogClient(
      { apiKey: "phc_public_project_key", host: "https://eu.i.posthog.com" },
      "anon_12345678-1234-1234-1234-123456789abc",
    ).capture(event);
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://eu.i.posthog.com/i/v0/e/");
    expect(init.credentials).toBe("omit");
    expect(init.referrerPolicy).toBe("no-referrer");
    expect(JSON.parse(String(init.body))).toEqual(postHogPayload(
      event,
      "phc_public_project_key",
      "anon_12345678-1234-1234-1234-123456789abc",
    ));
  });
});

it("uses exactly twelve canonical live workflow routes", () => {
  expect(utilityIds).toHaveLength(12);
  expect(utilityTools.map((tool) => tool.slug)).toEqual([...utilityIds]);
  for (const tool of utilityTools) expect(tool.route).toBe(`/tools/${tool.slug}`);
});
