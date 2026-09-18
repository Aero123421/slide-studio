# Authoring guide

Start with the story contract, then author with either structured authoring (`studio.mjs`) or the creative authoring API (`craft.mjs`).

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

## Structured authoring

### Commands and files

Run scripts using their absolute path. They do not rely on the skill being the working directory.

- `studio.mjs list`: layout IDs and bundled theme IDs.
- `studio.mjs init DIR --example executive`: copy one worked deck without overwriting.
- `studio.mjs validate deck.json`: check data, fit estimates, and bounds.
- `studio.mjs build deck.json --out deck.html`: self-contained HTML plus `deck.scene.json`.
- `studio.mjs brand "Company" --out theme.json --base neutral`: draft theme tokens.
- `inspect-brand.py template.pptx --out brand-inspection.json`: inspect source theme/layout facts; no invented brand authority.
- `lint.mjs deck.json`: writing/evidence/rhythm warnings.

Use `--force` only when replacing generated output intentionally. Retain the editable JSON with the deliverable. Do not hand-edit the HTML and then expect editable PPTX export to reflect those edits.

### Start from a close example

`assets/examples/`: executive (decision), talk (stage), casual (workshop), technical (engineering), editorial (self-read), training (practice), patterns (layout coverage). `commented-deck.mjs` shows how to generate JSON with explanatory comments. Node 20+ is the baseline; HTML generation has no package dependency.

```json
{
  "version": 1,
  "title": "運用改善の提案",
  "language": "ja",
  "theme": "neutral",
  "sample": false,
  "brand": { "footer": "Operations / September", "name": "Company" },
  "slides": [{
    "id": "time-comparison",
    "layout": "bar",
    "title": "確認作業を月25時間に抑えた",
    "unit": "時間 / 月",
    "data": [{"label":"改善前","value":40},{"label":"改善後","value":25}],
    "notes": "測定期間と対象範囲を口頭でも補足する。",
    "sources": [{"file":"user-report.xlsx","title":"対象部署、8月集計"}]
  }]
}
```

The numbers above illustrate the schema; they are not evidence for a real claim. Replace with source-backed data. Keep `sample:true` in fictional demonstration decks; a visible DEMO marker is added.

### Common fields

`layout`, `title` required. Optional `id` (unique), `kicker`, `notes`, `sources`. `theme` is a bundled name, an inline token object, or a JSON path relative to the deck. CLI `--theme path.json` is relative to the working directory. Local image paths are relative to the deck JSON. Assets are embedded; network fetches are not implicit.

`brand.footer` changes the footer. `brand.logo` is a local image path with `brand.name` for alt text. The small standard logo frame is 120×42 px; for a brand requiring another placement/clear space, adapt the layout before calling it compliant.

### Layout fields and intended use

