// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-contrast-statement",
  "title": "Contrast two statements",
  "notes": "Purpose: Separate alternatives spatially before highlighting the distinction.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Separate alternatives spatially before highlighting the distinction. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/contrast-statement.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Contrast two statements</h1><p class=\"g-purpose\">Separate alternatives spatially before highlighting the distinction.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"contrast-statement\"><div class=\"label\" data-states='{\"0\":{\"opacity\":1},\"1\":{\"opacity\":0.25}}' style=\"left:80px;top:100px;font-size:49px\">More decoration</div><div class=\"label\" data-states='{\"0\":{\"opacity\":0.25},\"1\":{\"opacity\":1}}' style=\"left:400px;top:220px;font-size:49px\">More explanation</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/contrast-statement.mjs</code></div>"
};
