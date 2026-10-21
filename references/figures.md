# Figures: charts, diagrams and fields from data

`assets/runtime/figure.mjs` turns data into finished, accessible SVG: axes with
nice ticks, direct labels, highlight-versus-context color, annotations, and
optional build animation. No dependencies, no DOM, no randomness. `craft.mjs init`
copies it into a new project; import it from there.

```js
import { barChart, lineChart, flowDiagram, fmt } from './figure.mjs';
const svg = barChart({
  id: 'orders', title: 'Orders by region, Q3', desc: 'Valley leads with 74k of 281k orders.',
  width: 1152, height: 470, data: rows, sort: 'desc', highlight: 'Valley', unit: 'Orders, thousands',
});
// content: `<h1>…</h1><figure class="fig">${svg}</figure>`
```

Use it whenever a page shows quantities or relations. Hand-draw SVG only for a
subject-specific illustration the engine cannot express, and then still compute
geometry from data with its scales (`linear`, `band`, `point`) and helpers.

## Rules the engine enforces for you

- **One data object, many outputs.** Compute headline numbers from the same array
  you pass to the chart (`const top = [...rows].sort(...)[0]`). Never retype a number.
- **Zero baselines for bars.** Bar lengths start at zero; signed values grow from it.
- **Missing is a gap.** `null` breaks a line; it is never drawn as zero.
- **Direct labels over legends.** Line ends, slope ends, stacked segments and
  dumbbell ends are labeled in place; legends appear only when labels cannot fit.
- **Highlight means "this".** `highlight` paints the named item(s) with the accent
  and everything else with the context grey. Without it, series take categorical colors.
- **Totals must add up.** `waterfallChart` throws if a declared total differs from
  the running sum.
- **Accessible by construction.** Every figure requires `title` (accessible name)
  and should get `desc` stating the main pattern in words.

## Sizing: draw at the size you show

Pass `width`/`height` equal to the region the figure occupies on the slide
(1280×720 canvas). A 1152×470 figure in a 1152×470 region renders labels at their
true size (16–18 px). Shrinking a 1600-wide figure into 800 px halves every label.
Rows-based charts (bar, dumbbell, dot, lollipop, bullet, forest, gantt, box, strip)
compute their own height from row count when `height` is omitted.

## Color and theme

Colors are role tokens resolved to CSS custom properties with fallbacks:
`--ss-paper --ss-surface --ss-ink --ss-muted --ss-rule --ss-grid --ss-accent
--ss-on-accent --ss-positive --ss-negative --ss-highlight --ss-context`,
`--ss-cat-1…8`, `--ss-seq-1…7`, `--ss-div-1…7` (diverging, 4 = neutral),
`--ss-on-cat-k / --ss-on-seq-k / --ss-on-div-k` (contrast-checked text on those fills)
and `--ss-font-sans / -display / -serif / -mono`.

- Add `class="cs-<id>"` to a slide (or any container) and include
  `assets/color-systems/color-systems.css` (generated from the 37 systems) to theme
  every figure inside it. Brand decks set the same `--ss-*` variables from brand tokens.
- `theme: colorSystemJson` (or any `{paper, ink, accent, cat:[…]}` object) emits
  literal hex values instead — use it for standalone `.svg` files that must open
  in Figma, Illustrator, Keynote or PowerPoint without CSS.
- `theme: {css: true, system: colorSystemJson}` keeps the CSS variables but takes their
  fallbacks — and `t.values`, for colors you compute (a continuous ramp, `t.mix`) — from
  that system, so computed colors match the page's system.
- `themeCSS(colorSystemJson, '.my-scope')` returns the `--ss-*` declarations.

## Common options (all charts)

| Option | Meaning |
|---|---|
| `id` | Required. Namespaces every internal ID (markers, titles). Unique per page. |
| `title`, `desc` | Required accessible name; description of the pattern. |
| `width`, `height` | viewBox size = rendered size on the slide. |
| `theme` | `'css'` (default), a literal theme / color-system object, or `{css: true, system}`. |
| `fontSize` | Base label size (default 16; diagrams 18). Keep ≥ 15 at 1:1. |
| `locale` | Number formatting locale (`'en'`, `'ja'`, `'de'` …). |
| `format` | `{digits, prefix, suffix, sign, compact}` or `v => string`. One convention per figure. |
| `highlight` | Label/name, list of them, or predicate. |
| `annotate` | `[{at, text, title?, dx, dy, width, marker, step?}]` callouts resolved against the data. |
| `build` | `true` or `{start, by: 'all'|'mark'|'series', stagger, motion, duration}` — see Motion. |
| `extra(ctx)` | Function returning extra SVG; `ctx` has the scales/box (`x`, `y`, `box`, …). |
| `before`, `after`, `defs` | Raw SVG inserted below / above the marks, or into `<defs>`. |
| `className` | Extra class on the root `<svg>`. |

