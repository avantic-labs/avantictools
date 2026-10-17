import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import jsQR from "jsqr";
import { PNG } from "pngjs";

const tools = [
  { slug: "word-counter", name: "Word Counter" },
  { slug: "character-counter", name: "Character Counter" },
  { slug: "case-converter", name: "Case Converter" },
  { slug: "qr-code-generator", name: "QR Code Generator" },
  { slug: "password-generator", name: "Password Generator" },
] as const;

type ToolSlug = (typeof tools)[number]["slug"];
type LocalEvent = {
  name: string;
  properties: Record<string, unknown>;
};

declare global {
  interface Window {
    utilityTest: {
      events: LocalEvent[];
      clipboard: string;
      denyClipboard: boolean;
      randomCalls: number;
      storageWrites: number;
    };
  }
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.utilityTest = {
      events: [],
      clipboard: "",
      denyClipboard: false,
      randomCalls: 0,
      storageWrites: 0,
    };
    window.addEventListener("avantic:analytics", (event) => {
      window.utilityTest.events.push((event as CustomEvent).detail);
    });

    // Exercise Clipboard API success/failure without writing any test output
    // to the host device's clipboard or persisting the generated secret.
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          if (window.utilityTest.denyClipboard) {
            throw new DOMException("Clipboard access denied", "NotAllowedError");
          }
          window.utilityTest.clipboard = value;
        },
      },
    });

    const randomValues = crypto.getRandomValues.bind(crypto);
    crypto.getRandomValues = <T extends ArrayBufferView>(array: T): T => {
      window.utilityTest.randomCalls += 1;
      return randomValues(array);
    };

    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      window.utilityTest.storageWrites += 1;
      return setItem.call(this, key, value);
    };
    const openDatabase = IDBFactory.prototype.open;
    IDBFactory.prototype.open = function (...args) {
      window.utilityTest.storageWrites += 1;
      return openDatabase.apply(this, args);
    };
    const cachePut = Cache.prototype.put;
    Cache.prototype.put = function (...args) {
      window.utilityTest.storageWrites += 1;
      return cachePut.apply(this, args);
    };
  });
});

test.afterEach(async ({ page }) => {
  // Clear DOM/clipboard values before any failure-context cleanup. Traces,
  // screenshots and videos are also disabled in the Playwright configuration.
  if (!page.isClosed()) {
    await page.evaluate(() => {
      document.querySelectorAll("textarea").forEach((field) => {
        field.value = "";
        field.textContent = "";
      });
      if (window.utilityTest) window.utilityTest.clipboard = "";
    });
  }
});

async function openTool(page: Page, slug: ToolSlug) {
  await page.goto(`/tools/${slug}`);
  // The effect proves hydration completed before events are exercised.
  await expect
    .poll(() =>
      page.evaluate(
        (id) =>
          window.utilityTest.events.some(
            (event) => event.name === "tool_viewed" && event.properties.tool_id === id,
          ),
        slug,
      ),
    )
    .toBe(true);
}

async function assertNoOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
}

async function generateQr(page: Page, value: string) {
  await page.getByLabel("Text or URL", { exact: true }).fill(value);
  await page.getByRole("button", { name: "Generate QR code", exact: true }).click();
  await expect(page.getByRole("img", { name: "Generated QR code for your text or URL" })).toBeVisible();
}

