# Visual design

Order of work: establish the explanation → choose the primary evidence → allocate
the canvas → build a skeleton with real text → apply type, color and imagery as a
system → look at the result and repair causes.

## 1. Start from the explanation, not a layout

Write the page's claim and scope in one plain sentence. Name the relationship it
shows: comparison, change, ranking, part-to-whole, distribution, uncertainty,
association, sequence, flow, mechanism, hierarchy, containment, spatial detail,
or a single statement. Then name the reading operation the audience performs:
compare positions on one axis, follow a path, find a part, scan rows, read a
hierarchy, step through states, or connect an observation to its limit.

Choose the primary medium from that: a chart, a diagram, a photograph, a table,
or one sentence. A diagram is not automatically appropriate; the original image,
a table or a short statement may be the best evidence. Ask: *would this page work
as black type and lines?* If not, color and motion will not rescue it.

## 2. The page grammar

`assets/runtime/study-frame.css` (copied to `theme.css` by `craft.mjs init`) is a
small vocabulary for the 1280×720 canvas. Use it as a starting system, extend it,
or replace it — but keep its proportions in mind:

| Role | Class | Size / place |
|---|---|---|
| Claim | `st-head` | 36–40 px display face, top-left at 64/48, ≤ 2 lines, `<em>` for the one accented phrase |
| Condition | `st-dek` | 20 px muted, one line under the claim |
| Evidence | `st-fig` | 1152 × ~470 region (64 px side margins, top 176, bottom 62) |
| Commentary rail | `st-rail` with `st--rail` / `st--left` | 312 px column; figure narrows to ~800 px |
| Finding blocks | `st-kpi` (number + sentence), `st-text` | 54 px number, 18–19 px text |
| Hero number | `st-num` | 128 px, units in `<small>` |
| Provenance | `st-source` | 15 px muted, bottom 22 px; left = source, right = method |
| Full bleed | `st--full` | figure fills the slide; type sits on a calm field |

Composition patterns worth reaching for (choose by content, vary by need):

- **Claim + full-width evidence** — most data pages. The figure is the page.
- **Evidence + rail** — when two or three findings need words: one number per
  block, separated by a rule, never a stack of cards.
- **Big number + small proof** — one quantity that matters, with the chart that
  qualifies it.
- **Registered pair / small multiples** — comparisons on identical scales.
- **Annotated image** — a photograph or drawing with leader-line labels in a rail.
- **Statement page** — one sentence, generous space, maybe a texture field.
- **Dense reference plate** — tables and fine labels for reading, not projection.

## 3. Space is allocated, not left over

1. **Identify the optical primary** — what must be read first? Size it first.
2. **Reserve the frame** — margins (64 px sides is a good default), the claim
   block, the source line. Nothing else gets reserved by habit.
3. **Allocate by relationship** — put interpretation next to its evidence; equal
   widths only when the comparison needs them.
4. **Measure, then draw** — measure the longest label, headline and row in the
   intended font. Draw figures at the size they are shown (`width`/`height` of the
   region) so labels render at true size.
5. **Balance optical weight** — dense type, dark marks and photographs weigh more
   than outlines at equal area. Align visible edges and baselines.
6. **Explain every large gap** — a pause, a separation, negative space for a photo,
   an axis range, room for the next build. If it has no job, enlarge or move the
   primary, or recompose. Never fill it with icons or blobs.
7. **Stress it** — longest heading, real labels, final build, the other language.

A useful calculation, not a rule: 1152 px of usable width minus a 48 px gap split
3 : 1 gives 828 px of evidence and 276 px of explanation. If the explanation
wraps into ten lines, change the thought or the composition.