`annotate[].at` names the datum (bar label, row label, series point via `{series, at}`);
the callout flips sides and clamps itself to stay inside the figure. Use `width` to
wrap, `marker: 'dot'|'ring'|'none'`, `leader: 'elbow'|'straight'|'none'`.

## Catalogue

### Comparison
| Function | Data | Notes |
|---|---|---|
| `barChart` | `data:[{label, value}]` | Horizontal default; `orientation:'vertical'`; `sort`, `axis`, `reference:{value,label}`, `valuesInside`, `unit` |
| `columnChart` | same | Vertical bars with optional `axis`; `labels:false` for anonymous columns (24 kitchens), `labelEvery:n` to thin them (highlighted columns keep theirs) |
| `groupedBarChart` | `categories`, `series:[{name, values}]` | Shared scale; legend row; `highlight` a series |
| `stackedBarChart` | `categories`, `series` | `normalize` for 100%; segment labels when they fit; series named on the first bar; `unit` |
| `divergingBarChart` | `data:[{label, value}]`, `reference` | Labels beside zero, signed values, `posLabel`/`negLabel` |
| `dumbbellChart` | `data:[{label, a, b}]` | `aLabel`, `bLabel`, `sort:'delta'`, change column, `endValues` |
| `slopeChart` | `data:[{label, a, b}]` | Collision-free end labels; highlighted rises use accent, falls negative |
| `dotPlot` | `data:[{label, values:{s: v}}]`, `series` | Cleveland dot plot; `legend:false` when the headline names the series; `valueLabels:'all'` |
| `lollipopChart` | `data:[{label, value}]` | Lighter alternative to bars; `reference:{value,label}` threshold |
| `bulletChart` | `data:[{label, sub, value, target, ranges}]` | Actual vs target vs qualitative ranges |
| `waterfallChart` | `data:[{label, value, total?, outline?, sub?, color?}]` | Running total; connectors; validated totals; baseline drawn; `colors:'neutral'` keeps steps grey; `highlight:'Personnel'` puts the driver the page is about in the accent; `outline:true` draws a bar (the plan) as an outline; `sub` adds a muted line under a label; `build:{…, holdFirst:true}` keeps the opening total on the page from build 0 |

### Part to whole
| `waffleChart` | `value`/`total` or `parts` | 10×10 = 1% cells, filled from bottom-left; largest-remainder rounding; `align:'start'|'end'` |
| `unitChart` | `groups:[{label, count, highlight, mark}]` | Countable units; `perRow:'auto'` fills the width; `mark` (n, indices or k → bool) accents single units |
| `donutChart` | `data` (≤ 6) | Use only when the whole matters more than precise comparison |

### Time and trend
| `lineChart` | `x`, `series:[{name, values, band?, dash?}]` | `highlight`, end labels, `bands`, `refLines`, `area`, `curve:'monotone'|'step'`, `xType:'linear'`; `xTickValues`/`yTickValues` for explicit ticks (0, 6, 12, 18, 24 h); `contextStrokeWidth` (or per-series `strokeWidth`); `refLines:[{y, label, dash:null}]` for a solid line; `bands:[{from, to, label, fill, labelColor}]`; `annotate[].at` names an x value (2023), even when the categories are numbers |
| `areaChart` | same | Filled to zero |
| `smallMultiples` | `panels:[{title, values}]`, `x` | Shared y scale across panels |
| `ganttChart` | `tasks:[{label, start, end, group, milestone, done, baseline:[s,e]}]`, `ticks` | `today` line; `baseline` draws the approved plan as a thin grey bar under the forecast and `slip:true` (+`slipUnit`) labels each overrun; `zebra:false`, `rounded:false` for a plainer table look; `forecastLabel`/`baselineLabel` |
| `timelineChart` | `events:[{at, label, title, body}]`, `periods` | True time spacing unless `equal:true`; text blocks take the first free side/stem level (`stem`, `stemStep`, `side`) |
| `funnelChart` | `stages:[{label, value}]` | Step conversion between stages; `alertBelow` |
| `sankeyChart` | `nodes`, `links:[{source, target, value}]` | Layered; link width ∝ value |

