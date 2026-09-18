# A diagram is a claim, not decoration

A graph can be geometrically valid while teaching the wrong relationship. A caption
saying "schematic" does not excuse swapped endpoints, a false sequence, invented
geography, reversed signs or inconsistent legends.

## Compute once, render more than once

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

## A source table is not a bag of numbers

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

## Sign, missingness and denominator

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

## Relationship contract before SVG

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

## Checks that must reach the final rendering

Confirm arrow endpoints after labels move; legend colors equal actual mark colors;
scales match the data; negative/zero values remain visible; outcome labels attach to
the correct branch; photo annotations point to the actual feature; custom SVG IDs do
not collide; the live, reversed and exported states tell the same story.

Do not solve a subject-specific illustration with generic clip-art geometry when the
subject's actual shape matters. Use a sourced photograph, existing technical drawing,
accurately derived SVG or a simpler honest abstraction. More nodes, shading and
animated dots cannot compensate for an incorrect relation.

## Changing an input changes the claim too

A period selector must update the headline, comparator, totals, marks, units,
assumptions and selected-state caption together. Updating just the bars leaves a
stale claim on the screen. Check a parameter where the rank actually changes, then
reverse the selection. Preserve the selected condition in the static export.
See `assets/repair-lab/period.mjs` and `gallery/period-comparison.html`: one calculated
snapshot supplies all visible outputs; 12-month and 36-month winners differ.
