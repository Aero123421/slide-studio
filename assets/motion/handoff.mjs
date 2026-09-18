// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-handoff",
  "title": "Transfer an object",
  "notes": "Purpose: Move the same object between owners.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Move the same object between owners. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/handoff.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Transfer an object</h1><p class=\"g-purpose\">Move the same object between owners.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"handoff\"><div class=\"obj framebox\" style=\"left:70px;top:95px;width:340px;height:190px\">Source</div><div class=\"obj framebox\" style=\"left:650px;top:95px;width:340px;height:190px\">Destination</div><div class=\"obj dot\" data-states='{\"0\":{\"transform\":\"translateX(0px)\"},\"1\":{\"transform\":\"translateX(260px)\"},\"2\":{\"transform\":\"translateX(580px)\"}}' style=\"left:215px;top:165px;width:60px;height:60px\">1</div><div class=\"label\" style=\"left:30px;top:340px;color:#465f6a;font-size:23px\">One object; identity is preserved.</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/handoff.mjs</code></div>"
};
