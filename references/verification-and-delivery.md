# Verification and Delivery

Release gates first, then rendered-integrity QA, PDF font auditing and export routes.

## Quality gates and honest release criteria

`passed:true` means only the named automated checks passed. `deliveryApproved` remains false. Review [field repair cases](repair.md), [reading-mode density](writing-and-editing.md) and the PDF typography route where applicable.

A passing parser is not a good deck. A passing screenshot heuristic is not a good
argument. Keep separate evidence for correctness, behavior, visual quality and export.

### Required for the actual deliverable

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

### Browser QA commands

```sh
python scripts/qa.py project/deck.html --out project/.studio-review/current --states all --check
# Only when individual failure frames are useful:
python scripts/qa.py project/deck.html --out project/.studio-review/current --states all --keep failures --max-failures 6
# All states in one review file, not many loose images:
python scripts/qa.py project/deck.html --out project/.studio-review/current --states all --review-states
```

Other options: `--width`/`--height` (default 1280×780 viewport) and `--reduced-motion`.

The tool measures overflow, text overlap, broken images, missing image alt attributes,
duplicate IDs, runtime errors and blocked external requests. Warnings about small
text need contextual review. Intentional crops can mask geometry, so manually inspect
cropped essential content. The checker does not understand topology, photographic
truth, chart math, native-language fluency or overall aesthetic quality.

