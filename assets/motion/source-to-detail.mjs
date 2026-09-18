// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-source-to-detail",
  "title": "Move from source to detail",
  "notes": "Purpose: Keep a tether between the crop and its origin.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Keep a tether between the crop and its origin. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/source-to-detail.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Move from source to detail</h1><p class=\"g-purpose\">Keep a tether between the crop and its origin.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"source-to-detail\"><div class=\"obj framebox\" style=\"left:70px;top:70px;width:320px;height:230px\">Full source</div><div class=\"obj\" data-states='{\"0\":{\"transform\":\"translate(0px,0px) scale(1)\"},\"1\":{\"transform\":\"translate(450px,0px) scale(1.8)\"}}' style=\"left:150px;top:135px;width:160px;height:90px\">Region</div><svg aria-hidden=\"true\" class=\"path\" viewbox=\"0 0 1080 410\"><path d=\"M310 135L510 90M310 225L510 280\" data-states='{\"0\":{\"opacity\":0},\"1\":{\"opacity\":1}}' fill=\"none\" pathlength=\"1\" stroke=\"#718594\" stroke-width=\"2\" style=\"stroke-dasharray:1\"></path></svg></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/source-to-detail.mjs</code></div>"
};
