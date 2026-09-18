// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "bullet-chart",
  "title": "Target and actual",
  "notes": "Purpose: Compare performance to a named target\nModify: Rewrite labels, recompute geometry from source data, adapt framing and orientation.\nInvariant: Do not change scale, labels, relationships or uncertainty silently.\nStatic: Already static; preserve semantic labels and readable strokes.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/svg/bullet-chart.svg"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Target and actual</h1><p class=\"g-purpose\">Compare performance to a named target</p><div class=\"g-demo\"><svg aria-labelledby=\"g-bullet-chart-bullet-chart-title g-bullet-chart-bullet-chart-desc\" role=\"img\" viewbox=\"0 0 800 440\" xmlns=\"http://www.w3.org/2000/svg\"><title id=\"g-bullet-chart-bullet-chart-title\">Target and actual</title><desc id=\"g-bullet-chart-bullet-chart-desc\">Compare performance to a named target. Original schematic. Values are illustrative, not measured.</desc><g data-part=\"drawing\"><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"24\" text-anchor=\"start\" x=\"120\" y=\"80\">Actual versus target</text><rect fill=\"#dce6e8\" height=\"85\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"560\" x=\"120\" y=\"160\"></rect><rect fill=\"#b8cbcf\" height=\"85\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"410\" x=\"120\" y=\"160\"></rect><rect fill=\"#28617b\" height=\"38\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"330\" x=\"120\" y=\"183\"></rect><line stroke=\"#ae4f31\" stroke-width=\"5\" x1=\"580\" x2=\"580\" y1=\"143\" y2=\"263\"></line><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"20\" text-anchor=\"middle\" x=\"580\" y=\"298\">Target</text></g></svg>\n</div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/svg/bullet-chart.svg</code></div>"
};
