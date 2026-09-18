# Write the thought before polishing the sentence

Start with the concrete [editorial pass](editorial-pass.md). Do not treat an unchanged sample phrase as authored prose.

The goal is natural, accurate language that earns its space. Neither extreme
brevity nor academic stiffness is inherently professional. Draft in the audience's
language. A deck about a method is not automatically a sales pitch; a conference
presentation does not need to say “conference presentation” on its slides.
First apply the [channel boundary](copy-channels.md).

## A concrete editing sequence

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

## The title is not one universal sentence type

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

## Specific language repairs

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

## Scope, status and numbers survive editing

Keep observed / reported / inferred / proposed / illustrative / unknown distinct.
Do not upgrade a sample into a population, association into cause, a protocol into
proof, or a toy animation into implementation evidence. “Significant” must mean
what the analysis actually supports. Preserve unfavorable and inconclusive results.

An estimate needs its unit, reference, denominator and relevant period. An interval
needs the definition supplied by the analysis; never guess CI, SD or SE. Do not
turn missing into zero, precision into certainty, or a count into a speed ratio.
Use true sources, not plausible-looking citations. All example numbers in this
library are illustrative unless independently supplied as evidence.

## Voice, rhythm and linguistic variety

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

## Write to a region, not a universal word count

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

## Exit test

Someone without the chat history should be able to say what the page contributes,
what each label refers to, what changed under which condition, and how strongly the
source supports the statement. Nothing should require knowledge of the agent's
work process. The [clinic](writing-clinic.md) supplies additional repair examples;
`editorial.py` and the build/browser guards supply hints, not an authorship verdict.
