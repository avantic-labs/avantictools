# AVANTIC Tools

AVANTIC Tools — a product of AVANTIC LABS. Twelve browser-based workflows for
files, application images, writing, business documents and everyday calculations.

## Develop and verify

Use Node.js 22.13 or newer (PDF.js requires a current runtime).

```sh
npm ci
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

The browser suite starts the production build and covers eight viewport profiles.
Set `PLAYWRIGHT_BASE_URL` to test an accessible deployed Preview instead.
Traces, videos and automatic screenshots are disabled to avoid retaining inputs.
Use synthetic files for manual QA.

## Architecture and privacy

`data/tools.ts` is the public catalog. Static pages render on the server; focused
client workspaces load only the libraries they need. AVANTIC Files shares image
preparation, bounded PDF processing, validation, downloads and ephemeral handoffs.
PDF parsing/assembly runs in a disposable worker. PDF previews use a local PDF.js
worker. Invoice generation embeds a local font with Nigerian naira support.

No working content is uploaded or persisted. Product events cross an exact
runtime allowlist before the optional PostHog adapter. The adapter uses no
autocapture, replay, cookies, persistent ID or person profile, and stays inactive
unless its public production configuration is present.
PDF compression is explicitly lossy and flattens interactive content. Sales
receipts record merchant-entered details without claiming payment verification.

`npm ci`, `npm run dev` and `npm run build` prepare local worker/font assets;
no runtime CDN is required. Fonts retain their license in `assets/fonts/OFL.txt`.
The original Founder-supplied artwork is preserved in `public/avantic-tools-logo.jpg`.

## Product and deployment authority

Read [AGENTS.md](AGENTS.md), [Work Order 003](docs/WORK_ORDER_003.md) and the linked
approved sources before changing scope. Historical Day-1 architecture and research
remain in the repository; the current work order amends the public scope.

Work on implementation branches and review Vercel Previews before merge. Production
canonical URLs use the Founder-approved `https://avantictools.vercel.app` origin
in `lib/site.ts`. The canonical Vercel project is `avantictools`; see
[Work Order 005](docs/WORK_ORDER_005.md) for launch, CI and measurement rules.
Preview pages are marked noindex. A successful Preview is not production approval.
