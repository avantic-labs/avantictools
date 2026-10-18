import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { socialLinks } from "../../data/socials";

test("homepage motion supports reduced motion without interrupting discovery", async ({
  page,
}) => {
  await page.goto("/");
  const externalRequests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== new URL(page.url()).origin)
      externalRequests.push(request.url());
  });
  const canvas = page.locator(".hero-motion canvas");
  await expect(canvas).toBeVisible();
  const search = page.getByRole("searchbox");
  await expect(search).toBeVisible();
  expect((await search.boundingBox())!.y).toBeLessThan(
    page.viewportSize()!.width < 768 ? 400 : 500,
  );
  await expect(page.locator(".hero-motion")).toHaveCSS("pointer-events", "none");
  await expect(page.locator(".hero-motion")).toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)",
  );
  const searchReceivesPointer = await search.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return document.elementFromPoint(rect.x + 8, rect.y + 8) === element;
  });
  expect(searchReceivesPointer).toBe(true);
  const first = await canvas.evaluate((element: HTMLCanvasElement) =>
    element.toDataURL(),
  );
  await page.waitForTimeout(500);
  const second = await canvas.evaluate((element: HTMLCanvasElement) =>
    element.toDataURL(),
  );
  expect(second).not.toBe(first);
  expect(externalRequests).toEqual([]);

  await page.locator("#tools").scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  const offscreenFrame = await canvas.evaluate((element: HTMLCanvasElement) =>
    element.toDataURL(),
  );
  await page.waitForTimeout(500);
  expect(
    await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL()),
  ).toBe(offscreenFrame);
  await canvas.scrollIntoViewIfNeeded();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(100);
  const staticFrame = await canvas.evaluate((element: HTMLCanvasElement) =>
    element.toDataURL(),
  );
  await page.waitForTimeout(500);
  expect(
    await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL()),
  ).toBe(staticFrame);
  await page.getByRole("searchbox").fill("invoice");
  await expect(page.locator(".catalog-card")).toHaveCount(1);
});

test("primary search is visible, keyboard usable and keeps mobile category navigation contained", async ({
  page,
}) => {
  await page.goto("/");
  const search = page.getByRole("searchbox");
  await expect(search).toBeVisible();
  expect((await search.boundingBox())!.y).toBeLessThan(500);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  for (const phrase of [
    "PDF",
    "photo size",
    "discount",
    "invoice",
    "compress",
    "word count",
  ]) {
    await search.fill(phrase);
    await expect(page.locator(".catalog-card").first()).toBeVisible();
  }
  await search.press("ArrowDown");
  await expect(page.locator(".catalog-card a").first()).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(search).toBeFocused();
  await search.press("Escape");
  await expect(page.locator(".catalog-card")).toHaveCount(12);
  if (page.viewportSize()!.width < 640) {
    const rows = await page
      .locator(".category-nav a")
      .evaluateAll((links) =>
        links.map((link) => Math.round(link.getBoundingClientRect().top)),
      );
    expect(new Set(rows).size).toBe(1);
    expect((await page.locator("#tools").boundingBox())!.height).toBeLessThan(
      1900,
    );
  }
  await page.getByRole("button", { name: "Search tools", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("searchbox").fill("invoice");
  await page.keyboard.press("ArrowDown");
  await expect(dialog.getByRole("link")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test("invoice sections retain edits and keep a usable primary action beside the live preview", async ({
  page,
}) => {
  await page.goto("/tools/invoice-receipt-maker");
  await page
    .getByLabel("Business name *", { exact: true })
    .fill("Synthetic studio");
  await page
    .getByLabel("Customer name *", { exact: true })
    .fill("Synthetic customer");
  const who = page.getByRole("button", { name: /1. Who & when/ });
  const items = page.getByRole("button", { name: /2. What was sold/ });
  await who.click();
  await expect(
    page.getByLabel("Business name *", { exact: true }),
  ).not.toBeVisible();
  if ((await items.getAttribute("aria-expanded")) === "false")
    await items.click();
  await page.getByLabel("Item 1 *", { exact: true }).fill("Design service");
  await page.getByLabel("Unit price (₦) *", { exact: true }).fill("48500");
  await expect(page.locator(".invoice-finish")).toContainText("₦48,500.00");
  await items.click();
  await who.click();
  await expect(page.getByLabel("Business name *", { exact: true })).toHaveValue(
    "Synthetic studio",
  );
  if (page.viewportSize()!.width >= 1024) {
    await expect(
      page.getByRole("complementary", { name: "Live document preview" }),
    ).toContainText("Synthetic studio");
    await expect(page.locator(".preview-total")).toContainText("₦48,500.00");
  }
  await page
    .getByLabel("Business name *", { exact: true })
    .scrollIntoViewIfNeeded();
  const action = await page
    .getByRole("button", { name: "Create invoice", exact: true })
    .boundingBox();
  expect(action!.y + action!.height).toBeLessThanOrEqual(
    page.viewportSize()!.height,
  );
  await page
    .getByRole("button", { name: "Create invoice", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Ready to download" }),
  ).toBeVisible({ timeout: 30000 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("capture intent, reduced motion and official external links are explicit", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/tools/scan-to-pdf");
  await page.getByLabel("Take a photo", { exact: true }).waitFor();
  const first = page.locator('.capture-options input[type="file"]').first();
  if (page.viewportSize()!.width < 768) {
    await expect(first).toHaveAttribute("capture", "environment");
    await expect(
      page
        .getByText("Drop files here, or choose them above.", { exact: false })
        .first(),
    ).not.toBeVisible();
  } else await expect(first).not.toHaveAttribute("capture");
  await page.getByRole("button", { name: "Search tools", exact: true }).click();
  expect(
    await page
      .getByRole("dialog")
      .evaluate((node) => getComputedStyle(node).animationName),
  ).toBe("none");
  await page.keyboard.press("Escape");
  for (const route of ["/", "/about", "/privacy", "/terms"]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    for (const [selector, attribute] of [
      ['link[rel="canonical"]', "href"],
      ['meta[property="og:url"]', "content"],
    ]) {
      expect(
        new URL((await page.locator(selector).getAttribute(attribute))!).href,
      ).toBe(new URL(route, "https://avantictools.vercel.app").href);
    }
    await expect(
      page.locator('meta[property="og:image"]').first(),
    ).toHaveAttribute("content", /^https:\/\/avantictools\.vercel\.app\//);
    const footer = page.getByRole("contentinfo");
    for (const [name, href] of socialLinks) {
      const link = footer.getByRole("link", {
        name: `AVANTIC LABS on ${name} (opens in a new tab)`,
        exact: true,
      });
      await expect(link).toHaveAttribute("href", href);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations.map((violation) => ({
        id: violation.id,
        targets: violation.nodes.map((node) => node.target),
      })),
    ).toEqual([]);
  }
});
