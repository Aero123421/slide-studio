// Diagram study · Missingness map — which measurements exist, and which do not, without inventing any.
// Each cell is one scheduled visit for one participant. States come from `participants`; the
// counts in the headline, the labels and the hidden table are computed from the same array.
import { svgRoot, el, g, textLines, rng, theme as makeTheme } from '../runtime/figure.mjs';

// A 12-week trial, 36 participants in three arms, 7 scheduled visits each (illustrative).
// A participant who drops out has no further visits; anyone can also miss a single visit.
const visits = ['Baseline', 'Week 2', 'Week 4', 'Week 6', 'Week 8', 'Week 10', 'Week 12'];
const arms = [{ name: 'Placebo', code: 'P', hazard: 0.02 }, { name: 'Low dose', code: 'L', hazard: 0.025 }, { name: 'High dose', code: 'H', hazard: 0.13 }];
const rand = rng(20);
const participants = arms.flatMap(a => Array.from({ length: 12 }, (_, i) => {
  let left = null;
  const states = visits.map((_, v) => {
    if (left === null && v > 0 && rand() < a.hazard) left = v;
    return left !== null ? 'dropped' : v > 0 && rand() < 0.05 ? 'missed' : 'observed';
  });
  return { id: `${a.code}-${String(i + 1).padStart(2, '0')}`, arm: a.name, states, left };
}));

const byArm = arms.map(a => {
  const people = participants.filter(p => p.arm === a.name)
    .sort((p, q) => (p.left ?? 99) === (q.left ?? 99) ? p.id.localeCompare(q.id) : (q.left ?? 99) - (p.left ?? 99)); // completers, then later dropouts first
  return { ...a, people, dropped: people.filter(p => p.left !== null).length, missed: people.flatMap(p => p.states).filter(s => s === 'missed').length };
});
const focus = byArm.reduce((a, b) => (b.dropped > a.dropped ? b : a));
const others = byArm.filter(a => a !== focus);
const totalDropped = byArm.reduce((s, a) => s + a.dropped, 0);
const STATE = { observed: 'Observed', missed: 'Missed visit', dropped: 'After dropout' };

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470;
  const left = 118, gapArm = 28, top = 70, rowH = 40, cellGap = 3;
  const colW = (W - left - 8 - gapArm * (arms.length - 1)) / participants.length;
  const cell = (state, x, y) => state === 'observed'
    ? el('rect', { x, y, width: colW - cellGap, height: rowH - cellGap, rx: 2, fill: t.c('context') })
    : state === 'missed'
      ? el('rect', { x: x + 0.75, y: y + 0.75, width: colW - cellGap - 1.5, height: rowH - cellGap - 1.5, rx: 2, fill: 'none', stroke: t.c('muted'), 'stroke-width': 1.5, 'stroke-dasharray': '3 3' })
      : el('rect', { x, y, width: colW - cellGap, height: rowH - cellGap, rx: 2, fill: t.c('accent') });
  let x0 = left;
  const blocks = byArm.map(a => {
    const bx = x0, bw = a.people.length * colW - cellGap, hl = a === focus;
    x0 += a.people.length * colW + gapArm;
    return g({ class: 'arm' },
      textLines([a.name], { x: bx, y: top - 30, size: 19, weight: 700, fill: t.c('ink') }),
      textLines([`n = ${a.people.length}`], { x: bx + bw, y: top - 30, size: 16, anchor: 'end', fill: t.c('muted') }),
      a.people.map((p, i) => p.states.map((s, v) => cell(s, bx + i * colW, top + v * rowH))),
      textLines([`${a.dropped} of ${a.people.length} dropped out`], { x: bx, y: top + visits.length * rowH + 14, size: 18, valign: 'top', weight: hl ? 700 : 600, fill: hl ? t.c('accent') : t.c('ink') }),
      textLines([`${a.missed} missed visit${a.missed === 1 ? '' : 's'}`], { x: bx, y: top + visits.length * rowH + 40, size: 16, valign: 'top', fill: t.c('muted') }));
  });
  const legendY = H - 12;
  const swatch = (state, x) => g({}, cell(state, x, legendY - 13), textLines([STATE[state]], { x: x + colW + 6, y: legendY + 4, size: 16, valign: 'middle', fill: t.c('muted') }));
  return svgRoot({ id: 'missingness-map-fig', width: W, height: H, theme: t,
    title: 'Missingness map: scheduled visits by participant and arm, observed, missed or after dropout',
    desc: `${participants.length} participants, ${visits.length} visits each. Dropouts: ${byArm.map(a => `${a.name} ${a.dropped} of ${a.people.length}`).join(', ')}. Single missed visits: ${byArm.map(a => `${a.name} ${a.missed}`).join(', ')}. Missing cells are left empty or marked, never filled with values.` },
  visits.map((v, i) => textLines([v], { x: left - 14, y: top + i * rowH + (rowH - cellGap) / 2, size: 17, anchor: 'end', valign: 'middle', fill: t.c('ink') })),
  blocks,
  textLines(['Each column is one participant'], { x: left - 104, y: legendY + 4, size: 16, valign: 'middle', fill: t.c('muted') }),
  ['observed', 'missed', 'dropped'].map((s, k) => swatch(s, 430 + k * 190)));
}

// The same data as a table for assistive technology: hidden on the slide, referenced by the figure.
const table = `<div id="missingness-map-data" hidden><table>
<caption>Visit status by participant (${visits.length} scheduled visits)</caption>
<thead><tr><th scope="col">Participant</th><th scope="col">Arm</th>${visits.map(v => `<th scope="col">${v}</th>`).join('')}</tr></thead>
<tbody>${participants.map(p => `<tr><th scope="row">${p.id}</th><td>${p.arm}</td>${p.states.map(s => `<td>${STATE[s]}</td>`).join('')}</tr>`).join('')}</tbody>
</table></div>`;

export default {
  study: true,
  id: 'missingness-map',
  title: 'Missingness map: absent entries shown, not filled',
  className: 'st cs-clinical-trial',
  notes: 'Purpose: Show where measurements are missing and how — a single missed visit or everything after a dropout — so the audience can judge whether missingness could bias the result.\nModify: Replace `participants` with your real visit records (one state per scheduled visit); arms, ordering, counts, the headline and the hidden table recompute. Add states (e.g. "sample unusable") to `STATE` and `cell()`.\nInvariant: Every scheduled visit has a cell; missing cells are never colored as values; the distinction between intermittent and monotone missingness is visible; the same data is supplied as a table.\nStatic: Already static. For hundreds of participants, keep the grid and drop the hidden table in favor of a download.',
  sources: [{ type: 'original-example', file: 'assets/svg/missingness-map.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Dropouts are not random: the ${focus.name.toLowerCase().replace(' ', '-')} arm lost <em>${focus.dropped} of ${focus.people.length}</em> participants, the other arms ${others.every(a => a.dropped === others[0].dropped) ? `${others[0].dropped} each` : others.map(a => a.dropped).join(' and ')}</h1>
<figure class="st-fig" data-region="primary" aria-describedby="missingness-map-data">${figure()}</figure>
${table}
<p class="st-source" data-region="source"><span>Illustrative data · ${participants.length} participants, ${totalDropped} dropouts; missing visits are shown as missing and not imputed here</span><span>Missingness map</span></p>`,
};
