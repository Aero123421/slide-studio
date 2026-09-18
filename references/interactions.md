# Interactive explanation without building unnecessary applications

Use interaction when changing a variable, inspecting a component or exploring a
condition teaches something that a static sequence cannot communicate as well.
A slide is not automatically improved by controls. Live talks need a predictable
path and a recovery state; self-guided material can allow more exploration.

## The interaction contract

For each widget record: question, permitted input domain, state representation,
derived values, visible feedback, keyboard route, reset, error/empty/loading state,
revisit policy, reduced-motion behavior, static export and source provenance.

Input must affect the actual model and visible output. No fake media progress,
decorative sliders, canned “simulation results” represented as computed results,
or hidden external service dependency. Synthetic demonstrations must say so.

## Built-in teaching mechanisms

The 24 examples cover parameter and threshold exploration; time scrubbing; image
comparison; component and layer inspection; optional detail; sortable tables;
linked selection; histogram bins; seeded resampling; toy ablation; quizzes; decisions;
reachability; matrix lookup; magnification; video/audio; mesh orbit/explode/cut/import;
and annotation. Each has inspectable local code and reset/snapshot hooks.

These are **teaching examples**, not domain engines. Replace their data and equations
when using them in a real deck. Widget labels are English by default. Localize both
controls and output strings for the requested language. The UI language of the
player does not do that automatically.

## Runtime lifecycle

```js
const root = document.getElementById('experiment-widget');
const abort = new AbortController();
let state = {threshold: 0.5};
function render() { /* derive values, draw, update accessible text */ }
const unregister = SlideStudio.register(root.id, {
  snapshot: () => structuredClone(state),
  restore: next => { state = structuredClone(next); render(); },
  reset: () => { state = {threshold: 0.5}; render(); },
  onEnter: context => { /* render; do not autoplay audio */ },
  onStep: context => { /* deterministic declared state, if used */ },
  onLeave: () => { /* pause media, stop RAF/timers, release interaction */ },
  onExport: context => { /* stable, meaningful representation */ },
  dispose: () => { abort.abort(); /* release observers and resources */ }
});
```

Make deep copies of nested state. Otherwise drawing into `paths` may change the
initial state and make Reset ineffective. Own listeners with an AbortController.
Scope queries and CSS to the widget root. Avoid global handlers except documented
presentation lifecycle hooks. Cancel stale asynchronous loads; reject an older result
that arrives after a newer selection. Revoke object URLs and dispose heavy renderers.

## Keyboard, touch and focus

Mark the widget root `data-interactive`. Global slide navigation will not consume
keys from it. Use actual controls with labels. Sliders expose min/max/value and a
readable output. Drag operations need a keyboard alternative and bounded coordinates.
Pointer capture needs cancellation. Tabs and dialogs require correct focus behavior;
using a select for optional detail is often more robust than a half-implemented tab bar.

Do not make essential content hover-only. Reserve enough control space for long
localized labels. Give updated results concise accessible text without announcing
every animation frame. A large drawing canvas needs a useful summary or alternative,
not the generic label “image”.

## Revisit, reset and export

Choose whether revisit preserves the audience's selection. Reset must restore the
known baseline, not create another random trial. Randomized teaching mechanisms use
an explicit seed; record it when values matter. A printing snapshot should restore
state after print. A static export should show selected values and what they mean,
not just disabled controls.

Check all discrete choices for **semantic** correctness, not merely a changed DOM.
For example, choosing the reverse relation must reverse the operands and resulting
labels together; highlighting another part must identify that actual part. For a
continuous parameter, inspect endpoints and points where rank, sign or behavior changes.
Use independently calculated expectations for quantities. A correct label can still
sit above stale geometry; a changed picture need not change its surrounding text.
`qa.py --states all` tests slide builds, not all custom widget choices. Record which
choices were exercised and leave the rest explicitly untested.

A controls-only screenshot is not an adequate fallback for an experiment. Show an
informative chart, selected frame, key 3D view, or expanded explanation. The exported
artifact should stand alone without the presenter being able to click.

## Project-owned data and media

The built-in study configuration may carry `data.values` (finite normalized scores
in [0,1]), matching binary `data.labels`, or `data.series` with finite x/y and stable
IDs. These are study-scale contracts, not a universal plotting library. Change the
axes and scaling code deliberately for other units. Do not relabel normalized values
as measurements in a different unit. Threshold/histogram/resampling use the local
value array; scrubber/brushing use the local series. Other studies state their own
toy formulas and must be adapted in authored code for real data.

`config.assets` can override photo/video/poster/captions/audio using local asset
placeholders. They are embedded at build time like content assets. `obj` can hold
trusted local OBJ text read by the source module. No need to edit the installed
skill when deriving a project. For behavior outside a study's contract, implement
a project-owned component via `SlideStudio.register`, rather than pretending a
fixed example computes the desired model.

```js
widgets: [{
  id: 'my-threshold-widget', kind: 'threshold', initial: {threshold: 0.5},
  data: {values: [0.1, 0.3, 0.7, 0.9], labels: [0, 1, 0, 1]}
}]
```

This changes the actual data and counts, not just visible labels. Keep the visible
caption and narrative scope synchronized with the new dataset.
