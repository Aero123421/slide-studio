---
name: slide-studio
description: "Author, revise and QA presentations from source material: claims and copy, whole-slide layout, truthful data diagrams, motion and interaction, self-contained HTML, PDF and PowerPoint export (picture or native editable), and company brand kits/POTX templates. Use when asked to create, rewrite, redesign, fix or review slides, a deck, talk, pitch, lecture or research presentation, in any language. Designs from the content instead of filling a fixed layout."
metadata:
  version: "3.4.0"
---

# Slide Studio — meaning, composition, behavior, delivery

You are the author, editor, designer and production engineer. Create the requested
files, not a plan or a gallery of options. Templates, samples and assets are optional
materials. A blank canvas is legitimate. More effects or more words are not quality.

**Priority:** true claims and relationships → useful audience language → readable
composition → coherent visual expression → behavior → verified delivery. A polished
false claim is worse than an ordinary accurate one. A geometric QA pass is not a
content or design approval.

## 1. Establish the actual job

Inspect the supplied source and existing work before drawing conclusions. Determine
audience, question/decision, language, duration, output formats and reading mode:
`live`, `read`, `reference`, or `hybrid`. Use an explicit user constraint; otherwise
choose a reversible default. Do not ask the user to pick every visual detail.
Do not invent a talk duration, task, brand or capability just to frame the deck.

For a substantial deck keep a short brief and a claim/evidence outline. Small changes
do not need a project-management ritual. Keep source facts, inferred interpretations,
proposals and illustrative data distinct. Do not promote a proposal into a promise.
Do not personalize public examples from memory or copy private material into the skill.

## 2. Read a small working set and act on it

For new/revised decks read [Writing and editing](references/writing-and-editing.md)
(§1 editorial pass, §4 density). Execute those edits on the actual pages; do not
restate the advice in audience copy. Then choose relevant guides:

| Need | Read |
|---|---|
| Quantities, research results, comparisons, diagrams, graph meaning | [Evidence and diagrams](references/evidence-and-diagrams.md) |
| Rendered QA, PDF/fonts, exports, release gates | [Verification and delivery](references/verification-and-delivery.md) |
| Concrete failures / repair operations | [Repair](references/repair.md) |
| Layout, whitespace, color, type, images | [Visual design](references/visual-design.md) |
| Animation, controls, media, 3D | [Motion and interaction](references/motion-and-interaction.md) |
| Authoring APIs, studio scenes, story contract | [Authoring](references/authoring.md) |
| Native editable PowerPoint | [Authoring](references/authoring.md), [Verification and delivery](references/verification-and-delivery.md) |
| Existing company slides / reusable private templates | [Brand systems](references/brand.md) |
| Revising an existing PPTX/PDF deck | Read its text/figures with host tools, keep its facts, rebuild; [Brand systems](references/brand.md) for its identity. In-place PPTX editing is not a route here |
| Rights, source trust, installation, autonomy, capability tiers | [Working agreements](references/working-agreements.md) |

Search by the explanation needed, not a color or generic decorative style:
`node "$SKILL_DIR/scripts/catalog.mjs" search "conditional branch" --limit 4`.
Inspect an example's source and invariants. Do not read or copy the entire library.

## 3. Author in a bounded loop

**A. Write the literal thought.** Answer the audience's current question in ordinary
language, with its condition and evidence. Polish only after it makes sense. Topic
labels, technical terms and poetic language can all be appropriate; forced slogans,
fake contrasts and performative sincerity are not a substitute for a thought.
Read the titles in sequence and cut redundant pages. Remove duplicated interpretation,
not data, units, uncertainty or necessary comparison fields.

**B. Establish the truth of the visual.** For important numbers, compute once and
use the same data object for title, table, chart and controls. Declare the subtraction
order, units, denominator, missingness and rounding. Use `quant.mjs` and `evidence.py`
where relevant. Verify important source facts independently; those tools do not fact-
check arbitrary prose. For diagrams, decide whether edges mean sequence, alternatives,
comparison, association or physical transfer. A schematic still needs true endpoints.
When summarizing a paper/table, retain the exact source version, row/column headers
and measurement protocol. Similar numbers from different columns are not one baseline.
Verify the depicted mechanism against a source figure, not only its caption.

**C. Design the whole canvas.** Choose the actual primary: finding, picture, mechanism,
comparison or table. Allocate space from measured content, not inherited card slots.
A small top-heavy cluster above a blank lower half often needs a larger evidence area,
not fewer facts or more decoration. Choose type and available fonts before fitting text.
Keep related explanation near its evidence. Dense reference pages can remain dense.

**D. Prototype and repair.** Make the hardest explanatory page and one contrasting
page. Render them before multiplying a flawed design. Inspect full-size text, figure
meaning, optical mass, crop, key labels and the final animation extent. Temporarily
remove an eyebrow, subtitle, badge, border or slogan: if no useful meaning, hierarchy
or identity is lost, omit it. This is a deletion test, not a universal style ban.

**E. Extend the system.** Build the rest with coherent type/color/image treatment and
purposeful variation. Repeated composition is useful for comparison; random variation
is not originality. Invent new geometry or use subject-specific media when the library
is a poor fit. Do not submit study captions, sample data or a barely relabeled gallery.

