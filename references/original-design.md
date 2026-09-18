# Design a page without a template

This is a concrete route for an agent that has trouble inventing stable geometry.
It does not require asking the user to pick a style or loading hundreds of examples.
Read the [space procedure](space-budget.md) and then work through one page.

## Establish the explanation before its shape

Write the claim and its scope in one plain sentence. Name the actual relationship:
paired comparison, flow, causal hypothesis, containment, sequence, threshold,
uncertainty, spatial correspondence, evidence versus interpretation, or emphasis.
A diagram is not automatically appropriate: the original image, a table or a short
statement may be the best evidence.

Choose a reading operation: compare on an aligned axis, follow a path, find a part,
inspect a selected range, read a hierarchy, or connect an observation to its limit.
Now choose the primary medium and a subordinate treatment for supporting material.
Write a three-line plan of *content and geometry*, not a long art-direction essay.

## Build a skeleton that can fail cheaply

Create the real heading, the primary region and essential labels on a neutral canvas.
Use the real long strings, not “Title / Body / Item”. Derive dimensions from their
measured needs. Render before styling all pages. Do not mistake a finished cover for
a tested explanation. Use another page with a different density as a cross-check.

Ask: would this be comprehensible as black type and lines? If not, color and motion
will not fix the missing thought. Correct the relationship before styling it.

## Make geometry from data, not disconnected coordinates

`assets/runtime/layout.mjs` supplies:

- `allocate`: partition a region by meaningful weights and explicit gaps.
- `dagLayers`: a stable layered layout for directed acyclic graphs. Reject cycles
  or a canvas that cannot fit the nodes; preserve IDs/edges.
- `routeOrthogonal`: candidate orthogonal routes with obstacle checks. It fails
  rather than pretending it found a clear route. Complex routing still needs review.
- `labelRail`: distribute **measured-height** labels along an external rail while
  retaining their target order. Refuse labels that do not fit instead of shrinking.

These helpers are building blocks, not a general automatic graphic designer. They
must not silently change a graph's semantics, chart scale or labels. Browser text
measurement remains necessary. If a solver fails, change the orientation, region,
label wording or page decomposition. Do not weaken its constraints just to render.

## Turn a skeleton into a coherent composition

Choose one dominant hierarchy, a small set of type roles and semantic color roles.
Adjust shape language to the subject: a boundary is not a pill, a timeline is not a
row of feature cards, and a measured distribution is not an ornamental wave. Keep
strokes, corner behavior, icon scale and arrowheads internally consistent.

Use proximity to group evidence with its interpretation. Align optical edges.
Place sources where they are readable without competing with the argument. Use
photographs at a scale that lets them communicate; avoid arbitrary microthumbnails.
A new diagram can share a brand's type and colors without sharing a preset layout.

## SVG production details

Set a real `viewBox`, explicit drawing extent, unique namespaced IDs and a meaningful
accessible title/description. Put connectors behind nodes. Calculate ports at shape
boundaries, not centers behind filled objects. Give arrowheads clearance. Keep label
padding proportional to type size, not inherited from tiny icons. Use an external
rail if internal labels require crowded boxes.

For editable text, retain `<text>`/`<tspan>` when possible. Do not outline text merely
to hide font problems. Avoid arbitrary line breaks and fit-to-box shrinking. Verify
accented characters, CJK, long labels and SVG marker/clip references after embedding.

For motion, a geometry group and its attached label should usually move together.
A label that must stay upright belongs outside the rotated geometry. On SVG use
explicit `transform-box` and `transform-origin`; do not rely on accidental defaults.

## Test a new arrangement, not only a copied example

Make one controlled mutation: a label twice as long, a different node count, a
negative datum, a new column order, or a different language. It must preserve facts
and still fit. The benchmark briefs in `tests/agent-evals.json` and the examples can
help define tasks; they are not evidence that other models have been evaluated.

When the result is weak, change one cause at a time. Record the observed defect and
the concrete repair. “Make more professional” is not an actionable review finding.
