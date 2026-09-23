// Template: 学会・研究発表 · 表紙（タイトル・発表者・所属）. Synthetic example content; replace data and copy.
// Plate illustration is generated from a seeded random walk so it is reproducible; it is a schematic, not measured imagery.
const ID = 'tpl-research-ja-cover';
const talk = {
  venue: '構造物画像解析シンポジウム 2026',
  session: '口頭発表 B-3',
  date: '2026年11月12日',
  title: 'ラベル50枚で、細いひび割れを<br>途切れずに捉える',
  sub: '自己教師あり事前学習と連結性損失による、少数ラベルの画素単位セグメンテーション',
  authors: [
    { name: '高瀬 美緒', aff: [1], presenter: true },
    { name: '森本 圭', aff: [2] },
    { name: '堀 直人', aff: [1] }
  ],
  affiliations: ['潮見台大学 大学院情報学研究科', '湊川インフラ技術研究所']
};

// --- seeded RNG (mulberry32) so the plate is identical on every build
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const r = rng(20261112);
const W = 472, PH = 420; // plate width / height in viewBox units
// aggregate stipple (concrete surface texture)
let stipple = '';
for (let i = 0; i < 520; i++) {
  const x = (r() * W).toFixed(1), y = (r() * PH).toFixed(1), rad = (0.5 + r() * r() * 2.4).toFixed(2);
  const tone = ['#cfc6b3', '#bdb3a0', '#d9d1c1', '#a99f8c'][Math.floor(r() * 4)];
  stipple += `<circle cx="${x}" cy="${y}" r="${rad}" fill="${tone}"/>`;
}
let stones = '';
for (let i = 0; i < 26; i++) {
  const cx = r() * W, cy = r() * PH, rad = 6 + r() * 12, n = 7;
  const pts = Array.from({ length: n }, (_, k) => { const a = (k / n) * Math.PI * 2 + r() * 0.4; const rr = rad * (0.7 + r() * 0.35); return `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr * 0.8).toFixed(1)}`; }).join(' ');
  stones += `<polygon points="${pts}" fill="#e3dccb" stroke="#d2c9b5" stroke-width=".8"/>`;
}
// crack: jittered walk from upper-left to lower-right, plus one branch
function walk(x0, y0, x1, y1, steps, amp) {
  const pts = [[x0, y0]];
  const dx = (x1 - x0) / steps, dy = (y1 - y0) / steps, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
  let off = 0;
  for (let i = 1; i <= steps; i++) { off = off * 0.55 + (r() - 0.5) * amp; const e = i === steps ? 0 : off; pts.push([x0 + dx * i + nx * e, y0 + dy * i + ny * e]); }
  return pts;
}
const main = walk(18, 58, 454, 350, 34, 22);
const branchStart = main[14];
const branch = walk(branchStart[0], branchStart[1], branchStart[0] + 40, 404, 14, 16);
const d = pts => 'M' + pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' L');
// zoom target on the crack
const zt = main[19];
const inset = { x: 302, y: 26, s: 144, n: 12 };
const cell = inset.s / inset.n;
// pixel rendering of a 2-px-wide crack across the inset grid
let pix = '', gt = '';
for (let c = 0; c < inset.n; c++) {
  const row = Math.round(3 + c * 0.42 + (c % 3 === 1 ? 1 : 0));
  for (const rr of [row, row + 1]) {
    if (rr >= inset.n) continue;
    const x = inset.x + c * cell, y = inset.y + rr * cell;
    gt += `<rect x="${x + 0.5}" y="${y + 0.5}" width="${cell - 1}" height="${cell - 1}" fill="#1c2433"/>`;
  }
}
for (let k = 0; k <= inset.n; k++) {
  pix += `<line x1="${inset.x + k * cell}" y1="${inset.y}" x2="${inset.x + k * cell}" y2="${inset.y + inset.s}" stroke="#cfc6b2" stroke-width=".6"/>`;
  pix += `<line x1="${inset.x}" y1="${inset.y + k * cell}" x2="${inset.x + inset.s}" y2="${inset.y + k * cell}" stroke="#cfc6b2" stroke-width=".6"/>`;
}
const reg = (x, y, sx, sy) => `<path d="M${x},${y + 14 * sy} V${y} H${x + 14 * sx}" fill="none" stroke="#1c2433" stroke-width="1.2"/>`;

