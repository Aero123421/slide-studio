# Authoring guide

Start with the story contract. Author with the default HTML route (`craft.mjs`, below);
use the structured JSON route (`studio.mjs`) when the deliverable must be a native,
editable PowerPoint.

---

## Story and evidence contract

`story.json` is the smallest useful source of truth for a substantial deck. It is
not a rigid script or slide schema. The included `editorial.py` checks field
relationships and obvious editorial hazards; it cannot establish truth.

```json
{
  "language": "en",
  "audience": "Researchers who know the method but not this experiment",
  "outcome": "Understand the measured difference and its limitations",
  "sources": [{"id":"data-1","locator":"data/results.csv","kind":"supplied-data"}],
  "slides": [{
    "id":"result",
    "job":"Compare the two conditions on the same scale",
    "title":"The paired measurements differ by 3 units in this sample",
    "claim":"The observed paired difference in this sample is 3 units.",
    "status":"observed",
    "evidence":["data-1"],
    "visual":"Paired dots with an interval; same units and baseline",
    "scope":"This sample and protocol, not a population-wide guarantee",
    "static":"Keep both conditions, interval definition, and source label"
  }]
}
```

The numbers above illustrate the file format; they are not a claim to reuse.
Allowed status: `observed`, `reported`, `inferred`, `proposed`, `illustrative`,
`unknown`. An inference needs the supporting evidence and a statement of the
inference. An illustrative diagram may carry no evidence IDs but must be labeled.
An unknown may be a question, never a decorative assertion.

“Source” may be an uploaded page, spreadsheet range, measurement file, interview
record or public primary source. Record page/section/cell/version where available.
Copy exact quotes only when justified; preserve meaning when paraphrasing. Record
units, denominator, sample size, uncertainty definition and date in the data record.

### Narrative routes, not standard outlines

Research: question → method and scope → observations → comparison → interpretation
→ limits → next falsifiable test. Education: existing mental model → conflict →
mechanism → worked example → transfer check. Product explanation: task → artifact
→ operation → boundary/failure → evidence → appropriate next action. Review:
decision → alternatives → trade-offs → recommendation with qualifications.

Reorder or omit parts when the audience already knows them. A title-only divider can
be useful rhythm, but a content-empty “Our journey” page does not earn its place.
Keep a backup appendix for optional detail rather than hiding essential evidence
behind an interaction that the final PDF cannot expose.

---

## The default route: authored decks (`craft.mjs`)

### Project setup

```sh
node "$SKILL_DIR/scripts/craft.mjs" init ./deck --language ja --colors wa-ai
```

`init` writes a self-contained project: `deck.mjs` (a draft with a computed chart),
`theme.css` (page grammar + one color system), `figure.mjs` and its `fig-*.mjs`
modules, `studio-kit.mjs`, `layout.mjs`, `quant.mjs`, `semantic-graph.mjs`,
`brief.md` and `assets/`. The project never imports from the installed skill, so
it survives skill updates and can be zipped and shared. `--colors` takes any id in
`assets/color-systems/` (default `laboratory`, `wa-ai` for Japanese).

### The deck module

`craft.mjs` imports trusted local `.mjs` — it executes JavaScript; never build a
downloaded module you have not read.

```js
import fs from 'node:fs/promises';
import { h } from './studio-kit.mjs';
import { lineChart, fmt } from './figure.mjs';

const css = await fs.readFile(new URL('./theme.css', import.meta.url), 'utf8');
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const active = [22, 25, 27, 31, 35, 38];                       // thousands, from source X
const growth = fmt((active.at(-1) / active[0] - 1) * 100, { digits: 0 });

export default {
  title: 'Activation review', language: 'en', readingMode: 'live', transition: 'fade', draft: false,
  css,
  slides: [{
    id: 'active-users', title: `Active users grew ${growth}% in six months`, className: 'st cs-laboratory',
    content: `<h1 class="st-head">Active users grew <em>${growth}%</em> in six months</h1>
      <figure class="st-fig" data-region="primary">${lineChart({ id: 'au', title: 'Active users, thousands',
        width: 1152, height: 470, x: months, series: [{ name: 'Active users', values: active }], build: { start: 1 } })}</figure>
      <p class="st-source" data-region="source"><span>Source X, monthly actives</span></p>`,
    notes: 'Say what changed in April.', sources: [{ file: 'data/actives.csv' }], exportPolicy: 'final',
  }],
  script: '', // optional trusted script, runs after the player initializes
};
```