### Distribution and uncertainty (computed from raw values)
| `histogram` | `values`, `bins` | `highlightRange`, `marks:[{value,label}]` |
| `ecdfChart` | `series:[{name, values}]` | Median guides |
| `boxPlot` | `groups:[{label, values}]` | Tukey 1.5×IQR; observations as a non-overlapping dot strip; n and median labelled (Japanese words with `locale:'ja'`, or `words:{n, median, sep}`) |
| `violinPlot` | `groups` | Gaussian KDE (Silverman) with IQR and median |
| `stripPlot` | `groups` | Deterministic beeswarm |
| `errorBarChart` | `groups:[{label, values}]` or `{mean, low, high}` | `interval:'ci95'` (t-based) `|'se'|'sd'|fn`; states its definition |
| `forestPlot` | `rows:[{label, estimate, low, high, weight}]` | `reference`, `summary` diamond, `favors`, `xLog`; `columns:[{title, value}]` adds table columns (n, events) between labels and plot; `marker:'square'|'circle'|'diamond'`; `highlightBold:false`; `xTickValues`, `xFormat` |

### Relationship and models
| `scatterPlot` | `points:[{x, y, label, group}]` | `fit:'linear'` with 95% band of the mean (`fitColor`); `quadrants`; labeled points spread |
| `heatmap` | `rows`, `cols`, `values` | `scale:'sequential'|'diverging'`, `center`; contrast-safe cell labels; `missing:'blank'` leaves null cells empty (a cohort triangle), otherwise `missingLabel` ('–') |
| `confusionMatrix` | `labels`, `matrix[actual][predicted]` | Counts and row rates |
| `rocCurve`, `prCurve` | `curves:[{name, scores, labels}]` | AUC / AP computed; `operating:{curve, threshold | fpr | recall, label}` (or an array) rings the point in use; dense curves (30k scores) are thinned to drawable paths |
| `calibrationChart` | `probs`, `labels` or `series:[{name, probs, labels}]` | Reliability curve + counts per bin; before/after pairs as `series` (highlighted or last in the accent, each named at its end); `intervals:true` adds Wilson 95% intervals; `histScale:'log'` when rare positives put most rows in one bin; `extra(ctx)` gets the count-histogram geometry |
| `residualPlot` | `points:[{x, residual}]` | ±2 SD band; outliers flagged |
| `learningCurve` | `sizes`, `train`, `val` (`{mean, sd}`) | Log x by default; gap bracket |

### Diagrams
| `flowDiagram` | `nodes:[{id, label, sub, kind, emphasis, muted}]`, `edges:[{from, to, label, style, emphasis, back}]` | Layered layout (`direction:'lr'|'tb'`), cycles as feedback arcs, `groups` (boundaries), `lanes` (swimlanes), or manual `x,y`. Several edges into one node merge on a trunk and end in one arrowhead; several out of one node split from a trunk; other shared sides get spread ports (`portGap`, default 22). A crowded layer squeezes `crossGap` to 12 before reporting what does not fit |
| `treeDiagram` | `root:{label, children, edgeLabel}` | Decision / issue trees, `direction:'tb'|'lr'`; `labelPos` (0–1 along the last leg) |
| `sequenceDiagram` | `actors` (names or `{id, label}`), `messages:[{from, to, label, kind}]` | sync / reply / async / self; `numbered` |
| `networkDiagram` | `nodes`, `edges` | `layout:'force'|'ring'|'star'|'grid'|'manual'`; seeded, deterministic; `edgeColor` |
| `quadrantChart` | `quadrants`, `items:[{label, x, y}]`, `x`, `y` | Quadrant names in the outer corners; item labels placed to avoid collisions; `highlightQuadrant`. Without a domain, positions are judgments in 0–1 — say so. With `x:{domain:[1,5], split:3, ticks:true}` / `y:{domain:[0,3.5], split:1.5, ticks:[…], splitLabel:'基準 1.5億円'}` positions are data and the split is a threshold |
| `cycleDiagram` | `steps:[{label, sub}]`, `center` | Arrows along the circle |
| `bipartiteDiagram` | `left`, `right` (names or `{id, label}`), `links` (`[from, to]` or `{from, to, weight}`) | Two kinds of entities kept apart |
| `layerDiagram` | `layers:[{label, items}]` | Architecture strata |
| `matrixDiagram` | `rows`, `cols`, `cells`, `symbols` | RACI / coverage with ●◐○ |

