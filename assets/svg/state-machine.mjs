// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "state-machine",
  "title": "State transitions",
  "notes": "Purpose: Describe valid state changes\nModify: Rewrite labels, recompute geometry from source data, adapt framing and orientation.\nInvariant: Label transition events/guards. Node positions may change, allowed transitions may not.\nStatic: Already static; preserve semantic labels and readable strokes.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/svg/state-machine.svg"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">State transitions</h1><p class=\"g-purpose\">Describe valid state changes</p><div class=\"g-demo\"><svg aria-labelledby=\"g-state-machine-state-machine-title g-state-machine-state-machine-desc\" role=\"img\" viewbox=\"0 0 800 440\" xmlns=\"http://www.w3.org/2000/svg\"><title id=\"g-state-machine-state-machine-title\">State transitions</title><desc id=\"g-state-machine-state-machine-desc\">Describe valid state changes. Original schematic. Values are illustrative, not measured.</desc><g data-part=\"drawing\"><rect fill=\"#ffffff\" height=\"56\" rx=\"6\" stroke=\"#17252d\" stroke-width=\"2\" width=\"136\" x=\"80\" y=\"120\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"middle\" x=\"148.0\" y=\"154.0\">Idle</text><rect fill=\"#ffffff\" height=\"56\" rx=\"6\" stroke=\"#17252d\" stroke-width=\"2\" width=\"136\" x=\"330\" y=\"120\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"middle\" x=\"398.0\" y=\"154.0\">Active</text><rect fill=\"#ffffff\" height=\"56\" rx=\"6\" stroke=\"#17252d\" stroke-width=\"2\" width=\"136\" x=\"580\" y=\"120\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"middle\" x=\"648.0\" y=\"154.0\">Done</text><line stroke=\"#28617b\" stroke-width=\"3\" x1=\"216\" x2=\"323\" y1=\"148\" y2=\"148\"></line><path d=\"M314 142L323 148L314 154\" fill=\"none\" stroke=\"#28617b\" stroke-width=\"2\"></path><line stroke=\"#28617b\" stroke-width=\"3\" x1=\"466\" x2=\"573\" y1=\"148\" y2=\"148\"></line><path d=\"M564 142L573 148L564 154\" fill=\"none\" stroke=\"#28617b\" stroke-width=\"2\"></path><rect fill=\"#ffffff\" height=\"56\" rx=\"6\" stroke=\"#17252d\" stroke-width=\"2\" width=\"136\" x=\"330\" y=\"290\"></rect><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"middle\" x=\"398.0\" y=\"324.0\">Error</text><path d=\"M398 176V282\" fill=\"none\" stroke=\"#ae4f31\" stroke-width=\"3\"></path><path d=\"M330 318H148V184\" fill=\"none\" stroke=\"#ae4f31\" stroke-width=\"3\"></path><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"18\" text-anchor=\"start\" x=\"465\" y=\"270\">failure</text></g></svg>\n</div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/svg/state-machine.svg</code></div>"
};
