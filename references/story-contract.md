# Story and evidence contract

`story.json` is the smallest useful source of truth for a substantial deck. It is
not a rigid script or slide schema. The included `editorial.py` checks field
relationships and obvious editorial hazards; it cannot establish truth.

```json
{
  "language": "en",
  "audience": "Researchers who know the method but not this experiment",
  "outcome": "Understand the measured difference and its limitations",
  "sources": [{"id":"data-1","locator":"data/results.csv","kind":"supplied-data"}],
  "slides": [{
    "id":"result",
    "job":"Compare the two conditions on the same scale",
    "title":"The paired measurements differ by 3 units in this sample",
    "claim":"The observed paired difference in this sample is 3 units.",
    "status":"observed",
    "evidence":["data-1"],
    "visual":"Paired dots with an interval; same units and baseline",
    "scope":"This sample and protocol, not a population-wide guarantee",
    "static":"Keep both conditions, interval definition, and source label"
  }]
}
```

The numbers above illustrate the file format; they are not a claim to reuse.
Allowed status: `observed`, `reported`, `inferred`, `proposed`, `illustrative`,
`unknown`. An inference needs the supporting evidence and a statement of the
inference. An illustrative diagram may carry no evidence IDs but must be labeled.
An unknown may be a question, never a decorative assertion.

“Source” may be an uploaded page, spreadsheet range, measurement file, interview
record or public primary source. Record page/section/cell/version where available.
Copy exact quotes only when justified; preserve meaning when paraphrasing. Record
units, denominator, sample size, uncertainty definition and date in the data record.

## Narrative routes, not standard outlines

Research: question → method and scope → observations → comparison → interpretation
→ limits → next falsifiable test. Education: existing mental model → conflict →
mechanism → worked example → transfer check. Product explanation: task → artifact
→ operation → boundary/failure → evidence → appropriate next action. Review:
decision → alternatives → trade-offs → recommendation with qualifications.

Reorder or omit parts when the audience already knows them. A title-only divider can
be useful rhythm, but a content-empty “Our journey” page does not earn its place.
Keep a backup appendix for optional detail rather than hiding essential evidence
behind an interaction that the final PDF cannot expose.
