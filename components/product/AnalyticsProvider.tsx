"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { getTool, type CategoryId, type ToolId } from "@/data/tools";
import { createPostHogClient, validatePostHogConfig } from "@/lib/analytics/provider";
import { subscribeAnalytics, trackEvent } from "@/lib/analytics/utilities";
import {
  campaigns,
  trafficMedia,
  trafficSources,
  type Attribution,
  type PageId,
} from "@/lib/analytics/events";
import { observeWebVitals } from "@/lib/analytics/vitals";

let attribution: Attribution | null = null;

function readAttribution(): Attribution {
  if (attribution) return attribution;
  const query = new URLSearchParams(window.location.search);
  const source = query.get("utm_source");
  const medium = query.get("utm_medium");
  const campaign = query.get("utm_campaign");
  attribution = {
    ...(trafficSources.includes(source as (typeof trafficSources)[number]) ? { traffic_source: source as Attribution["traffic_source"] } : {}),
    ...(trafficMedia.includes(medium as (typeof trafficMedia)[number]) ? { traffic_medium: medium as Attribution["traffic_medium"] } : {}),
    ...(campaigns.includes(campaign as (typeof campaigns)[number]) ? { campaign: campaign as Attribution["campaign"] } : {}),
  };
  return attribution;
}

type RouteDetails = { pageId: PageId; toolId?: ToolId; category?: CategoryId };
function routeDetails(pathname: string): RouteDetails {
  if (pathname === "/") return { pageId: "home" };
  if (pathname === "/about") return { pageId: "about" };
  if (pathname === "/privacy") return { pageId: "privacy" };
  if (pathname === "/terms") return { pageId: "terms" };
  if (pathname.startsWith("/categories/")) return { pageId: "category" };
  if (pathname.startsWith("/tools/")) {
    const tool = getTool(pathname.slice("/tools/".length));
    return tool ? { pageId: "tool", toolId: tool.slug, category: tool.category } : { pageId: "not_found" };
  }
  return { pageId: "not_found" };
}

function viewport() {
  const width = window.innerWidth;
  return {
    device_class: width < 640 ? "mobile" as const : width < 1024 ? "tablet" as const : "desktop" as const,
    viewport_category: width < 390 ? "small" as const : width < 768 ? "medium" as const : width < 1440 ? "large" as const : "wide" as const,
  };
}

export function AnalyticsProvider({ apiKey, host }: { apiKey?: string; host?: string }) {
  const pathname = usePathname();
  const config = useMemo(() => validatePostHogConfig(apiKey, host), [apiKey, host]);
  const client = useMemo(() => config ? createPostHogClient(config, `anon_${crypto.randomUUID()}`) : null, [config]);

  useEffect(() => {
    if (!client) return;
    return subscribeAnalytics((event) => client.capture(event));
  }, [client]);

  useEffect(() => {
    const details = routeDetails(pathname);
    trackEvent({
      name: "page_view",
      properties: {
        page_id: details.pageId,
        ...(details.toolId ? { tool_id: details.toolId } : {}),
        ...(details.category ? { category: details.category } : {}),
        ...viewport(),
        ...readAttribution(),
      },
    });
  }, [pathname]);

  useEffect(() => {
    if (!client) return;
    const details = routeDetails(pathname);
    return observeWebVitals((metric) => trackEvent({
        name: "web_vital",
        properties: {
          metric: metric.name,
          rating: metric.rating === "needs-improvement" ? "needs_improvement" : metric.rating,
          page_id: details.pageId,
          ...(details.toolId ? { tool_id: details.toolId } : {}),
        },
      }));
  }, [client, pathname]);

  return null;
}
