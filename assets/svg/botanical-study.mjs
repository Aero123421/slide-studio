// Diagram study · Botanical line study — a tea branch drawn from a stem curve and a parametric leaf.
// Every leaf is the same function (outline with serrations, midrib, paired veins) placed along the
// stem at alternating angles, so stroke weights and proportions stay consistent across the drawing.
import { svgRoot, el, g, theme as makeTheme, mixHex, pathFromPoints, textLines } from '../runtime/figure.mjs';

// 茶園の摘採計画（架空）。一番茶は立春から数えて八十八夜目に摘みはじめる。
const garden = { name: '沢谷茶園', hectares: 3.2 };
const risshun = '2027-02-04';
const flushes = [{ name: '一番茶', days: 12 }, { name: '二番茶', start: '2027-06-20', days: 10 }];
const day = (iso, plus = 0) => { const d = new Date(`${iso}T00:00Z`); d.setUTCDate(d.getUTCDate() + plus); return d; };
const md = d => `${d.getUTCMonth() + 1}月${d.getUTCDate()}日`;
const hachiju = day(risshun, 87);                     // 立春を1日目として88日目

// Stem: one cubic Bézier from below the page to the tip; leaves: [t on stem, side, length].
const W = 1280, H = 720;
const motif = {
  stem: [[232, 656], [168, 486], [500, 320], [404, 104]],      // a cut sprig: the stem ends above the source line
  leaves: [[0.12, -1, 150], [0.27, 1, 156], [0.42, -1, 146], [0.56, 1, 132], [0.68, -1, 114], [0.79, 1, 94]],
  young: [[0.9, -1, 70], [0.95, 1, 58]],             // the two young leaves of 一芯二葉
  bud: 48, angle: 48, width: 0.4, teeth: 14,
};

const tone = (t, a, b, k) => (t.literal ? mixHex(t.hex(a), t.hex(b), k) : `color-mix(in srgb, ${t.c(a)}, ${t.c(b)} ${+(k * 100).toFixed(1)}%)`);

