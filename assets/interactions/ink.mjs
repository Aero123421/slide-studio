// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "interaction-ink",
  "title": "Presenter annotation",
  "notes": "Purpose: Annotate a slide with pointer input or a keyboard-accessible preset.\nModify: Replace toy content and data; keep controls, state, plot and final summary synchronized. Restyle the complete slide, not just the control panel.\nInvariant: No required hover-only content. Keyboard alternative, reset, local scope, no network, and useful static export are required.\nStatic: Current selected state plus an explicit caption; video uses a selected poster. For an argument, choose a meaningful state or expand multiple states to slides.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/interactions/ink.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Presenter annotation</h1><p class=\"g-purpose\">Annotate a slide with pointer input or a keyboard-accessible preset.</p><div class=\"g-demo\"><div class=\"widget\" data-interactive=\"\" id=\"interaction-ink-widget\"><div class=\"w-plot\"></div><div class=\"w-controls\"></div><output aria-live=\"polite\" class=\"w-status\"></output></div></div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/interactions/ink.mjs</code></div>",
  "widgets": [
    {
      "id": "interaction-ink-widget",
      "kind": "ink",
      "initial": {
        "paths": []
      }
    }
  ]
};
