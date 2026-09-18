# Slide Studio 3.4.0 — observed verification

Recorded 2026-09-07. This record covers the changed skill and implementation, not a
claim that every agent now produces better slides. The original 3.3.0 archive remains
the record of its own historical verification. Current machine-readable results are
in [tests/release-results.json](tests/release-results.json).

## Executed regression suites

| Suite | Result |
|---|---:|
| Node: existing source/runtime tests plus CSS preflight | 69 / 69 passed |
| Python: existing safety/brand/evidence plus source-table and final-review tests | 53 / 53 passed |
| Rendered integrity and full QA/final-review integration | 26 / 26 passed |
| Existing widgets, media, mesh, motion and browser behavior | 35 / 35 passed |
| Keyboard, focused controls, IME, reverse/rapid input and print lifecycle | 20 / 20 passed |
| Rendered copy channels and space diagnostics | 5 / 5 passed |

Total: **208 executed regression checks passed**. This count excludes the private
field pages, packaging checks and any unrun suite. Negative fixtures pass only when
the intended defect is rejected. Valid nesting, quoted/escaped CSS, gradient text,
wide-gamut marks, outline-only marks, zero marks, quiet pages and intentional crops
are positive controls against over-broad rejection.

New browser checks exercise inherited pale-on-pale text, unpainted bars, computed
grid expectations, a removed focal subject, an image reposition/contain repair and
text hidden behind another element. Full command tests confirm that broken CSS and
severe contrast affect QA's failure status, linked CSS/images are fingerprinted, and
an unchanged HTML with changed CSS fails the final-review gate.

Source-table checks cover mixed columns, changed order/missing rows, units, labels,
protocols and source versions. They explicitly demonstrate a limit: consistently
mistranscribing both source and display can pass. Human/vision source inspection is
still required. The final-review gate checks supplied evidence consistency, not its
authenticity or the truth of a claimed manual review.

## Read-only field recheck

The new diagnostics were applied to **17 existing decks / 227 final live pages**.
Original task HTML, sources and logs were not modified. Observed findings included:

- One incomplete CSS block affecting many later declarations.
- Ten severely low-contrast text runs on one pale-card page.
- Six unpainted bar warnings across two quantitative pages.
- Heavy image crops and text/image stacking warnings on a history deck.
- Two mismatches between final HTML and the saved QA input, rejected by the new gate.

Six selected pages were viewed at readable size to check findings and positive
controls. Two selected decks also went through the complete QA command and rejected
the known CSS/contrast defects. This was not a new all-page manual content review,
not custom-widget branch enumeration, and not a new generation batch. The earlier
field review informed the instructions; its private prompts, logs, images and source
files are excluded from this distribution.

## Environment and reproduction

macOS 26.6.2 arm64; Node 22.23.1; Python 3.12.14; Playwright Python 1.57.0;
Chromium 151.0.7922.34; Pillow 12.3.0; python-pptx 1.0.2; pypdf 5.9.0.
The Python dependencies match `requirements.txt`. An existing Chromium executable
was selected with `SLIDE_STUDIO_CHROMIUM`; this is not a test of Playwright's bundled
Chromium 144. Initial development also exercised Playwright 1.62.0 with Chromium 151.
Browser tests blocked external requests. Both file-URL loads and explicitly inline
self-contained fixtures were exercised.

```sh
node --test tests/*.test.mjs
python -B -m unittest discover -s tests -p 'test_*.py'
python -B tests/integrity_browser.py
python -B tests/browser.py
python -B tests/navigation.py
python -B tests/rendered_review.py
python -B scripts/audit.py .
```

On macOS the safety tests used `TMPDIR=/private/tmp` because the default temporary
path traverses the system `/var` symlink. This preserves the review workspace's
intentional no-symlink rule. Dependencies stayed in a separate local test environment,
not inside the skill. No global font or application installation was performed.

## Deliberate limits

The CSS preflight is structural, not a full parser. Contrast measures supported solid
backgrounds; images, SVG text and complex compositing are unmeasured, not approved.
Focus checks need an independently selected region and supported object-fit geometry.
Paint checks cannot establish the truth or quantitative scale of a mark.

The existing galleries were rebuilt from their unchanged designs. No new full-size
manual review of all 295 workshop pages or all animation intermediates is claimed.
The PDF/PPTX/font implementations were retained. The 23-case CJK field/font suite,
strict-font PDF export, native Office export/template rendering, other browsers/OSes
and external-model regeneration were **not rerun for this release**. Their 3.3.0
results must not be read as newly executed 3.4.0 results.

## Distribution

`MANIFEST.json` fingerprints shipped files except itself. The archive is re-extracted
to a clean directory for manifest validation, skill validation and an independent-path
build/QA/final-review smoke test. The ZIP contains no dependency folders, font binaries,
user task data, raw agent logs, review caches or private screenshots. Generic library
media retain their existing provenance. A separate checksum identifies the ZIP.
