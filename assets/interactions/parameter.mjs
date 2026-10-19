// Interaction study · Parameter explorer. The widget (assets/runtime/widgets.js) computes from its data;
// replace config.data / config.initial and the headline for your subject. Keep reset, keyboard and static export.
export default {
  study: true,
  "id": "interaction-parameter",
  "title": "Frequency and amplitude reshape the wave; the axes stay put",
  "notes": "Purpose: Recompute a function while preserving its axes.\nModify: Replace toy content and data; keep controls, state, plot and final summary synchronized. Restyle the complete slide, not just the control panel.\nInvariant: No required hover-only content. Keyboard alternative, reset, local scope, no network, and useful static export are required.\nStatic: Current selected state plus an explicit caption; video uses a selected poster. For an argument, choose a meaningful state or expand multiple states to slides.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/interactions/parameter.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "st cs-physics-lecture",
  "content": "<h1 class=\"st-head\">Frequency and amplitude reshape the wave; the axes stay put</h1><p class=\"st-dek\">A sine wave recomputed from two parameters on fixed axes.</p><div class=\"widget\" data-interactive=\"\" id=\"interaction-parameter-widget\"><div class=\"w-plot\"></div><div class=\"w-controls\"></div><output aria-live=\"polite\" class=\"w-status\"></output></div><p class=\"st-source\" data-region=\"source\"><span>Synthetic example · runs locally, no network</span><span>Interaction · Parameter explorer</span></p>",
  "widgets": [
    {
      "id": "interaction-parameter-widget",
      "kind": "parameter",
      "initial": {
        "frequency": 2,
        "amplitude": 0.7
      }
    }
  ]
};
