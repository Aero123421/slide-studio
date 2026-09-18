// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-trace-connection",
  "title": "Trace a connection",
  "notes": "Purpose: Follow the exact path between endpoints.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Follow the exact path between endpoints. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/trace-connection.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Trace a connection</h1><p class=\"g-purpose\">Follow the exact path between endpoints.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"trace-connection\"><svg aria-hidden=\"true\" class=\"path\" viewbox=\"0 0 1080 410\"><path d=\"M180 210C360 55 670 365 880 170\" data-states='{\"0\":{\"strokeDashoffset\":1},\"1\":{\"strokeDashoffset\":0.55},\"2\":{\"strokeDashoffset\":0}}' fill=\"none\" pathlength=\"1\" stroke=\"#28617b\" stroke-width=\"4\" style=\"stroke-dasharray:1\"></path></svg><div class=\"obj dot\" style=\"left:130px;top:185px;width:48px;height:48px\">A</div><div class=\"obj dot\" style=\"left:880px;top:145px;width:48px;height:48px\">B</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/trace-connection.mjs</code></div>"
};
