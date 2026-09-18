// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "slope-comparison",
  "title": "Slope comparison",
  "notes": "Purpose: Track paired values between two occasions\nModify: Rewrite labels, recompute geometry from source data, adapt framing and orientation.\nInvariant: Same scale on both occasions. Do not imply intervening measurements.\nStatic: Already static; preserve semantic labels and readable strokes.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/svg/slope-comparison.svg"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Slope comparison</h1><p class=\"g-purpose\">Track paired values between two occasions</p><div class=\"g-demo\"><svg aria-labelledby=\"g-slope-comparison-slope-comparison-title g-slope-comparison-slope-comparison-desc\" role=\"img\" viewbox=\"0 0 800 440\" xmlns=\"http://www.w3.org/2000/svg\"><title id=\"g-slope-comparison-slope-comparison-title\">Slope comparison</title><desc id=\"g-slope-comparison-slope-comparison-desc\">Track paired values between two occasions. Original schematic. Values are illustrative, not measured.</desc><g data-part=\"drawing\"><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"22\" text-anchor=\"middle\" x=\"200\" y=\"65\">Before</text><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"22\" text-anchor=\"middle\" x=\"590\" y=\"65\">After</text><line stroke=\"#28617b\" stroke-width=\"3\" x1=\"200\" x2=\"590\" y1=\"150\" y2=\"270\"></line><circle cx=\"200\" cy=\"150\" fill=\"#28617b\" r=\"8\"></circle><circle cx=\"590\" cy=\"270\" fill=\"#28617b\" r=\"8\"></circle><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"end\" x=\"174\" y=\"156\">A</text><line stroke=\"#ae4f31\" stroke-width=\"3\" x1=\"200\" x2=\"590\" y1=\"240\" y2=\"110\"></line><circle cx=\"200\" cy=\"240\" fill=\"#ae4f31\" r=\"8\"></circle><circle cx=\"590\" cy=\"110\" fill=\"#ae4f31\" r=\"8\"></circle><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"end\" x=\"174\" y=\"246\">B</text><line stroke=\"#bc913c\" stroke-width=\"3\" x1=\"200\" x2=\"590\" y1=\"320\" y2=\"200\"></line><circle cx=\"200\" cy=\"320\" fill=\"#bc913c\" r=\"8\"></circle><circle cx=\"590\" cy=\"200\" fill=\"#bc913c\" r=\"8\"></circle><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"end\" x=\"174\" y=\"326\">C</text></g></svg>\n</div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/svg/slope-comparison.svg</code></div>"
};
