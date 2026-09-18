// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-branch-reveal",
  "title": "Reveal a conditional branch",
  "notes": "Purpose: Make the guard visible before taking a path.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Make the guard visible before taking a path. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/branch-reveal.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Reveal a conditional branch</h1><p class=\"g-purpose\">Make the guard visible before taking a path.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"branch-reveal\"><div class=\"obj\" style=\"left:425px;top:30px;width:215px;height:75px\">Condition</div><svg aria-hidden=\"true\" class=\"path\" viewbox=\"0 0 1080 410\"><path d=\"M530 105V165H245V225M530 165H825V225\" data-states='{\"0\":{\"opacity\":0},\"1\":{\"opacity\":1}}' fill=\"none\" pathlength=\"1\" stroke=\"#28617b\" stroke-width=\"4\" style=\"stroke-dasharray:1\"></path></svg><div class=\"obj\" data-states='{\"0\":{\"opacity\":0},\"2\":{\"opacity\":1}}' style=\"left:120px;top:225px;width:250px;height:75px\">Yes</div><div class=\"obj\" data-states='{\"0\":{\"opacity\":0},\"3\":{\"opacity\":1}}' style=\"left:700px;top:225px;width:250px;height:75px\">No</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/branch-reveal.mjs</code></div>"
};
