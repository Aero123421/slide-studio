// Diagram study · Halftone field — tone built only from printable dots on a 45° screen.
// A shaded sphere is sampled on a rotated dot grid; each dot's area follows the local darkness.
import { svgRoot, el, g, theme as makeTheme, n, fmt } from '../runtime/figure.mjs';

// Print shops registered in the city, by survey year (illustrative).
const surveys = [
  { year: 1986, shops: 214 }, { year: 1996, shops: 188 }, { year: 2006, shops: 136 },
  { year: 2016, shops: 74 }, { year: 2026, shops: 41 },
];
const first = surveys[0], last = surveys.at(-1);
const years = last.year - first.year;
const lost = 1 - last.shops / first.shops;
const wari = Math.round(lost * 10);                 // 割 (tenths), as a Japanese editor would round it
const steepest = surveys.slice(1).map((d, i) => ({ from: surveys[i].year, to: d.year, drop: surveys[i].shops - d.shops }))
  .sort((p, q) => q.drop - p.drop)[0];             // the decade with the largest fall

// Screen: 45° (the traditional angle for black), dot pitch in px; the sphere is lit from the upper left.
const W = 1280, H = 720;
const motif = { cx: 1004, cy: 318, R: 292, pitch: 12, angle: 45, maxDot: 0.6, light: [-0.55, -0.62, 0.56], ambient: 0.1 };

export function figure(theme = 'css') {
  const t = makeTheme(theme), { cx, cy, R, pitch, maxDot } = motif;
  const L = Math.hypot(...motif.light), [lx, ly, lz] = motif.light.map(v => v / L);
  const a = (motif.angle * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
  // Darkness 0..1 at a point on the disc: 1 − Lambert term, so the lit side prints the smallest dots.
  const darkness = (x, y) => {
    const dx = (x - cx) / R, dy = (y - cy) / R, rr = dx * dx + dy * dy;
    if (rr >= 1) return 0;
    const dz = Math.sqrt(1 - rr), lambert = Math.max(0, dx * lx + dy * ly + dz * lz);
    return Math.min(1, motif.ambient + (1 - motif.ambient) * (1 - lambert) ** 1.15);
  };
  const dots = [], span = Math.ceil((R * 1.5) / pitch);
  for (let i = -span; i <= span; i++) for (let j = -span; j <= span; j++) {
    const x = cx + (i * ca - j * sa) * pitch, y = cy + (i * sa + j * ca) * pitch;
    if (x > W + pitch || y < -pitch || y > H + pitch) continue;
    const r = pitch * maxDot * Math.sqrt(darkness(x, y));           // dot area ∝ darkness, as in print
    if (r > 0.6) dots.push(`<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}"/>`);
  }
  return svgRoot({ id: 'halftone-field-fig', width: W, height: H, theme: t,
    title: '網点で描いた球',
    desc: `45度のスクリーンに並べた${dots.length}個の網点で、左上から光の当たる球を描いている。濃淡は点の大きさだけで作り、データは表していない。` },
  el('defs', {}, el('clipPath', { id: 'halftone-field-clip' }, el('rect', { x: 0, y: 0, width: W, height: H }))),
  g({ 'clip-path': 'url(#halftone-field-clip)', fill: t.c('ink') }, dots));
}

export default {
  study: true,
  id: 'halftone-field',
  language: 'ja',
  title: 'Halftone field: tone from printable dots',
  className: 'st st--full cs-editorial-vermilion',
  notes: 'Purpose: Give an editorial statement page a printed, tactile image whose tone comes only from dot size, the way a newspaper prints a photograph.\nModify: Replace `surveys`; the years, the share lost (rounded to 割), the steepest decade and the dek recompute. Change `motif.pitch` (keep it at 10 px or more), `angle` and `light` to restyle the sphere; move `cx/cy/R` to recrop it.\nInvariant: Dot area follows darkness; nothing else changes. Keep the pitch coarse enough to avoid moiré on projectors and in PDF; never place the screen behind body copy. The sphere encodes no data, and the page needs no accent colour.\nStatic: Already static. Check the PDF at 100% for moiré before delivery.',
  sources: [{ type: 'original-example', file: 'assets/svg/halftone-field.mjs' }],
  exportPolicy: 'final',
  content: `<figure class="st-fig" data-region="decoration">${figure()}</figure>
<h1 class="st-head" style="top:168px;max-width:540px;font-size:54px;line-height:1.3">町の印刷所は、${years}年で${wari}割減った</h1>
<p class="st-dek" style="top:356px;max-width:500px;word-break:auto-phrase">${first.year}年に${fmt(first.shops)}軒あった印刷所は、${last.year}年の調査では${fmt(last.shops)}軒。最も減ったのは${steepest.from}〜${steepest.to}年の10年間で、${steepest.drop}軒が廃業した。</p>
<p class="st-text st-muted" data-region="support" style="position:absolute;left:64px;top:580px;max-width:560px;font-size:17px;word-break:auto-phrase">図：45度の網点で刷った球。濃淡は点の大きさだけで作る。</p>
<p class="st-source" data-region="source"><span>架空のデータ · 市内の登録事業所数、10年ごとの調査</span><span>網点（ハーフトーン）</span></p>`,
};
