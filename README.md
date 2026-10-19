# Slide Studio 4

**An Agent Skill for authoring presentations: claims computed from data, figures drawn by an engine, motion that explains a change, and a review loop that looks at the result.**

[![skills.sh](https://skills.sh/b/Aero123421/slide-studio)](https://skills.sh/Aero123421/slide-studio)

[日本語](README.ja.md) · [Agent entry](SKILL.md) · [Gallery](gallery/index.html) · [Verification](VERIFICATION.md) · [Changelog](CHANGELOG.md)

```sh
npx skills add Aero123421/slide-studio -g -y
```

Works with [80+ coding agents](https://github.com/vercel-labs/skills#supported-agents)
(Claude Code, Codex, Cursor, OpenCode, …). Or copy the whole folder into your agent's
skill directory (e.g. `.claude/skills/slide-studio/`, `.agents/skills/slide-studio/`).
No API key, account, telemetry or cloud service is involved.

## What an agent does with it

1. **Writes the argument first** — one claim per page, computed from the data it rests on.
2. **Draws evidence with the figure engine** — 45 chart and diagram types that measure
   their own labels, wrap Japanese by phrase, place callouts inside the frame and
   export as standalone SVG.
3. **Composes the page** on a 1280×720 grid with one of 37 role-based color systems
   (or the user's brand), without the decorations that make decks look machine-made.
4. **Adds motion or interaction only when it explains** — builds, transformations
   between committed states, slide transitions, real controls with reset and export.
5. **Reviews the rendered deck** — contact sheets of every page and build, geometry QA,
   a slop check that reads computed styles, then fixes causes and looks again.
6. **Delivers** self-contained HTML (with a presenter window), PDF with checked fonts,
   screenshot or native-editable PPTX.

## What's new in 4.0

| Area | Change |
|---|---|
| Figure engine | `assets/runtime/figure.mjs`: bar/column/grouped/stacked/diverging, dumbbell, slope, dot, lollipop, bullet, waterfall, waffle, unit, donut, line/area, small multiples, Gantt, timeline, funnel, Sankey, histogram, ECDF, box, violin, strip, error bars, forest, scatter + fit band, heatmap, confusion matrix, ROC/PR, calibration, residuals, learning curve, flow (layered DAG), tree, sequence, network, quadrant, cycle, bipartite, layers, RACI matrix, contours/vector fields and seeded textures. Theme through `--ss-*` tokens or literal colors. |
| Player 4 | Presets `draw`, `count`, `grow-x/y`, `blur`, `zoom`, `rise`, `wipe-up`; `data-delay`, `data-stagger`, `data-easing`; `data-states` transformations; slide transitions; presenter window (current/next/notes/timer); black screen, help sheet, number-jump, swipe, idle-hiding fullscreen controls. |
| Library | Rebuilt as finished pages with real (fictional) content: 104 diagram studies, 64 motion studies, 24 interactions, 36 compositions, 12 template packs (72 pages), and worked example decks. Headlines are computed from each page's data. |
| Taste guardrails | `slop_check.py` reads computed styles: dot grids, glows, gradient text, glass, shadowed cards, spaced caps, `·` chains, emoji, chips, faded numerals, stacked letters, colored headline phrases that label nothing, ▲ for increases in Japanese. The visual-design guide explains identity without ornament. |
| Tooling | `craft.mjs init` copies the engine, theme and a computed starter; `catalog.mjs take` copies a study with its dependencies and CSS; `preview.mjs`, `contact-sheet.py` (both deck routes), `build-studies.mjs` (CSS bundles + standalone SVGs), `build-thumbs.py` and a searchable visual gallery. |

## Build an original deck

```sh
node scripts/craft.mjs init ./talk --language en --colors laboratory
# Edit talk/deck.mjs: data at the top, claims computed from it, figures from figure.mjs.
node scripts/craft.mjs build ./talk/deck.mjs --out ./talk/deck.html --allow-draft
```

`init` writes `deck.mjs`, `theme.css` (page grammar + one color system), the figure
engine, the kit and a short brief. The deck module is **trusted code**, not a sandbox.
Set `draft:false` when the content is real. See [authoring](references/authoring.md)
and [figures](references/figures.md).

```js
import { barChart, fmt } from './figure.mjs';
const orders = [{ label: 'North', value: 48 }, { label: 'Coast', value: 31 } /* … */];
const top = [...orders].sort((a, b) => b.value - a.value)[0];
const claim = `${top.label} took the largest share of orders`;          // computed, not typed
const fig = barChart({ id: 'orders', title: 'Orders by region', width: 1152, height: 470,
  data: orders, sort: 'desc', highlight: top.label, build: { start: 1, stagger: 70 } });
```

## Find material

Open the [gallery](gallery/index.html) (thumbnails, search by what you need to explain,
filter by library and language), or use the catalog:

```sh
node scripts/catalog.mjs search "uncertainty comparison"
node scripts/catalog.mjs show forest-plot
node scripts/catalog.mjs take forest-plot ./interval-study      # source + deps + CSS + standalone SVG
node scripts/catalog.mjs take tpl-qbr ./q2-review               # a whole six-page template pack
node scripts/preview.mjs assets/svg/forest-plot.mjs --out preview.html
```

A taken study is a **draft**: replace the data, names and copy, and let the page
recompute. Template packs (`gallery/templates.html`) are complete six-page decks with
their own visual systems; `take tpl-<pack>` copies every page, the pack CSS and the
engine into one draft deck.

## Review the rendered deck

```sh
python -m pip install -r requirements.txt && python -m playwright install chromium
python scripts/contact-sheet.py talk/deck.html --out talk/.studio-review/sheet.png --final --label --frames talk/.studio-review/frames
python scripts/contact-sheet.py talk/deck.html --out talk/.studio-review/steps.png --steps
python scripts/qa.py talk/deck.html --out talk/.studio-review/current --states all
python scripts/qa-summary.py talk/.studio-review/current/report.json
python scripts/slop_check.py talk/deck.html
python scripts/qa-navigation.py talk/deck.html --out talk/navigation.json
```

Look at the sheet and the full-size frames. QA measures overflow, overlaps, contrast,
crops and small text; it does not approve design. The [repair guide](references/repair.md)
maps symptoms to causes. `SLIDE_STUDIO_CHROMIUM` points the tools at an existing Chromium.

## Present and deliver

The built HTML is one self-contained file. Press **P** for the presenter window
(current page, next build, notes, timer), **?** for all shortcuts, **B** for a black
screen, a number + Enter to jump. Notes stay in the HTML source; build an audience copy
with `--strip-notes`.

```sh
python scripts/font_audit.py talk/deck.html > talk/font-observations.json
python scripts/export.py talk/deck.html talk/deck.pdf --font-contract talk/fonts.json --require-font-contract
python scripts/export.py talk/deck.html talk/deck.pptx                    # picture per slide
node scripts/studio.mjs build assets/examples/technical.json --out native.html
node scripts/export-pptx.mjs native.html native.pptx --mode editable      # native, editable route
```

PDF and PPTX are static: motion, video and widgets do not survive; plan the static
story (each slide exports its final or a chosen state). Native PPTX keeps text and
shapes editable but does not translate CSS animation. See
[delivery](references/verification-and-delivery.md).

## Company identity

```sh
python scripts/brand-capture.py reference.pptx --out private-brand
node scripts/brand.mjs proof private-brand/brand.json --out private-brand/proof.html --allow-draft
python scripts/brand-template.py private-brand/brand.json --out company-template.potx
```

Capture is local and omits slide text, notes and media. Its output is a draft to review
against authorized references, not an automatic approval. See [brand systems](references/brand.md).

## Verify and extend

```sh
npm test                                  # node: engine, catalog, craft, player, CLI
python -m unittest discover -s tests -p 'test_*.py'
python tests/browser.py && python tests/navigation.py && python tests/integrity_browser.py && python tests/field_browser.py
npm run build:galleries && npm run build:thumbs
python scripts/audit.py .
```

Tests exercise software behavior. They do not guarantee artistic quality or equal
results across models; see [verification](VERIFICATION.md) for what was observed.

## Structure

`SKILL.md` is the entry point an agent reads. `references/` holds the craft and
engineering guides, read on demand. `assets/` holds the runtime (player, figure engine,
widgets), the libraries, color systems and examples. `gallery/` holds built
demonstrations. `examples/` holds complete worked decks. `scripts/` builds, inspects and
exports. `tests/` holds regressions and agent evaluation briefs.

## License and scope

MIT for original source and instructional material. The two public photographs have
separate CC0/public-domain provenance ([THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)).
No font files, accounts, personal details or user project data are bundled; all example
data and organisations are fictional.

## Upgrading from 3.x

Replace the installed skill folder, not your projects. Rebuild existing decks from source
to get Player 4 (old HTML files keep the old player). Decks that copied `studio-kit.mjs`
keep working; to use the figure engine, copy `assets/runtime/figure.mjs` and the `fig-*.mjs`
modules next to the deck (or start a new project with `craft.mjs init`).
