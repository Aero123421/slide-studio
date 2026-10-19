// Diagram study · Sequence diagram — messages in order, with their real times on a separate rail.
// The engine's sequenceDiagram spaces messages by order only; a time rail at the left maps each
// row to its measured timestamp, so the reader sees where order and latency differ.
import { sequenceDiagram, measureNode, theme as makeTheme, svgRoot, el, g, textLines, linear, fmt } from '../runtime/figure.mjs';

const actors = [
  { id: 'card', label: 'Rider’s card' },
  { id: 'gate', label: 'Gate reader' },
  { id: 'fare', label: 'Fare service' },
  { id: 'net', label: 'Card network' },
  { id: 'bank', label: 'Issuing bank' },
];
const messages = [ // ms after the tap (illustrative median of one morning peak)
  { from: 'card', to: 'gate', label: 'tap: card token', kind: 'sync', ms: 0 },
  { from: 'gate', to: 'gate', label: 'check deny list', kind: 'self', ms: 40 },
  { from: 'gate', to: 'card', label: 'gate opens', kind: 'reply', ms: 180, opens: true },
  { from: 'gate', to: 'fare', label: 'tap record', kind: 'async', ms: 260 },
  { from: 'fare', to: 'net', label: '€0 authorisation', kind: 'sync', ms: 900 },
  { from: 'net', to: 'bank', label: 'authorise', kind: 'sync', ms: 1150 },
  { from: 'bank', to: 'net', label: 'approved', kind: 'reply', ms: 2050 },
  { from: 'net', to: 'fare', label: 'approved', kind: 'reply', ms: 2420, answer: true },
];
const opens = messages.find(m => m.opens), answer = messages.find(m => m.answer);
const sec = ms => fmt(ms / 1000, { digits: ms < 1000 ? 2 : 1 });

export function figure(theme = 'css') {
  const t = makeTheme(theme), id = 'sequence-diagram-fig', W = 1152, H = 470, size = 18, railW = 196, rowH = 47;
  const seqW = W - railW;
  const seq = sequenceDiagram({
    id: `${id}-seq`, theme: t, width: seqW, height: H, fontSize: size, rowHeight: rowH, actors,
    title: 'Messages', messages: messages.map(m => ({ ...m, emphasis: !!m.opens })),
  });
  // Unwrap the engine's <svg> so both drawings live in one root; ids stay namespaced.
  const inner = seq.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '').replace(/<title[\s\S]*?<\/title>/, '').replace(/<desc[\s\S]*?<\/desc>/, '');
  // Rows and lifelines, computed exactly as sequenceDiagram does them.
  const boxes = actors.map(a => measureNode({ ...a, kind: 'process' }, { size, maxWidth: 200, minWidth: 120 }));
  const headH = Math.max(...boxes.map(b => b.h));
  const rowY = k => headH + 24 + (k + 0.5) * rowH;
  const left = boxes[0].w / 2 + 6, right = seqW - boxes.at(-1).w / 2 - 6;
  const lifeX = id2 => railW + left + (actors.findIndex(a => a.id === id2) / (actors.length - 1)) * (right - left);
  const span = Math.ceil(Math.max(...messages.map(m => m.ms)) / 500) * 500;
  const y = linear([0, span], [rowY(0), rowY(messages.length - 1)]), axisX = 84, joinX = railW - 8;
  const parts = [];
  parts.push(textLines(['ms after tap'], { x: 0, y: rowY(0) - 26, size: 15, valign: 'bottom', fill: t.c('muted'), weight: 600 }));
  parts.push(el('line', { x1: axisX, x2: axisX, y1: y(0), y2: y(span), stroke: t.c('muted'), 'stroke-width': 1.4 }));
  for (let v = 0; v <= span; v += 500) parts.push(el('line', { x1: axisX - 5, x2: axisX, y1: y(v), y2: y(v), stroke: t.c('muted') }),
    textLines([fmt(v)], { x: axisX - 10, y: y(v), size: 15, anchor: 'end', valign: 'middle', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } }));
  messages.forEach((m, k) => {
    const em = !!m.opens, ty = y(m.ms), ry = rowY(k);
    const startX = Math.min(lifeX(m.from), lifeX(m.to)) - (m.kind === 'self' ? -4 : 6);
    // connector: true time on the rail → the message's row; a faint guide runs on to the arrow
    parts.push(el('path', { d: `M${axisX + 5} ${ty}C${axisX + 56} ${ty} ${joinX - 50} ${ry} ${joinX} ${ry}`, fill: 'none', stroke: em ? t.c('accent') : t.c('muted'), 'stroke-width': em ? 2 : 1.2, opacity: em ? 1 : 0.7 }),
      el('line', { x1: joinX, x2: startX, y1: ry, y2: ry, stroke: em ? t.c('accent') : t.c('muted'), 'stroke-width': 1, 'stroke-dasharray': '1.5 4', opacity: em ? 0.9 : 0.6 }),
      el('circle', { cx: axisX, cy: ty, r: em ? 5 : 3.5, fill: em ? t.c('accent') : t.c('ink') }));
  });
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'Tap-to-ride at a fare gate: messages in order, with their times after the tap',
    desc: `Five participants, ${messages.length} messages, time running downward. Rows are spaced by order, not by latency; the rail at left places each message at its measured time. Solid arrows are requests, dashed arrows replies, open arrowheads asynchronous messages. The gate opens ${sec(opens.ms)} s after the tap; the bank's approval reaches the fare service at ${sec(answer.ms)} s, after the rider has passed.` },
  parts, g({ transform: `translate(${railW},0)` }, inner));
}

export default {
  study: true,
  id: 'sequence-diagram',
  title: 'Sequence diagram: ordered messages and true time',
  className: 'st cs-terminal-dark',
  notes: 'Purpose: Show who sends what to whom, in order, and separately where the real time goes.\nModify: Edit `actors` and `messages` (kind sync/reply/async/self, ms after the start). The time rail, connectors, the accented message and the headline recompute.\nInvariant: Time runs downward and message direction is never reversed; equal row spacing means order only, so latency is stated on the rail or in labels, never implied by distance.\nStatic: Already static. For a build, pass build:{by:"mark"} to the sequence to reveal one message per click.',
  sources: [{ type: 'original-example', file: 'assets/svg/sequence-diagram.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">The <em>${opens.label}</em> ${sec(opens.ms)}&nbsp;s after the tap. The bank answers at ${sec(answer.ms)}&nbsp;s, after the rider is through</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · median times in one weekday morning peak; rows are order, the rail is time</span><span>Sequence diagram with time rail</span></p>`,
};
