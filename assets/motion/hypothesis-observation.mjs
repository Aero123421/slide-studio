// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-hypothesis-observation",
  "title": "Separate hypothesis and observation",
  "notes": "Purpose: Keep proposed mechanism distinguishable from measured evidence.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Keep proposed mechanism distinguishable from measured evidence. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/hypothesis-observation.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Separate hypothesis and observation</h1><p class=\"g-purpose\">Keep proposed mechanism distinguishable from measured evidence.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"hypothesis-observation\"><div class=\"obj\" data-states='{\"0\":{\"opacity\":1},\"1\":{\"opacity\":0.45}}' style=\"left:90px;top:85px;width:390px;height:130px\">Hypothesis</div><div class=\"obj\" data-states='{\"0\":{\"opacity\":0},\"1\":{\"opacity\":1}}' style=\"left:600px;top:85px;width:390px;height:130px\">Observation</div><div class=\"label\" data-states='{\"0\":{\"opacity\":0},\"2\":{\"opacity\":1}}' style=\"left:110px;top:285px;\">Support is limited to the observed conditions.</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/hypothesis-observation.mjs</code></div>"
};
