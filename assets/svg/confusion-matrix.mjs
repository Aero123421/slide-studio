// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "confusion-matrix",
  "title": "Classification outcomes",
  "notes": "Purpose: Distinguish correct and incorrect classifications\nModify: Rewrite labels, recompute geometry from source data, adapt framing and orientation.\nInvariant: Identify true and predicted axes and normalization; include class labels.\nStatic: Already static; preserve semantic labels and readable strokes.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/svg/confusion-matrix.svg"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Classification outcomes</h1><p class=\"g-purpose\">Distinguish correct and incorrect classifications</p><div class=\"g-demo\"><svg aria-labelledby=\"g-confusion-matrix-confusion-matrix-title g-confusion-matrix-confusion-matrix-desc\" role=\"img\" viewbox=\"0 0 800 440\" xmlns=\"http://www.w3.org/2000/svg\"><title id=\"g-confusion-matrix-confusion-matrix-title\">Classification outcomes</title><desc id=\"g-confusion-matrix-confusion-matrix-desc\">Distinguish correct and incorrect classifications. Original schematic. Values are illustrative, not measured.</desc><g data-part=\"drawing\"><rect fill=\"#28617b\" height=\"130\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"140\" x=\"245\" y=\"95\"></rect><text fill=\"#fff\" font-family=\"Arial, sans-serif\" font-size=\"32\" text-anchor=\"middle\" x=\"315\" y=\"172\">42</text><rect fill=\"#dce6e8\" height=\"130\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"140\" x=\"395\" y=\"95\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"32\" text-anchor=\"middle\" x=\"465\" y=\"172\">8</text><rect fill=\"#dce6e8\" height=\"130\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"140\" x=\"245\" y=\"235\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"32\" text-anchor=\"middle\" x=\"315\" y=\"312\">6</text><rect fill=\"#28617b\" height=\"130\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"140\" x=\"395\" y=\"235\"></rect><text fill=\"#fff\" font-family=\"Arial, sans-serif\" font-size=\"32\" text-anchor=\"middle\" x=\"465\" y=\"312\">44</text><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"22\" text-anchor=\"middle\" x=\"390\" y=\"70\">Predicted class</text><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"20\" text-anchor=\"end\" x=\"230\" y=\"166\">A</text><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"20\" text-anchor=\"end\" x=\"230\" y=\"306\">B</text></g></svg>\n</div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/svg/confusion-matrix.svg</code></div>"
};
