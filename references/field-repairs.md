# Field repair cases — learn the operation, not the wording

The following are newly written synthetic fixtures. They are not a user's business
records, a model leaderboard, or evidence that a new model run has already improved.
The corresponding `gallery/repair-lab.html` is a workshop, not a deck to submit unchanged.

| Failure | Repair operation | What must remain |
|---|---|---|
| A change from 500 to 650 is called "+30 currency units" | Compute amount and relative change separately; bind title and chart to the same values | +150 amount; +30%, unit, period, source |
| Paired plot uses before−after, summary uses after−before | Choose one subtraction order and regenerate both | Outlier, missing pair count, correct sample SD |
| A line crosses a missing measurement without distinction | Break it or explicitly encode an analytically justified interpolation | Known observations; missing is not zero |
| Alternatives are arranged A → B → C | Draw conditional branches from the shared source | Conditions, endpoints, outcome exclusivity |
| A colored legend describes black marks | Bind series labels and mark fills to one encoding map | Readability without color alone |
| A sweeping title is qualified only in a small footnote | Put proposed/estimated/scope beside the claim itself | Conditions and useful specificity |
| A factual explanation becomes a slogan | Write the direct observation first; make a stylistic choice only after meaning works | Audience-appropriate voice; no invented contrast |
| Tiny text and three panels occupy the top half | Allocate real evidence/body area first; remove duplicate containers | Necessary detail, legible labels, purposeful negative space |
| A real comparison is split to meet a brevity quota | Keep a readable aligned table; move only separate optional discussion | Same units, periods, rows, missing/unknown entries |
| Every image sits in a tiny rounded card | Match frame/crop to the subject and its annotation | Evidence integrity, rights, actual focal point |
| A source word changes scripts unexpectedly | Fix or verify the source; then check the rendered font | Intentional names and multilingual quotations |
| A page includes "PDF keeps this view" | Show the selected condition; move export behavior into a runbook | Static meaning; visible assumptions |

## Worked copy choices

**Business explanation**

Weak: 「安さの正体が違う。選ぶのは、未来の使い方です。」

Better when the source supports it: 「初期費用はA案、3年間の総額はB案が低い。」

Then show the actual costs and excluded items. This is not an invitation to invent A/B
advantages. Without comparable costs, say what information is still missing.

**Scientific result**

Weak: 「小さな差が、大きな可能性を開く。」

Better for a synthetic paired study: 「5試料中4試料で、条件Bの温度が低い。」

Do not replace it with "effective" or "significant" unless the analysis supports it.
The natural title may be shorter if the plot already carries the count and scope.

**A visual essay**

A poetic opening is not automatically a defect. A later page should point to the
actual image: "The shadow ends at this edge" is more useful than repeating "light
reveals a new world" over every photograph. Use an annotation, not just an adjective.

**Public instruction**

Weak: "Unlock your smooth journey in three effortless steps."

Better: "Keep the ticket until you leave the final gate."

Directness serves the task. A brief friendly sentence can remain; avoid infantilizing
adults or turning every instruction into a marketing promise.

## Transfer, not imitation

For a new subject, state the invariant, change the content/medium/geometry, and test
the longest real label, an unfavorable value and the static state. Do not copy the
sample's headline, palette, card count or fictional data. The benchmark tasks in
`tests/transfer-evals.json` include dense, expressive and quiet cases so the skill
cannot "pass" merely by making all output minimal and identical.
