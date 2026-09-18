# Writing and editing: think first, separate channels, choose density, then polish

The editorial pass, the writing sequence, copy channels, density and rhythm,
and the writing clinic. Read the parts in order.

## 1. The editorial pass: make the meaning work before making it memorable

A plausible-looking slide can still say nothing, misstate a result, or sound like a
collection of slogans. Treat copy as an authored explanation, not a styling layer.
The solution is not a larger banned-word list, and not forcing every page to be sparse.

### The short routine — do it, do not put it on the canvas

1. Write the literal answer to the audience's question in ordinary language. Include
   the object, action/difference, scope and evidence. Use the language of the audience,
   not a literal translation of English marketing rhythm.
2. Select the strongest useful sentence as the provisional headline. A concrete topic
   label can be better for a table or reference page; not every title needs a full claim.
3. Assign remaining text to **evidence, explanation, labels or necessary qualification**.
   Remove a sentence that only repeats the headline in different words. Keep units,
   denominators, provenance and limitations that change how a claim is interpreted.
4. Read headline + image/figure without the prose. Can they support the same meaning?
   A caption cannot quietly reverse a bold promise. A footnote cannot repair a wrong axis.
5. Read the prose aloud without the design. Replace forced metaphors, vague actors,
   repeated "not A but B", performative sincerity and empty action words *where they
   obstruct the actual thought*. Do not replace them with a different set of clichés.
6. Read the titles as a sequence. Each page should add evidence, explain a mechanism,
   resolve a question, orient the reader or enable a decision. Merge redundant pages.
7. Typeset the actual copy. Fix a stranded final word by editing syntax or local width,
   not by shrinking the whole deck, adding random line breaks or removing a condition.

No extra file is required for this pass on a small deck. On a large deck, leave a short
repair record: page, actual defect, actual correction, remaining uncertainty.

### Use the right register

A research result usually needs direct language: "The median time was lower under
condition B." A public exhibition can legitimately use sensory language. A brand
launch can be expressive. A procurement comparison should help a decision, not
make every supplier sound like a character in a story. The literal version is a
meaning check, not a rule that all final writing must sound identical.

**Specificity is not certainty.** "The proposal schedules a collection each Friday"
is specific without claiming the service already exists. "A small trial is proposed"
may be more useful than an invented exact staffing promise.

Japanese: avoid ornamental noun stacks, excessive quotation marks, rhetorical
「正直に言います」, forced 「〜の正体」 and repeated 「〜ではなく〜」 when they do
not add meaning. Do not ban those strings from quoted evidence or natural prose.

English: inspect vague "it/this", artificial triads, empty "unlock/reimagine",
overstated superlatives, unnecessary article-less badges and pseudo-editorial headings.
Use technical terminology when it is the actual term; explain it without infantilizing.

Other languages: use the intended register, local punctuation, word order and accepted
terms. Unexpected script fragments are a **source-copy problem until investigated**,
not automatically a PDF font problem. Names, quotations and deliberate bilingual text
remain valid. Do not transliterate or erase unfamiliar writing to make a lint pass.

### Audience copy versus production work

A condition control can say "12 months / 36 months / 60 months" and show the current
assumptions. "The PDF keeps the 36-month view" is a production note, not part of that
financial explanation. Put it in a runbook. A laboratory control can explain what its
parameter changes without describing when the presenter should click it.

The runtime's copy gate detects a small set of high-confidence leaks. Its absence is
not editorial approval. Recheck **live, final, export and script-created content**.

### Explain the subject, not the act of preparing this deck

For a paper or encyclopedia explanation, do not mechanically turn section headings
into slides. Orient the intended reader with a concrete phenomenon or worked example,
then introduce the mechanism, evidence and limits in the order needed to understand
it. Specialists may need methods first; a historical account may need chronology.
Choose from the audience's knowledge, not a mandatory storytelling template.

Scope notes matter when they change a claim. State the overall scope once, then keep
local qualifications beside the affected evidence. Repeated "this deck only covers",
"we do not claim" or "the original is the source" consumes the explanation without
adding a new limit. Replace repeated author commentary with the actual observation.
Example: instead of "Here we explain the method carefully", show one input, the
operation that changes it, and the resulting output. Do not invent an example result
and pass it off as a measured one.

Use captions that help someone inspect the visual: what feature to notice, where it
is, and why it matters. "A historical building" adds less than identifying the actual
load-bearing part with a correct annotation. Descriptive labels, quiet image pages
and expressive openings remain legitimate when they serve the reader.

### The deletion test

