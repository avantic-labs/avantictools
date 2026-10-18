# Work Order 004: launch refinement

Authority: the Founder's full Work Order 004 and subsequent decisions, Founder UX critique, Master Design System v1.2, PRD, tested Work Order 003 architecture, AGENTS.md, engineering judgment.

Preserve the twelve workflows and approved warm off-white/charcoal/blue-gray identity. No new tools, AI products, accounts or server-side content processing.

## Production decisions

- Canonical project: **avantictools**, `prj_NJeADvuAPWxgtndznix13zjEeSkO`.
- Canonical origin: **https://avantictools.vercel.app**. The Founder explicitly chose the Vercel alias instead of custom DNS on 17 October 2026.
- No custom domain or subdomain is intended for this launch. Existing domain attachments are not production-origin decisions. Do not configure DNS, redirects or domains, or modify either Vercel project's settings during closeout.
- Secondary project `avantic-tools`, `prj_csIltUuUdVDkVxI22B9DncnC7MRw`, also watches the repository. Do not delete, disconnect or promote it. Production review/deployment evidence uses the canonical project. Its duplicate deployment risk remains documented pending a separate retirement decision.
- Preview protection stays enabled; Preview must remain noindex. Never use the Preview host as a canonical origin.
- Work branch `ai/launch-readiness` starts from verified Work Order 003 commit `f4e8561`. PR #5 was merged into `ai/day1-utility-engine` at `40cf00b`; PR #6 now targets that branch. The merge base remains `f4e8561`, so the retarget preserves the Work Order 004-only diff without rewriting history. No direct main push, automatic merge or production promotion.
- Founder review/merge order for the existing stack: PR #6 into `ai/day1-utility-engine`, then PR #4 into `ai/foundation-bootstrap`, then PR #2 into `main`. Revalidate the integrated head and add the recommended CI gate before the final main merge. PR #5 is already merged. Each merge remains a Founder action.

## UX and implementation decisions

- Search precedes featured workflows; task keywords remain entirely local. Arrow keys and ordinary Tab navigation work.
- Compact mobile catalog rows and horizontal category/Files rails preserve touch targets.
- Scan prioritizes capture on phones and uploads on larger screens, including DOM/focus order. Native capture is progressive enhancement; existing-file upload always works.
- Invoice has three independently expandable sections, retained local form state, a persistent total/action and desktop HTML preview. PDF generation and exact arithmetic remain the tested implementation.
- Use native CSS/Web Animations for short state transitions and page reflow. The homepage's transparent ambient canvas occupies no layout space, excludes foreground text, and cannot intercept pointers. It draws 24 dots at up to 25fps on narrow phones and 56 dots at up to 30fps elsewhere, caps pixel density, pauses offscreen/hidden, and renders a static reduced-motion frame. Fine-pointer repulsion settles with a small spring; touch users receive the same ambient drift without hover. No motion dependency or gesture-only control.
- About, Privacy and Terms describe the actual product without inventing entity, jurisdiction, certification or retention claims.
- No breadcrumbs added: these are shallow catalog/tool routes; the category navigation and connected Files rail provide orientation without duplicating the tool heading.
- No llms.txt: current semantic pages and sitemap already provide the maintained public description; a duplicate file adds no material user benefit.
- Long-term research remains in internal data/documentation. Only three near-term file tools appear publicly as Coming next.

## Official accounts

Founder supplied the exact URLs. Only ordinary external links are rendered, with new-tab labels and `rel="noopener noreferrer"`; no third-party embeds or automatic connections.

The shared registry uses the Founder's eight approved URLs, including the replacement WhatsApp Community invitation `https://chat.whatsapp.com/JUjGTFjloUI1vT3vKbUTHu`. Instagram, X, GitHub, Facebook, Telegram, WhatsApp Community and WhatsApp Channel return HTTP 200 during closeout. An invitation landing page does not independently establish the account's identity. YouTube is denied by the execution proxy (CONNECT 403); retain the approved URL and document that limit. Discord remains omitted after its invalid-invite response; it is not a launch blocker.

## Pending assets

Both supplied original artworks are opaque JPEGs; there is no exact approved transparent source in the repository. Keep the proportionally cropped raster integrated with the existing canvas. A transparent PNG/SVG is an optional Founder refinement, not a launch blocker. Do not trace, redraw or invent an official vector. Favicon/app-icon derivatives continue to use the exact Founder-provided source.

## Build warnings and CI

- `Unknown env config "cache-dir"`: npm identifies this as inherited environment configuration. Neither repository files nor the read-only Vercel project environment-key list define it. It is a managed build-environment warning, currently ignored by npm, rather than an application error. Leave it documented instead of suppressing warnings globally, replacing the install command, or changing project settings. The managed environment should remove/replace this unsupported setting before a future npm major makes it an error.
- `unrs-resolver@1.11.1` reaches the project through `eslint-config-next` → `eslint-import-resolver-typescript`. Its `napi-postinstall ... check` script can fetch/install a fallback native binding if the optional platform package is missing. The exact version is explicitly denied in `package.json#allowScripts`; no third-party script was enabled. A clean npm 12 install in an isolated fixture resolves a module successfully with this denial and its normal optional native binding. `npm install-scripts ls --json` reports no unreviewed scripts in the application tree.
- GitHub's workflow API reports zero Actions workflows. The PR currently receives Vercel build checks, which do not enforce lint, units or E2E. Codex's verification evidence is manually run, not CI enforcement. Before the final main merge, the smallest recommended addition is one read-only PR workflow using reviewed pinned checkout/setup actions, Node 24 and a reviewed npm version, `npm ci`, lint, type-check, units, build/source-map check, Chromium installation and the existing Playwright suite against the local production server. It needs no deployment credentials. Require that check through branch protection separately. No CI platform or Work Order 005 implementation is added in this closeout.

## Follow-up audit decisions

- QR UI is split away from text/date tools. `pdf-lib` in the shared PDF adapter now loads on scan export or compression, instead of whenever a PDF workspace opens. PDF parsing/assembly still uses disposable workers; the PDF.js worker and invoice font are fetched only when needed.
- Browser source maps are disabled. The production-asset check removes only empty Turbopack map artifacts and fails the build if a nonempty public map appears. Server diagnostics remain intact.
- Optional Vercel feedback injection is disabled for all Preview branches on both linked projects using `VERCEL_PREVIEW_FEEDBACK_ENABLED=0`. Protection remains enabled.
- Desktop document preview has a focusable scroll region; every edit remains in memory. It is a layout preview, not a second PDF-generation pipeline.

The same origin is used for every canonical/social/sitemap URL. The secondary Vercel project is now also non-indexable when Vercel supplies its project ID; this reduces duplicate-publication risk without deleting or disconnecting either project.

Initial Lighthouse diagnostics exposed an invoice layout shift (CLS 0.533). The invoice width is now established in server-rendered markup, tool workspaces reserve measured space while interactive code loads, and the local Inter UI weights preload. Unsupported glyphs use the device font so typing private content never triggers a font fetch. Final isolated lab results recorded zero layout shift on Home, Word Counter and Invoice. A separate 26-route/viewport audit recorded max CLS 0.046 after shortening the file workspaces. These measurements do not establish field Core Web Vitals; see `docs/verification/004/README.md` for the full evidence and limits.

Category rail measurement is skipped on the unfiltered homepage; category routes position the active link horizontally without scrolling the page. Ordinary keyboard focus also scrolls links into view. All reorder actions retain explicit Move up/down controls; animation does not gate interaction.
