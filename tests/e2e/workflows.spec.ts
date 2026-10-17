import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { PDFDocument, PDFName, PDFNumber, rgb } from "pdf-lib";
import sharp from "sharp";

declare global {
  interface Window {
    workflowAudit: {
      events: { name: string; properties: Record<string, unknown> }[];
      writes: number;
    };
  }
}
const audit = new WeakMap<
  Page,
  { unexpected: number; console: number; errors: number }
>();
test.beforeEach(async ({ page }) => {
  const counts = { unexpected: 0, console: 0, errors: 0 };
  audit.set(page, counts);
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.protocol === "blob:") return;
    if (
      request.method() !== "GET" ||
      request.postData() !== null ||
      (!["127.0.0.1", "localhost"].includes(url.hostname) &&
        url.origin !==
          new URL(process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000")
            .origin)
    )
      counts.unexpected++;
    if (
      decodeURIComponent(request.url()).includes("Synthetic") ||
      request.url().includes("long-name-")
    )
      counts.unexpected++;
  });
  page.on("console", () => counts.console++);
  page.on("pageerror", () => counts.errors++);
  await page.addInitScript(() => {
    window.workflowAudit = { events: [], writes: 0 };
    window.addEventListener("avantic:analytics", (event) =>
      window.workflowAudit.events.push((event as CustomEvent).detail),
    );
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (...args) {
      window.workflowAudit.writes++;
      return original.apply(this, args);
    };
    const open = IDBFactory.prototype.open;
    IDBFactory.prototype.open = function (...args) {
      window.workflowAudit.writes++;
      return open.apply(this, args);
    };
    const put = Cache.prototype.put;
    Cache.prototype.put = function (...args) {
      window.workflowAudit.writes++;
      return put.apply(this, args);
    };
  });
});
test.afterEach(async ({ page }, info) => {
  if (page.isClosed()) return;
  expect(audit.get(page)?.unexpected).toBe(0);
  expect(audit.get(page)?.errors).toBe(0);
  // The deliberate 404 navigation emits Chromium's expected HTTP 404 notice.
  if (!info.title.startsWith("catalog"))
    expect(audit.get(page)?.console).toBe(0);
  const result = await page.evaluate(() => window.workflowAudit);
  expect(result.writes).toBe(0);
  for (const event of result.events) {
    expect(["tool_viewed", "tool_completed"]).toContain(event.name);
    expect(Object.keys(event.properties).sort()).toEqual(
      event.name === "tool_viewed" ? ["tool_id"] : ["action", "tool_id"],
    );
    expect(/^[a-z-]+$/.test(String(event.properties.tool_id))).toBe(true);
    if (event.name === "tool_completed")
      expect([
        "process",
        "calculate",
        "generate",
        "download",
        "share",
      ]).toContain(event.properties.action);
  }
});

// Only synthetic documents are used. No traces, videos or automatic screenshots.
const image = async (type: "jpeg" | "png" | "webp" = "jpeg") => ({
  name: `synthetic-${"long-name-".repeat(12)}.${type}`,
  mimeType: `image/${type}`,
  buffer: await sharp(
    Buffer.from(
      '<svg width="640" height="800"><rect width="640" height="800" fill="white"/><path d="M100 300 L200 250 L260 330 L500 200" fill="none" stroke="black" stroke-width="12"/><rect x="100" y="400" width="400" height="20" fill="#6c8792"/></svg>',
    ),
  )
    [type]()
    .toBuffer(),
});
async function pdfFile(widths = [300, 400], encrypted = false) {
  const doc = await PDFDocument.create();
  for (const width of widths) {
    const p = doc.addPage([width, 600]);
    p.drawRectangle({
      x: 20,
      y: 20,
      width: 100,
      height: 100,
      color: rgb(0.2, 0.3, 0.4),
    });
  }
  if (encrypted)
    doc.context.trailerInfo.Encrypt = doc.context.register(
      doc.context.obj({
        Filter: PDFName.of("Standard"),
        V: PDFNumber.of(1),
        R: PDFNumber.of(2),
      }),
    );
  return {
    name: "synthetic-document.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from(await doc.save()),
  };
}
async function download(page: Page, name = "Download PDF") {
  const promise = page.waitForEvent("download");
  await page.getByRole("button", { name, exact: true }).click();
  const file = await promise;
  const stream = await file.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  await file.delete();
  return Buffer.concat(chunks);
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
}
async function accessible(page: Page) {
  await noOverflow(page);
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      targets: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
}

