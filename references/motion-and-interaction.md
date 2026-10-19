# Motion and interaction

Motion is a mapping between committed states; interaction is input → state →
display. Both exist to explain a change. A page that is clear as a still needs
neither.

## 1. Decide the temporal argument first

Write down, per build: what is known before, what appears or changes, what stays
fixed, and why the audience needs the change *now*. Typical orders: baseline →
observations → comparison → interval → interpretation; or premise → mechanism →
qualified conclusion. Introduce an uncertainty with its estimate, not one click
later. Never hide a qualification behind a later build after an unqualified claim.

Good motion: keeps object identity (the same bar moves to its new rank), draws the
eye to one place at a time, ends on a complete page. Weak motion: every bullet on
its own click, letter-by-letter text, decorative zooms, loops, an arrow animation
that turns a correlation into a cause.

## 2. Builds on any element

| Attribute | Meaning |
|---|---|
| `data-step="n"` | Hidden until build `n` (0 = visible from the start). `data-until="m"` hides it after build `m` (on its own: visible from 0 through `m`; the slide then has a build `m + 1`). |
| `data-motion="preset"` | How it enters (table below). Unknown names raise a player warning, which fails QA. |
| `data-delay="ms"` | Wait before entering or before a `data-states` change (≤ 2400). Use for deliberate order inside one build. |
| `data-stagger="ms"` | On a parent: its children enter (or change state) one after another with this gap. |
| `data-duration="ms"` | Effect length (default 500, max 1600). |
| `data-easing` | `standard`, `emphasized`, `decelerate`, `accelerate`, `smooth`, `linear`, or any CSS easing. |

| Preset | Effect | Use for |
|---|---|---|
| `reveal` | fade in | labels, annotations, quiet additions |
| `focus` | from 20 % opacity | returning attention to something already seen |
| `lift` / `rise` | fade + 20 / 48 px upward | text blocks, callouts, cards of evidence |
| `slide` | fade + 28 px from the reading side | items in a sequence |
| `settle` / `zoom` | fade + scale from 96 % / 86 % | points, nodes, a hero number |
| `blur` | fade + defocus | photographs, atmospheric layers |
| `grow-x` / `grow-y` | scale from the element's origin | bars from their zero baseline (set `transform-origin`) |
| `wipe` / `wipe-up` | clip reveal | lines of display type, ribbons |
| `draw` | strokes draw along their path; dashed strokes wipe | lines, connectors, outlines, contours |
| `count` | the number in the text counts up to its committed value | KPIs, totals (the DOM always holds the final number) |
| `trace` | legacy dash-offset effect (`pathLength="1"` + `stroke-dasharray:1` required) | prefer `draw` |

Presets animate `translate` / `scale` (individual transform properties), so they
compose with an element's own SVG `transform` attribute. The figure engine adds
the right presets for you: `build: {start: 1, motion: 'grow-y', stagger: 80}` on a
chart grows bars from zero, draws lines, settles points and reveals value labels
after their marks; `annotate: [{…, step: 2}]` adds a callout on a later build.

```html
<ul data-step="1" data-motion="lift" data-stagger="110">
  <li>Observed in 4 of 5 sites</li><li>Pooled −1.5 days (−2.1 to −0.9)</li><li>Not powered for subgroups</li>
</ul>
<p class="kpi" data-step="2" data-motion="count" data-duration="900">1,284</p>
```

## 3. Transformations: `data-states`

When an object *changes* — rescales, reorders, moves into a group, swaps state —
keep it one element and describe its CSS at each build:

```js
el('g', { 'data-states': { 0: { transform: 'translate(0px,0px)' }, 2: { transform: `translate(0px,${dy}px)` } },
          'data-duration': 800, 'data-easing': 'smooth', style: 'transform-box:view-box;transform-origin:0 0' }, bar)
```

- Keys are nonnegative integer builds; state 0 is required; later states inherit
  unspecified properties. Values are CSS properties (or `--custom-properties`).
