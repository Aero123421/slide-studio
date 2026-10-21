# Slide Studio 4.0.0 — observed verification

Recorded 2026-10-19 on the final 4.0.0 tree. This is a record of what was executed and
what was found, not a claim that any agent now makes better slides: that was not
measured (see [limits](#deliberate-limits)). Machine-readable results are in
[tests/release-results.json](tests/release-results.json).

## Executed regression suites

| Suite | Command | Result |
|---|---|---:|
| Figure engine, structured route (compile, HTML, native PPTX), craft build, catalog, CSS preflight | `node --test tests/*.test.mjs` | 99 / 99 |
| Safety, brand, evidence, source tables, final review, machine-made-look signals | `python -B -m unittest discover -s tests -p 'test_*.py'` | 68 / 68 |
| Rendered integrity, QA integration, searchable PDF (Inter, Japanese, redrawn widgets) | `python -B tests/integrity_browser.py` | 36 / 36 |
| Widgets with default and real data, media, mesh, motion galleries, gallery index | `python -B tests/browser.py` | 37 / 37 |
| Keyboard, focused controls, IME, reverse and rapid input, print lifecycle | `python -B tests/navigation.py` | 20 / 20 |
| Rendered copy channels and space diagnostics | `python -B tests/rendered_review.py` | 5 / 5 |
| Japanese field pages: font contract, PDF text and fonts | `python -B tests/field_browser.py` | 23 / 23 |
| Player 4: presets, transitions, presenter window, reduced motion | `python -B tests/player_browser.py` | 13 / 13 |

Total: **301 executed regression checks passed** (the Node suite was rerun after the intake guide added two checks; nothing it touches is used by the browser suites). Browser suites ran in Chromium
with external requests blocked; `tests/browser.py` also ran with the decks loaded
inline (`SLIDE_STUDIO_INLINE=1`). The PDF checks and the Python unit tests also passed
with the pinned `pypdf==5.9.0` from `requirements.txt` as well as with pypdf 6.17.0.
Negative fixtures pass only when the intended defect is rejected.

### Defects found by this verification, and fixed

- **CI never ran the native PPTX test.** The editable-PPTX test needs pptxgenjs, which
  CI did not install, so the Node 22 job had been failing since the structured route was
  rebuilt. CI now runs `npm ci`; elsewhere, a machine without the optional package
  reports that test as skipped with the reason, never as passed.
- **A delayed build cut short.** Under CPU load the Player 4 check for `data-delay`
  failed in 2 of 6 runs. A late `prefers-reduced-motion` change event — the previous
  check had switched reduced motion off — called `finish()` and settled the running
  build. The player now settles motion only when reduced motion is switched *on*. A new
  check switches it off and on around a running build: it fails 3 of 3 runs on the old
  code and passes on the new.
- **Unsearchable figures in a PDF.** Exporting the research example failed its
  postflight: 33 tick labels on the interactive page came out as private-use code
  points. The widget redraws its SVG when the page prints (`beforeprint` → `onExport`),
  after the text-layer fallback had rewritten the old elements. The fallback now also
  installs an `!important` sheet and rewrites elements added later. A new integrity
  check reproduces the redraw; it fails on the old code and passes on the new. The
  72-page template gallery, which had 3 such characters, now has none.

## Every library page, every build state

`qa.py --states all` (overflow, overlap, clipping, alt text, contrast, small text,
rendered integrity, copy gates) and `slop_check.py` (the machine-made look) over every
gallery page:

| Gallery | Pages | States | QA failures | Small-text warnings | Slop errors | Slop warnings |
|---|---:|---:|---:|---:|---:|---:|
| Charts & diagrams | 104 | 208 | 0 | 0 | 0 | 0 |
| Motion | 64 | 256 | 0 | 0 | 0 | 0 |
| Interactions | 24 | 48 | 0 | 0 | 0 | 0 |
| Compositions | 36 | 72 | 0 | 0 | 0 | 0 |
| Template packs | 72 | 148 | 0 | 0 | 0 | 0 |
| Example: research talk | 10 | 24 | 0 | 0 | 0 | 0 |
| Example: from a brief | 4 | 9 | 0 | 0 | 0 | 0 |
| Example: constraint layout | 3 | 6 | 0 | 0 | 0 | 2 |
| Example: ten languages | 10 | 20 | 0 | 0 | 0 | 0 |
| Example: images | 12 | 24 | 0 | 0 | 0 | 0 |
| Example: repair lab | 24 | 60 | 0 | 9 | 0 | 0 |
| Example: transfer talk | 3 | 6 | 0 | 0 | 0 | 0 |
| Example: period comparison | 1 | 2 | 0 | 0 | 0 | 0 |
| Example: brand proof | 6 | 12 | 0 | 0 | 0 | 0 |
| **All** | **373** | **895** | **0** | **9** | **0** | **2** |

The 9 small-text warnings are all on three *before* pages of the repair lab
(`proposal-scope`, `small-top-heavy`, `dense-reference`), which show that failure on
purpose; their *after* pages are clean. The two slop warnings on the constraint-layout
example are explained in its [README](examples/constraint-layout/README.md#review-notes).

Visual review: while the libraries were rebuilt, every page was rendered and reviewed on
contact sheets, with full-size frames wherever a page needed a closer look, and
redesigned where it looked machine-made — including after the owner rejected the first
template packs and the KPI tiles of the quarterly review. The final pass looked again at
pages with large empty areas: the research-summary interaction now draws its result and
its limits as interval charts; the quiz keeps its lower half free on purpose, because
the answer, the explanation figure and last year's answers appear there. This is the
author's own art direction, not an independent review.

## Determinism

The galleries, the 104 standalone SVGs and the CSS bundles (125 files) were rebuilt
with Node 20.20.2 (ICU 78.2) and Node 22.22.0 (ICU 77.1): byte-identical. CI rebuilds
them on Node 20 and 22 and fails on any difference from the committed files.

## Export

**PDF** (`export.py`, strict postflight: page count, text coverage, embedded fonts):

| Deck | Pages | Postflight | Non-embedded fonts | Text-layer fallback | Radicals rewritten |
|---|---:|---|---:|---|---:|
| research | 10 | passed | 0 | applied | 0 |
| period-comparison | 1 | passed | 0 | applied | 0 |
| transfer-talk | 3 | passed | 0 | applied | 0 |
| brand | 6 | passed | 0 | not needed | 0 |
| repair-lab | 24 | passed | 0 | applied | 0 |
| templates | 72 | passed | 0 | applied | 19 |

The text-layer fallback (alternate glyphs off, see the CHANGELOG) was needed wherever
Inter's tabular figures or contextual punctuation appear; the radicals rewrite turns
⽉/⻑-style code points back into 月/長 in the text layer.

**Native, editable PowerPoint** (`studio.mjs build` → `export-pptx.mjs --mode editable`),
opened and rendered by LibreOffice 24.2:

| Deck | Slides | Shapes | Text frames | Pictures | LibreOffice pages |
|---|---:|---:|---:|---:|---:|
| casual | 6 | 35 | 28 | 1 | 6 |
| editorial | 4 | 16 | 14 | 0 | 4 |
| executive | 8 | 107 | 75 | 0 | 8 |
| patterns | 25 | 370 | 253 | 1 | 25 |
| talk | 5 | 34 | 27 | 0 | 5 |
| technical | 5 | 34 | 25 | 0 | 5 |
| training | 4 | 37 | 28 | 0 | 4 |

The two pictures are the photographs on the `image` layout; every chart, table and
diagram is native shapes and text. **Picture PPTX** (`export.py deck.html deck.pptx`):
the 10-page research deck exported as 10 slides, each one full-page picture.

## Environment and reproduction

Linux 6.18 x86_64; Node 22.22.0 (and 20.20.2 for determinism); Python 3.13.16;
Playwright 1.57.0 with Chromium 141.0.7390.37 selected by `SLIDE_STUDIO_CHROMIUM`;
Pillow 12.3.0; python-pptx 1.0.2; pypdf 6.17.0 and 5.9.0; LibreOffice 24.2.7.2. Fonts:
Inter, Liberation, DejaVu, Caladea, IPA Gothic/PGothic, WenQuanYi Zen Hei and Noto
Sans/Serif CJK JP (installed for the field suite).

```sh
npm ci          # pptxgenjs for the native PPTX test; without it that test reports itself unrun
npm test
python -B -m unittest discover -s tests -p 'test_*.py'
python -B tests/integrity_browser.py
python -B tests/browser.py
python -B tests/navigation.py
python -B tests/rendered_review.py
python -B tests/field_browser.py
python -B tests/player_browser.py
npm run build:galleries && git diff --exit-code -- gallery/ assets/
python -B scripts/audit.py . --manifest
```

## Deliberate limits

- **No external-model generation.** Whether other agents produce better decks with this
  skill was not measured; no generation batch was run.
- **Fonts.** Only the Linux fonts above. Hiragino, Yu Gothic, Meiryo and the macOS or
  Windows system faces were not available, so line breaks and widths may differ on
  those machines — look at the deck on the machine that will present it.
- **Language.** Japanese copy was written and reviewed by the author (an AI model); no
  native speaker reviewed it. The other languages of the languages example likewise.
- **Software.** Chromium only. Safari, Firefox, PowerPoint itself and Keynote were not
  run; LibreOffice rendered the native PPTX files.
- **What the checks mean.** QA, `slop_check.py` and the browser suites find defects; they
  do not certify taste, truth, fluency or that a claim is supported. Widget tests
  exercise documented paths, not every combination of every control.

## Distribution

`MANIFEST.json` fingerprints every shipped file except itself; `audit.py --manifest`
passed (950 files, 0 issues, 0 warnings) and CI fails when the manifest is stale.
Generic media keep their recorded provenance. All organisations, people and numbers in
the examples are fictional.
