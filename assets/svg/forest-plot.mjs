// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "forest-plot",
  "title": "Effects and intervals",
  "notes": "Purpose: Compare effects against a no-effect reference\nModify: Rewrite labels, recompute geometry from source data, adapt framing and orientation.\nInvariant: Use compatible estimands; distinguish confidence interval from study weight.\nStatic: Already static; preserve semantic labels and readable strokes.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/svg/forest-plot.svg"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Effects and intervals</h1><p class=\"g-purpose\">Compare effects against a no-effect reference</p><div class=\"g-demo\"><svg aria-labelledby=\"g-forest-plot-forest-plot-title g-forest-plot-forest-plot-desc\" role=\"img\" viewbox=\"0 0 800 440\" xmlns=\"http://www.w3.org/2000/svg\"><title id=\"g-forest-plot-forest-plot-title\">Effects and intervals</title><desc id=\"g-forest-plot-forest-plot-desc\">Compare effects against a no-effect reference. Original schematic. Values are illustrative, not measured.</desc><g data-part=\"drawing\"><line stroke=\"#718594\" stroke-dasharray=\"5 4\" stroke-width=\"2\" x1=\"440\" x2=\"440\" y1=\"65\" y2=\"355\"></line><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"start\" x=\"85\" y=\"113\">Study 1</text><line stroke=\"#28617b\" stroke-width=\"3\" x1=\"270\" x2=\"520\" y1=\"105\" y2=\"105\"></line><rect fill=\"#ae4f31\" height=\"14\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"14\" x=\"383\" y=\"98\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"start\" x=\"85\" y=\"179\">Study 2</text><line stroke=\"#28617b\" stroke-width=\"3\" x1=\"360\" x2=\"590\" y1=\"171\" y2=\"171\"></line><rect fill=\"#ae4f31\" height=\"14\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"14\" x=\"468\" y=\"164\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"start\" x=\"85\" y=\"245\">Study 3</text><line stroke=\"#28617b\" stroke-width=\"3\" x1=\"250\" x2=\"400\" y1=\"237\" y2=\"237\"></line><rect fill=\"#ae4f31\" height=\"14\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"14\" x=\"318\" y=\"230\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"start\" x=\"85\" y=\"311\">Study 4</text><line stroke=\"#28617b\" stroke-width=\"3\" x1=\"420\" x2=\"640\" y1=\"303\" y2=\"303\"></line><rect fill=\"#ae4f31\" height=\"14\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"14\" x=\"528\" y=\"296\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"middle\" x=\"440\" y=\"395\">Reference</text></g></svg>\n</div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/svg/forest-plot.svg</code></div>"
};
