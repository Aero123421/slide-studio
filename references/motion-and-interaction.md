# Motion and Interaction

Choreography and animation, interactive explanation, then media/3D boundaries.

## Choreography, not a list of entrance effects

The 64 motion studies are source mechanisms: identity-preserving movement, reveal,
reflow, registered comparisons, traces, uncertainty, re-scaling, layers, masks and
annotation. Use their logic, not their colors or generic labels. Invent combinations
when the explanation needs them; do not play every animation just because it exists.

### Define the temporal argument

Write what is known before and after each step. State what moves, what remains
fixed, what changes value, and why. Keep a stable object identity when showing a
transformation. An arrow animation must not turn a correlation into a causal claim.
Introduce uncertainty with the estimate, or before a claim can be misunderstood.
Do not hide a qualification behind a later click after making an unqualified claim.

A useful order might be baseline → observations → paired comparison → interval →
interpretation. Another page may need no build at all. Avoid mandatory “one bullet
per click”, gratuitous letter-by-letter text, repeated zooming, or unattended loops.

### Deterministic state API

```html
<g data-states='{"0":{"opacity":0,"transform":"translateY(20px)"},
                 "1":{"opacity":1,"transform":"translateY(0px)"}}'
   data-duration="480">
  <!-- Coupled geometry and label, with stable identity -->
</g>
```

`data-states` maps nonnegative integer steps to CSS property maps and requires a
state 0. Missing properties inherit cumulatively from earlier states. The player
commits target styles synchronously, then treats animation as a removable layer.
Direct jumps, reverse navigation and exports use the same target state. Do not use
incremental `x += 20` operations to represent presentation progress.

`data-step="1"` reveals content at that step. `data-until="2"` limits its visibility.
Hidden content must not remain interactive or exposed as active text. For a moving
label, transform its group with the subject rather than using unrelated animations.
Put any custom behavior in `deck.script`, with a bounded local lifecycle.

### Motion character

Use short transitions for state feedback and longer explanatory movement only when
the audience needs to track it. Rough initial ranges: 120–220 ms feedback,
300–600 ms simple movement, 600–1000 ms complex explanatory transformations. These
are design starting points, not an accessibility guarantee. Avoid overshoot for
quantitative scales when it suggests false values.

An easing curve describes velocity, not meaning. Use a coherent family; avoid
unrelated spring behavior on every object. Stagger by logical order, not arbitrary
DOM order. A delay should make a relation easier to read, not merely extend duration.

### Reduced motion and static media

Honor `prefers-reduced-motion`. Preserve the information while omitting nonessential
movement. Do not remove evidence or skip states simply because motion is reduced.
The player does this for declared states; custom loops must do it themselves.

