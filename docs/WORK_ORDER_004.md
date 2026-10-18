# Work Order 004: launch refinement

Authority: the Founder's full Work Order 004 and subsequent decisions, Founder UX critique, Master Design System v1.2, PRD, tested Work Order 003 architecture, AGENTS.md, engineering judgment.

Preserve the twelve workflows and approved warm off-white/charcoal/blue-gray identity. No new tools, AI products, accounts or server-side content processing.

## Production decisions

- Canonical project: **avantictools**, `prj_NJeADvuAPWxgtndznix13zjEeSkO`.
- Canonical origin: **https://avantictools.vercel.app**. The Founder explicitly chose the Vercel alias instead of custom DNS on 17 October 2026.
- `tools.avanticlabs.com` was already attached/verified, but Vercel reports missing external DNS. Leave it unchanged; custom-domain activation is not part of the revised request.
- Secondary project `avantic-tools`, `prj_csIltUuUdVDkVxI22B9DncnC7MRw`, also watches the repository. Do not delete, disconnect or promote it. Production review/deployment evidence uses the canonical project. Its duplicate deployment risk remains documented pending a separate retirement decision.
- Preview protection stays enabled; Preview must remain noindex. Never use the Preview host as a canonical origin.
- Work branch `ai/launch-readiness` starts from verified Work Order 003 commit `f4e8561`; PR #5 and its prerequisites were still unmerged at inspection. No direct main push or production promotion.

## UX and implementation decisions

- Search precedes featured workflows; task keywords remain entirely local. Arrow keys and ordinary Tab navigation work.
- Compact mobile catalog rows and horizontal category/Files rails preserve touch targets.
- Scan prioritizes capture on phones and uploads on larger screens, including DOM/focus order. Native capture is progressive enhancement; existing-file upload always works.
- Invoice has three independently expandable sections, retained local form state, a persistent total/action and desktop HTML preview. PDF generation and exact arithmetic remain the tested implementation.
- Use native CSS/Web Animations for short state transitions and page reflow. No motion dependency, continuous loop or gesture-only control. Reduced motion removes transitions and cancels page animations.
- About, Privacy and Terms describe the actual product without inventing entity, jurisdiction, certification or retention claims.
- No breadcrumbs added: these are shallow catalog/tool routes; the category navigation and connected Files rail provide orientation without duplicating the tool heading.
- No llms.txt: current semantic pages and sitemap already provide the maintained public description; a duplicate file adds no material user benefit.
- Long-term research remains in internal data/documentation. Only three near-term file tools appear publicly as Coming next.

## Official accounts

Founder supplied the exact URLs. Only ordinary external links are rendered, with new-tab labels and `rel="noopener noreferrer"`; no third-party embeds or automatic connections.

Eight public page requests succeeded. Instagram, X, GitHub, Facebook and WhatsApp Channel titles match the accounts. Telegram and WhatsApp Community load their invitation pages. Discord's invite API returned 404 (unknown invite), so Discord is withheld pending a replacement. YouTube requests are denied by this execution environment's network policy (CONNECT 403); do not misreport that as a broken account or successful verification.

## Pending assets

Both supplied original artworks are opaque JPEGs. The exact transparent original has been requested. Do not trace, redraw or invent an official vector. Favicon/app-icon derivatives continue to use the exact Founder-provided source.

## Follow-up audit decisions

- QR UI is split away from text/date tools. `pdf-lib` in the shared PDF adapter now loads on scan export or compression, instead of whenever a PDF workspace opens. PDF parsing/assembly still uses disposable workers; the PDF.js worker and invoice font are fetched only when needed.
- Browser source maps are disabled. The production-asset check removes only empty Turbopack map artifacts and fails the build if a nonempty public map appears. Server diagnostics remain intact.
- Optional Vercel feedback injection is disabled for all Preview branches on both linked projects using `VERCEL_PREVIEW_FEEDBACK_ENABLED=0`. Protection remains enabled.
- Desktop document preview has a focusable scroll region; every edit remains in memory. It is a layout preview, not a second PDF-generation pipeline.

The same origin is used for every canonical/social/sitemap URL. The secondary Vercel project is now also non-indexable when Vercel supplies its project ID; this reduces duplicate-publication risk without deleting or disconnecting either project.

Initial Lighthouse diagnostics exposed an invoice layout shift (CLS 0.533). The invoice width is now established in server-rendered markup, tool workspaces reserve the initial viewport area while interactive code loads, and the local Inter UI weights preload. Final isolated lab results recorded zero layout shift on Home, Word Counter and Invoice. A separate 26-route/viewport audit also recorded zero. These measurements do not establish field Core Web Vitals; see `docs/verification/004/README.md` for the full evidence and limits.

Category rail measurement is skipped on the unfiltered homepage; category routes position the active link horizontally without scrolling the page. Ordinary keyboard focus also scrolls links into view. All reorder actions retain explicit Move up/down controls; animation does not gate interaction.
