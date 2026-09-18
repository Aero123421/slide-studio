// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "stacked-bars",
  "title": "Part-to-whole bars",
  "notes": "Purpose: Show composition and total together\nModify: Rewrite labels, recompute geometry from source data, adapt framing and orientation.\nInvariant: Segment widths sum to the total; legend categories remain stable.\nStatic: Already static; preserve semantic labels and readable strokes.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/svg/stacked-bars.svg"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Part-to-whole bars</h1><p class=\"g-purpose\">Show composition and total together</p><div class=\"g-demo\"><svg aria-labelledby=\"g-stacked-bars-stacked-bars-title g-stacked-bars-stacked-bars-desc\" role=\"img\" viewbox=\"0 0 800 440\" xmlns=\"http://www.w3.org/2000/svg\"><title id=\"g-stacked-bars-stacked-bars-title\">Part-to-whole bars</title><desc id=\"g-stacked-bars-stacked-bars-desc\">Show composition and total together. Original schematic. Values are illustrative, not measured.</desc><g data-part=\"drawing\"><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"20\" text-anchor=\"start\" x=\"100\" y=\"130\">A</text><rect fill=\"#28617b\" height=\"46\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"210\" x=\"160\" y=\"100\"></rect><rect fill=\"#ae4f31\" height=\"46\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"160\" x=\"370\" y=\"100\"></rect><rect fill=\"#bc913c\" height=\"46\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"100\" x=\"530\" y=\"100\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"20\" text-anchor=\"start\" x=\"100\" y=\"210\">B</text><rect fill=\"#28617b\" height=\"46\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"270\" x=\"160\" y=\"180\"></rect><rect fill=\"#ae4f31\" height=\"46\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"100\" x=\"430\" y=\"180\"></rect><rect fill=\"#bc913c\" height=\"46\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"100\" x=\"530\" y=\"180\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"20\" text-anchor=\"start\" x=\"100\" y=\"290\">C</text><rect fill=\"#28617b\" height=\"46\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"150\" x=\"160\" y=\"260\"></rect><rect fill=\"#ae4f31\" height=\"46\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"220\" x=\"310\" y=\"260\"></rect><rect fill=\"#bc913c\" height=\"46\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"100\" x=\"530\" y=\"260\"></rect></g></svg>\n</div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/svg/stacked-bars.svg</code></div>"
};
