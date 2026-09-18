// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-explode",
  "title": "Explode registered layers",
  "notes": "Purpose: Separate components along a shared axis.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Separate components along a shared axis. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/explode.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Explode registered layers</h1><p class=\"g-purpose\">Separate components along a shared axis.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"explode\"><div class=\"obj\" data-states='{\"0\":{\"transform\":\"translateY(0px) rotateX(25deg)\"},\"1\":{\"transform\":\"translateY(92px) rotateX(25deg)\"}}' style=\"left:325px;top:166px;width:420px;height:120px\"></div><div class=\"obj\" data-states='{\"0\":{\"transform\":\"translateY(0px) rotateX(25deg)\"},\"1\":{\"transform\":\"translateY(0px) rotateX(25deg)\"}}' style=\"left:325px;top:148px;width:420px;height:120px\"></div><div class=\"obj\" data-states='{\"0\":{\"transform\":\"translateY(0px) rotateX(25deg)\"},\"1\":{\"transform\":\"translateY(-92px) rotateX(25deg)\"}}' style=\"left:325px;top:130px;width:420px;height:120px\"></div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/explode.mjs</code></div>"
};
