// Interaction study · Decision threshold. The widget (assets/runtime/widgets.js) computes from its data;
// replace config.data / config.initial and the headline for your subject. Keep reset, keyboard and static export.
export default {
  study: true,
  "id": "interaction-threshold",
  "title": "Moving the threshold trades false alarms for misses",
  "notes": "Purpose: Inspect how a threshold changes classification counts.\nModify: Replace toy content and data; keep controls, state, plot and final summary synchronized. Restyle the complete slide, not just the control panel.\nInvariant: No required hover-only content. Keyboard alternative, reset, local scope, no network, and useful static export are required.\nStatic: Current selected state plus an explicit caption; video uses a selected poster. For an argument, choose a meaningful state or expand multiple states to slides.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/interactions/threshold.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "st cs-ml-eval",
  "content": "<h1 class=\"st-head\">Moving the threshold trades false alarms for misses</h1><p class=\"st-dek\">Twenty scored cases; every count recomputes from the scores.</p><div class=\"widget\" data-interactive=\"\" id=\"interaction-threshold-widget\"><div class=\"w-plot\"></div><div class=\"w-controls\"></div><output aria-live=\"polite\" class=\"w-status\"></output></div><p class=\"st-source\" data-region=\"source\"><span>Synthetic example · runs locally, no network</span><span>Interaction · Decision threshold</span></p>",
  "widgets": [
    {
      "id": "interaction-threshold-widget",
      "kind": "threshold",
      "initial": {
        "threshold": 0.5
      }
    }
  ]
};
