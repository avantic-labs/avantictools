# Work Order 004 verification

Scope: refinement of the twelve verified workflows, with no tool expansion. Base: `f4e8561` on `ai/productization-files`. Implementation branch: `ai/launch-readiness`.

## Evidence map

| Area | Implementation / evidence |
| --- | --- |
| Discovery | Search directly follows intro; six example searches, keyboard result navigation, dialog focus and Escape covered in `launch.spec.ts` and `workflows.spec.ts`. Popular actions and truthful on-device/no-account line. |
| Mobile catalog | Compact rows, unchanged twelve-tool registry, horizontal category and Files rails. Eight viewports: 320, 360, 390, 412, 768, 1024, 1280, 1920px. |
| Connected workflows | Existing scan → organize → compress handoff and all file-processing regression tests retained. Camera-first DOM order on phones; upload-first on desktop. |
| Application prep | Portal dimensions/format/size requirements precede crop controls; concise instructions; crop, signature trim, target size and exports retain regression coverage. |
| Invoice | Three expandable sections preserve state; optional logo disclosure; persistent total/Create action; desktop live preview with keyboard-scrollable region; same exact-kobo calculation and PDF generation. |
| Motion | Native 180ms dialog/result entrance, state-specific control transitions, batched page reflow. Reduced-motion CSS disables transitions; reflow observes preference and cancels active animations. No motion package or continuous loop. |
| Content | About, Privacy and Terms comprehensively rewritten; no fabricated legal entity, jurisdiction, certification, retention period or contact address. Inline policy links visibly underlined. |
| Socials | Shared Founder-supplied URL registry in footer/About. Accessible new-tab labels, noopener/noreferrer, no embedded feeds. Discord withheld after API `404 / Unknown Invite / 10006`; YouTube availability remains externally blocked. |
| SEO | Shared metadata helper, unique page copy, fixed canonical origin, same-origin absolute OG/social images, WebSite plus truthful WebApplication schema, sitemap includes Terms, custom titled 404. No ratings/reviews or fabricated facts. |
| Hosting | Canonical `avantictools` project and Founder-approved `https://avantictools.vercel.app`; Preview and secondary-project indexing disabled. No domain purchase, DNS change, project deletion, main push or promotion. |
| Privacy | Local processing unchanged; no API uploads, persistence, remote analytics or session replay. Existing suites inspect unexpected requests, console, storage and allowlisted events. Optional Vercel feedback injection disabled across Preview branches on both projects. |
| Bundles | QR component separated; PDF creation import deferred until action; invoice generator/font and PDF.js worker remain demand-loaded. No motion dependency added. UI font weights preload locally with Unicode-range fallback for user text. |
| Source | Production browser maps disabled and checked after build; nonempty public maps fail the build. Empty unreferenced Turbopack maps removed. Unused framework SVG assets removed. Server diagnostics retained. |

## Visual baseline comparison

Recorded Work Order 003 full-page screenshots at 320/412px were 5,445/4,978px tall. The final Work Order 004 captures are 3,941/3,536px respectively: about **28%/29% shorter** despite additional footer links. Search starts at 347px/323px. The twelve-tool catalog itself is 1,783px/1,567px tall. All 24 home/scan/invoice captures across eight widths report no horizontal page overflow. Captures complement the automated checks.

## Reviews and repairs

### Design

Preserved charcoal, blue-gray, off-white, Inter and spacing tokens. Removed the decorative featured icon, roadmap labels and redundant marketing line. No gradients, glows, cursor effects, scroll choreography or new competing palette. Search border corrected after screenshot review. Mobile entries use compact rows while desktop retains breathing room. Header mark remains the exact supplied raster, pending the requested transparent original; do not claim that asset criterion complete.

### Product

Search and popular tasks are above featured workflows. Category names are not required to search. Coming next contains only three non-navigational file releases. Files navigation does not wrap. Invoice keeps user edits when sections close, exposes a total/action while editing and previews the document on desktop. Clear restores the initial section state. No accounting features, authentication or new utilities added.

### Engineering

Found and repaired a hidden category label causing page overflow, an unfocusable scrollable invoice preview, and policy links distinguishable only by color. Additional runtime review found `pdf-lib` loading when a PDF workspace opened; it now loads on the processing action. Initial Lighthouse exposed invoice CLS 0.533; reserved workspace space, established invoice width in server markup and preloaded the local UI font. The final isolated Lighthouse runs record CLS 0 on Home, Word Counter and Invoice; a separate 26-route/viewport audit also recorded zero. The new page animation batches layout reads, releases animations/listeners on update/unmount and honors reduced motion. Blob/canvas/worker cleanup remains the verified Work Order 003 implementation.

### Content

Reviewed homepage, registry descriptions, all tool controls/statuses, navigation, search, footer, 404, About, Privacy, Terms and metadata. Removed “Work from start to finish” and vague category prose. Error copy keeps actionable file-size/format guidance and never exposes input or stack traces. Native camera limitations are described with upload as the fallback. The existing receipt disclaimer remains explicit about merchant-entered records and no payment verification.

## Verification status

- Lint, type-check and production build pass after the font/layout changes; 83 unit tests passed before the final font preload (which does not change tool logic).
- The full local browser suite passed: 35 tests across eight profiles (280 cases). A later focused regression on layout, invoice, search and accessibility passed 32 cases at all eight widths. Hosted Preview rerun is pending.
- Final isolated Lighthouse results: Home 96 performance, Word Counter 99, Invoice 97; each scored 100 in accessibility, best practices and SEO. LCP: 2.78s, 2.20s and 2.69s. CLS: 0 on all three. A separate 26-page/viewport audit under 4x CPU recorded max CLS 0. These are lab measures, not field Core Web Vitals.
- Synthetic interaction sample under 4x CPU: catalog search max event 72ms, Word Counter with 3,000 initial words max 32ms. This is supporting evidence, not real-user INP.
- Initial JS transfer across six sampled routes: 146–159 KiB gzip. Word Counter and Age Calculator downloaded no PDF or invoice-generation runtime; none of the sampled routes did so before tool action. The same audit reported zero unexpected network requests and zero page errors.
- The final 24 visual captures report zero horizontal overflow. Production browser assets contain no `.map` files after the build check. The production dependency audit found zero known vulnerabilities.

Deployment and hosted Preview details are maintained in the PR description after the final push.

## Remaining external decisions / limitations

1. **Transparent approved logo:** only opaque JPEG originals are available. Requested the exact transparent PNG/SVG link; no auto-tracing, approximation or generative redraw performed. Existing approved favicon source is retained unchanged.
2. **Discord:** supplied invite fails the platform API with `Unknown Invite` (10006). Requested a current invite; omit it until verified.
3. **YouTube:** exact Founder URL is retained, but execution proxy blocks it (CONNECT 403) and the independent web fetch was throttled. Do not claim successful availability verification.
4. **WhatsApp Community:** link serves a generic invitation page; its destination cannot be independently identified through the available browser/proxy. Founder confirmation is pending.
5. **Native mobile camera / sharing:** browser tests exercise capture inputs and progressive share behavior with synthetic fixtures. They cannot certify an actual phone's OS permission dialogs or camera hardware.
6. **Core Web Vitals:** lab measurements and synthetic interactions are supporting evidence. No field-traffic dataset exists here, so do not claim real-user percentile compliance.

The duplicate Vercel project is intentionally not deleted or disconnected. Retirement would require separate Founder authority; code-level canonical/noindex configuration reduces divergence risk now.
