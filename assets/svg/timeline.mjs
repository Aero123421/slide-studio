// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "timeline",
  "title": "Ordered events",
  "notes": "Purpose: Show an event sequence and intervals\nModify: Rewrite labels, recompute geometry from source data, adapt framing and orientation.\nInvariant: State whether spacing encodes elapsed time or only ordering.\nStatic: Already static; preserve semantic labels and readable strokes.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/svg/timeline.svg"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Ordered events</h1><p class=\"g-purpose\">Show an event sequence and intervals</p><div class=\"g-demo\"><svg aria-labelledby=\"g-timeline-timeline-title g-timeline-timeline-desc\" role=\"img\" viewbox=\"0 0 800 440\" xmlns=\"http://www.w3.org/2000/svg\"><title id=\"g-timeline-timeline-title\">Ordered events</title><desc id=\"g-timeline-timeline-desc\">Show an event sequence and intervals. Original schematic. Values are illustrative, not measured.</desc><g data-part=\"drawing\"><line stroke=\"#17252d\" stroke-width=\"3\" x1=\"110\" x2=\"700\" y1=\"210\" y2=\"210\"></line><circle cx=\"145\" cy=\"210\" fill=\"#28617b\" r=\"8\"></circle><line stroke=\"#718594\" stroke-width=\"2\" x1=\"145\" x2=\"145\" y1=\"210\" y2=\"130\"></line><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"19\" text-anchor=\"middle\" x=\"145\" y=\"118\">Event A</text><circle cx=\"300\" cy=\"210\" fill=\"#28617b\" r=\"8\"></circle><line stroke=\"#718594\" stroke-width=\"2\" x1=\"300\" x2=\"300\" y1=\"210\" y2=\"285\"></line><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"19\" text-anchor=\"middle\" x=\"300\" y=\"315\">Event B</text><circle cx=\"440\" cy=\"210\" fill=\"#28617b\" r=\"8\"></circle><line stroke=\"#718594\" stroke-width=\"2\" x1=\"440\" x2=\"440\" y1=\"210\" y2=\"130\"></line><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"19\" text-anchor=\"middle\" x=\"440\" y=\"118\">Event C</text><circle cx=\"650\" cy=\"210\" fill=\"#28617b\" r=\"8\"></circle><line stroke=\"#718594\" stroke-width=\"2\" x1=\"650\" x2=\"650\" y1=\"210\" y2=\"285\"></line><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"19\" text-anchor=\"middle\" x=\"650\" y=\"315\">Event D</text></g></svg>\n</div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/svg/timeline.svg</code></div>"
};
