// Template: 戦略提案（コンサル型）· 2×2優先度マトリクス. Synthetic example content; replace data and copy.
// Each move: ease score (1–5), profit impact (億円), investment (億円, bubble AREA). Quadrants follow the stated thresholds.
const P = 'tpl-strategy-priority-matrix';
const moves = [
  {k: 'A', name: '付帯作業の有償化', ease: 4.4, impact: 2.2, inv: 0.3, lab: 't'},
  {k: 'B', name: '高採算業種へ営業を集中', ease: 4.1, impact: 0.8, inv: 0.2, lab: 'l'},
  {k: 'C', name: '拠点統合（川口→戸田）', ease: 3.4, impact: 2.6, inv: 6, lab: 't'},
  {k: 'D', name: '仕分けの部分自動化', ease: 3.1, impact: 2.0, inv: 18, lab: 'r'},
  {k: 'E', name: '全自動倉庫の新設', ease: 1.3, impact: 3.2, inv: 60, lab: 'r'},
  {k: 'F', name: '3PL大手へ一部委託', ease: 2.2, impact: 1.2, inv: 0.5, lab: 'r'},
  {k: 'G', name: '配送ルート最適化', ease: 3.6, impact: 0.5, inv: 1.5, lab: 'l'},
  {k: 'H', name: '夜間シフトの縮小', ease: 4.6, impact: 0.45, inv: 0, lab: 'l'}
];
const easeCut = 3.0, impactCut = 0.6;
const W = 760, H = 480, L = 70, R = 740, T = 30, B = 420, xMin = 1, xMax = 5, yMax = 4;
const x = v => L + (v - xMin) / (xMax - xMin) * (R - L), y = v => B - v / yMax * (B - T);
const rad = inv => 6 + Math.sqrt(inv) * 3.6;
const top = moves.filter(m => m.ease >= easeCut && m.impact >= impactCut).sort((a, b) => b.impact - a.impact);
const rest = moves.filter(m => !top.includes(m));

const quad = `<rect x="${x(easeCut)}" y="${T}" width="${R - x(easeCut)}" height="${y(impactCut) - T}" fill="#e2eeeb"/>
  <rect x="${L}" y="${T}" width="${R - L}" height="${B - T}" fill="none" stroke="#b8bdc2"/>
  <line x1="${x(easeCut)}" x2="${x(easeCut)}" y1="${T}" y2="${B}" stroke="#1c2024" stroke-width="1.2" stroke-dasharray="4 4"/>
  <line x1="${L}" x2="${R}" y1="${y(impactCut)}" y2="${y(impactCut)}" stroke="#1c2024" stroke-width="1.2" stroke-dasharray="4 4"/>
  <text x="${R - 12}" y="${T + 24}" text-anchor="end" style="font:700 16px var(--s-jp);fill:#0d5c4f">最優先で着手</text>
  <text x="${L + 12}" y="${T + 24}" class="s-sv-m" style="font-weight:700">条件付きで検討</text>
  <text x="${R - 12}" y="${B - 12}" text-anchor="end" class="s-sv-m" style="font-weight:700">すぐ実行（効果小）</text>
  <text x="${L + 12}" y="${B - 12}" class="s-sv-m" style="font-weight:700">見送り</text>`;
const axes = [1, 2, 3, 4, 5].map(v => `<text x="${x(v)}" y="${B + 22}" text-anchor="middle" class="s-sv-n" style="font-size:15px;fill:#646a71">${v}</text>`).join('')
  + [0, 1, 2, 3, 4].map(v => `<text x="${L - 10}" y="${y(v) + 5}" text-anchor="end" class="s-sv-n" style="font-size:15px;fill:#646a71">${v}</text>`).join('')
  + `<text x="${R}" y="${B + 50}" text-anchor="end" class="s-sv-b">実行の容易さ（投資額・期間・組織負荷の総合点）→</text>
     <text x="${L - 10}" y="${T - 12}" class="s-sv-b">↑ 2029年度の利益改善額（億円）</text>`;
