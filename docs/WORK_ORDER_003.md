# Work Order 003 — Productization and AVANTIC Files

The Founder’s goal dated 2026-10-17 overrides the earlier Day-1 scope and category
restrictions where they conflict. Exactly seven workflows are added to the five
tested utilities. No Developer Tools expansion or additional AI product is authorized.

## Authority and sources

1. Founder goal in this session, including the seven named workflows and privacy rules.
2. [Master Design System v1.2](https://docs.google.com/document/d/1YDBa7VRyJSsf5JXEFtim7K-EowKM476Z/edit).
3. [AVANTIC Tools PRD](https://docs.google.com/document/d/1MdAb8d1B8wjTpaa6nztAeBOo73IVxM42/edit), subject to the Founder’s roadmap override.
4. `AGENTS.md`, repository architecture, and tested Day-1 implementation.

The second accessible design-system copy (`1N_7FhmJ5nXubNM6AabA4_JEPi9AeZmrB`)
has identical content apart from whitespace. Use the v1.2 color tables, not the stale
v1.0 illustrative JSON snippet in section 27.2. Section 33.4 explicitly permits a
contrast-checked darker text variant of the Tools accent. The Founder’s categories
replace section 31.2.1’s old taxonomy; the remaining design-system foundations apply.

## Implementation boundaries

- All document, image, invoice and calculator processing stays in the browser.
- Shared AVANTIC Files infrastructure handles validation, image preparation, PDF
  rendering/export, resource limits and downloads. Related workflows share primitives.
- User files, filenames, invoice details, dates and output never enter analytics,
  application logs, storage or network payloads. Static application/worker/font assets
  may be loaded from the same origin, without user data in URLs or request bodies.
- Outputs are separate downloads; originals remain untouched. Unsupported formats,
  encrypted/corrupt PDFs, limits and failed target sizes receive actionable messages.
- PDF raster compression explicitly discloses that text selection, forms, links and
  digital signatures are not preserved. It is not presented as lossless compression.
- Receipts are merchant-entered records and never imitate payment verification,
  banking, POS or government documents.

## Completed source recovery

The Founder supplied sections 24–29, including the complete acceptance checklist,
and the canonical product artwork in `Screenshot_20260615-205712.jpg`. The original
art is preserved at `public/avantic-tools-logo.jpg`; identity derivatives must retain
the supplied geometry/colors and may only crop surrounding whitespace or resize.

## Branch

`ai/productization-files` starts from tested Day-1 commit
`8ad52a28f21da352c457adb3242600a6fead3451`. PRs #2 and #4 were still open at inspection.
