# Work Order 005: production launch and evidence loop

## Operating model

AVANTIC Tools now follows: launch → measure → observe → identify friction → form
a hypothesis → test the smallest useful change. The twelve-tool scope and the
Work Order 004 design are frozen unless the Founder explicitly changes strategy.
Product changes are not described as data-driven without recorded evidence.

Production origin: `https://avantictools.vercel.app`  
Canonical Vercel project: `avantictools`  
Production branch: `main`

No custom domain is configured. The duplicate `avantic-tools` Vercel project is
outside this work order and must not be promoted, modified or deleted.

## Launch architecture

Next.js renders the catalog and policy surfaces. Each tool uses a focused Client
Component and processes content locally. GitHub's Vercel integration creates
Preview deployments for branches and deploys `main` to the canonical project.
GitHub Actions independently runs repository checks without deployment secrets.

The integration order is `#6 → #4 → #2 → main`. After every stacked merge, the
next pull request must be re-evaluated against its updated head. Failed checks or
conflicts stop integration.

## Analytics architecture

```text
product interaction
  → typed helper
  → exact runtime event/property allowlist
  → in-memory event bus
  → provider adapter
  → PostHog capture endpoint (only when configured)
```

`lib/analytics/events.ts` is the privacy boundary. It rejects unknown event
names, unknown enum values and extra properties. Components never call PostHog.
The adapter uses an ephemeral random identifier held only in memory, disables
person profiles, omits credentials/referrer data, and creates no analytics
cookie or browser-storage record. Autocapture, replay and heatmaps are absent.

The canonical Vercel project had no production analytics variables during
implementation. Transport therefore remains inactive until the Founder creates
a PostHog project and configures both public deployment variables:

- `NEXT_PUBLIC_POSTHOG_KEY`: the public `phc_…` project key.
- `NEXT_PUBLIC_POSTHOG_HOST`: exactly `https://us.i.posthog.com` or
  `https://eu.i.posthog.com`, matching the selected project region.

These are public ingestion settings, not secret administrative credentials.
After configuration, redeploy and inspect synthetic request payloads before
promoting. Do not add a personal PostHog API key to browser code.

## Event dictionary

| Event | Allowed properties | Meaning |
| --- | --- | --- |
| `page_view` | fixed page ID, optional tool/category, device class, viewport category, allowlisted attribution | A public route rendered. |
| `tool_viewed` | `tool_id`, `category` | A tool workspace opened. |
| `tool_started` | `tool_id` | The first meaningful action in that workspace visit. |
| `tool_completed` | `tool_id`, fixed `completion_action` | The tool produced a meaningful result. |
| `tool_error` | `tool_id`, fixed `error_code` | A known safe error class occurred. |
| `search_opened` | none | A search control received deliberate use. |
| `search_used` | result-count bucket | A non-empty search settled; no query is sent. |
| `search_result_selected` | `tool_id`, 1-based result position | A search result was chosen. |
| `popular_action_selected` | `tool_id` | A homepage popular action was chosen. |
| `category_selected` | `category` | A category link was chosen. |
| `workflow_handoff` | `from_tool`, `to_tool` | A local AVANTIC Files handoff was chosen. |
| `download_completed` | `tool_id`, fixed output type | A browser download was started. |
| `share_started` | `tool_id`, fixed output type | The system share sheet was opened. |
| `web_vital` | `LCP`/`INP`/`CLS`, standard rating, fixed page/tool ID | Coarse field-performance evidence. |

Completion actions are `count`, `convert`, `generate`, `copy`, `process` and
`calculate`. Safe error codes are `unsupported_format`, `file_too_large`,
`too_many_pages`, `corrupted_file`, `encrypted_pdf`, `memory_limit`,
`camera_unavailable`, `share_unavailable`, `export_failed`, `invalid_input` and
`browser_unsupported`.

No event accepts text, filenames, bytes, URLs, dates, dimensions, amounts, file
metadata, raw errors, stack traces or arbitrary properties.

## Traffic attribution

Only these values are accepted:

