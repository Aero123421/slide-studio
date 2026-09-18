// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-stagger-rows",
  "title": "Build comparable rows",
  "notes": "Purpose: Add comparable units while retaining a common origin.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Add comparable units while retaining a common origin. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/stagger-rows.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Build comparable rows</h1><p class=\"g-purpose\">Add comparable units while retaining a common origin.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"stagger-rows\"><div class=\"obj\" data-states='{\"0\":{\"opacity\":0,\"transform\":\"translateX(-18px)\"},\"1\":{\"opacity\":1,\"transform\":\"translateX(0px)\"}}' style=\"left:160px;top:35px;width:660px;height:70px\">Row A</div><div class=\"obj\" data-states='{\"0\":{\"opacity\":0,\"transform\":\"translateX(-18px)\"},\"2\":{\"opacity\":1,\"transform\":\"translateX(0px)\"}}' style=\"left:160px;top:135px;width:660px;height:70px\">Row B</div><div class=\"obj\" data-states='{\"0\":{\"opacity\":0,\"transform\":\"translateX(-18px)\"},\"3\":{\"opacity\":1,\"transform\":\"translateX(0px)\"}}' style=\"left:160px;top:235px;width:660px;height:70px\">Row C</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/stagger-rows.mjs</code></div>"
};
