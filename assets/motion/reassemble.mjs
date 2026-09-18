// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-reassemble",
  "title": "Reassemble layers",
  "notes": "Purpose: Return parts to one registered object.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Return parts to one registered object. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/reassemble.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Reassemble layers</h1><p class=\"g-purpose\">Return parts to one registered object.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"reassemble\"><div class=\"obj\" data-states='{\"0\":{\"transform\":\"translateY(92px) rotateX(25deg)\"},\"1\":{\"transform\":\"translateY(0px) rotateX(25deg)\"}}' style=\"left:325px;top:166px;width:420px;height:120px\"></div><div class=\"obj\" data-states='{\"0\":{\"transform\":\"translateY(0px) rotateX(25deg)\"},\"1\":{\"transform\":\"translateY(0px) rotateX(25deg)\"}}' style=\"left:325px;top:148px;width:420px;height:120px\"></div><div class=\"obj\" data-states='{\"0\":{\"transform\":\"translateY(-92px) rotateX(25deg)\"},\"1\":{\"transform\":\"translateY(0px) rotateX(25deg)\"}}' style=\"left:325px;top:130px;width:420px;height:120px\"></div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/reassemble.mjs</code></div>"
};
