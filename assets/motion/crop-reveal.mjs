// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-crop-reveal",
  "title": "Reveal through a crop",
  "notes": "Purpose: Expose a whole from a registered detail without changing identity.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Expose a whole from a registered detail without changing identity. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/crop-reveal.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Reveal through a crop</h1><p class=\"g-purpose\">Expose a whole from a registered detail without changing identity.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"crop-reveal\"><div class=\"obj\" data-states='{\"0\":{\"clipPath\":\"inset(25% 40% 25% 40%)\"},\"1\":{\"clipPath\":\"inset(10% 20% 10% 20%)\"},\"2\":{\"clipPath\":\"inset(0% 0% 0% 0%)\"}}' style=\"left:160px;top:70px;width:740px;height:250px\">Same object · wider context</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/crop-reveal.mjs</code></div>"
};
