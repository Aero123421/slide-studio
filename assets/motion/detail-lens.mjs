// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-detail-lens",
  "title": "Zoom a registered detail",
  "notes": "Purpose: Keep an overview visible while magnifying a region.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Keep an overview visible while magnifying a region. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/detail-lens.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Zoom a registered detail</h1><p class=\"g-purpose\">Keep an overview visible while magnifying a region.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"detail-lens\"><div class=\"obj framebox\" style=\"left:75px;top:70px;width:430px;height:230px\">Overview</div><div class=\"obj\" data-states='{\"0\":{\"opacity\":0},\"1\":{\"opacity\":1}}' style=\"left:640px;top:95px;width:330px;height:210px\">Detail</div><svg aria-hidden=\"true\" class=\"path\" viewbox=\"0 0 1080 410\"><path d=\"M385 140L640 95M385 240L640 305\" data-states='{\"0\":{\"opacity\":0},\"1\":{\"opacity\":1}}' fill=\"none\" pathlength=\"1\" stroke=\"#718594\" stroke-width=\"2\" style=\"stroke-dasharray:1\"></path></svg><div class=\"obj\" data-states='{\"0\":{\"backgroundColor\":\"#dce6e8\"},\"1\":{\"backgroundColor\":\"#d5b579\"}}' style=\"left:280px;top:145px;width:95px;height:90px\">X</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/detail-lens.mjs</code></div>"
};
