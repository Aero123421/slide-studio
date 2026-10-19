// Interaction study · Seeded resampling. The widget (assets/runtime/widgets.js) computes from its data;
// replace config.data / config.initial and the headline for your subject. Keep reset, keyboard and static export.
export default {
  study: true,
  "id": "interaction-bootstrap",
  "title": "One resample is one draw — not a confidence interval",
  "notes": "Purpose: Explore sample variation without claiming a single resample is an interval.\nModify: Replace toy content and data; keep controls, state, plot and final summary synchronized. Restyle the complete slide, not just the control panel.\nInvariant: No required hover-only content. Keyboard alternative, reset, local scope, no network, and useful static export are required.\nStatic: Current selected state plus an explicit caption; video uses a selected poster. For an argument, choose a meaningful state or expand multiple states to slides.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/interactions/bootstrap.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "st cs-clinical-trial",
  "content": "<h1 class=\"st-head\">One resample is one draw — not a confidence interval</h1><p class=\"st-dek\">Seeded, so every reset returns the same sequence.</p><div class=\"widget\" data-interactive=\"\" id=\"interaction-bootstrap-widget\"><div class=\"w-plot\"></div><div class=\"w-controls\"></div><output aria-live=\"polite\" class=\"w-status\"></output></div><p class=\"st-source\" data-region=\"source\"><span>Synthetic example · runs locally, no network</span><span>Interaction · Seeded resampling</span></p>",
  "widgets": [
    {
      "id": "interaction-bootstrap-widget",
      "kind": "bootstrap",
      "initial": {
        "seed": 1,
        "n": 12
      }
    }
  ]
};