| Symptom | Check first | Repair |
|---|---|---|
| Small figure floating in a large empty page | Figure drawn smaller than its region; huge viewBox padding | Draw at region size; remove padding; enlarge |
| Title and figure feel unrelated | Gap larger than either block; headline doesn't name the evidence | Tighten, rewrite the claim to point at the figure |
| Everything equally loud | Equal sizes and weights; several accents | Pick one primary; one accent; demote the rest |
| Labels collide | Labels added after geometry | Reserve a label rail; wrap; spread labels; widen the figure |
| Lone last word in a headline | Width forces an orphan | Rewrite, or `text-wrap: balance`; never shrink the deck |
| Crowded only after a build | Final build never reviewed | Review every build (`contact-sheet.py --steps`) |
| Page feels sterile | No argument, or a generic stand-in figure | Improve the explanation, not the decoration |

Mark structure for the QA report with `data-region="title|primary|support|source"`
and, for an intentionally quiet primary, a short `data-space-intent`. They are
invisible metadata, not captions. Waive a deliberate overlap or bleed only on the
specific element: `data-qa-overlap="reason"` / `data-qa-overflow="reason"`.

## 4. Typography

At 1280×720: headline 36–44 px (statement pages up to 64+), body 20–24 px, labels
16–18 px, sources 15 px. Live projection needs ≥ 18 px for anything the audience
must read; a reference plate may go to 15 px. Use real weights (no faux bold), a
display face for claims and a text face for everything else, tabular figures for
numbers in tables and axes — on the numeric cells only: Inter's `tnum` also widens
hyphens and dashes in running text ("Pre - heat").

Line height: display 1.1–1.2 in Latin scripts, 1.3–1.4 in CJK; body 1.45–1.6
(CJK 1.6–1.75). No negative tracking in CJK. Letterspacing is for small caps and
short labels, never simulated with spaces.

**Languages.** Set `deck.language` (BCP 47) and per-slide `language` for
mixed decks; `direction:'rtl'` where needed. Japanese: natural phrasing, no
English eyebrows, break between phrases (the figure engine wraps CJK by phrase
and applies kinsoku), never split a number from its unit; full-width punctuation.
In HTML, `word-break: auto-phrase` (set by the page grammar) breaks Japanese
between phrases in Chromium only; Safari ignores it, so put `<br>` (or `<wbr>` with
`word-break: keep-all`) at the phrase boundary of each headline and move it when the
headline changes. Latin glyphs come first in a Japanese stack (`"Inter", …, "Hiragino
Sans", …`): a Japanese font sets Latin digits in its own, often monospaced, forms.
Chinese: choose the script and regional forms. Korean: check word wrapping.
Arabic/Hebrew: logical properties, `dir` on mixed runs, `<bdi>` for codes and
numbers; mirror reading flow, not charts or physical objects. Devanagari and other
combining scripts: never reveal letter by letter. Expansion-prone languages need
wider budgets — translate the argument, then recompose; don't shrink English
coordinates to fit. Format numbers with the target locale (`fmt(v, {locale})`).

**Fonts.** No font files ship with the skill. Use stacks with verified coverage
(the color systems include Japanese fallbacks). Check actual glyphs and, for PDF,
the actual embedded faces (see [Verification](verification-and-delivery.md)).
`fontcheck.py FONT --text "…"` checks a specific font file's coverage.
Rendered previews show the fonts of the machine that rendered them: a Linux
container without Charter, Georgia or Hiragino falls back (the stacks end in Caladea
and IPAPGothic), so judge spacing, not letterforms, from such frames. Chromium ignores
Type 1 (`.pfb`) fonts even when `fc-list` shows them.
Equations: write MathML and keep `<math>` inline inside a block wrapper; `display:
block` on `<math>` only lays out when its content is a single `<mrow>`.

## 5. Color with stable meaning

Name roles before picking swatches: paper, surface, ink, muted ink, rule, accent,
positive, negative, highlight, context, categorical, sequential, diverging.

**Role-based color systems.** `assets/color-systems/<id>.json` defines 37 systems
by role, with data palettes (3–6 categorical colors ordered by use, sequential and
diverging ramps, highlight and context), font stacks with Japanese fallbacks, area
ratios, usage rules, and `useFor`/`avoidFor`. `color-systems.css` exposes each as
a class: put `cs-<id>` on a slide and use `var(--ss-ink)`, `var(--ss-accent)` …;
the figure engine reads the same tokens. A supplied brand overrides all of them.