const plate = `<svg viewBox="-10 -10 492 530" role="img" aria-labelledby="${ID}-t ${ID}-d">
<title id="${ID}-t">床版下面のひび割れと予測マスクの模式図</title>
<desc id="${ID}-d">コンクリート表面に枝分かれしたひび割れが走り、朱色の帯が予測マスクを示す。拡大図では、ひび割れが幅2画素の細線であることを12×12画素の格子で示す。乱数で生成した模式図であり、実測画像ではない。</desc>
<defs>
  <clipPath id="${ID}-clip"><rect x="0" y="0" width="${W}" height="${PH}"/></clipPath>
  <linearGradient id="${ID}-light" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#8f8570" stop-opacity=".18"/></linearGradient>
</defs>
<g clip-path="url(#${ID}-clip)">
  <rect width="${W}" height="${PH}" fill="#e9e3d4"/>
  ${stones}${stipple}
  <rect width="${W}" height="${PH}" fill="url(#${ID}-light)"/>
  <path d="${d(main)}" fill="none" stroke="#b2432a" stroke-opacity=".28" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="${d(branch)}" fill="none" stroke="#b2432a" stroke-opacity=".28" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="${d(main)}" fill="none" stroke="#1c2433" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="${d(branch)}" fill="none" stroke="#1c2433" stroke-width="1.5" stroke-linejoin="round"/>
</g>
${reg(-8, -8, 1, 1)}${reg(W + 8, -8, -1, 1)}${reg(-8, PH + 8, 1, -1)}${reg(W + 8, PH + 8, -1, -1)}
<circle cx="${zt[0].toFixed(1)}" cy="${zt[1].toFixed(1)}" r="13" fill="none" stroke="#1c2433" stroke-width="1.4"/>
<line x1="${(zt[0] - 9).toFixed(1)}" y1="${(zt[1] - 10).toFixed(1)}" x2="${inset.x - 6}" y2="${inset.y + inset.s + 32}" stroke="#1c2433" stroke-width="1"/>
<line x1="${(zt[0] + 12).toFixed(1)}" y1="${(zt[1] - 5).toFixed(1)}" x2="${inset.x + inset.s + 6}" y2="${inset.y + inset.s + 32}" stroke="#1c2433" stroke-width="1"/>
<rect x="${inset.x - 6}" y="${inset.y - 6}" width="${inset.s + 12}" height="${inset.s + 12}" fill="#fbfaf5" stroke="#1c2433" stroke-width="1.4"/>
${pix}${gt}
<rect x="${inset.x - 6}" y="${inset.y + inset.s + 6}" width="${inset.s + 12}" height="26" fill="#1c2433"/>
<text x="${inset.x + 4}" y="${inset.y + inset.s + 24}" class="s-white">拡大：1マス＝1画素</text>
<g transform="translate(0,${PH + 34})">
  <text x="0" y="0" class="s-fig">Fig. 0</text>
  <text x="56" y="0" class="s-lab">床版下面のひび割れ（黒）と予測マスク（朱の帯）</text>
  <text x="56" y="24" class="s-lab-s">模式図（縮尺なし）。幅1〜3画素の細線が骨材の模様に紛れる。</text>
</g>
</svg>`;

const authors = talk.authors.map(a => `<span${a.presenter ? ' class="rj-pres"' : ''}>${a.name}<sup>${a.aff.join(',')}</sup></span>`).join('<span aria-hidden="true">　</span>');
const affil = talk.affiliations.map((a, i) => `<sup>${i + 1}</sup>${a}`).join('　');

export default {
  study: true,
  id: ID,
  title: '表紙：ラベル50枚で細いひび割れを捉える',
  language: 'ja',
  notes: 'Purpose: 研究発表の表紙。何を達成したかを一文のタイトルで示し、発表者・所属・会議情報を一か所にまとめる。\nModify: talk オブジェクトの会議名・日付・タイトル・著者・所属を書き換える。発表者は presenter:true で下線表示。右の図版は研究対象の模式図に差し替える（実測画像を使う場合は出典と撮影条件を図説に書く）。\nInvariant: 所属番号と上付き数字の対応、模式図であることの明記、タイトルは主張を含む文にする。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-research-ja rj-cover',
  content: `<div class="rj-page">
<header class="rj-head"><span class="rj-sec"><b>${talk.venue}</b>　${talk.date}</span><span>${talk.session}</span></header>
<div class="rj-cover-col">
<h1 class="rj-cover-title" data-region="title">${talk.title}</h1>
<p class="rj-cover-sub" data-region="support">${talk.sub}</p>
<div class="rj-authors" data-region="support">${authors}<div class="rj-affil">${affil}</div></div>
</div>
<figure class="rj-fig rj-plate" data-region="primary">${plate}</figure>
<footer class="rj-foot" data-region="source"><span>記載の会議・所属・氏名・数値はすべて架空の例です</span><span class="rj-folio">1 / 6</span></footer>
</div>`
};
