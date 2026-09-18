// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-focus-context",
  "title": "Focus without deleting context",
  "notes": "Purpose: Dim competing context but preserve orientation.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Dim competing context but preserve orientation. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/focus-context.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Focus without deleting context</h1><p class=\"g-purpose\">Dim competing context but preserve orientation.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"focus-context\"><div class=\"obj\" data-states='{\"0\":{\"opacity\":1},\"1\":{\"opacity\":0.22}}' style=\"left:100px;top:130px;width:250px;height:125px\">A</div><div class=\"obj\" data-states='{\"0\":{\"opacity\":1},\"1\":{\"opacity\":1}}' style=\"left:415px;top:130px;width:250px;height:125px\">B</div><div class=\"obj\" data-states='{\"0\":{\"opacity\":1},\"1\":{\"opacity\":0.22}}' style=\"left:730px;top:130px;width:250px;height:125px\">C</div><div class=\"label\" style=\"left:30px;top:340px;color:#465f6a;font-size:23px\">Context remains visible; opacity does not mean missing data.</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/focus-context.mjs</code></div>"
};
