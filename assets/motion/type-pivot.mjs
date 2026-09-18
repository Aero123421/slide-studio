// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-type-pivot",
  "title": "Pivot a typographic hierarchy",
  "notes": "Purpose: Turn the title into a caption as evidence becomes dominant.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Turn the title into a caption as evidence becomes dominant. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/type-pivot.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Pivot a typographic hierarchy</h1><p class=\"g-purpose\">Turn the title into a caption as evidence becomes dominant.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"type-pivot\"><div class=\"label\" data-states='{\"0\":{\"fontSize\":\"65px\",\"transform\":\"translateY(0px)\"},\"1\":{\"fontSize\":\"27px\",\"transform\":\"translateY(220px)\"}}' style=\"left:80px;top:95px;\">What changes?</div><div class=\"obj\" data-states='{\"0\":{\"opacity\":0},\"1\":{\"opacity\":1}}' style=\"left:430px;top:60px;width:530px;height:245px\">Evidence</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/type-pivot.mjs</code></div>"
};
