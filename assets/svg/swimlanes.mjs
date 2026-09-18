// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "swimlanes",
  "title": "Responsibility lanes",
  "notes": "Purpose: Show when responsibility passes between actors\nModify: Rewrite labels, recompute geometry from source data, adapt framing and orientation.\nInvariant: Each task remains in the responsible lane when rearranged.\nStatic: Already static; preserve semantic labels and readable strokes.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/svg/swimlanes.svg"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Responsibility lanes</h1><p class=\"g-purpose\">Show when responsibility passes between actors</p><div class=\"g-demo\"><svg aria-labelledby=\"g-swimlanes-swimlanes-title g-swimlanes-swimlanes-desc\" role=\"img\" viewbox=\"0 0 800 440\" xmlns=\"http://www.w3.org/2000/svg\"><title id=\"g-swimlanes-swimlanes-title\">Responsibility lanes</title><desc id=\"g-swimlanes-swimlanes-desc\">Show when responsibility passes between actors. Original schematic. Values are illustrative, not measured.</desc><g data-part=\"drawing\"><rect fill=\"#f0f4f4\" height=\"95\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"600\" x=\"100\" y=\"80\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"start\" x=\"110\" y=\"110\">Research</text><rect fill=\"#f0f4f4\" height=\"95\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"600\" x=\"100\" y=\"190\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"start\" x=\"110\" y=\"220\">Review</text><rect fill=\"#f0f4f4\" height=\"95\" rx=\"0\" stroke=\"none\" stroke-width=\"2\" width=\"600\" x=\"100\" y=\"300\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"start\" x=\"110\" y=\"330\">Release</text><rect fill=\"#ffffff\" height=\"56\" rx=\"6\" stroke=\"#17252d\" stroke-width=\"2\" width=\"136\" x=\"240\" y=\"105\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"middle\" x=\"308.0\" y=\"139.0\">Prepare</text><rect fill=\"#ffffff\" height=\"56\" rx=\"6\" stroke=\"#17252d\" stroke-width=\"2\" width=\"136\" x=\"420\" y=\"210\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"middle\" x=\"488.0\" y=\"244.0\">Check</text><rect fill=\"#ffffff\" height=\"56\" rx=\"6\" stroke=\"#17252d\" stroke-width=\"2\" width=\"110\" x=\"560\" y=\"320\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"middle\" x=\"615.0\" y=\"354.0\">Share</text><path d=\"M376 133H490V210M556 238H615V320\" fill=\"none\" stroke=\"#28617b\" stroke-width=\"3\"></path></g></svg>\n</div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/svg/swimlanes.svg</code></div>"
};
