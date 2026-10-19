// Diagram study · Perspective fan — converging rules and receding cross-rules from one vanishing point.
// Rays and cross-rules are both computed from the same vanishing point and horizon, so the floor
// stays a true one-point perspective however it is cropped.
import { svgRoot, el, g, theme as makeTheme, mixHex, fmt, sum } from '../runtime/figure.mjs';

// 売上高の実績と中期計画の目標（億円、架空のデータ）。
const segments = [
  { name: '国内', fy2026: 720, fy2029: 835 }, { name: '海外', fy2026: 225, fy2029: 365 },
];
const plan = { title: '中期経営計画 2027–2029', presented: '2027年5月14日', from: 2026, to: 2029 };
const start = sum(segments.map(s => s.fy2026)), goal = sum(segments.map(s => s.fy2029));
const years = plan.to - plan.from;
const cagr = (goal / start) ** (1 / years) - 1;
const overseas = segments.find(s => s.name === '海外');
const kanji = ['〇', '一', '二', '三', '四', '五'];

// Floor: rays from the vanishing point to the front edge, cross-rules at depths z = 1, 1 + d, 1 + 2d, …
const W = 1280, H = 720;
const motif = { vp: [1004, 284], front: 650, rays: { from: -7, to: 9, spacing: 66 }, depth: 0.55, rules: 14, horizon: 360 };   // horizon: how far the horizon line runs left of the vanishing point

const tone = (t, a, b, k) => (t.literal ? mixHex(t.hex(a), t.hex(b), k) : `color-mix(in srgb, ${t.c(a)}, ${t.c(b)} ${+(k * 100).toFixed(1)}%)`);

export function figure(theme = 'css') {
  const t = makeTheme(theme), [vx, vy] = motif.vp, f = motif.front - vy;      // f: drop from horizon to the front edge
  const { from, to, spacing } = motif.rays;
  const xFront = k => vx + k * spacing;                                       // where ray k meets the front edge
  const rays = [];
  for (let k = from; k <= to; k++) rays.push(el('line', { x1: vx, y1: vy, x2: xFront(k), y2: motif.front, 'stroke-width': k === 0 ? 1.4 : 1 }));
  // A cross-rule at depth z sits at y = horizon + f / z and spans between the outermost rays at that height.
  const rules = Array.from({ length: motif.rules }, (_, i) => {
    const z = 1 + i * motif.depth, y = vy + f / z, s = (y - vy) / f;
    return el('line', { x1: vx + from * spacing * s, y1: y, x2: vx + to * spacing * s, y2: y, 'stroke-width': Math.max(0.6, 1.4 / Math.sqrt(z)) });
  });
  return svgRoot({ id: 'perspective-fan-fig', width: W, height: H, theme: t,
    title: '一点透視の床',
    desc: `一つの消失点から${to - from + 1}本の線を手前の縁へ放ち、奥行きに応じた間隔で${motif.rules}本の横線を引いた一点透視の床。装飾であり、計測した図ではない。` },
  el('defs', {}, el('clipPath', { id: 'perspective-fan-clip' }, el('rect', { x: 0, y: 0, width: W, height: H }))),
  g({ 'clip-path': 'url(#perspective-fan-clip)', stroke: tone(t, 'paper', 'ink', 0.5), 'stroke-linecap': 'round' },
    el('line', { x1: vx - motif.horizon, y1: vy, x2: W, y2: vy, stroke: tone(t, 'paper', 'ink', 0.3), 'stroke-width': 1 }),
    rays, rules));
}

export default {
  study: true,
  id: 'perspective-fan',
  language: 'ja',
  title: 'Perspective fan: depth from one consistent vanishing point',
  className: 'st st--full cs-navy-classic-light',
  notes: 'Purpose: Give a plan cover a controlled sense of depth and direction with converging rules, without drawing a road or an arrow.\nModify: Replace `segments` and `plan`; the target, the growth rate, the increase and the overseas share recompute. Move the vanishing point with `motif.vp`; `rays` sets how many rules fan out and how far apart they land, `depth` how quickly the cross-rules close up.\nInvariant: One vanishing point and one horizon for every line; cross-rules are spaced by 1/z, never evenly. Lines only — no filled planes. Decorative field, not a measured projection; use a separate measured drawing for technical geometry.\nStatic: Already static. The art comes first in the markup so the text paints above it.',
  sources: [{ type: 'original-example', file: 'assets/svg/perspective-fan.mjs' }],
  exportPolicy: 'final',
  content: `<figure class="st-fig" data-region="decoration">${figure()}</figure>
<h1 class="st-head" style="top:120px;max-width:700px;font-size:46px;line-height:1.36;word-break:auto-phrase">${plan.to}年度に売上高${fmt(goal)}億円へ<br><span class="st-quiet" style="font-size:30px">年率${fmt(cagr * 100, { digits: 1 })}%の成長を${kanji[years]}年続ける</span></h1>
<p class="st-dek" style="top:300px;max-width:470px;word-break:auto-phrase">${plan.from}年度の実績${fmt(start)}億円から${fmt(goal - start)}億円の上積み。うち${fmt(overseas.fy2029 - overseas.fy2026)}億円を${overseas.name}事業で見込む。</p>
<p class="st-text st-muted" data-region="support" style="position:absolute;left:64px;top:560px;font-size:17px">${plan.title}（${plan.presented}）</p>
<p class="st-source" data-region="source"><span>架空のデータ · 線の扇は装飾で、計測した図ではない</span><span>一点透視の扇</span></p>`,
};