Deck fields: `title`, `language` (BCP 47), `direction`, `width`/`height` (default
1280×720), `readingMode` (`live|read|reference|hybrid`), `transition`
(`none|fade|rise|push|zoom`), `labels` (override player chrome strings), `brand`,
`draft`, `sample`, `css`, `script`, `slides`. Slide fields: `id` (stable, unique),
`title` (accessible name — not automatically visible), `content` (HTML/SVG; no
`<script>`), `className`, `language`, `direction`, `transition`, `notes`,
`sources`, `exportPolicy`, `copyWaivers`, `widgets`.

`draft:true` blocks a final build; preview with `--allow-draft` and clear it only
after review. `sample:true` records teaching status; it adds no label — put
"illustrative data" lines where they matter. Escape external text with `h()`;
`states()`/`statesAttr()` encode state maps for attributes. Scope CSS by slide id
or class.

### Assets

`{{asset:assets/photo.jpg}}` in content or CSS embeds a local file relative to the
deck module (PNG, JPEG, WebP, SVG, MP4, WebM, WAV, MP3, VTT; ≤ 16 MiB each). Nothing
is downloaded and no fonts are embedded. `svg(file, prefix)` loads a passive local
SVG and namespaces its IDs. Inline SVG keeps geometry editable and animatable; an
SVG in `<img>` is isolated but opaque to builds.

### Library studies and templates

```sh
node "$SKILL_DIR/scripts/catalog.mjs" search "rank change over time" --limit 5
node "$SKILL_DIR/scripts/catalog.mjs" show slope-comparison
node "$SKILL_DIR/scripts/catalog.mjs" take slope-comparison ./deck/slope
```

Every catalog source is a data-driven slide module. `take` copies the module (data
and code, not a snapshot), the runtime files it imports, its CSS with only the
color system it uses, its media, a draft `deck.mjs` and `PROVENANCE.md`; it never
overwrites an existing directory. Diagram studies also carry a standalone `.svg`
with literal colors. Edit the data, headline and labels; remove `study: true`
once the page is yours. Template packs (`assets/templates/<pack>/`) are complete
art-directed page sets: data arrays at the top drive the geometry; `pack.css` is
scoped to the pack class. `take tpl-<pack> DIR` copies the whole pack (all pages,
`pack.css`, the engine) as one draft deck. Replace fictional names and synthetic numbers, keep the
"illustrative data" line until real sources replace it, and never submit a pack
unchanged. Several studies can live in one deck if their IDs and CSS scopes don't
collide — namespace repeated instances.

### Runtime API (browser)

`SlideStudio.show(index, step, {animate})`, `next()`, `prev()`, `reset()`,
`finish()`, `overview()`, `presenter()`, `blackout()`, `help()`, `setExport(bool)`,
`prepareExport()`, `getState()`, `getWidgetState(id)` and `register(id, hooks)`.
`studio:state` events carry slide, index, step, active, exporting and
reducedMotion. `data-static="show"` elements appear only in export,
`data-static="hide"` only live — give exports a meaningful fallback, not a blank.

### Helpers

- `figure.mjs` — charts, diagrams, fields, scales, text measurement, callouts
  ([Figures](figures.md)).
- `layout.mjs` — `allocate` (weighted regions), `dagLayers`, `labelRail`,
  `routeOrthogonal`: explicit fit checks that throw instead of shrinking
  (`examples/constraint-layout/deck.mjs` shows a full derivation).
- `studio-kit.mjs` — `h`, `states`, `grid`, `position`, `port`, `connector`
  (`via` puts the middle leg in a chosen gutter so it never crosses a box),
  `scaleLinear`, `contrast`, `checkBounds`, `svg`.