async function verifyCopiedValue(page: Page, outputId: string) {
  await page.getByRole("button", { name: "Copy output", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Copied to clipboard." })).toBeVisible();
  expect(
    await page.evaluate((id) => {
      const output = document.getElementById(id) as HTMLTextAreaElement;
      return output.value.length > 0 && window.utilityTest.clipboard === output.value;
    }, outputId),
  ).toBe(true);
}

test("all five utility routes are reachable from the Day-1 catalog", async ({ page }) => {
  for (const tool of tools) {
    await page.goto("/");
    const card = page.getByRole("article").filter({
      has: page.getByRole("heading", { name: tool.name, exact: true }),
    });
    await card.getByRole("link", { name: "Open tool" }).click();
    await expect(page).toHaveURL(new RegExp(`/tools/${tool.slug}$`));
    await expect(page.getByRole("heading", { name: tool.name, level: 1, exact: true })).toBeVisible();
    await assertNoOverflow(page);
  }
});

for (const slug of ["word-counter", "character-counter"] as const) {
  test(`${slug} handles empty, whitespace, Unicode, punctuation and pasted multiline text`, async ({ page }) => {
    await openTool(page, slug);
    const input = page.getByLabel("Your text", { exact: true });
    const counts = page.getByRole("status");
    const clear = page.getByRole("button", { name: "Clear text", exact: true });

    await expect(counts).toContainText("0 words");
    await expect(counts).toContainText("0 characters");
    await expect(clear).toBeDisabled();
    await input.fill(" \t\n");
    await expect(counts).toContainText("0 words");
    await expect(counts).toContainText("3 characters");

    await input.fill("");
    await input.focus();
    // Insert a whole multiline value in one browser input event, as paste does.
    await page.keyboard.insertText("cafe\u0301 👩🏽‍💻\nПривет");
    await expect(counts).toContainText("2 words");
    await expect(counts).toContainText("13 characters");
    await input.fill("don't re-enter 123...!?");
    await expect(counts).toContainText("4 words");
    await input.fill("👩🏽‍💻 🇬🇧 👨‍👩‍👧‍👦");
    await expect(counts).toContainText("0 words");
    await expect(counts).toContainText("5 characters");

    await clear.click();
    await expect(input).toBeEmpty();
    await expect(input).toBeFocused();
    await expect(counts).toContainText("0 characters");
  });
}

test("case conversion preserves input, supports all modes, copy and an accessible fallback", async ({ page }) => {
  await openTool(page, "case-converter");
  const input = page.getByLabel("Your text", { exact: true });
  const output = page.getByLabel("Converted text", { exact: true });
  const original = "  hELLO\tWÖRLD!\nélÈVE  ";
  await expect(page.getByRole("button", { name: "Copy output", exact: true })).toBeDisabled();
  await input.fill(original);

  for (const [mode, expected] of [
    ["lowercase", "  hello\twörld!\nélève  "],
    ["UPPERCASE", "  HELLO\tWÖRLD!\nÉLÈVE  "],
    ["Title Case", "  Hello\tWörld!\nÉlève  "],
    ["Sentence case", "  Hello\twörld!\nÉlève  "],
  ]) {
    await page.getByRole("radio", { name: mode, exact: true }).check();
    await expect(output).toHaveValue(expected);
    await expect(input).toHaveValue(original);
  }

  await verifyCopiedValue(page, "case-output");
  await page.evaluate(() => { window.utilityTest.denyClipboard = true; });
  await page.getByRole("button", { name: "Copy output", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Copy unavailable. Select the output and copy it manually.",
  );
  await output.focus();
  await page.keyboard.press("ControlOrMeta+A");
  expect(await output.evaluate((field: HTMLTextAreaElement) =>
    field.readOnly && field.selectionStart === 0 && field.selectionEnd === field.value.length,
  )).toBe(true);

  await page.getByRole("button", { name: "Clear text", exact: true }).click();
  await expect(input).toBeEmpty();
  await expect(output).toBeEmpty();
  await expect(input).toBeFocused();
});

test("case conversion and copy work using only the keyboard", async ({ page }) => {
  await openTool(page, "case-converter");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to tool" })).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Your text", { exact: true })).toBeFocused();
  await page.keyboard.insertText("keyboard example");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("radio", { name: "lowercase", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: "UPPERCASE", exact: true })).toBeChecked();
  await expect(page.getByLabel("Converted text", { exact: true })).toHaveValue("KEYBOARD EXAMPLE");
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Converted text", { exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Copy output", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toHaveText("Copied to clipboard.");
});