Temporarily remove a subtitle, eyebrow, badge row, card border or final slogan. Does
any necessary meaning, hierarchy, navigation or identity disappear? If not, leave it
out. If something useful disappears, restore it or express that role more directly.
This is not a universal ban on subtitles, ornament, cards, color or poetic language.

Use [repair cases](repair.md) for paired examples; scope and linguistic detail
follow in §2 below. `editorial-review.mjs` gives
advisory prompts; it does not detect whether a human or AI wrote the copy.

## 2. Write the thought before polishing the sentence

Start with the concrete editorial pass (§1 above). Do not treat an unchanged sample phrase as authored prose.

The goal is natural, accurate language that earns its space. Neither extreme
brevity nor academic stiffness is inherently professional. Draft in the audience's
language. A deck about a method is not automatically a sales pitch; a conference
presentation does not need to say “conference presentation” on its slides.
First apply the channel boundary (§3 below).

### A concrete editing sequence

1. **Recover the actual thought.** In ordinary words, answer the audience's current
   question. Identify the actor/object, change or mechanism, comparison, condition,
   evidence and uncertainty. If the source cannot answer, name the uncertainty.
2. **Choose the page's rhetorical job.** Finding, method, comparison, orientation,
   limitation, question and transition have different sentence forms. Do not give
   all of them the same “X unlocks Y” headline.
3. **Assign the text roles.** A headline tells the main contribution. A subline
   supplies the most important condition. A caption says what to notice in the
   specific evidence. Labels identify objects/units. Notes carry optional speech.
   Two roles that say the same thing should usually be merged, not restyled.
4. **Write one clear version.** Prefer explicit verbs and concrete nouns. Preserve
   scientific terminology when it is needed; explain it rather than replacing it
   with a vague familiar word. Match formality to the real audience.
5. **Cut duplication, not meaning.** Remove repeated scope, empty lead-ins, filler
   adjectives and nominal chains. Do not remove denominator, comparator, negation,
   uncertainty, units, selection rules or proposal status merely to save a line.
6. **Read aloud and in sequence.** Listen for an unnatural string of nouns, repeated
   sentence endings, hidden pronoun referents, forced three-part slogans and repeated
   “not X but Y”. Read the titles alone: do they advance the explanation?
7. **Edit in the real frame.** The line ending can change emphasis. Reword or change
   the block width before shrinking type. A line break belongs between meaningful
   phrases, not inside a name, unit, number or tightly bound grammatical unit.

This loop must produce revised copy, not only a list of writing advice in the deck.

### The title is not one universal sentence type

| Page job | Useful title behavior | Frequent failure |
|---|---|---|
| Finding | State the scoped finding from the evidence | “Results”, or a universal claim from one condition |
| Mechanism | Name the meaningful action or relationship | Stacked abstract nouns and an unexplained acronym |
| Comparison | Name the comparison or the difference that matters | “Comparison” repeated above two unlabeled objects |
| Question | Ask the uncertainty the next page resolves | A rhetorical question with no actual answer |
| Orientation | Give a short, concrete topic/place in the argument | A fake promise or a miniature table of contents everywhere |
| Limitation | State the boundary without apologetic padding | Hiding the limitation in unreadably small text |
| Closing | State the earned conclusion, decision or next experiment | “The future is limitless” or unrelated inspiration |

An index can use topic labels. A visual essay can use almost no text. A quiet title
page can be typographic rather than propositional. Match form to purpose.

### Specific language repairs

**Empty noun stack**

Weak: “Implementation of optimization of workflow efficiency.”

Repair: “The proposal groups related records before review.”

The repaired line says what happens and keeps proposal status. It does not claim
higher throughput without a measurement.

**Stilted Japanese**

Weak: 「高精度化の実現によるさらなる価値提供を可能とする。」

First ask what was actually observed. With only a design proposal:
「この案では、入力の種類に応じて処理を切り替える。」
With a supplied measurement, use the real measured difference and its condition
instead. Never borrow an illustrative result from this guide.

**Mechanical academic prose**

Weak: “It can be said that the possibility of improvement is suggested.”

Repair according to evidence: “The observed difference is consistent with X,
but this experiment does not distinguish X from Y.” This is more specific, not
necessarily shorter. Do not manufacture X/Y; use the actual hypotheses.

**An overcompressed heading**

Weak: 「条件依存性能差比較評価」

Repair: 「条件を変えると、性能差はどう変わるか。」

Use the natural accepted technical noun when it is a term of art. The rule is not
“all nouns are bad”; it is “do not force the audience to reconstruct missing logic”.

**Duplication between title and caption**

A caption reading “Results of the comparison” under a title “Comparison results”
adds almost nothing. The caption can identify which comparison, scale, denominator
or observation is important. Omit it when the visual already says that clearly.

