// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "feedback-loop",
  "title": "Feedback loop",
  "notes": "Purpose: Explain a closed corrective cycle\nModify: Rewrite labels, recompute geometry from source data, adapt framing and orientation.\nInvariant: Indicate the measured signal and the action it changes; a loop is not proof of stability.\nStatic: Already static; preserve semantic labels and readable strokes.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/svg/feedback-loop.svg"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Feedback loop</h1><p class=\"g-purpose\">Explain a closed corrective cycle</p><div class=\"g-demo\"><svg aria-labelledby=\"g-feedback-loop-feedback-loop-title g-feedback-loop-feedback-loop-desc\" role=\"img\" viewbox=\"0 0 800 440\" xmlns=\"http://www.w3.org/2000/svg\"><title id=\"g-feedback-loop-feedback-loop-title\">Feedback loop</title><desc id=\"g-feedback-loop-feedback-loop-desc\">Explain a closed corrective cycle. Original schematic. Values are illustrative, not measured.</desc><g data-part=\"drawing\"><rect fill=\"#ffffff\" height=\"56\" rx=\"6\" stroke=\"#17252d\" stroke-width=\"2\" width=\"170\" x=\"140\" y=\"180\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"middle\" x=\"225.0\" y=\"214.0\">Action</text><rect fill=\"#ffffff\" height=\"56\" rx=\"6\" stroke=\"#17252d\" stroke-width=\"2\" width=\"170\" x=\"490\" y=\"180\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"middle\" x=\"575.0\" y=\"214.0\">Measure</text><line stroke=\"#28617b\" stroke-width=\"3\" x1=\"310\" x2=\"485\" y1=\"208\" y2=\"208\"></line><path d=\"M476 202L485 208L476 214\" fill=\"none\" stroke=\"#28617b\" stroke-width=\"2\"></path><path d=\"M575 235V330H225V242\" fill=\"none\" stroke=\"#ae4f31\" stroke-width=\"3\"></path><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"20\" text-anchor=\"middle\" x=\"395\" y=\"365\">Update from observation</text></g></svg>\n</div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/svg/feedback-loop.svg</code></div>"
};
