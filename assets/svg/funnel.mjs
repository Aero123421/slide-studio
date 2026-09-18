// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "funnel",
  "title": "Progressive selection",
  "notes": "Purpose: Show items remaining after each stage\nModify: Rewrite labels, recompute geometry from source data, adapt framing and orientation.\nInvariant: Quantitative funnel areas need a defined encoding; this source is explicitly schematic.\nStatic: Already static; preserve semantic labels and readable strokes.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/svg/funnel.svg"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Progressive selection</h1><p class=\"g-purpose\">Show items remaining after each stage</p><div class=\"g-demo\"><svg aria-labelledby=\"g-funnel-funnel-title g-funnel-funnel-desc\" role=\"img\" viewbox=\"0 0 800 440\" xmlns=\"http://www.w3.org/2000/svg\"><title id=\"g-funnel-funnel-title\">Progressive selection</title><desc id=\"g-funnel-funnel-desc\">Show items remaining after each stage. Original schematic. Values are illustrative, not measured.</desc><g data-part=\"drawing\"><path d=\"M140 70H660L610 135H190Z\" fill=\"#28617b\" stroke=\"none\" stroke-width=\"0\"></path><text fill=\"#ffffff\" font-family=\"Arial, sans-serif\" font-size=\"22\" text-anchor=\"middle\" x=\"400\" y=\"112\">Eligible</text><path d=\"M190 152H610L560 217H240Z\" fill=\"#ae4f31\" stroke=\"none\" stroke-width=\"0\"></path><text fill=\"#ffffff\" font-family=\"Arial, sans-serif\" font-size=\"22\" text-anchor=\"middle\" x=\"400\" y=\"194\">Assessed</text><path d=\"M240 234H560L510 299H290Z\" fill=\"#bc913c\" stroke=\"none\" stroke-width=\"0\"></path><text fill=\"#ffffff\" font-family=\"Arial, sans-serif\" font-size=\"22\" text-anchor=\"middle\" x=\"400\" y=\"276\">Included</text></g></svg>\n</div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/svg/funnel.svg</code></div>"
};
