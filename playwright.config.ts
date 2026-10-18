import { defineConfig, devices } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createHash, X509Certificate } from "node:crypto";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
// Trust only the configured environment proxy CA; do not disable TLS validation.
const caPath = process.env.PLAYWRIGHT_PROXY_CA_CERT;
const caPin = caPath
  ? createHash("sha256")
      .update(
        new X509Certificate(readFileSync(caPath)).publicKey.export({
          type: "spki",
          format: "der",
        }),
      )
      .digest("base64")
  : undefined;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  workers: 2,
  retries: 0,
  preserveOutput: "never",
  reporter: [["list"]],
  // Do not persist input, passwords or clipboard contents in traces/videos/screenshots.
  use: {
    baseURL,
    storageState: process.env.PLAYWRIGHT_STORAGE_STATE,
    launchOptions: caPin
      ? { args: [`--ignore-certificate-errors-spki-list=${caPin}`] }
      : undefined,
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  projects: [
    {
      name: "mobile-360",
      use: { ...devices["Pixel 7"], viewport: { width: 360, height: 800 } },
    },
    {
      name: "mobile-390",
      use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } },
    },
    {
      name: "small-mobile",
      use: { ...devices["Pixel 7"], viewport: { width: 320, height: 740 } },
    },
    {
      name: "tablet",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: "laptop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1024, height: 768 },
      },
    },
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 900 },
      },
    },
    {
      name: "wide-desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
      },
    },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run start -- --hostname 127.0.0.1",
        url: baseURL,
        reuseExistingServer: false,
        timeout: 30000,
      },
});
