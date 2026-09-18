# Density is chosen for the reading task

A slide can be simultaneously crowded and mostly empty: small type and several
panels occupy the top half while the lower half does no work. "Remove information"
or "add whitespace" are not adequate diagnoses.

## Choose a reading mode before layout

Set `readingMode` on the deck, with an optional slide override:

| Mode | Job | Consequence |
|---|---|---|
| `live` | Listened to and glanced at during speech | Make the evidence and main statement readable at distance. Optional speech goes in notes. |
| `read` | Read independently | Preserve the explanation and necessary conditions; use prose at a comfortable line width. |
| `reference` | Compared/looked up carefully | A dense aligned table can be the right design. Keep all fields needed for comparison. |
| `hybrid` | Presented and later read | Prefer a live main sequence plus a clearly organized detail appendix or companion version. Do not make every page a compromise. |

There is no universal number of words, cards, facts, colors or slides. Five essential
comparison columns may be better than five vague summary cards. A quiet image page
need not fill the canvas. Necessary scientific caveats must not be hidden in tiny type.

## A constructive allocation routine

1. Name the primary: finding, image, relationship, comparison or table. A headline is
   not always the largest element. Reserve the region the primary actually needs.
2. Measure longest real labels and the body block in the chosen fonts. Keep enough
   space for the final animation state and controls. Remove empty SVG viewBox padding.
3. Attach explanation to its evidence. A sidebar beside a small figure does not become
   better because both are inside matching cards. Prefer one alignment anchor and a
   deliberate gap over a stack of independent wrappers.
4. Compare optical masses: texture, dark marks, type and negative space. A wrapper
   rectangle is not the actual visual size of its contents.
5. Inspect the whole page. If the body is tiny with a large unused lower region, expand
   the evidence/body region or move the support rail before deleting real information.
6. Remove duplicated interpretation, not raw evidence needed for judgment. Separate
   independent questions; do not split a comparison so that the reader must remember
   one half from the previous page.
7. Check the real output scale. As an initial design hypothesis on a 1280-wide live
   canvas, body text around 26–32px may be appropriate; this is not a guarantee for a
   room, screen, font or audience. Smaller reference text can be intentional. Test the
   actual viewing condition where possible and state when it was not tested.

## Useful and misleading ways to make room

Useful: one short title; a large paired plot; directly named series; a full-width table;
caption beside the relevant mark; notes for optional examples; a detail page for a
separate question; extending the actual diagram rather than its empty outer SVG.

Misleading: shrinking everything; removing "estimated" from a title; unexplained
abbreviations; hiding a key axis; putting one fact into heading, subtitle and footer;
adding an icon to every label; using a large callout container around very small text.

## Deck rhythm, not random variety

View the sequence at contact-sheet scale. Look for repeated **unnecessary** structures:
eyebrow + claim + subclaim + three cards + conclusion strip on every page. Reuse a
structure when the reader compares equivalent things or learns a recurring procedure.
Change the primary medium or reading path when the explanation requires it, not to
meet a variation quota. Approved company identity stays stable across these choices.

## Read the diagnostics correctly

`qa.py` reports body-size hints for the declared mode, high-positioned small text,
heading line patterns, text behind overflow clips, SVG bounds and coarse blank areas.
These hints are not an optimization target or a beauty score. Decorative backgrounds
can game occupancy; a large container can hide a small drawing. Read the screenshot.

If an intentional reveal clips text, inspect its initial/mid/final states and add a
narrow `data-qa-text-clip` annotation with its reason only after verifying it. Never
wrap the entire deck in a waiver to silence genuine truncation.
