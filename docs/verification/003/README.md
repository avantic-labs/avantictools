# Work Order 003 verification

Application implementation: `e9865d4` on `ai/productization-files`, based on the
tested Day-1 engine. No production branch was changed. Deployment status and
hosted-browser results are recorded in the implementation PR so the evidence
can refer to the final commit without a deployment-SHA self-reference.

## Automated evidence

- Lint: passes without warnings.
- Type checking: passes.
- Unit tests: **83 pass across 10 suites**.
- Production build: passes on Next.js 16.4.2 / Node.js 24; all meaningful catalog,
  category and tool pages are statically rendered.
- Browser suite: **192 pass** across the six profiles below on the production build.
- `npm audit --omit=dev`: **zero vulnerabilities** after updating the inherited
  Next.js version and compatible transitive dependencies.

| Profile | Viewport | Coverage |
| --- | --- | --- |
| Small mobile | 320 × 740 | All workflow, keyboard, accessibility, privacy and overflow tests |
| Large mobile | Pixel 7, 412 × 839 | Same; camera capture intent and upload fallback |
| Tablet | 768 × 1024 | Same |
| Laptop | 1024 × 768 | Same |
| Desktop | 1280 × 900 | Same |
| Wide desktop | 1920 × 1080 | Same |

These are browser/device emulation checks, not a claim of physical-camera testing.
The native `capture="environment"` input progressively uses a camera where the
browser supports it; the image-upload fallback is exercised in every profile.

## Acceptance evidence by workflow

| Requirement | Concrete checks |
| --- | --- |
| Word Counter, Character Counter | Existing Unicode, emoji, punctuation, whitespace, multiline, clear/focus regressions retained in `tests/e2e/utilities.spec.ts`; pure counting tests retained |
| Case Converter | Four modes, original preservation, keyboard-only conversion, clipboard success/denial and manual-copy fallback |
| QR Code Generator | Unicode payload round-trips through an independently decoded downloaded PNG; local limits/errors/clear tested |
| Password Generator | Secure randomness, selected character classes, option/length limits, regeneration, unavailable crypto, copy and clear; values are not logged |
| Scan to PDF | One and several images; JPEG/PNG/WebP; crop, keyboard corner movement, manual perspective correction, readability, rotate/reorder/delete, actual PDF page count/orientation, bad images, local handoff and object-URL cleanup |
| PDF Organizer | Several PDFs; previews; actual exported page widths prove ordering/removal; rotation checked in output bytes; corrupt/encrypted/51-page/41-MB inputs rejected; executable PDF actions removed |
| File Compressor | JPEG/PNG/WebP, all three presets, real downloadable output; all three PDF presets produce smaller valid output from a detailed embedded-image PDF; unsupported input and 21/41-MB limits; invalid replacement clears stale output |
| Application Photo & Signature Prep | Crop controls; exact dimensions; detailed-image target-KB compression; tight signature bounding box; JPG/PNG; impossible limits and invalid dimensions; custom units and proportional fit implementation reviewed |
| Invoice & Receipt Maker | Exact kobo arithmetic, quantities, multiple/long line items, discount then configurable tax, NGN formatting, dates, paginated PDF exports, merchant-record disclaimer and share; actual rendered glyphs/naira/Yoruba verified |
| Percentage calculator | Five jobs; zero division, zero, negative/invalid values, decimal behavior and limits |
| Age & Date calculator | Four jobs; leap years, month-end clamping, same dates, signed days, invalid dates, year limits and UTC calendar-day handling |

The browser suite also checks all public routes, unique titles/descriptions,
canonicals, truthful schema, sitemap, robots, icons, Open Graph image, search,
category browsing, seven non-navigational Coming Soon entries, and custom 404.

## Explicit final reviews

### Design review

Reviewed catalog, scan workspace/crop/output, invoice editing and search at all
six widths. The supplied logo geometry/colors remain unchanged; the original
lockup is preserved. The charcoal, Tools blue-gray and warm canvas follow the
approved sources. `#4B6570` is the contrast-safe functional accent variant allowed
by design-system section 33.4 (white text contrast about 6.18:1).

Fixed the mobile search icon's missing accessible name, file-picker truncation,
cramped page controls, helper text becoming control names, and modal centering.
Hosted visual review also caught a truncated invoice date on the narrowest phone;
invoice dates now stack on mobile so the full native date control stays readable.
Spacing/type/focus/state tokens are shared. The document preview remains the main
working surface; no decorative gradients, glows or animation choreography remain.

### Product review