test("catalog, search, categories, Coming Soon, metadata and 404 are intentional", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".catalog-card")).toHaveCount(12);
  await page.getByRole("searchbox").fill("photo size");
  await expect(page.locator(".catalog-card")).toHaveCount(1);
  await expect(page.locator(".catalog-card")).toContainText(
    "Application Photo",
  );
  await page.getByRole("searchbox").fill("no-such-thing");
  await expect(
    page.getByRole("heading", { name: "No matching tools" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear search" }).click();
  await accessible(page);
  await page
    .getByRole("navigation", { name: "Tool categories" })
    .getByRole("link", { name: "Files & Documents", exact: true })
    .click();
  await expect(page.locator(".catalog-card")).toHaveCount(3);
  await expect(page).toHaveTitle(/Files & Documents/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/categories\/files$/,
  );
  await page.goto("/this-page-does-not-exist");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Let’s find what you need",
  );
  await expect(
    page.getByRole("link", { name: "Browse tools", exact: true }).first(),
  ).toBeVisible();
  expect(await page.evaluate(async () => (await fetch("/sitemap.xml")).status)).toBe(200);
  expect(await page.evaluate(async () => (await fetch("/robots.txt")).status)).toBe(200);
  expect(await page.evaluate(async () => (await fetch("/icon.png")).status)).toBe(200);
  expect(await page.evaluate(async () => (await fetch("/opengraph-image")).status)).toBe(200);
});