It also checks structural CSS, severe measurable solid-color contrast and optional
rendered-style/mark/focal-region assertions. Other contrast, paint, crop and stacking
findings are advisory or unmeasured. See [Check what was actually painted](#check-what-was-actually-painted)
for the precise boundaries, including why `--states all` is not widget-choice coverage.

Default frames stay in memory and the report is one JSON plus one review HTML.
The tool reuses an owned output directory. Unknown, modified and symlinked files are
protected. Cleanup is dry-run unless `clean.py ... --apply` is used. Never hand out
review caches as if they were source assets.

### Machine-made patterns

```sh
python scripts/slop_check.py project/deck.html        # or deck.scene.json, or any .pptx
python scripts/slop_check.py project/native.pptx --check
```

It reports located, repairable signals: accent stripes on card edges and bars under
titles, decorative ordinals, one eyebrow + card-row skeleton repeated across the deck,
English eyebrows in a CJK deck, an identity color reused for unrelated items,
near-duplicate pages, a high share of small live text, status words ("登壇用ドラフト",
"draft") on the canvas and tool metadata in speaker notes. See SKILL.md §3 G for the
repair of each. Warnings are review prompts: fix them or record a one-line reason the
pattern carries meaning on that page. `--check` exits 2 only for errors (production
copy, tool metadata in notes). It is a geometry/text heuristic, not a taste score, and
it does not see pixels inside images. HTML input needs Playwright; `.pptx` needs
python-pptx; `.scene.json` needs only the standard library.

### Visual inspection routine

First inspect the contact view for deck rhythm and repeated mistakes. Then inspect
each final page at readable size. For animated material inspect all meaningful
states and actual timing on representative transitions. For media confirm playback
and a changed frame/time, not merely an available control. For 3D confirm rotation
changes the geometry and test import errors. For translated content inspect glyph
coverage and shaping in the actual output environment.

Write a specific defect ledger: slide/state, symptom, cause, change, retest. Avoid
vague self-ratings like “10/10 premium”. Use a narrow waiver only for intentional
overlap/bleed, and keep the reason next to the affected element.

### Environmental limitations

Browser QA uses Playwright Chromium. The browser plugin is not a runtime requirement.
When a managed environment blocks file URL navigation, `SLIDE_STUDIO_INLINE=1` loads
a self-contained document using `set_content`; record that mode. It does not resolve
relative assets in nonembedded documents. Do not claim file-URL testing from inline
mode. Add actual browser/OS/viewport coverage when the delivery context requires it.

The source tests and included benchmark briefs do not establish parity between AI
models. Do not claim independent-agent evaluation unless those agents were actually
run and their outputs scored. Report clearly what was tested and what remains outside
that test's scope.

### Copy and space release gates

The source check and the rendered check both inspect audience text. Production cues
created by JavaScript are as real as static headings. Test intentional exact quotes
with narrow waivers, not a blanket pass. Speaker notes are not private simply because
they are hidden in the layout; make a stripped public build when needed.

Inspect the report’s `spatial` diagnostics and the actual image together. A coarse
empty rectangle is not a failure by itself. Check the optical primary, diagram
drawing bounds, relationships between text and target, heading stacks, and orphan
lines. Fix a weak composition by reallocating meaningful regions, not by adding
shapes to raise an occupancy metric. See [repair clinic](repair.md).

For motion decks run `qa-navigation.py` as well as rendering. A report from the
previous source version is not evidence for a newly built deck. Keep input hashes
and repeat affected checks after a repair. Brand proofs must include contrasting
content, and native templates must be opened/rendered in an available Office client.
State exactly which client was exercised; XML parsing does not certify PowerPoint.

After the last build, run `verify-review.py final.html --report path/to/report.json`.
This rejects stale HTML/recorded local assets and incomplete/failed QA. It does not
approve factual accuracy or design. Run QA separately on a notes-stripped audience
build; matching visible text alone does not bind the report to that final file.

## Check what was actually painted

Read this for final HTML QA, failed CSS, unreadable text, missing marks or cropped
subjects. These are bounded diagnostics, not a replacement for viewing the deck.

### Checks versus approval

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

### Small, optional assertions on fragile elements

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

### Meaningful controls need meaningful tests

`qa.py --states all` covers declared slide builds and static final states of
`craft.mjs` decks (the default is `sampled`: first, middle and last build); `studio.mjs`
decks are inspected in their final build state only.
`qa-navigation.py` exercises presentation navigation. Neither enumerates arbitrary
custom controls nor establishes their scientific correctness. For discrete controls,
check each choice's actual claim, formula, marks and labels; for ranges, use endpoints,
relevant thresholds, zero/missing cases and a reverse selection. Use independently
derived expected outputs. Keep key screenshots or a compact state/result ledger.

### The final artifact is the QA input

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

## PDF typography: inspect the font that was actually used

Four different problems can look like a bad PDF font:

1. The source already contains the wrong word, script, date or character.
2. The requested family is absent and the browser substitutes a different face.
3. A hidden slide first needs a face during printing; export ran before it settled.
4. Glyph shaping, encoding, clipping or PDF rendering differs despite the intended face.

Inspect the HTML source and the actual PDF. Do not call every Type3 font broken, or
claim that a zero U+FFFD count proves the typography is correct.

### Establish fonts before composing

Choose actual families available in the export environment and appropriate to the
language/brand. Check the selected Latin, CJK, Arabic/Indic, math and symbol faces as
needed. `fc-match` returning a face is not proof it found the requested family: it
can return a fallback. Browser `document.fonts.check()` can also return true for a
missing requested family, and does not test individual glyph coverage.

Use `font_audit.py`, which queries Chromium's `CSS.getPlatformFontsForNode` for the
faces actually used for visible DOM text. Names in computed CSS are not this evidence.
The existing `fontcheck.py` can check character coverage of a known local font file.
Neither method is a native-language proofreading or shaping certificate.

### A project-local font contract

Review actual usage and choose the intended family/fallback set. Do not automatically
approve every face merely to make an audit pass. Preserve an approved corporate face;
if it is unavailable, report that and make an explicit alternative rather than silently
rebranding the deck.

```json
{"version":1,"status":"approved","rules":[
 {"selector":".slide","families":["Noto Sans CJK JP"]},
 {"selector":".serif","families":["Noto Serif CJK JP"]},
 {"selector":".equation","families":["STIX Two Math"],"required":false}
]}
```

This is an example, not a promise that those fonts are installed. The last matching
rule wins. Family names are the reported platform names. A required rule with no
visible text is rejected. Script-specific fallback may legitimately require more
than one family in a rule. The author may choose fonts within delegated design
freedom; do not pretend a different corporate font was user-approved.

```sh
python "$SKILL_DIR/scripts/font_audit.py" deck.html > font-observations.json
# Review and create fonts.json; don't copy the observations into an approved whitelist blindly.
python "$SKILL_DIR/scripts/font_audit.py" deck.html --contract fonts.json --check
python "$SKILL_DIR/scripts/export.py" deck.html deck.pdf \
  --font-contract fonts.json --require-font-contract > export-check.json
```

### Export guarantees and their limits

The PDF route now switches to the final/print state, makes the pages available,
waits for fonts and images **again**, queries actual faces, prints to a temporary
file, and checks PDF page count and expected text-character coverage before replacing
the destination. Contract mismatches or failed postflight leave an existing output
untouched. It retains no screenshot PNGs. Inspection CDP sessions can reset emulated
media in Chromium, so the code restores print/reduced-motion state after inspection.

PDF postflight requires the optional pypdf dependency. It inventories PDF fonts and
warns about nonembedded font programs; Type3 uses embedded glyph procedures and is
not rejected merely for its type. Text comparison ignores whitespace, case, compatible
Unicode forms and text order. It detects loss, not logical reading order or truth.
A legitimate PDF encoding may still make extraction fail: investigate and document,
not silently disable the check. Always render the PDF and inspect the difficult pages.

Actual DOM text inspection does not see text painted into Canvas, images or opaque
embedded frames. Those regions need visual inspection and an accessible alternative.
Custom beforeprint scripts must not introduce untested late text/font states.

### Portability and rights

No font binaries are bundled in this OSS skill or its examples. These commands do
not download/install/embed standalone font files. The browser may embed/subset fonts
into PDF under the applicable font permissions. For a portable HTML font package,
use only separately authorized user/project assets and verify their redistribution
rights. A system-font HTML can render differently on another machine even when its
PDF is stable. Never promise exact cross-platform HTML typography without testing.

Primary technical references: [MDN FontFaceSet.check](https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/check),
[MDN Document.fonts](https://developer.mozilla.org/en-US/docs/Web/API/Document/fonts),
[Chrome DevTools CSS protocol](https://chromedevtools.github.io/devtools-protocol/tot/CSS/).

## Export routes: choose deliberately

PDF delivery has actual-font auditing and postflight. Use an approved project-local font contract and follow PDF typography. The postflight dependency is pypdf, included in `requirements.txt`.

| Route | Preserved | Not preserved |
|---|---|---|
| Authored HTML | HTML/CSS/SVG, declared motion, widgets and local media | Native PPTX objects are not implied |
| Browser PDF | Static final visual state, text/vector where the browser supports it | Interactions, CSS animation, playable media |
| Fidelity PPTX | Static page appearance as a full-slide image; notes/sources | Native editable text/shapes, HTML behavior |
| Native scene PPTX | Native text and supported geometric shapes | CSS layout/motion; SVG/images remain pictures |

Do not choose the image route silently when native editing was requested. A custom
HTML page cannot be converted into exact editable PowerPoint objects merely by
changing the exporter flag. Author the native scene separately when necessary.

### HTML to static PDF or fidelity PPTX

```sh
python scripts/export.py project/deck.html project/deck.pdf
python scripts/export.py project/deck.html project/deck.pptx
```

These commands capture in memory and leave no persistent PNGs. Existing output is
protected unless `--force` is explicitly supplied. Output dimensions follow the
authored canvas. Review the exported file, not only its HTML. Dynamic plots and
media need meaningful export hooks/posters; a still cannot retain exploration.

### Native editable PowerPoint

```sh
node scripts/studio.mjs validate project/deck.json
node scripts/studio.mjs build project/deck.json --out project/native.html
node scripts/export-pptx.mjs project/native.html project/native.pptx --mode editable
```

Use version-1 scene data with `layout:"freeform", chrome:false` for an original
unframed composition. Text/shapes are expressed in CSS-pixel coordinates on the
1280×720 scene. `references/authoring.md` describes the schema. Text wrapping uses
estimates and requires real output inspection. Font differences between environments
can still change wrapping. SVG geometry stays a picture in the PPTX route.

The historical `--mode fidelity --png-dir` entry point is retained for existing
workflows only; no bundled script produces the `slide-NN.png` frames it expects. Use
`export.py` for picture PPTX. Native routes (`export-pptx.mjs --mode editable`,
`export-pdf-office.mjs`, which also needs LibreOffice `soffice` or
`SLIDE_STUDIO_SOFFICE`) accept `studio.mjs` HTML, not `craft.mjs` HTML. The optional artifact
adapter is inherited and is not part of the tested default release path; do not
claim it was verified unless you run it in a supporting environment.

### Static narrative design

Use final state when it retains the argument. Expand intermediate states when each
contains unique evidence. Use a selected poster for video and several annotated
views for 3D when one view is insufficient. Keep the selected parameter value in a
frozen chart's caption. Remove controls only after preserving their meaning.

Test slide count, dimensions, glyphs, page breaks, notes, sources, pictures and native
objects as appropriate. Opening and parsing a PPTX verifies its structure, not visual
identity in every version of PowerPoint, Keynote or LibreOffice. Review the target
application for critical deliveries. No bundled route converts CSS into PowerPoint
animations or promises editable video/3D assets inside PPTX.
