// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "decision-tree",
  "title": "Decision tree",
  "notes": "Purpose: Show outcomes under explicit conditions\nModify: Rewrite labels, recompute geometry from source data, adapt framing and orientation.\nInvariant: Attach each condition to its correct branch.\nStatic: Already static; preserve semantic labels and readable strokes.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/svg/decision-tree.svg"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Decision tree</h1><p class=\"g-purpose\">Show outcomes under explicit conditions</p><div class=\"g-demo\"><svg aria-labelledby=\"g-decision-tree-decision-tree-title g-decision-tree-decision-tree-desc\" role=\"img\" viewbox=\"0 0 800 440\" xmlns=\"http://www.w3.org/2000/svg\"><title id=\"g-decision-tree-decision-tree-title\">Decision tree</title><desc id=\"g-decision-tree-decision-tree-desc\">Show outcomes under explicit conditions. Original schematic. Values are illustrative, not measured.</desc><g data-part=\"drawing\"><rect fill=\"#ffffff\" height=\"56\" rx=\"6\" stroke=\"#17252d\" stroke-width=\"2\" width=\"150\" x=\"325\" y=\"50\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"middle\" x=\"400.0\" y=\"84.0\">Condition?</text><rect fill=\"#ffffff\" height=\"56\" rx=\"6\" stroke=\"#17252d\" stroke-width=\"2\" width=\"160\" x=\"125\" y=\"220\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"middle\" x=\"205.0\" y=\"254.0\">Path A</text><rect fill=\"#ffffff\" height=\"56\" rx=\"6\" stroke=\"#17252d\" stroke-width=\"2\" width=\"160\" x=\"515\" y=\"220\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"middle\" x=\"595.0\" y=\"254.0\">Path B</text><path d=\"M400 106V155H205V215M400 155H595V215\" fill=\"none\" stroke=\"#28617b\" stroke-width=\"3\"></path><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"19\" text-anchor=\"start\" x=\"240\" y=\"145\">Yes</text><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"19\" text-anchor=\"start\" x=\"515\" y=\"145\">No</text></g></svg>\n</div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/svg/decision-tree.svg</code></div>"
};
