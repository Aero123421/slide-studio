// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-editorial-mask",
  "title": "Editorial text mask",
  "notes": "Purpose: Bring in a short line without losing final letter shapes.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Bring in a short line without losing final letter shapes. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/editorial-mask.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Editorial text mask</h1><p class=\"g-purpose\">Bring in a short line without losing final letter shapes.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"editorial-mask\"><div class=\"label\" data-states='{\"0\":{\"clipPath\":\"inset(100% 0 0 0)\",\"transform\":\"translateY(20px)\"},\"1\":{\"clipPath\":\"inset(0% 0 0 0)\",\"transform\":\"translateY(0px)\"}}' style=\"left:85px;top:120px;font:65px Georgia,serif\">Give the idea room.</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/editorial-mask.mjs</code></div>"
};
