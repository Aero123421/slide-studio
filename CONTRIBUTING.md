# Contributing

Keep the compact SKILL entry and progressive reference structure. Contributions must
include editable source, a real explanatory purpose, semantic invariants, useful
static output, provenance and a regression test where behavior changes. A new color
variant is not a new capability. Test keyboard use, reverse navigation, re-entry,
reset, reduced motion, missing assets and the delivered export.

Never commit personal project data, credentials, local home paths, generated QA
frames, node_modules, virtual environments or font binaries. Run the audit and tests.
`gallery/*.html` is generated from `assets/` and `examples/` via
`npm run build:galleries`; do not hand-edit it. `MANIFEST.json` is generated via
`python scripts/audit.py . --manifest`; refresh it after touching release files.
CI fails when either differs from a fresh build.
Rights for borrowed media must be clear; do not silently relicense an upstream asset.
No telemetry or external service should become required without explicit design review.

For agent evaluation, follow [tests/EVALUATION.md](tests/EVALUATION.md). Record model/version, actual prompt, tool availability,
source material, edits, outcomes and limitations. Do not report unrun evaluations as
passes. Taste improvements should be demonstrated by concrete before/after evidence,
not only a numerical score. Keep review files outside the release by default.
