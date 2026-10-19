// Interaction study · Open mesh cutaway. The widget (assets/runtime/widgets.js) computes from its data;
// replace config.data / config.initial and the headline for your subject. Keep reset, keyboard and static export.
export default {
  study: true,
  "id": "interaction-cad-section",
  "title": "A cutaway hides triangles; it is not a capped solid section",
  "notes": "Purpose: Clip triangles against a moving plane; distinguish this from a CAD solid section.\nModify: Replace toy content and data; keep controls, state, plot and final summary synchronized. Restyle the complete slide, not just the control panel.\nInvariant: No required hover-only content. Keyboard alternative, reset, local scope, no network, and useful static export are required.\nStatic: Current selected state plus an explicit caption; video uses a selected poster. For an argument, choose a meaningful state or expand multiple states to slides.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/interactions/cad-section.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "st cs-blueprint",
  "content": "<h1 class=\"st-head\">A cutaway hides triangles; it is not a capped solid section</h1><div class=\"widget\" data-interactive=\"\" id=\"interaction-cad-section-widget\"><div class=\"w-plot\"></div><div class=\"w-controls\"></div><output aria-live=\"polite\" class=\"w-status\"></output></div><p class=\"st-source\" data-region=\"source\"><span>Synthetic example · runs locally, no network</span><span>Interaction · Open mesh cutaway</span></p>",
  "widgets": [
    {
      "id": "interaction-cad-section-widget",
      "kind": "cad-section",
      "initial": {
        "yaw": 35,
        "pitch": 60,
        "explode": 0,
        "cut": 1
      }
    }
  ]
};
