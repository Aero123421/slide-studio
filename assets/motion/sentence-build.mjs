// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-sentence-build",
  "title": "Build a sentence by meaning",
  "notes": "Purpose: Reveal meaningful clauses, not one letter at a time.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Reveal meaningful clauses, not one letter at a time. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/sentence-build.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Build a sentence by meaning</h1><p class=\"g-purpose\">Reveal meaningful clauses, not one letter at a time.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"sentence-build\"><div class=\"label\" data-states='{\"0\":{\"opacity\":0},\"1\":{\"opacity\":1}}' style=\"left:100px;top:70px;font-size:43px\">Observe the change.</div><div class=\"label\" data-states='{\"0\":{\"opacity\":0},\"2\":{\"opacity\":1}}' style=\"left:100px;top:165px;font-size:43px\">State the conditions.</div><div class=\"label\" data-states='{\"0\":{\"opacity\":0},\"3\":{\"opacity\":1}}' style=\"left:100px;top:260px;font-size:43px\">Keep the uncertainty.</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/sentence-build.mjs</code></div>"
};