The public registry contains exactly twelve usable workflows in the Founder's
five problem-oriented categories. AVANTIC Files shares validation, preparation,
PDF processing, downloads and local handoffs. Catalog and navigation search use
the same matching function. Available tools have working routes; Coming Soon
entries are status-only. AVANTIC LABS attribution appears in the shared footer.
No Developer Tools expansion, AI product, account flow or future file conversion
was added. Internal historical research and AI gateway contracts remain intact.

### Engineering review

Reviewed typed boundaries, state invalidation, concurrency locks, source-file
retention, canvas/bitmap cleanup, object URL revocation and handoff expiry. Scan
thumbnails are small generated images; originals are decoded sequentially. PDF
parsing/assembly uses a disposable worker with a 45-second deadline and isolated
third-party console suppression. Rendering has 30-second deadlines and worker
cleanup. Inputs are capped at 20-MB photos, 24 megapixels, 40-MB PDFs, 50 pages,
80-MB batches and 4-million-pixel output canvases, with actionable errors.

PDF/image/font libraries are loaded only where needed. Measured compressed script
transfer before any file selection: catalog **142,914 B**, Word Counter **155,615 B**,
percentage calculator **157,446 B**, PDF Organizer **339,446 B**. No PDF worker loads
on those initial views. See `script-transfer.json`; these are local production
measurements, not performance guarantees for a particular user's network/device.

PDF compression is explicitly raster/lossy; text selection, links, forms and
signatures are not preserved. Organizer copies visible page content and strips
interactive/executable actions and attachments. PNG compression discloses color
precision reduction. Impossible exact-dimension/KB requests fail without silently
changing requirements. No unofficial portal dimensions are claimed.

Visual rendering found a real variable-font subsetting defect in invoices. Replaced
it with official static Inter 4.1 and added `invoice-render.test.ts`, which checks
visible glyph outlines, not merely valid PDF bytes or extracted text. The exported
invoice image below was rendered from an actual browser download.

Final PDF review found that removing every dictionary key named `A` or `AA`
could also remove a valid font/image resource. Action removal now checks the
dictionary's role; a regression preserves both resource aliases and removes an
attachment annotation. Connected-workflow browser checks wait for the destination
route before using its controls. Handoff buttons show navigation progress.

Privacy checks observe requests, console, storage writes and local analytics.
Working contents/filenames never enter them; only fixed tool/action identifiers
are emitted. All processing, fonts and PDF workers use local or same-origin
assets. Web Share/clipboard/download require an explicit action. Vercel's optional
Preview/production feedback integration was disabled on both connected projects
after hosted QA identified its injected `vercel.live` request. Deployment protection
remains enabled. Test credentials stay outside Git and output artifacts are disabled.

Production dependency audit is clean. The full development audit retains the
upstream unpatched `braces` glob-parser advisory through Next's ESLint plugin
(five transitive package findings); it processes trusted lint configuration, has
no application/runtime input path, and was not replaced with an unvetted fork.

### Copy review

Reviewed every public page and major control, empty, validation, error, progress,
success, privacy and download state. Descriptions name the task directly.
Counting definitions retain the tested Day-1 semantics. Removed inactive malformed
prototype screens/components containing dead actions and old hype copy. Historical
research data remains internal. Receipts clearly state that merchant entries do
not represent independently verified payment.

## Visual evidence

Only empty workspaces and generated synthetic fixtures appear in these images.

- [Desktop catalog](catalog-desktop.png)
- [Mobile catalog](catalog-mobile.png)
- [Mobile scan/crop workspace](scan-mobile.png)
- [Small-mobile search](search-small-mobile.png)
- [Small-mobile invoice editor and full date controls](invoice-mobile.png)
- [Rendered synthetic invoice export](invoice-export.png)

## Reproduce

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

For a protected Preview, obtain an authorized temporary review link, initialize a
browser context through it, and keep its storage state outside the repository.
Set `PLAYWRIGHT_BASE_URL` and `PLAYWRIGHT_STORAGE_STATE` to run the same suite.
For an intercepting proxy, `PLAYWRIGHT_PROXY_CA_CERT` may point to its configured
public CA certificate. Chromium pins that CA’s public key; TLS validation is not
globally disabled, and the option changes no application setting.
Never commit/share the temporary review token or browser storage state.

## Approved favicon artwork

The Founder reattached the exact favicon-only JPEG. Its original bytes are preserved
at `assets/brand/avantic-tools-icon.jpg`. The asset preparation script crops only
surrounding whitespace and proportionally creates the 32px favicon, 180px Apple
icon and 512px app icon. The supplied colors and geometry are preserved.
Navigation and social artwork continue to use the approved product lockup.

The preserved source matches the uploaded JPEG byte-for-byte (SHA-256
`185e2152493d22051fe51707bf21e38ad44730faa4fea3b0d450632faead10b6`).
