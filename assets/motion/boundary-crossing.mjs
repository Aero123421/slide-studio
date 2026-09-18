// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-boundary-crossing",
  "title": "Cross a boundary",
  "notes": "Purpose: Make a scope change explicit.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Make a scope change explicit. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/boundary-crossing.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Cross a boundary</h1><p class=\"g-purpose\">Make a scope change explicit.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"boundary-crossing\"><div class=\"obj\" style=\"left:70px;top:60px;width:400px;height:250px;align-items:flex-start;padding-top:18px\">Scope A</div><div class=\"obj\" style=\"left:610px;top:60px;width:400px;height:250px;align-items:flex-start;padding-top:18px\">Scope B</div><div class=\"obj dot\" data-states='{\"0\":{\"transform\":\"translateX(0px)\"},\"1\":{\"transform\":\"translateX(540px)\"}}' style=\"left:235px;top:180px;width:62px;height:62px\">X</div><div class=\"label\" style=\"left:30px;top:340px;color:#465f6a;font-size:23px\">Membership changes only at the declared boundary.</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/boundary-crossing.mjs</code></div>"
};
