---
name: slide-studio
description: "Author, redesign and QA presentations as self-contained HTML with PDF and PowerPoint export: claims and copy, whole-slide composition, data-driven charts and diagrams (built-in figure engine), purposeful animation, presenter view, color systems and company brand templates. Use when asked to create, rewrite, redesign, fix or review slides, a deck, talk, pitch, lecture, report or research presentation (スライド, プレゼン, 発表資料, 資料作成), in any language. Designs from the content instead of filling a fixed layout."
metadata:
  version: "4.0.0"
---

# Slide Studio

You are the author, editor, designer and production engineer of the deck. Deliver
the files, not a plan. Library studies and templates are material to adapt; a blank
canvas is fine. More words, effects or decoration are not quality.

**Priority order:** true claims → language the audience can use → a composition you
can read at a glance → coherent visual system → motion and interaction → verified
delivery. A beautiful false claim is worse than a plain true one.

## What "done" looks like

- Each page answers one question. When a page reports a finding, the headline *is*
  the finding, specific and scoped ("Valley took 25% of Q3 orders"), not a topic label.
- Every number traces to data and is computed once; headline, chart and table read
  the same object. Units, denominators, periods and uncertainty are on the page.
- The evidence is the largest thing on the page and is drawn at the size it is shown.
  Text ≥ 18 px for live talks, ≥ 15 px anywhere; nothing overlaps, clips or overflows.
- One accent per page, and it means "this". Everything else is ink, muted or context grey.
- Japanese pages read as native Japanese: phrase-level line breaks (the engine wraps SVG
  text by phrase; in HTML put `<br>` at the phrase boundary of headlines), numbers kept
  with their units, no English eyebrows, and ▲ never used for an increase.
- Motion explains a change; the final build is the complete page for PDF.
- You have **looked at every rendered page** (contact sheet + full-size frames) and
  fixed what you saw. Scripts find defects; they never approve a deck.

## Workflow

**0 · Read, then ask a few short questions.** Read the request and the material.
Then ask once, in at most six multiple-choice questions, only what is still open:
where the deck is used (spoken / read / both), the files to hand over (HTML, PDF,
editable or picture PowerPoint), whether the presenter advances with keys only, a
template pack or the company template or from scratch, the look, and the writing
style — each with your recommendation first and "up to you". Each answer selects a
route, a pack, a color system and rules: [Intake](references/intake.md). Skip the
questions when told to proceed, when nobody can answer, or for edits to an existing
deck; then use your recommendations and say which you chose.

**1 · Set up a project** (never edit the installed skill), with the chosen language
and color system — or `catalog.mjs take tpl-…` for a template pack, or `studio.mjs init`
for editable PowerPoint:
```sh
node "$SKILL_DIR/scripts/craft.mjs" init ./deck --language en --colors laboratory
```
It copies the figure engine, layout/number helpers, the page grammar (`theme.css`)
with one color system, a draft `deck.mjs` and `brief.md`. `SKILL_DIR` is this file's
folder. Fill `brief.md`: the intake answers and defaults, audience and what they know,
the question or decision, language, length. Decide everything else yourself; ask
again only when a wrong guess would change correctness or touch private material.

**2 · Claim outline.** Write the page titles as a sequence of claims and read them
in order. Cut pages that repeat; add the missing step. Keep facts, inferences,
proposals and illustrative data distinct (`observed / reported / inferred /
proposed / illustrative`). Read [Writing and editing](references/writing-and-editing.md) §1 and §4.

**3 · Evidence.** Put data in arrays at the top of `deck.mjs`; derive every displayed
number from them. For decision-critical numbers write `evidence.json` and run
`evidence.py`. Decide what each arrow, line or connector means before drawing it.
Read [Evidence and diagrams](references/evidence-and-diagrams.md) when numbers or relations matter.

**4 · Prototype two pages** — the hardest evidence page and one contrasting page.
Build, render, look, fix. Only then multiply the system.

**5 · Build the deck.** Use the figure engine for every chart and relationship
diagram; use the page grammar for composition; take a library study when one fits.

**6 · Add behavior only where it explains** (builds, transitions, widgets).

**7 · Review loop** (repeat until clean): build → QA → look → fix.

**8 · Deliver** HTML (+ notes-stripped copy), PDF/PPTX if asked, editable source, a
short verification summary. Details: [Verification and delivery](references/verification-and-delivery.md).

## Figures: compute, don't draw

`figure.mjs` returns finished SVG from data — axes with nice ticks, direct labels,
highlight-vs-context color, callouts that keep inside the frame, optional builds.
Full API: [Figures](references/figures.md).

```js
import { barChart, lineChart, flowDiagram, fmt } from './figure.mjs';
const top = [...orders].sort((a, b) => b.value - a.value)[0];
const chart = barChart({ id: 'orders', title: 'Orders by region', desc: `${top.label} leads.`,
  width: 1152, height: 470, data: orders, sort: 'desc', highlight: top.label, unit: 'Orders, thousands' });
```

