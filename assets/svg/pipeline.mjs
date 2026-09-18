// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "pipeline",
  "title": "Transformation pipeline",
  "notes": "Purpose: Follow a subject through transformations\nModify: Rewrite labels, recompute geometry from source data, adapt framing and orientation.\nInvariant: Arrows indicate the same relation; distinguish data flow from time or causality.\nStatic: Already static; preserve semantic labels and readable strokes.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/svg/pipeline.svg"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Transformation pipeline</h1><p class=\"g-purpose\">Follow a subject through transformations</p><div class=\"g-demo\"><svg aria-labelledby=\"g-pipeline-pipeline-title g-pipeline-pipeline-desc\" role=\"img\" viewbox=\"0 0 800 440\" xmlns=\"http://www.w3.org/2000/svg\"><title id=\"g-pipeline-pipeline-title\">Transformation pipeline</title><desc id=\"g-pipeline-pipeline-desc\">Follow a subject through transformations. Original schematic. Values are illustrative, not measured.</desc><g data-part=\"drawing\"><rect fill=\"#ffffff\" height=\"70\" rx=\"6\" stroke=\"#17252d\" stroke-width=\"2\" width=\"180\" x=\"75\" y=\"185\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"middle\" x=\"165.0\" y=\"226.0\">Input</text><line stroke=\"#28617b\" stroke-width=\"3\" x1=\"255\" x2=\"290\" y1=\"220\" y2=\"220\"></line><path d=\"M281 214L290 220L281 226\" fill=\"none\" stroke=\"#28617b\" stroke-width=\"2\"></path><rect fill=\"#ffffff\" height=\"70\" rx=\"6\" stroke=\"#17252d\" stroke-width=\"2\" width=\"180\" x=\"300\" y=\"185\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"middle\" x=\"390.0\" y=\"226.0\">Transform</text><line stroke=\"#28617b\" stroke-width=\"3\" x1=\"480\" x2=\"515\" y1=\"220\" y2=\"220\"></line><path d=\"M506 214L515 220L506 226\" fill=\"none\" stroke=\"#28617b\" stroke-width=\"2\"></path><rect fill=\"#ffffff\" height=\"70\" rx=\"6\" stroke=\"#17252d\" stroke-width=\"2\" width=\"180\" x=\"525\" y=\"185\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"middle\" x=\"615.0\" y=\"226.0\">Output</text></g></svg>\n</div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/svg/pipeline.svg</code></div>"
};
