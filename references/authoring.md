# Structured authoring

## Commands and files

Run scripts using their absolute path. They do not rely on the skill being the working directory.

- `studio.mjs list`: layout IDs and bundled theme IDs.
- `studio.mjs init DIR --example executive`: copy one worked deck without overwriting.
- `studio.mjs validate deck.json`: check data, fit estimates, and bounds.
- `studio.mjs build deck.json --out deck.html`: self-contained HTML plus `deck.scene.json`.
- `studio.mjs brand "Company" --out theme.json --base neutral`: draft theme tokens.
- `inspect-brand.py template.pptx --out brand-inspection.json`: inspect source theme/layout facts; no invented brand authority.
- `lint.mjs deck.json`: writing/evidence/rhythm warnings.

Use `--force` only when replacing generated output intentionally. Retain the editable JSON with the deliverable. Do not hand-edit the HTML and then expect editable PPTX export to reflect those edits.

## Start from a close example

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

## Common fields

`layout`, `title` required. Optional `id` (unique), `kicker`, `notes`, `sources`. `theme` is a bundled name, an inline token object, or a JSON path relative to the deck. CLI `--theme path.json` is relative to the working directory. Local image paths are relative to the deck JSON. Assets are embedded; network fetches are not implicit.

`brand.footer` changes the footer. `brand.logo` is a local image path with `brand.name` for alt text. The small standard logo frame is 120×42 px; for a brand requiring another placement/clear space, adapt the layout before calling it compliant.

## Layout fields and intended use

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

## Scene primitives for custom work

Each element uses `type,x,y,w,h`. Types: `text`, `rect`, `ellipse`, `line`, `image`, `svg`. Use stable unique `id` values to identify custom objects. All dimensions are px on a 1280×720 canvas.

- Text: `text,size,font,color,weight,align,lineHeight`. Use normal font names and #RRGGBB colors. Meaningful explicit newlines are retained.
- Shapes: `fill,stroke,strokeWidth,radius`. Set fill/stroke to `none` when absent.
- Line: positive bounding size; optional `x1,y1,x2,y2` for direction. Keep connectors behind labels/nodes.
- Image: local `src`, meaningful `alt`, `fit`. SVG: literal `svg` markup, `alt`; no scripts, active embeds, or external references.
- Build: `step` integer 0+; see motion reference.

The freeform layout still has a standard header/footer. For a true full-bleed custom page, use the standalone animated HTML recipe and fidelity export, or intentionally extend the compiler. Do not place a second title over the existing one.

## Iterating without losing control

1. Build two representative pages (dense and sparse) first when inventing a new direction.
2. Read the explicit error. Fix that slide's copy, data shape, or chosen composition.
3. Generate the rest. Measure/render all pages, not just the attractive opener.
4. If you add a new compiler layout, add one positive example plus an edge-case check. Do not mirror every line of code in a test.
5. Retain sources, notes, theme tokens, JSON, and exported files together.

Supported does not mean unlimited: right-to-left shaping, native chart workbooks, embedded fonts, inherited PPTX masters, and arbitrary CSS-to-editable-PPTX conversion are outside this small engine. Use an appropriate native/library workflow when the user needs those capabilities.
