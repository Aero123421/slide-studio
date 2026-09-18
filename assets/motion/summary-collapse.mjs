// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-summary-collapse",
  "title": "Collapse into a summary",
  "notes": "Purpose: Summarize groups without hiding the existence of supporting evidence.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Summarize groups without hiding the existence of supporting evidence. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/summary-collapse.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Collapse into a summary</h1><p class=\"g-purpose\">Summarize groups without hiding the existence of supporting evidence.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"summary-collapse\"><div class=\"obj\" data-states='{\"0\":{\"opacity\":1},\"1\":{\"opacity\":0.2,\"transform\":\"translateY(20px)\"}}' style=\"left:90px;top:60px;width:270px;height:100px\">Finding A</div><div class=\"obj\" data-states='{\"0\":{\"opacity\":1},\"1\":{\"opacity\":0.2,\"transform\":\"translateY(20px)\"}}' style=\"left:420px;top:60px;width:270px;height:100px\">Finding B</div><div class=\"obj\" data-states='{\"0\":{\"opacity\":1},\"1\":{\"opacity\":0.2,\"transform\":\"translateY(20px)\"}}' style=\"left:750px;top:60px;width:270px;height:100px\">Finding C</div><div class=\"obj\" data-states='{\"0\":{\"opacity\":0},\"1\":{\"opacity\":1}}' style=\"left:225px;top:255px;width:630px;height:65px\">Summary with retained support</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/summary-collapse.mjs</code></div>"
};
