// Original instructional source. Derive a real audience page; do not copy teaching captions into a talk.
export default {
  "id": "motion-stable-row-order",
  "title": "Reorder rows while preserving row identity",
  "study": true,
  "content": "<h1 class=\"g-title\">Reorder rows while preserving row identity</h1><p class=\"g-purpose\">Rows move through separate horizontal lanes to avoid label collisions.</p><div class=\"g-demo\"><div class=\"study\"><div class=\"obj\" style=\"left:110px;top:65px;width:400px;height:65px;background:#DCE8E8\" data-states=\"{&quot;0&quot;:{&quot;transform&quot;:&quot;translate(0px,0px)&quot;},&quot;1&quot;:{&quot;transform&quot;:&quot;translate(410px,0px)&quot;},&quot;2&quot;:{&quot;transform&quot;:&quot;translate(410px,180px)&quot;},&quot;3&quot;:{&quot;transform&quot;:&quot;translate(0px,180px)&quot;}}\" >Row A</div><div class=\"obj\" style=\"left:110px;top:245px;width:400px;height:65px;background:#DCE8E8\" data-states=\"{&quot;0&quot;:{&quot;transform&quot;:&quot;translate(0px,0px)&quot;},&quot;1&quot;:{&quot;transform&quot;:&quot;translate(0px,0px)&quot;},&quot;2&quot;:{&quot;transform&quot;:&quot;translate(0px,-180px)&quot;},&quot;3&quot;:{&quot;transform&quot;:&quot;translate(0px,-180px)&quot;}}\" >Row B</div></div></div><div class=\"g-footer\">Original study · illustrative content <code>assets/motion/motion-stable-row-order.mjs</code></div>",
  "notes": "Purpose: Rows move through separate horizontal lanes to avoid label collisions.\nModify: Recompute geometry for actual labels. Test real button, Arrow, Page, Enter and Space paths; preserve direct/reverse/final identity.\nInvariant: Preserve the stated relationship, labels, units and evidence scope.\nStatic: Review the final state and any information lost from intermediate states.",
  "exportPolicy": "final",
  "className": ""
};
