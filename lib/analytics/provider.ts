import { sanitizeAnalyticsEvent, type AnalyticsClient, type AnalyticsEvent } from "./events";

export type PostHogConfig = { apiKey: string; host: string };
const allowedHosts = new Set(["us.i.posthog.com", "eu.i.posthog.com"]);

export function validatePostHogConfig(apiKey?: string, host?: string): PostHogConfig | null {
  if (!apiKey || !/^phc_[A-Za-z0-9_-]+$/.test(apiKey) || !host) return null;
  try {
    const url = new URL(host);
    if (url.protocol !== "https:" || url.pathname !== "/" || url.search || url.hash || !allowedHosts.has(url.hostname)) return null;
    return { apiKey, host: url.origin };
  } catch {
    return null;
  }
}

export function postHogPayload(event: AnalyticsEvent, apiKey: string, distinctId: string) {
  const safe = sanitizeAnalyticsEvent(event);
  if (!safe || !/^phc_[A-Za-z0-9_-]+$/.test(apiKey) || !/^anon_[a-f0-9-]+$/.test(distinctId)) return null;
  return {
    api_key: apiKey,
    event: safe.name,
    properties: { distinct_id: distinctId, $process_person_profile: false, ...safe.properties },
  };
}

export function createPostHogClient(config: PostHogConfig, distinctId: string): AnalyticsClient {
  return {
    capture(event) {
      const body = postHogPayload(event, config.apiKey, distinctId);
      if (!body) return;
      void fetch(`${config.host}/i/v0/e/`, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        cache: "no-store",
        keepalive: true,
        referrerPolicy: "no-referrer",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }).catch(() => {
        // Measurement must never interrupt a tool or expose transport errors.
      });
    },
  };
}
