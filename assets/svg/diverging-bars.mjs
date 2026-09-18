// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "diverging-bars",
  "title": "Diverging effects",
  "notes": "Purpose: Compare signed deviations around a reference\nModify: Rewrite labels, recompute geometry from source data, adapt framing and orientation.\nInvariant: Do not change scale, labels, relationships or uncertainty silently.\nStatic: Already static; preserve semantic labels and readable strokes.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/svg/diverging-bars.svg"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Diverging effects</h1><p class=\"g-purpose\">Compare signed deviations around a reference</p><div class=\"g-demo\"><svg aria-labelledby=\"g-diverging-bars-diverging-bars-title g-diverging-bars-diverging-bars-desc\" role=\"img\" viewbox=\"0 0 800 440\" xmlns=\"http://www.w3.org/2000/svg\"><title id=\"g-diverging-bars-diverging-bars-title\">Diverging effects</title><desc id=\"g-diverging-bars-diverging-bars-desc\">Compare signed deviations around a reference. Original schematic. Values are illustrative, not measured.</desc><g data-part=\"drawing\"><line stroke=\"#17252d\" stroke-width=\"2\" x1=\"400\" x2=\"400\" y1=\"65\" y2=\"370\"></line><rect fill=\"#ae4f31\" height=\"40\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"180\" x=\"220\" y=\"85\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"20\" text-anchor=\"start\" x=\"75\" y=\"112\">A</text><rect fill=\"#28617b\" height=\"40\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"230\" x=\"400\" y=\"153\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"20\" text-anchor=\"start\" x=\"75\" y=\"180\">B</text><rect fill=\"#ae4f31\" height=\"40\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"70\" x=\"330\" y=\"221\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"20\" text-anchor=\"start\" x=\"75\" y=\"248\">C</text><rect fill=\"#28617b\" height=\"40\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"140\" x=\"400\" y=\"289\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"20\" text-anchor=\"start\" x=\"75\" y=\"316\">D</text></g></svg>\n</div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/svg/diverging-bars.svg</code></div>"
};