test("scan prepares one image then multiple pages, crops, corrects corners, rotates, reorders, removes and exports", async ({
  page,
}) => {
  await page.goto("/tools/scan-to-pdf");
  await expect(
    page.getByLabel("Take a photo", { exact: true }),
  ).toHaveAttribute("capture", "environment");
  await page
    .getByLabel("Upload photos", { exact: true })
    .setInputFiles(await image());
  await expect(
    page.getByRole("button", { name: "Create PDF", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Create PDF", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Ready to download" }),
  ).toBeVisible();
  expect((await PDFDocument.load(await download(page))).getPageCount()).toBe(1);
  await page
    .getByLabel("Add pages", { exact: true })
    .setInputFiles([await image("png"), await image("webp")]);
  await expect(page.locator(".page-tile")).toHaveCount(3);
  await page.getByRole("button", { name: "Crop", exact: true }).click();
  await page.getByText("Set an exact crop", { exact: true }).click();
  await page.getByLabel("Width (%)", { exact: true }).fill("80");
  await page.getByRole("button", { name: "Apply crop", exact: true }).click();
  await page.getByRole("button", { name: "Correct page corners" }).click();
  const corner = page.getByRole("button", {
    name: "Top left page corner",
    exact: true,
  });
  await corner.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  await page.getByRole("button", { name: "Apply corners" }).click();
  await page.getByLabel("Readability", { exact: true }).selectOption("clean");
  await page
    .getByRole("button", { name: "Move page 3 earlier", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Rotate page 1", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Delete page 3", exact: true })
    .click();
  await expect(page.locator(".page-tile")).toHaveCount(2);
  await page.getByRole("button", { name: "Create PDF", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Ready to download" }),
  ).toBeVisible();
  const result = await PDFDocument.load(await download(page));
  expect(result.getPageCount()).toBe(2);
  expect(result.getPage(0).getWidth()).toBeGreaterThan(
    result.getPage(0).getHeight(),
  );
  await accessible(page);
  await page.getByRole("button", { name: "Organize this PDF" }).click();
  await expect(page.locator(".page-tile")).toHaveCount(2);
  await page.getByRole("button", { name: "Create PDF", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Ready to download" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Compress this PDF", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Compress", exact: true }),
  ).toBeVisible();
});

test("scan rejects bad images without retaining pages", async ({ page }) => {
  await page.goto("/tools/scan-to-pdf");
  await page.getByLabel("Upload photos", { exact: true }).setInputFiles({
    name: "bad.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from("not an image"),
  });
  await expect(page.locator(".error-message[role=alert]")).toContainText(
    "valid JPEG",
  );
  await expect(page.locator(".page-tile")).toHaveCount(0);
});

test("PDF organizer combines, orders, rotates, deletes and exports the selected pages", async ({
  page,
}) => {
  await page.goto("/tools/pdf-organizer");
  await page
    .getByLabel("Upload PDFs", { exact: true })
    .setInputFiles([await pdfFile([300, 400]), await pdfFile([500])]);
  await expect(page.locator(".page-tile")).toHaveCount(3);
  await page
    .getByRole("button", { name: "Move page 3 earlier", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Rotate page 2", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Delete page 3", exact: true })
    .click();
  await page.getByRole("button", { name: "Create PDF", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Ready to download" }),
  ).toBeVisible();
  const pdf = await PDFDocument.load(await download(page));
  expect(pdf.getPages().map((p) => p.getWidth())).toEqual([300, 500]);
  expect(pdf.getPages().map((p) => p.getRotation().angle)).toEqual([0, 90]);
  await accessible(page);
});

test("PDF organizer handles corrupt, encrypted, too many pages and oversized files", async ({
  page,
}) => {
  await page.goto("/tools/pdf-organizer");
  for (const fixture of [
    {
      name: "corrupt.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("not a PDF"),
    },
    await pdfFile([300], true),
    await pdfFile(Array(51).fill(300)),
    {
      name: "large.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.alloc(41 * 1024 * 1024),
    },
  ]) {
    await page
      .getByLabel("Upload PDFs", { exact: true })
      .setInputFiles(fixture);
    await expect(page.locator(".error-message[role=alert]")).toBeVisible();
    await expect(page.locator(".page-tile")).toHaveCount(0);
  }
});

for (const format of ["jpeg", "png", "webp"] as const) {
  test(`compressor supports ${format} and all three quality presets`, async ({
    page,
  }) => {
    await page.goto("/tools/file-compressor");
    const fixture = await image(format);
    await page
      .getByLabel("Upload a file", { exact: true })
      .setInputFiles(fixture);
    for (const preset of ["smallest", "balanced", "best"]) {
      await page
        .getByLabel("Compression", { exact: true })
        .selectOption(preset);
      await page.getByRole("button", { name: "Compress", exact: true }).click();
      await expect(
        page.getByRole("heading", { name: "Ready to download" }),
      ).toBeVisible();
      const output = await download(page, "Download image");
      expect(output.length).toBeLessThanOrEqual(fixture.buffer.length);
      expect((await sharp(output).metadata()).format).toBe(format);
    }
    await accessible(page);
  });
}

test("PDF compression produces a smaller usable document and rejects unsupported input", async ({
  page,
}) => {
  // A large embedded image makes the compression result meaningful.
  const pixels = Buffer.alloc(1800 * 2400 * 3);
  let state = 42;
  for (let i = 0; i < pixels.length; i++) {
    state = (state * 1664525 + 1013904223) >>> 0;
    pixels[i] = state >>> 24;
  }
  const jpeg = await sharp(pixels, {
    raw: { width: 1800, height: 2400, channels: 3 },
  })
    .jpeg({ quality: 100 })
    .toBuffer();
  const doc = await PDFDocument.create();
  const embedded = await doc.embedJpg(jpeg);
  doc
    .addPage([600, 800])
    .drawImage(embedded, { x: 0, y: 0, width: 600, height: 800 });
  const input = Buffer.from(await doc.save());
  await page.goto("/tools/file-compressor");
  await page.getByLabel("Upload a file", { exact: true }).setInputFiles({
    name: "large-photo.pdf",
    mimeType: "application/pdf",
    buffer: input,
  });
  await page.getByRole("button", { name: "Compress", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Ready to download" }),
  ).toBeVisible({ timeout: 30000 });
  const output = await download(page);
  expect(output.length).toBeLessThan(input.length);
  expect((await PDFDocument.load(output)).getPageCount()).toBe(1);
  await page.getByLabel("Upload a file", { exact: true }).setInputFiles({
    name: "unsafe.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from("<svg/>"),
  });
  await expect(page.locator(".error-message[role=alert]")).toContainText(
    "valid JPEG",
  );
});

test("application prep crops, resizes, meets JPG target KB and prepares a tight PNG signature", async ({
  page,
}) => {
  await page.goto("/tools/application-photo-signature-prep");
  await page
    .getByLabel("Upload a photo", { exact: true })
    .setInputFiles(await image());
  await page.getByRole("button", { name: "Crop", exact: true }).click();
  const corner = page.getByRole("button", {
    name: "top left crop corner",
    exact: true,
  });
  await corner.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  await page.getByRole("button", { name: "Apply crop" }).click();
  await page.getByLabel("Width", { exact: true }).fill("300");
  await page.getByLabel("Height", { exact: true }).fill("400");
  await page.getByLabel("Maximum size (KB)", { exact: true }).fill("30");
  await page.getByRole("button", { name: "Prepare image" }).click();
  await expect(
    page.getByRole("heading", { name: "Ready to download" }),
  ).toBeVisible();
  let output = await download(page, "Download image");
  let info = await sharp(output).metadata();
  expect([info.width, info.height]).toEqual([300, 400]);
  expect(output.length).toBeLessThanOrEqual(30 * 1024);
  await page.getByRole("button", { name: "Signature", exact: true }).click();
  await expect(
    page.getByLabel("Trim blank space around the signature"),
  ).toBeChecked();
  await page.getByLabel("Format", { exact: true }).selectOption("image/png");
  await page.getByLabel("Maximum size (KB)", { exact: true }).fill("");
  await page.getByRole("button", { name: "Prepare image" }).click();
  await expect(
    page.getByRole("heading", { name: "Ready to download" }),
  ).toBeVisible();
  output = await download(page, "Download image");
  info = await sharp(output).metadata();
  expect([info.width, info.height, info.format]).toEqual([400, 100, "png"]);
  const pixels = await sharp(output).ensureAlpha().raw().toBuffer();
  let top = 100;
  let bottom = -1;
  for (let y = 0; y < 100; y++)
    for (let x = 0; x < 400; x++) {
      const i = (y * 400 + x) * 4;
      if (
        pixels[i + 3] > 32 &&
        Math.min(pixels[i], pixels[i + 1], pixels[i + 2]) < 220
      ) {
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
  expect(bottom - top).toBeGreaterThan(80);
  await accessible(page);
  await page.getByLabel("Width", { exact: true }).fill("0");
  await page.getByRole("button", { name: "Prepare image" }).click();
  await expect(page.locator(".error-message[role=alert]")).toContainText(
    "dimensions",
  );
  await page.getByLabel("Width", { exact: true }).fill("400");
  await page.getByLabel("Maximum size (KB)", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Prepare image" }).click();
  await expect(page.locator(".error-message[role=alert]")).toContainText(
    "PNG cannot meet",
  );
});

test("invoice and merchant receipt calculate exact NGN totals and export long mobile documents", async ({
  page,
}) => {
  await page.goto("/tools/invoice-receipt-maker");
  await page
    .getByLabel("Business name *", { exact: true })
    .fill("Synthetic Ọmọ business");
  await page
    .getByLabel("Customer name *", { exact: true })
    .fill("Synthetic customer");
  await page
    .getByLabel("Item 1 *", { exact: true })
    .fill("A long description of a completed design service. ".repeat(8));
  await page.getByLabel("Quantity *", { exact: true }).fill("2");
  await page.getByLabel("Unit price (₦) *", { exact: true }).fill("1500.50");
  await page.getByRole("button", { name: "Add item", exact: true }).click();
  await page.getByLabel("Item 2 *", { exact: true }).fill("Delivery");
  await page.getByLabel("Unit price (₦) *", { exact: true }).nth(1).fill("500");
  await page.getByLabel("Add a discount", { exact: true }).check();
  await page.getByLabel("Discount (%)", { exact: true }).fill("10");
  await page.getByLabel("Add tax", { exact: true }).check();
  await page.getByLabel("Tax (%)", { exact: true }).fill("7.5");
  await expect(page.locator(".invoice-summary .total")).toContainText(
    "₦3,387.22",
  );
  await page
    .getByLabel("Payment / bank-transfer details", { exact: true })
    .fill("Synthetic payment details");
  await page
    .getByRole("button", { name: "Create invoice", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Ready to download" }),
  ).toBeVisible({ timeout: 30000 });
  expect(
    (await PDFDocument.load(await download(page))).getPageCount(),
  ).toBeGreaterThan(0);
  await page
    .getByRole("button", { name: "Sales receipt", exact: true })
    .click();
  await page.getByLabel("Payment method", { exact: true }).fill("Cash");
  await page
    .getByRole("button", { name: "Create sales receipt", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Ready to download" }),
  ).toBeVisible();
  const receipt = await PDFDocument.load(await download(page));
  expect(receipt.getTitle()).toBe("Merchant sales receipt");
  await expect(
    page.getByText(
      "This is your merchant record, not independently verified proof of payment.",
      { exact: false },
    ),
  ).toBeVisible();
  await accessible(page);
});

test("percentage jobs and calendar boundaries have clear results and invalid states", async ({
  page,
}) => {
  await page.goto("/tools/percentage-discount-calculator");
  const mode = page.getByLabel("What do you want to calculate?", {
    exact: true,
  });
  for (const [job, x, y, expected] of [
    ["of", "12.5", "200", "25"],
    ["ratio", "25", "200", "12.5%"],
    ["increase", "10", "200", "220"],
    ["decrease", "10", "200", "180"],
    ["discount", "25", "1000", "750"],
  ]) {
    await mode.selectOption(job);
    await page.locator('input[type="number"]').nth(0).fill(x);
    await page.locator('input[type="number"]').nth(1).fill(y);
    await page.getByRole("button", { name: "Calculate", exact: true }).click();
    await expect(page.locator(".result-value")).toHaveText(expected);
  }
  await mode.selectOption("ratio");
  await page.locator('input[type="number"]').nth(1).fill("0");
  await page.getByRole("button", { name: "Calculate", exact: true }).click();
  await expect(page.locator(".error-message[role=alert]")).toBeVisible();
  await accessible(page);
  await page.goto("/tools/age-date-calculator");
  await page.getByLabel("Date of birth", { exact: true }).fill("2000-02-29");
  await page.getByLabel("Age on", { exact: true }).fill("2025-02-28");
  await page.getByRole("button", { name: "Calculate", exact: true }).click();
  await expect(page.locator(".result-value")).toHaveText(
    "25 years, 0 months, 0 days",
  );
  await page
    .getByLabel("What do you want to calculate?", { exact: true })
    .selectOption("difference");
  await page.getByLabel("Start date", { exact: true }).fill("2024-02-28");
  await page.getByLabel("End date", { exact: true }).fill("2024-03-01");
  await page.getByRole("button", { name: "Calculate", exact: true }).click();
  await expect(page.locator(".result-value")).toHaveText(
    "0 years, 0 months, 2 days",
  );
  for (const job of ["until", "since"]) {
    await page
      .getByLabel("What do you want to calculate?", { exact: true })
      .selectOption(job);
    await page.getByLabel("Selected date", { exact: true }).fill("2024-03-01");
    await page.getByLabel("Reference date", { exact: true }).fill("2024-03-01");
    await page.getByRole("button", { name: "Calculate", exact: true }).click();
    await expect(page.locator(".result-value")).toHaveText("0 days");
  }
  await accessible(page);
});

test("all public routes have unique metadata, valid internal links and truthful structured data", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".roadmap-grid article")).toHaveCount(7);
  await expect(page.locator(".roadmap-grid a")).toHaveCount(0);
  const routes = await page
    .locator("a")
    .evaluateAll((nodes) => [
      ...new Set(
        nodes
          .map((node) => node.getAttribute("href")!)
          .filter((href) => href.startsWith("/") && !href.includes("#")),
      ),
    ]);
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const route of routes) {
    expect((await page.goto(route))?.status()).toBe(200);
    const title = await page.title();
    const description = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(titles.has(title)).toBe(false);
    titles.add(title);
    expect(descriptions.has(description!)).toBe(false);
    descriptions.add(description!);
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    expect(new URL(canonical!).pathname).toBe(route);
    await noOverflow(page);
    if (route.startsWith("/tools/")) {
      const schema = JSON.parse(
        (await page
          .locator('script[type="application/ld+json"]')
          .textContent()) ?? "{}",
      );
      expect(schema["@type"]).toBe("WebApplication");
      expect(schema.offers.price).toBe("0");
      expect(schema.aggregateRating).toBeUndefined();
      expect(schema.review).toBeUndefined();
    }
  }
});

test("photo target KB reduces a detailed image without changing exact dimensions; invalid sizes are clear", async ({
  page,
}) => {
  const raw = Buffer.alloc(600 * 600 * 3);
  let state = 123;
  for (let i = 0; i < raw.length; i++) {
    state = (state * 1664525 + 1013904223) >>> 0;
    raw[i] = state >>> 24;
  }
  const source = await sharp(raw, {
    raw: { width: 600, height: 600, channels: 3 },
  })
    .jpeg({ quality: 100 })
    .toBuffer();
  await page.goto("/tools/application-photo-signature-prep");
  await page.getByLabel("Upload a photo", { exact: true }).setInputFiles({
    name: "synthetic-detail.jpg",
    mimeType: "image/jpeg",
    buffer: source,
  });
  await page.getByLabel("Maximum size (KB)", { exact: true }).fill("30");
  await page
    .getByRole("button", { name: "Prepare image", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Ready to download" }),
  ).toBeVisible();
  const output = await download(page, "Download image");
  const metadata = await sharp(output).metadata();
  expect([metadata.width, metadata.height]).toEqual([400, 400]);
  expect(output.length).toBeLessThanOrEqual(30 * 1024);
  await page.getByLabel("Width", { exact: true }).fill("400.5");
  await page
    .getByRole("button", { name: "Prepare image", exact: true })
    .click();
  await expect(page.locator(".error-message[role=alert]")).toContainText(
    "whole-number",
  );
  await page.getByLabel("Width", { exact: true }).fill("400");
  await page.getByLabel("Maximum size (KB)", { exact: true }).fill("1");
  await page
    .getByRole("button", { name: "Prepare image", exact: true })
    .click();
  await expect(page.locator(".error-message[role=alert]")).toContainText(
    "too small",
  );
});

test("compressor rejects oversized files before processing and clears a previous result", async ({
  page,
}) => {
  await page.goto("/tools/file-compressor");
  await page
    .getByLabel("Upload a file", { exact: true })
    .setInputFiles(await image());
  await page.getByRole("button", { name: "Compress", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Ready to download" }),
  ).toBeVisible();
  for (const [name, mimeType, size, message] of [
    ["large.pdf", "application/pdf", 41, "under 40 MB"],
    ["large.jpg", "image/jpeg", 21, "under 20 MB"],
  ] as const) {
    await page.getByLabel("Upload a file", { exact: true }).setInputFiles({
      name,
      mimeType,
      buffer: Buffer.alloc(size * 1024 * 1024),
    });
    await expect(page.locator(".error-message[role=alert]")).toContainText(
      message,
    );
    await expect(
      page.getByRole("heading", { name: "Ready to download" }),
    ).toHaveCount(0);
  }
});

test("share uses the device share sheet only after an explicit action", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "canShare", {
      configurable: true,
      value: () => true,
    });
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (data: ShareData) => {
        if (!data.files?.length || data.files[0].type !== "application/pdf")
          throw new Error("Invalid share");
        document.documentElement.dataset.shared = "yes";
      },
    });
  });
  await page.goto("/tools/scan-to-pdf");
  await page
    .getByLabel("Upload photos", { exact: true })
    .setInputFiles(await image());
  await page.getByRole("button", { name: "Create PDF", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Share", exact: true }),
  ).toBeVisible();
  await expect(page.locator("html")).not.toHaveAttribute("data-shared");
  await page.getByRole("button", { name: "Share", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-shared", "yes");
});

test("clearing a scan releases its preview object URLs", async ({ page }) => {
  await page.addInitScript(() => {
    const active = new Set<string>();
    const create = URL.createObjectURL.bind(URL);
    const revoke = URL.revokeObjectURL.bind(URL);
    URL.createObjectURL = (blob) => {
      const url = create(blob);
      active.add(url);
      document.documentElement.dataset.blobCount = String(active.size);
      return url;
    };
    URL.revokeObjectURL = (url) => {
      active.delete(url);
      document.documentElement.dataset.blobCount = String(active.size);
      revoke(url);
    };
  });
  await page.goto("/tools/scan-to-pdf");
  await page
    .getByLabel("Upload photos", { exact: true })
    .setInputFiles([await image(), await image("png")]);
  await expect(page.locator(".page-tile")).toHaveCount(2);
  await expect(page.locator("html")).toHaveAttribute("data-blob-count", "2");
  await page.getByRole("button", { name: "Crop", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-blob-count", "3");
  await page.getByRole("button", { name: "Apply crop", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-blob-count", "2");
  await page.getByRole("button", { name: "Clear scan", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-blob-count", "0");
});

test("navigation search traps focus, filters locally, opens a tool and closes with Escape", async ({
  page,
}) => {
  await page.goto("/");
  const open = page.getByRole("button", { name: "Search tools", exact: true });
  await open.click();
  const dialog = page.getByRole("dialog", { name: "Find a tool" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("searchbox").fill("photo size");
  await expect(dialog.getByRole("link")).toHaveCount(1);
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("link")).toBeFocused();
  // Native modal dialogs make the underlying page inert, including scripted focus.
  await page
    .locator("#tool-search")
    .evaluate((node) => (node as HTMLInputElement).focus());
  await expect(dialog.getByRole("link")).toBeFocused();
  await accessible(page);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(open).toBeFocused();
  await open.click();
  await dialog.getByRole("searchbox").fill("discount");
  await dialog.getByRole("link").click();
  await expect(page).toHaveURL(/percentage-discount-calculator$/);
});
