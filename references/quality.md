# Quality gates and honest release criteria

`passed:true` means only the named automated checks passed. `deliveryApproved` remains false. Review [field repair cases](field-repairs.md), [reading-mode density](density-and-rhythm.md) and the [PDF typography route](pdf-typography.md) where applicable.

A passing parser is not a good deck. A passing screenshot heuristic is not a good
argument. Keep separate evidence for correctness, behavior, visual quality and export.

## Required for the actual deliverable

**Meaning:** every page has a role; claims match evidence and scope; units and
uncertainty are correct; synthetic examples are labeled; no unsupported promise.
**Composition:** clear hierarchy at overview and full size; intentional spacing;
readable labels; appropriate image crop; no lost glyphs or essential clipping.
**Behavior:** controls affect actual state; keyboard alternatives work; no stale
listeners or offscreen media; reset/revisit/direct jumps/reduced motion are coherent.
**Export:** real final PDF/PPTX inspected; no blank Canvas, missing poster, hidden
qualification, wrong dimensions or false native-editability claims.
**Handoff:** source and assets are complete, paths are portable, rights recorded,
private data absent from generic examples, temporary review files excluded.

## Browser QA commands

```sh
python scripts/qa.py project/deck.html --out project/.studio-review/current --states all --check
# Only when individual failure frames are useful:
python scripts/qa.py project/deck.html --out project/.studio-review/current --states all --keep failures --max-failures 6
# All states in one review file, not many loose images:
python scripts/qa.py project/deck.html --out project/.studio-review/current --states all --review-states
```

The tool measures overflow, text overlap, broken images, missing image alt attributes,
duplicate IDs, runtime errors and blocked external requests. Warnings about small
text need contextual review. Intentional crops can mask geometry, so manually inspect
cropped essential content. The checker does not understand topology, photographic
truth, chart math, native-language fluency or overall aesthetic quality.

It also checks structural CSS, severe measurable solid-color contrast and optional
rendered-style/mark/focal-region assertions. Other contrast, paint, crop and stacking
findings are advisory or unmeasured. See [rendered integrity](rendered-integrity.md)
for the precise boundaries, including why `--states all` is not widget-choice coverage.

Default frames stay in memory and the report is one JSON plus one review HTML.
The tool reuses an owned output directory. Unknown, modified and symlinked files are
protected. Cleanup is dry-run unless `clean.py ... --apply` is used. Never hand out
review caches as if they were source assets.

## Visual inspection routine

First inspect the contact view for deck rhythm and repeated mistakes. Then inspect
each final page at readable size. For animated material inspect all meaningful
states and actual timing on representative transitions. For media confirm playback
and a changed frame/time, not merely an available control. For 3D confirm rotation
changes the geometry and test import errors. For translated content inspect glyph
coverage and shaping in the actual output environment.

Write a specific defect ledger: slide/state, symptom, cause, change, retest. Avoid
vague self-ratings like “10/10 premium”. Use a narrow waiver only for intentional
overlap/bleed, and keep the reason next to the affected element.

## Environmental limitations

Browser QA uses Playwright Chromium. The browser plugin is not a runtime requirement.
When a managed environment blocks file URL navigation, `SLIDE_STUDIO_INLINE=1` loads
a self-contained document using `set_content`; record that mode. It does not resolve
relative assets in nonembedded documents. Do not claim file-URL testing from inline
mode. Add actual browser/OS/viewport coverage when the delivery context requires it.

The source tests and included benchmark briefs do not establish parity between AI
models. Do not claim independent-agent evaluation unless those agents were actually
run and their outputs scored. Report clearly what was tested and what remains outside
that test's scope.

## Copy and space release gates (3.2)

The source check and the rendered check both inspect audience text. Production cues
created by JavaScript are as real as static headings. Test intentional exact quotes
with narrow waivers, not a blanket pass. Speaker notes are not private simply because
they are hidden in the layout; make a stripped public build when needed.

Inspect the report’s `spatial` diagnostics and the actual image together. A coarse
empty rectangle is not a failure by itself. Check the optical primary, diagram
drawing bounds, relationships between text and target, heading stacks, and orphan
lines. Fix a weak composition by reallocating meaningful regions, not by adding
shapes to raise an occupancy metric. See [repair clinic](repair-clinic.md).

For motion decks run `qa-navigation.py` as well as rendering. A report from the
previous source version is not evidence for a newly built deck. Keep input hashes
and repeat affected checks after a repair. Brand proofs must include contrasting
content, and native templates must be opened/rendered in an available Office client.
State exactly which client was exercised; XML parsing does not certify PowerPoint.

After the last build, run `verify-review.py final.html --report path/to/report.json`.
This rejects stale HTML/recorded local assets and incomplete/failed QA. It does not
approve factual accuracy or design. Run QA separately on a notes-stripped audience
build; matching visible text alone does not bind the report to that final file.