All statistics charts accept `xTickValues` / `yTickValues` for explicit ticks (e.g. hourly marks).
Every chart takes `before` (markup or a function of the figure context, painted under the marks)
and `extra` (painted above). Diagrams take `bare:true` (with optional `x`, `y`) to return a `<g>`
for composing several drawings inside one `svgRoot`. `vectorField` takes `maxMagnitude` so panels
and a key share one arrow scale. Text wraps at ordinary spaces only: join a number and its unit
with a no-break space (`15\u00a0min`) to keep them on one line. Japanese wraps between phrases:
particles stay with their word, a number keeps its counter or unit (`2029年度`, `270億円`, `6%まで`)
and kanji compounds up to eight characters stay whole (`営業利益率`); a phrase wider than the
line falls back to word segments, then characters. `\n` forces a break.
Diagrams accept `arrowSize` (default 12). In `flowDiagram`, `labelPos: 0.5` on an edge puts its
label at the middle of the connector — use it when labels would meet arrowheads in tight layers.

Node kinds: `process` (default), `terminal`, `decision`, `data`, `store`, `note`,
`circle`, `plain`. Edge `style`: `'dashed'|'dotted'`; `emphasis:true` uses the
accent; `back:true` forces a feedback arc. Layout errors say what does not fit;
change direction, shorten labels or split the diagram — do not disable the check.

### Fields and texture
`contourLines(fn, …)` (marching squares), `contourPlot(fn, {x,y,width,height,domain,levels,highlightLevel})`,
`vectorField(fn, …)`, `streamlines(fn, …)`; seeded textures `noise2D`, `waveLines`,
`halftone`, `facets`, `truchet`, `rings`, `isoGrid`, `sprinkle`; `linearGradient`,
`radialGradient`. Textures never sit behind evidence and never imitate data.

### Building blocks
`svgRoot`, `el`, `g`, `textLines`, `wrapText`, `wrapBalanced`, `measureText`,
`linear`, `log`, `sqrt`, `band`, `point`, `ticks`, `niceDomain`, `axis`,
`callout`, `bracket`, `refLine`, `legend`, `spreadLabels`, `pathFromPoints`
(`'linear'|'monotone'|'step'`), `segments`, `barPath`, `roundRectPath`, `arcPath`,
`arrowMarker`, `boxPort`, `sidePort`, `rng`, `fmt`, `pct`, `statesAttr`.
Statistics: `mean`, `sd`, `quantile`, `median`, `boxStats`, `kde`, `bins`, `ecdf`,
`linearFit` (OLS + CI band, points as `[x, y]`), `rocPoints`, `prPoints`, `auc` (accepts their output), `confusionAt`,
`calibrationBins`, `beeswarm`, `rebase`.

`el(tag, attrs, ...children)` serializes one element; children must be strings
(merge attributes into one object). `data-states` accepts the state map directly:
`el('g', {'data-states': {0: {opacity: 0}, 1: {opacity: 1}}})`. In hand-written
template strings use `data-states="${statesAttr(map)}"`.

## Motion: builds on figures

`build: {start: 1, motion: 'grow-y', stagger: 80}` adds player attributes to marks:
bars grow from their baseline, lines draw, points settle, labels fade in after
their mark. `by:'mark'` gives one click per mark; `by:'series'` one per series.
Annotations take `step` to appear on a later click. The player commits final
states first, so PDF/static export always shows the complete figure.

For transformations (rescale an axis, reorder rows, move between layouts),
compute both geometries from the same data and put the change in `data-states`
on the moving group (see `assets/motion/axis-rescale.mjs`).

## Standalone SVG

`node scripts/build-studies.mjs` writes `assets/svg/<id>.svg` for every diagram
study that exports `figure(theme)`, with the study's color system as literal
colors and a paper backdrop. For your own figure:
`fs.writeFileSync('chart.svg', barChart({...spec, theme: colorSystemJson}))`.

## Text measurement is an estimate

Label widths come from Helvetica-class metrics (CJK = 1 em). The browser draws
real glyphs; QA (`qa.py`) measures actual overlaps and overflow. If a long label
collides after rendering, wrap it (`labelWidth`), shorten it, or give the figure
more room — do not shrink below 15 px.
