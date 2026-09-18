// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-line-trace",
  "title": "Trace observations in order",
  "notes": "Purpose: Show the ordering of a line without inventing intermediate observations.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Show the ordering of a line without inventing intermediate observations. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/line-trace.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Trace observations in order</h1><p class=\"g-purpose\">Show the ordering of a line without inventing intermediate observations.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"line-trace\"><svg aria-hidden=\"true\" class=\"path\" viewbox=\"0 0 1080 410\"><path d=\"M120 55V315H930\" fill=\"none\" pathlength=\"1\" stroke=\"#718594\" stroke-width=\"2\" style=\"stroke-dasharray:1\"></path></svg><svg aria-hidden=\"true\" class=\"path\" viewbox=\"0 0 1080 410\"><path d=\"M120 290L290 235L450 245L625 155L810 80L930 110\" data-states='{\"0\":{\"strokeDashoffset\":1},\"1\":{\"strokeDashoffset\":0.6},\"2\":{\"strokeDashoffset\":0}}' fill=\"none\" pathlength=\"1\" stroke=\"#28617b\" stroke-width=\"4\" style=\"stroke-dasharray:1\"></path></svg></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/line-trace.mjs</code></div>"
};
