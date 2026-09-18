// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-threshold-crossing",
  "title": "Cross a declared threshold",
  "notes": "Purpose: Show which side of a decision boundary a value occupies.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Show which side of a decision boundary a value occupies. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/threshold-crossing.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Cross a declared threshold</h1><p class=\"g-purpose\">Show which side of a decision boundary a value occupies.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"threshold-crossing\"><svg aria-hidden=\"true\" class=\"path\" viewbox=\"0 0 1080 410\"><path d=\"M610 50V310\" fill=\"none\" pathlength=\"1\" stroke=\"#ae4f31\" stroke-width=\"4\" style=\"stroke-dasharray:1\"></path></svg><div class=\"label\" style=\"left:630px;top:55px;\">Threshold</div><div class=\"obj dot\" data-states='{\"0\":{\"transform\":\"translateX(0px)\"},\"1\":{\"transform\":\"translateX(290px)\"},\"2\":{\"transform\":\"translateX(505px)\"}}' style=\"left:230px;top:180px;width:65px;height:65px\">X</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/threshold-crossing.mjs</code></div>"
};
