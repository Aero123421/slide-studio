// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-layer-peel",
  "title": "Peel one layer",
  "notes": "Purpose: Reveal one layer while keeping the remaining assembly legible.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Reveal one layer while keeping the remaining assembly legible. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/layer-peel.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Peel one layer</h1><p class=\"g-purpose\">Reveal one layer while keeping the remaining assembly legible.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"layer-peel\"><div class=\"obj\" data-states='{\"0\":{\"opacity\":0},\"1\":{\"opacity\":1}}' style=\"left:250px;top:90px;width:550px;height:230px\">Inner structure</div><div class=\"obj\" data-states='{\"0\":{\"transform\":\"translate(0px,0px)\",\"opacity\":1},\"1\":{\"transform\":\"translate(160px,-60px)\",\"opacity\":0.2}}' style=\"left:250px;top:90px;width:550px;height:230px\">Cover</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/layer-peel.mjs</code></div>"
};
