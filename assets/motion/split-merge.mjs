// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-split-merge",
  "title": "Split then recombine",
  "notes": "Purpose: Show multiple representations of a preserved subject.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Show multiple representations of a preserved subject. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/split-merge.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Split then recombine</h1><p class=\"g-purpose\">Show multiple representations of a preserved subject.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"split-merge\"><div class=\"obj\" data-states='{\"0\":{\"opacity\":1},\"1\":{\"opacity\":0},\"2\":{\"opacity\":1}}' style=\"left:420px;top:140px;width:220px;height:100px\">Whole</div><div class=\"obj\" data-states='{\"0\":{\"opacity\":0,\"transform\":\"translate(0px,0px)\"},\"1\":{\"opacity\":1,\"transform\":\"translate(-320px,-60px)\"},\"2\":{\"opacity\":0,\"transform\":\"translate(0px,0px)\"}}' style=\"left:420px;top:140px;width:220px;height:100px\">A</div><div class=\"obj\" data-states='{\"0\":{\"opacity\":0,\"transform\":\"translate(0px,0px)\"},\"1\":{\"opacity\":1,\"transform\":\"translate(0px,110px)\"},\"2\":{\"opacity\":0,\"transform\":\"translate(0px,0px)\"}}' style=\"left:420px;top:140px;width:220px;height:100px\">B</div><div class=\"obj\" data-states='{\"0\":{\"opacity\":0,\"transform\":\"translate(0px,0px)\"},\"1\":{\"opacity\":1,\"transform\":\"translate(320px,-60px)\"},\"2\":{\"opacity\":0,\"transform\":\"translate(0px,0px)\"}}' style=\"left:420px;top:140px;width:220px;height:100px\">C</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/split-merge.mjs</code></div>"
};
