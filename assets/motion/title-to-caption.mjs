// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-title-to-caption",
  "title": "Title becomes caption",
  "notes": "Purpose: Change reading hierarchy while retaining the same words.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Change reading hierarchy while retaining the same words. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/title-to-caption.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Title becomes caption</h1><p class=\"g-purpose\">Change reading hierarchy while retaining the same words.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"title-to-caption\"><div class=\"label\" data-states='{\"0\":{\"fontSize\":\"55px\"},\"1\":{\"fontSize\":\"26px\",\"transform\":\"translateY(230px)\"}}' style=\"left:75px;top:85px;\">One object, two readings</div><div class=\"obj\" data-states='{\"0\":{\"opacity\":0},\"1\":{\"opacity\":1}}' style=\"left:150px;top:55px;width:780px;height:240px\">A closer look</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/title-to-caption.mjs</code></div>"
};
