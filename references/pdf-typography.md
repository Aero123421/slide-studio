# PDF typography: inspect the font that was actually used

Four different problems can look like a bad PDF font:

1. The source already contains the wrong word, script, date or character.
2. The requested family is absent and the browser substitutes a different face.
3. A hidden slide first needs a face during printing; export ran before it settled.
4. Glyph shaping, encoding, clipping or PDF rendering differs despite the intended face.

Inspect the HTML source and the actual PDF. Do not call every Type3 font broken, or
claim that a zero U+FFFD count proves the typography is correct.

## Establish fonts before composing

Choose actual families available in the export environment and appropriate to the
language/brand. Check the selected Latin, CJK, Arabic/Indic, math and symbol faces as
needed. `fc-match` returning a face is not proof it found the requested family: it
can return a fallback. Browser `document.fonts.check()` can also return true for a
missing requested family, and does not test individual glyph coverage.

Use `font_audit.py`, which queries Chromium's `CSS.getPlatformFontsForNode` for the
faces actually used for visible DOM text. Names in computed CSS are not this evidence.
The existing `fontcheck.py` can check character coverage of a known local font file.
Neither method is a native-language proofreading or shaping certificate.

## A project-local font contract

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

## Export guarantees and their limits

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

## Portability and rights

No font binaries are bundled in this OSS skill or its examples. These commands do
not download/install/embed standalone font files. The browser may embed/subset fonts
into PDF under the applicable font permissions. For a portable HTML font package,
use only separately authorized user/project assets and verify their redistribution
rights. A system-font HTML can render differently on another machine even when its
PDF is stable. Never promise exact cross-platform HTML typography without testing.

Primary technical references: [MDN FontFaceSet.check](https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/check),
[MDN Document.fonts](https://developer.mozilla.org/en-US/docs/Web/API/Document/fonts),
[Chrome DevTools CSS protocol](https://chromedevtools.github.io/devtools-protocol/tot/CSS/).
