// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-panel-expansion",
  "title": "Expand a selected panel",
  "notes": "Purpose: Promote one panel while retaining small overview thumbnails.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Promote one panel while retaining small overview thumbnails. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/panel-expansion.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Expand a selected panel</h1><p class=\"g-purpose\">Promote one panel while retaining small overview thumbnails.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"panel-expansion\"><div class=\"obj\" data-states='{\"0\":{\"transform\":\"translate(0px,0px) scale(1)\"},\"1\":{\"transform\":\"translate(0px,-85px) scale(.6)\",\"opacity\":0.5}}' style=\"left:70px;top:120px;width:275px;height:170px\">Panel 1</div><div class=\"obj\" data-states='{\"0\":{\"transform\":\"translate(0px,0px) scale(1)\"},\"1\":{\"transform\":\"translate(0px,0px) scale(1.6)\",\"opacity\":1}}' style=\"left:395px;top:120px;width:275px;height:170px\">Panel 2</div><div class=\"obj\" data-states='{\"0\":{\"transform\":\"translate(0px,0px) scale(1)\"},\"1\":{\"transform\":\"translate(0px,110px) scale(.6)\",\"opacity\":0.5}}' style=\"left:720px;top:120px;width:275px;height:170px\">Panel 3</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/panel-expansion.mjs</code></div>"
};
