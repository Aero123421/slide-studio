// Original editable study. Read notes for purpose, modifications, and invariants.
// Asset placeholders are embedded by scripts/craft-core.mjs. Change content and geometry freely.
export default {
  study: true,
  "id": "paired-samples",
  "title": "Paired samples",
  "notes": "Purpose: Keep the same participant identity across measurements\nModify: Rewrite labels, recompute geometry from source data, adapt framing and orientation.\nInvariant: Each connecting line denotes an actual pair, not a rank match.\nStatic: Already static; preserve semantic labels and readable strokes.",
  "sources": [
    {
      "type": "original-example",
      "file": "assets/svg/paired-samples.svg"
    }
  ],
  "exportPolicy": "final",
  "className": "",
  "content": "<h1 class=\"g-title\">Paired samples</h1><p class=\"g-purpose\">Keep the same participant identity across measurements</p><div class=\"g-demo\"><svg aria-labelledby=\"g-paired-samples-paired-samples-title g-paired-samples-paired-samples-desc\" role=\"img\" viewbox=\"0 0 800 440\" xmlns=\"http://www.w3.org/2000/svg\"><title id=\"g-paired-samples-paired-samples-title\">Paired samples</title><desc id=\"g-paired-samples-paired-samples-desc\">Keep the same participant identity across measurements. Original schematic. Values are illustrative, not measured.</desc><g data-part=\"drawing\"><circle cx=\"240\" cy=\"110\" fill=\"#28617b\" r=\"16\"></circle><circle cx=\"560\" cy=\"127\" fill=\"#ae4f31\" r=\"16\"></circle><line stroke=\"#718594\" stroke-width=\"2\" x1=\"260\" x2=\"540\" y1=\"110\" y2=\"127\"></line><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"17\" text-anchor=\"end\" x=\"210\" y=\"117\">1</text><circle cx=\"240\" cy=\"175\" fill=\"#28617b\" r=\"16\"></circle><circle cx=\"560\" cy=\"158\" fill=\"#ae4f31\" r=\"16\"></circle><line stroke=\"#718594\" stroke-width=\"2\" x1=\"260\" x2=\"540\" y1=\"175\" y2=\"158\"></line><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"17\" text-anchor=\"end\" x=\"210\" y=\"182\">2</text><circle cx=\"240\" cy=\"240\" fill=\"#28617b\" r=\"16\"></circle><circle cx=\"560\" cy=\"257\" fill=\"#ae4f31\" r=\"16\"></circle><line stroke=\"#718594\" stroke-width=\"2\" x1=\"260\" x2=\"540\" y1=\"240\" y2=\"257\"></line><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"17\" text-anchor=\"end\" x=\"210\" y=\"247\">3</text><circle cx=\"240\" cy=\"305\" fill=\"#28617b\" r=\"16\"></circle><circle cx=\"560\" cy=\"288\" fill=\"#ae4f31\" r=\"16\"></circle><line stroke=\"#718594\" stroke-width=\"2\" x1=\"260\" x2=\"540\" y1=\"305\" y2=\"288\"></line><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"17\" text-anchor=\"end\" x=\"210\" y=\"312\">4</text><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"22\" text-anchor=\"middle\" x=\"240\" y=\"65\">Before</text><text fill=\"#17252d\" font-family=\"Arial, sans-serif\" font-size=\"22\" text-anchor=\"middle\" x=\"560\" y=\"65\">After</text></g></svg>\n</div><div class=\"g-footer\">Original instructional study · schematic / synthetic content <code>assets/svg/paired-samples.svg</code></div>"
};