### Scope, status and numbers survive editing

Keep observed / reported / inferred / proposed / illustrative / unknown distinct.
Do not upgrade a sample into a population, association into cause, a protocol into
proof, or a toy animation into implementation evidence. “Significant” must mean
what the analysis actually supports. Preserve unfavorable and inconclusive results.

An estimate needs its unit, reference, denominator and relevant period. An interval
needs the definition supplied by the analysis; never guess CI, SD or SE. Do not
turn missing into zero, precision into certainty, or a count into a speed ratio.
Use true sources, not plausible-looking citations. All example numbers in this
library are illustrative unless independently supplied as evidence.

### Voice, rhythm and linguistic variety

Choose a consistent register within a deck; do not alternate between inflated
marketing, informal chat and a legal memo by accident. Vary sentence shape when
ideas differ, not to meet a variation quota. Avoid uniform three-item blocks,
repeated “X. Y. Z.” slogans and the same contrast formula on every page.

Japanese: check topic/subject continuity, noun-chain density, natural verb endings
and overuse of 「〜することが可能」. English: check redundant preambles, passive
agents that matter, empty intensifiers and repeated demonstratives. Other languages:
respect idiom, grammatical agreement, accepted terminology, punctuation, units and
reading direction. Do not translate English marketing rhythm word for word.

CJK, RTL and long compounds alter shape on the page. Typography and translation
are edited together. Test the real installed fallback fonts. Native-speaker review
may still be appropriate for publication-critical copy; this skill does not certify
fluency from a successful render.

### Write to a region, not a universal word count

Decide what can be understood at presentation distance and what is supporting detail.
A dense comparison and a quiet claim have different appropriate budgets. Use the
actual font, line height, reading width and evidence area to test the copy.

If it does not fit: remove duplicate thought → simplify syntax without losing
scope → give the block more width → change the relation between text and figure →
split an independent idea → use notes/appendix for optional detail. Local type
adjustment is last, not a substitute for editorial judgment.

For a page that feels too empty, first check whether its *main evidence is too small*.
Do not add filler prose to occupy space. For a page that feels crowded, do not remove
scientific qualifications to create fashionable whitespace.

### Exit test

Someone without the chat history should be able to say what the page contributes,
what each label refers to, what changed under which condition, and how strongly the
source supports the statement. Nothing should require knowledge of the agent's
work process. The clinic (§5 below)
supplies additional repair examples; `editorial.py` and the build/browser guards
supply hints, not an authorship verdict.

## 3. Keep audience content separate from production instructions

The audience sees the subject, not the agent's work process. A useful control can
be present without a visible explanation of when the speaker intends to use it.
This is a semantic boundary, not a ban on the words “click”, “presentation” or “switch”.

### Four channels

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

### Build and runtime gates

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

### Notes are separate in the layout, not secret

Notes are normally included in HTML metadata and can be read from its source.
`craft.mjs build ... --strip-notes` omits them for an audience-only copy. Necessary
citations still remain. Keep confidential material out of the distributable source
as well. Do not present the Notes panel as an authenticated presenter-only view.

### Final audience pass

Read the slide with controls hidden. Does every word help someone understand the
subject? Search for production language, unexplained IDs, “source file” paths,
meta-headlines, placeholders, template footer text and obsolete draft qualifications.
Then show the controls: are their labels about available actions or about the
presenter's intention? Keep accessible labels and valid content disclosures.

## 4. Density is chosen for the reading task

A slide can be simultaneously crowded and mostly empty: small type and several
panels occupy the top half while the lower half does no work. "Remove information"
or "add whitespace" are not adequate diagnoses.

### Choose a reading mode before layout

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

### A constructive allocation routine

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

### Useful and misleading ways to make room

Useful: one short title; a large paired plot; directly named series; a full-width table;
caption beside the relevant mark; notes for optional examples; a detail page for a
separate question; extending the actual diagram rather than its empty outer SVG.

Misleading: shrinking everything; removing "estimated" from a title; unexplained
abbreviations; hiding a key axis; putting one fact into heading, subtitle and footer;
adding an icon to every label; using a large callout container around very small text.

### Deck rhythm, not random variety

View the sequence at contact-sheet scale. Look for repeated **unnecessary** structures:
eyebrow + claim + subclaim + three cards + conclusion strip on every page. Reuse a
structure when the reader compares equivalent things or learns a recurring procedure.
Change the primary medium or reading path when the explanation requires it, not to
meet a variation quota. Approved company identity stays stable across these choices.

### Read the diagnostics correctly

