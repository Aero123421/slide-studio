// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "nested-boundary",
  "title": "Nested boundaries",
  "notes": "Purpose: Show membership and scope\nModify: Rewrite labels, recompute geometry from source data, adapt framing and orientation.\nInvariant: Nested position denotes membership; changing position across a boundary changes meaning.\nStatic: Already static; preserve semantic labels and readable strokes.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/svg/nested-boundary.svg"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Nested boundaries</h1><p class=\"g-purpose\">Show membership and scope</p><div class=\"g-demo\"><svg aria-labelledby=\"g-nested-boundary-nested-boundary-title g-nested-boundary-nested-boundary-desc\" role=\"img\" viewbox=\"0 0 800 440\" xmlns=\"http://www.w3.org/2000/svg\"><title id=\"g-nested-boundary-nested-boundary-title\">Nested boundaries</title><desc id=\"g-nested-boundary-nested-boundary-desc\">Show membership and scope. Original schematic. Values are illustrative, not measured.</desc><g data-part=\"drawing\"><rect fill=\"#f3f6f6\" height=\"310\" rx=\"18\" stroke=\"#718594\" stroke-width=\"2\" width=\"630\" x=\"85\" y=\"65\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"23\" text-anchor=\"start\" x=\"115\" y=\"105\">Outer scope</text><rect fill=\"#dce6e8\" height=\"180\" rx=\"12\" stroke=\"#28617b\" stroke-width=\"2\" width=\"430\" x=\"220\" y=\"140\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"22\" text-anchor=\"start\" x=\"245\" y=\"175\">Inner scope</text><rect fill=\"#ffffff\" height=\"56\" rx=\"6\" stroke=\"#17252d\" stroke-width=\"2\" width=\"140\" x=\"285\" y=\"225\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"middle\" x=\"355.0\" y=\"259.0\">Member</text></g></svg>\n</div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/svg/nested-boundary.svg</code></div>"
};