- `quant.mjs` and `semantic-graph.mjs` — units-checked arithmetic and relation
  validation ([Evidence](evidence-and-diagrams.md)).

`data-region="title|primary|support|source"` and `data-space-intent` are invisible
review metadata. `copyWaivers` allow an exact, justified quotation of production
language ([copy channels](writing-and-editing.md)). An approved `brand` object is
validated and exposed as `--brand-*` variables. `build --strip-notes` writes the
audience copy; `build` refuses to overwrite without `--force`. Run `validate`,
`editorial.py` and `qa.py`, then look at the slides.

---

## Structured authoring

### Commands and files

Run scripts using their absolute path. They do not rely on the skill being the working directory.

- `studio.mjs list`: layout IDs and bundled theme IDs.
- `studio.mjs init DIR --example executive`: copy one worked deck (and the images it uses, into `DIR/media/`) without overwriting.
- `studio.mjs validate deck.json`: check data, fit estimates, and bounds.
- `studio.mjs build deck.json --out deck.html`: self-contained HTML plus `deck.scene.json`.
- `export-pptx.mjs deck.html deck.pptx --mode editable`: native PowerPoint from the same scene (see below).
- `studio.mjs brand "Company" --out theme.json --base neutral`: draft theme tokens.
- `inspect-brand.py template.pptx --out brand-inspection.json`: inspect source theme/layout facts; no invented brand authority.
- `lint.mjs deck.json`: writing/evidence/rhythm warnings.

Use `--force` only when replacing generated output intentionally. Retain the editable JSON with the deliverable. Do not hand-edit the HTML and then expect editable PPTX export to reflect those edits.

### What the engine decides, and what you decide

The compiler owns the page: a 12-column grid (74 px columns, 24 px gutters, 64 px margins on
1280×720), a headline at most two lines high, an evidence region of 1152×452 px under it, and one
quiet footer line (source or sample note on the left, deck name and page number on the right).
Type sizes belong to the layout and scale with the number of items, never with the length of
the copy: headline 36–44 px (theme `titleSize`), body 20–26 px (`bodySize`), labels and axes
16–18 px, footer 15 px. Copy that does not fit raises `text does not fit … Shorten or change
layout` instead of shrinking or clipping; shorten it or choose another layout.

You decide the claim and the emphasis. Write every content title as the specific claim the page
proves. Colour follows that claim: ink and greys carry the page and the theme accent marks only
the item the title is about. Set `highlight` (an index, a label, a list of either, or `null` for
none); without it, data labels named in the title are accented. Numbers appear on steps and agenda
rows only with `numbered: true`, for a sequence the audience must follow.

Charts take round axis ticks from the figure engine (`niceDomain`/`ticks`), state the unit once
(`unit`), label values directly and keep a zero baseline; bar and waterfall charts drop the value
axis because every bar carries its label. Japanese copy wraps between phrases and keeps numbers
with their units; put a deliberate `\n` in titles where the phrase breaks best.

### Start from a close example

`assets/examples/`: executive (decision: month-end close), talk (stage, dark theme), casual
(workshop, with a photo), technical (engineering: idempotent API), editorial (self-read),
training (practice), patterns (all 25 layouts as one café-chain proposal). `commented-deck.mjs`
shows how to generate JSON with explanatory comments. Node 20+ is the baseline; HTML generation
has no package dependency.

```json
{
  "version": 1,
  "title": "運用改善の提案",
  "language": "ja",
  "theme": "neutral",
  "sample": false,
  "brand": { "footer": "運用改善の提案", "name": "Company" },
  "slides": [{
    "id": "time-comparison",
    "layout": "bar",
    "title": "確認作業を月25時間に抑えた",
    "unit": "時間／月",
    "highlight": "改善後",
    "data": [{"label":"改善前","value":40},{"label":"改善後","value":25}],
    "notes": "測定期間と対象範囲を口頭でも補足する。",
    "sources": [{"file":"user-report.xlsx","title":"対象部署、8月集計"}]
  }]
}
```

