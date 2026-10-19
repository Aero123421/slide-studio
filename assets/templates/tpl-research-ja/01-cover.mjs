// Template: 学会発表（日本語） · 表紙. Synthetic example content; replace data and copy.
// Type-led cover: the title is the whole page. Authors carry superscript affiliation numbers;
// ○ before a name marks the presenter (the Japanese conference convention).
// The specimen on the right is the same 50×50-pixel patch as the background page (same geometry,
// same texture function), so the cover shows the subject itself at pixel scale, not a decoration.
import { el } from '../../runtime/figure.mjs';

const ID = 'tpl-research-ja-cover';
const talk = {
  title: ['ラベル50枚で学ぶ', 'ひび割れ検出'],             // two lines, broken between phrases
  subtitle: '細線を残す擬似ラベルによる半教師あり領域分割',
  authors: [                                              // aff: indexes into affiliations (1-based)
    { name: '高瀬 美緒', aff: [1], presenter: true },
    { name: '森本 圭', aff: [2] },
    { name: '堀 直人', aff: [1] },
  ],
  affiliations: ['潮見台大学 大学院情報学研究科', '湊川インフラ技術研究所'],
  venue: '第12回 構造物画像解析シンポジウム',
  date: { y: 2026, m: 11, d: 12 },                         // the day of the talk
  session: '口頭発表 B-3',
};
// Same crack as 02-background.mjs: [x, y, width] in patch pixels
const crack = {
  size: 50,
  main: [[-1, 11, 2.7], [6, 13, 2.6], [12, 16, 2.5], [17, 16.5, 2.3], [22, 20, 2.1], [27, 23, 1.8], [31, 27, 1.6], [36, 29, 1.3], [41, 33, 1.1], [46, 38, 1.0], [51, 40, 0.9]],
  branch: [[22, 20, 1.3], [24, 26, 1.1], [23, 32, 1.0], [26, 38, 0.9], [28, 44, 0.8], [30, 51, 0.8]],
};
const px = 6;                                              // drawn size of one image pixel (integer: no seams)
const N = crack.size, segs = [crack.main, crack.branch].flatMap(l => l.slice(1).map((p, i) => [l[i], p]));
const hash = (i, j) => { let h = (i * 374761393 + j * 668265263) ^ 0x5bd1e995; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const smooth = (x, y) => { const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, q = t => t * t * (3 - 2 * t);
  const a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1);
  return a + (b - a) * q(fx) + (c - a) * q(fy) + (a - b - c + d) * q(fx) * q(fy); };
function value(i, j) {
  let best = { gap: Infinity, w: 0, d: Infinity };
  const x = i + 0.5, y = j + 0.5;
  for (const [[x0, y0, w0], [x1, y1, w1]] of segs) {
    const vx = x1 - x0, vy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * vx + (y - y0) * vy) / (vx * vx + vy * vy)));
    const d = Math.hypot(x - (x0 + t * vx), y - (y0 + t * vy)), w = w0 + t * (w1 - w0);
    if (d - w / 2 < best.gap) best = { gap: d - w / 2, w, d };
  }
  const cover = Math.max(0, Math.min(1, best.w / 2 - best.d + 0.5));
  const ground = 0.76 + 0.07 * (smooth(i / 3, j / 3) - 0.5) + 0.05 * (hash(i + 97, j + 31) - 0.5);
  return Math.max(0, Math.min(1, ground - cover * (0.18 + 0.16 * Math.min(best.w, 3))));
}
const levels = 40, hex = v => { const k = Math.round(v * 255).toString(16).padStart(2, '0'); return `#${k}${k}${k}`; };
const runs = [];
for (let j = 0; j < N; j++) for (let i = 0; i < N;) {
  const q = Math.round(value(i, j) * (levels - 1)); let k = i + 1;
  while (k < N && Math.round(value(k, j) * (levels - 1)) === q) k++;
  runs.push(el('rect', { x: i * px, y: j * px, width: (k - i) * px, height: px, fill: hex(q / (levels - 1)) }));
  i = k;
}
const S = N * px;
const specimen = `<svg width="${S}" height="${S}" viewBox="0 0 ${S} ${S}" shape-rendering="crispEdges" role="img" aria-labelledby="${ID}-t"><title id="${ID}-t">点検画像の一部（${N}×${N}画素の模式図）。枝分かれしたひび割れが幅3画素から1画素へ細くなる</title>${runs.join('')}</svg>`;
const weekday = ['日', '月', '火', '水', '木', '金', '土'][new Date(Date.UTC(talk.date.y, talk.date.m - 1, talk.date.d)).getUTCDay()];
const dateText = `${talk.date.y}年${talk.date.m}月${talk.date.d}日（${weekday}）`;
const authors = talk.authors
  .map(a => `<span class="nw">${a.presenter ? '<i class="pres">○</i>' : ''}${a.name}<sup>${a.aff.join(',')}</sup></span>`).join('');
const affiliations = talk.affiliations.map((a, i) => `<span class="nw"><sup>${i + 1}</sup>${a}</span>`).join('');

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Research talk cover: title, authors, affiliations, venue and date',
  notes: 'Purpose: 発表の題目と、誰が・どこで・いつ話すのかを一目で伝える表紙。タイトルだけで研究の対象と条件（ラベル50枚・ひび割れ検出）がわかるようにする。\nModify: talk の title（2行に分けた配列）・subtitle・authors・affiliations・venue・date・session を書き換える。発表者に presenter:true を付けると名前の前に○が付く。曜日は date から自動で求める。\nInvariant: タイトルは2行以内で、句の途中で改行しない。著者の上付き数字と所属の番号を一致させる。会議名・日付・セッションは表紙にだけ置き、各ページには繰り返さない。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-research-ja rj-cover',
  content: `<p class="rj-venue" data-region="support"><b>${talk.venue}</b><span class="nw">${dateText}</span>　<span class="nw">${talk.session}</span></p>
<h1 class="rj-title" data-region="title">${talk.title.map(l => `<span class="nw">${l}</span>`).join('<br>')}</h1>
<p class="rj-sub" data-region="support">${talk.subtitle}</p>
<figure class="rj-fig rj-specimen" style="left:${1216 - S}px;top:184px" data-region="support">${specimen}<figcaption>点検画像の一部（${N}×${N}画素、模式図）</figcaption></figure>
<div class="rj-people" data-region="support">
  <p class="rj-authors">${authors}</p>
  <p class="rj-affil">${affiliations}</p>
</div>
`,
};
