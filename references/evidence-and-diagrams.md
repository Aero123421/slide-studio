# Evidence, diagrams, and research figures

Numbers, diagrams, research figures, and source handling. Every rule, step,
command, and code block below applies as written.

---

## A diagram is a claim, not decoration

A graph can be geometrically valid while teaching the wrong relationship. A caption
saying "schematic" does not excuse swapped endpoints, a false sequence, invented
geography, reversed signs or inconsistent legends.

### Compute once, render more than once

For each decision-relevant number preserve the input source, unit, period, denominator,
operation and display rounding. Produce headline numbers, labels, tables and chart
marks from **the same computed object**, not separate manually copied constants.

```js
import {quantity, change, formatQuantity, paired, totalCost} from './quant.mjs';
const result = change(quantity(500, 'million JPY'), quantity(650, 'million JPY'));
const amountLabel = formatQuantity(result.delta, {locale:'en', digits:0}); // 150 million JPY
const percentLabel = `${result.percent.toFixed(1)}%`;                       // 30.0%
// Feed result.after.value and result.before.value to the chart too.
```

These are synthetic examples, not market data. `craft init` copies `quant.mjs` into
the new project. Unit conversion must be explicit; the helpers reject mixed units,
numeric strings and nonfinite values. Percent change from zero is undefined.

For important numeric slides, write a small `evidence.json` alongside the source:

```json
{"claims":[{"id":"change","source":"local sample table, row 1; synthetic",
 "op":"delta","unit":"million JPY","direction":"after - before",
 "inputs":{"before":500,"after":650},"digits":0,"expected":{"value":150}}]}
```

`python "$SKILL_DIR/scripts/evidence.py" evidence.json` independently recomputes it.
Supported operations: delta, percent-change, ratio, sum, paired descriptive statistics,
and horizon-based total cost. This checks declared inputs, not arbitrary sentences or
source authenticity. Do not generate both inputs and expected values from a wrong
claim. Trace inputs back to source rows and independently inspect critical results.

### A source table is not a bag of numbers

Before extracting a comparison, read its caption, row/column headers and relevant
footnote together. Record the exact paper revision/publication or wiki revision,
table/page/section, metric, split/evaluation protocol, population and units. A preprint
and published paper can have different columns. "One input", "one estimator" and
"one model" are not interchangeable labels. A current library default is not necessarily
the method or software version used in a historical paper; consult the matching source.

For table-heavy claims, `evidence.py` supports a narrow `table-cells` binding:

```json
{"tables":{"trial":{"source":"Synthetic study, Table 2","version":"revision B",
 "columns":{"single":{"label":"Single estimator","unit":"%","protocol":"held-out error"}},
 "rows":{"set-a":{"single":18.2},"set-b":{"single":21.4}}}},
 "claims":[{"id":"baseline","op":"table-cells","table":"trial","column":"single",
 "rows":["set-a","set-b"],"unit":"%","digits":1,
 "expected":{"values":[18.2,21.4],"columnLabel":"Single estimator",
 "protocol":"held-out error","sourceVersion":"revision B"}}]}
```

The source registry is an independently checked transcription; `expected` describes
the intended display. This catches mixing cells from different columns, changed row
order, wrong labels/protocols/versions and unit mismatches. It cannot tell that both
sides copied the same wrong original. It also does not read values back from arbitrary
HTML. Inspect the critical source cells and the actual rendered labels separately.
Do not force this file onto a qualitative essay with no important numeric comparison.

### Sign, missingness and denominator

Choose `after - before` or `before - after` once. Use it in the axis, title, tooltip,
summary and PDF. A lower-after result is negative only under the first convention.
`paired()` returns the rows and summary under one direction. Missing pairs remain
missing; the denominator is the number of complete pairs. Standard deviation, standard
error and confidence interval are different quantities; use the requested definition.
The helper computes sample SD with n−1, and does not claim significance or causality.

Missing observations break a line (`segments()`); they are not zero, not automatically
interpolated, and not proof that nothing changed. If interpolation is analytically
justified, draw it distinctly and state the assumption next to the relevant mark.

A comparison can change with the horizon. Check all endpoints and thresholds of a
slider. "Cheapest at every horizon" must be true at every declared horizon, not only
the default one. Keep excluded costs and proposal status visible with the conclusion.

### Relationship contract before SVG

Write the relationship in plain words or a small graph:

- **Sequence:** A happens before B. An arrow may imply temporal/causal order.
- **Alternatives:** a condition leads to B or C. Draw a branch, not B → C.
- **Association:** related, not necessarily caused. Do not add a directional arrow
  merely because it looks more dynamic.
- **Comparison:** common baseline, encoding and units; a line is not a transfer.
- **Physical mechanism:** correct direction, meaningful connections, relevant parts.
- **Map:** use a verified outline/coordinates or clearly nongeographic route diagram.
  Do not invent a continent and put familiar city labels on arbitrary points.

`craft init` also copies a project-local `semantic-graph.mjs`. Import it from
`./semantic-graph.mjs`; it validates declared endpoint/condition rules and includes an
optional branch constructor. It rejects a sequential link between alternative outcomes.
It cannot validate the physical or historical truth of the input; that needs sources.