The numbers above illustrate the schema; they are not evidence for a real claim. Replace with source-backed data. Keep `sample:true` in fictional demonstration decks; data pages then say so in the footer.

### Common fields

`layout`, `title` required. Optional `id` (unique; not `prev`, `next`, `overview`, `notes`,
`full` or `announce`, which the player uses), `kicker` (a short label above the title in the deck
language), `notes`, `sources` (strings or `{title, file, url}`; shown in the footer and the speaker
notes), and `chrome:false` to omit the title, kicker, logo and footer for a full-bleed page.
`reveal:[elementId,…]` assigns builds 1, 2, … in that order; `build:'content'` reveals everything
below the title at step 1 and `build:'sequential'` reveals items (columns, steps, bars, points)
one at a time. `theme` is a bundled name, an inline token object, or a JSON path relative to the
deck. CLI `--theme path.json` is relative to the working directory. Local image paths are
relative to the deck JSON. Assets are embedded; network fetches are not implicit.

`brand.footer` replaces the deck title in the footer. `brand.logo` is a local image path with `brand.name` for alt text; the logo frame is 120×42 px at the top right, and titles narrow to make room. For a brand requiring another placement/clear space, adapt the layout before calling it compliant.

Themes set `paper`, `ink`, `accent` (one), `secondary` (kept for compatibility), `font`,
`headingFont`, `radius`, `titleSize`, `bodySize`. The compiler derives the rest: muted text at
≥ 4.5:1, hairlines, the accent tint, and greys for marks that are not "this".

### Layout fields and intended use

| Layout | Required or relevant fields | Capacity / use |
|---|---|---|
| cover | `body`, `kicker`, `byline` optional | Short title; purposeful line break |
| statement | `body` optional | One big claim or question |
| section | `number`, `body` optional | Chapter transition; the number is set small, as navigation |
| agenda | `items: (string \| {title, body?})[]`, `numbered?` | 1–5 rows across the page; `body` for a duration or owner |
| split | `leftTitle,leftBody,rightTitle,rightBody` | Two related arguments, not two unrelated piles |
| metric | `value,label`, `body,baseline` optional; `breakdown:[{label,value}]`, `breakdownUnit?`, `highlight?` | One primary number with context; a breakdown draws signed parts as bars |
| metrics | `items:[{value,label,note?}]`, `highlight?` | 2–4 metrics; a unit after the figure (`84%`, `100時間`) is set smaller |
| quote | `attribution` | Exact sourced quote, or explicit sample; quotation marks are added if absent |
| comparison | `items:[{title,body?,facts?:[[label,value]]}]`, `highlight?` | 2–3 options; `facts` line up across options; the recommended one sits on a tinted panel |
| table | `columns,rows`, `widths,numericColumns,highlight` optional | 2–6 columns, 1–6 data rows; a native table in PPTX |
| bar | `data:[{label,value}],unit,highlight?` | 1–12 values; signed values supported; zero baseline |
| line | `data:[{label,value}],unit,highlight?` | Ordered observations; the latest value is "this" by default |
| stacked | `data:[{label,values:[]}],series:[],unit,highlight?` | 1–4 nonnegative series; series named beside the last bar |
| waterfall | `data:[{label,value,total?}],unit,highlight?` | `total:true` resets total; other values are signed deltas; totals in ink |
| donut | `data:[{label,value}],unit,center?,centerLabel?,highlight?` | 1–6 parts; labels beside the ring; the centre states the total and what it counts |
| scatter | `data:[{x,y,label?}],unit,xLabel?,highlight?` | Numeric x/y; every labelled point placed clear of the others; no causal claim by default |
| timeline | `items:[{date,title,body?}]`, `highlight?` | 2–5 milestones; equal spacing, not duration-proportional |
| process | `items:[{title,body?}]`, `numbered?` | 2–4 steps, set as a descending staircase |
| matrix | `items:[{title,body}],xLabel,yLabel,highlight?` | Exactly four cells; top-left, top-right, bottom-left, bottom-right |
| architecture | `nodes:[{id,label,body?,accent?, x,y,w,h \| col,row}]`, `links:[{from,to,label?,dashed?,arrow?}]` | 1–12 nodes; omit coordinates and give `col`/`row` for automatic layout |
| code | `code,explanation` | Short excerpt: 10 lines at 22 px, 13 lines at most |
| equation | `equation,body?` | Unicode/plain equation; complex math: render TeX/SVG through an available math engine |
| image | `src,alt,body?,fit?` | Local PNG/JPEG/WebP/SVG; cover or contain; full width without `body` |
| closing | `body,kicker` optional | Decision, action, or synthesis |
| freeform | `elements:[]` | Deliberate custom composition using the scene primitives |

