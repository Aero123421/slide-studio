# Evaluate the ability to author, not memorize layouts

Field outputs must be compared with the task, data and requested reading mode, not just gallery screenshots. Use the [transfer evaluation fixtures](../tests/transfer-evals.json); no new external-model performance claim follows from local regressions.

The evaluation briefs in `evals/tasks.json` are reusable tests for *another* model.
They are not claims that those models have been run. Record model/version, tool
access, prompt, context budget, elapsed work, interventions and produced artifacts.
Do not compare a fully tool-enabled agent with a text-only model without stating it.

## Dimensions

1. Correctness: evidence, scope, units, data transformations and citations.
2. Narrative: useful ordering, specific titles, appropriate density and no filler.
3. Composition: hierarchy, typography, image use, geometric integrity and cohesion.
4. Behavior: functional controls, deterministic states, reset/revisit/reduced motion.
5. Generalization: an unseen relationship or constraint handled without merely
   selecting a supplied layout or recoloring a gallery slide.
6. Delivery: requested format, honest editability, complete source, bounded QA output.

Score each dimension 0–4 using concrete observations. A critical factual error,
broken primary interaction, essential clipping or misleading export claim fails the
task regardless of average score. Do not advertise a universal “design score”.

## Experimental design

Give the same brief and source data to agents with and without the skill. Use unseen
subjects and compare blind when feasible. Include at least one localization stress,
one modification of existing source, one entirely new interaction, one data-heavy
scientific page, one image-led deck and one native-PPTX request. Include negative
controls: an intentionally simple static deck should not become an app.

Hold prompt and tool permissions constant. Inspect actual outputs. Do not use
similarity to a gallery image as the quality metric. A different composition can
be better. Record concrete interventions and whether the model needed repair hints.

The bundled software regression suite tests helpers, parsers, retention, build and
browser behavior. This is necessary infrastructure evidence, not a substitute for
independent-agent creative evaluation or audience comprehension studies.
