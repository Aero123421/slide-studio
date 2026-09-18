# Asset derivation, not cosmetic recoloring

Use `catalog.mjs take ID NEW_DIRECTORY` to obtain a copy, source and context. You may
change framing, topology, labels, orientation, geometry, grouping and timing. Keep
facts, identities, connections, units and rights intact. A source is a starting
material, not a required composition. When it resists the explanation, redraw it.

## Named-part editing

```sh
python scripts/svg-edit.py source.svg --inspect
python scripts/svg-edit.py source.svg --patch changes.json --out derived.svg
```

Patch format:
```json
{"changes":[{"id":"node-a","attrs":{"transform":"translate(80 20)"}},
{"id":"label-a","text":"Revised label"}]}
```

Targets must already exist and match once. Add stable IDs in your editable source
when needed. The patcher deliberately does not accept arbitrary scripts or style
sheets. Recompute shape dimensions and connected paths in source when the edit is
structural; the patcher is not a graph-layout solver. Original files and existing
outputs are protected. A SHA-256 provenance record accompanies each derived SVG.

## Concrete transformation: horizontal process to vertical explanation

Start with three entities A→B→C. Keep the three identities and two directed edges.
Choose a 540×540 region, place node centers on one x coordinate with equal y gaps,
recompute ports on bottom/top edges, then route A→B and B→C. Move every label with
its node. Put a failure branch to the side only if the subject actually has one.
Recompose the surrounding title and caption; do not merely rotate the entire SVG
and make the labels sideways. Test the longest labels before applying the style.

## Split and combine

A source layer may become a large background motif, an inset or a focused detail.
Keep evidence crops reversible; store the uncropped original. When combining SVGs,
namespace IDs with `namespaceSvg`, reconcile stroke weights and optical scale, and
remove duplicated titles/legends. Record which parts came from which source.

Review both image and story. A connected-looking line that reaches the wrong node
is worse than an imperfect color match. A labeled interval with stale geometry is
a factual defect, not a cosmetic defect. Never use a diagram as proof of data it
was not computed from.
