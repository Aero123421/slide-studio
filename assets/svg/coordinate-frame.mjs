// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "coordinate-frame",
  "title": "Coordinate frame",
  "notes": "Purpose: Declare axes and orientation\nModify: Rewrite labels, recompute geometry from source data, adapt framing and orientation.\nInvariant: Axis convention, units and handedness are explicit; perspective is schematic.\nStatic: Already static; preserve semantic labels and readable strokes.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/svg/coordinate-frame.svg"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Coordinate frame</h1><p class=\"g-purpose\">Declare axes and orientation</p><div class=\"g-demo\"><svg aria-labelledby=\"g-coordinate-frame-coordinate-frame-title g-coordinate-frame-coordinate-frame-desc\" role=\"img\" viewbox=\"0 0 800 440\" xmlns=\"http://www.w3.org/2000/svg\"><title id=\"g-coordinate-frame-coordinate-frame-title\">Coordinate frame</title><desc id=\"g-coordinate-frame-coordinate-frame-desc\">Declare axes and orientation. Original schematic. Values are illustrative, not measured.</desc><g data-part=\"drawing\"><line stroke=\"#28617b\" stroke-width=\"3\" x1=\"340\" x2=\"675\" y1=\"285\" y2=\"285\"></line><path d=\"M666 279L675 285L666 291\" fill=\"none\" stroke=\"#28617b\" stroke-width=\"2\"></path><line stroke=\"#28617b\" stroke-width=\"3\" x1=\"340\" x2=\"340\" y1=\"285\" y2=\"70\"></line><path d=\"M331 64L340 70L331 76\" fill=\"none\" stroke=\"#28617b\" stroke-width=\"2\"></path><line stroke=\"#ae4f31\" stroke-width=\"3\" x1=\"340\" x2=\"145\" y1=\"285\" y2=\"365\"></line><path d=\"M136 359L145 365L136 371\" fill=\"none\" stroke=\"#ae4f31\" stroke-width=\"2\"></path><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"25\" text-anchor=\"start\" x=\"693\" y=\"292\">x</text><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"25\" text-anchor=\"middle\" x=\"340\" y=\"52\">z</text><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"25\" text-anchor=\"start\" x=\"120\" y=\"380\">y</text></g></svg>\n</div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/svg/coordinate-frame.svg</code></div>"
};
