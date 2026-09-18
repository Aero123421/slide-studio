// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-causal-chain",
  "title": "Build a causal argument",
  "notes": "Purpose: Introduce premises before a qualified conclusion; arrows alone are not evidence.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Introduce premises before a qualified conclusion; arrows alone are not evidence. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/causal-chain.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Build a causal argument</h1><p class=\"g-purpose\">Introduce premises before a qualified conclusion; arrows alone are not evidence.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"causal-chain\"><div class=\"obj\" data-states='{\"0\":{\"opacity\":0},\"1\":{\"opacity\":1}}' style=\"left:40px;top:155px;width:290px;height:85px\">Premise</div><div class=\"obj\" data-states='{\"0\":{\"opacity\":0},\"2\":{\"opacity\":1}}' style=\"left:385px;top:155px;width:290px;height:85px\">Mechanism</div><div class=\"obj\" data-states='{\"0\":{\"opacity\":0},\"3\":{\"opacity\":1}}' style=\"left:730px;top:155px;width:290px;height:85px\">Qualified claim</div><svg aria-hidden=\"true\" class=\"path\" viewbox=\"0 0 1080 410\"><path d=\"M330 198H385M675 198H730\" data-states='{\"0\":{\"opacity\":0},\"2\":{\"opacity\":1}}' fill=\"none\" pathlength=\"1\" stroke=\"#28617b\" stroke-width=\"4\" style=\"stroke-dasharray:1\"></path></svg><div class=\"label\" style=\"left:30px;top:340px;color:#465f6a;font-size:23px\">An arrow does not itself establish causality.</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/causal-chain.mjs</code></div>"
};