`qa.py` reports body-size hints for the declared mode, high-positioned small text,
heading line patterns, text behind overflow clips, SVG bounds and coarse blank areas.
These hints are not an optimization target or a beauty score. Decorative backgrounds
can game occupancy; a large container can hide a small drawing. Read the screenshot.

If an intentional reveal clips text, inspect its initial/mid/final states and add a
narrow `data-qa-text-clip` annotation with its reason only after verifying it. Never
wrap the entire deck in a waiver to silence genuine truncation.

## 5. Writing clinic: 24 repair patterns

These examples teach edits. Adapt language naturally rather than copying fixed slogans.
(All example numbers here are illustrative unless independently supplied as evidence,
per the scope rule in §2.)

### 01. Abstract promise

Weak: Unlock unlimited possibilities.

Repair: The proposal lets reviewers group related records.

Invariant: Name the action and keep proposal status.

### 02. Unsupported speed

Weak: Five tasks means five times faster.

Repair: The example batches five tasks; throughput is unmeasured.

Invariant: Count is not throughput.

### 03. Missing comparator

Weak: The score improved.

Repair: The score increased from 12 to 15 in the supplied example.

Invariant: Specify reference and illustrative/observed status.

### 04. Hidden denominator

Weak: 60% chose A.

Repair: 6 of the 10 responses in this example chose A.

Invariant: Keep denominator; never invent a sample.

### 05. Causal overclaim

Weak: More use caused better results.

Repair: Higher use and better results appeared together in this sample.

Invariant: Association is not automatically causation.

### 06. Ambiguous uncertainty

Weak: The result is 12 ± 2.

Repair: The example mean is 12; the interval definition is not provided.

Invariant: Do not guess SD/SE/CI.

### 07. Universal inference

Weak: This works everywhere.

Repair: It worked under the conditions documented here.

Invariant: Carry scope.

### 08. False status

Weak: The system now supports the feature.

Repair: The design proposes support; implementation is not confirmed.

Invariant: Do not promote a proposal into fact.

### 09. Empty heading

Weak: Our journey

Repair: How the samples move from collection to measurement

Invariant: Name the page job.

### 10. Duplicate caption

Weak: Results are shown above.

Repair: Read the spread, not only the center point.

Invariant: Guide attention without duplicating a title.

### 11. Inflated list

Weak: Fast. Smart. Powerful.

Repair: State the measured behavior, or omit the claim.

Invariant: Do not pad three boxes.

### 12. Fake quotation

Weak: “Simplicity is everything.” — unnamed expert

Repair: Use the sentence as an original note without attribution.

Invariant: Never fabricate a speaker.

### 13. False precision

Weak: 12.345678%

Repair: Use precision justified by the source; retain the unrounded data separately.

Invariant: Display precision is a decision.

### 14. Zero versus missing

Weak: A missing value displayed as 0

Repair: Mark it as not recorded.

Invariant: Absence is not zero.

### 15. Vague actor

Weak: A decision was made.

Repair: The review group selected option B.

Invariant: Use only a supported actor.

### 16. Hidden condition

Weak: The rule always accepts the input.

Repair: The rule accepts the input when all required fields are present.

Invariant: Keep the condition.

### 17. Fluffy Japanese

Weak: 革新的な価値を創出します。

Repair: この案では、関連する記録をまとめて確認します。

Invariant: 主語・動作・確度を具体化する。

### 18. Overliteral translation

Weak: A direct translation breaks a natural title.

Repair: Rewrite the title natively while preserving the claim and its scope.

Invariant: Meaning is invariant; word order is not.

### 19. Overcompressed German

Weak: Overpacked compound in a narrow label.

Repair: Use an accepted abbreviation with an explicit expansion nearby.

Invariant: Do not shrink the entire page.

### 20. RTL punctuation

Weak: An identifier disrupts Arabic reading order.

Repair: Isolate the Latin identifier in bdi/dir=ltr; keep paragraph rtl.

Invariant: Typesetting is part of writing.

### 21. Method/result confusion

Weak: A protocol diagram proves success.

Repair: The diagram explains the protocol; results need separate evidence.

Invariant: Mechanism is not measurement.

### 22. Selection bias hidden

Weak: Only favorable rows are shown.

Repair: State the selection rule and preserve the full comparison in the appendix.

Invariant: Editing must not mislead.

### 23. Unknown treated as fact

Weak: The unexplained gap must be due to X.

Repair: The reason for the gap is unknown; X is one hypothesis.

Invariant: Label hypotheses.

### 24. Decorative ending

Weak: The future is limitless.

Repair: Name the next question, decision or experiment supported by the work.

Invariant: End with earned meaning.
