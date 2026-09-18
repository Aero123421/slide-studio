# Diagrams, SVG and quantitative honesty

Before drawing, use the [numeric and relationship contract](numbers-and-diagram-truth.md). Geometry alone cannot validate the meaning of an arrow.

## Build from a model of the relationship

List entities, edges, membership, order, quantities, units and uncertainty before
placing shapes. Choose the encoding that answers the question. Position is useful
for comparison; arrows for directed relationships; containment for membership;
length for magnitude on a shared baseline. Do not let decorative shape imply a
relationship that is not present.

SVG assets in `assets/svg` are inspectable schematics. Each diagram is also a source
study in the catalog. **Illustrative geometry must be recomputed when real data
replaces the example.** Changing a numeric label without changing a bar or interval
is a factual defect. The examples do not constitute a general charting engine.

## A safe derivation sequence

Copy the source into the project; name your intended transformation; identify the
invariants; modify geometry, labels and connections together; namespace IDs when
embedding; render the longest labels and smallest reasonable viewport; compare
first/intermediate/final states and static output; record source and changes.

For a topology change, update adjacency and visible routes, not just lines. For a
rotation from horizontal to vertical, recompute ports and annotation anchors. For
an exploded view, keep the same part IDs and ordering. For an illustration, preserve
which label points to which part. Connection endpoints belong to the subject, not
to a stale absolute pixel.

## Chart-specific invariants

Bars: common zero unless the nonzero convention is justified and clearly marked.
Slope/paired dots: match identities and use comparable scales. Part-whole: verify
denominator and sum; categories must not overlap silently. Waterfall: running totals
must reconcile; distinguish subtotal from contribution. Histogram: recompute bins;
counts or density and bin widths must match. Intervals: say whether SD, SE, CI,
credible interval or another quantity, and record how it was computed.

Scatter: do not imply causation from association. Fit/band: show model and interval
scope; interpolated appearance is not evidence. ROC/PR: axes, thresholds and class
balance matter; never infer one from the other. Confusion matrix: state class order
and normalization. Calibration: provide binning and counts where interpretation
requires them. Ablation: distinguish controlled removal from an unrelated baseline.

Tables: real header cells, aligned units, missing values distinguished from zero,
consistent precision, and declared ordering. Highlight the relevant comparison
without hiding adverse rows. Small multiples need common scales when comparison
requires them. A network edge width only implies quantity if a mapping is defined.

## SVG engineering

Use a meaningful `viewBox`, accessible title/description, and named groups or
`data-part` attributes. Keep a consistent line vocabulary. Prefer group transforms
for coupled labels and shapes. Namespaced IDs avoid collisions in gradients, masks,
markers and `aria-labelledby`. Do not reuse source IDs across multiple instances.

Avoid external references, embedded scripts and event handlers in imported SVG.
`namespaceSvg()` accepts a conservative passive subset; rejection is a request to
inspect and adapt the source, not permission to disable checks. It is not a complete
hostile SVG sanitizer. XML operations in `svg-edit.py` reject entities and preserve
the original, but the author still owns geometric and semantic correctness.

Diagram labels should remain real text where useful; do not convert all type to
paths to hide missing fonts. Stroke width, joins and arrowheads should survive the
selected export scale. Inspect paths and clipping on the actual renderer.

## Decorative geometry is a separate vocabulary

The last group of geometric SVGs is for visual identity, not data. Repetition,
contours, arcs, tessellation and clipped forms can support composition. Do not add
axes or fake numerical labels to make decoration look scientific.
