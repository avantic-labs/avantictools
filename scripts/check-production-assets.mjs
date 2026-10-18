import { readdir, readFile, unlink } from "node:fs/promises";
import path from "node:path";
// Keep server diagnostics intact. Only inspect assets that browsers can request.
for (const root of [".next/static", "public"]) {
  for (const entry of await readdir(root, { recursive: true })) {
    if (!entry.endsWith(".map")) continue;
    const file = path.join(root, entry);
    const map = JSON.parse(await readFile(file, "utf8"));
    if (
      map.sources?.length ||
      map.sourcesContent?.length ||
      map.mappings ||
      map.sections?.length
    )
      throw new Error(
        "Unexpected production browser source map. Review the build configuration before shipping.",
      );
    // Turbopack may emit an empty, unreferenced map even with source maps off.
    await unlink(file);
  }
}
console.log("Production browser assets contain no source maps.");
