// Interaction study · Audio example. The widget (assets/runtime/widgets.js) computes from its data;
// replace config.data / config.initial and the headline for your subject. Keep reset, keyboard and static export.
export default {
  study: true,
  "id": "interaction-audio",
  "title": "Sound plays only when someone asks for it",
  "notes": "Purpose: Play a short local waveform deliberately; never start audio on slide entry.\nModify: Replace toy content and data; keep controls, state, plot and final summary synchronized. Restyle the complete slide, not just the control panel.\nInvariant: No required hover-only content. Keyboard alternative, reset, local scope, no network, and useful static export are required.\nStatic: Current selected state plus an explicit caption; video uses a selected poster. For an argument, choose a meaningful state or expand multiple states to slides.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/interactions/audio.mjs"
    }
  ],
  "exportPolicy": "final",
  "className": "st cs-luxury-noir",
  "content": "<h1 class=\"st-head st-one\">Sound plays only when someone asks for it</h1><p class=\"st-dek\">A two-second synthetic tone; never autoplayed.</p><div class=\"widget\" data-interactive=\"\" id=\"interaction-audio-widget\"><div class=\"w-plot\"></div><div class=\"w-controls\"></div><output aria-live=\"polite\" class=\"w-status\"></output></div><p class=\"st-source\" data-region=\"source\"><span>Synthetic example · runs locally, no network</span><span>Interaction · Audio example</span></p>",
  "widgets": [
    {
      "id": "interaction-audio-widget",
      "kind": "audio",
      "initial": {
        "time": 0
      }
    }
  ]
};
