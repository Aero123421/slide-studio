// Template: 学会・研究発表 · 背景と問い（概念図）. Synthetic example content; replace data and copy.
const ID = 'tpl-research-ja-background';
// One source of truth for every number on the page
const data = { unlabeled: 12000, labeled: 50, fullLabeled: 2400, perTile: 50, minutesPerImage: 40, bridges: 3 };
const hoursFor = n => Math.round((n * data.minutesPerImage) / 60);
const fmt = n => n.toLocaleString('ja-JP');

// (a) one square = 50 images
const cols = 20, tiles = data.unlabeled / data.perTile, rows = Math.ceil(tiles / cols), ts = 14, tg = 3;
const ax = 0, ay = 52;
let grid = '';
for (let i = 0; i < tiles; i++) {
  const c = i % cols, r = Math.floor(i / cols);
  grid += `<rect x="${ax + c * (ts + tg)}" y="${ay + r * (ts + tg)}" width="${ts}" height="${ts}" fill="#c9d6e6"/>`;
}
const gw = cols * (ts + tg) - tg, gh = rows * (ts + tg) - tg;
// labeled images are a separate set, drawn next to the unlabeled pool
const lx = ax, ly = ay + gh + 28;

// (b) pixel view: ground truth vs. a baseline prediction with breaks
const pc = 15, pr = 7, cs = 15;
const gtCells = [];
for (let c = 0; c < pc; c++) { const r0 = Math.round(1 + c * 0.25 + (c % 5 === 2 ? 1 : 0)); gtCells.push([c, r0], [c, r0 + 1]); }
const breaks = [5, 6, 11];              // columns where the baseline prediction loses the line
const predCells = gtCells.filter(([c]) => !breaks.includes(c));
function pixelPanel(x, y, cells, label, marks) {
  let s = `<rect x="${x}" y="${y}" width="${pc * cs}" height="${pr * cs}" fill="#fbfaf5" stroke="#1c2433" stroke-width="1"/>`;
  for (let k = 1; k < pc; k++) s += `<line x1="${x + k * cs}" y1="${y}" x2="${x + k * cs}" y2="${y + pr * cs}" stroke="#e2dccd" stroke-width=".8"/>`;
  for (let k = 1; k < pr; k++) s += `<line x1="${x}" y1="${y + k * cs}" x2="${x + pc * cs}" y2="${y + k * cs}" stroke="#e2dccd" stroke-width=".8"/>`;
  s += cells.map(([c, r]) => `<rect x="${x + c * cs + 1}" y="${y + r * cs + 1}" width="${cs - 2}" height="${cs - 2}" fill="#1c2433"/>`).join('');
  if (marks) {
    const groups = [[5, 6], [11]];
    s += groups.map(g => {
      const cx = x + (g[0] + g.length / 2) * cs, ys = gtCells.filter(([c]) => g.includes(c)).map(([, r]) => r);
      const cy = y + ((Math.min(...ys) + Math.max(...ys) + 1) / 2) * cs, rx = g.length * cs / 2 + 6, ry = (Math.max(...ys) - Math.min(...ys) + 1) * cs / 2 + 6;
      return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#b2432a" stroke-width="2" stroke-dasharray="4 3"/>`;
    }).join('');
  }
  s += `<text x="${x}" y="${y - 10}" class="s-lab-b">${label}</text>`;
  return s;
}
const bx = 432, p2y = 84 + pr * cs + 42;
const fig = `<svg viewBox="0 0 760 360" role="img" aria-labelledby="${ID}-t ${ID}-d">
<title id="${ID}-t">ラベルの偏りと細線の途切れを示す概念図</title>
<desc id="${ID}-d">(a) 未ラベル画像${fmt(data.unlabeled)}枚を1マス50枚の格子${tiles}マスで示し、ラベル付き画像${data.labeled}枚は1マスに相当する。(b) 幅2画素のひび割れの正解マスクと、従来法の予測で3か所の画素が欠けて線が2か所で途切れる様子を画素格子で示す。</desc>
<text x="0" y="18" class="s-head">(a) ラベルの偏り</text>
<text x="0" y="42" class="s-lab-s">1マス＝画像${data.perTile}枚</text>
${grid}
<rect x="${lx}" y="${ly - 12}" width="${ts}" height="${ts}" fill="#c9d6e6"/>
<text x="${lx + ts + 10}" y="${ly}" class="s-lab"><tspan class="s-num-b">${fmt(data.unlabeled)}</tspan> 枚　未ラベル（${data.bridges}橋の点検画像）</text>
<rect x="${lx}" y="${ly + 14}" width="${ts}" height="${ts}" fill="#b2432a"/>
<text x="${lx + ts + 10}" y="${ly + 26}" class="s-lab"><tspan class="s-num-b">${data.labeled}</tspan> 枚　ラベル付き（同じ${data.bridges}橋から抽出）</text>
<text x="${lx}" y="${ly + 54}" class="s-lab-s">ラベル付きは未ラベルの${fmt(data.unlabeled / data.labeled)}分の1</text>
<line x1="${bx - 32}" y1="0" x2="${bx - 32}" y2="330" stroke="#cfc6b2" stroke-width=".75"/>
<text x="${bx}" y="18" class="s-head">(b) 細線の途切れ</text>
<text x="${bx}" y="42" class="s-lab-s">1マス＝1画素・幅2画素のひび割れ</text>
${pixelPanel(bx, 84, gtCells, '正解マスク', false)}
${pixelPanel(bx, p2y, predCells, '少数ラベルでの従来法の予測', true)}
<text x="${bx + pc * cs + 14}" y="${p2y + pr * cs / 2 - 2}" class="s-lab-b">途切れ</text>
<text x="${bx + pc * cs + 14}" y="${p2y + pr * cs / 2 + 18}" class="s-lab-s">2か所</text>
</svg>`;

