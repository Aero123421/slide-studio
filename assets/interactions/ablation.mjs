// Interaction study · Controlled toy ablation. The widget (assets/runtime/widgets.js) computes from its data;
// replace config.data / config.initial and the headline for your subject. Keep reset, keyboard and static export.
export default {
  study: true,
  "id": "interaction-ablation",
  "title": "The toy score is the sum of the components switched on",
  "notes": "Purpose: Toggle components in a clearly specified synthetic model.\nModify: Replace toy content and data; keep controls, state, plot and final summary synchronized. Restyle the complete slide, not just the control panel.\nInvariant: No required hover-only content. Keyboard alternative, reset, local scope, no network, and useful static export are required.\nStatic: Current selected state plus an explicit caption; video uses a selected poster. For an argument, choose a meaningful state or expand multiple states to slides.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/interactions/ablation.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "st cs-sales-kpi",
  "content": "<h1 class=\"st-head\">The toy score is the sum of the components switched on</h1><p class=\"st-dek\">A stated additive model, not a measured benchmark.</p><div class=\"widget\" data-interactive=\"\" id=\"interaction-ablation-widget\"><div class=\"w-plot\"></div><div class=\"w-controls\"></div><output aria-live=\"polite\" class=\"w-status\"></output></div><p class=\"st-source\" data-region=\"source\"><span>Synthetic example · runs locally, no network</span><span>Interaction · Controlled toy ablation</span></p>",
  "widgets": [
    {
      "id": "interaction-ablation-widget",
      "kind": "ablation",
      "initial": {
        "a": true,
        "b": true,
        "c": true
      }
    }
  ]
};
