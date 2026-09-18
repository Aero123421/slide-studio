// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-route-switch",
  "title": "Switch the active route",
  "notes": "Purpose: Show an alternative path without changing endpoints.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Show an alternative path without changing endpoints. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/route-switch.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Switch the active route</h1><p class=\"g-purpose\">Show an alternative path without changing endpoints.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"route-switch\"><div class=\"obj dot\" style=\"left:75px;top:175px;width:48px;height:48px\">A</div><div class=\"obj dot\" style=\"left:930px;top:175px;width:48px;height:48px\">B</div><svg aria-hidden=\"true\" class=\"path\" viewbox=\"0 0 1080 410\"><path d=\"M125 198C320 35 700 35 930 198\" data-states='{\"0\":{\"opacity\":1},\"1\":{\"opacity\":0.15}}' fill=\"none\" pathlength=\"1\" stroke=\"#28617b\" stroke-width=\"5\" style=\"stroke-dasharray:1\"></path></svg><svg aria-hidden=\"true\" class=\"path\" viewbox=\"0 0 1080 410\"><path d=\"M125 198C320 360 700 360 930 198\" data-states='{\"0\":{\"opacity\":0.15},\"1\":{\"opacity\":1}}' fill=\"none\" pathlength=\"1\" stroke=\"#ae4f31\" stroke-width=\"5\" style=\"stroke-dasharray:1\"></path></svg></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/route-switch.mjs</code></div>"
};
