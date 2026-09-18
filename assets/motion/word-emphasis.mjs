// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-word-emphasis",
  "title": "Emphasize one word",
  "notes": "Purpose: Use color and weight rather than constant letter motion.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Use color and weight rather than constant letter motion. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/word-emphasis.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Emphasize one word</h1><p class=\"g-purpose\">Use color and weight rather than constant letter motion.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"word-emphasis\"><div class=\"label\" style=\"left:100px;top:165px;font-size:52px\">Keep the</div><div class=\"label\" data-states='{\"0\":{\"color\":\"#17252d\",\"fontWeight\":\"400\"},\"1\":{\"color\":\"#ae4f31\",\"fontWeight\":\"700\"}}' style=\"left:350px;top:165px;font-size:52px\">meaning.</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/word-emphasis.mjs</code></div>"
};
