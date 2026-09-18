# Repair guide

Read the part that matches the failure you see.

## Field repair cases — learn the operation, not the wording

The following are newly written synthetic fixtures. They are not a user's business records, a model leaderboard, or evidence that a new model run has already improved. The corresponding `gallery/repair-lab.html` is a workshop, not a deck to submit unchanged.

| Failure | Repair operation | What must remain |
|---|---|---|
| A change from 500 to 650 is called "+30 currency units" | Compute amount and relative change separately; bind title and chart to the same values | +150 amount; +30%, unit, period, source |
| Paired plot uses before−after, summary uses after−before | Choose one subtraction order and regenerate both | Outlier, missing pair count, correct sample SD |
| A line crosses a missing measurement without distinction | Break it or explicitly encode an analytically justified interpolation | Known observations; missing is not zero |
| Alternatives are arranged A → B → C | Draw conditional branches from the shared source | Conditions, endpoints, outcome exclusivity |
| A colored legend describes black marks | Bind series labels and mark fills to one encoding map | Readability without color alone |
| A sweeping title is qualified only in a small footnote | Put proposed/estimated/scope beside the claim itself | Conditions and useful specificity |
| A factual explanation becomes a slogan | Write the direct observation first; make a stylistic choice only after meaning works | Audience-appropriate voice; no invented contrast |
| Tiny text and three panels occupy the top half | Allocate real evidence/body area first; remove duplicate containers | Necessary detail, legible labels, purposeful negative space |
| A real comparison is split to meet a brevity quota | Keep a readable aligned table; move only separate optional discussion | Same units, periods, rows, missing/unknown entries |
| Every image sits in a tiny rounded card | Match frame/crop to the subject and its annotation | Evidence integrity, rights, actual focal point |
| A source word changes scripts unexpectedly | Fix or verify the source; then check the rendered font | Intentional names and multilingual quotations |
| A page includes "PDF keeps this view" | Show the selected condition; move export behavior into a runbook | Static meaning; visible assumptions |

### Worked copy choices

**Business explanation**

Weak: 「安さの正体が違う。選ぶのは、未来の使い方です。」

Better when the source supports it: 「初期費用はA案、3年間の総額はB案が低い。」

Then show the actual costs and excluded items. This is not an invitation to invent A/B advantages. Without comparable costs, say what information is still missing.

**Scientific result**

Weak: 「小さな差が、大きな可能性を開く。」

Better for a synthetic paired study: 「5試料中4試料で、条件Bの温度が低い。」

Do not replace it with "effective" or "significant" unless the analysis supports it. The natural title may be shorter if the plot already carries the count and scope.

**A visual essay**

A poetic opening is not automatically a defect. A later page should point to the actual image: "The shadow ends at this edge" is more useful than repeating "light reveals a new world" over every photograph. Use an annotation, not just an adjective.

**Public instruction**

Weak: "Unlock your smooth journey in three effortless steps."

Better: "Keep the ticket until you leave the final gate."

Directness serves the task. A brief friendly sentence can remain; avoid infantilizing adults or turning every instruction into a marketing promise.

### Transfer, not imitation

For a new subject, state the invariant, change the content/medium/geometry, and test the longest real label, an unfavorable value and the static state. Do not copy the sample's headline, palette, card count or fictional data. The benchmark tasks in `tests/transfer-evals.json` include dense, expressive and quiet cases so the skill cannot "pass" merely by making all output minimal and identical.

## Repair the explanation, not the symptoms

Use this clinic when an otherwise plausible slide feels wrong. Each repair includes a diagnostic, a structural change and a counter-check. Choose the relevant case; do not impose every repair on every slide. Examples are synthetic, not measured claims.

### 1. Production language leaks into a presentation

**Seen:** a control caption says “switch for the conference presentation.”
**Interpretation:** the phrase addresses the operator, not the audience.
**Repair:** label the visible states “Condition A / Condition B”; move the timing and backup action into `notes` or `runbook.md`. Keep current condition and units visible.
**Check:** render after scripts initialize; build a public copy with `--strip-notes`. A teaching slide quoting that exact bad label may use a narrow, documented waiver.

### 2. A headline sounds impressive but has no finding

**Before:** “Unlocking a new dimension of robust performance.”
**After, when supported:** “The error increase is smaller under condition B.”
**With incomplete evidence:** “We test whether condition B reduces the error increase.”
The better sentence is not automatically shorter; it identifies the comparison and its certainty. Put the actual method, sample and uncertainty beside the evidence. Do not insert invented measurements to make an empty claim seem specific.

### 3. Japanese noun stacking hides the actor and condition

