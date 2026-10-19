// Composition study · Wide information — a comparison with many attributes per row gets the full
// 1152 px measure and nothing beside it. The condition columns sit directly left of the result
// columns, and the reading of each row is computed from them, not typed. Data: `trials`.
import { fmt } from '../runtime/figure.mjs';

const ID = 'composition-wide-information';
const noise = 1.0; // ± percentage points: 2 SD of weekly rework on Line 3 in the 26 weeks before the trials
const trials = [ // rework = share of welds sent back after inspection, % (illustrative)
  { name: 'Pre-heat thick flanges', detail: 'to 80 °C above 12 mm', prose: 'pre-heating', changed: ['flange pre-heat'], held: 'wire, gas, crew, fixtures, inspection', weeks: 6, welds: 7240, before: 3.9, after: 2.2 },
  { name: 'Faster wire feed', detail: '8.5 → 9.2 m/min', changed: ['wire feed speed'], held: 'gas, crew, fixtures, inspection', weeks: 4, welds: 4880, before: 4.1, after: 3.8 },
  { name: 'Leaner shielding gas', detail: 'Ar/CO₂ 82/18 → 90/10', changed: ['gas mix'], held: 'wire, crew, fixtures, inspection', weeks: 4, welds: 5010, before: 4.0, after: 3.4 },
  { name: 'Second-shift reset', detail: 'fixtures re-shimmed', prose: 'the second shift', changed: ['fixtures', 'shift lead'], held: 'wire, gas, inspection', weeks: 5, welds: 3960, before: 4.3, after: 2.4 },
  { name: 'Camera inspection', detail: 'replaces the visual check', changed: ['how rework is found'], measurement: true, held: 'the welding itself', weeks: 3, welds: 2940, before: 3.8, after: 5.2 },
];

// derived values: each row's reading follows from its condition and its result
const words = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'];
const delta = r => r.after - r.before;
const readingOf = r => r.measurement ? { key: 'ruler', text: 'Not comparable: the measurement changed' }
  : r.changed.length > 1 ? { key: 'confounded', text: `Confounded: ${words[r.changed.length] ?? r.changed.length} changes at once` }
  : Math.abs(delta(r)) < noise ? { key: 'noise', text: 'Within weekly noise' }
  : { key: 'clean', text: 'Attributable: adopt on Lines 1 and 2' };
const clean = trials.filter(r => readingOf(r).key === 'clean');
const pct = v => `${fmt(v, { digits: 1 })}%`;
const pts = v => `${fmt(v, { digits: 1, sign: true })}&nbsp;pts`;
const cap = s => s[0].toUpperCase() + s.slice(1);

const head = clean.length === 1
  ? `Of ${words[trials.length] ?? trials.length} Line 3 trials, only ${clean[0].prose ?? clean[0].name.toLowerCase()} cut rework in a way we can attribute`
  : `${cap(words[clean.length] ?? String(clean.length))} of ${words[trials.length] ?? trials.length} Line 3 trials cut rework in a way we can attribute`;

const row = r => {
  const read = readingOf(r);
  return `<tr class="cmp-wi-${read.key}">
    <th scope="row"><b>${r.name}</b><span>${r.detail}</span></th>
    <td>${cap(r.changed.join(' and '))}</td>
    <td class="cmp-wi-held">${cap(r.held)}</td>
    <td class="cmp-wi-n">${fmt(r.welds)}<span>${r.weeks} weeks</span></td>
    <td class="cmp-wi-ba">${pct(r.before)} → ${pct(r.after)}</td>
    <td class="cmp-wi-d">${pts(delta(r))}</td>
    <td class="cmp-wi-read">${read.text}</td>
  </tr>`;
};

export default {
  study: true,
  id: ID,
  title: 'Wide information: a full-width table that keeps each condition beside its result',
  className: 'st cs-manufacturing-plant cmp-wide',
  notes: 'Purpose: Use when each item carries several attributes that must be read together (what changed, what was held, how much evidence, the result, what it means). Give the comparison the full measure and nothing beside it; put the condition columns immediately left of the result columns so every result is read with the conditions that qualify it.\nModify: Replace `trials` and `noise`; the change column, the reading of every row (noise, confounded, not comparable, attributable) and the headline recompute from the rule in `readingOf`. Keep five to seven rows; longer lists become a reference page.\nInvariant: Full 1152 px width, no rail; column order condition → evidence → result → reading; numbers right-aligned in tabular figures with units in every cell; rules between rows, no boxes or zebra fills; the one accent is the reading that asks for a decision; the rule that produced the readings is printed under the table.\nStatic: Already static.',
  sources: [{ type: 'original-example', file: `assets/compositions/${ID}.mjs` }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" data-region="title">${head}</h1>
<div class="cmp-wi-wrap">
<table class="cmp-wi-table" data-region="primary">
  <colgroup><col style="width:226px"><col style="width:150px"><col style="width:186px"><col style="width:92px"><col style="width:166px"><col style="width:92px"><col style="width:240px"></colgroup>
  <thead>
    <tr class="cmp-wi-groups"><th></th><th colspan="2">Condition</th><th colspan="3">Result</th><th>Reading</th></tr>
    <tr><th scope="col">Trial</th><th scope="col">What changed</th><th scope="col">Held constant</th><th scope="col" class="cmp-wi-n">Welds</th><th scope="col" class="cmp-wi-ba">Rework before → after</th><th scope="col" class="cmp-wi-d">Change</th><th scope="col">Read as</th></tr>
  </thead>
  <tbody>${trials.map(row).join('')}</tbody>
</table>
<p class="cmp-wi-rule" data-region="support">Weekly rework on Line 3 varied by ±${fmt(noise, { digits: 1 })}&nbsp;points (2&nbsp;SD) in the 26 weeks before the trials; a change inside that band is read as noise.</p>
</div>
<p class="st-source" data-region="source"><span>Illustrative data · Line 3 inspection records; rework = share of welds sent back after inspection</span><span>Wide information · full-width comparison table</span></p>`,
};
