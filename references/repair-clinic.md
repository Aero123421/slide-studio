# Repair the explanation, not the symptoms

Use this clinic when an otherwise plausible slide feels wrong. Each repair includes
a diagnostic, a structural change and a counter-check. Choose the relevant case; do
not impose every repair on every slide. Examples are synthetic, not measured claims.

## 1. Production language leaks into a presentation

**Seen:** a control caption says “switch for the conference presentation.”
**Interpretation:** the phrase addresses the operator, not the audience.
**Repair:** label the visible states “Condition A / Condition B”; move the timing and
backup action into `notes` or `runbook.md`. Keep current condition and units visible.
**Check:** render after scripts initialize; build a public copy with `--strip-notes`.
A teaching slide quoting that exact bad label may use a narrow, documented waiver.

## 2. A headline sounds impressive but has no finding

**Before:** “Unlocking a new dimension of robust performance.”
**After, when supported:** “The error increase is smaller under condition B.”
**With incomplete evidence:** “We test whether condition B reduces the error increase.”
The better sentence is not automatically shorter; it identifies the comparison and
its certainty. Put the actual method, sample and uncertainty beside the evidence.
Do not insert invented measurements to make an empty claim seem specific.

## 3. Japanese noun stacking hides the actor and condition

**Before:** “処理性能向上実現に向けた最適化施策検討。”
**After:** “処理時間を短くするため、待ち時間が長い工程から見直す。”
The rewrite is valid only if that is the actual plan. Distinguish an action already
taken from a proposed action. Read the resulting heading aloud and in its rendered
line breaks; do not use arbitrary line breaks to disguise an incoherent sentence.

## 4. Headline, subtitle and annotation repeat one sentence

List what each text block adds. Keep the claim in the heading, evidence/conditions
in the figure, and interpretation in the annotation. Delete the duplicate block
before resizing. Do not remove the confidence interval or denominator as “detail.”
**Check:** could a reader answer “compared with what?” without hearing the speaker?

## 5. A tiny diagram floats in a wide empty region

Compare SVG `viewBox` with `getBBox()` and the CSS container. First remove accidental
source padding or redraw at the intended ratio. Reserve readable labels, then enlarge
the actual drawing, not only the wrapper. A 1:1 image in a 3:1 cell cannot fill both
axes without distortion; recompose instead. Never stretch quantitative geometry.
**Check:** full diagram visible, label sizes appropriate, annotations still attached.

## 6. Several small charts are unreadable

Do not scale a complete page-size plot down three times. Redraw small views with
shared axes, fewer ticks and direct labels; reserve a shared legend only when useful.
Remove redundant titles before essential units. Three views are not a requirement:
two on one page and a second page may better preserve comparisons.
**Check:** same scales mean the same quantity; less text has not changed the claim.

## 7. An annotation is placed in the nearest empty corner

Its distance from the target is now larger than its distance from another object.
Use a short attached rail, direct label, or a line with an unambiguous endpoint.
Measure the annotation height before routing. Move the target and label as one
group during animation. **Check:** the relationship survives every state and locale.

## 8. All important objects have been pushed to the perimeter

Reallocate a primary region and a supporting rail. Move related elements together
and align visible bounds. Keep a deliberate gap for the reading transition. A
quiet central interval is legitimate if it represents a comparison or pause; do not
fill it automatically. **Check:** explain the gap’s role without invoking “modern.”

## 9. A quiet slide looks good, but its data comparison is missing

Minimalism cannot excuse missing evidence. Restore the necessary pair, baseline or
uncertainty, and move supporting prose to a second page if needed. Conversely, a
closing statement need not inherit a chart-sized empty box. Match the space to the
page’s actual job. **Check:** deleting an object must not delete a premise.

## 10. A chart is accurate but labels collide after motion

Budget the union of initial, intermediate and final extents. Move objects and labels
under the same state owner, reserve a rail, and inspect crossing trajectories.
Committing the final style before animation makes rapid input deterministic, but
does not make a bad trajectory clear. **Check:** click, focused-button key, reverse,
direct final, interruption and reduced motion all convey the same relationship.

## 11. A company template fits the sample but not real text

Preserve approved identity, not arbitrary sample text lengths. Test the actual long
heading, dense table, photo, quiet statement and target scripts. Change a flexible
content region before changing approved logo proportions or shrinking every font.
For a native fixed template, add a legitimate new layout instead of silently
flattening to images. **Check:** private reference text never enters the OSS kit.

## 12. A language variant feels translated rather than written

Keep the meaning and evidence stable, but re-author syntax for the target language.
Re-measure actual line breaks, family fallback, punctuation and reading direction.
Use logical CSS properties where appropriate; mathematical axes do not automatically
mirror with RTL text. Do not promise native fluency because geometry checks passed.

## A bounded local repair loop

Record the observed defect in one sentence. Name the element that owns it. Make the
smallest structural change that solves it. Re-render the affected page and neighboring
comparison pages; replay its meaningful states. Then inspect the deck rhythm.
If two local adjustments create new defects, change the composition rather than
accumulating exceptions. Close the repair only with actual rendered evidence.
