// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "violin",
  "title": "Density silhouette",
  "notes": "Purpose: Show distribution shape as well as center\nModify: Rewrite labels, recompute geometry from source data, adapt framing and orientation.\nInvariant: State smoothing and sample sizes. Width is estimated density, not literal count unless specified.\nStatic: Already static; preserve semantic labels and readable strokes.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/svg/violin.svg"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Density silhouette</h1><p class=\"g-purpose\">Show distribution shape as well as center</p><div class=\"g-demo\"><svg aria-labelledby=\"g-violin-violin-title g-violin-violin-desc\" role=\"img\" viewbox=\"0 0 800 440\" xmlns=\"http://www.w3.org/2000/svg\"><title id=\"g-violin-violin-title\">Density silhouette</title><desc id=\"g-violin-violin-desc\">Show distribution shape as well as center. Original schematic. Values are illustrative, not measured.</desc><g data-part=\"drawing\"><path d=\"M260 75 C180 140 235 190 195 250 C160 315 210 355 260 360 C310 355 360 315 325 250 C285 190 340 140 260 75\" fill=\"#dce6e8\" stroke=\"#28617b\" stroke-width=\"2\"></path><line stroke=\"#17252d\" stroke-width=\"3\" x1=\"260\" x2=\"260\" y1=\"130\" y2=\"310\"></line><circle cx=\"260\" cy=\"220\" fill=\"#ae4f31\" r=\"7\"></circle><path d=\"M540 75 C460 140 515 190 475 250 C440 315 490 355 540 360 C590 355 640 315 605 250 C565 190 620 140 540 75\" fill=\"#dce6e8\" stroke=\"#28617b\" stroke-width=\"2\"></path><line stroke=\"#17252d\" stroke-width=\"3\" x1=\"540\" x2=\"540\" y1=\"130\" y2=\"310\"></line><circle cx=\"540\" cy=\"220\" fill=\"#ae4f31\" r=\"7\"></circle></g></svg>\n</div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/svg/violin.svg</code></div>"
};