**Before:** “処理性能向上実現に向けた最適化施策検討。”
**After:** “処理時間を短くするため、待ち時間が長い工程から見直す。”
The rewrite is valid only if that is the actual plan. Distinguish an action already taken from a proposed action. Read the resulting heading aloud and in its rendered line breaks; do not use arbitrary line breaks to disguise an incoherent sentence.

### 4. Headline, subtitle and annotation repeat one sentence

List what each text block adds. Keep the claim in the heading, evidence/conditions in the figure, and interpretation in the annotation. Delete the duplicate block before resizing. Do not remove the confidence interval or denominator as “detail.”
**Check:** could a reader answer “compared with what?” without hearing the speaker?

### 5. A tiny diagram floats in a wide empty region

Compare SVG `viewBox` with `getBBox()` and the CSS container. First remove accidental source padding or redraw at the intended ratio. Reserve readable labels, then enlarge the actual drawing, not only the wrapper. A 1:1 image in a 3:1 cell cannot fill both axes without distortion; recompose instead. Never stretch quantitative geometry.
**Check:** full diagram visible, label sizes appropriate, annotations still attached.

### 6. Several small charts are unreadable

Do not scale a complete page-size plot down three times. Redraw small views with shared axes, fewer ticks and direct labels; reserve a shared legend only when useful. Remove redundant titles before essential units. Three views are not a requirement: two on one page and a second page may better preserve comparisons.
**Check:** same scales mean the same quantity; less text has not changed the claim.

### 7. An annotation is placed in the nearest empty corner

Its distance from the target is now larger than its distance from another object. Use a short attached rail, direct label, or a line with an unambiguous endpoint. Measure the annotation height before routing. Move the target and label as one group during animation. **Check:** the relationship survives every state and locale.

### 8. All important objects have been pushed to the perimeter

Reallocate a primary region and a supporting rail. Move related elements together and align visible bounds. Keep a deliberate gap for the reading transition. A quiet central interval is legitimate if it represents a comparison or pause; do not fill it automatically. **Check:** explain the gap’s role without invoking “modern.”

### 9. A quiet slide looks good, but its data comparison is missing

Minimalism cannot excuse missing evidence. Restore the necessary pair, baseline or uncertainty, and move supporting prose to a second page if needed. Conversely, a closing statement need not inherit a chart-sized empty box. Match the space to the page’s actual job. **Check:** deleting an object must not delete a premise.

### 10. A chart is accurate but labels collide after motion

Budget the union of initial, intermediate and final extents. Move objects and labels under the same state owner, reserve a rail, and inspect crossing trajectories. Committing the final style before animation makes rapid input deterministic, but does not make a bad trajectory clear. **Check:** click, focused-button key, reverse, direct final, interruption and reduced motion all convey the same relationship.

### 11. A company template fits the sample but not real text

Preserve approved identity, not arbitrary sample text lengths. Test the actual long heading, dense table, photo, quiet statement and target scripts. Change a flexible content region before changing approved logo proportions or shrinking every font. For a native fixed template, add a legitimate new layout instead of silently flattening to images. **Check:** private reference text never enters the OSS kit.

### 12. A language variant feels translated rather than written

Keep the meaning and evidence stable, but re-author syntax for the target language. Re-measure actual line breaks, family fallback, punctuation and reading direction. Use logical CSS properties where appropriate; mathematical axes do not automatically mirror with RTL text. Do not promise native fluency because geometry checks passed.

### A bounded local repair loop

Record the observed defect in one sentence. Name the element that owns it. Make the smallest structural change that solves it. Re-render the affected page and neighboring comparison pages; replay its meaningful states. Then inspect the deck rhythm. If two local adjustments create new defects, change the composition rather than accumulating exceptions. Close the repair only with actual rendered evidence.

## Recovery ladder for difficult authoring

Do not respond to “make it better” with random restyling. Diagnose the failure first. Use the following bounded actions when you need more explicit scaffolding.