For a physical/biological/architectural explanation, compare the drawing with an
authoritative figure or source photograph. Identify the parts and the few relations
that carry the explanation: which surface redirects a path, which parts intersect,
which structure connects to which. Verify those on the actual geometry, including
any changed state. A frame labeled "crossing" still needs the crossing; a deflection
must happen at the named interface. A simpler correct abstraction is useful, but an
unrelated generic diagram does not explain a named mechanism. If the evidence is
insufficient, use a verified source visual or state the unresolved limitation.

### Checks that must reach the final rendering

Confirm arrow endpoints after labels move; legend colors equal actual mark colors;
scales match the data; negative/zero values remain visible; outcome labels attach to
the correct branch; photo annotations point to the actual feature; custom SVG IDs do
not collide; the live, reversed and exported states tell the same story.

Do not solve a subject-specific illustration with generic clip-art geometry when the
subject's actual shape matters. Use a sourced photograph, existing technical drawing,
accurately derived SVG or a simpler honest abstraction. More nodes, shading and
animated dots cannot compensate for an incorrect relation.

### Changing an input changes the claim too

A period selector must update the headline, comparator, totals, marks, units,
assumptions and selected-state caption together. Updating just the bars leaves a
stale claim on the screen. Check a parameter where the rank actually changes, then
reverse the selection. Preserve the selected condition in the static export.
See `assets/repair-lab/period.mjs` and `gallery/period-comparison.html`: one calculated
snapshot supplies all visible outputs; 12-month and 36-month winners differ.

---

## Diagrams, SVG and quantitative honesty

With the numeric and relationship contract in the previous section in place, the
following rules cover diagram derivation, chart invariants, and SVG engineering.
Geometry alone cannot validate the meaning of an arrow.

### Build from a model of the relationship

List entities, edges, membership, order, quantities, units and uncertainty before
placing shapes. Choose the encoding that answers the question. Position is useful
for comparison; arrows for directed relationships; containment for membership;
length for magnitude on a shared baseline. Do not let decorative shape imply a
relationship that is not present.

SVG assets in `assets/svg` are inspectable schematics. Each diagram is also a source
study in the catalog. **Illustrative geometry must be recomputed when real data
replaces the example.** Changing a numeric label without changing a bar or interval
is a factual defect. The examples do not constitute a general charting engine.

### A safe derivation sequence

Copy the source into the project; name your intended transformation; identify the
invariants; modify geometry, labels and connections together; namespace IDs when
embedding; render the longest labels and smallest reasonable viewport; compare
first/intermediate/final states and static output; record source and changes.

For a topology change, update adjacency and visible routes, not just lines. For a
rotation from horizontal to vertical, recompute ports and annotation anchors. For
an exploded view, keep the same part IDs and ordering. For an illustration, preserve
which label points to which part. Connection endpoints belong to the subject, not
to a stale absolute pixel.

### Chart-specific invariants

Bars: common zero unless the nonzero convention is justified and clearly marked.
Slope/paired dots: match identities and use comparable scales. Part-whole: verify
denominator and sum; categories must not overlap silently. Waterfall: running totals
must reconcile; distinguish subtotal from contribution. Histogram: recompute bins;
counts or density and bin widths must match. Intervals: say whether SD, SE, CI,
credible interval or another quantity, and record how it was computed.

Scatter: do not imply causation from association. Fit/band: show model and interval
scope; interpolated appearance is not evidence. ROC/PR: axes, thresholds and class
balance matter; never infer one from the other. Confusion matrix: state class order
and normalization. Calibration: provide binning and counts where interpretation
requires them. Ablation: distinguish controlled removal from an unrelated baseline.

Tables: real header cells, aligned units, missing values distinguished from zero,
consistent precision, and declared ordering. Highlight the relevant comparison
without hiding adverse rows. Small multiples need common scales when comparison
requires them. A network edge width only implies quantity if a mapping is defined.

### SVG engineering

Use a meaningful `viewBox`, accessible title/description, and named groups or
`data-part` attributes. Keep a consistent line vocabulary. Prefer group transforms
for coupled labels and shapes. Namespaced IDs avoid collisions in gradients, masks,
markers and `aria-labelledby`. Do not reuse source IDs across multiple instances.

Avoid external references, embedded scripts and event handlers in imported SVG.
`namespaceSvg()` accepts a conservative passive subset; rejection is a request to
inspect and adapt the source, not permission to disable checks. It is not a complete
hostile SVG sanitizer. XML operations in `svg-edit.py` reject entities and preserve
the original, but the author still owns geometric and semantic correctness.

Diagram labels should remain real text where useful; do not convert all type to
paths to hide missing fonts. Stroke width, joins and arrowheads should survive the
selected export scale. Inspect paths and clipping on the actual renderer.

### Decorative geometry is a separate vocabulary

The last group of geometric SVGs is for visual identity, not data. Repetition,
contours, arcs, tessellation and clipped forms can support composition. Do not add
axes or fake numerical labels to make decoration look scientific.

