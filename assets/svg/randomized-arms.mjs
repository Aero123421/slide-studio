// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "randomized-arms",
  "title": "Randomized arms",
  "notes": "Purpose: Show assignment and parallel comparison\nModify: Rewrite labels, recompute geometry from source data, adapt framing and orientation.\nInvariant: Only label randomization when allocation really is randomized.\nStatic: Already static; preserve semantic labels and readable strokes.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/svg/randomized-arms.svg"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Randomized arms</h1><p class=\"g-purpose\">Show assignment and parallel comparison</p><div class=\"g-demo\"><svg aria-labelledby=\"g-randomized-arms-randomized-arms-title g-randomized-arms-randomized-arms-desc\" role=\"img\" viewbox=\"0 0 800 440\" xmlns=\"http://www.w3.org/2000/svg\"><title id=\"g-randomized-arms-randomized-arms-title\">Randomized arms</title><desc id=\"g-randomized-arms-randomized-arms-desc\">Show assignment and parallel comparison. Original schematic. Values are illustrative, not measured.</desc><g data-part=\"drawing\"><rect fill=\"#ffffff\" height=\"56\" rx=\"6\" stroke=\"#17252d\" stroke-width=\"2\" width=\"150\" x=\"70\" y=\"185\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"middle\" x=\"145.0\" y=\"219.0\">Sample</text><rect fill=\"#ffffff\" height=\"56\" rx=\"6\" stroke=\"#17252d\" stroke-width=\"2\" width=\"140\" x=\"335\" y=\"60\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"middle\" x=\"405.0\" y=\"94.0\">Arm A</text><rect fill=\"#ffffff\" height=\"56\" rx=\"6\" stroke=\"#17252d\" stroke-width=\"2\" width=\"140\" x=\"335\" y=\"300\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"middle\" x=\"405.0\" y=\"334.0\">Arm B</text><rect fill=\"#ffffff\" height=\"56\" rx=\"6\" stroke=\"#17252d\" stroke-width=\"2\" width=\"130\" x=\"610\" y=\"185\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"middle\" x=\"675.0\" y=\"219.0\">Compare</text><path d=\"M220 213H275V88H330M275 213V328H330M475 88H545V213H605M475 328H545V213\" fill=\"none\" stroke=\"#28617b\" stroke-width=\"3\"></path><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"17\" text-anchor=\"middle\" x=\"260\" y=\"190\">Assign</text></g></svg>\n</div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/svg/randomized-arms.svg</code></div>"
};
