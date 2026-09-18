// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-rank-reorder",
  "title": "Reorder without losing identity",
  "notes": "Purpose: Change rank while names and colors remain attached.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Change rank while names and colors remain attached. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/rank-reorder.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Reorder without losing identity</h1><p class=\"g-purpose\">Change rank while names and colors remain attached.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"rank-reorder\"><div class=\"obj\" data-states='{\"0\":{\"transform\":\"translateY(0px)\"},\"1\":{\"transform\":\"translateY(95px)\"}}' style=\"left:190px;top:35px;width:550px;height:65px\">A</div><div class=\"obj\" data-states='{\"0\":{\"transform\":\"translateY(0px)\"},\"1\":{\"transform\":\"translateY(-95px)\"}}' style=\"left:190px;top:130px;width:740px;height:65px\">B</div><div class=\"obj\" data-states='{\"0\":{\"transform\":\"translateY(0px)\"},\"1\":{\"transform\":\"translateY(0px)\"}}' style=\"left:190px;top:225px;width:410px;height:65px\">C</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/rank-reorder.mjs</code></div>"
};
