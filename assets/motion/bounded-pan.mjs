// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "motion-bounded-pan",
  "title": "Pan inside a bounded canvas",
  "notes": "Purpose: Traverse a wide structure without moving the slide frame.\nModify: Change geometry, timing, text, paths and stage count. Keep identity and the stated semantic relationship. Replace the illustrative content.\nInvariant: Traverse a wide structure without moving the slide frame. Direct jumps, reverse and revisit must produce deterministic states.\nStatic: Keep the final semantic state; expand intermediate states into additional pages when they carry unique evidence.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/motion/bounded-pan.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Pan inside a bounded canvas</h1><p class=\"g-purpose\">Traverse a wide structure without moving the slide frame.</p><div class=\"g-demo\"><div class=\"study\" data-motion-study=\"bounded-pan\"><div class=\"clip\"><div class=\"obj\" data-states='{\"0\":{\"transform\":\"translateX(0px)\"},\"1\":{\"transform\":\"translateX(-300px)\"},\"2\":{\"transform\":\"translateX(-540px)\"}}' style=\"left:0px;top:110px;width:240px;height:135px\">A</div><div class=\"obj\" data-states='{\"0\":{\"transform\":\"translateX(0px)\"},\"1\":{\"transform\":\"translateX(-300px)\"},\"2\":{\"transform\":\"translateX(-540px)\"}}' style=\"left:320px;top:110px;width:240px;height:135px\">B</div><div class=\"obj\" data-states='{\"0\":{\"transform\":\"translateX(0px)\"},\"1\":{\"transform\":\"translateX(-300px)\"},\"2\":{\"transform\":\"translateX(-540px)\"}}' style=\"left:640px;top:110px;width:240px;height:135px\">C</div><div class=\"obj\" data-states='{\"0\":{\"transform\":\"translateX(0px)\"},\"1\":{\"transform\":\"translateX(-300px)\"},\"2\":{\"transform\":\"translateX(-540px)\"}}' style=\"left:960px;top:110px;width:240px;height:135px\">D</div><div class=\"obj\" data-states='{\"0\":{\"transform\":\"translateX(0px)\"},\"1\":{\"transform\":\"translateX(-300px)\"},\"2\":{\"transform\":\"translateX(-540px)\"}}' style=\"left:1280px;top:110px;width:240px;height:135px\">E</div></div></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/motion/bounded-pan.mjs</code></div>"
};
