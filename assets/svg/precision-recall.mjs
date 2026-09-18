// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "precision-recall",
  "title": "Precision-recall curve",
  "notes": "Purpose: Show precision at changing recall\nModify: Rewrite labels, recompute geometry from source data, adapt framing and orientation.\nInvariant: Class prevalence and threshold protocol matter; not directly interchangeable with ROC.\nStatic: Already static; preserve semantic labels and readable strokes.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/svg/precision-recall.svg"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Precision-recall curve</h1><p class=\"g-purpose\">Show precision at changing recall</p><div class=\"g-demo\"><svg aria-labelledby=\"g-precision-recall-precision-recall-title g-precision-recall-precision-recall-desc\" role=\"img\" viewbox=\"0 0 800 440\" xmlns=\"http://www.w3.org/2000/svg\"><title id=\"g-precision-recall-precision-recall-title\">Precision-recall curve</title><desc id=\"g-precision-recall-precision-recall-desc\">Show precision at changing recall. Original schematic. Values are illustrative, not measured.</desc><g data-part=\"drawing\"><line stroke=\"#17252d\" stroke-width=\"2\" x1=\"90\" x2=\"720\" y1=\"350\" y2=\"350\"></line><line stroke=\"#17252d\" stroke-width=\"2\" x1=\"90\" x2=\"90\" y1=\"70\" y2=\"350\"></line><polyline fill=\"none\" points=\"90.0,75.0 180.0,80.0 280.0,105.0 390.0,140.0 500.0,205.0 600.0,235.0 700.0,330.0\" stroke=\"#28617b\" stroke-width=\"4\"></polyline><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"end\" x=\"700\" y=\"390\">Recall</text><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"start\" x=\"100\" y=\"48\">Precision</text></g></svg>\n</div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/svg/precision-recall.svg</code></div>"
};
