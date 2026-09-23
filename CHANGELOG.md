# Changelog

## Unreleased

- 12 template packs, 72 pages (`assets/templates/`, catalog kind `templates`,
  `gallery/templates.html`): pitch, quarterly business review, strategy proposal,
  Japanese research talk, architecture review/postmortem, ML model report, lecture,
  editorial essay, impact report, product launch, project status and keynote, in English
  and Japanese. Each pack has its own art direction and scoped CSS; charts and diagrams
  are computed from one data array per page; all names and numbers are fictional and
  labelled as illustrative. The gallery index features them; `catalog.mjs` maps
  「テンプレート」 searches to them.
- Runtime: scaled slides render SVG text with `text-rendering:geometricPrecision`, which
  keeps Chromium from drawing labels at stale positions.
- Merged 36 reference guides into 9 (writing, authoring, evidence, design,
  motion, verification, repair, brand, working agreements). All rules, steps,
  commands, and code blocks preserved; SKILL.md routing table rewritten.
- Compressed the SKILL.md description for cheaper, more precise skill triggers.
- Documented host capability tiers (no-execution / stdlib-only / pip+Chromium /
  npm native) so limited environments skip QA steps honestly instead of faking them.
- `audit.py` now treats the git-tracked set as the distribution; `.git` and local
  caches no longer fail the audit, and MANIFEST regeneration works in a checkout.
- Added CI (Node 20/22 tests, Python unit tests, gallery and MANIFEST freshness).
- Declared the missing `lxml` dependency in `requirements.txt`.
- `gallery/*.html` documented as generated output; CI enforces a fresh build.
- Doc review: removed merge-editing notes and filler from guides; fixed dead paths
  and anchors; moved primary references to working agreements and maintainer
  evaluation methodology to `tests/EVALUATION.md`; trigger-oriented SKILL description.
- Docs now match code: `craft.mjs build --force` for rebuilds, `--allow-draft` in the
  smoke test and after `catalog take`, `data-motion`/`data-easing` presets, studio
  `chrome:false`/`reveal`/`build`, qa.py `--states` default and studio-deck scope,
  fontTools for `fontcheck.py`, native routes accept studio HTML only, logo `required`
  is not enforced.
- Fixed `render.mjs --states VALUE` passing the value twice, `font_audit.py` failing on
  `studio.mjs` HTML, and a clearer error when a craft build output already exists.
- `audit.py` checks markdown anchors, backticked repository paths and SKILL.md
  frontmatter.

## 3.4.0 — 2026-09-07

- Shared dependency-free structural CSS preflight in the build and rendered QA routes.
- Conservative solid-color contrast, mark paint, crop and text-stacking diagnostics;
  optional computed-style and original-image focal-region assertions. Complex paint
  remains explicitly unmeasured; warnings do not ban legitimate design choices.
- Source-table cell bindings preserve version, row/column identity, label, units and
  evaluation protocol; independent source inspection remains necessary.
- Read-only final HTML/review hash gate, loaded local asset fingerprints and explicit
  distinction between slide build states and custom widget-choice coverage.
- Source-first research explanations, semantic mechanism verification, original/crop
  comparison, bounded retrieval retries and honest unavailable-vision handoff.
- Positive/negative synthetic regressions and read-only checks of existing field decks;
  no user corpus/logs in the package, no new model-generation quality claim.
- Aligned README export examples with the files built in those examples; original gallery designs, player lifecycle,
  brand/template support and PDF/PPTX implementations are retained.

## 3.3.0 — 2026-09-07

- Content before rhetoric: explicit editorial pass, role-appropriate prose, density
  modes and deletion tests; no universal minimalist styling or AI-authorship classifier.
- Numeric units/signs/periods, paired statistics and missing-value helpers; independent
  evidence recomputation and declared diagram-edge semantics.
- Actual print-font inspection and reviewed selector contracts, post-print text/page
  integrity, atomic PDF replacement, separately installed pypdf dependency.
- New 24-page contrastive repair workshop, 3-page coherent measurement story and one
  parameterized cost comparison; original synthetic data, source and limitations.
- Advisory body-density, clipped-text and space-allocation review; current copy rules
  applied when inspecting older generated HTML; automated checks separated from approval.
- Dynamic gallery index counts; preserve private brand/POTX, keyboard equivalence,
  media lifecycle, reduced motion and bounded review output behavior.
- New unit/browser regressions and 12 unrun transfer-evaluation briefs. No new external
  model generation comparison or aesthetic score is claimed.


## 3.2.0 — 2026-09-06

- Separated audience copy, speaker notes, runbooks and source comments. Added shared
  source/runtime copy gates, exact quotation waivers and public HTML notes stripping.
- Fixed navigation after clicking a control; protected native widgets, IME and held
  keys; unified entry/state motion and corrected re-entry/overview lifecycle.
- Added whitespace/heading/SVG diagnostics without a decorative occupancy score;
  added region allocation, graph layering, label rails and routed-connector helpers.
- Added 24 diagrams, 16 motion mechanisms, 12 whole-page compositions and a two-page
  from-scratch graph/label stress example. Reworked new compositions after visual review.
- Added private PPTX style capture, approved brand tokens, six proof pages and real
  POTX/PPTX creation with six reusable native placeholder layouts.
- Expanded regression, real-key navigation and rendered-copy checks. Bounded review
  retention stays the default; no loose review PNGs enter the release.

## 3.1.0

Initial integrated distribution with original HTML authoring, 80 diagrams, 48 motion
studies, 24 interactive studies, 24 compositions, static and native export paths,
multilingual/image/research examples, local media/mesh support and bounded QA.