| The page asks… | Use |
|---|---|
| Which is biggest / how do items rank? | `barChart` (sorted, highlight), `lollipopChart`, `dotPlot` |
| What changed between two moments or conditions? | `dumbbellChart`, `slopeChart`, `divergingBarChart` |
| How did it move over time? | `lineChart` (end labels, bands, refLines), `smallMultiples`, `areaChart` |
| What adds up to the total? | `waterfallChart` (validated totals), `stackedBarChart`, `waffleChart`, `unitChart` |
| How is it distributed / how uncertain? | `histogram`, `boxPlot`, `violinPlot`, `stripPlot`, `ecdfChart`, `errorBarChart`, `forestPlot` |
| Are two things related? | `scatterPlot` (fit + 95% band), `heatmap` |
| How good is the model? | `confusionMatrix`, `rocCurve`, `prCurve`, `calibrationChart`, `learningCurve`, `residualPlot` |
| How does the process / system work? | `flowDiagram` (layers, lanes, boundaries, feedback), `sequenceDiagram`, `treeDiagram`, `layerDiagram`, `networkDiagram`, `cycleDiagram` |
| When does what happen? | `ganttChart`, `timelineChart` (true time spacing) |
| Where does each option fall against two criteria? | `quadrantChart` (data units with a threshold, or judgments — say which), `matrixDiagram` |
| Continuous field / physics | `contourPlot`, `vectorField`, `streamlines` |

Draw at display size (`width`/`height` = the region), give every figure `title` and
`desc`, and pass `highlight` for the one thing the headline names. For anything
the catalogue lacks, compose with the engine's scales and primitives — never
hand-place data coordinates.

## Page grammar and color

`theme.css` (from `assets/runtime/study-frame.css`) gives a page vocabulary on the
1280×720 canvas: `st-head` (claim, 36–40 px), `st-dek` (one condition line),
`st-fig` (evidence region 1152×~470), `st-rail` + `st-kpi`/`st-text` (a 312 px
commentary rail; layouts `st--rail`, `st--left`), `st-num` (one big number),
`st-source` (provenance), `st--full` (full bleed). Use it, extend it, or replace it;
choose the composition from the content — finding, picture, mechanism, comparison
or table — not from habit.

Color comes from one role-based system: a brand's tokens or one of 37 systems in
`assets/color-systems/` (`gallery/color-systems.html`). Put `cs-<id>` on the slide;
figures read the same `--ss-*` tokens. Text is ink and muted ink; the accent marks
the one thing; categorical colors live on data marks only. See
[Visual design](references/visual-design.md) for type, space, images and repair.

## Motion and presentation

Builds: `data-step="n"` + `data-motion` (`reveal lift rise slide settle zoom blur
grow-x grow-y wipe wipe-up draw count focus`), `data-delay`, `data-stagger` on a
parent, `data-easing` (`standard emphasized decelerate accelerate smooth linear`).
Transformations: `data-states` maps build → CSS (same element moves; compute both
geometries from data). Slide transitions: `transition: 'fade'|'rise'|'push'|'zoom'`
on the deck or a slide. The player gives presenters a **presenter window (P)**
with notes, timer and next-build preview, black screen (B), overview (O),
number + Enter to jump, swipe, fullscreen (F) and a shortcut sheet (?).
Rules and widget lifecycle: [Motion and interaction](references/motion-and-interaction.md).

Motion must explain what changes, keep identity, never loop, respect reduced
motion, and end on a complete page. An accurate still beats an unrelated animation.

## Library

```sh
node "$SKILL_DIR/scripts/catalog.mjs" search "paired change" --limit 4     # Japanese queries work too
node "$SKILL_DIR/scripts/catalog.mjs" take dumbbell ./deck/study-dumbbell   # source + engine + its color system
node "$SKILL_DIR/scripts/catalog.mjs" take tpl-strategy ./deck               # a whole template pack as one draft deck
```
104 diagram studies, 64 motion studies, 24 interactions, 36 compositions and 72
template pages (12 packs: pitch, QBR, strategy, research (ja), architecture, ML
report, lecture, editorial, impact report, launch, project status, keynote), all
data-driven. Browse `gallery/index.html`. Replace data, names and copy; never ship
a study as-is. Search by the explanation you need, not by a look.

## Review loop

```sh
node "$SKILL_DIR/scripts/craft.mjs" build ./deck/deck.mjs --out ./deck/deck.html --force
python "$SKILL_DIR/scripts/qa.py" ./deck/deck.html --out ./deck/.studio-review/current --states all
python "$SKILL_DIR/scripts/qa-summary.py" ./deck/.studio-review/current/report.json
python "$SKILL_DIR/scripts/contact-sheet.py" ./deck/deck.html --out ./deck/.studio-review/sheet.png --final --label
python "$SKILL_DIR/scripts/contact-sheet.py" ./deck/deck.html --out ./deck/.studio-review/steps.png --steps   # motion
python "$SKILL_DIR/scripts/slop_check.py" ./deck/deck.html
```
Open the sheet and the full-size frames (`--frames DIR`) and critique them like an
art director: what do I see first, is the evidence big enough, does any page look
like every other page, is anything crowded, empty, misaligned or illegible? Fix the
cause (restructure, resize, rewrite), rebuild, look again. Exercise real
click/key paths on motion decks with `qa-navigation.py`. If you cannot view images,
say that visual review is pending — measurements do not replace looking.