export function figure(theme = 'css') {
  const t = makeTheme(theme), [P0, P1, P2, P3] = motif.stem;
  const B = s => [0, 1].map(i => (1 - s) ** 3 * P0[i] + 3 * (1 - s) ** 2 * s * P1[i] + 3 * (1 - s) * s ** 2 * P2[i] + s ** 3 * P3[i]);
  const dB = s => [0, 1].map(i => 3 * (1 - s) ** 2 * (P1[i] - P0[i]) + 6 * (1 - s) * s * (P2[i] - P1[i]) + 3 * s ** 2 * (P3[i] - P2[i]));
  const ink = t.c('ink'), vein = tone(t, 'paper', 'ink', 0.62);
  // One leaf: axis from `base` along angle `a` (radians), slightly curved; serrated margin; midrib and veins.
  const leaf = (base, a, L, { wash = 0.06, folded = 1 } = {}) => {
    const ux = Math.cos(a), uy = Math.sin(a), vx = -uy, vy = ux, half = (L * motif.width * folded) / 2;
    const axis = s => [base[0] + ux * L * s + vx * L * 0.06 * Math.sin(Math.PI * s), base[1] + uy * L * s + vy * L * 0.06 * Math.sin(Math.PI * s)];
    const width = s => half * Math.sin(Math.PI * Math.min(1, s ** 0.9)) ** 0.85;
    const saw = s => (s > 0.12 && s < 0.94 ? 0.05 * (1 - Math.abs(2 * ((s * motif.teeth) % 1) - 1)) : 0);
    const side = sign => Array.from({ length: 61 }, (_, i) => {
      const s = i / 60, [x, y] = axis(s), w = width(s) * (1 + saw(s)) * sign;
      return [x + vx * w, y + vy * w];
    });
    const outline = pathFromPoints([...side(1), ...side(-1).reverse()], { close: true });
    const veins = [];
    for (let j = 1; j <= 6; j++) for (const sign of [1, -1]) {
      const s0 = 0.1 + j * 0.115, s1 = Math.min(0.97, s0 + 0.13), [x0, y0] = axis(s0), [x1, y1] = axis(s1), w1 = width(s1) * 0.86 * sign;
      const [mx, my] = axis((s0 + s1) / 2), wm = width((s0 + s1) / 2) * 0.42 * sign;
      veins.push(el('path', { d: `M${x0.toFixed(1)} ${y0.toFixed(1)}Q${(mx + vx * wm).toFixed(1)} ${(my + vy * wm).toFixed(1)} ${(x1 + vx * w1).toFixed(1)} ${(y1 + vy * w1).toFixed(1)}` }));
    }
    const midrib = pathFromPoints(Array.from({ length: 21 }, (_, i) => axis((i / 20) * 0.97)));
    return g({},
      el('path', { d: outline, fill: tone(t, 'paper', 'ink', wash), stroke: ink, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }),
      el('path', { d: midrib, fill: 'none', stroke: ink, 'stroke-width': 1.1 }),
      g({ fill: 'none', stroke: vein, 'stroke-width': 0.9, 'stroke-linecap': 'round' }, veins));
  };
  const place = ([s, side, L], opts) => {
    const [dx, dy] = dB(s), a = Math.atan2(dy, dx) + side * (motif.angle * Math.PI) / 180, base = B(s);
    const stalk = [base[0] + Math.cos(a) * 9, base[1] + Math.sin(a) * 9];
    return g({}, el('line', { x1: base[0], y1: base[1], x2: stalk[0], y2: stalk[1], stroke: ink, 'stroke-width': 1.6, 'stroke-linecap': 'round' }), leaf(stalk, a, L, opts));
  };
  const stem = pathFromPoints(Array.from({ length: 61 }, (_, i) => B(i / 60)));
  const tip = B(1), [tx, ty] = dB(1), ta = Math.atan2(ty, tx);
  // The bud (芯): a slender closed point continuing the stem.
  const bud = leaf(tip, ta, motif.bud, { wash: 0.02, folded: 0.55 });
  const mark = B(0.865), label = [mark[0] - 150, mark[1] - 66];
  return svgRoot({ id: 'botanical-study-fig', width: W, height: H, theme: t,
    title: '茶の枝の線描',
    desc: `茶の枝を、同じ形の葉${motif.leaves.length}枚と枝先の一芯二葉で描いた線画。葉は鋸歯のある輪郭・主脈・側脈を一つの関数から作り、太さをそろえている。植物学的な図鑑ではない。` },
  el('defs', {}, el('clipPath', { id: 'botanical-study-clip' }, el('rect', { x: 0, y: 0, width: W, height: H }))),
  g({ 'clip-path': 'url(#botanical-study-clip)' },
    el('path', { d: stem, fill: 'none', stroke: ink, 'stroke-width': 2.4, 'stroke-linecap': 'round' }),
    motif.leaves.map(l => place(l)),
    motif.young.map(l => place(l, { wash: 0.02, folded: 0.8 })),
    bud,
    // The plucking point: a vermilion dot on the stem, labelled; everything above it is 一芯二葉.
    el('path', { d: `M${(mark[0] - 8).toFixed(1)} ${mark[1].toFixed(1)}L${(label[0] + 26).toFixed(1)} ${(label[1] + 46).toFixed(1)}H${(label[0] + 6).toFixed(1)}`, fill: 'none', stroke: ink, 'stroke-width': 1 }),
    el('circle', { cx: mark[0], cy: mark[1], r: 4.5, fill: t.c('accent') }),
    textLines(['一芯二葉', 'この点から上を摘む'], { x: label[0], y: label[1], size: 17, lineHeight: 1.45, valign: 'top', anchor: 'end', fill: ink, weight: 600 }),
    // The cut end of the sprig.
    el('path', { d: `M${(P0[0] - 5).toFixed(1)} ${(P0[1] + 4).toFixed(1)}L${(P0[0] + 5).toFixed(1)} ${(P0[1] - 4).toFixed(1)}`, stroke: ink, 'stroke-width': 1.4, 'stroke-linecap': 'round' })));
}

export default {
  study: true,
  id: 'botanical-study',
  language: 'ja',
  title: 'Botanical line study: organic line and negative space',
  className: 'st st--full cs-wa-sumi',
  notes: 'Purpose: Give an editorial page an organic, hand-drawn quality with one refined line drawing and generous negative space, here for a tea garden\'s plucking plan.\nModify: Edit `risshun`, `flushes` and `garden`; the start date (88th night), the second flush and the dek recompute. Change `motif.stem` (one cubic curve), `leaves` ([position on stem, side, length]), `angle`, `width` and `teeth` to redraw the branch.\nInvariant: Every leaf comes from the same leaf function, so strokes and proportions match; stylised illustration, not botanical evidence. One vermilion mark, the dot that the label 一芯二葉 points to.\nStatic: Already static. The art comes first in the markup so the text paints above it.',
  sources: [{ type: 'original-example', file: 'assets/svg/botanical-study.mjs' }],
  exportPolicy: 'final',
  content: `<figure class="st-fig" data-region="decoration">${figure()}</figure>
<h1 class="st-head" style="left:660px;top:200px;max-width:540px;font-size:44px;line-height:1.4;word-break:auto-phrase">八十八夜の${md(hachiju)}から、一番茶を摘みはじめる</h1>
<p class="st-dek" style="left:660px;top:360px;max-width:520px;color:var(--ss-ink);word-break:auto-phrase">立春（${md(day(risshun))}）から数えて88日目。摘むのは枝先の一芯二葉だけで、${garden.hectares} haの茶園を${flushes[0].days}日で摘み終える。${flushes[1].name}は${md(day(flushes[1].start))}から。</p>
<p class="st-source" data-region="source"><span>架空のデータ · ${garden.name}の摘採計画。枝の絵は様式化した線画</span><span>植物の線描</span></p>`,
};
