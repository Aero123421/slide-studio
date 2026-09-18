// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-state-replacement",
  "title": "Replace a state, not an identity",
  "notes": "Purpose: Preserve position while a status changes.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Preserve position while a status changes. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/state-replacement.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Replace a state, not an identity</h1><p class=\"g-purpose\">Preserve position while a status changes.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"state-replacement\"><div class=\"obj\" style=\"left:350px;top:90px;width:350px;height:100px\">Item 01</div><div data-step=\"0\" data-until=\"0\"><div class=\"label\" style=\"left:430px;top:225px;font-size:36px\">Pending</div></div><div data-step=\"1\" data-until=\"1\"><div class=\"label\" style=\"left:430px;top:225px;font-size:36px\">Ready</div></div><div data-step=\"2\"><div class=\"label\" style=\"left:430px;top:225px;font-size:36px\">Complete</div></div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/state-replacement.mjs</code></div>"
};
