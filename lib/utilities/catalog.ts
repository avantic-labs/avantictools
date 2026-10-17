import { liveDay1Tools } from "@/data/day1-tools";

export const utilityIds = [
  "word-counter",
  "character-counter",
  "case-converter",
  "qr-code-generator",
  "password-generator",
] as const;

export type UtilityId = (typeof utilityIds)[number];

export function isUtilityId(value: string): value is UtilityId {
  return utilityIds.some((id) => id === value);
}

// Names, descriptions and URLs continue to come from the canonical Day-1 registry.
export const utilityTools = liveDay1Tools.filter((tool) => isUtilityId(tool.slug));
