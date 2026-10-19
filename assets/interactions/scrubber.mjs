// Interaction study · Time scrubber. The widget (assets/runtime/widgets.js) computes from its data;
// replace config.data / config.initial and the headline for your subject. Keep reset, keyboard and static export.
export default {
  study: true,
  "id": "interaction-scrubber",
  "title": "Step through all 28 observations — no smoothing, no gaps filled",
  "notes": "Purpose: Move through real points in a fixed synthetic series.\nModify: Replace toy content and data; keep controls, state, plot and final summary synchronized. Restyle the complete slide, not just the control panel.\nInvariant: No required hover-only content. Keyboard alternative, reset, local scope, no network, and useful static export are required.\nStatic: Current selected state plus an explicit caption; video uses a selected poster. For an argument, choose a meaningful state or expand multiple states to slides.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/interactions/scrubber.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "st cs-terminal-dark",
  "content": "<h1 class=\"st-head\">Step through all 28 observations — no smoothing, no gaps filled</h1><p class=\"st-dek\">A cursor moves over the recorded points of one series.</p><div class=\"widget\" data-interactive=\"\" id=\"interaction-scrubber-widget\"><div class=\"w-plot\"></div><div class=\"w-controls\"></div><output aria-live=\"polite\" class=\"w-status\"></output></div><p class=\"st-source\" data-region=\"source\"><span>Synthetic example · runs locally, no network</span><span>Interaction · Time scrubber</span></p>",
  "widgets": [
    {
      "id": "interaction-scrubber-widget",
      "kind": "scrubber",
      "initial": {
        "time": 0
      }
    }
  ]
};