test("password options validate, guarantee selected classes, regenerate, copy and clear", async ({ page }) => {
  await openTool(page, "password-generator");
  const length = page.getByLabel("Password length", { exact: true });
  const generate = page.getByRole("button", { name: "Generate password", exact: true });
  const output = page.getByLabel("Generated password", { exact: true });
  await expect(output).toBeEmpty();
  await expect(page.getByRole("button", { name: "Copy output", exact: true })).toBeDisabled();

  for (const value of ["", "3", "129", "4.5"]) {
    await length.fill(value);
    await expect(length).toHaveAttribute("aria-invalid", "true");
    await expect(generate).toBeDisabled();
    await expect(page.getByRole("status").filter({ hasText: "Choose a whole-number length" })).toBeVisible();
  }

  await length.fill("4");
  await generate.click();
  expect(await output.evaluate((field: HTMLTextAreaElement) =>
    field.value.length === 4 && /[a-z]/.test(field.value) && /[A-Z]/.test(field.value) &&
    /[0-9]/.test(field.value) && /[^a-zA-Z0-9]/.test(field.value),
  )).toBe(true);

  await length.fill("32");
  await expect(output).toBeEmpty();
  await generate.click();
  const previousCalls = await page.evaluate(() => window.utilityTest.randomCalls);
  await generate.click();
  expect(await page.evaluate(() => window.utilityTest.randomCalls) > previousCalls).toBe(true);
  expect(await output.evaluate((field: HTMLTextAreaElement) => field.value.length === 32)).toBe(true);
  await verifyCopiedValue(page, "password-output");

  await page.getByRole("button", { name: "Clear password", exact: true }).click();
  await expect(output).toBeEmpty();
  await expect(page.getByRole("button", { name: "Copy output", exact: true })).toBeDisabled();
  await page.getByRole("checkbox", { name: "Lowercase (a–z)", exact: true }).uncheck();
  await page.getByRole("checkbox", { name: "Uppercase (A–Z)", exact: true }).uncheck();
  await page.getByRole("checkbox", { name: "Symbols (!@#…)", exact: true }).uncheck();
  const numbers = page.getByRole("checkbox", { name: "Numbers (0–9)", exact: true });
  await expect(numbers).toBeChecked();
  await expect(numbers).toBeDisabled();
  await length.fill("128");
  await generate.click();
  expect(await output.evaluate((field: HTMLTextAreaElement) => /^\d{128}$/.test(field.value))).toBe(true);
});

test("unavailable Web Crypto shows a generic accessible error without an output", async ({ page }) => {
  await openTool(page, "password-generator");
  await page.evaluate(() => {
    Object.defineProperty(crypto, "getRandomValues", { configurable: true, value: undefined });
  });
  await page.getByRole("button", { name: "Generate password", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Secure generation is unavailable" })).toHaveText(
    "Secure generation is unavailable in this browser. Try a current browser over HTTPS.",
  );
  await expect(page.getByLabel("Generated password", { exact: true })).toBeEmpty();
  await expect(page.getByRole("button", { name: "Copy output", exact: true })).toBeDisabled();
});

test("QR validation is local and its PNG download decodes to the exact Unicode payload", async ({ page }) => {
  await openTool(page, "qr-code-generator");
  const input = page.getByLabel("Text or URL", { exact: true });
  const generate = page.getByRole("button", { name: "Generate QR code", exact: true });
  const downloadButton = page.getByRole("button", { name: "Download PNG", exact: true });
  const alerts = page.getByRole("region", { name: "QR code generator", exact: true }).getByRole("alert");
  await expect(downloadButton).toBeDisabled();
  await generate.click();
  await expect(alerts).toHaveText("Enter text or a URL to generate a QR code.");
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await input.fill(" \n\t ");
  await generate.click();
  await expect(alerts).toHaveText("Enter text or a URL to generate a QR code.");

  for (const oversized of ["x".repeat(2_332), "💻".repeat(584)]) {
    await input.fill(oversized);
    await generate.click();
    await expect(alerts).toContainText("Use no more than 2,331 UTF-8 bytes.");
    await expect(downloadButton).toBeDisabled();
  }

  const payload = "  https://example.test/utility?text=café\n你好 👩🏽‍💻  ";
  await generateQr(page, payload);
  expect(await page.getByRole("img").evaluate((image: HTMLImageElement) =>
    image.src.startsWith("data:image/png;base64,") && image.naturalWidth > 0,
  )).toBe(true);
  const downloadPromise = page.waitForEvent("download");
  await downloadButton.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("avantic-qr-code.png");
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const png = PNG.sync.read(Buffer.concat(chunks));
  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  expect(decoded?.data === payload).toBe(true);
  await download.delete();

  await input.fill("changed input");
  await expect(page.getByRole("img")).toHaveCount(0);
  await expect(downloadButton).toBeDisabled();
});

for (const tool of tools) {
  test(`${tool.name} has no accessibility violations or horizontal overflow when populated`, async ({ page }) => {
    await openTool(page, tool.slug);
    if (tool.slug === "password-generator") {
      await page.getByLabel("Password length", { exact: true }).fill("128");
      await page.getByRole("button", { name: "Generate password", exact: true }).click();
    } else if (tool.slug === "qr-code-generator") {
      await generateQr(page, "https://example.test/" + "long-path/".repeat(20));
    } else {
      await page.getByLabel("Your text", { exact: true }).fill("Unicode café 👩🏽‍💻\n" + "longword".repeat(30));
    }

    await assertNoOverflow(page);
    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    // Include selectors and rule IDs, never element HTML or secret values.
    expect(accessibility.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      targets: violation.nodes.map((node) => node.target),
    }))).toEqual([]);
  });
}