| Symptom | Inspect | First repair | Escalation |
|---|---|---|---|
| Generic title | What changes for the audience? | State the specific contribution | Revisit the slide's job |
| Too much text | Repetition, scope, independent claims | Remove repetition, keep caveats | Split independent questions |
| Diagram feels tangled | Entities, directed edges, boundaries | Reorder nodes by relation | Redraw using lanes or layers |
| Chart seems impressive but unclear | Question, units, baseline | Use direct labels/common scale | Change encoding, not the data |
| Empty-looking page | Focal object and second read | Enlarge the meaningful subject | Reallocate regions; don't add filler |
| Busy page | Competing contrast/saturation | De-emphasize secondary material | Recompose instead of shrinking |
| Image crop loses subject | Original subject boundary | Move focal point or contain | Change frame and text location |
| Translation does not fit | Script, line height, token lengths | Reflow and reallocate width | Redesign that localized page |
| Motion drifts on reverse | State derived incrementally? | Use absolute target states | Replace custom loop with state map |
| Reset fails | Nested initial state mutated? | Deep-copy initial state | Separate source/model/view |
| Output works only online | Hidden font/CDN/decoder fetch | Bundle approved local assets | Static fallback and disclosure |
| PDF is empty | Hidden layers, Canvas, export hooks | Apply informative static state | Expand key states into pages |
| QA keeps flagging intended overlap | Exact element and reason | Narrow waiver plus visual review | Redraw the ambiguous crossing |

### A productive repair loop

Observe one actual rendered defect. Name its cause. Make one bounded change. Rebuild. Run the same test. Inspect the same region and adjacent regions. Keep the change only if the defect is fixed without breaking the claim or introducing another defect.

When uncertain about artistry, compare two materially different treatments of the same content *internally* and choose one. Examples: registered comparison versus side-by-side text, full figure versus detail inset, dense table versus shared axis. Do not ask the user to choose between ten arbitrary palettes.

### Avoid common small-model traps

Do not copy screenshot pixels into an HTML image and claim editable design. Do not copy a gallery's entire generic frame into every final deck. Do not edit a bar's label without its scale. Do not hide overflows with `overflow:hidden`. Do not remove notes containing limitations. Do not install a large framework for a two-control widget. Do not create parallel loops/timers for every hidden slide.

If you cannot run a tool, identify the precise untested gate and retain inspectable source and a fallback. Do not manufacture passing tests. If the environment permits other verified paths, use them without repeatedly asking permission for reversible local steps. A simpler correct delivered deck is preferable to an impressive broken prototype, but simplicity must not become an excuse to ignore the requested medium.

### Stop unproductive tool loops

For media retrieval, inspect the HTTP status, content type and final URL before retrying. Do not repeat the same malformed request after 400, missing resource after 404, or unsupported image-view request: change the request or use a permitted alternative. For 429/transient failure, honor Retry-After and use a small bounded retry budget (normally at most two retries per candidate), then use another legitimate source, approved local material, or explain the missing evidence. Avoid mass scraping and do not bypass access controls. Keep the provenance of any replacement.

If the current agent/tool cannot view images, do not keep resending the same image or call geometry measurements a visual inspection. Retain screenshots/review HTML for an available visual reviewer. Report exactly which checks ran and that visual review is pending. Do not claim a universal model limitation from one tool's error.

## Asset derivation, not cosmetic recoloring

Use `catalog.mjs take ID NEW_DIRECTORY` to obtain a copy, source and context. You may change framing, topology, labels, orientation, geometry, grouping and timing. Keep facts, identities, connections, units and rights intact. A source is a starting material, not a required composition. When it resists the explanation, redraw it.

### Named-part editing

```sh
python scripts/svg-edit.py source.svg --inspect
python scripts/svg-edit.py source.svg --patch changes.json --out derived.svg
```

Patch format:
```json
{"changes":[{"id":"node-a","attrs":{"transform":"translate(80 20)"}},
{"id":"label-a","text":"Revised label"}]}
```

Targets must already exist and match once. Add stable IDs in your editable source when needed. The patcher deliberately does not accept arbitrary scripts or style sheets. Recompute shape dimensions and connected paths in source when the edit is structural; the patcher is not a graph-layout solver. Original files and existing outputs are protected. A SHA-256 provenance record accompanies each derived SVG.

### Concrete transformation: horizontal process to vertical explanation

Start with three entities A→B→C. Keep the three identities and two directed edges. Choose a 540×540 region, place node centers on one x coordinate with equal y gaps, recompute ports on bottom/top edges, then route A→B and B→C. Move every label with its node. Put a failure branch to the side only if the subject actually has one. Recompose the surrounding title and caption; do not merely rotate the entire SVG and make the labels sideways. Test the longest labels before applying the style.

### Split and combine

A source layer may become a large background motif, an inset or a focused detail. Keep evidence crops reversible; store the uncropped original. When combining SVGs, namespace IDs with `namespaceSvg`, reconcile stroke weights and optical scale, and remove duplicated titles/legends. Record which parts came from which source.

Review both image and story. A connected-looking line that reaches the wrong node is worse than an imperfect color match. A labeled interval with stale geometry is a factual defect, not a cosmetic defect. Never use a diagram as proof of data it was not computed from.
