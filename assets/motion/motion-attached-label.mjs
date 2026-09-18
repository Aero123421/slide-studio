// Original instructional source. Derive a real audience page; do not copy teaching captions into a talk.
export default {
  "id": "motion-attached-label",
  "title": "Move an object and its label together",
  "study": true,
  "content": "<h1 class=\"g-title\">Move an object and its label together</h1><p class=\"g-purpose\">The label stays attached to the moving object.</p><div class=\"g-demo\"><div class=\"study\"><div class=\"obj\" style=\"left:90px;top:110px;width:210px;height:90px;background:#DCE8E8\" data-states=\"{&quot;0&quot;:{&quot;transform&quot;:&quot;translateX(0px)&quot;},&quot;1&quot;:{&quot;transform&quot;:&quot;translateX(500px)&quot;},&quot;2&quot;:{&quot;transform&quot;:&quot;translateX(240px)&quot;}}\" >Sample A</div><div class=\"label\" style=\"left:90px;top:300px\">Identity is unchanged.</div></div></div><div class=\"g-footer\">Original study · illustrative content <code>assets/motion/motion-attached-label.mjs</code></div>",
  "notes": "Purpose: The label stays attached to the moving object.\nModify: Recompute geometry for actual labels. Test real button, Arrow, Page, Enter and Space paths; preserve direct/reverse/final identity.\nInvariant: Preserve the stated relationship, labels, units and evidence scope.\nStatic: Review the final state and any information lost from intermediate states.",
  "exportPolicy": "final",
  "className": ""
};
