# A deck derived from a brief

Four pages that ask a (fictional) transit board to make a trial bus lane permanent. No
template, layout ID or pack was used: each page's form follows from the question the
board will ask, and every region is placed on a 12-column grid computed in `deck.mjs`.
The deck is the result; this README is the lesson — the four steps that produced it.
`deck.mjs` follows the same order, so you can read the two side by side.

```sh
node scripts/craft.mjs build examples/from-scratch/deck.mjs --out from-scratch.html --force
```

## 1 · Brief: who decides what, where, in how long

| Brief | What it decides for the deck |
|---|---|
| **Requester:** Dana Okafor, Director of Service Planning | Speaks for the transit agency; the deck asks, it does not explore |
| **Audience:** a seven-member board that knows Route 14 but not the trial data | No map, no route history; the data must explain itself |
| **Decision:** make the Harbour Street lane permanent and fund the works | Page 1 is the ask; the last page is what they approve |
| **Setting:** five minutes, projected, then filed with the minutes | Four pages; every number carries its source line |
| **Condition:** the board capped added car delay at 2 minutes at the peak | The board already wrote the test the deck must pass |

The brief is the `brief` object at the top of `deck.mjs`. Writing it down first is what
stops the deck from drifting into what the author finds interesting.

## 2 · Claims: one sentence per page, in order

Write the page titles as claims and read them aloud in sequence before drawing anything.

| Page | The board's question | Claim (computed in `claims`) |
|---|---|---|
| `ask` | What are you asking for? | Make the Harbour Street bus lane permanent |
| `buses` | Did it work, and was it the lane? | Route 14 crossed Harbour Street up to 4.6 minutes faster with the lane in force; outside lane hours nothing changed |
| `cars` | What did it cost drivers? | Car journeys slowed by at most 1.6 minutes at the peak, inside the 2-minute limit |
| `cost` | What do we approve, and by when? | $185,000; approved today, the lane opens on 6 April |

Every number in those sentences is computed from the data arrays (the largest saving
inside lane hours, the worst street, the summed costs), and `check(...)` throws if a
sentence stops being true — for example if a street goes over the limit.

**Cut on purpose:** an agenda (four pages need none), a corridor map (the board knows
the street), ridership growth (twelve weeks cannot show it), a "next steps" page (the
schedule on the last page is the next step).

## 3 · Evidence: the figure each claim needs

Choose the figure by the question, not by habit.

| Claim | The question is about… | Chosen | Rejected, and why |
|---|---|---|---|
| Buses faster | *when* the lane helps | Time-of-day line, 2025 against the trial, lane hours shaded, the 4.6-minute gap at 17:00 marked | One average bar: hides that the gain lives only in lane hours, which is the evidence that the lane caused it |
| Cars within limit | a cap on *change* | One bar per street with the board's limit as a reference line | Before/after dumbbells: show levels, but the test is about change; one average: hides the worst street |
| …and the balance | people, not vehicles | Two numbers in a rail: minutes saved by riders, minutes lost by people in cars | A second chart: the board needs two totals, not another axis |
| Cost and date | exact amounts and a deadline | A table that must add up, and the schedule on a true time scale | Cost shares as a donut: shares are not the question; a list of dates: hides that the works fill the window |

Build order follows the argument: page 2 shows 2025 first, then the trial line and its
gap (one click), because "the street jams twice a day" is what makes the gap mean
something.

## 4 · Composition: regions from a grid, not from a layout

`grid()` from `assets/runtime/kit.mjs` makes twelve 74 px columns with 24 px gutters
inside 64 px margins; `span(first, n, y, h)` returns the box over `n` columns, and
`position()` turns it into CSS. Each page then gets the regions its evidence needs:

| Page | Primary | Regions |
|---|---|---|
| `ask` | The ask, set as a statement | Title over 9 columns; lead and decision over 8; the empty right third is the pause before the evidence |
| `buses` | The line chart | All 12 columns: fifteen hours need the width |
| `cars` | The bar chart | Chart over 8 columns, rail over 4 for the two totals the board will weigh |
| `cost` | The cost table | Table over 6 columns, one column of air, schedule over 5 |

Held constant across pages: margins, the type scale (68 ask title · 38 claim · 26 lead ·
21 table · 18 labels · 15 source), the source line, and color meaning. One color system
(`cs-civic-calm`) is read from the repo at build time; the accent marks the one thing each
headline names — the 4.6-minute gap, the worst street, the opening date — and the
headline sets that phrase in the same color, so word and mark are visibly the same thing.

## Reusing the process

Copy the steps, not the pages. For a new brief: fill `brief`, write `claims` as sentences
over your data and read them in order, pick each figure by the question it answers, then
allocate columns by what is primary on that page. Build, look at every page and every
build, and fix the cause of what you see.

```sh
python3 scripts/contact-sheet.py from-scratch.html --out sheet.png --final --label
python3 scripts/qa.py from-scratch.html --out qa --states all
python3 scripts/slop_check.py from-scratch.html
```

Kestrel Bay Transit, Harbour Street, the people and all numbers are invented.
