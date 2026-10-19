// Interaction study · Image magnifier. The widget (assets/runtime/widgets.js) computes from its data;
// replace config.data / config.initial and the headline for your subject. Keep reset, keyboard and static export.
export default {
  study: true,
  "id": "interaction-magnifier",
  "title": "Magnify a region without touching the source pixels",
  "notes": "Purpose: Change crop and magnification without altering source pixels.\nModify: Replace toy content and data; keep controls, state, plot and final summary synchronized. Restyle the complete slide, not just the control panel.\nInvariant: No required hover-only content. Keyboard alternative, reset, local scope, no network, and useful static export are required.\nStatic: Current selected state plus an explicit caption; video uses a selected poster. For an argument, choose a meaningful state or expand multiple states to slides.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/interactions/magnifier.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "st cs-food-market",
  "content": "<h1 class=\"st-head\">Magnify a region without touching the source pixels</h1><div class=\"widget\" data-interactive=\"\" id=\"interaction-magnifier-widget\"><div class=\"w-plot\"></div><div class=\"w-controls\"></div><output aria-live=\"polite\" class=\"w-status\"></output></div><p class=\"st-source\" data-region=\"source\"><span>Synthetic example · runs locally, no network</span><span>Interaction · Image magnifier</span></p>",
  "widgets": [
    {
      "id": "interaction-magnifier-widget",
      "kind": "magnifier",
      "initial": {
        "zoom": 1.4,
        "x": 50,
        "y": 50
      }
    }
  ]
};
