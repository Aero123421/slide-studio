// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-comparison-origin",
  "title": "Establish the origin first",
  "notes": "Purpose: Show the shared baseline before quantities.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Show the shared baseline before quantities. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/comparison-origin.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Establish the origin first</h1><p class=\"g-purpose\">Show the shared baseline before quantities.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"comparison-origin\"><svg aria-hidden=\"true\" class=\"path\" viewbox=\"0 0 1080 410\"><path d=\"M120 55V315H930\" fill=\"none\" pathlength=\"1\" stroke=\"#718594\" stroke-width=\"2\" style=\"stroke-dasharray:1\"></path></svg><div class=\"obj bar\" data-states='{\"0\":{\"opacity\":0,\"transform\":\"scaleX(0)\"},\"1\":{\"opacity\":1},\"2\":{\"transform\":\"scaleX(1)\"}}' style=\"left:120px;top:75px;width:380px;height:38px\"></div><div class=\"obj bar\" data-states='{\"0\":{\"opacity\":0,\"transform\":\"scaleX(0)\"},\"1\":{\"opacity\":1},\"2\":{\"transform\":\"scaleX(1)\"}}' style=\"left:120px;top:150px;width:620px;height:38px\"></div><div class=\"obj bar\" data-states='{\"0\":{\"opacity\":0,\"transform\":\"scaleX(0)\"},\"1\":{\"opacity\":1},\"2\":{\"transform\":\"scaleX(1)\"}}' style=\"left:120px;top:225px;width:480px;height:38px\"></div><div class=\"label\" style=\"left:30px;top:340px;color:#465f6a;font-size:23px\">All bars start at the same zero.</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/comparison-origin.mjs</code></div>"
};
