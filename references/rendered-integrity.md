# Check what was actually painted

Read this for final HTML QA, failed CSS, unreadable text, missing marks or cropped
subjects. These are bounded diagnostics, not a replacement for viewing the deck.

## Checks versus approval

`craft.mjs` rejects unclosed CSS blocks, strings and comments before building. `qa.py`
applies the same preflight to loaded styles, including older HTML. It supports valid
CSS nesting; it is not a complete grammar checker. A balanced stylesheet can still
contain a misspelled property, wrong selector or unintended cascade. Check the actual
computed layout of the hardest page before extending it to the whole deck.

The QA report adds `cssIntegrity`, `renderedIntegrity` per state, and `localAssets`
fingerprints. Read **issues, warnings and unmeasured** separately:

| Observation | Treatment |
|---|---|
| Incomplete CSS structure | Blocks build/QA; inspect the reported opener/line |
| Severe solid-color text contrast below 1.5:1 | Blocks QA; fix unreadable essentials |
| Lower-than-reference ordinary/large text contrast | Warning; inspect size and viewing conditions |
| Images, gradients, SVG text, effects or unresolved backdrop | Contrast unmeasured; inspect actual pixels |
| An unpainted `.bar` without a semantic annotation | Warning; it could be a layout wrapper |
| Declared mark has nonzero geometry but no detected paint | Blocks QA; labels alone do not draw the value |
| Substantial `object-fit:cover` crop | Warning, not a prohibition on artistic crops |
| Declared essential focal region lies outside the crop | Blocks QA within supported crop geometry |
| Text overlaps a different hit-tested element | Stacking warning; inspect the actual line |

1.5 is a severe-defect triage threshold, **not** an accessibility threshold. The
4.5/3 reference ratios follow [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum).
This checker cannot establish WCAG conformance: it does not sample every painted
pixel, assistive route, compositing case, browser, language or viewing condition.
Unmeasured is not a pass. Moderate contrast warnings can still identify unreadable text.

## Small, optional assertions on fragile elements

Use these when they express a real invariant; do not annotate every element or add
controls just to exercise a feature. They work on authored HTML and are invisible
to the audience. Tests compare the current rendered state, not source intentions.

```html
<div data-qa-style='{"display":"grid"}' class="results-grid">...</div>
<div data-qa-mark="bar" data-qa-value="48" style="height:48%;background:#285e78">...</div>
<img alt="The complete apparatus" src="{{asset:media/apparatus.jpg}}"
     data-qa-focus="[0.12,0.05,0.63,0.40]" style="object-fit:cover;object-position:50% 0%">
```

`data-qa-style`: nonempty object of CSS property names and **computed** string values,
such as `display:grid`. Use stable properties, not an untested list copied from CSS.
`data-qa-mark`: asserts that this is a data mark, not a transparent label wrapper.
Zero values may legitimately have zero area; do not inflate them to satisfy a detector.

`data-qa-focus`: the essential subject rectangle `[x,y,width,height]` in normalized
original-image coordinates. Select it by inspecting the original, not by guessing
from the cropped preview. The crop check handles contain/cover and percentage
object-position. Complex transforms, ancestor clipping and other positions are
explicitly unmeasured. It does not recognize a train, person or scale bar by itself.
For images without a focal annotation, manually compare the original and final crop.

## Meaningful controls need meaningful tests

`qa.py --states all` covers declared slide builds and static final states.
`qa-navigation.py` exercises presentation navigation. Neither enumerates arbitrary
custom controls nor establishes their scientific correctness. For discrete controls,
check each choice's actual claim, formula, marks and labels; for ranges, use endpoints,
relevant thresholds, zero/missing cases and a reverse selection. Use independently
derived expected outputs. Keep key screenshots or a compact state/result ledger.

## The final artifact is the QA input

```sh
python "$SKILL_DIR/scripts/qa.py" presentation/audience.html --out presentation/.studio-review/final --states all --check
python "$SKILL_DIR/scripts/verify-review.py" presentation/audience.html --report presentation/.studio-review/final/report.json
```

Build/strip notes **before** this check. `verify-review.py` is read-only and fails for
changed HTML, changed/missing recorded local assets, failed QA or missing final states.
It leaves `deliveryApproved:false` even on success; the status is
`qa-current-review-required`. It verifies consistency of the supplied evidence, not
its authenticity or the truth of a claimed manual review. Old reports do not cover
new diagnostics or fingerprint linked files. Fonts/OS/browser may also change without
changing HTML. Recheck in the actual delivery environment when those differences matter.

After a content/CSS/asset repair, rerun affected controls and full final-page QA.
If image viewing is unavailable, say "HTML generated; visual review pending", keep
the review HTML, and request an available visual reviewer instead of certifying beauty.
