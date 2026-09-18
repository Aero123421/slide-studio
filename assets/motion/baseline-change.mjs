// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-baseline-change",
  "title": "Explain a baseline change",
  "notes": "Purpose: Call attention to a changed reference instead of hiding it.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Call attention to a changed reference instead of hiding it. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/baseline-change.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Explain a baseline change</h1><p class=\"g-purpose\">Call attention to a changed reference instead of hiding it.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"baseline-change\"><svg aria-hidden=\"true\" class=\"path\" viewbox=\"0 0 1080 410\"><path d=\"M120 55V315H930\" fill=\"none\" pathlength=\"1\" stroke=\"#718594\" stroke-width=\"2\" style=\"stroke-dasharray:1\"></path></svg><svg aria-hidden=\"true\" class=\"path\" viewbox=\"0 0 1080 410\"><path d=\"M120 230H930\" data-states='{\"0\":{\"transform\":\"translateY(0px)\"},\"1\":{\"transform\":\"translateY(-95px)\"}}' fill=\"none\" pathlength=\"1\" stroke=\"#ae4f31\" stroke-width=\"4\" style=\"stroke-dasharray:1\"></path></svg><div class=\"label\" data-states='{\"0\":{\"opacity\":0},\"1\":{\"opacity\":1}}' style=\"left:280px;top:65px;\">Reference changes</div><div class=\"obj\" style=\"left:270px;top:160px;width:95px;height:155px\"></div><div class=\"obj\" style=\"left:490px;top:80px;width:95px;height:235px\"></div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/baseline-change.mjs</code></div>"
};
