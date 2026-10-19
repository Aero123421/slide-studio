# A complete research narrative

A ten-page conference talk about one fictional diagnostic-accuracy study: Northmoor
Water's night-noise leak score, checked against blind acoustic surveys at the 64 sites it
flagged in Eastfield in March 2026. Crews dig when the score reaches 0.50; the talk asks
whether that is the right line and what it would take to move it.

```sh
node scripts/craft.mjs build examples/research/deck.mjs --out research.html --force
```

## What it demonstrates

**The research route** from `references/authoring.md`, one claim per page:

| Page | Job | Evidence |
|---|---|---|
| `question` | The question, and the line it is about | Title; the 64 study scores as a rug with today's 0.50 |
| `stakes` | Why it matters: records see dry digs, never missed leaks | 2025 alerts by score band; undug bands drawn as unknown |
| `data` | How every site got its reference label | Study flow (STARD style) and the 22 / 42 split |
| `method` | The decision rule applied to the observations | Strip plot by label; the rule arrives as build 1 |
| `result` | The result with its uncertainty | Four rates with Wilson 95% intervals; job records as a check |
| `explore` | The trade-off, explored live | The `threshold` widget fed the same 64 scores, with a 2 × 2 readout |
| `compare` | The same trade-off, static | Table of six thresholds (the PDF keeps the argument) |
| `value` | What the trade-off is worth | Cost curves for three prices of a missed leak; minima revealed one per build |
| `limits` | Why this study cannot set the threshold | Three limits, each led by the number that sets its size |
| `next` | What the next study must decide | Threshold swing, precision curve, sampling plan |

**One source of truth.** `data.json` holds the study (64 sites: score, survey finding,
excavation, reference label, leak flow) and the 2025 job records. Every number on every
page — headlines, rails, tables, figure marks, the widget's data — is computed from it in
`deck.mjs`. Counts at a threshold use the engine's `confusionAt`, the same rule
(`score ≥ threshold`) as the widget, so the static pages and the live readout agree.

**Claims as checked code.** Sentences whose wording depends on a pattern in the data
("each 0.05 step between 0.30 and 0.60 adds one leak", "the best threshold falls as a miss
gets dearer") are guarded by `claim(...)`. Change the data so a sentence stops being true
and the build fails with the sentence to rewrite, instead of shipping a stale headline.

**Uncertainty on the page, not in the notes.** Rates carry Wilson 95% intervals; the
interval method, the sample sizes and the reference standard are in the source lines.
The planning numbers on the last page (66 leaks, about 190 sites) use the same interval.

**One interaction, honestly integrated.** The `explore` page uses the stock
`threshold` widget (`assets/runtime/widgets.js`) with `data: { values, labels }` from the
same arrays as the static pages. The page only places and tunes it:
- it maps the widget's two dot colors to the deck's roles (`--ss-cat-1` → context grey,
  `--ss-cat-2` → accent) on the widget root;
- an overlay labels the widget's score axis in the widget's own 700 × 360 coordinates
  (scores at `x = 55 + 610·score`), and one CSS rule hides its unlabelled vertical axis;
- a short deck `script` mirrors the widget's `data-state` (threshold and counts) into
  a 2 × 2 readout in the audience's words; the widget's TP/FP/FN/TN status stays for
  screen readers.
The static export shows the selected state (0.50) and the `compare` page carries the
other thresholds, so nothing essential lives only in the interaction.

**One visual system.** `study-frame.css` plus the `cs-laboratory` block are read from
the repo at build time, as `craft.mjs init` does; the deck adds one commented CSS block
(Charter for claims, Inter for everything else, a 12-column grid). Accent marks the one
thing each headline names; everything else is ink, muted or context grey.

## Adapting it

1. Replace `data.json` with your study. Keep the field meanings (score 0–1, binary
   reference label) or change the figure code that reads them.
2. Rebuild. Any `claim` that fails names the sentence to rewrite; rewrite it from the
   new numbers rather than deleting the check.
3. Check the six thresholds on `compare` and the three prices on `value` still make the
   point; they are lists at the top of the computation section.
4. Look at every page and every build (`contact-sheet.py --final` and `--steps`).

All organisations, people, places and numbers are invented. The data were designed to
illustrate the method and are not evidence about any real detector or utility.
