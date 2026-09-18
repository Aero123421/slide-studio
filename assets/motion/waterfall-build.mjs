// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-waterfall-build",
  "title": "Assemble contributions",
  "notes": "Purpose: Accumulate signed contributions rather than unrelated bars.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Accumulate signed contributions rather than unrelated bars. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/waterfall-build.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Assemble contributions</h1><p class=\"g-purpose\">Accumulate signed contributions rather than unrelated bars.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"waterfall-build\"><svg aria-hidden=\"true\" class=\"path\" viewbox=\"0 0 1080 410\"><path d=\"M120 55V315H930\" fill=\"none\" pathlength=\"1\" stroke=\"#718594\" stroke-width=\"2\" style=\"stroke-dasharray:1\"></path></svg><div class=\"obj\" data-states='{\"0\":{\"opacity\":1}}' style=\"left:150px;top:220px;width:150px;height:95px\">Start</div><div class=\"obj\" data-states='{\"0\":{\"opacity\":0},\"1\":{\"opacity\":1}}' style=\"left:355px;top:145px;width:150px;height:75px\">+ A</div><div class=\"obj\" data-states='{\"0\":{\"opacity\":0},\"2\":{\"opacity\":1}}' style=\"left:560px;top:145px;width:150px;height:35px\">− B</div><div class=\"obj\" data-states='{\"0\":{\"opacity\":0},\"3\":{\"opacity\":1}}' style=\"left:765px;top:180px;width:150px;height:135px\">Total</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/waterfall-build.mjs</code></div>"
};
