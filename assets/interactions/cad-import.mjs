// Interaction study · Open a local OBJ or STL. The widget (assets/runtime/widgets.js) computes from its data;
// replace config.data / config.initial and the headline for your subject. Keep reset, keyboard and static export.
export default {
  study: true,
  "id": "interaction-cad-import",
  "title": "Open a local OBJ or STL — parsed here, never uploaded",
  "notes": "Purpose: Parse a user-selected geometry file locally, with bounded size and no upload.\nModify: Replace toy content and data; keep controls, state, plot and final summary synchronized. Restyle the complete slide, not just the control panel.\nInvariant: No required hover-only content. Keyboard alternative, reset, local scope, no network, and useful static export are required.\nStatic: Current selected state plus an explicit caption; video uses a selected poster. For an argument, choose a meaningful state or expand multiple states to slides.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/interactions/cad-import.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "st cs-tech-conference-light",
  "content": "<h1 class=\"st-head\">Open a local OBJ or STL — parsed here, never uploaded</h1><p class=\"st-dek\">Up to 8 MiB and 40,000 triangles; units are unknown unless stated.</p><div class=\"widget\" data-interactive=\"\" id=\"interaction-cad-import-widget\"><div class=\"w-plot\"></div><div class=\"w-controls\"></div><output aria-live=\"polite\" class=\"w-status\"></output></div><p class=\"st-source\" data-region=\"source\"><span>Synthetic example · runs locally, no network</span><span>Interaction · Open a local OBJ or STL</span></p>",
  "widgets": [
    {
      "id": "interaction-cad-import-widget",
      "kind": "cad-import",
      "initial": {
        "yaw": 35,
        "pitch": 60,
        "explode": 0,
        "cut": 1,
        "filename": ""
      }
    }
  ]
};
