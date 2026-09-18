# Company templates and reusable brand systems

Two routes serve different needs. **Adaptive identity** preserves brand rules while
an agent designs new compositions from the content. **Fixed native templates** offer
approved reusable PowerPoint layouts. Neither route means importing company material
into the public skill or reproducing every flaw of a reference deck.

## What belongs to a private brand kit

`brand.json` holds identity tokens and explicit status. `RULES.md` explains observed,
approved, immutable and flexible choices. Approved logo/image files live alongside
it under their original rights. `observations.json` records extraction evidence.
Proof pages stress image, table, data, long title, quiet statement and localized copy.

Keep this kit in the user's project, not in the installed OSS skill. Do not infer
company names, brands or employee details from personal memory. Do not bundle source
slides, staff names or confidential data in public examples.

## Capture an existing PowerPoint reference

```sh
python "$SKILL_DIR/scripts/brand-capture.py" reference.pptx --out ./private-brand
node "$SKILL_DIR/scripts/brand.mjs" validate ./private-brand/brand.json --allow-draft
node "$SKILL_DIR/scripts/brand.mjs" proof ./private-brand/brand.json \
  --out ./private-brand/proof.html --allow-draft
```

Capture reads theme colors/families, direct style counts, canvas dimensions, layout
and slide shape geometry. It **does not copy the source slide text, notes, source
filenames, thumbnails or media**. Font names and style observations are still part
of a private identity. No external network is used. It refuses oversized archives
and does not overwrite an existing output directory.

The output is a **draft proposal**, not an automatically approved brand. It does
not fully resolve group transformations or all master/layout inheritance. Default
muted colors, type sizes and gaps are clearly unapproved starter values. Render the
actual reference before deciding that these observations are intended design rules.
A repeated mistake is still a mistake, not a brand invariant.

For PDF/image references, use the host's document/image tools to inspect representative
pages and manually record evidenced tokens. This command does not claim PDF brand
extraction. Do not invent exact fonts from pixels when they cannot be identified.

## Define identity without freezing every composition

Record immutable details: logo proportions and clear space, approved fonts and
fallbacks, colors, source/legal requirements, and any required margin anchors.
Record flexible details: primary-media choice, figure-to-text ratio, region geometry,
annotation positions, information density and necessary new page structures.

A clean interpretation might keep text/color/image treatment constant while allowing
one page to be a dense table and another a photo with one sentence. Do not force all
of them into a 3-card grid. Conversely, do not invent new typography, colors and
motifs on every page in the name of freedom.

`brand.json` uses opaque `#RRGGBB` colors, numeric type sizes and line heights, family
lists, margin/gutter values, and an optional approved project-relative `logo` image:

```json
{"file":"assets/approved-logo.png","x":1070,"y":24,"width":140,"height":42,
 "alt":"Approved organization mark","required":true}
```

The path is illustrative; provide an actual authorized asset. The runtime uses
`object-fit:contain` and does not redraw it. Required logo omission is rejected.
Style changes in custom CSS can still violate identity; inspect the rendered output.
Token validation is not complete brand enforcement. Do not claim pixel-identical
reproduction of an arbitrary source master.

## Use the kit for original HTML

```js
import fs from 'node:fs/promises';
const brand = JSON.parse(await fs.readFile(new URL('./private-brand/brand.json',import.meta.url),'utf8'));
export default {
  title:'Actual presentation', language:'en', brand,
  css: '/* Author subject-specific regions using --brand-* tokens. */',
  slides: [/* Real audience content and evidence. */]
};
```

Review and set `status:'approved'` only when the identity is actually established by
approved instructions/reference or approval. For a proposal, retain `draft:true` on
the deck and preview with `--allow-draft`; do not evade the status gate.

Brand image paths resolve from the deck project. Copy approved kit assets there or
adjust paths deliberately. `brand.mjs css` writes reusable CSS; `brand.mjs proof`
creates six contrasting HTML proof pages. The shipped example kit is fictional.

## Produce a reusable native PowerPoint template

```sh
python "$SKILL_DIR/scripts/brand-template.py" private-brand/brand.json \
  --out company-template.potx
```

This builds an actual `.potx` with theme colors/fonts, a shared slide master and
six named placeholder layouts: title, evidence, comparison, image/
caption, dense information and quiet close. The template contains editable starter
slides. They are intentionally placeholders, not a finished audience deck.

It can also generate `.pptx`. To populate the same named layouts from approved copy:

```json
[
  {"layout":0,"title":"Actual opening title","body":["Actual subtitle"]},
  {"layout":2,"title":"A supported comparison","body":["Condition A","Condition B"]}
]
```

Save that as `content.json` and pass `--content content.json --out presentation.pptx`.
Layout indices are 0–5. More intricate charts/images/novel native layouts still need
authoring; these six layouts are a starting library, not a creativity limit. A PPTX
produced this way still needs copy, overflow and visual review.

Native logo insertion accepts project-local PNG/JPEG/WebP; prepare an approved
raster derivative separately when the source logo is SVG. Logo aspect ratio is
preserved in starter slides. The current native route does not automatically add
that image to every future arbitrary slide master. It does not import arbitrary
original masters, proprietary fonts, animations or complex theme effects.

## Approve by stress testing

Test the real longest heading, a dense comparison, negative/large data values,
image crops, required source text, target languages and selected animation states.
Check the requested native application where available; a successful Office XML
parse is not proof of identical rendering in PowerPoint and Keynote.

Version the kit separately from the skill. Keep a short change log of what became
an invariant and why. Re-run contrasting proof pages when typography, margins or
logo clear space changes. Do not publish a private kit merely because the skill is OSS.

A ready-to-inspect fictional native template is included at [`assets/brands/example.potx`](../assets/brands/example.potx). Its
starter text is deliberately placeholder text, not a finished audience deck.
