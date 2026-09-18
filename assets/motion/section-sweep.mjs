// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-section-sweep",
  "title": "Sweep a section plane",
  "notes": "Purpose: Declare where an object is being cut.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Declare where an object is being cut. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/section-sweep.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Sweep a section plane</h1><p class=\"g-purpose\">Declare where an object is being cut.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"section-sweep\"><div class=\"obj\" style=\"left:170px;top:65px;width:700px;height:240px\">Object</div><div class=\"obj\" data-states='{\"0\":{\"transform\":\"translateX(0px)\"},\"1\":{\"transform\":\"translateX(240px)\"},\"2\":{\"transform\":\"translateX(480px)\"}}' style=\"left:260px;top:45px;width:10px;height:280px\"></div><div class=\"label\" style=\"left:30px;top:340px;color:#465f6a;font-size:23px\">A moving plane identifies the location of the section.</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/section-sweep.mjs</code></div>"
};
