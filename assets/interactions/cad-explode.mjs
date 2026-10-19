// Interaction study · Explode CAD-derived groups. The widget (assets/runtime/widgets.js) computes from its data;
// replace config.data / config.initial and the headline for your subject. Keep reset, keyboard and static export.
export default {
  study: true,
  "id": "interaction-cad-explode",
  "title": "Pulling the groups apart shows how the assembly stacks",
  "notes": "Purpose: Separate named mesh groups while retaining one source assembly.\nModify: Replace toy content and data; keep controls, state, plot and final summary synchronized. Restyle the complete slide, not just the control panel.\nInvariant: No required hover-only content. Keyboard alternative, reset, local scope, no network, and useful static export are required.\nStatic: Current selected state plus an explicit caption; video uses a selected poster. For an argument, choose a meaningful state or expand multiple states to slides.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/interactions/cad-explode.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "st cs-materials-lab",
  "content": "<h1 class=\"st-head\">Pulling the groups apart shows how the assembly stacks</h1><div class=\"widget\" data-interactive=\"\" id=\"interaction-cad-explode-widget\"><div class=\"w-plot\"></div><div class=\"w-controls\"></div><output aria-live=\"polite\" class=\"w-status\"></output></div><p class=\"st-source\" data-region=\"source\"><span>Synthetic example · runs locally, no network</span><span>Interaction · Explode CAD-derived groups</span></p>",
  "widgets": [
    {
      "id": "interaction-cad-explode-widget",
      "kind": "cad-explode",
      "initial": {
        "yaw": 35,
        "pitch": 60,
        "explode": 0,
        "cut": 1
      }
    }
  ]
};
