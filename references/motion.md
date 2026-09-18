# Choreography, not a list of entrance effects

The 64 motion studies are source mechanisms: identity-preserving movement, reveal,
reflow, registered comparisons, traces, uncertainty, re-scaling, layers, masks and
annotation. Use their logic, not their colors or generic labels. Invent combinations
when the explanation needs them; do not play every animation just because it exists.

## Define the temporal argument

Write what is known before and after each step. State what moves, what remains
fixed, what changes value, and why. Keep a stable object identity when showing a
transformation. An arrow animation must not turn a correlation into a causal claim.
Introduce uncertainty with the estimate, or before a claim can be misunderstood.
Do not hide a qualification behind a later click after making an unqualified claim.

A useful order might be baseline → observations → paired comparison → interval →
interpretation. Another page may need no build at all. Avoid mandatory “one bullet
per click”, gratuitous letter-by-letter text, repeated zooming, or unattended loops.

## Deterministic state API

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

## Motion character

Use short transitions for state feedback and longer explanatory movement only when
the audience needs to track it. Rough initial ranges: 120–220 ms feedback,
300–600 ms simple movement, 600–1000 ms complex explanatory transformations. These
are design starting points, not an accessibility guarantee. Avoid overshoot for
quantitative scales when it suggests false values.

An easing curve describes velocity, not meaning. Use a coherent family; avoid
unrelated spring behavior on every object. Stagger by logical order, not arbitrary
DOM order. A delay should make a relation easier to read, not merely extend duration.

## Reduced motion and static media

Honor `prefers-reduced-motion`. Preserve the information while omitting nonessential
movement. Do not remove evidence or skip states simply because motion is reduced.
The player does this for declared states; custom loops must do it themselves.

Automatic movement needs an appropriate pause/stop mechanism. Nonessential motion
triggered by interaction should be suppressible. Avoid flashing content. Consult the
W3C sources in `sources.md`; the runtime is not a WCAG certification.

For export choose: final informative state, selected frozen state, or separate pages
for meaningful intermediate states. A final frame containing only “Done” is not a
useful exported explanation. PDF and the bundled PPTX exporters do not preserve CSS
animation. Plan a static narrative rather than promising conversion fidelity.

## Test the behavior

Test zero, every meaningful intermediate state, final, reverse, direct jump, reset,
revisit, overview, reduced motion, tab hide/return and export. Confirm visible state,
not just class changes. Test custom durations at slow playback in the browser when
judging timing; a still frame cannot certify animation quality.

## Input equivalence is part of the animation contract

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

The small entry presets on `data-step` are `reveal`, `lift`, `slide`, `wipe`, `trace`,
`focus` and `settle`. They are optional; use authored `data-states` for substantive
transformations. The same element should not have competing owners of `transform`.
`onEnter` runs when entering a slide, not at every build. Use the widget update hook
or `studio:state` for intra-slide changes. Animation is a removable layer over an
already committed target; cancelled callbacks must not restore stale styles.
