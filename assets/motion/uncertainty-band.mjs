// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-uncertainty-band",
  "title": "Reveal uncertainty",
  "notes": "Purpose: Add an interval without moving the estimate.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Add an interval without moving the estimate. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/uncertainty-band.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Reveal uncertainty</h1><p class=\"g-purpose\">Add an interval without moving the estimate.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"uncertainty-band\"><svg aria-hidden=\"true\" class=\"path\" viewbox=\"0 0 1080 410\"><path d=\"M120 55V315H930\" fill=\"none\" pathlength=\"1\" stroke=\"#718594\" stroke-width=\"2\" style=\"stroke-dasharray:1\"></path></svg><div class=\"obj\" data-states='{\"0\":{\"opacity\":0},\"1\":{\"opacity\":0.75}}' style=\"left:120px;top:145px;width:800px;height:100px\"></div><svg aria-hidden=\"true\" class=\"path\" viewbox=\"0 0 1080 410\"><path d=\"M120 195H920\" fill=\"none\" pathlength=\"1\" stroke=\"#ae4f31\" stroke-width=\"5\" style=\"stroke-dasharray:1\"></path></svg><div class=\"label\" style=\"left:30px;top:340px;color:#465f6a;font-size:23px\">Estimate stays fixed while interval becomes visible.</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/uncertainty-band.mjs</code></div>"
};
