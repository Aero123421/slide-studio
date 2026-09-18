# Research talks and scientific figures

Explain the question, what was actually done, what was observed, and what can and
cannot be concluded. Do not wrap a research talk in a sales narrative. The audience
may need detail, competing hypotheses, negative results and assumptions more than
large slogans.

## Evidence on the page

Put units, sample sizes, comparison conditions, uncertainty definition and source
near the figure where they matter. Avoid conveying a stronger claim in the heading
than the experiment supports. A p-value does not replace effect size or study scope.
Do not manufacture intervals, trials, effect sizes, references or significance.

Distinguish raw data, transformation, model fit and interpretation. Keep panel scales
registered unless a scale change is explicit. Use one source of truth for plot
geometry, annotations and numeric text. Report preprocessing that affects meaning.
Do not redraw a published figure from memory; obtain and cite the actual source.

## Good formats for different questions

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

## Interactive scientific explanation

A parameter explorer is useful for sensitivity, thresholds, conservation, phase
relationships or boundary cases. Label a toy model as a toy model. Do not let an
interactive demonstration appear to validate a hypothesis it merely illustrates.
Expose input ranges, selected values, derived metrics, seed where applicable and
limitations. The static export must preserve the main argument without exploration.

## Figure integrity checklist

Same data and label source; accurate axes; complete legend; meaningful color; correct
normalization; honest uncertainty; readable annotation; relevant reference; declared
illustration status; no silently excluded unfavorable condition. Check totals and
bounds numerically before visual review.

The bundled research case is a synthetic teaching narrative. It demonstrates how
question, data, exploration, controlled comparison and limitations fit together.
It is not a publishable study, a performance benchmark or a reusable scientific claim.
