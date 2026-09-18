// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "contour-field",
  "title": "Contour field",
  "notes": "Purpose: Show equal-value contours in a spatial field\nModify: Rewrite labels, recompute geometry from source data, adapt framing and orientation.\nInvariant: Contour spacing/values must be declared; not decorative topography when used as evidence.\nStatic: Already static; preserve semantic labels and readable strokes.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/svg/contour-field.svg"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Contour field</h1><p class=\"g-purpose\">Show equal-value contours in a spatial field</p><div class=\"g-demo\"><svg aria-labelledby=\"g-contour-field-contour-field-title g-contour-field-contour-field-desc\" role=\"img\" viewbox=\"0 0 800 440\" xmlns=\"http://www.w3.org/2000/svg\"><title id=\"g-contour-field-contour-field-title\">Contour field</title><desc id=\"g-contour-field-contour-field-desc\">Show equal-value contours in a spatial field. Original schematic. Values are illustrative, not measured.</desc><g data-part=\"drawing\"><ellipse cx=\"410\" cy=\"215\" fill=\"none\" rx=\"70\" ry=\"30\" stroke=\"#28617b\" stroke-width=\"3\" transform=\"rotate(-15 410 215)\"></ellipse><ellipse cx=\"410\" cy=\"215\" fill=\"none\" rx=\"114\" ry=\"51\" stroke=\"#718594\" stroke-width=\"3\" transform=\"rotate(-15 410 215)\"></ellipse><ellipse cx=\"410\" cy=\"215\" fill=\"none\" rx=\"158\" ry=\"72\" stroke=\"#ae4f31\" stroke-width=\"3\" transform=\"rotate(-15 410 215)\"></ellipse><ellipse cx=\"410\" cy=\"215\" fill=\"none\" rx=\"202\" ry=\"93\" stroke=\"#28617b\" stroke-width=\"3\" transform=\"rotate(-15 410 215)\"></ellipse><ellipse cx=\"410\" cy=\"215\" fill=\"none\" rx=\"246\" ry=\"114\" stroke=\"#718594\" stroke-width=\"3\" transform=\"rotate(-15 410 215)\"></ellipse><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"19\" text-anchor=\"end\" x=\"620\" y=\"360\">Equal-value contours</text></g></svg>\n</div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/svg/contour-field.svg</code></div>"
};
