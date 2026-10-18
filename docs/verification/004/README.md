# Work Order 004 verification

Scope: refinement of the twelve verified workflows, with no tool expansion. PR #6 base: `ai/day1-utility-engine` (`40cf00b`, which merged PR #5). Merge base: `f4e8561`. Implementation branch: `ai/launch-readiness`. Retargeting from `ai/productization-files` produces the identical diff; no history rewrite was needed.

## Evidence map

| Area | Implementation / evidence |
| --- | --- |
| Discovery | Search directly follows intro; six example searches, keyboard result navigation, dialog focus and Escape covered in `launch.spec.ts` and `workflows.spec.ts`. Popular actions and truthful on-device/no-account line. |
| Mobile catalog | Compact rows, unchanged twelve-tool registry, horizontal category and Files rails. Eight viewports: 320, 360, 390, 412, 768, 1024, 1280, 1920px. Short file workspaces reserve only the space needed while loading; Invoice keeps its larger reservation. |
| Connected workflows | Existing scan → organize → compress handoff and all file-processing regression tests retained. Camera-first DOM order on phones; upload-first on desktop. |
| Application prep | Portal dimensions/format/size requirements precede crop controls; concise instructions; crop, signature trim, target size and exports retain regression coverage. |
| Invoice | Three expandable sections preserve state; optional logo disclosure; persistent total/Create action; desktop live preview with keyboard-scrollable region; same exact-kobo calculation and PDF generation. |
| Motion | Native 180ms dialog/result entrance, state-specific control transitions, batched page reflow. The hero canvas is transparent, absolute and non-intercepting, with clear foreground text areas and no separate illustration space. Mobile uses 24 dots; larger screens use 56. Offscreen/hidden loops stop; reduced motion draws once. No motion package. |
| Content | About, Privacy and Terms comprehensively rewritten; no fabricated legal entity, jurisdiction, certification, retention period or contact address. Inline policy links visibly underlined. |
| Socials | Shared Founder-supplied URL registry in footer/About. Accessible new-tab labels, noopener/noreferrer, no embedded feeds. Discord withheld after API `404 / Unknown Invite / 10006`; YouTube availability remains externally blocked. |
| SEO | Shared metadata helper, unique page copy, fixed canonical origin, same-origin absolute OG/social images, WebSite plus truthful WebApplication schema, sitemap includes Terms, custom titled 404. No ratings/reviews or fabricated facts. |
| Hosting | Canonical `avantictools` project and Founder-approved `https://avantictools.vercel.app`; Preview and secondary-project indexing disabled. No domain purchase, DNS change, project deletion, main push or promotion. |
| Privacy | Local processing unchanged; no API uploads, persistence, remote analytics or session replay. Existing suites inspect unexpected requests, console, storage and allowlisted events. Optional Vercel feedback injection disabled across Preview branches on both projects. |
| Bundles | QR component separated; PDF creation import deferred until action; invoice generator/font and PDF.js worker remain demand-loaded. No motion dependency added. UI font weights preload locally; unsupported glyphs use a device font without a later font request during typing. |
| Source | Production browser maps disabled and checked after build; nonempty public maps fail the build. Empty unreferenced Turbopack maps removed. Unused framework SVG assets removed. Server diagnostics retained. |
| Build policy | Exact `unrs-resolver@1.11.1` postinstall explicitly denied, not approved. Isolated clean npm 12 install resolves a module using the optional native binding. Unsupported inherited `cache-dir` setting is documented as a managed-environment warning. |
| CI | GitHub API reports zero Actions workflows; PR checks are Vercel builds only. Tests recorded here are manually run evidence. The minimal recommended read-only PR workflow and merge gate are documented in `docs/WORK_ORDER_004.md`; no Work Order 005 implementation added. |

## Visual baseline comparison

Recorded Work Order 003 full-page homepage screenshots at 320/412px were 5,445/4,978px tall. The initial Work Order 004 captures were 3,941/3,536px respectively: about **28%/29% shorter** despite additional footer links. The twelve-tool catalog itself is 1,783px/1,567px tall. The final ambient-hero correction puts search at 344px on 320px screens and 328px on 360/390px screens, removing the intervening illustration block. Scan to PDF captures are 1,396px at 320px and 1,285px at 390px, with related actions immediately after the workspace instead of a large blank loading reservation. Captures complement the automated overflow checks.

## Reviews and repairs

### Design

Preserved charcoal, blue-gray, off-white, Inter and spacing tokens. Removed the decorative featured icon, roadmap labels and redundant marketing line. No gradients, glows, cursor trails, scroll choreography or competing palette. Search border and small-phone hint corrected after screenshot review. Mobile entries use compact rows while desktop retains breathing room. The hero's ambient dots share the canvas and remain behind clear foreground text areas, without a dark box or layout block. Header mark remains the exact supplied proportional raster; an approved transparent original is optional Founder polish.

### Product

Search and popular tasks are above featured workflows. Category names are not required to search. Coming next contains only three non-navigational file releases. Files navigation does not wrap. Invoice keeps user edits when sections close, exposes a total/action while editing and previews the document on desktop. Clear restores the initial section state. No accounting features, authentication or new utilities added.

### Engineering

