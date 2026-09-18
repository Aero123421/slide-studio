// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-time-cursor",
  "title": "Follow a time cursor",
  "notes": "Purpose: Keep the full trajectory visible while highlighting an instant.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Keep the full trajectory visible while highlighting an instant. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/time-cursor.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Follow a time cursor</h1><p class=\"g-purpose\">Keep the full trajectory visible while highlighting an instant.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"time-cursor\"><svg aria-hidden=\"true\" class=\"path\" viewbox=\"0 0 1080 410\"><path d=\"M120 55V315H930\" fill=\"none\" pathlength=\"1\" stroke=\"#718594\" stroke-width=\"2\" style=\"stroke-dasharray:1\"></path></svg><svg aria-hidden=\"true\" class=\"path\" viewbox=\"0 0 1080 410\"><path d=\"M120 275L300 200L480 230L650 105L900 145\" fill=\"none\" pathlength=\"1\" stroke=\"#28617b\" stroke-width=\"4\" style=\"stroke-dasharray:1\"></path></svg><svg aria-hidden=\"true\" class=\"path\" viewbox=\"0 0 1080 410\"><path d=\"M160 55V312\" data-states='{\"0\":{\"transform\":\"translateX(0px)\"},\"1\":{\"transform\":\"translateX(330px)\"},\"2\":{\"transform\":\"translateX(640px)\"}}' fill=\"none\" pathlength=\"1\" stroke=\"#ae4f31\" stroke-width=\"3\" style=\"stroke-dasharray:1\"></path></svg></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/time-cursor.mjs</code></div>"
};