Automatic movement needs an appropriate pause/stop mechanism. Nonessential motion
triggered by interaction should be suppressible. Avoid flashing content. Consult the
[W3C references](working-agreements.md#primary-references); the runtime is not a WCAG certification.

For export choose: final informative state, selected frozen state, or separate pages
for meaningful intermediate states. A final frame containing only “Done” is not a
useful exported explanation. PDF and the bundled PPTX exporters do not preserve CSS
animation. Plan a static narrative rather than promising conversion fidelity.

### Test the behavior

Test zero, every meaningful intermediate state, final, reverse, direct jump, reset,
revisit, overview, reduced motion, tab hide/return and export. Confirm visible state,
not just class changes. Test custom durations at slow playback in the browser when
judging timing; a still frame cannot certify animation quality.

### Input equivalence is part of the animation contract

A successful mouse transition does not validate the keyboard path. Click Next, leave
its button focused, then press Right / PageDown. Repeat with Previous and Left.
Press Space / Enter both on the page and on a focused native button: one gesture
must cause one transition. Inputs, sliders, editors, media and local widgets retain
their own keys. IME composition and held navigation keys must not skip builds.

```sh
python "$SKILL_DIR/scripts/qa-navigation.py" deck.html --out navigation.json
```

This compares six click/key routes for each forward transition against the same
target state. It does not inspect every possible custom effect. Inspect a real
intermediate frame, interruption, reverse and replay as well. Use `tests/navigation.py`
when editing the player itself. Do not add a second global keyboard listener.

Small entry presets are chosen with `data-motion` next to `data-step`
(`<p data-step="1" data-motion="lift">`): `reveal`, `lift`, `slide`, `wipe`, `trace`,
`focus` and `settle`. An unknown name raises a player warning, which fails QA.
`data-easing` overrides the default curve. They are optional, ignored on elements with
`data-states`; use authored `data-states` for substantive transformations. The same element should not have competing owners of `transform`.
`onEnter` runs when entering a slide, not at every build. Use the widget update hook
or `studio:state` for intra-slide changes. Animation is a removable layer over an
already committed target; cancelled callbacks must not restore stale styles.

## Interactive explanation without building unnecessary applications

Use interaction when changing a variable, inspecting a component or exploring a
condition teaches something that a static sequence cannot communicate as well.
A slide is not automatically improved by controls. Live talks need a predictable
path and a recovery state; self-guided material can allow more exploration.

### The interaction contract

For each widget record: question, permitted input domain, state representation,
derived values, visible feedback, keyboard route, reset, error/empty/loading state,
revisit policy, reduced-motion behavior, static export and source provenance.

Input must affect the actual model and visible output. No fake media progress,
decorative sliders, canned “simulation results” represented as computed results,
or hidden external service dependency. Synthetic demonstrations must say so.

### Built-in teaching mechanisms

The 24 examples cover parameter and threshold exploration; time scrubbing; image
comparison; component and layer inspection; optional detail; sortable tables;
linked selection; histogram bins; seeded resampling; toy ablation; quizzes; decisions;
reachability; matrix lookup; magnification; video/audio; mesh orbit/explode/cut/import;
and annotation. Each has inspectable local code and reset/snapshot hooks.

These are **teaching examples**, not domain engines. Replace their data and equations
when using them in a real deck. Widget labels are English by default. Localize both
controls and output strings for the requested language. The UI language of the
player does not do that automatically.

### Runtime lifecycle

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

### Keyboard, touch and focus

Mark the widget root `data-interactive`. Global slide navigation will not consume
keys from it. Use actual controls with labels. Sliders expose min/max/value and a
readable output. Drag operations need a keyboard alternative and bounded coordinates.
Pointer capture needs cancellation. Tabs and dialogs require correct focus behavior;
using a select for optional detail is often more robust than a half-implemented tab bar.

Do not make essential content hover-only. Reserve enough control space for long
localized labels. Give updated results concise accessible text without announcing
every animation frame. A large drawing canvas needs a useful summary or alternative,
not the generic label “image”.

### Revisit, reset and export

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

### Project-owned data and media

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

## Media and 3D: practical boundaries

### Video and audio

Use real local media, a descriptive title, selected poster, controls, captions or
transcript, and an explicit failure fallback. Never create a play button that toggles
an icon without playing media. Do not assume browser autoplay permission. Handle
the promise returned by `play()` and keep native controls available. Pause when the
slide leaves, the document is hidden, or export begins. Do not resume sound without
appropriate user action.

Seek after metadata is available; clamp to actual duration. Test loaded metadata,
play, pause, seek, time/frame change, captions and leave/revisit. An image called
“video poster” is not proof of playback. For large files, package a local asset folder
with relative URLs and use a local HTTP server where file-origin restrictions apply.
Document codecs and fallback formats based on the actual target browser.

Bundled media is a short synthetic signal clip with captions and a low-amplitude
synthetic tone. It is not footage of a real experiment. Its purpose is to exercise
playback behavior and static fallback.

### Mesh viewer included in this release

`assets/runtime/mesh.js` parses local ASCII/binary STL and simple OBJ geometry. It
retains OBJ group names, validates finite coordinates and triangle references, and
bounds input to 8 MiB and 40,000 triangles. The renderer is a lightweight Canvas
painter with group colors. It does not implement full material/texture fidelity,
robust occlusion for all geometry, NURBS, constraints, tolerances or CAD editing.

Orbit uses yaw/pitch controls and pointer/keyboard alternatives. Explode separates
named groups while preserving source geometry. Cutaway clips visible triangles:
it is **not a capped, watertight CAD cross section**. Imported units are unknown unless
provided. Do not label imported geometry “millimetres” by inference. A mechanical
illustration is not a certified engineering drawing.

STL/OBJ does not preserve complete assembly semantics, design history or feature
parameters. Do not claim STEP/native CAD compatibility from mesh import. Convert
CAD in an appropriate tool and retain the original plus a conversion record.

### Production GLB/glTF path (optional adapter, not bundled dependency)

For material-aware interactive 3D, an agent can integrate an approved pinned local
`<model-viewer>` or other renderer after checking current primary documentation.
GLB is a presentation geometry format, not a replacement for the CAD source.
A minimal shape is:

```html
<!-- Load an approved, pinned local model-viewer bundle separately. -->
<model-viewer src="assets/assembly.glb" poster="assets/assembly-poster.webp"
  camera-controls touch-action="pan-y" alt="Assembly with labeled components">
</model-viewer>
```

This snippet is not operational without that dependency. Configure decoder paths
locally when compressed textures/meshes need them; a nominally local model can still
trigger CDN fetches. Respect CORS, licensing, offline operation and browser support.
Use loading/error fallback, keyboard behavior, display budgets and reduced motion.
Do not assume WebGL is available in every viewer. The poster and useful explanatory
text must stand alone when 3D cannot initialize.

### Conversion record

Record original format and units, orientation, tessellation settings, part/group
mapping, simplified triangle count, materials omitted, renderer version and selected
export camera. Preserve scale bars and annotations. Show key views for PDF/PPTX;
do not silently export a blank canvas or controls alone.

External iframes and web demos require explicit permission and a network disclosure.
Treat them as untrusted content, use a sandbox with minimum permissions and a static
fallback. A public OSS skill should not embed accounts, tokens, analytics or private
URLs. See [working agreements](working-agreements.md#trust-boundaries).
