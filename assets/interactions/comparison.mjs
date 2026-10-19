// Interaction study · Image comparison. The widget (assets/runtime/widgets.js) computes from its data;
// replace config.data / config.initial and the headline for your subject. Keep reset, keyboard and static export.
export default {
  study: true,
  "id": "interaction-comparison",
  "title": "Grayscale is a declared display change, not new evidence",
  "notes": "Purpose: Compare registered original and declared grayscale views.\nModify: Replace toy content and data; keep controls, state, plot and final summary synchronized. Restyle the complete slide, not just the control panel.\nInvariant: No required hover-only content. Keyboard alternative, reset, local scope, no network, and useful static export are required.\nStatic: Current selected state plus an explicit caption; video uses a selected poster. For an argument, choose a meaningful state or expand multiple states to slides.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/interactions/comparison.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "st cs-culture-gallery",
  "content": "<h1 class=\"st-head\">Grayscale is a declared display change, not new evidence</h1><p class=\"st-dek\">One registered photograph, two renderings.</p><div class=\"widget\" data-interactive=\"\" id=\"interaction-comparison-widget\"><div class=\"w-plot\"></div><div class=\"w-controls\"></div><output aria-live=\"polite\" class=\"w-status\"></output></div><p class=\"st-source\" data-region=\"source\"><span>Synthetic example · runs locally, no network</span><span>Interaction · Image comparison</span></p>",
  "widgets": [
    {
      "id": "interaction-comparison-widget",
      "kind": "comparison",
      "initial": {
        "split": 50
      }
    }
  ]
};
