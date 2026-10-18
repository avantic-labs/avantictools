import type { Tool } from "@/data/tools";
/** Search is local. Never put query text in URLs, storage or analytics. */
export function matchesTool(tool: Tool, query: string): boolean {
  const haystack =
    `${tool.name} ${tool.description} ${tool.keywords}`.toLocaleLowerCase("en");
  return query
    .trim()
    .toLocaleLowerCase("en")
    .split(/\s+/)
    .filter(Boolean)
    .every(
      (word) =>
        haystack.includes(word) ||
        (word.length > 3 &&
          word.endsWith("s") &&
          haystack.includes(word.slice(0, -1))),
    );
}
