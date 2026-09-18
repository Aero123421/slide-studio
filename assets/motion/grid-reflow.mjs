// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-grid-reflow",
  "title": "Reflow a group",
  "notes": "Purpose: Change arrangement without silently changing membership.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Change arrangement without silently changing membership. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/grid-reflow.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Reflow a group</h1><p class=\"g-purpose\">Change arrangement without silently changing membership.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"grid-reflow\"><div class=\"obj\" data-states='{\"0\":{\"transform\":\"translate(0px,0px)\"},\"1\":{\"transform\":\"translate(150px,-65px)\"}}' style=\"left:50px;top:160px;width:120px;height:65px\">1</div><div class=\"obj\" data-states='{\"0\":{\"transform\":\"translate(0px,0px)\"},\"1\":{\"transform\":\"translate(260px,-65px)\"}}' style=\"left:210px;top:160px;width:120px;height:65px\">2</div><div class=\"obj\" data-states='{\"0\":{\"transform\":\"translate(0px,0px)\"},\"1\":{\"transform\":\"translate(370px,-65px)\"}}' style=\"left:370px;top:160px;width:120px;height:65px\">3</div><div class=\"obj\" data-states='{\"0\":{\"transform\":\"translate(0px,0px)\"},\"1\":{\"transform\":\"translate(-330px,45px)\"}}' style=\"left:530px;top:160px;width:120px;height:65px\">4</div><div class=\"obj\" data-states='{\"0\":{\"transform\":\"translate(0px,0px)\"},\"1\":{\"transform\":\"translate(-220px,45px)\"}}' style=\"left:690px;top:160px;width:120px;height:65px\">5</div><div class=\"obj\" data-states='{\"0\":{\"transform\":\"translate(0px,0px)\"},\"1\":{\"transform\":\"translate(-110px,45px)\"}}' style=\"left:850px;top:160px;width:120px;height:65px\">6</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/grid-reflow.mjs</code></div>"
};
