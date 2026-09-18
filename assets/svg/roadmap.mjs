// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "roadmap",
  "title": "Stage roadmap",
  "notes": "Purpose: Show stages without fabricated dates\nModify: Rewrite labels, recompute geometry from source data, adapt framing and orientation.\nInvariant: Stage order does not imply a date commitment; label unknown timing.\nStatic: Already static; preserve semantic labels and readable strokes.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/svg/roadmap.svg"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Stage roadmap</h1><p class=\"g-purpose\">Show stages without fabricated dates</p><div class=\"g-demo\"><svg aria-labelledby=\"g-roadmap-roadmap-title g-roadmap-roadmap-desc\" role=\"img\" viewbox=\"0 0 800 440\" xmlns=\"http://www.w3.org/2000/svg\"><title id=\"g-roadmap-roadmap-title\">Stage roadmap</title><desc id=\"g-roadmap-roadmap-desc\">Show stages without fabricated dates. Original schematic. Values are illustrative, not measured.</desc><g data-part=\"drawing\"><line stroke=\"#718594\" stroke-width=\"4\" x1=\"125\" x2=\"675\" y1=\"220\" y2=\"220\"></line><circle cx=\"140\" cy=\"220\" fill=\"#28617b\" r=\"18\"></circle><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"22\" text-anchor=\"middle\" x=\"140\" y=\"175\">Discover</text><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"middle\" x=\"140\" y=\"278\">Question</text><circle cx=\"400\" cy=\"220\" fill=\"#ae4f31\" r=\"18\"></circle><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"22\" text-anchor=\"middle\" x=\"400\" y=\"175\">Develop</text><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"middle\" x=\"400\" y=\"278\">Prototype</text><circle cx=\"660\" cy=\"220\" fill=\"#bc913c\" r=\"18\"></circle><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"22\" text-anchor=\"middle\" x=\"660\" y=\"175\">Decide</text><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"middle\" x=\"660\" y=\"278\">Evidence</text></g></svg>\n</div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/svg/roadmap.svg</code></div>"
};
