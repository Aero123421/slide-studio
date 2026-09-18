# Space is a relationship, not an occupancy target

First choose the [reading mode and density](density-and-rhythm.md); a high-positioned cluster of tiny text is not good whitespace.

An empty region can focus a claim, separate roles or preserve an image's breathing
room. It can also expose an undersized figure, an awkward title block or a detached
annotation. Never classify it only by how many pixels are blank. There is no required
filled-area percentage, golden ratio, card count or minimum number of objects.

## The constructive procedure

**1 — Identify the optical primary.** What must be readable first: the finding, a
photograph, a mechanism, a comparison, or a table? Choose this before allocating
supporting modules. A large title is not automatically the primary.

**2 — Reserve the frame.** Start with the output aspect ratio, brand clear space,
projection/reading requirements and any true footer/source needs. Reserve safe
margins. Do not inherit an arbitrary template's huge header and footer regions.

**3 — Allocate relationships.** Put the evidence and the text that interprets it near
each other. Separate independent roles with a deliberate gap. A note belongs beside
the feature it qualifies, not in the next empty corner. Equal widths are useful for
controlled comparison; otherwise they must be earned.

**4 — Measure, then draw.** Measure the longest actual label, headline and table row
in the intended font. Calculate the minimum object area from these measurements.
For SVG, distinguish the `viewBox` from the visible drawing's `getBBox()`; a huge
empty viewBox does not produce a large diagram. Measure again after labels wrap.

**5 — Adjust the optical weight.** Compare the actual masses: dark marks, type,
photographic texture, dense tables, and whitespace. A thin outline and a solid
photograph do not have equal visual weight at equal area. Align visible edges and
baselines, not only nominal wrapper rectangles.

**6 — Explain each large gap.** Is it a pause, reading separation, photo negative
space, an axis range, a brand rule or room for the next animation state? If it has
no job, move/enlarge the primary, narrow the secondary column, or restructure the
page. Do not fill the hole with icons, background blobs or unrelated text.

**7 — Stress it.** Try the longest heading, full labels, largest table, final animation
state, a reversed transition, and target language fallback. A layout that works
only with the sample labels is not reusable.

## A useful calculation, not a fixed layout

For a 1280×720 page with 64px side margins, the usable width is 1152px. A diagram
that needs an external explanation can allocate a 48px gap and divide the remaining
1104px in a 3:1 relation: 828px for evidence and 276px for a concise explanation.
These numbers are a *candidate*, not a standard. If the explanation wraps into ten
lines, change the thought, width or composition instead of pretending 276px fits.

```js
import {allocate,dagLayers,labelRail} from './layout.mjs';
const [evidence,explanation] = allocate({
  x:64, y:230, width:1152, height:410, weights:[3,1], gap:48
});
// Determine labels and their measured sizes before building nodes.
// A narrow-canvas exception from dagLayers means recompose, not disable the check.
```

## Diagnose the visible symptom

| Symptom | Check first | Useful repair |
|---|---|---|
| Small figure floating in a large empty page | SVG drawing bounds, fixed media height, huge inherited title slot | Remove viewBox padding; enlarge real geometry; free the title slot |
| Title and figure look unrelated | Gap relative to their own heights; missing verbal relationship | Move evidence closer; combine a redundant subheading; align one anchor |
| Awkward empty center | Independent absolute boxes have been pushed to corners | Recompose as a primary + rail, registered pair, or continuous sequence |
| A giant gap on one side | Nominal center differs from optical center; source image has padding | Crop transparencies; move the actual primary; preserve intentional negative space |
| Last line is a lone short phrase | The block width forces an orphan | Edit syntax or shift width locally; do not insert arbitrary `<br>` everywhere |
| Figure has ample space but labels collide | Labels added after geometry; connectors cut through text | Reserve a rail, measure text, reroute from ports, or expand the whole figure |
| Everything is equally important | Equal weights, equal boxes, equal sizes | Choose a real primary; reduce hierarchy competition rather than using more colors |
| A page feels sterile | Content has no argument or figure is a generic substitute | Improve the explanation; do not add decorative density as a reflex |
| A page feels cramped only after animation | Initial state was reviewed, final states were not | Budget maximum extents and moving labels; inspect crossing trajectories too |

## Mark the intended structure in authored HTML

`data-region="title|primary|support|source"` makes the browser report easier to read.
For an intentionally quiet primary, add a short `data-space-intent` explaining its
job. These attributes are invisible metadata. They are not audience captions.
Do not add large `data-qa-overlap` waivers to hide unresolved collisions.

The browser report provides actual text line counts, heading stacks, orphan hints,
declared-region boxes, an approximate occupied-area fraction and the largest coarse
empty rectangle. These are diagnostic clues. Decoration can game occupancy; wrapper
boxes can inflate it. Never optimize the metrics as a taste score. Read the image.

## Deck-level rhythm

Review a contact view for repeated shapes, title locations, image-to-text ratios,
background changes and density. Repetition earns its place in comparison or teaching;
random alternation does not create quality. Use quiet and dense pages where the
argument needs them. A page can depart from the usual grid while retaining typography,
color logic and alignment discipline. Company identity is not compulsory uniformity.
