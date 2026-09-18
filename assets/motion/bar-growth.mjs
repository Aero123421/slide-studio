// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-bar-growth",
  "title": "Grow from the baseline",
  "notes": "Purpose: Reveal quantity from a shared zero rather than scaling the entire chart.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Reveal quantity from a shared zero rather than scaling the entire chart. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/bar-growth.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Grow from the baseline</h1><p class=\"g-purpose\">Reveal quantity from a shared zero rather than scaling the entire chart.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"bar-growth\"><svg aria-hidden=\"true\" class=\"path\" viewbox=\"0 0 1080 410\"><path d=\"M120 55V315H930\" fill=\"none\" pathlength=\"1\" stroke=\"#718594\" stroke-width=\"2\" style=\"stroke-dasharray:1\"></path></svg><div class=\"obj\" data-states='{\"0\":{\"clipPath\":\"inset(0 100% 0 0)\"},\"1\":{\"clipPath\":\"inset(0 0% 0 0)\"}}' style=\"left:120px;top:70px;width:430px;height:40px\"></div><div class=\"obj\" data-states='{\"0\":{\"clipPath\":\"inset(0 100% 0 0)\"},\"2\":{\"clipPath\":\"inset(0 0% 0 0)\"}}' style=\"left:120px;top:148px;width:620px;height:40px\"></div><div class=\"obj\" data-states='{\"0\":{\"clipPath\":\"inset(0 100% 0 0)\"},\"3\":{\"clipPath\":\"inset(0 0% 0 0)\"}}' style=\"left:120px;top:226px;width:510px;height:40px\"></div><div class=\"label\" style=\"left:30px;top:340px;color:#465f6a;font-size:23px\">Lengths encode quantities, not animation duration.</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/bar-growth.mjs</code></div>"
};
