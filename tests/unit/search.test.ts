import { expect, it } from "vitest";
import { tools } from "../../data/tools";
import { matchesTool } from "../../lib/utilities/search";
it("finds tools by user problems, multiword searches and common plurals", () => {
  expect(
    tools
      .filter((tool) => matchesTool(tool, "photo size"))
      .map((tool) => tool.slug),
  ).toEqual(["application-photo-signature-prep"]);
  expect(
    tools.filter((tool) => matchesTool(tool, "PDF")).map((tool) => tool.slug),
  ).toEqual(["scan-to-pdf", "pdf-organizer", "file-compressor"]);
  expect(tools.filter((tool) => matchesTool(tool, "discounts"))).toHaveLength(
    1,
  );
  expect(
    tools.filter((tool) => matchesTool(tool, "missing utility")),
  ).toHaveLength(0);
  expect(tools.filter((tool) => matchesTool(tool, " "))).toHaveLength(12);
});
