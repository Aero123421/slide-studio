// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "ecdf",
  "title": "Cumulative distribution",
  "notes": "Purpose: Compare the share below a threshold\nModify: Rewrite labels, recompute geometry from source data, adapt framing and orientation.\nInvariant: Curve is monotonic and bounded by 0 and 1.\nStatic: Already static; preserve semantic labels and readable strokes.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/svg/ecdf.svg"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Cumulative distribution</h1><p class=\"g-purpose\">Compare the share below a threshold</p><div class=\"g-demo\"><svg aria-labelledby=\"g-ecdf-ecdf-title g-ecdf-ecdf-desc\" role=\"img\" viewbox=\"0 0 800 440\" xmlns=\"http://www.w3.org/2000/svg\"><title id=\"g-ecdf-ecdf-title\">Cumulative distribution</title><desc id=\"g-ecdf-ecdf-desc\">Compare the share below a threshold. Original schematic. Values are illustrative, not measured.</desc><g data-part=\"drawing\"><line stroke=\"#17252d\" stroke-width=\"2\" x1=\"90\" x2=\"720\" y1=\"350\" y2=\"350\"></line><line stroke=\"#17252d\" stroke-width=\"2\" x1=\"90\" x2=\"90\" y1=\"70\" y2=\"350\"></line><polyline fill=\"none\" points=\"100.0,340.0 180.0,340.0 180.0,310.0 260.0,310.0 260.0,250.0 340.0,250.0 340.0,210.0 430.0,210.0 430.0,150.0 520.0,150.0 520.0,110.0 620.0,110.0 620.0,65.0 700.0,65.0\" stroke=\"#28617b\" stroke-width=\"3\"></polyline><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"20\" text-anchor=\"start\" x=\"105\" y=\"50\">Cumulative fraction</text></g></svg>\n</div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/svg/ecdf.svg</code></div>"
};