Keep titles brief enough for their allotted two lines. A large room may require fewer items than the maximum. Structural limits prevent predictable overflow; they do not prescribe an arbitrary number of ideas.

### Scene primitives for custom work

Each element uses `type,x,y,w,h` and an integer `step`. Types: `text`, `rect`, `ellipse`, `line`,
`image`, `svg` (freeform accepts these); the compiler also emits `path` (chart lines, donut
rings, staircase rules) and `table`. Use stable unique `id` values to identify custom objects.
All dimensions are px on a 1280×720 canvas.

- Text: `text,size,font,color,weight,align,lineHeight`. Use normal font names and #RRGGBB colors. Meaningful explicit newlines are retained; a blank line starts a new paragraph with half a line of space (`paraGap`). Compiled text may carry `runs` (one line in several sizes, such as a figure and its unit), `numeric` (tabular figures) and `tracking` (em).
- Shapes: `fill,stroke,strokeWidth,radius`. Set fill/stroke to `none` when absent.
- Colours are #RRGGBB, or a theme role (`ink`, `paper`, `muted`, `accent`, `line`, `grid`, `tint`, `context`, `series`) so the page follows a change of theme.
- Line: positive bounding size; optional `x1,y1,x2,y2` for direction, `arrow:'end'|'start'|'both'` and `dash:true`. Keep connectors behind labels/nodes.
- Path: `d` is a list of `['M',x,y]`, `['L',x,y]`, `['A',cx,cy,r,startDeg,endDeg]` (the pen is at the arc's start) and `['Z']`.
- Image: local `src`, meaningful `alt`, `fit`. SVG: literal `svg` markup, `alt`; no scripts, active embeds, or external references.
- Every compiled element also carries `role` (`title`, `body`, `label`, `data`, `axis`, `mark`, `source`, …), used for HTML semantics (`h1`, `data-region`), build steps and PPTX shape names.

The freeform layout keeps the standard header/footer unless the slide sets `chrome:false`; use that for a full-bleed native composition. Do not place a second title over an existing one.

### Editable PowerPoint

`export-pptx.mjs --mode editable` turns the scene into native objects: each slide title is a real
title placeholder (outline view, accessibility checker), text boxes keep the measured line breaks
as soft breaks (Shift+Enter) with exact line spacing and the deck language, tables are PowerPoint
tables, chart lines and donut rings are freeform shapes, connectors carry arrowheads, and the
theme fonts follow the deck. Nothing on a chart page is a picture; only `image`/`svg` nodes stay
pictures. Render the PPTX (for example through LibreOffice to PDF) and look at it as well as the HTML.

### Iterating without losing control

1. Build two representative pages (dense and sparse) first when inventing a new direction.
2. Read the explicit error. Fix that slide's copy, data shape, or chosen composition.
3. Generate the rest. Measure/render all pages, not just the attractive opener.
4. If you add a new compiler layout, add one positive example plus an edge-case check. Do not mirror every line of code in a test.
5. Retain sources, notes, theme tokens, JSON, and exported files together.

Supported does not mean unlimited: right-to-left shaping, native chart workbooks, embedded fonts, inherited PPTX masters, and arbitrary CSS-to-editable-PPTX conversion are outside this small engine. Use an appropriate native/library workflow when the user needs those capabilities.
