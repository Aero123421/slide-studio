// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "grouped-bars",
  "title": "Grouped comparison",
  "notes": "Purpose: Compare two series within repeated categories\nModify: Rewrite labels, recompute geometry from source data, adapt framing and orientation.\nInvariant: Do not change scale, labels, relationships or uncertainty silently.\nStatic: Already static; preserve semantic labels and readable strokes.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/svg/grouped-bars.svg"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Grouped comparison</h1><p class=\"g-purpose\">Compare two series within repeated categories</p><div class=\"g-demo\"><svg aria-labelledby=\"g-grouped-bars-grouped-bars-title g-grouped-bars-grouped-bars-desc\" role=\"img\" viewbox=\"0 0 800 440\" xmlns=\"http://www.w3.org/2000/svg\"><title id=\"g-grouped-bars-grouped-bars-title\">Grouped comparison</title><desc id=\"g-grouped-bars-grouped-bars-desc\">Compare two series within repeated categories. Original schematic. Values are illustrative, not measured.</desc><g data-part=\"drawing\"><line stroke=\"#17252d\" stroke-width=\"2\" x1=\"90\" x2=\"720\" y1=\"350\" y2=\"350\"></line><line stroke=\"#17252d\" stroke-width=\"2\" x1=\"90\" x2=\"90\" y1=\"70\" y2=\"350\"></line><rect fill=\"#28617b\" height=\"170\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"44\" x=\"150\" y=\"180\"></rect><rect fill=\"#ae4f31\" height=\"220\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"44\" x=\"199\" y=\"130\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"20\" text-anchor=\"middle\" x=\"195\" y=\"390\">A</text><rect fill=\"#28617b\" height=\"230\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"44\" x=\"310\" y=\"120\"></rect><rect fill=\"#ae4f31\" height=\"190\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"44\" x=\"359\" y=\"160\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"20\" text-anchor=\"middle\" x=\"355\" y=\"390\">B</text><rect fill=\"#28617b\" height=\"130\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"44\" x=\"470\" y=\"220\"></rect><rect fill=\"#ae4f31\" height=\"250\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"44\" x=\"519\" y=\"100\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"20\" text-anchor=\"middle\" x=\"515\" y=\"390\">C</text></g></svg>\n</div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/svg/grouped-bars.svg</code></div>"
};
