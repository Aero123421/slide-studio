// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "gantt",
  "title": "Scheduled intervals",
  "notes": "Purpose: Compare spans and overlap over time\nModify: Rewrite labels, recompute geometry from source data, adapt framing and orientation.\nInvariant: Real time axis and inclusive/exclusive endpoints must be consistent.\nStatic: Already static; preserve semantic labels and readable strokes.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/svg/gantt.svg"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Scheduled intervals</h1><p class=\"g-purpose\">Compare spans and overlap over time</p><div class=\"g-demo\"><svg aria-labelledby=\"g-gantt-gantt-title g-gantt-gantt-desc\" role=\"img\" viewbox=\"0 0 800 440\" xmlns=\"http://www.w3.org/2000/svg\"><title id=\"g-gantt-gantt-title\">Scheduled intervals</title><desc id=\"g-gantt-gantt-desc\">Compare spans and overlap over time. Original schematic. Values are illustrative, not measured.</desc><g data-part=\"drawing\"><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"end\" x=\"140\" y=\"122\">Explore</text><rect fill=\"#28617b\" height=\"40\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"220\" x=\"180\" y=\"95\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"end\" x=\"140\" y=\"187\">Build</text><rect fill=\"#ae4f31\" height=\"40\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"275\" x=\"290\" y=\"160\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"end\" x=\"140\" y=\"252\">Test</text><rect fill=\"#28617b\" height=\"40\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"165\" x=\"455\" y=\"225\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"end\" x=\"140\" y=\"317\">Share</text><rect fill=\"#ae4f31\" height=\"40\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"55\" x=\"620\" y=\"290\"></rect><line stroke=\"#dce6e8\" stroke-width=\"1\" x1=\"180\" x2=\"180\" y1=\"80\" y2=\"370\"></line><line stroke=\"#dce6e8\" stroke-width=\"1\" x1=\"235\" x2=\"235\" y1=\"80\" y2=\"370\"></line><line stroke=\"#dce6e8\" stroke-width=\"1\" x1=\"290\" x2=\"290\" y1=\"80\" y2=\"370\"></line><line stroke=\"#dce6e8\" stroke-width=\"1\" x1=\"345\" x2=\"345\" y1=\"80\" y2=\"370\"></line><line stroke=\"#dce6e8\" stroke-width=\"1\" x1=\"400\" x2=\"400\" y1=\"80\" y2=\"370\"></line><line stroke=\"#dce6e8\" stroke-width=\"1\" x1=\"455\" x2=\"455\" y1=\"80\" y2=\"370\"></line><line stroke=\"#dce6e8\" stroke-width=\"1\" x1=\"510\" x2=\"510\" y1=\"80\" y2=\"370\"></line><line stroke=\"#dce6e8\" stroke-width=\"1\" x1=\"565\" x2=\"565\" y1=\"80\" y2=\"370\"></line><line stroke=\"#dce6e8\" stroke-width=\"1\" x1=\"620\" x2=\"620\" y1=\"80\" y2=\"370\"></line><line stroke=\"#dce6e8\" stroke-width=\"1\" x1=\"675\" x2=\"675\" y1=\"80\" y2=\"370\"></line></g></svg>\n</div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/svg/gantt.svg</code></div>"
};
