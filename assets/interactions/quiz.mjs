// Interaction study · Local knowledge check. The widget (assets/runtime/widgets.js) computes from its data;
// replace config.data / config.initial and the headline for your subject. Keep reset, keyboard and static export.
export default {
  study: true,
  "id": "interaction-quiz",
  "title": "What should accompany an estimate?",
  "notes": "Purpose: Give immediate explanatory feedback without collecting answers.\nModify: Replace toy content and data; keep controls, state, plot and final summary synchronized. Restyle the complete slide, not just the control panel.\nInvariant: No required hover-only content. Keyboard alternative, reset, local scope, no network, and useful static export are required.\nStatic: Current selected state plus an explicit caption; video uses a selected poster. For an argument, choose a meaningful state or expand multiple states to slides.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/interactions/quiz.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "st cs-youth-pop",
  "content": "<h1 class=\"st-head st-one\">What should accompany an estimate?</h1><p class=\"st-dek\">Answers stay on this device; nothing is collected.</p><div class=\"widget\" data-interactive=\"\" id=\"interaction-quiz-widget\"><div class=\"w-plot\"></div><div class=\"w-controls\"></div><output aria-live=\"polite\" class=\"w-status\"></output></div><p class=\"st-source\" data-region=\"source\"><span>Synthetic example · runs locally, no network</span><span>Interaction · Local knowledge check</span></p>",
  "widgets": [
    {
      "id": "interaction-quiz-widget",
      "kind": "quiz",
      "initial": {
        "choice": "none",
        "checked": false
      }
    }
  ]
};
