// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-queue-drain",
  "title": "Drain a queue",
  "notes": "Purpose: Transfer items while preserving order and counts.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Transfer items while preserving order and counts. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/queue-drain.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Drain a queue</h1><p class=\"g-purpose\">Transfer items while preserving order and counts.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"queue-drain\"><div class=\"obj\" style=\"left:55px;top:60px;width:640px;height:250px;align-items:flex-start;padding-top:18px\">Queue</div><div class=\"obj\" style=\"left:790px;top:60px;width:230px;height:250px;align-items:flex-start;justify-content:flex-end;padding:18px\">Done</div><div class=\"obj dot\" data-states='{\"0\":{\"transform\":\"translate(0px,0px)\"},\"1\":{\"transform\":\"translate(715px,-75px)\"}}' style=\"left:105px;top:175px;width:60px;height:60px\">1</div><div class=\"obj dot\" data-states='{\"0\":{\"transform\":\"translate(0px,0px)\"},\"2\":{\"transform\":\"translate(545px,0px)\"}}' style=\"left:275px;top:175px;width:60px;height:60px\">2</div><div class=\"obj dot\" data-states='{\"0\":{\"transform\":\"translate(0px,0px)\"},\"3\":{\"transform\":\"translate(375px,75px)\"}}' style=\"left:445px;top:175px;width:60px;height:60px\">3</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/queue-drain.mjs</code></div>"
};
