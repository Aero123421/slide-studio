// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-diagram-dolly",
  "title": "Approach the key node",
  "notes": "Purpose: Enlarge a meaningful region, not a random camera flourish.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Enlarge a meaningful region, not a random camera flourish. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/diagram-dolly.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Approach the key node</h1><p class=\"g-purpose\">Enlarge a meaningful region, not a random camera flourish.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"diagram-dolly\"><div class=\"obj\" data-states='{\"0\":{\"opacity\":1},\"1\":{\"opacity\":0.2}}' style=\"left:60px;top:90px;width:220px;height:110px\">Other</div><div class=\"obj\" data-states='{\"0\":{\"transform\":\"scale(1)\"},\"1\":{\"transform\":\"scale(1.6)\"}}' style=\"left:470px;top:135px;width:200px;height:105px\">Key</div><div class=\"obj\" data-states='{\"0\":{\"opacity\":1},\"1\":{\"opacity\":0.2}}' style=\"left:820px;top:90px;width:180px;height:110px\">Other</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/diagram-dolly.mjs</code></div>"
};
