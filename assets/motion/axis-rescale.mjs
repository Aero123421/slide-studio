// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-axis-rescale",
  "title": "Make a rescale explicit",
  "notes": "Purpose: Rescale all quantities together and state that the axis changed.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Rescale all quantities together and state that the axis changed. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/axis-rescale.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Make a rescale explicit</h1><p class=\"g-purpose\">Rescale all quantities together and state that the axis changed.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"axis-rescale\"><svg aria-hidden=\"true\" class=\"path\" viewbox=\"0 0 1080 410\"><path d=\"M120 55V315H930\" fill=\"none\" pathlength=\"1\" stroke=\"#718594\" stroke-width=\"2\" style=\"stroke-dasharray:1\"></path></svg><div class=\"obj\" data-states='{\"0\":{\"width\":\"300px\"},\"1\":{\"width\":\"195px\"}}' style=\"left:120px;top:80px;width:300px;height:38px\"></div><div class=\"obj\" data-states='{\"0\":{\"width\":\"590px\"},\"1\":{\"width\":\"383.5px\"}}' style=\"left:120px;top:152px;width:590px;height:38px\"></div><div class=\"obj\" data-states='{\"0\":{\"width\":\"760px\"},\"1\":{\"width\":\"494px\"}}' style=\"left:120px;top:224px;width:760px;height:38px\"></div><div class=\"label\" data-states='{\"0\":{\"opacity\":0},\"1\":{\"opacity\":1}}' style=\"left:160px;top:340px;\">Scale expanded × 1.54</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/axis-rescale.mjs</code></div>"
};