Found and repaired a hidden category label causing page overflow, an unfocusable scrollable invoice preview, and policy links distinguishable only by color. Additional runtime review found `pdf-lib` loading when a PDF workspace opened; it now loads on the processing action. Initial Lighthouse exposed invoice CLS 0.533; reserved workspace space, established invoice width in server markup and preloaded the local UI font. Final isolated Lighthouse runs record CLS 0 on Home, Word Counter and Invoice. After reducing excessive empty space on short tools, a separate 26-route/viewport audit recorded max CLS 0.046 (Age & Date at 390px), still within the good threshold. Hosted privacy tests then caught a static Inter font request triggered by Unicode input. Removing the redundant downloadable fallback makes unsupported glyphs use the device font; the strict zero-request test passes in all eight local profiles. The new page animation batches layout reads, releases animations/listeners on update/unmount and honors reduced motion. Blob/canvas/worker cleanup remains the verified Work Order 003 implementation.

### Content

Reviewed homepage, registry descriptions, all tool controls/statuses, navigation, search, footer, 404, About, Privacy, Terms and metadata. Removed “Work from start to finish” and vague category prose. Error copy keeps actionable file-size/format guidance and never exposes input or stack traces. Native camera limitations are described with upload as the fallback. The existing receipt disclaimer remains explicit about merchant-entered records and no payment verification.

## Verification status

- Closeout lint, type-check, all 83 unit tests and the default production Turbopack build pass. The asset check reports no production browser source maps. The earlier sandbox worker port-binding restriction is avoided by running the build with the permitted network execution context; no compiler/configuration workaround is needed.
- The full closeout local browser suite passed: 36 tests across eight profiles (**288 cases**, 5.1 minutes). This covers all twelve tools, export/failure paths, axe accessibility, keyboard navigation, metadata, links and strict no-request privacy assertions. Ambient-motion coverage verifies a transparent non-intercepting layer, compact search placement, live mobile/desktop motion, offscreen pause and a static reduced-motion frame. Deployment-specific URL/SHA and the final hosted rerun are recorded in PR #6.
- Final isolated Lighthouse results after the font fix: Home 96 and Word Counter 97 performance. A three-page run measured Invoice at 88, while three isolated repeats measured 98, 97 and 99, showing lab main-thread variance; the median repeat is 98. Accessibility, best practices and SEO scored 100 for all three pages. CLS: 0 on all three. A separate 26-page/viewport audit under 4x CPU recorded max CLS 0.046. These are lab measures, not field Core Web Vitals.
- Closeout homepage Lighthouse: **96 performance**, **100 accessibility**, **100 best practices**, **100 SEO**; LCP 2.75s, TBT 31.5ms and CLS 0 under the standard simulated mobile profile. The performance score matches the previous homepage baseline. This is a lab sample, not a field Core Web Vitals claim.
- Synthetic interaction sample under 4x CPU: catalog search max event 72ms, Word Counter with 3,000 initial words max 32ms. This is supporting evidence, not real-user INP.
- Closeout initial JS across six sampled routes: **144–156 KiB gzip** (147,501–159,479 bytes). Word Counter and Age Calculator downloaded no PDF or invoice-generation runtime; none of the sampled routes did so before tool action. The same audit reported zero unexpected network requests and zero page errors. The small canvas module remains homepage-only.
- Local homepage screenshots at 320, 360, 390, 768, 1280 and 1920px report zero overflow and zero page errors. The real Preview review covers all eight homepage widths and each required page; deployment-specific results are maintained in the PR. Production browser assets contain no `.map` files after the build check. The closeout production dependency audit reports zero known vulnerabilities. Raw summary measurements are in [closeout-metrics.json](closeout-metrics.json).

Deployment and hosted Preview details are maintained in the PR description after the final push.

## Non-blocking limitations

1. **Transparent approved logo:** only opaque JPEG originals are available. Per the closeout decision, a transparent PNG/SVG is optional Founder refinement, not a launch gate. No auto-tracing, approximation or generative redraw; approved favicon source retained.
2. **Discord:** deliberately omitted after the invalid invite response. Founder explicitly permits launch without it; add only a future valid Founder-provided invitation.
3. **YouTube:** exact approved URL retained; execution proxy blocks it with CONNECT 403. This is a verification limit, not evidence of a broken account or a launch gate.
4. **WhatsApp Community:** replacement approved URL `https://chat.whatsapp.com/JUjGTFjloUI1vT3vKbUTHu` returns HTTP 200. Its generic invitation page does not independently prove account identity; Founder authorization establishes the intended link.
5. **Native mobile camera / sharing:** browser tests exercise capture inputs and progressive share behavior with synthetic fixtures. They cannot certify an actual phone's OS permission dialogs or camera hardware.
6. **Core Web Vitals:** lab measurements and synthetic interactions are supporting evidence. No field-traffic dataset exists here, so do not claim real-user percentile compliance.
7. **Managed npm setting:** `cache-dir` is an unsupported inherited build-environment setting, absent from repository configuration and project environment keys. The current npm warning is harmless; an upstream environment correction is needed before a future npm major stops accepting it. The reviewed `unrs-resolver` script is explicitly denied, with no blind script approvals. See `docs/WORK_ORDER_004.md` for evidence and rationale.
8. **CI enforcement:** there are no GitHub Actions workflows; Vercel automatically builds but does not enforce this manually run test suite. Add the documented minimal read-only test workflow and required check before the eventual main merge. No deployment secrets are needed for that workflow.

The duplicate Vercel project is intentionally not deleted or disconnected. Retirement would require separate Founder authority; code-level canonical/noindex configuration reduces divergence risk now.
