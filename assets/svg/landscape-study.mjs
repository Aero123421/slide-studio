// Diagram study · Landscape planes — depth from a few flat planes: pale far ridges, darker near hills, a lit valley floor.
// Each ridge line is seeded noise with its own scale; the valley is a dip shared by the near planes.
import { svgRoot, el, theme as makeTheme, noise2D, pathFromPoints, textLines, sum } from '../runtime/figure.mjs';

// 湿地の調査：年ごとの確認種数と踏査日数（架空のデータ）。
const surveys = [
  { year: 2022, species: 38, days: 26 }, { year: 2023, species: 44, days: 29 }, { year: 2024, species: 51, days: 31 },
  { year: 2025, species: 57, days: 30 }, { year: 2026, species: 61, days: 32 },
];
const site = { name: '沢谷', wetlandHa: 2.4 };
const first = surveys[0], last = surveys.at(-1);
const days = sum(surveys.map(s => s.days));

// Planes from far to near: base height, relief, noise scale and tone (share of ink mixed into paper).
const W = 1280, H = 720;
const motif = {
  seed: 31, valley: { x: 868, width: 250 },
  planes: [
    { base: 352, relief: 34, scale: 2.2, dip: 0, tone: 0.1 },
    { base: 392, relief: 42, scale: 3.1, dip: 22, tone: 0.2 },
    { base: 436, relief: 46, scale: 4.2, dip: 70, tone: 0.36 },
    { base: 476, relief: 40, scale: 5.6, dip: 118, tone: 0.56 },
  ],
  floor: { base: 600, relief: 8, tone: 0.06 },
  wetland: { x: 872, y: 634, rx: 104, ry: 19, label: [1040, 640] },
};

export function figure(theme = 'css') {
  const t = makeTheme(theme), noise = noise2D(motif.seed), { valley } = motif;
  const ridge = (p, k) => {
    const pts = Array.from({ length: 129 }, (_, i) => {
      const x = (i / 128) * W, dip = p.dip * Math.exp(-(((x - valley.x) / valley.width) ** 2));
      return [x, p.base - p.relief * noise.fbm((x / W) * p.scale + k * 3.1, k * 1.7, 4) * 2 + dip];
    });
    return pathFromPoints([...pts, [W, H], [0, H]], { close: true });
  };
  const floorPts = Array.from({ length: 65 }, (_, i) => { const x = (i / 64) * W; return [x, motif.floor.base - motif.floor.relief * noise((x / W) * 3, 9.2)]; });
  const { wetland: w } = motif;
  // Wetland outline: an ellipse whose rim wavers a little, so it reads as water rather than a token.
  const marsh = (Array.from({ length: 72 }, (_, i) => {
    const a = (i / 72) * 2 * Math.PI, r = 1 + 0.36 * (noise(Math.cos(a) * 1.8 + 4, Math.sin(a) * 1.8 + 4) - 0.5) * 2;
    return [w.x + w.rx * r * Math.cos(a), w.y + w.ry * r * Math.sin(a)];
  }));
  return svgRoot({ id: 'landscape-study-fig', width: W, height: H, theme: t,
    title: '谷戸の風景：遠い尾根から谷底の湿地まで',
    desc: `遠くの淡い尾根から手前の濃い丘まで${motif.planes.length}枚の面を重ね、谷底の明るい平地に調査区の湿地を置いた架空の風景画。実在の場所ではない。` },
  motif.planes.map((p, k) => el('path', { d: ridge(p, k), fill: t.mix('ink', 'paper', p.tone) })),
  el('path', { d: pathFromPoints([...floorPts, [W, H], [0, H]], { close: true }), fill: t.mix('ink', 'paper', motif.floor.tone) }),
  el('path', { d: pathFromPoints(marsh, { curve: 'linear', close: true }), fill: t.c('accent') }),
  // Label on the lit valley floor, never on the dark hills.
  el('line', { x1: w.x + w.rx * 0.9, y1: w.y + 2, x2: w.label[0] - 10, y2: w.label[1], stroke: t.c('ink'), 'stroke-width': 1.2 }),
  textLines([`調査区の湿地 ${site.wetlandHa} ha`], { x: w.label[0], y: w.label[1], size: 17, valign: 'middle', fill: t.c('ink'), weight: 600 }));
}

export default {
  study: true,
  id: 'landscape-study',
  language: 'ja',
  title: 'Landscape planes: depth from a restrained set of layers',
  className: 'st st--full cs-field-survey',
  notes: 'Purpose: Give a field-survey report cover a sense of place and depth with a few flat planes, and point to the one site the report is about.\nModify: Replace `surveys` and `site`; the species counts, the years and the survey days recompute. Edit `motif.planes` (far to near: base, relief, noise scale, tone) and `valley` to reshape the land; move `wetland` to the site.\nInvariant: Original illustration, not a real place or a map. Tone darkens with nearness except the lit valley floor; text sits on the sky and on the floor, never on the ridges. One accent: the labelled survey wetland.\nStatic: Already static. The art comes first in the markup so the text paints above it.',
  sources: [{ type: 'original-example', file: 'assets/svg/landscape-study.mjs' }],
  exportPolicy: 'final',
  content: `<figure class="st-fig" data-region="decoration">${figure()}</figure>
<h1 class="st-head" style="top:64px;max-width:880px;font-size:46px;line-height:1.32;word-break:auto-phrase">${site.name}の湿地で確認した植物は、${surveys.length}年で${first.species}種から${last.species}種に増えた</h1>
<p class="st-dek" style="top:202px;max-width:760px;word-break:auto-phrase">${first.year}年から${last.year}年まで、延べ${days}日の踏査で記録した。谷戸の里山再生モニタリング報告。</p>
<p class="st-source" data-region="source"><span>架空のデータ · 風景は架空の谷戸を描いた装飾で、地図ではない</span><span>風景の面構成</span></p>`,
};