const bubbles = moves.map(m => {
  const cx = x(m.ease), cy = y(m.impact), r = rad(m.inv), isTop = top.includes(m);
  const pos = {t: [cx, cy - r - 9, 'middle'], r: [cx + r + 8, cy + 5, 'start'], l: [cx - r - 8, cy + 5, 'end']}[m.lab];
  return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${isTop ? '#0d5c4f' : '#ffffff'}" fill-opacity="${isTop ? 0.92 : 1}" stroke="${isTop ? '#0d5c4f' : '#646a71'}" stroke-width="1.5"/>
    ${r >= 12 ? `<text x="${cx.toFixed(1)}" y="${(cy + 6).toFixed(1)}" text-anchor="middle" style="font:700 16px var(--s-fig);fill:${isTop ? '#fff' : '#1c2024'}">${m.k}</text>` : ''}
    <text x="${pos[0].toFixed(1)}" y="${pos[1].toFixed(1)}" text-anchor="${pos[2]}" style="font:${isTop ? 700 : 400} 15px var(--s-jp);fill:${isTop ? '#1c2024' : '#40464d'}">${r >= 12 ? '' : m.k + ' '}${m.name}</text>`;
}).join('');

const track = ['論点', '優先度', '選択肢', '推奨', '実行'].map((t, i) => `<span${i === 1 ? ' class="on"' : ''}>${t}</span>`).join('');

export default {
  study: true,
  id: 'tpl-strategy-priority-matrix',
  title: '2×2優先度マトリクス — 効果と実行の容易さ',
  language: 'ja',
  notes: 'Purpose: 候補となる打ち手を「効果」と「実行の容易さ」の2軸で並べ、最優先の組み合わせを決める。\nModify: moves の ease（1〜5）・impact（億円）・inv（億円）を差し替える。閾値 easeCut・impactCut を変えると象限と右の一覧が追従する。lab はラベルの位置（t/r/l）。\nInvariant: 円の面積は投資額に比例（半径は平方根）。象限の境界は明記した閾値で、目分量で分けない。\nStatic: Already static.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-strategy s-matrix',
  content: `<div class="s-wrap">
  <div class="s-tick"></div>
  <h1 class="s-title" data-region="title">${moves.length}つの打ち手のうち、効果が大きく実行しやすい<em>${top.length}つを最優先</em>とする</h1>
  <div class="s-track" aria-label="章の位置">${track}</div>
  <div class="s-rule"></div>
  <div class="s-mx" data-region="primary">
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${P}-t ${P}-d">
      <title id="${P}-t">打ち手の優先度マトリクス</title>
      <desc id="${P}-d">横軸は実行の容易さ（1〜5）、縦軸は2029年度の利益改善額（億円）、円の面積は投資額。最優先は ${top.map(m => `${m.k} ${m.name}`).join('、')}。</desc>
      ${quad}${axes}${bubbles}
    </svg>
  </div>
  <aside class="s-mx-key" data-region="support">
    <h3>最優先の${top.length}施策　利益改善 ／ 投資</h3>
    <ol>${top.map(m => `<li class="top"><b>${m.k}</b><span>${m.name}</span><em>${m.impact.toFixed(1)} ／ ${m.inv}</em></li>`).join('')}</ol>
    <h3 style="margin-top:18px">見送り・後回し</h3>
    <ol>${rest.map(m => `<li><b>${m.k}</b><span>${m.name}</span><em>${m.impact.toFixed(1)} ／ ${m.inv}</em></li>`).join('')}</ol>
    <p>単位は億円。最優先の条件は容易さ${easeCut.toFixed(1)}以上かつ利益改善${impactCut}億円以上。円の面積は投資額に比例。</p>
  </aside>
  <div class="s-foot"><span data-region="source">例示データ · 容易さは経営陣5名の採点の平均</span><span>北辰コンサルティング<b>3</b></span></div>
</div>`
};
