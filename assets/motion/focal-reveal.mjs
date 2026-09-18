// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-focal-reveal",
  "title": "Reveal the focal subject",
  "notes": "Purpose: Introduce the subject before context competes with it.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Introduce the subject before context competes with it. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/focal-reveal.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Reveal the focal subject</h1><p class=\"g-purpose\">Introduce the subject before context competes with it.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"focal-reveal\"><div class=\"obj\" data-states='{\"0\":{\"opacity\":0},\"1\":{\"opacity\":1}}' style=\"left:405px;top:135px;width:230px;height:110px\">Subject</div><div class=\"obj\" data-states='{\"0\":{\"opacity\":0},\"2\":{\"opacity\":1}}' style=\"left:95px;top:80px;width:210px;height:75px\">Context A</div><div class=\"obj\" data-states='{\"0\":{\"opacity\":0},\"3\":{\"opacity\":1}}' style=\"left:735px;top:225px;width:210px;height:75px\">Context B</div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/focal-reveal.mjs</code></div>"
};
