# AVANTIC Tools — Day-1 Architecture

This document translates the approved AVANTIC Tools planning documents into repository-level implementation guidance. It does not replace the source-of-truth product documents.

## Scope

Day 1 ships seven surfaces:

1. AI Detector + Humanizer connected workflow
2. AI Readiness Audit
3. Word Counter
4. Character Counter
5. Case Converter
6. QR Code Generator
7. Password Generator

Only the AI Tools and Productivity & Utility Tools categories render at launch. Startup & Business, Developer, and Social Media stay hidden until a later phase contains live tools.

## System shape

```text
Browser / Next.js
├── deterministic utilities (client only)
├── Detector + Humanizer workflow
│   ├── POST /api/detect
│   └── POST /api/humanize
└── AI Readiness Audit
    ├── POST /api/audit/submit
    └── GET /api/audit/[share_token]

Vercel Functions
└── AI gateway
    ├── generate()
    └── detect()

Supabase
├── tool_registry
├── artifacts
├── cta_config
├── Auth (provisioned; not required Day 1)
└── Storage (provisioned/deferred until file-upload needs exist)

PostHog → product analytics
Resend → Audit report email delivery
Arcjet → AI-route abuse protection
```

## Database boundaries

### `tool_registry`
Catalog and phase-aware visibility.

Expected fields from the approved architecture:
- `id`
- `slug`
- `name`
- `category`
- `workflow_type`
- `status`
- `route`
- `description`

### `artifacts`
Generic structured artifact model. Day 1 uses it for Audit reports only.

Expected fields:
- `id`
- `type`
- `email` (nullable lead capture, not an auth foreign key)
- `source_tool_id`
- `payload` (`jsonb`)
- `classification`
- `classification_signals` (`jsonb`, nullable)
- `share_token`
- `created_at`

### `cta_config`
Classification-driven ecosystem next step.

Expected fields:
- `classification_key`
- `next_step_sentence`
- `destination_type`
- `destination_url`
- `active`

Initial classifications:
- `foundation_gap`
- `automation_gap`

## AI gateway

Provider SDKs must be isolated behind capability branches.

```ts
generate(input, options) -> generation result
detect(input, options) -> categorical detection result
```

Current runtime decisions:
- Generation: Anthropic/Claude.
- Detection: specialized provider selected after benchmark.

The implementation must not make route handlers depend directly on a vendor-specific SDK response shape.

## Authentication boundary

Day 1 is anonymous-first.
- No launch route requires a signed-in session.
- Supabase Auth may exist in infrastructure but must not add user friction to launch workflows.
- Audit email is stored as lead-capture data, not as an account reference.

## Analytics contract

Canonical event names:
- `tool_viewed`
- `tool_completed`
- `workflow_step_completed`
- `workflow_completed`
- `audit_submitted`
- `audit_abandoned`
- `cta_clicked`
- `artifact_shared`
- `search_query`
- `cross_tool_navigation`
- `ai_cost`

All AI gateway calls emit `ai_cost`.

## Day-1 build sequencing

```text
Foundation
├── Utilities
├── Humanizer → detector benchmark → Detector → connected workflow
└── Audit

All three tracks converge at Phase-1 public release.
```

Foundation blocks the rest and includes shared components, tables, analytics plumbing, gateway boundaries, and Vercel deployment setup.

## Explicitly open implementation decisions

These must be resolved deliberately rather than silently guessed:
- API request/response field naming conventions.
- Exact Arcjet rate-limit thresholds.
- Detector max input, language coverage, timeouts and error taxonomy.
- Humanizer change explanation/diff and style controls.
- Audit questionnaire schema.
- Audit classification rule set.
- Audit streaming mechanism.
- Audit abandonment event mechanism.
- Shared-report CTA freshness policy.
- Share-token expiration and abuse protection.

The Audit questionnaire schema, classification logic, and streaming mechanism directly block final implementation of `POST /api/audit/submit`.

## Deployment policy

Vercel is primary hosting/deployment.
- Feature branches → Preview deployments.
- `main` → Production.
- Preview success is required before merge, but is not itself product approval.
- Secrets belong in Vercel environment variables or the relevant provider secret store, never Git.
