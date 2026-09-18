# Inventing compositions from relationships

## A constructive grammar

First choose the relationship: comparison, sequence, containment, topology,
part-whole, uncertainty, mechanism, spatial detail, evidence-versus-interpretation,
or emphasis. Next choose a reading strategy: scan rows, follow a path, compare
registered positions, inspect a focal object, or progress through states. Only then
choose geometry and decoration.

Derive a composition through transformations: translate a cluster; change scale
hierarchies; rotate the conceptual axis; expand a selected region; split a figure
across registered views; put annotations in an external rail; turn repeated values
into small multiples; replace a diagram with the actual object plus labels; combine
an image and a shared data axis. Transform the relationship, not just the colors.

## Geometry contract

The default canvas is 1280×720 CSS pixels. It is a starting coordinate system, not a
requirement. The authoring API supports explicit width/height. For another aspect
ratio, recompose important regions; do not crop the edges or compress every element.

`grid`, `position`, `port`, `connector`, `scaleLinear`, `contrast` and `checkBounds`
in `assets/runtime/kit.mjs` are optional mathematical helpers. They do not prescribe
visual layouts. A grid cell is a coordinate box, not a card.

```js
const [figure, commentary] = grid({x:64,y:182,width:1152,height:458,
  columns:2,rows:1,gap:44});
// This symmetric grid is only a starting calculation.
figure.w = 744;
commentary.x = 856;
commentary.w = 360;
// Derive labels and connectors from these edited boxes, not stale coordinates.
```

Every essential text block needs a measured content area. Prefer flowing text in a
bounded block to manually positioned words. Use absolute coordinates for diagrams,
not to force prose into individual lines. Avoid clipping wrappers around essential
text. A clipping region is valid for deliberate photo crops and masks, not a remedy
for text that does not fit.

## Repair order for crowding

Check whether the claim is trying to do two jobs. Remove duplicate wording. Shorten
without deleting scope. Reassign space from lower-priority content. Change columns
or place labels outside the plot. Split a genuinely independent explanation onto
another page. Only then adjust a local type size within a readable role range.

Tables may need density. Do not turn a 12-row comparison into 12 oversized cards.
Align numbers by decimal or right edge, keep units explicit, and use rules sparingly.
A table with readable annotations can be a better full-slide design than a chart.

## Intentional overlap versus failure

Text may overlap an image where actual negative space and contrast support it. An
annotation may point through a diagram when the crossing is understandable. Decorative
geometry may bleed past the canvas. Mark only the specific intentional element with
`data-qa-overflow="reason"` or `data-qa-overlap="reason"`. These are review notes,
not permission to suppress all defects. Never put a waiver on the whole slide.