| Layout | Required or relevant fields | Capacity / use |
|---|---|---|
| cover | `body`, `kicker`, `byline` optional | Short title; purposeful line break |
| statement | `body` optional | One big claim or question |
| section | `number`, `body` optional | Chapter transition |
| agenda | `items: string[]` | 1–5 items |
| split | `leftTitle,leftBody,rightTitle,rightBody` | Two related arguments, not two unrelated piles |
| metric | `value,label`, `body,baseline` optional | One primary number with context |
| metrics | `items:[{value,label,note?}]` | 2–4 metrics |
| quote | `attribution` | Exact sourced quote, or explicit sample |
| comparison | `items:[{title,body}],highlight?` | 2–3 options; highlight is zero-based |
| table | `columns,rows`, `widths,numericColumns,highlight` optional | 2–6 columns, 1–6 data rows; numeric columns right-align |
| bar | `data:[{label,value}],unit,highlight?` | 1–12 values; signed values supported; zero baseline |
| line | `data:[{label,value}],unit` | Ordered observations; spacing is categorical/equal |
| stacked | `data:[{label,values:[]}],series:[],unit` | 1–4 nonnegative series; consistent series length |
| waterfall | `data:[{label,value,total?}],unit` | `total:true` resets total; other values are deltas |
| donut | `data:[{label,value}],unit,center?` | 1–5 nonnegative parts; positive total; angular share computed |
| scatter | `data:[{x,y,label?}],unit,xLabel?` | Numeric x/y; no causal claim by default |
| timeline | `items:[{date,title,body?}]` | 2–5 milestones; equal spacing, not duration-proportional |
| process | `items:[{title,body?}]` | 2–4 steps |
| matrix | `items:[{title,body}],xLabel,yLabel,highlight?` | Exactly four cells; top-left, top-right, bottom-left, bottom-right |
| architecture | `nodes:[{id,x,y,w,h,label,accent?}],links:[{from,to,label?}]` | 1–12 nodes; manually place concise nodes in content area |
| code | `code,explanation` | Short code excerpt; roughly 10 lines at default size |
| equation | `equation,body?` | Unicode/plain equation; complex math: render TeX/SVG through an available math engine |
| image | `src,alt,body,fit?` | Local PNG/JPEG/WebP/SVG; cover or contain |
| closing | `body,kicker` optional | Decision, action, or synthesis |
| freeform | `elements:[]` | Deliberate custom composition using the scene primitives |

Keep titles brief enough for their allotted two lines. A large room may require fewer items than the maximum. Structural limits prevent predictable overflow; they do not prescribe an arbitrary number of ideas.

### Scene primitives for custom work

Each element uses `type,x,y,w,h`. Types: `text`, `rect`, `ellipse`, `line`, `image`, `svg`. Use stable unique `id` values to identify custom objects. All dimensions are px on a 1280×720 canvas.

- Text: `text,size,font,color,weight,align,lineHeight`. Use normal font names and #RRGGBB colors. Meaningful explicit newlines are retained.
- Shapes: `fill,stroke,strokeWidth,radius`. Set fill/stroke to `none` when absent.
- Line: positive bounding size; optional `x1,y1,x2,y2` for direction. Keep connectors behind labels/nodes.
- Image: local `src`, meaningful `alt`, `fit`. SVG: literal `svg` markup, `alt`; no scripts, active embeds, or external references.
- Build: `step` integer 0+; see motion reference.

The freeform layout still has a standard header/footer. For a true full-bleed custom page, use the standalone animated HTML recipe and fidelity export, or intentionally extend the compiler. Do not place a second title over the existing one.

### Iterating without losing control

1. Build two representative pages (dense and sparse) first when inventing a new direction.
2. Read the explicit error. Fix that slide's copy, data shape, or chosen composition.
3. Generate the rest. Measure/render all pages, not just the attractive opener.
4. If you add a new compiler layout, add one positive example plus an edge-case check. Do not mirror every line of code in a test.
5. Retain sources, notes, theme tokens, JSON, and exported files together.

Supported does not mean unlimited: right-to-left shaping, native chart workbooks, embedded fonts, inherited PPTX masters, and arbitrary CSS-to-editable-PPTX conversion are outside this small engine. Use an appropriate native/library workflow when the user needs those capabilities.

---

## Authoring API and project layout

The following covers the creative `craft.mjs` API and project layout, distinct from the structured `studio.mjs` workflow above.

### The default authored module

`craft.mjs` imports trusted local `.mjs`; this executes JavaScript. It is not a
sandbox for downloaded modules. Author source in the project, not the installed skill.

```js
import {h, states} from './studio-kit.mjs';
export default {
  title: 'A specific explanatory title', language: 'en',
  width: 1280, height: 720, direction: 'ltr', draft: false,
  css: '.slide{background:#fff;color:#182b36} .result{padding:64px}',
  slides: [{
    id: 'result', title: 'Accessible title', className: 'result',
    content: `<h1>${h('The content-specific claim')}</h1>
      <p data-step="1">The qualification that belongs to it.</p>`,
    notes: 'Presenter notes and scope.', sources: [], exportPolicy: 'final'
  }],
  script: '' // Optional trusted script executed after the player initializes.
};
```

