# Geometry from constraints

The chain of custody for a blood specimen in a (fictional) clinical trial, drawn three
times: a summary for the steering committee, the full procedure for the central lab, and
the same procedure in Japanese for the site staff. The steps and the hand-offs between
them never change; only the labels do. No coordinate is typed in: every layout is
computed from the measured labels, so longer text reflows into another arrangement
instead of overflowing, shrinking or detaching an arrow.

```sh
node scripts/craft.mjs build examples/constraint-layout/deck.mjs --out constraint-layout.html --force
```

## What reflows, and why

| Page | Labels | Arrangements tried (recorded by `arrange`) |
|---|---|---|
| `summary` | step + holder | 1 row × 7 columns at 137 px: fits, 166 of 300 px |
| `procedure` | step + holder + procedure text | 1 × 7: the draw text needs 7 lines (max 4) → 2 rows × 4 columns at 264 px: fits, 485 of 490 px |
| `procedure-ja` | the same in Japanese | 1 × 7: 5 lines (max 4) → 2 × 4 at 264 px: fits, 524 of 532 px |

The chosen line is written on each figure as `data-layout="…"`. Across all three pages the
node ids, the `flow` list, every edge's direction, the gate (`Check on arrival`) and the
exception branch (`Quarantine`, dashed) stay the same; the column count, the rows, the
box heights and the connector routes are recomputed.

## The derivation, step by step (`deck.mjs`)

1. **Layers from dependencies.** `dagLayers` (`assets/runtime/layout.mjs`) orders the
   steps from the `flow` edges and throws on a cycle. Its boxes are not used: real sizes
   come from text.
2. **Measure.** For a candidate column width, `wrapText` (`wrapBalanced` for titles) and
   `measureText` from the figure engine wrap and measure every field. Three constraints
   decide whether the text fits: no word wider than the column; at most 2 lines of title,
   2 of holder and 4 of procedure text (`MAX_LINES`, a readable measure is a constraint
   too); and the total height within the region.
3. **Arrange.** Try one row first, then two rows. A row may end only where a single step
   hands to a single step (`ship` → `receive` here), so the wrap connector runs from one
   box to one box and never into a stack. The first arrangement without a problem wins;
   if none fits, `arrange` throws with the record above.
4. **Place.** `allocate` (layout.mjs) gives each row a height in proportion to what it must
   hold; `grid` (`assets/runtime/kit.mjs`) cuts each row into equal columns. Single steps in
   a row share one height; the `Store`/`Quarantine` stack is centred in its cell.
5. **Connect.** `port` and `connector` (kit.mjs) join boxes in a row: right port to left
   port, the elbow in the empty column gap. Across rows the midpoint elbow is not safe —
   in the first draft it cut straight through the taller `Store` box — so cross-row edges
   use `routeOrthogonal` (layout.mjs), which keeps 14 px clear of every other box or throws.

The figure is one SVG on the full 1280 × 720 canvas, so its boxes share the page's
coordinates and margins.

## When the text does not fit

Read the record, then recompose; never shrink type to make a fit. The Japanese page shows
one remedy: its labels need taller lines (1.6 leading), so the headline is one line and the
figure uses the grammar's tall band (top 132 px) — more room, same type sizes. Other
remedies: shorten a label, allow a third row, or split the procedure over two pages.

## Adapting it

Replace `steps` (each with `title`, `holder`, `detail` per language) and `flow`. Mark the
one decision step `gate: true` and any exception path `exception: true`. Adjust `TYPE`,
`MAX_LINES` and `GAP` only for a reason you can name. Rebuild, then look at every page:
measured widths are estimates from Helvetica-class metrics, and QA (`qa.py`) checks the
glyphs the browser actually drew.

Japanese text uses the stack Hiragino Sans → Noto Sans JP → Yu Gothic → Meiryo →
IPAPGothic; on machines without a bold Japanese face the titles are synthesised bold.
Trial NK-301, its laboratory manual and the procedure are invented.