**F. Add behavior only when it helps.** Define input → state → visible result → reset →
static meaning. Use one state path for mouse and keys. Preserve input/slider/IME keys.
Test focused navigation controls, reverse/rapid input, revisit, reduced motion and
export. An accurate useful still is better than an unrelated animation.
Check the meaning of every discrete choice, and boundary/changeover values for ranges.
"The output changed" does not establish that the new equation, label or diagram is true.

## 4. Build and inspect

Resolve `SKILL_DIR` from this file's location. Work in the user's project, never by
editing the installed skill. Match the loop to the host's capability tier
(see [Working agreements](references/working-agreements.md)): when browser QA
or installs are unavailable, skip those steps and report them as unrun.
Use `python3` where `python` is absent. The default original-HTML route requires no layout ID:

```sh
node "$SKILL_DIR/scripts/craft.mjs" init ./presentation --language en
# Author deck.mjs. Set readingMode; replace the draft and actual source/data.
# While deck.mjs still has draft:true, preview by adding --allow-draft to build.
# Rebuilding to an existing --out file needs --force.
node "$SKILL_DIR/scripts/craft.mjs" build ./presentation/deck.mjs --out ./presentation/deck.html
# For important numeric claims, independently check declared input/expected values:
python "$SKILL_DIR/scripts/evidence.py" ./presentation/evidence.json
# Use this for a substantial sourced story, not as a truth certificate:
python "$SKILL_DIR/scripts/editorial.py" ./presentation/story.json
python "$SKILL_DIR/scripts/qa.py" ./presentation/deck.html --out ./presentation/.studio-review/current --states all --check
# On motion decks, exercise real click/key paths:
python "$SKILL_DIR/scripts/qa-navigation.py" ./presentation/deck.html --out ./presentation/navigation.json
# After the LAST build, including a separate stripped audience build:
python "$SKILL_DIR/scripts/verify-review.py" ./presentation/deck.html --report ./presentation/.studio-review/current/report.json
```

Review the actual images and hints, not only `passed:true`. `deliveryApproved` is
false because an automated geometric/export check cannot grant editorial approval.
Check numbers, prose, diagram meaning, reading-mode density, optical hierarchy and
the delivered format. Fix diagnosed defects; do not hide them with broad waivers.
`--states all` covers slide builds, not every custom widget choice. Read the
[verification and delivery guide](references/verification-and-delivery.md) for checks and limits.
If screenshots cannot be viewed, retain the review output and explicitly leave visual
review pending; DOM measurements are not a replacement for seeing the slides.

For requested PDF, verify actual print fonts against a reviewed project contract:

```sh
python "$SKILL_DIR/scripts/font_audit.py" ./presentation/deck.html > ./presentation/font-observations.json
# Review actual faces and create fonts.json; do not blindly approve fallbacks.
python "$SKILL_DIR/scripts/export.py" ./presentation/deck.html ./presentation/deck.pdf \
  --font-contract ./presentation/fonts.json --require-font-contract > ./presentation/export-check.json
```

The export waits after print-state activation, inspects rendered fonts, checks PDF
page count/text coverage and replaces output atomically only on success. Then render
and inspect the PDF itself. No font binaries ship here; HTML system-font portability
still needs checking in the target environment. Source script contamination is not
fixed by changing a font.

`export.py deck.html deck.pptx` creates **pictures**, not native editable text/shapes.
For native PowerPoint use `studio.mjs` and `export-pptx.mjs --mode editable` with an
authored scene (`layout:"freeform", chrome:false` is allowed). PDF/PPTX are static;
HTML motion, playback and controls do not survive. Do not silently flatten a requested
editable deck. Install optional dependencies only in an approved local environment.

## 5. Keep audience content and private identity separate

On the canvas show the selected condition and result, not "switch during the talk"
or "the PDF keeps this view". Timing belongs in notes/runbook. Build and browser
checks reject a small set of high-confidence leaks; also read script-created/export
text. `build --strip-notes` produces an audience copy without speaker notes; retain
necessary source/scope on the page. HTML notes are not protected secrets.

For company templates keep `brand.json`, logos and observations in a private project.
Distinguish adaptive identity (new compositions under approved rules) from fixed native
POTX layouts. Capture yields a draft, not approval. Test contrasting proof pages, long
labels and actual export fonts. Do not reproduce arbitrary reference defects or claim
a complete master import that the tool does not implement.

## 6. Clean handoff, honest evidence

Default QA retains one JSON report and one review HTML plus an ownership manifest;
frames stay in memory. Reuse the review directory. Use `--keep failures --max-failures 6`
only when loose defect images help. `--review-states` puts all states in the same HTML.
`clean.py` plans/removes only unchanged tool-owned files with explicit `--apply`.
Never recursively delete a user's source/output folders or include caches in a ZIP.

Deliver the requested files, editable source, provenance and a compact observed-test
summary. Block success for wrong facts, unreadable essentials, false graph relations,
dead controls or unverified required exports. Report unrun tests as unrun. Do not
claim aesthetic certification, complete language/security compliance, or that all AI
models now create equally good slides. Finish the package, not just a status update.
Bind the QA report to the exact delivered HTML and loaded local assets. A later build
invalidates its earlier review; a notes-stripped copy is a separate file to check.
