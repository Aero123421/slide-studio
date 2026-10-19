// Interaction study · Inspect actual mesh geometry. The widget (assets/runtime/widgets.js) computes from its data;
// replace config.data / config.initial and the headline for your subject. Keep reset, keyboard and static export.
export default {
  study: true,
  "id": "interaction-cad-orbit",
  "title": "Turn the assembly to see what the front view hides",
  "notes": "Purpose: Rotate triangle geometry with pointer, keyboard or sliders.\nModify: Replace toy content and data; keep controls, state, plot and final summary synchronized. Restyle the complete slide, not just the control panel.\nInvariant: No required hover-only content. Keyboard alternative, reset, local scope, no network, and useful static export are required.\nStatic: Current selected state plus an explicit caption; video uses a selected poster. For an argument, choose a meaningful state or expand multiple states to slides.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/interactions/cad-orbit.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "st cs-manufacturing-plant",
  "content": "<h1 class=\"st-head st-one\">Turn the assembly to see what the front view hides</h1><p class=\"st-dek\">Mesh geometry only: no materials, tolerances or design history.</p><div class=\"widget\" data-interactive=\"\" id=\"interaction-cad-orbit-widget\"><div class=\"w-plot\"></div><div class=\"w-controls\"></div><output aria-live=\"polite\" class=\"w-status\"></output></div><p class=\"st-source\" data-region=\"source\"><span>Synthetic example · runs locally, no network</span><span>Interaction · Inspect actual mesh geometry</span></p>",
  "widgets": [
    {
      "id": "interaction-cad-orbit-widget",
      "kind": "cad-orbit",
      "initial": {
        "yaw": 35,
        "pitch": 60,
        "explode": 0,
        "cut": 1
      }
    }
  ]
};