- source: `instagram`, `x`, `youtube`, `facebook`, `telegram`, `whatsapp`,
  `github`, `avantic`
- medium: `social`, `community`, `organic`, `referral`
- campaign: `tools_launch`

Unknown values and all other query parameters are ignored. Attribution remains
in memory for the current page session. Example:

```text
https://avantictools.vercel.app/?utm_source=instagram&utm_medium=social&utm_campaign=tools_launch
```

## Funnels

- Discovery: landing → discovery action → tool viewed → tool started → tool completed.
- Search: search opened → search used → result selected → tool started → tool completed.
- AVANTIC Files: Scan to PDF → PDF Organizer → File Compressor handoffs.
- Invoice: tool viewed → editing started → document generated → PDF downloaded/shared.
- Application prep: tool viewed → image processing started → preparation completed → output downloaded/shared.

Funnels describe possible paths, not required journeys.

## Metric definitions

- Tool views, starts and completions: counts of their explicit events.
- Tool completion rate: unique eligible starts followed by a completion, divided by starts, within the chosen analysis window.
- Tool error rate: safe error events divided by starts for the same tool/window.
- Search usage rate: sessions with `search_used` divided by landing sessions.
- Search result selection rate: `search_result_selected` divided by `search_used`.
- No-result search rate: `search_used` with bucket `none` divided by all `search_used`.
- Popular-action selection: count and share by allowlisted tool ID.
- Workflow handoff rate: handoff events divided by source-tool completions.
- Downloads and shares: counts by tool and fixed output type.
- Traffic source: allowlisted source/medium/campaign on the entry page view.
- Device/viewport: coarse classes attached to page views; no user-agent fingerprint.
- Field performance: share of coarse LCP, INP and CLS ratings. Lab results remain separately labelled.

Small samples must be labelled. Page views alone are not a product success metric.

## Privacy guarantees

Tool content and outputs remain local. Analytics cannot receive raw searches,
files or filenames, entered text, clipboard values, QR payloads, generated
passwords, photos, signatures, dates, invoice/customer/payment details, exact
dimensions or raw errors. No authentication, advertising ID, fingerprint,
persistent profile, session recording, heatmap or analytics cookie is added.

## CI strategy

`.github/workflows/ci.yml` runs on pull requests and pushes to `main` with read-only
repository permission. One job performs `npm ci`, lint, type-check, unit tests,
production build, the production source-map guard, and Chromium Playwright tests
on representative 390px mobile and desktop profiles. The complete eight-profile
matrix remains a release/major-work-order check because it is materially more
expensive. CI never deploys and requires no Vercel or PostHog secrets.

The connected GitHub token cannot read or change branch-protection settings
(`403 Resource not accessible by integration`). Until a repository administrator
makes `CI / verify` a required check for `main`, the release operator must enforce
the green check before every merge.

## Production launch checklist

1. Confirm the integration tree and all pull requests are conflict-free.
2. Require green CI and Vercel checks for the exact head SHA.
3. Confirm Privacy matches the actual analytics configuration.
4. Merge the approved stack in order; never force through failure.
5. Confirm the canonical `avantictools` production deployment is READY.
6. Smoke-test all twelve tools, policies, 404, metadata and social links.
7. Confirm production is indexable and Preview deployments remain noindex.
8. Check browser console, network requests, payload allowlists and source-map URLs.
9. Record the production SHA and deployment URL.

## Evidence review

Record observations in `docs/EVIDENCE_BACKLOG.md`. Every proposed change names
the evidence, confidence, smallest intervention and success metric. Review
operational health after 24 hours, initial product behavior after seven days,
and patterns after 30 days when volume is adequate. Obvious bugs, privacy leaks,
security issues and severe accessibility/performance regressions are fixed
immediately without waiting for statistical evidence.

## Known limitations and Founder actions

- A Founder-owned PostHog project/key is required to activate transport.
- A repository administrator must make `CI / verify` a required `main` check if
  GitHub plan/repository settings permit it.
- Search Console and Bing submission require Founder-controlled accounts; no
  account is created by this work order.
- Field Core Web Vitals are not claims until real traffic produces a sufficient sample.
