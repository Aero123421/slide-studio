// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-tethered-label",
  "title": "Move a label with its subject",
  "notes": "Purpose: Keep label and subject registration intact.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Keep label and subject registration intact. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/tethered-label.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Move a label with its subject</h1><p class=\"g-purpose\">Keep label and subject registration intact.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"tethered-label\"><div class=\"obj dot\" data-states='{\"0\":{\"transform\":\"translateX(0px)\"},\"1\":{\"transform\":\"translateX(500px)\"}}' style=\"left:160px;top:160px;width:80px;height:80px\"></div><div class=\"label\" data-states='{\"0\":{\"transform\":\"translateX(0px)\"},\"1\":{\"transform\":\"translateX(500px)\"}}' style=\"left:135px;top:270px;\">Subject A</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/tethered-label.mjs</code></div>"
};
