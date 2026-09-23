# Slide Studio 3.4

**An Agent Skill for authoring presentations, not filling a template.**

[![skills.sh](https://skills.sh/b/Aero123421/slide-studio)](https://skills.sh/Aero123421/slide-studio)

[日本語](README.ja.md) · [Agent entry](SKILL.md) · [Offline gallery](gallery/index.html) · [Verification](VERIFICATION.md)

### Install as an AI Skill

```sh
npx skills add Aero123421/slide-studio -g -y
```

Works with [80+ coding agents](https://github.com/vercel-labs/skills#supported-agents)
(Claude Code, Codex, Cursor, OpenCode, …). Browse on
[skills.sh](https://skills.sh/Aero123421/slide-studio).

Start with a question worth answering. Write the claims, design the whole canvas,
choose or invent a visual explanation, add interaction only when it improves
understanding, and inspect the rendered result. Reusable studies are editable raw
material; the agent may transform or ignore them.

## 3.4 — rendered integrity and source fidelity

- Structural CSS preflight now catches silent stylesheet damage at build and QA time.
- Rendered QA adds conservative contrast, invisible-mark, crop and stacking diagnostics.
  Optional assertions check computed styles, data-mark paint and essential focal regions.
- Table-cell checks bind source version, row, column, label, unit and evaluation protocol.
- A read-only final-review gate rejects changed HTML/recorded local assets and incomplete
  QA. Notes-stripped HTML is checked as its own deliverable.
- Research explanations, physical diagrams, every meaningful control choice, source
  image crops and bounded tool recovery now have concrete review steps.

Read [rendered integrity](references/verification-and-delivery.md) for exact boundaries.
Warnings are not style bans; gradients, expressive compositions and dense references
remain available. Automatic checks cannot authenticate sources or approve aesthetics.
Observed tests and untested areas are in [verification](VERIFICATION.md). No fresh
external-model generation batch or measured improvement in model output is claimed.

## Retained from 3.3 — field failures became explicit repair steps

Version 3.3 strengthened **copy, density, truthful diagrams and PDF typography**, rather
than asking the agent to imitate more decoration. A plausible headline is not evidence.
An automated rendering pass is not a design approval.

Read [editorial pass](references/writing-and-editing.md), [density and rhythm](references/writing-and-editing.md),
[numbers and diagram truth](references/evidence-and-diagrams.md), and
[PDF typography](references/verification-and-delivery.md) when relevant. The new material includes:

- **12 before/after pairs** ([repair lab](gallery/repair-lab.html)), with editable code
  and intentionally wrong BEFORE pages. These are teaching cases, not audience decks.
- A coherent [3-page measurement story](gallery/transfer-talk.html) and a
  [period-dependent comparison](gallery/period-comparison.html) whose headline, rank,
  marks and conditions update from the same calculated snapshot.
- `quant.mjs` and `evidence.py`: explicit units, periods, signs, paired observations,
  missingness and independent recomputation. These do not fact-check arbitrary prose.
- `semantic-graph.mjs`: declare edge meaning and reject a sequential chain of
  alternative outcomes. It does not know whether the source physics or geography is true.
- `font_audit.py`: inspect actual rendered DOM fonts, including hidden print pages.
  PDF output checks page count and recoverable text before replacing a destination.
- QA reports **automatedChecksPassed** separately from **deliveryApproved: false**.
  Advisory prose/density checks are review prompts, not a banned-word list or taste score.

The full workshop now has **295 pages**. No user task data, raw generation logs,
font binaries or private evaluation screenshots are in this distribution. The 12 new
transfer-evaluation briefs are **unrun future tests**, not measured model improvement.

## What is included

| Workshop | Editable studies | What changes |
|---|---:|---|
| Diagrams / geometry | 104 | Comparison, statistics, processes, topology, research schematics, illustration, geometric identity |
| Motion | 64 | Stable identities, timelines, paths, decomposition, masking, uncertainty, focus, state changes |
| Interaction | 24 | Actual recalculation, selection, tables, media playback, OBJ/STL mesh inspection, annotations |
| Whole-slide compositions | 36 | Image-led, typographic, geometric, editorial, quantitative and dense layouts |
| Template packs | 72 | Richly designed, practical page sets in English and Japanese — pitch, business review, strategy, research talk, architecture review, ML report, lecture, editorial, impact report, launch, project status and keynote. Charts are computed from each page's data; all content is synthetic |

Also included: multilingual and image-framing studies, a complete synthetic research
case, two from-scratch derivations (including label-length stress cases), a six-page
brand proof and real POTX template, optional native-editable PPTX scenes, source
catalog, copy guidance, art direction, typography/color/image/diagram/interaction
engineering guides, bounded QA, tests and privacy/rights checks. Read only the
references relevant to the current job; do not load the entire library into context.

### Install

Copy the **entire `slide-studio` folder** into the skill directory supported by your
agent. For example `.agents/skills/slide-studio/` or `.claude/skills/slide-studio/`.
See [portability](references/working-agreements.md) for scope and current primary references.
The host must have local file/code tools to execute production commands. A chat-only
model can read the instructions but cannot run tools it does not have.

No API key, telemetry, account or cloud service is required by the skill. Opening
bundled gallery HTML does not require installing dependencies. Installing optional
build dependencies does require the normal package downloads.

### Use with an agent

> Use slide-studio. Make a 12-minute research presentation from the supplied paper
> and data. Explain the method, uncertainty and limits. Choose the visual direction
> yourself. Use an interactive view only if it helps inspect the evidence. Deliver
> HTML and a readable static PDF, with source and provenance. Do not invent results.

Describe the audience, material and deliverables. There is no mandatory template
selection step. For a small edit, the agent should edit the relevant material rather
than demand a new brief, outline approval and design review ceremony.

### Build an original deck

```sh
node scripts/craft.mjs init ./presentation --language en
# Edit presentation/deck.mjs. Replace the draft; set draft:false when real.
node scripts/craft.mjs build ./presentation/deck.mjs --out ./presentation/deck.html
```

Node 20+ builds dependency-free self-contained HTML. The build never overwrites an
existing output silently; add `--force` when rebuilding the same file. Import helpers from the copied
`studio-kit.mjs`, or write plain HTML/CSS/SVG. The source module is **trusted code**,
not a sandbox for untrusted modules. See [authoring](references/authoring.md).

### Find material without committing to a template

Browse the [template packs](gallery/templates.html) for complete, practical page sets, or
search every study by communication job:

```sh
node scripts/catalog.mjs search "uncertainty comparison"
node scripts/catalog.mjs show error-bars
node scripts/catalog.mjs take error-bars ./interval-study
node scripts/craft.mjs build ./interval-study/deck.mjs --out ./interval-study/deck.html --allow-draft
```

Extraction deliberately produces a **draft**, strips known teaching wrappers and
retains teaching guidance in source/notes. Write real audience titles, labels and
evidence before clearing `draft:true`; this is not a one-command finished deck.
Each extracted study has source and modification guidance. Recompute quantities and
relationships when replacing examples with real content. The SVG source can be
inspected/derived with `scripts/svg-edit.py`. Do not merely change numeric labels.

### Keep audience copy separate from production notes

The source and browser checks detect high-confidence stage directions and placeholders.
They do not ban legitimate scientific terms or judge all prose. A real quotation can
use an exact, reasoned exception. Gallery mode is for actual workshop material, not
a shortcut around delivery checks. Read [copy channels](references/writing-and-editing.md).

Notes remain readable in ordinary HTML source. Create a shareable copy without them:

```sh
node scripts/craft.mjs build presentation/deck.mjs --out presentation/public.html --strip-notes
```

### Inspect without scattering PNGs

```sh
python -m venv .venv
# Activate the environment for your shell, then:
python -m pip install -r requirements.txt
python -m playwright install chromium
python scripts/qa.py presentation/deck.html --out presentation/.studio-review/current --states all --check
```

Default output is **one review HTML, one JSON report, and one ownership manifest**.
Screenshots are processed in memory. Reuse the same review path; modified or unowned
files are protected. `--keep failures --max-failures 6` retains a bounded number of
individual failure frames; `--keep all` is explicit. `--review-states` includes all
states in the same review HTML. Geometry checks do not certify design quality. Space diagnostics reveal large gaps,
small drawing bounds and line-break issues; they are not an occupancy target. Use
the [repair clinic](references/repair.md) rather than adding decorative filler.

For animated decks, also exercise actual input routes:

```sh
python scripts/qa-navigation.py presentation/deck.html --out presentation/navigation.json
python scripts/verify-review.py presentation/deck.html --report presentation/.studio-review/current/report.json
```

```sh
python scripts/clean.py presentation/.studio-review/current         # dry run
python scripts/clean.py presentation/.studio-review/current --apply
```

### Export

```sh
python scripts/export.py presentation/deck.html presentation/deck.pdf \
  --font-contract presentation/fonts.json --require-font-contract
python scripts/export.py presentation/deck.html presentation/deck.pptx
# Native editable route, not the screenshot route:
npm install
node scripts/studio.mjs build assets/examples/technical.json --out presentation/native.html
node scripts/export-pptx.mjs presentation/native.html presentation/native.pptx --mode editable
```

HTML supports interaction and motion. PDF and screenshot PPTX are static. Native
PPTX keeps supported text/shapes editable but **does not translate CSS/WAAPI into
PowerPoint animations**. A picture-per-slide PPTX is not native editability. See
[format contracts](references/verification-and-delivery.md). OBJ/STL is mesh inspection, not STEP/CAD
editing. GLB/model-viewer is an optional documented integration, not bundled support.

### Reuse a company identity or build a native template

```sh
python scripts/brand-capture.py reference.pptx --out private-brand
node scripts/brand.mjs proof private-brand/brand.json --out private-brand/proof.html --allow-draft
# Review the observations against authorized references; approve only actual rules.
python scripts/brand-template.py private-brand/brand.json --out company-template.potx
```

The capture is local and omits slide text, notes, media and source filenames. Its
output is a **draft proposal**, not automatic brand approval. Keep the kit in the
private project. HTML can use approved brand tokens without freezing composition.
The native route produces six named placeholder layouts. It is not a perfect import
of every original master, embedded font or animation. See [brand guide](references/brand.md).
A fictional example is in `assets/brands/example.json` and `gallery/brand.html`.

### Verify and extend

```sh
node --test tests/*.test.mjs
python -m unittest discover -s tests -p 'test_*.py'
python tests/browser.py
python tests/navigation.py
python tests/rendered_review.py
python tests/field_browser.py
python tests/integrity_browser.py
node scripts/build-gallery.mjs
node scripts/build-examples.mjs
node scripts/build-repair-lab.mjs
node scripts/build-index.mjs
python scripts/audit.py .
```

A constrained browser environment can use `SLIDE_STUDIO_INLINE=1` for **already
self-contained** HTML instead of file navigation. This is explicit in the report.
Linux can use `SLIDE_STUDIO_CHROMIUM` for an approved existing Chromium executable.
Commands never need to assume the author's home path. Do not bypass host policy.
On macOS, the safety suite can use `TMPDIR=/private/tmp` to avoid the system `/var`
symlink; review output itself deliberately rejects symlink traversal.

Tests exercise software behavior, not a guarantee of artistic quality or equal
results across AI models. No external-agent benchmark is claimed. The evaluation
briefs in `tests/agent-evals.json` support reproducible future model comparisons.

## Structure

`SKILL.md` is the compact entry point. `references/` holds progressive craft and
engineering guides. `assets/` contains editable material and the local runtime.
`gallery/` contains built demonstrations. `examples/` contains complete worked
projects. `scripts/` handles building, inspection, exports and safe review outputs.
`tests/` holds software regressions and agent evaluation tasks.

## License and scope

Original source and instructional material: MIT. The two public photographs have
separate CC0/public-domain provenance in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
No font files, accounts, personal details or user project data are bundled. Local
font availability affects typography; review the intended presentation machine.
A fixed-aspect presentation can be scaled for smaller screens, but a small phone
is not an adequate substitute for a readable mobile handout.

## Upgrade from 3.1 / 3.2

Back up project-local/private brand kits and authored decks. Replace the installed
skill folder, not the user project. Previously built HTML contains the old player:
**rebuild HTML from source** to receive the focus/keyboard fix; replacing SKILL.md
alone cannot update a standalone deck. Re-run copy and navigation checks before
sharing. Existing extracted classroom slides may now be correctly rejected as
audience-ready; author the missing content instead of bypassing the draft gate.

A ready-to-inspect fictional native template is included at [`assets/brands/example.potx`](assets/brands/example.potx). Its
starter text is deliberately placeholder text, not a finished audience deck.

### PDF delivery with explicit font choices

Choose available families before typesetting. Observe actual print usage, then create
a reviewed project-local contract; do not whitelist every fallback automatically.

```sh
python scripts/font_audit.py presentation/deck.html > presentation/font-observations.json
# Create presentation/fonts.json as documented in references/verification-and-delivery.md.
python scripts/export.py presentation/deck.html presentation/deck.pdf \
  --font-contract presentation/fonts.json --require-font-contract
```

The PDF postflight uses separately installed pypdf (BSD-3-Clause); the dependency is
not vendored. This check is order-independent text coverage, not shaping certification.
Render and inspect the PDF, especially complex scripts, math and dense tables.
Previously exported PDFs are not repaired by updating the skill: rebuild and export.
