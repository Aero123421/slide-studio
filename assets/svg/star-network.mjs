// Diagram study · Star network — every spoke runs through one hub; spoke length means nothing.
// Clinics sit evenly around the hub in order of courier time; minutes are written on each spoke
// and line weight follows daily samples. Totals, extremes and the headline are computed from data.
import { theme as makeTheme, svgRoot, el, g, textLines, measureText, boxPort, fmt } from '../runtime/figure.mjs';

const hub = { id: 'lab', label: '中央検査センター' };
const clinics = [ // 片道の搬送時間（分）と1日の検体数（架空）。並びは搬送時間の短い順
  { id: 'chuo', label: '中央通り医院', min: 9, samples: 330 },
  { id: 'minato', label: '港町クリニック', min: 18, samples: 310 },
  { id: 'yama', label: '山手クリニック', min: 21, samples: 260 },
  { id: 'sakura', label: '桜台診療所', min: 24, samples: 220 },
  { id: 'kawa', label: '川口診療所', min: 29, samples: 180 },
  { id: 'nishi', label: '西ヶ丘医院', min: 37, samples: 95 },
  { id: 'higashi', label: '東浦診療所', min: 44, samples: 120 },
  { id: 'kita', label: '北浜診療所', min: 52, samples: 140 },
];
// The only links are hub ↔ clinic; there is no clinic-to-clinic route.
const daily = clinics.reduce((s, c) => s + c.samples, 0);
const far = [...clinics].sort((a, b) => b.min - a.min)[0];
const near = [...clinics].sort((a, b) => a.min - b.min)[0];
const maxSamples = Math.max(...clinics.map(c => c.samples));

export function figure(theme = 'css') {
  const t = makeTheme(theme), id = 'star-network-fig', W = 800, H = 470, c = [396, 232], rx = 214, ry = 170;
  const hubW = measureText(hub.label, 19, { weight: 700 }) + 36, hubH = 50;
  const hubBox = { x: c[0] - hubW / 2, y: c[1] - hubH / 2, w: hubW, h: hubH };
  const spokes = [], marks = [], labels = [], pills = [];
  clinics.forEach((cl, i) => {
    // evenly spaced angles on an ellipse that uses the panel's width; distance from the hub means nothing
    const a = -Math.PI / 2 + (i / clinics.length) * 2 * Math.PI, x = c[0] + rx * Math.cos(a), y = c[1] + ry * Math.sin(a);
    const p = boxPort(hubBox, x, y, 2);
    spokes.push(el('line', { x1: p[0], y1: p[1], x2: x, y2: y, stroke: t.c('muted'), 'stroke-width': 1.5 + 6.5 * (cl.samples / maxSamples), 'stroke-linecap': 'round' }));
    marks.push(el('circle', { cx: x, cy: y, r: 8, fill: t.c('ink'), stroke: t.c('paper'), 'stroke-width': 3 }));
    // label outward from the hub: name, then daily samples
    const cos = Math.cos(a), sin = Math.sin(a), anchor = Math.abs(cos) < 0.3 ? 'middle' : cos > 0 ? 'start' : 'end';
    const lx = x + cos * 16, ly = y + sin * 16, vy = sin < -0.3 ? ly - 22 : sin > 0.3 ? ly + 6 : ly - 11;
    labels.push(textLines([cl.label], { x: lx, y: vy, size: 18, anchor, valign: 'top', fill: t.c('ink'), weight: 600 }),
      textLines([`検体${cl.samples}件/日`], { x: lx, y: vy + 22, size: 15, anchor, valign: 'top', fill: t.c('muted') }));
    // minutes in the middle of the visible spoke, between the hub's edge and the clinic
    const m = [(p[0] + x) / 2, (p[1] + y) / 2], text = `${cl.min}分`, w = measureText(text, 16, { weight: 700 }) + 18;
    pills.push(g({}, el('rect', { x: m[0] - w / 2, y: m[1] - 13, width: w, height: 26, rx: 13, fill: t.c('paper'), stroke: t.c('rule') }),
      textLines([text], { x: m[0], y: m[1], size: 16, anchor: 'middle', valign: 'middle', fill: t.c('ink'), weight: 700, attrs: { 'font-variant-numeric': 'tabular-nums' } })));
  });
  return svgRoot({ id, width: W, height: H, theme: t,
    title: '検体搬送のネットワーク：中央検査センターと8つの診療所',
    desc: `${clinics.length}つの診療所がそれぞれ1本の線で中央検査センターにつながる。診療所どうしの線はない。線の長さは配置の都合で、時間や距離を表さない。線上の数字は片道の搬送時間（分）、線の太さは1日の検体数。最短は${near.label}の${near.min}分、最長は${far.label}の${far.min}分。センターには1日${fmt(daily)}件が集まる。` },
  g({ class: 'star-network-spokes' }, spokes), marks, pills, labels,
  el('rect', { x: hubBox.x, y: hubBox.y, width: hubW, height: hubH, rx: 10, fill: t.c('accent') }),
  textLines([hub.label], { x: c[0], y: c[1], size: 19, anchor: 'middle', valign: 'middle', fill: t.c('onAccent'), weight: 700 }));
}

export default {
  study: true,
  id: 'star-network',
  language: 'ja',
  title: 'Star topology: one hub, spokes that are not distances',
  className: 'st st--rail cs-wa-ai',
  notes: 'Purpose: Show a hub-and-spoke network where every connection passes through one node, with travel time written on the links rather than implied by their length.\nModify: Edit `clinics` (minutes, daily samples). Spoke weights, minute labels, extremes, the rail and the headline recompute; clinics stay evenly spaced in the order given.\nInvariant: Spoke length is layout only and the page says so; every link is drawn and no clinic-to-clinic link is invented; repositioning nodes never changes who connects to whom.\nStatic: Already static. For a build, reveal the hub, then the spokes in order of minutes.',
  sources: [{ type: 'original-example', file: 'assets/svg/star-network.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head"><em>${hub.label}</em>が止まると、<span style="white-space:nowrap">1日${fmt(daily)}件</span>の検体がすべて行き場を失う</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<div class="st-rail" data-region="support">
  <div class="st-kpi"><b>${clinics.length}本</b><span>搬送路はセンターとの往復だけ。診療所どうしをつなぐ線はない。</span></div>
  <hr class="st-rule">
  <div class="st-kpi"><b>${far.min}分</b><span>最も遠い${far.label}からの片道。線の長さは時間を表さない。</span></div>
</div>
<p class="st-source" data-region="source"><span>架空のデータ · 線上の数字は片道の搬送時間、線の太さは1日の検体数</span><span>スター型ネットワーク図</span></p>`,
};
