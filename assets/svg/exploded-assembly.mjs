// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "exploded-assembly",
  "title": "Exploded assembly",
  "notes": "Purpose: Show ordered components with registration\nModify: Rewrite labels, recompute geometry from source data, adapt framing and orientation.\nInvariant: Keep mating order and shared axis; exploded offsets are illustrative.\nStatic: Already static; preserve semantic labels and readable strokes.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/svg/exploded-assembly.svg"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Exploded assembly</h1><p class=\"g-purpose\">Show ordered components with registration</p><div class=\"g-demo\"><svg aria-labelledby=\"g-exploded-assembly-exploded-assembly-title g-exploded-assembly-exploded-assembly-desc\" role=\"img\" viewbox=\"0 0 800 440\" xmlns=\"http://www.w3.org/2000/svg\"><title id=\"g-exploded-assembly-exploded-assembly-title\">Exploded assembly</title><desc id=\"g-exploded-assembly-exploded-assembly-desc\">Show ordered components with registration. Original schematic. Values are illustrative, not measured.</desc><g data-part=\"drawing\"><path d=\"M220 135L450 75L650 130L420 190Z\" fill=\"#dce6e8\" stroke=\"#28617b\" stroke-width=\"2\"></path><path d=\"M220 230L450 170L650 225L420 285Z\" fill=\"#b8ccd0\" stroke=\"#28617b\" stroke-width=\"2\"></path><path d=\"M220 325L450 265L650 320L420 380Z\" fill=\"#95b2bb\" stroke=\"#28617b\" stroke-width=\"2\"></path><line stroke=\"#718594\" stroke-dasharray=\"6 6\" stroke-width=\"2\" x1=\"430\" x2=\"430\" y1=\"60\" y2=\"405\"></line></g></svg>\n</div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/svg/exploded-assembly.svg</code></div>"
};
