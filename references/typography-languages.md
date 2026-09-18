# Typography across languages

For a PDF complaint, distinguish source text, substituted family, print-state loading and PDF encoding using [PDF typography](pdf-typography.md). A font readiness check alone is insufficient.

Typography is a semantic and spatial system, not choosing a fashionable font name.
Define heading, body, chart label, caption, control and code roles independently.
Use available fonts with verified coverage. **No font binaries are bundled.**
Users obtain fonts through their own approved channels and licenses.

## Readability versus density

At a 1280×720 reference canvas, 44–76 px headings, 24–34 px prose and 18–24 px chart
labels are useful starting ranges, not universal rules. A research plate can use
smaller labels for near-screen reading, but a live projection requires a different
content budget. State the intended viewing condition and inspect at that scale.

Set line height for the script and role. Tight display typography is not a model for
Arabic, Devanagari or CJK body text. Use real font weights, avoid fake bold when it
changes the appearance, and do not assume equal metrics between fallback fonts.
Test `document.fonts.ready` and inspect actual glyphs; a font family name is not proof
that the font was installed or contains the characters.

## Language is not only translated wording

Set `deck.language` with a BCP 47 tag. Set `direction:'rtl'` for the presentation when
appropriate; individual slides may have their own `language` and `direction`.
Use `lang` and `dir` on mixed-language regions. The player has 12 localized label
sets and accepts `deck.labels` overrides for others. Widget text is authored content:
the 24 teaching widgets use English labels by default and must be localized when
reused. Do not claim that player localization translates a deck.

For Japanese, use natural phrasing, appropriate line breaks and punctuation. Avoid
isolated closing punctuation at line start; do not force a break between a number
and its unit. For Chinese, select the intended script and regional glyph forms. For
Korean, check word and syllable wrapping instead of assuming Japanese rules.

For Arabic and other RTL scripts, preserve shaping and joining; avoid artificial
letterspacing. Use logical properties (`margin-inline-start`, `inset-inline-end`,
`text-align:start`). Mirror reading flow where appropriate, not numerical charts,
scientific axes or the inherent direction of a physical object. Use `<bdi>` or
`dir="ltr"` for identifiers, code, units or URLs inside RTL prose. Never reverse
strings programmatically to “support RTL”. See the W3C source in `sources.md`.

For Devanagari and other combining scripts, do not split grapheme clusters. Avoid
letter-by-letter text animation that separates combining marks. Reveal phrases,
lines or whole labels instead. Cursive fonts and ligatures need the same care.

German and other expansion-prone translations need wider text budgets. Numbers,
dates, decimal punctuation, percentage spacing and minus signs should use the target
locale where appropriate. `Intl.NumberFormat` is preferable to concatenating strings.
Quoted source terminology may remain in the original language with an explanation.

## Localizing a designed page

Translate the argument, then recompose. Do not freeze English coordinates and shrink
translated text until it fits. Re-evaluate heading breaks, reading order, image/text
balance, figure widths and footnote space. Test roughly 40% expansion as an engineering
stress fixture, not a claim about every language. Also test a long unbreakable token,
an empty optional label and mixed numeral systems.

The language gallery contains typography fixtures, not certified translations.
Native-language editorial review is still necessary for high-visibility publication.
Use `python scripts/fontcheck.py PATH_TO_APPROVED_FONT --text "Text to check"`
for an explicit font's cmap coverage (optional fontTools dependency). Choose `--index`
for a font collection. This does not inspect installed families, install fonts, or
certify shaping/ligatures. Inspect actual rendered output as well. Never bundle font
binaries merely because a font was available on the development machine.
