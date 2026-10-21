// Diagram study · Waffle — a share as 100 countable squares, each worth the same volume.
// Square counts are rounded once, here, and the same counts drive the grid and the key,
// so labels always match what can be counted. Volumes and the headline come from `flows`.
import { waffleChart, el, g, textLines, wrapText, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const flows = [ // water put into supply, megalitres per day, 2025 (illustrative); first = the share the page is about
  { label: 'Leakage', sub: 'from mains and service pipes', mld: 42, role: 'accent' },
  { label: 'Other losses', sub: 'meter errors, theft, firefighting', mld: 11, role: 'muted' },
  { label: 'Billed', sub: 'to homes and businesses', mld: 129, role: 'context' },
];
const perPerson = 140; // litres per person per day, for the population equivalent
const supplied = flows.reduce((s, f) => s + f.mld, 0);
const counts = flows.map(f => Math.round((f.mld / supplied) * 100));
counts[counts.indexOf(Math.max(...counts))] += 100 - counts.reduce((s, c) => s + c, 0); // the largest part absorbs rounding
const lost = flows[0], lostSquares = counts[0];
const people = Math.round((lost.mld * 1e6) / perPerson / 1e4) * 1e4;

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470;
  return waffleChart({
    id: 'waffle-fig', theme, width: W, height: H, gap: 5,
    title: 'Water put into supply as 100 squares, by where it goes',
    desc: `${lostSquares} of 100 squares are leakage: ${lost.mld} of ${supplied} megalitres a day. Each square is 1% of supply, ${fmt(supplied / 100, { digits: 1 })} megalitres a day.`,
    parts: flows.map((f, k) => ({ label: f.label, value: counts[k], color: t.c(f.role) })), total: 100,
    extra: ({ side, gap, ox, oy }) => {
      const right = ox + 10 * side + 9 * gap + 44, left = ox - 44;
      const keyRows = flows.map((f, k) => {
        const yy = oy + 22 + k * 104;
        return g({},
          el('rect', { x: right, y: yy - 13, width: 26, height: 26, rx: 3, fill: t.c(f.role) }),
          textLines([fmt(counts[k])], { x: right + 40, y: yy, size: 30, valign: 'middle', fill: k ? t.c('ink') : t.c('accent'), weight: 700, attrs: { 'font-variant-numeric': 'tabular-nums' } }),
          textLines([f.label], { x: right + 92, y: yy - 9, size: 18, valign: 'middle', fill: t.c('ink'), weight: 700 }),
          textLines([`${f.sub}`, `${fmt(f.mld)} million litres a day`], { x: right + 92, y: yy + 14, size: 15, valign: 'top', fill: t.c('muted'), lineHeight: 1.3 }));
      });
      return g({},
        // Left: the absolute volume behind the share.
        textLines([fmt(lost.mld)], { x: left, y: oy + 96, size: 112, anchor: 'end', fill: t.c('accent'), weight: 700, family: t.font('serif'), attrs: { 'letter-spacing': '-0.02em', 'font-variant-numeric': 'lining-nums' } }),
        textLines(['million litres a day'], { x: left, y: oy + 142, size: 19, anchor: 'end', fill: t.c('ink'), weight: 600 }),
        textLines(wrapText(`lost to leaks: enough to supply ${fmt(people)} people`, 250, 17), { x: left, y: oy + 176, size: 17, anchor: 'end', fill: t.c('muted'), lineHeight: 1.35 }),
        // Right: a key that counts squares, not just names colors.
        g({ class: 'ss-key' }, keyRows),
        textLines(['Each square is 1% of supply:', `${fmt(supplied / 100, { digits: 1 })} million litres a day`], { x: right, y: oy + 10 * side + 9 * gap, size: 15, valign: 'bottom', fill: t.c('muted'), lineHeight: 1.3 }));
    },
  });
}

export default {
  study: true,
  id: 'waffle',
  title: 'Waffle: a share as countable squares',
  className: 'st cs-editorial-vermilion',
  notes: 'Purpose: Show a share as countable squares, so "23 in 100" can be checked by counting, with the absolute volume beside it.\nModify: Replace `flows` (first item is the share the page is about). Counts are rounded once and the largest part absorbs the remainder; the key, the volume block and the headline recompute.\nInvariant: 100 squares, each worth the same stated amount; key counts equal the squares drawn; the rounding rule is visible in the code, not hidden in the drawing.\nStatic: Already static. For a build, fill the highlighted squares first.',
  sources: [{ type: 'original-example', file: 'assets/svg/waffle.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head"><em>${lost.label}</em> takes ${lostSquares} of every 100 litres put into the mains before they reach a tap</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · annual water balance of a regional supplier, 2025</span><span>Waffle chart, 1 square = 1%</span></p>`,
};