export default {
  study: true,
  id: ID,
  title: '背景と問い：細いひび割れほどラベルが足りない',
  language: 'ja',
  notes: 'Purpose: 研究の動機（データの偏りと細線の途切れ）を概念図で示し、検証する問いを一文で置く。\nModify: data オブジェクトの枚数・作業時間を実データに合わせる。格子は 1マス＝perTile 枚で自動生成される。(b) の画素図は研究対象の典型的な失敗に描き替える。\nInvariant: 概念図の格子は枚数に比例させる（1マスの単位を明記）。問いは検証可能な条件（枚数・比較対象・指標）を含める。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-research-ja rj-background',
  content: `<div class="rj-page">
<header class="rj-head"><span class="rj-sec"><span class="rj-secno">§1</span><b>背景と問い</b></span><span>構造物画像解析シンポジウム 2026　口頭発表 B-3</span></header>
<h1 class="rj-title" data-region="title">細いひび割れほど、画素単位のラベルが足りない</h1>
<ol class="rj-points" data-region="support">
  <li><strong>未ラベル画像は十分にある</strong>${data.bridges}橋の定期点検だけで、<span class="rj-num">${fmt(data.unlabeled)}</span>枚の画像が集まった。</li>
  <li><strong>画素単位のラベルは高くつく</strong>1枚あたり平均<span class="rj-num">${data.minutesPerImage}</span>分。<span class="rj-num">${data.labeled}</span>枚なら約<span class="rj-num">${hoursFor(data.labeled)}</span>時間、<span class="rj-num">${fmt(data.fullLabeled)}</span>枚では約<span class="rj-num">${fmt(hoursFor(data.fullLabeled))}</span>時間かかる。</li>
  <li><strong>細線は途切れやすい</strong>幅1〜3画素のひび割れは予測が分断されやすく、本数や長さの集計を誤らせる。</li>
</ol>
<figure class="rj-fig" style="left:456px;top:170px;width:760px;height:360px" data-region="primary">${fig}</figure>
<p class="rj-question" data-region="primary">ラベル<em>${data.labeled}枚</em>と未ラベル画像${fmt(data.unlabeled)}枚から、全${fmt(data.fullLabeled)}枚で学習したモデルに近い<em>精度と連結性</em>を得られるか。</p>
<footer class="rj-foot" data-region="source"><span>図中の枚数・作業時間は説明用の架空データ</span><span class="rj-folio">2 / 6</span></footer>
</div>`
};