```sh
node scripts/color-systems.mjs validate                    # contrast + color-vision checks
node scripts/color-systems.mjs specimen out.html my.json   # preview your own system
python scripts/slop_check.py deck.html --palette assets/color-systems/laboratory.json
```

Discipline that reads as designed: one hue family dominates; the accent is scarce
and means "this"; everything not under discussion takes the context color;
identity colors (a product, a team) belong to that entity only; positive/negative
always carry a sign or a word too; red-versus-green is never the only difference.
Sequential = ordered magnitude; diverging = deviation from a stated reference;
categorical = unordered categories. WCAG AA (4.5 : 1 text, 3 : 1 large text) is a
floor — projection usually needs more. Sample real pixels for text over images
and gradients. Never "improve" a supplied brand color without permission.

## 6. Images, illustration and texture

Name the image's job: evidence, the subject itself, context, a spatial reference,
a metaphor, atmosphere, a pause. Use the user's real product/experiment images
when claims are about them; never imply a stock photo documents their team or
result. Record source, author, license and modifications.

Placement: **contain** for instruments, maps, screenshots and figures (never crop
axes, scale bars or labels); **cover** with a protected focal point; **bleed** with
a deliberate text anchor; **registered pair** with identical crop and scale;
**detail inset** linked to its location in the full view. Inspect the original
and the final crop — the subject promised by the headline must still be visible.
Put text on genuine negative space or a separate field; a uniform dark wash is not
a legibility guarantee.

Scientific images keep orientation, scale bars and acquisition context; declare
crops, color maps and contrast changes; compare panels under identical transforms.
Illustrations should expose a mechanism with a consistent stroke and light
vocabulary, not act as clip art. Generative textures (`fig-patterns.mjs`) give a
deck identity on covers, dividers and statement pages; keep them away from
evidence and never let them imitate data.

## 7. Cohesion across the deck

Hold a few things constant — type roles, margins, color meanings, annotation
style, stroke weights. Vary density, primary medium and composition when the
argument changes. Repeated structure is right for repeated comparisons; random
variation is not originality. Review a contact sheet for rhythm: identical
skeletons on every page, sudden dark/light alternation, pages that are mostly
empty, pages that are all text.

Critique with actionable answers: *What do I see first?* (name the object).
*What can go without losing meaning?* (chrome, not caveats). *What causes the
crowding?* (name the competing regions). *What is generic?* (a phrase or motif
that would fit any deck — replace it with something specific to this content).

## 8. Identity without ornament

A deck looks designed when its decisions are visible and consistent: a grid, a type
scale with real contrast, one accent that means something, generous space, evidence
drawn at full size. It looks machine-made when decoration stands in for those
decisions — the dot grid, the glow, the gradient headline, the row of icon cards,
the KPI tiles with colored pills, the letter-spaced eyebrow over every title. The
full list, with what to do instead, is in SKILL.md ("Strip the machine-made look");
`slop_check.py` flags most of it in the rendered HTML.

Identity comes from things that carry meaning:

- **Type and scale contrast.** One family (or a serif/sans pair) used with
  conviction: a 120 px figure beside 20 px prose says more than any frame.
- **A grid with a point of view.** An asymmetric column, a fixed margin, a baseline
  that every page respects.
- **One color that means "this"**, used on the thing each page is about.
- **The subject's own imagery**: the product, the instrument, the site, the
  specimen — photographed or drawn precisely.
- **Graphics derived from the content**: a cross-section, a map, proportional
  geometry, the same time axis reused across pages.
- **Plain, specific words.** A headline that could only belong to this deck.

Test: cover the logo and the headline. If the page could belong to any company's
deck, it has no identity yet — and adding ornament will not give it one.
