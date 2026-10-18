<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AVANTIC Tools — AI Worker Operating Rules

This repository is the production codebase for AVANTIC Tools. AI coding agents may implement, test, refactor, and review code, but they must not silently change product strategy or locked architecture.

## Authority order
1. Approved AVANTIC Tools product/engineering documents.
2. This `AGENTS.md`.
3. Existing code only where it does not conflict with 1 or 2.
4. Agent preference.

If existing prototype code conflicts with approved Day-1 scope, the approved documents win.

## Current work order: 005 production evidence

Work Order 005 freezes subjective redesign and feature expansion. Preserve the
twelve verified workflows and visual system. Launch, measure, observe, form a
hypothesis, then make the smallest evidence-supported change. See
`docs/WORK_ORDER_005.md` and `docs/EVIDENCE_BACKLOG.md`. Production remains
`https://avantictools.vercel.app`; do not activate custom DNS or modify/delete
the duplicate Vercel project.

All analytics must cross the typed runtime allowlist in `lib/analytics`. Use
explicit product events only. Never add autocapture, session replay, heatmaps,
fingerprinting, persistent user profiles or advertising identifiers. Never send
raw search phrases, entered text, file contents or names, passwords, QR payloads,
photos, signatures, personal dates, invoice/customer/payment details, raw errors
or stack traces. Traffic attribution accepts only the documented campaign enums.
PostHog is isolated behind the adapter; provider calls do not belong in product
components.

## Work Order 003 Founder amendment

The Founder’s Work Order 003 explicitly supersedes the historical Day-1 scope
and information architecture below. Current authority is: the Founder’s goal,
Master Design System v1.2, product PRD, these repository rules, tested Day-1 code,
then engineering judgment. See `docs/WORK_ORDER_003.md` for sources and decisions.

Ship exactly twelve usable workflows in `data/tools.ts`: the five deterministic
utilities and Scan to PDF, PDF Organizer, File Compressor, Application Photo &
Signature Prep, Invoice & Receipt Maker, Percentage & Discount Calculator, and
Age & Date Calculator. Use the five problem-oriented categories in that registry.
Do not build JSON/Base64/UUID, Developer Tools expansion, AI products, auth or AVA.
Preserve internal research without exposing unfinished tools in the catalog.

Process files, images, invoices and dates locally. Never log, store or transmit
user content or filenames through analytics or network requests. Only fixed
allowlisted tool/action events are permitted. Share/download require an explicit
user action. Keep heavy file libraries lazy and release temporary resources.
Use the supplied canonical logo, charcoal, blue-gray accent and warm off-white.
Receipts are merchant-entered records, never independently verified payment proof.

## Historical Day-1 scope (amended by Work Order 003)

Ship exactly these seven Day-1 surfaces:
- AI Detector + Humanizer connected workflow.
- AI Readiness Audit.
- Word Counter.
- Character Counter.
- Case Converter.
- QR Code Generator.
- Password Generator.

Do not add Phase-2 surfaces, AVA-facing features, social tools, developer tools, Startup Toolkit features, or unrelated experiments unless a later work order explicitly changes scope.

## Day-1 information architecture
Only categories with live tools render. Day 1 therefore exposes:
- AI Tools: Detector + Humanizer, AI Readiness Audit.
- Productivity & Utility Tools: the five deterministic utilities.

Startup & Business, Developer, and Social Media remain hidden until populated in a later phase.

## Core product rules
- Anonymous by default. No Day-1 route may require login.
- Audit email capture is a lead field, not account creation.
- Utilities are client-side only; no API route for the five deterministic utilities.
- Password generation must never send generated passwords over the network.
- Detector output is categorical with uncertainty explanation, never a bare precision percentage.
- Humanizer copy is clarity/naturalness/flow/voice oriented; do not market it as detection evasion.
- Detector + Humanizer is an iterative connected workflow, not two unrelated pages.
- Audit result CTA is classification-driven through configuration, not hardcoded UI copy.

## Architecture
Primary app stack:
- Next.js on Vercel.
- Supabase for Postgres/Auth/Storage. Auth is provisioned but not required for Day 1.
- PostHog is the analytics system of record.
- Resend handles Audit report email delivery.
- Arcjet protects AI-calling routes.

Shared data model begins with:
- `tool_registry`
- `artifacts`
- `cta_config`

Shared AI gateway exposes capability-oriented branches:
- `generate()` for generation/rewrite/report work.
- `detect()` for AI-detection work.

Do not scatter direct provider SDK calls across routes. Provider changes must remain internal to the gateway.

Current product-runtime provider decision:
- Generation: Anthropic/Claude.
- Detection: specialized detector provider after benchmark selection.

This runtime provider choice is separate from the coding agent used to build the repository.

## Analytics event authority
The Work Order 005 event dictionary in `docs/WORK_ORDER_005.md` supersedes the
historical Day-1 list. Event names and properties are closed runtime allowlists.
Do not introduce an arbitrary property bag or a raw `search_query` event.

## API boundaries
Planned routes:
- `POST /api/detect`
- `POST /api/humanize`
- `POST /api/audit/submit`
- `GET /api/audit/[share_token]`

Do not invent unresolved product decisions silently. When an implementation choice is genuinely open, isolate it behind a small interface/configuration and document the decision in the PR.

## Deployment workflow
Vercel is the primary deployment platform.
- Work on branches.
- Every non-main branch should produce a Vercel preview.
- Do not treat preview success as production approval.
- `main` is the production branch.
- Never commit secrets, `.env` files, credentials, tokens, or private keys.

## Engineering quality bar
Before requesting merge:
- `npm run build` passes.
- Lint passes.
- Type errors are zero.
- Add tests for business logic and critical workflows as they are introduced.
- Verify client-only tools do not make unintended network requests.
- Keep components reusable; Day-1 shared patterns should not be duplicated per tool.
- Prefer explicit typed boundaries over hidden coupling.

## Scope escalation rule
If a requested implementation would contradict a locked rule above, stop that part of the implementation and surface the conflict in the PR instead of quietly overriding the product decision.
