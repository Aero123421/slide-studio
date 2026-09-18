# Authoring API and project layout

## The default authored module

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

## Assets

`{{asset:assets/photo.jpg}}` in content or CSS embeds a local file relative to the
deck module's directory. PNG/JPEG/WebP/SVG/MP4/WebM/WAV/MP3/VTT are supported. Each
asset is bounded to 16 MiB. Large media should use an intentional local asset bundle.
The tool does not download files or embed fonts. `svg(file,prefix)` loads inspected
passive local SVG and namespaces IDs. Inline SVG exposes editable geometry; an SVG
in an `<img>` is easier to isolate but cannot be animated by selecting its internals.

## Studies and adaptation

`catalog.mjs search`, `show` and `take` help retrieve a small number of relevant
examples. `take` writes a new directory with editable `.mjs`, CSS and required local
media; it never overwrites an existing directory. It also writes provenance notes.
The resulting `deck.mjs` can be built directly. Built-in widgets depend on the
installed runtime at build time, not on a network at viewing time.

Every catalog source exports a slide object. It may be imported into an authored
deck, but content, CSS and IDs must be coordinated. Copy and namespace repeated
instances. Do not include duplicate slide or SVG IDs. Better results often come
from changing the source substantially rather than combining entire finished slides.

## Runtime

`SlideStudio.show(index,step,{animate})`, `next()`, `prev()`, `reset()`, `finish()`,
`overview()`, `setExport(bool)`, `prepareExport()`, `getState()`, `getWidgetState(id)`
and `register(id,hooks)` are available in the browser. `register` returns an unregister
function. The `studio:state` event includes slide, index, step, active, exporting and
reducedMotion. It is for lifecycle-aware components, not a replacement for source data.

`data-static="show"` is hidden during presentation and visible during export.
`data-static="hide"` does the reverse. Provide a real meaningful fallback, not a
blank rectangle. Custom media/Canvas must implement onExport and onLeave behavior.
The default API does not magically convert WebGL into vector PDF.

## Geometry helpers

`grid` computes rectangles; `position` emits CSS bounds; `port` and `connector`
calculate orthogonal endpoints; `scaleLinear` maps finite data; `contrast` computes
opaque color contrast; `checkBounds` flags invalid rectangles. They are useful
primitives, not an automatic layout optimizer or a visual quality scorer.

Run `craft.mjs validate` for schema and script parsing, `editorial.py` for story
checks, and `qa.py` for browser measurements. Inspect actual output after all three.

## Refinement support in 3.2

`craft.mjs init` also copies `layout.mjs`. Its `allocate`, `dagLayers`, `labelRail`
and `routeOrthogonal` helpers calculate geometry with explicit fit checks. They
never select a story or certify a pleasing composition. For a complete derivation
see `examples/constraint-layout/deck.mjs`; region dimensions and node relationships
come from data, not a selected template.

`data-region="title|primary|support|source"` and `data-space-intent` are invisible
review metadata. They must not become visible captions. Custom slides may use
`copyWaivers` for exact, necessary quoted production language; see
[copy channels](copy-channels.md). `study:true` belongs to teaching examples only.

A deck may include an approved `brand` object; the build validates it and supplies
`--brand-*` CSS variables. A draft identity requires an explicit draft preview.
Custom CSS can override identity, so token validation does not replace visual review.
Use `craft.mjs build ... --strip-notes` for distributable HTML without speaker notes.