test("private inputs, outputs and settings stay off network, console and storage; analytics are static", async ({ page }) => {
  const syntheticPrivateText = "private-e2e-café-👩🏽‍💻-content\nsecond line";

  for (const tool of tools) {
    await openTool(page, tool.slug);
    await page.waitForLoadState("networkidle");
    let requests = 0;
    let consoleEvents = 0;
    let sockets = 0;
    const observeRequest = () => { requests += 1; };
    const observeConsole = () => { consoleEvents += 1; };
    const observeSocket = () => { sockets += 1; };
    page.on("request", observeRequest);
    page.on("console", observeConsole);
    page.on("websocket", observeSocket);
    const baseline = await page.evaluate(() => ({
      local: JSON.stringify(localStorage),
      session: JSON.stringify(sessionStorage),
      cookies: document.cookie,
      writes: window.utilityTest.storageWrites,
    }));

    if (tool.slug === "password-generator") {
      await page.getByLabel("Password length", { exact: true }).fill("32");
      await page.getByRole("checkbox", { name: "Symbols (!@#…)", exact: true }).uncheck();
      await page.getByRole("button", { name: "Generate password", exact: true }).click();
      await verifyCopiedValue(page, "password-output");
    } else if (tool.slug === "qr-code-generator") {
      await generateQr(page, syntheticPrivateText);
      const downloadPromise = page.waitForEvent("download");
      await page.getByRole("button", { name: "Download PNG", exact: true }).click();
      await (await downloadPromise).delete();
    } else {
      await page.getByLabel("Your text", { exact: true }).fill(syntheticPrivateText);
      if (tool.slug === "case-converter") {
        await page.getByRole("radio", { name: "UPPERCASE", exact: true }).check();
        await verifyCopiedValue(page, "case-output");
      }
    }

    // Observe queued work as well as the synchronous interaction. This is an
    // intentional privacy-observation window, not a readiness workaround.
    await page.waitForTimeout(600);
    expect(requests).toBe(0);
    expect(consoleEvents).toBe(0);
    expect(sockets).toBe(0);
    expect(await page.evaluate((before) =>
      JSON.stringify(localStorage) === before.local &&
      JSON.stringify(sessionStorage) === before.session &&
      document.cookie === before.cookies &&
      window.utilityTest.storageWrites === before.writes,
    baseline)).toBe(true);

    const events = await page.evaluate(() => window.utilityTest.events);
    expect(events.some((event) => event.name === "tool_viewed")).toBe(true);
    expect(events.some((event) => event.name === "tool_completed")).toBe(true);
    for (const event of events) {
      expect(Object.keys(event).sort()).toEqual(["name", "properties"]);
      expect(["tool_viewed", "tool_completed"].includes(event.name)).toBe(true);
      expect(event.properties.tool_id === tool.slug).toBe(true);
      if (event.name === "tool_viewed") {
        expect(Object.keys(event.properties)).toEqual(["tool_id"]);
      } else {
        expect(Object.keys(event.properties).sort()).toEqual(["action", "tool_id"]);
        expect(["count", "convert", "generate", "copy", "download"].includes(String(event.properties.action))).toBe(true);
      }
    }

    page.off("request", observeRequest);
    page.off("console", observeConsole);
    page.off("websocket", observeSocket);
  }
});
