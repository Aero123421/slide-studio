// Original motion study; bounds are semantic state.
export default {
  "id": "motion-scope-expand",
  "title": "Expand a boundary without moving the evidence",
  "study": true,
  "content": "<h1 class=\"g-title\">Expand a boundary without moving the evidence</h1><p class=\"g-purpose\">The observed object stays put when the discussed scope becomes wider.</p><div class=\"g-demo\"><div class=\"study\"><div class=\"obj\" style=\"left:390px;top:140px;width:200px;height:70px;background:#DCE8E8\" >Observed</div><div style=\"position:absolute;left:160px;top:45px;width:690px;height:280px;border:3px solid #245B72;transform-origin:center\" data-states=\"{&quot;0&quot;:{&quot;left&quot;:&quot;365px&quot;,&quot;top&quot;:&quot;120px&quot;,&quot;width&quot;:&quot;250px&quot;,&quot;height&quot;:&quot;110px&quot;},&quot;1&quot;:{&quot;left&quot;:&quot;160px&quot;,&quot;top&quot;:&quot;45px&quot;,&quot;width&quot;:&quot;690px&quot;,&quot;height&quot;:&quot;280px&quot;}}\"></div><div class=\"label\" style=\"left:140px;top:340px\">Wider scope needs evidence; the animation does not supply it.</div></div></div><div class=\"g-footer\">Original study · illustrative content <code>assets/motion/motion-scope-expand.mjs</code></div>",
  "notes": "Purpose: The observed object stays put when the discussed scope becomes wider.\nModify: Recompute geometry for actual labels. Test real button, Arrow, Page, Enter and Space paths; preserve direct/reverse/final identity.\nInvariant: Preserve the stated relationship, labels, units and evidence scope.\nStatic: Review the final state and any information lost from intermediate states.",
  "exportPolicy": "final",
  "className": ""
};
