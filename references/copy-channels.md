# Keep audience content separate from production instructions

The audience sees the subject, not the agent's work process. A useful control can
be present without a visible explanation of when the speaker intends to use it.
This is a semantic boundary, not a ban on the words “click”, “presentation” or “switch”.

## Four channels

| Channel | Belongs here | Must not migrate here |
|---|---|---|
| Slide content | Claims, evidence, meaningful labels, necessary scope, true sources, usable control labels | Stage directions, draft choices, source-code paths, “change this later”, design rationales |
| `slide.notes` | Timing, optional spoken elaboration, operator actions, a contingency | An essential limitation that a circulated PDF needs |
| `runbook.md` | Setup, operating sequence, backup plan, rehearsal cues | Confidential information that should not be distributed with the deck |
| Source comments | Geometry rationale, invariants, implementation explanation | Visible HTML strings unless they are deliberate audience copy |

For example, a conference talk may have an A/B switch. The audience can see
`Condition A` / `Condition B`, the changed figure and the current condition. A note
such as “switch during the conference presentation” describes the speaker's job;
it does not belong on the canvas. In Japanese, `条件A` / `条件B` is useful UI;
`学会発表時切替` is a production instruction. Move the latter to notes.

A paper about presentation interfaces might legitimately quote such a label. Treat
that as a narrowly reviewed quotation, not an excuse to disable all copy checks.

## Build and runtime gates

`craft.mjs` rejects high-confidence production instructions and placeholders in a
finished audience deck. It rejects untouched workshop slides with `study:true`.
`deck.mode:'workshop'` is only for a genuine teaching gallery, not a loophole for an
unfinished audience presentation. Use `draft:true` + `--allow-draft` for preview.

`catalog.mjs take` removes the workshop's explicitly named heading, purpose and
footer wrappers, carries source teaching notes into notes/provenance, and starts a
**draft**. It cannot infer whether every inner label fits the new subject. Rewrite
labels, author a real visible title, replace data, and review the new page before
clearing `draft`. Do not clear flags just to make validation pass.

The browser QA repeats the copy scan after custom JavaScript and widgets render.
Source-only validation cannot see text created later by a script. Pattern warnings
are not proof that prose is poor; absence of warnings is not proof it is good.

A scoped, intentionally quoted occurrence can use:

```js
copyWaivers: [{
  rule: 'ja-stage-direction',
  quote: '学会発表時切替', // exact text matched by the checker
  reason: 'The paper evaluates this exact operator-label example.'
}]
```

A waiver records a reviewed exception, not a command to ignore the rule elsewhere.

## Notes are separate in the layout, not secret

Notes are normally included in HTML metadata and can be read from its source.
`craft.mjs build ... --strip-notes` omits them for an audience-only copy. Necessary
citations still remain. Keep confidential material out of the distributable source
as well. Do not present the Notes panel as an authenticated presenter-only view.

## Final audience pass

Read the slide with controls hidden. Does every word help someone understand the
subject? Search for production language, unexplained IDs, “source file” paths,
meta-headlines, placeholders, template footer text and obsolete draft qualifications.
Then show the controls: are their labels about available actions or about the
presenter's intention? Keep accessible labels and valid content disclosures.
