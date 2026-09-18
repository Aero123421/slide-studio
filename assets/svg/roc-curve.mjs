// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "roc-curve",
  "title": "ROC curve",
  "notes": "Purpose: Show the sensitivity versus false-positive-rate trade-off\nModify: Rewrite labels, recompute geometry from source data, adapt framing and orientation.\nInvariant: Axes span 0..1; compare compatible populations and preserve thresholds.\nStatic: Already static; preserve semantic labels and readable strokes.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/svg/roc-curve.svg"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">ROC curve</h1><p class=\"g-purpose\">Show the sensitivity versus false-positive-rate trade-off</p><div class=\"g-demo\"><svg aria-labelledby=\"g-roc-curve-roc-curve-title g-roc-curve-roc-curve-desc\" role=\"img\" viewbox=\"0 0 800 440\" xmlns=\"http://www.w3.org/2000/svg\"><title id=\"g-roc-curve-roc-curve-title\">ROC curve</title><desc id=\"g-roc-curve-roc-curve-desc\">Show the sensitivity versus false-positive-rate trade-off. Original schematic. Values are illustrative, not measured.</desc><g data-part=\"drawing\"><line stroke=\"#17252d\" stroke-width=\"2\" x1=\"90\" x2=\"720\" y1=\"350\" y2=\"350\"></line><line stroke=\"#17252d\" stroke-width=\"2\" x1=\"90\" x2=\"90\" y1=\"70\" y2=\"350\"></line><line stroke=\"#718594\" stroke-dasharray=\"6 6\" stroke-width=\"2\" x1=\"90\" x2=\"700\" y1=\"350\" y2=\"65\"></line><path d=\"M90 350C155 160 270 100 700 65\" fill=\"none\" stroke=\"#28617b\" stroke-width=\"4\"></path><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"end\" x=\"700\" y=\"390\">False positive rate</text></g></svg>\n</div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/svg/roc-curve.svg</code></div>"
};
