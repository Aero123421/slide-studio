// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "learning-curve",
  "title": "Learning trajectories",
  "notes": "Purpose: Compare training and validation across progress\nModify: Rewrite labels, recompute geometry from source data, adapt framing and orientation.\nInvariant: Loss/score direction, scale, smoothing and checkpoint selection must be declared.\nStatic: Already static; preserve semantic labels and readable strokes.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/svg/learning-curve.svg"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Learning trajectories</h1><p class=\"g-purpose\">Compare training and validation across progress</p><div class=\"g-demo\"><svg aria-labelledby=\"g-learning-curve-learning-curve-title g-learning-curve-learning-curve-desc\" role=\"img\" viewbox=\"0 0 800 440\" xmlns=\"http://www.w3.org/2000/svg\"><title id=\"g-learning-curve-learning-curve-title\">Learning trajectories</title><desc id=\"g-learning-curve-learning-curve-desc\">Compare training and validation across progress. Original schematic. Values are illustrative, not measured.</desc><g data-part=\"drawing\"><line stroke=\"#17252d\" stroke-width=\"2\" x1=\"90\" x2=\"720\" y1=\"350\" y2=\"350\"></line><line stroke=\"#17252d\" stroke-width=\"2\" x1=\"90\" x2=\"90\" y1=\"70\" y2=\"350\"></line><path d=\"M100 95C200 280 350 310 700 322\" fill=\"none\" stroke=\"#28617b\" stroke-width=\"4\"></path><path d=\"M100 80C240 240 350 250 700 245\" fill=\"none\" stroke=\"#ae4f31\" stroke-width=\"4\"></path><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"start\" x=\"610\" y=\"235\">Validation</text><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"start\" x=\"610\" y=\"345\">Training</text></g></svg>\n</div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/svg/learning-curve.svg</code></div>"
};