---

## Research talks and scientific figures

The same honesty contract applies to research communication:

Explain the question, what was actually done, what was observed, and what can and
cannot be concluded. Do not wrap a research talk in a sales narrative. The audience
may need detail, competing hypotheses, negative results and assumptions more than
large slogans.

### Evidence on the page

Put units, sample sizes, comparison conditions, uncertainty definition and source
near the figure where they matter. Avoid conveying a stronger claim in the heading
than the experiment supports. A p-value does not replace effect size or study scope.
Do not manufacture intervals, trials, effect sizes, references or significance.

Distinguish raw data, transformation, model fit and interpretation. Keep panel scales
registered unless a scale change is explicit. Use one source of truth for plot
geometry, annotations and numeric text. Report preprocessing that affects meaning.
Do not redraw a published figure from memory; obtain and cite the actual source.

### Good formats for different questions

Paired observations for within-unit change; distributions for spread; intervals for
uncertainty; small multiples for controlled comparisons; tables when exact values
are the question; diagrams for mechanisms and assumptions. ROC/PR/calibration plots
answer different questions. An attractive curve is not an interchangeable decoration.

For equations, use semantic MathML or an approved local rendering pipeline as needed,
with a readable fallback. Number only equations that will be referenced. Explain
variables and domains near first use. Do not paste an equation as a tiny screenshot
if the audience needs to inspect terms. Use stepwise derivation when it clarifies a
logical transformation; preserve equality/approximation distinctions.

For code and algorithms, show the relevant region, preserve indentation and syntax,
and relate the code to inputs/outputs. Execute a small deterministic example when
possible. Animation should reveal state transitions, not conceal an incorrect trace.

### Interactive scientific explanation

A parameter explorer is useful for sensitivity, thresholds, conservation, phase
relationships or boundary cases. Label a toy model as a toy model. Do not let an
interactive demonstration appear to validate a hypothesis it merely illustrates.
Expose input ranges, selected values, derived metrics, seed where applicable and
limitations. The static export must preserve the main argument without exploration.

### Figure integrity checklist

Same data and label source; accurate axes; complete legend; meaningful color; correct
normalization; honest uncertainty; readable annotation; relevant reference; declared
illustration status; no silently excluded unfavorable condition. Check totals and
bounds numerically before visual review.

The bundled research case is a synthetic teaching narrative. It demonstrates how
question, data, exploration, controlled comparison and limitations fit together.
It is not a publishable study, a performance benchmark or a reusable scientific claim.

---

## Primary reference sources

Consulted 2026-09-06. These are references for standards and integration boundaries,
not copied templates or a claim that every optional integration was tested. The
original design guidance is the author's synthesis and practical implementation.

| Topic | Primary source | How used |
|---|---|---|
| Agent Skills structure | https://agentskills.io/specification | Frontmatter, naming, progressive references |
| Agent description design | https://agentskills.io/skill-creation/optimizing-descriptions | Task triggers and progressive retrieval |
| Codex/ChatGPT skill documentation | https://developers.openai.com/codex/skills/ | Host installation guidance; follow current redirect |
| Claude Code skills | https://code.claude.com/docs/en/skills | Folder-level install and portability |
| Motion from interactions | https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions | Suppression of nonessential interactive motion |
| Pause/stop/hide | https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html | Automatic animation controls |
| Reduced motion | https://www.w3.org/WAI/WCAG22/Techniques/css/C39 | CSS preference behavior |
| Media autoplay | https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay | Explicit playback and blocked-play fallback |
| Media play promise | https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play | Promise-aware playback |
| RTL markup | https://www.w3.org/International/questions/qa-html-dir | Directionality and mixed text |
| Optional model-viewer | https://modelviewer.dev/docs/index.html | Camera controls and renderer integration boundary |
| Model loading/decoders | https://modelviewer.dev/examples/loading/ | Posters and offline decoder dependency caveat |

For publication-critical accessibility and compatibility decisions, consult the
current full standards and test the final environment. Example checks do not certify
conformance. Rights references for photographs are recorded separately in notices.

W3C contrast minimum: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum
W3C non-text contrast: https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html
scikit-image media rights: https://scikit-image.org/docs/stable/api/skimage.data.html

### Refinement and template implementation references (3.2)

- Keyboard focus/event routing: https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event
- Held keys: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/repeat
- IME composition: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/isComposing
- Committed animation completion: https://developer.mozilla.org/en-US/docs/Web/API/Animation/finish
- Cancellation: https://developer.mozilla.org/en-US/docs/Web/API/Animation/cancel
- Finished promise: https://developer.mozilla.org/en-US/docs/Web/API/Animation/finished
- Native placeholders: https://python-pptx.readthedocs.io/en/latest/user/placeholders-using.html
- Native slide layout API: https://python-pptx.readthedocs.io/en/latest/api/slide.html

These explain event and file-model behavior. The brand capture, six native layouts,
copy gate and spatial diagnostics in this skill are local implementations, not an
assertion that these references validate the skill’s overall design quality.
