// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "sankey-schematic",
  "title": "Flow allocation",
  "notes": "Purpose: Show qualitative splitting and recombination\nModify: Rewrite labels, recompute geometry from source data, adapt framing and orientation.\nInvariant: This is qualitative. For numeric Sankey recompute widths and enforce conservation.\nStatic: Already static; preserve semantic labels and readable strokes.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/svg/sankey-schematic.svg"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Flow allocation</h1><p class=\"g-purpose\">Show qualitative splitting and recombination</p><div class=\"g-demo\"><svg aria-labelledby=\"g-sankey-schematic-sankey-schematic-title g-sankey-schematic-sankey-schematic-desc\" role=\"img\" viewbox=\"0 0 800 440\" xmlns=\"http://www.w3.org/2000/svg\"><title id=\"g-sankey-schematic-sankey-schematic-title\">Flow allocation</title><desc id=\"g-sankey-schematic-sankey-schematic-desc\">Show qualitative splitting and recombination. Original schematic. Values are illustrative, not measured.</desc><g data-part=\"drawing\"><rect fill=\"#28617b\" height=\"140\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"45\" x=\"100\" y=\"140\"></rect><rect fill=\"#ae4f31\" height=\"95\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"45\" x=\"650\" y=\"70\"></rect><rect fill=\"#bc913c\" height=\"85\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"45\" x=\"650\" y=\"275\"></rect><path d=\"M145 140C360 140 430 70 650 70V165C430 165 360 230 145 230Z\" fill=\"#c0d3dc\" stroke=\"none\" stroke-width=\"0\"></path><path d=\"M145 230C360 230 430 275 650 275V325C430 325 360 280 145 280Z\" fill=\"#dbc8a4\" stroke=\"none\" stroke-width=\"0\"></path></g></svg>\n</div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/svg/sankey-schematic.svg</code></div>"
};