## Strip the machine-made look

Default: remove each of these unless you can say in one line what it tells the reader.

| Pattern | Do instead |
|---|---|
| Same skeleton every page: eyebrow, title, row of 3–4 equal cards, footer | Give each page the form its evidence needs: chart, table, diagram, photo, one sentence |
| Colored stripe on a card edge, bar under the title, tick before the eyebrow | Nothing; group with space; emphasize in the words or the data mark |
| Big `01 02 03` on items that are not a sequence | Let the headings carry order |
| English eyebrows (`KEY INSIGHT`) in a non-English deck | Remove, or a label in the deck's language that adds information |
| An entity's identity color reused on unrelated items | Identity colors for that entity only |
| The same list restated on cover, profile and summary | Say it once where it is evidenced |
| Attribute cards standing in for a table or chart | A table for attributes; a chart on one scale for quantities |
| Half the canvas empty below small text | Enlarge the evidence; cut duplicate words, don't shrink type |
| "Draft", "for the talk", tool or export notes on the canvas | Notes, runbook, or nothing |
| Dot/blueprint grids, glows, radial washes, blurred blobs, frosted glass, soft shadows under every box | Flat paper; emphasis by position, size, weight and the one accent |
| Phone and browser mockups, toasts, avatars, "NEW" pills, icon rows, emoji, sparkles, hand-drawn underlines | The real thing (an honest UI fragment at legible size, a measured drawing) or words |
| A grid of KPI tiles with ▲▼ pills and gradient sparklines | One KPI table; signed deltas (+1.2 / −1.2). In Japanese business documents ▲ means *negative* |
| Letter-spaced caps labels, breadcrumbs, `·` chains, "02 / 06", stacked letters, giant faded numerals | One quiet running line, or nothing |
| Two-tone headline, a colored phrase, an italic serif word dropped in, a slogan | A plain, specific claim; color a phrase only when it names the same-colored mark |

`slop_check.py` finds these in HTML (computed styles included), `.scene.json` or
any `.pptx`. Each warning needs a fix or a one-line reason. The checker cannot see
taste: the [visual design](references/visual-design.md) guide explains what to do
instead. A deck gets its identity from type, a grid, one color with one meaning and
real content set at full size — never from ornament (§8 of that guide; the template
packs show twelve different identities built that way).

## Delivery

- **HTML**: self-contained; `build --strip-notes` for the audience copy (notes in
  HTML are not secret). Bind QA to the delivered file: `verify-review.py deck.html --report …`.
- **PDF**: `font_audit.py` → reviewed `fonts.json` → `export.py deck.html deck.pdf
  --font-contract fonts.json --require-font-contract`; then look at the PDF.
- **PowerPoint**: `export.py deck.html deck.pptx` makes pictures. Native editable
  slides need the structured route (`studio.mjs` + `export-pptx.mjs --mode editable`).
  Never silently flatten a requested editable deck.
- **Company templates**: capture → proof → approve → POTX. See [Brand systems](references/brand.md).
- PDF/PPTX are static: motion, video and widgets do not survive. Plan the static story.

Report what you verified and what you could not (unrun tiers, unviewed images,
untested widget choices). Never claim aesthetic certification or that the tooling
guarantees quality.

## References

| Need | Read |
|---|---|
| Questions to ask before starting, and what each answer selects | [Intake](references/intake.md) |
| Copy, headlines, density, channels (audience vs notes) | [Writing and editing](references/writing-and-editing.md) |
| Numbers, sources, relationship semantics, research figures | [Evidence and diagrams](references/evidence-and-diagrams.md) |
| Chart and diagram API, theming, standalone SVG | [Figures](references/figures.md) |
| Composition, space, type, color, images | [Visual design](references/visual-design.md) |
| Builds, transitions, presenter view, widgets, media, 3D | [Motion and interaction](references/motion-and-interaction.md) |
| Deck module format, structured JSON route, assets, runtime API | [Authoring](references/authoring.md) |
| QA, PDF fonts, export routes, release gates | [Verification and delivery](references/verification-and-delivery.md) |
| Concrete failures and how to repair them | [Repair](references/repair.md) |
| Existing company slides, POTX templates | [Brand systems](references/brand.md) |
| Installation, capability tiers, privacy, rights | [Working agreements](references/working-agreements.md) |

Keep private material out of the skill: brand kits, logos and user data live in the
user's project. Generic examples use synthetic data and fictional names.
