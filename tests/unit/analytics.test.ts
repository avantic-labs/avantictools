import { describe, expect, it, vi, afterEach } from "vitest";
import { createUtilityEvent, trackUtilityEvent, UTILITY_ANALYTICS_EVENT } from "../../lib/analytics/utilities";
import { utilityIds, utilityTools } from "../../lib/utilities/catalog";

afterEach(() => vi.unstubAllGlobals());

describe("utility analytics privacy boundary", () => {
  it("only emits canonical event names and constant identifiers/actions", () => {
    expect(createUtilityEvent("password-generator", "tool_completed", "generate")).toEqual({
      name: "tool_completed", properties: { tool_id: "password-generator", action: "generate" },
    });
    expect(createUtilityEvent("word-counter", "tool_viewed", "count")).toEqual({
      name: "tool_viewed", properties: { tool_id: "word-counter" },
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
    expect(event.detail).toEqual({ name: "tool_completed", properties: { tool_id: "password-generator", action: "copy" } });
  });

  it("does nothing on the server", () => {
    vi.stubGlobal("window", undefined);
    expect(() => trackUtilityEvent("word-counter", "tool_viewed")).not.toThrow();
  });
});

it("uses the five canonical live Day-1 utility routes", () => {
  expect(utilityTools.map((tool) => tool.slug)).toEqual([...utilityIds]);
  for (const tool of utilityTools) expect(tool.route).toBe(`/tools/${tool.slug}`);
});
