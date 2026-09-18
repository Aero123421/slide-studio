// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "error-bars",
  "title": "Point estimates and intervals",
  "notes": "Purpose: Expose uncertainty around group estimates\nModify: Rewrite labels, recompute geometry from source data, adapt framing and orientation.\nInvariant: Label interval type, sample size and estimator.\nStatic: Already static; preserve semantic labels and readable strokes.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/svg/error-bars.svg"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Point estimates and intervals</h1><p class=\"g-purpose\">Expose uncertainty around group estimates</p><div class=\"g-demo\"><svg aria-labelledby=\"g-error-bars-error-bars-title g-error-bars-error-bars-desc\" role=\"img\" viewbox=\"0 0 800 440\" xmlns=\"http://www.w3.org/2000/svg\"><title id=\"g-error-bars-error-bars-title\">Point estimates and intervals</title><desc id=\"g-error-bars-error-bars-desc\">Expose uncertainty around group estimates. Original schematic. Values are illustrative, not measured.</desc><g data-part=\"drawing\"><line stroke=\"#17252d\" stroke-width=\"2\" x1=\"90\" x2=\"720\" y1=\"350\" y2=\"350\"></line><line stroke=\"#17252d\" stroke-width=\"2\" x1=\"90\" x2=\"90\" y1=\"70\" y2=\"350\"></line><line stroke=\"#28617b\" stroke-width=\"3\" x1=\"180\" x2=\"180\" y1=\"200\" y2=\"290\"></line><line stroke=\"#28617b\" stroke-width=\"2\" x1=\"168\" x2=\"192\" y1=\"200\" y2=\"200\"></line><line stroke=\"#28617b\" stroke-width=\"2\" x1=\"168\" x2=\"192\" y1=\"290\" y2=\"290\"></line><circle cx=\"180\" cy=\"245\" fill=\"#ae4f31\" r=\"8\"></circle><line stroke=\"#28617b\" stroke-width=\"3\" x1=\"330\" x2=\"330\" y1=\"125\" y2=\"215\"></line><line stroke=\"#28617b\" stroke-width=\"2\" x1=\"318\" x2=\"342\" y1=\"125\" y2=\"125\"></line><line stroke=\"#28617b\" stroke-width=\"2\" x1=\"318\" x2=\"342\" y1=\"215\" y2=\"215\"></line><circle cx=\"330\" cy=\"170\" fill=\"#ae4f31\" r=\"8\"></circle><line stroke=\"#28617b\" stroke-width=\"3\" x1=\"480\" x2=\"480\" y1=\"155\" y2=\"245\"></line><line stroke=\"#28617b\" stroke-width=\"2\" x1=\"468\" x2=\"492\" y1=\"155\" y2=\"155\"></line><line stroke=\"#28617b\" stroke-width=\"2\" x1=\"468\" x2=\"492\" y1=\"245\" y2=\"245\"></line><circle cx=\"480\" cy=\"200\" fill=\"#ae4f31\" r=\"8\"></circle><line stroke=\"#28617b\" stroke-width=\"3\" x1=\"630\" x2=\"630\" y1=\"70\" y2=\"160\"></line><line stroke=\"#28617b\" stroke-width=\"2\" x1=\"618\" x2=\"642\" y1=\"70\" y2=\"70\"></line><line stroke=\"#28617b\" stroke-width=\"2\" x1=\"618\" x2=\"642\" y1=\"160\" y2=\"160\"></line><circle cx=\"630\" cy=\"115\" fill=\"#ae4f31\" r=\"8\"></circle></g></svg>\n</div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/svg/error-bars.svg</code></div>"
};