- Compute both geometries from the same data (`dy = y(newRank) - y(oldRank)`).
  `assets/motion/axis-rescale.mjs` maps one y-range onto another with a computed
  matrix; the line never swaps for a different drawing.
- For SVG transforms in user units set `transform-box:view-box;transform-origin:0 0`;
  add `vector-effect:non-scaling-stroke` to paths that scale non-uniformly.
- One owner per property: do not combine `data-states` transform and a preset on
  the same element; wrap one in a group.
- Labels travel with their mark: put both in the moving group, or keep upright
  labels outside a rotating group and move them with their own states.

The player commits each target state synchronously and treats animation as a
removable layer, so direct jumps, reverse navigation, reduced motion and export
reach exactly the same state.

## 4. Slide transitions

`transition: 'fade' | 'rise' | 'push' | 'zoom'` on the deck (default `none`) or on a
single slide. Keep one transition for the deck and a different one only to mark a
chapter. They run only on animated navigation, never on export or reduced motion.

## 5. Presenting

The player is a complete presentation tool:

| Key / control | Action |
|---|---|
| → Space PgDn Enter, click Next | next build or slide |
| ← PgUp | previous |
| Home / End | first / last |
| number + Enter | jump to that slide |
| P / Presenter button | presenter window: current page, next build or slide, notes, timer (click to pause, double-click to reset), clock |
| O | overview grid |
| N | notes panel (same window — use the presenter window on a projector) |
| B or . | black screen |
| F | fullscreen; controls hide after 2 s idle |
| R | reset this slide (widgets and builds) |
| ? | shortcut sheet |
| swipe left/right | next / previous on touch screens |

Keys typed into inputs, sliders, editors, media and `[data-interactive]` regions
stay with those controls. IME composition and held keys never skip builds.

## 6. Timing and easing

