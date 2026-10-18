import { tools, type ToolId } from "@/data/tools";

export const utilityIds = tools.map((tool) => tool.slug);

export type UtilityId = ToolId;

export function isUtilityId(value: string): value is UtilityId {
  return utilityIds.some((id) => id === value);
}

// Work Order 003 amends the catalog while keeping all five existing URLs stable.
export const utilityTools = tools.map((tool) => ({ ...tool, route: `/tools/${tool.slug}` }));
