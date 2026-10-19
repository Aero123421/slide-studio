// Interaction study · Component inspector. The widget (assets/runtime/widgets.js) computes from its data;
// replace config.data / config.initial and the headline for your subject. Keep reset, keyboard and static export.
export default {
  study: true,
  "id": "interaction-hotspots",
  "title": "Each component has one job in the signal chain",
  "notes": "Purpose: Select one component and read its role.\nModify: Replace toy content and data; keep controls, state, plot and final summary synchronized. Restyle the complete slide, not just the control panel.\nInvariant: No required hover-only content. Keyboard alternative, reset, local scope, no network, and useful static export are required.\nStatic: Current selected state plus an explicit caption; video uses a selected poster. For an argument, choose a meaningful state or expand multiple states to slides.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/interactions/hotspots.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "st cs-laboratory",
  "content": "<h1 class=\"st-head st-one\">Each component has one job in the signal chain</h1><p class=\"st-dek\">Select a part to read its role.</p><div class=\"widget\" data-interactive=\"\" id=\"interaction-hotspots-widget\"><div class=\"w-plot\"></div><div class=\"w-controls\"></div><output aria-live=\"polite\" class=\"w-status\"></output></div><p class=\"st-source\" data-region=\"source\"><span>Synthetic example · runs locally, no network</span><span>Interaction · Component inspector</span></p>",
  "widgets": [
    {
      "id": "interaction-hotspots-widget",
      "kind": "hotspots",
      "initial": {
        "part": "source"
      }
    }
  ]
};