Feedback 120–220 ms; simple movement 300–600 ms; an explanatory transformation the
audience must track 600–1000 ms. Stagger 60–120 ms between siblings, in reading or
data order. Do not overshoot quantitative marks (no bounce on a bar's value). Use
one easing family per deck; `smooth` for movement between two layouts, `decelerate`
for entrances, `linear` only for time-proportional movement (a time cursor).

## 7. Reduced motion and static output

`prefers-reduced-motion` skips movement but keeps every state and every piece of
evidence. Custom loops in `deck.script` must check `context.reducedMotion` and
`document.hidden`. For PDF/PPTX choose per slide: the final state (default), a
selected state, or extra pages for intermediate states that carry unique evidence.
A final frame that only says "Done" is not an exported explanation.

## 8. Test motion like behavior

```sh
python scripts/contact-sheet.py deck.html --out steps.png --steps        # every build, one tile each
python scripts/qa.py deck.html --out .studio-review/current --states all   # geometry per build
python scripts/qa-navigation.py deck.html --out navigation.json            # click and key routes
```
Look at each build: is every intermediate page true and readable? Check reverse,
direct jump, revisit, reduced motion and export. A still frame cannot judge timing:
watch the slide at real speed in a browser before calling it finished.

## 9. Interaction without building an application

Add a control when changing a variable or inspecting a component teaches something
a static sequence cannot. Live talks need a predictable path and a reset;
self-guided material can allow exploration.

**Contract per widget:** question; input domain; state; derived values; visible
feedback; keyboard route; reset; empty/error/loading state; revisit policy;
reduced-motion behavior; static export; data provenance. Input must change the
actual model and the visible output — no decorative sliders, no canned
"simulation" results, no hidden network dependency.

```js
const root = document.getElementById('threshold-widget');
const abort = new AbortController();
let state = { threshold: 0.5 };
function render() { /* derive values, draw, update accessible text */ }
const unregister = SlideStudio.register(root.id, {
  snapshot: () => structuredClone(state),
  restore: next => { state = structuredClone(next); render(); },
  reset: () => { state = { threshold: 0.5 }; render(); },
  onEnter: ctx => render(),            // entering the slide, not every build
  onStep: ctx => {},                   // builds, if the widget follows them
  onLeave: () => {},                   // pause media, stop timers and RAF
  onExport: ctx => {},                 // a stable, meaningful still
  dispose: () => abort.abort(),
});
```

Deep-copy nested state (otherwise reset silently mutates the initial state). Own
listeners with an AbortController; scope queries and CSS to the widget root; cancel
stale async loads. Mark the root `data-interactive`; use real labelled controls;
give drags a keyboard alternative; never make essential content hover-only;
announce results concisely, not every frame.

Test every discrete choice for **semantic** correctness (the reversed relation
reverses the operands *and* the labels), and the endpoints and change-over values
of every range. `qa.py --states all` covers slide builds, not widget choices —
record which choices you exercised.

### Built-in teaching widgets

`assets/runtime/widgets.js` mounts one mechanism per `kind`. The 24 studies in
`assets/interactions/` are pages from fictional decks — a sepsis alert threshold, a
dosing curve, a tide gauge during a typhoon, a bus network with a closed bridge, a
parcel-rate matrix, a measured model ablation — and each module computes its headline
from the same data it passes to the widget. Start from the closest study, replace its
data and words, and recompute the headline the same way; never type a number into a
headline. Without `data` every kind still draws a small default fixture (older decks
rely on it); a fixture checks the mechanism, it is not a finding.

```js
widgets: [{ id: 'alert-widget', kind: 'threshold', initial: { threshold: 5 },
  data: { values: scores, labels: hadSepsis, domain: [0, 10], step: 1 },   // one 0/1 label per score
  controls: { threshold: { label: 'Alert threshold (score)', min: 1, max: 10, step: 1, format: '{v} or above' } },
  axes: { x: { title: 'Early-warning score at triage', ticks: [0, 2, 4, 6, 8, 10] } },
  text: { positive: 'Sepsis', negative: 'No sepsis', rowCount: '{n} patients', fp: '{fp} false alarms',
    status: 'Alert at {threshold} or above: {tp} of {positives} cases caught; {flagged|alert|alerts}, {fp} of them false.',
    readout: [{ value: '{sensitivity}', unit: '%', label: 'of sepsis cases caught' }] } }]
```

**Shared config.** `initial` is the state at entry and after reset (deep-copied).
`controls.<stateKey>` overrides one control: `label` (plain words with the unit),
`min`, `max`, `step`, `digits`, `format` (`'{v} mg'`), `values` with `labels` for a
slider over named stops, `plain` (no digit grouping, for years), `summaryLabel`;
`false` hides the control and keeps its state. `axes.x` / `axes.y`: `title`, `min`,
`max`, `ticks` (numbers or `{value, label}`), `digits`, `plain`, `unit`. `text` holds
every visible word: `status` is the one sentence announced in the live region
(`{key}` inserts a derived value from the table below, `{n|stop|stops}` adds the
right noun), `readout` is a list of large numbers `{value, unit, label}` (templates
too), `reset` names the reset button, `figure` is the drawing's accessible name.
`locale` defaults to the slide's `lang`; `ja` switches the built-in words to Japanese.
Colours are role tokens: `tone: 'accent' | 'ink' | 'muted' | 'negative' | 'positive' |
'context' | 'cat-1'…'cat-8'`. A static export hides the controls and prints
"Label: value" for each.

| kind | `data` (state keys) | values for `text` templates |
|---|---|---|
| `parameter` | `model` (below), `constants`, `window: [low, high]` (the curve above `high` turns negative), `bands: [{from, to, label}]`, `refs: [{y, label, tone, align, side}]` (the model's parameter names) | each parameter; dosing adds `peak`, `trough`, `ssPeak`, `ssTrough`, `hoursAbove`, `hoursBelow`, `firstAbove`, `accumulation` |
| `threshold` | `values`, `labels` (0/1 each), `domain`, `step` (whole-number scores: the cut is drawn half a step below); words `positive`, `negative`, `rowCount`, `tp`, `fp`, `fn`, `tn`, `rule` (`threshold`, `counts`) | `threshold`, `tp`, `fp`, `fn`, `tn`, `positives`, `negatives`, `total`, `flagged`, `sensitivity`, `specificity`, `ppv`, `falseShare` (%) |
| `scrubber` | `x`, `labels` (one per sample), `lines: [{name, short, values, tone, dash}]`, `refs`, or `series: [{x, y, label}]`; `axes.y.unit`; `text.statusAbove` replaces `status` at or above `refs[0]` (`time`) | `label`, `y`, `y2`, `delta`, `change`, `trend`, `ref`, `vsRef`, `overRef`, `n`, `count` |
| `comparison` | `regions: [{name, x, y, w, h, label}]` (fractions of the image), `filter` (CSS, default `grayscale(1)`); `text.before`, `text.after` (`split`, %) | `L0`, `L1`… (CIE L* measured from the rendered pixels), pairwise `d01`, `d02`, `d12`…, `name0`…, `split` |
| `hotspots` | `parts: [{id, name, body, at}]`, `links: [{from, to, label}]`, `layout: 'cycle'` (parts `at` top, right, bottom, left), `flows: [{part, side, dir, value, label, tone}]` (width ∝ value) (`part`) | `name`, `body` |
| `tabs` | `sections: [{id, name, title, body, facts: [{value, label}], status}]`, `body` a string or a list of paragraphs (`tab`) | `name`, `index`, `count` |
| `layers` | `viewBox`, `layers: [{id, name, svg, note}]`, `controlOrder` (one boolean per layer) | `shown`, `count`, `notes` (of the visible layers) |
| `table` | `columns: [{key, name, short, unit, digits, suffix, plain, bar: {max, ref}, flag: {above \| below}, ascending}]`, `rows`, `id`, `sortBy`, `caption`; a header click sorts, a second click reverses (`sortBy`, `ascending`, `order`) | `column`, `direction`, `first`, `last`, `firstValue`, `lastValue`, `count`, `flagged` |
| `brushing` | `points: [{id, x, y}]`; bounds are in x units, `axes.x.plain` for years; `text.statusAll`, `text.statusNone` for a selection of everything or nothing (`low`, `high`, `selected`) | `k`, `n`, `others`, `low`, `high`, `median`, `rest`, `ratio` |
| `histogram` | `values`, `domain` (peak bins in accent); `controls.bins.values` with `labels` offers named bin widths; `text.statusTwoPeaks` (`bins`, `counts`) | `bins`, `width`, `total`, `peaks`, `peakList`, `first` |
| `bootstrap` | `values`, `batch` (adds "Draw n more"), `minDraws` (interval shown from then on, default 20); `controls.n: false` resamples all values; `axes.x.signed` (`seed`, `n`, `mean`, `low`, `high`) | `mean`, `draws`, `lo`, `hi`, `observed`, `above` (means above 0) |
| `ablation` | `components: [{id, name, short}]` with `measured: {none: v, a: v, 'a+b': v, …}` (included ids in component order) and `n` (evaluated cases → 95% margins); or additive `base` and `effect` (one boolean per component, `value`) | `value`, `config`, `full`, `delta`, `margin` |
| `quiz` | `question`, `prompt`, `options: [{id, label, feedback, share}]`, `answer`, `explanation`, `figure`; `text.correctPrefix`, `text.wrongPrefix` (`choice`, `checked`); the export is the answer sheet | `choice` |
| `decision` | `questions: [{id, label, name, options: [[value, label, short]]}]`, `tree: {ask, branches: {value: {result} \| {ask, branches}}}` (one key per question, `result`) | `result` |
| `graph` | `nodes: [{id, name, x, y, label}]`, `edges: [{from, to, minutes, toggle, oneway, bend, label, closedLabel, labelAt}]` (two-way unless `oneway`; shortest times by Dijkstra), `toggles: [{key, label}]`, `origin`, `areas: [{points, tone: 'water', label, labelAt}]`; `text.statusCut` when a stop is cut off (toggle keys, `reachable`, `minutes`) | `reached`, `count`, `cut`, `cutList`, `list`, `farthest`, `origin` |
| `matrix` | `rows`, `columns` (names), `values`, `prefix`, `suffix`, `cellSuffix`, `digits`, `corner`, `caption` (`row`, `column`, from 1) | `rowName`, `columnName`, `value`, `cheapest`, `ratio`, `rowMin`, `rowMax`, `rowRatio`, `first`, `vsFirst` |
| `magnifier` | `pixelated`, `print: {widthMm, ppi}` (`zoom`, `x`, `y`) | `zoom`, `screen` (screen px per image px), `visible`, `ppi`, `needed`, `maxMm`, `pixelMm` |
| `video` | `seekTo` (s), `duration`; `assets.video`, `poster`, `captions` | `time`, `duration`, `state` |
| `audio` | `reference: {name, hz}`, `windowMs`; a 16-bit PCM WAV data URI is decoded and measured in the page (`time`) | `hz` (zero crossings), `seconds`, `peak`, `rms` (dBFS), `cents`, `note`, `time`, `state` |
| `cad-orbit`, `cad-explode`, `cad-section`, `cad-import` | `parts: [{group, name, note, tone, explode}]` (an OBJ group becomes a direct label with its measured size, its leader dashed when the part is hidden), `scaleBar` (mm); `text.statusFile` after an import (`yaw`, `pitch`, `explode`, `cut`, `filename`) | `triangles`, `drawn`, `x`, `y`, `z`, `yaw`, `pitch`, `gap`, `height`, `cutPct`, `file`; per OBJ group, the connected pieces in view, e.g. `shownPins` of `piecesPins` |
| `ink` | a chart to mark up: `lines`, `x`, `labels` as for `scrubber`, `refs`, `marks: [{at, label}]`, `preset: {at, rx, ry}` (the keyboard preset rings sample `at`), `inkTone` (`paths`) | `marks` |

Parameter models: `dosing` (one-compartment IV bolus, C(t) = Σ dose/volume ·
e^(−k(t − n·interval)), k = ln 2 / halfLife; constants `volume`, `interval`, `horizon`;
state `dose`, `halfLife`), `decay` (N = initial · 2^(−t/halfLife)), `logistic`
(P = capacity / (1 + (capacity/start − 1) e^(−rate·t))) and `sine` (the default
fixture). A curve that leaves a fixed axis says so instead of rescaling. Mesh kinds draw
the file's triangles with a depth buffer, so what is hidden at an angle is really
hidden — check any claim about visibility at the angle the page shows.

## 10. Media and 3D boundaries

**Video and audio:** local files, poster, captions or transcript, native controls,
failure fallback. Handle the `play()` promise; never autoplay sound; pause on
leave, hide and export; seek after metadata. A poster image is not proof of playback.

**Mesh viewer**: `assets/runtime/mesh.js` parses ASCII/binary STL and simple OBJ
(up to 8 MiB / 40 000 triangles); the `cad-*` kinds in `widgets.js` draw the triangles
with their own depth-buffered rasterizer (hidden surfaces are exact at every angle),
color and label OBJ groups, orbit, explode by named groups, and cut away by clipping
triangles — not a capped CAD section, not STEP, units unknown unless supplied
(`scaleBar` states them). For material-aware 3D integrate an approved, pinned local renderer
(e.g. `<model-viewer>`) with a poster that stands alone when WebGL is unavailable,
and record the conversion (source format, units, tessellation, omitted materials).

External iframes and live web demos need explicit permission, a sandbox, a network
disclosure and a static fallback. See [working agreements](working-agreements.md#trust-boundaries).
W3C guidance on motion, focus and media is listed in [primary references](working-agreements.md#primary-references).
