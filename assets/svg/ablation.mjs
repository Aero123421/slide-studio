// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "ablation",
  "title": "Ablation contrasts",
  "notes": "Purpose: Compare a full system to controlled removals\nModify: Rewrite labels, recompute geometry from source data, adapt framing and orientation.\nInvariant: One controlled removal per comparison; do not attribute confounded effects.\nStatic: Already static; preserve semantic labels and readable strokes.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/svg/ablation.svg"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Ablation contrasts</h1><p class=\"g-purpose\">Compare a full system to controlled removals</p><div class=\"g-demo\"><svg aria-labelledby=\"g-ablation-ablation-title g-ablation-ablation-desc\" role=\"img\" viewbox=\"0 0 800 440\" xmlns=\"http://www.w3.org/2000/svg\"><title id=\"g-ablation-ablation-title\">Ablation contrasts</title><desc id=\"g-ablation-ablation-desc\">Compare a full system to controlled removals. Original schematic. Values are illustrative, not measured.</desc><g data-part=\"drawing\"><line stroke=\"#17252d\" stroke-width=\"2\" x1=\"90\" x2=\"720\" y1=\"350\" y2=\"350\"></line><line stroke=\"#17252d\" stroke-width=\"2\" x1=\"90\" x2=\"90\" y1=\"70\" y2=\"350\"></line><rect fill=\"#28617b\" height=\"240\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"75\" x=\"130\" y=\"110\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"17\" text-anchor=\"middle\" x=\"166\" y=\"390\">Full</text><rect fill=\"#718594\" height=\"165\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"75\" x=\"270\" y=\"185\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"17\" text-anchor=\"middle\" x=\"306\" y=\"390\">− A</text><rect fill=\"#718594\" height=\"210\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"75\" x=\"410\" y=\"140\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"17\" text-anchor=\"middle\" x=\"446\" y=\"390\">− B</text><rect fill=\"#718594\" height=\"190\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"75\" x=\"550\" y=\"160\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"17\" text-anchor=\"middle\" x=\"586\" y=\"390\">− C</text></g></svg>\n</div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/svg/ablation.svg</code></div>"
};
