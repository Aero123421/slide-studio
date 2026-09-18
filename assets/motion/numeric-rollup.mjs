// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-numeric-rollup",
  "title": "Roll up countable units",
  "notes": "Purpose: Replace individually visible units with a labeled total.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Replace individually visible units with a labeled total. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/numeric-rollup.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Roll up countable units</h1><p class=\"g-purpose\">Replace individually visible units with a labeled total.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"numeric-rollup\"><div class=\"obj dot\" data-states='{\"0\":{\"opacity\":1},\"1\":{\"opacity\":0}}' style=\"left:140px;top:90px;width:50px;height:50px\"></div><div class=\"obj dot\" data-states='{\"0\":{\"opacity\":1},\"1\":{\"opacity\":0}}' style=\"left:240px;top:90px;width:50px;height:50px\"></div><div class=\"obj dot\" data-states='{\"0\":{\"opacity\":1},\"1\":{\"opacity\":0}}' style=\"left:340px;top:90px;width:50px;height:50px\"></div><div class=\"obj dot\" data-states='{\"0\":{\"opacity\":1},\"1\":{\"opacity\":0}}' style=\"left:440px;top:90px;width:50px;height:50px\"></div><div class=\"obj dot\" data-states='{\"0\":{\"opacity\":1},\"1\":{\"opacity\":0}}' style=\"left:540px;top:90px;width:50px;height:50px\"></div><div class=\"obj dot\" data-states='{\"0\":{\"opacity\":1},\"1\":{\"opacity\":0}}' style=\"left:640px;top:90px;width:50px;height:50px\"></div><div class=\"obj dot\" data-states='{\"0\":{\"opacity\":1},\"1\":{\"opacity\":0}}' style=\"left:140px;top:190px;width:50px;height:50px\"></div><div class=\"obj dot\" data-states='{\"0\":{\"opacity\":1},\"1\":{\"opacity\":0}}' style=\"left:240px;top:190px;width:50px;height:50px\"></div><div class=\"obj dot\" data-states='{\"0\":{\"opacity\":1},\"1\":{\"opacity\":0}}' style=\"left:340px;top:190px;width:50px;height:50px\"></div><div class=\"obj dot\" data-states='{\"0\":{\"opacity\":1},\"1\":{\"opacity\":0}}' style=\"left:440px;top:190px;width:50px;height:50px\"></div><div class=\"obj dot\" data-states='{\"0\":{\"opacity\":1},\"1\":{\"opacity\":0}}' style=\"left:540px;top:190px;width:50px;height:50px\"></div><div class=\"obj dot\" data-states='{\"0\":{\"opacity\":1},\"1\":{\"opacity\":0}}' style=\"left:640px;top:190px;width:50px;height:50px\"></div><div class=\"label\" data-states='{\"0\":{\"opacity\":0},\"1\":{\"opacity\":1}}' style=\"left:370px;top:120px;font-size:76px\">12 units</div><div class=\"label\" style=\"left:30px;top:340px;color:#465f6a;font-size:23px\">The displayed total equals the counted source units.</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/numeric-rollup.mjs</code></div>"
};
