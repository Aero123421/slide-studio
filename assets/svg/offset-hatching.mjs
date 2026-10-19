// Diagram study · Offset hatching — a title-page margin textured by rows of short marks, each row offset by half a step.
// Mark length and weight shrink toward the text column, so the texture thins out instead of ending in a hard edge.
import { svgRoot, el, g, theme as makeTheme, mixHex, fmt } from '../runtime/figure.mjs';

// Commodities named in the archive's merchants' letters, 1868–1913 (illustrative; a letter can name several).
const letters = 1240;
const mentions = [
  { commodity: 'grain', letters: 538 }, { commodity: 'cotton', letters: 211 }, { commodity: 'timber', letters: 190 },
  { commodity: 'coal', letters: 164 }, { commodity: 'wool', letters: 97 },
];
const years = [1868, 1913];
const top = [...mentions].sort((a, b) => b.letters - a.letters)[0];
const runner = [...mentions].sort((a, b) => b.letters - a.letters)[1];
const talk = { series: 'Port Ellery Lectures in Economic History', speaker: 'Dr Mara Quist', date: '12 March 2027' };
const cap = s => s[0].toUpperCase() + s.slice(1);

// Margin field: rows of marks at `angle`, `step` apart, odd rows shifted by half a step.
const W = 1280, H = 720;
const motif = { width: 300, step: 24, row: 22, angle: 62, length: [15, 5], weight: [2, 0.9] };

const tone = (t, a, b, k) => (t.literal ? mixHex(t.hex(a), t.hex(b), k) : `color-mix(in srgb, ${t.c(a)}, ${t.c(b)} ${+(k * 100).toFixed(1)}%)`);

export function figure(theme = 'css') {
  const t = makeTheme(theme), { width, step, row, angle } = motif, a = (angle * Math.PI) / 180;
  const marks = [];
  for (let j = 0; j * row < H + row; j++) for (let i = 0; i * step < width + step; i++) {
    const x = i * step + (j % 2 ? step / 2 : 0), y = j * row;
    const u = Math.min(1, x / width);                          // 0 at the page edge, 1 at the inner edge of the margin
    if (u >= 1) continue;
    const len = motif.length[0] + (motif.length[1] - motif.length[0]) * u ** 1.4, w = motif.weight[0] + (motif.weight[1] - motif.weight[0]) * u;
    const dx = (Math.cos(a) * len) / 2, dy = (Math.sin(a) * len) / 2;
    marks.push(el('line', { x1: x - dx, y1: y + dy, x2: x + dx, y2: y - dy, 'stroke-width': +w.toFixed(2) }));
  }
  return svgRoot({ id: 'offset-hatching-fig', width: W, height: H, theme: t,
    title: 'Offset hatching in the left margin',
    desc: `Rows of short diagonal marks fill the left margin, each row shifted by half a step; the marks shorten and thin toward the text so the texture fades out. ${marks.length} marks, decoration only.` },
  g({ stroke: tone(t, 'paper', 'ink', 0.55), 'stroke-linecap': 'round' }, marks));
}

export default {
  study: true,
  id: 'offset-hatching',
  title: 'Offset hatching: a quiet texture for a title-page margin',
  className: 'st st--full cs-journal-serif',
  notes: 'Purpose: Give a title page a consistent, printed texture in its margin that stays subordinate to the title.\nModify: Edit `mentions`, `letters`, `years` and `talk`; the commodity named most, the runner-up and the counts recompute. Change `motif.width` for a wider margin, `step`/`row` for density, `angle` for the slant, `length`/`weight` for how the marks fade toward the text.\nInvariant: One mark, one angle, one offset rule — density and weight change, never the motif; no random ornaments. The field stays in the margin and never runs behind text.\nStatic: Already static. The art comes first in the markup so the text paints above it.',
  sources: [{ type: 'original-example', file: 'assets/svg/offset-hatching.mjs' }],
  exportPolicy: 'final',
  content: `<figure class="st-fig" data-region="decoration">${figure()}</figure>
<h1 class="st-head" style="left:380px;top:150px;max-width:800px;font-size:56px;line-height:1.1;font-weight:400">${cap(top.commodity)}, not ${runner.commodity}: what ${fmt(letters)} merchants' letters say about the port, ${years[0]}–${years[1]}</h1>
<p class="st-dek" style="left:380px;top:396px;max-width:720px;text-wrap:balance">${cap(top.commodity)} is named in ${fmt(top.letters)} of the letters, ${(top.letters / runner.letters).toFixed(1)} times as often as ${runner.commodity}, the trade the port is remembered for.</p>
<p class="st-text" data-region="support" style="position:absolute;left:380px;top:540px;font-size:20px;line-height:1.45">${talk.speaker}<br><span style="color:var(--ss-muted)">${talk.series}, ${talk.date}</span></p>
<p class="st-source" style="left:380px" data-region="source"><span>Illustrative data · fictional archive; the hatching is decorative</span><span>Offset hatching</span></p>`,
};
