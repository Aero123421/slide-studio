// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-registered-crossfade",
  "title": "Compare registered states",
  "notes": "Purpose: Fade between equal-scale representations of the same scene.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Fade between equal-scale representations of the same scene. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/registered-crossfade.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Compare registered states</h1><p class=\"g-purpose\">Fade between equal-scale representations of the same scene.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"registered-crossfade\"><div class=\"obj\" data-states='{\"0\":{\"opacity\":1},\"1\":{\"opacity\":0}}' style=\"left:150px;top:80px;width:760px;height:215px\">Before: baseline representation</div><div class=\"obj\" data-states='{\"0\":{\"opacity\":0},\"1\":{\"opacity\":1}}' style=\"left:150px;top:80px;width:760px;height:215px\">After: same scale and registration</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/registered-crossfade.mjs</code></div>"
};