The accessible `title` is not automatically a visible heading. Author the page's
actual content. No mandatory header, footer, watermark, grid or layout ID is imposed.
The starter has `draft:true`; preview with `--allow-draft`. Replace it before marking
the deck finished. `sample:true` records teaching status but does not insert a label:
put visible synthetic/evidence labels where they matter.

`content` is authored HTML/SVG. Script tags inside it are rejected; put code in
`deck.script`. Escape external text with `h()`. `states()` encodes state JSON for
HTML attributes. Styles are authored CSS; scope local exceptions by slide ID/class.

### Assets

`{{asset:assets/photo.jpg}}` in content or CSS embeds a local file relative to the
deck module's directory. PNG/JPEG/WebP/SVG/MP4/WebM/WAV/MP3/VTT are supported. Each
asset is bounded to 16 MiB. Large media should use an intentional local asset bundle.
The tool does not download files or embed fonts. `svg(file,prefix)` loads inspected
passive local SVG and namespaces IDs. Inline SVG exposes editable geometry; an SVG
in an `<img>` is easier to isolate but cannot be animated by selecting its internals.

### Studies and adaptation

`catalog.mjs search`, `show` and `take` help retrieve a small number of relevant
examples. `take` writes a new directory with editable `.mjs`, CSS and required local
media; it never overwrites an existing directory. It also writes provenance notes.
The resulting `deck.mjs` can be built directly. Built-in widgets depend on the
installed runtime at build time, not on a network at viewing time.

Every catalog source exports a slide object. It may be imported into an authored
deck, but content, CSS and IDs must be coordinated. Copy and namespace repeated
instances. Do not include duplicate slide or SVG IDs. Better results often come
from changing the source substantially rather than combining entire finished slides.

### Runtime

`SlideStudio.show(index,step,{animate})`, `next()`, `prev()`, `reset()`, `finish()`,
`overview()`, `setExport(bool)`, `prepareExport()`, `getState()`, `getWidgetState(id)`
and `register(id,hooks)` are available in the browser. `register` returns an unregister
function. The `studio:state` event includes slide, index, step, active, exporting and
reducedMotion. It is for lifecycle-aware components, not a replacement for source data.

`data-static="show"` is hidden during presentation and visible during export.
`data-static="hide"` does the reverse. Provide a real meaningful fallback, not a
blank rectangle. Custom media/Canvas must implement onExport and onLeave behavior.
The default API does not magically convert WebGL into vector PDF.

### Geometry helpers

`grid` computes rectangles; `position` emits CSS bounds; `port` and `connector`
calculate orthogonal endpoints; `scaleLinear` maps finite data; `contrast` computes
opaque color contrast; `checkBounds` flags invalid rectangles. They are useful
primitives, not an automatic layout optimizer or a visual quality scorer.

Run `craft.mjs validate` for schema and script parsing, `editorial.py` for story
checks, and `qa.py` for browser measurements. Inspect actual output after all three.

### Refinement support in 3.2

`craft.mjs init` also copies `layout.mjs`. Its `allocate`, `dagLayers`, `labelRail`
and `routeOrthogonal` helpers calculate geometry with explicit fit checks. They
never select a story or certify a pleasing composition. For a complete derivation
see `examples/constraint-layout/deck.mjs`; region dimensions and node relationships
come from data, not a selected template.

`data-region="title|primary|support|source"` and `data-space-intent` are invisible
review metadata. They must not become visible captions. Custom slides may use
`copyWaivers` for exact, necessary quoted production language; see
[copy channels](writing-and-editing.md). `study:true` belongs to teaching examples only.

A deck may include an approved `brand` object; the build validates it and supplies
`--brand-*` CSS variables. A draft identity requires an explicit draft preview.
Custom CSS can override identity, so token validation does not replace visual review.
Use `craft.mjs build ... --strip-notes` for distributable HTML without speaker notes.

