// Template: 四半期業績レビュー（QBR）· 表紙とサマリー. Synthetic example content; replace data and copy.
// The quarter dial is the pack motif: past quarters filled, the reviewed quarter in blue, future quarters dashed.
const P = 'tpl-qbr-cover';
const fy = 2026, q = 2;                         // reviewed quarter (April-start fiscal year)
const monthsOf = k => [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3].slice((k - 1) * 3, k * 3);
const summary = [
  {lab: '売上高', v: '18.4', u: '億円', note: '計画比 102%・前年同期比 +24%', dir: 'up', good: true},
  {lab: '新規ARR', v: '4.1', u: '億円', note: '計画比 91%・2四半期連続で未達', dir: 'down', good: false},
  {lab: '月次解約率', v: '0.62', u: '%', note: '前年同期差 −0.18pt と改善', dir: 'down', good: true}
];

const cx = 190, cy = 190, r0 = 112, r1 = 164, gap = 0.035;
const pt = (r, a) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
const seg = k => {
  const a0 = -Math.PI / 2 + (k - 1) * Math.PI / 2 + gap, a1 = a0 + Math.PI / 2 - 2 * gap;
  return `M${pt(r1, a0)} A${r1} ${r1} 0 0 1 ${pt(r1, a1)} L${pt(r0, a1)} A${r0} ${r0} 0 0 0 ${pt(r0, a0)}Z`;
};
const quarters = [1, 2, 3, 4].map(k => {
  const state = k < q ? 'past' : k === q ? 'now' : 'next';
  const style = {past: 'fill="#233a5e"', now: `fill="url(#${P}-now)"`, next: 'fill="none" stroke="#3b5480" stroke-width="1.5" stroke-dasharray="4 5"'}[state];
  const mid = -Math.PI / 2 + (k - 0.5) * Math.PI / 2;
  const [lx, ly] = [cx + (r0 + r1) / 2 * Math.cos(mid), cy + (r0 + r1) / 2 * Math.sin(mid)];
  return `<path d="${seg(k)}" ${style}/>
    <text x="${lx.toFixed(1)}" y="${(ly + 6).toFixed(1)}" text-anchor="middle" style="font:700 18px var(--q-num);fill:${state === 'now' ? '#ffffff' : state === 'past' ? '#9fb0c9' : '#6f86ad'}">Q${k}</text>`;
}).join('');
const ticks = Array.from({length: 12}, (_, m) => {
  const a = -Math.PI / 2 + (m + 0.5) * Math.PI / 6, inQ = Math.floor(m / 3) + 1 === q;
  const label = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3][m];
  return `<line x1="${(cx + 174 * Math.cos(a)).toFixed(1)}" y1="${(cy + 174 * Math.sin(a)).toFixed(1)}" x2="${(cx + 182 * Math.cos(a)).toFixed(1)}" y2="${(cy + 182 * Math.sin(a)).toFixed(1)}" stroke="${inQ ? '#8fb0ff' : '#3b5480'}" stroke-width="2"/>
  ${inQ ? `<text x="${(cx + 200 * Math.cos(a)).toFixed(1)}" y="${(cy + 200 * Math.sin(a) + 5).toFixed(1)}" text-anchor="middle" style="font:600 15px var(--q-num);fill:#8fb0ff">${label}月</text>` : ''}`;
}).join('');
const [m1, , m3] = monthsOf(q);

export default {
  study: true,
  id: 'tpl-qbr-cover',
  title: '2026年度 第2四半期 業績レビュー — 表紙',
  language: 'ja',
  notes: 'Purpose: 会議の対象期間と結論の3指標を最初の1枚で示す。\nModify: fy・q を変えると四半期ダイヤルと月表示が追従する。summary の3指標は本文ページの値と一致させる。\nInvariant: 3指標は良否の向きを色と記号の両方で示す。ダイヤルは期間を表す図であり装飾ではない。\nStatic: Already static.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-qbr q-cover',
  content: `<div class="q-wrap">
  <div class="q-cv-grid">
    <svg viewBox="0 0 1280 720" role="img" aria-labelledby="${P}-bg-t"><title id="${P}-bg-t">背景の計器グリッド</title>
      <defs><pattern id="${P}-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#1a2d4c" stroke-width="1"/></pattern>
      <linearGradient id="${P}-fade" x1="0" x2="1"><stop offset="0" stop-color="#0d1b2e"/><stop offset=".55" stop-color="#0d1b2e" stop-opacity=".2"/><stop offset="1" stop-color="#0d1b2e" stop-opacity="0"/></linearGradient></defs>
      <rect width="1280" height="720" fill="url(#${P}-grid)"/><rect width="1280" height="720" fill="url(#${P}-fade)"/>
    </svg>
  </div>
  <div class="q-cv-org"><svg viewBox="0 0 28 28" role="img" aria-labelledby="${P}-org"><title id="${P}-org">ハルニレ・クラウドのロゴマーク</title><path d="M14 3 25 12H3Z M14 10 23 18H5Z M14 17 21 24H7Z" fill="#8fb0ff"/><rect x="13" y="22" width="2" height="5" fill="#8fb0ff"/></svg>ハルニレ・クラウド株式会社</div>
  <p class="q-cv-kicker">FY${fy} Q${q} · QUARTERLY BUSINESS REVIEW</p>
  <h1 class="q-cv-h" data-region="title">${fy}年度 第${q}四半期<br>業績レビュー</h1>
  <p class="q-cv-meta" data-region="support">対象期間 ${fy}年${m1}月〜${m3}月 ・ 経営会議 ${fy}年10月14日<br>経営企画部 作成</p>
  <div class="q-cv-dial" data-region="primary">
    <svg viewBox="-20 -20 420 420" role="img" aria-labelledby="${P}-d-t ${P}-d-d">
      <title id="${P}-d-t">年度内の位置を示す四半期ダイヤル</title>
      <desc id="${P}-d-d">第1四半期は完了、第${q}四半期（${m1}〜${m3}月）が今回の対象、第3・第4四半期はこれから。</desc>
      <defs><linearGradient id="${P}-now" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4f86ff"/><stop offset="1" stop-color="#2c64f0"/></linearGradient></defs>
      <circle cx="${cx}" cy="${cy}" r="182" fill="none" stroke="#1f3558" stroke-width="1"/>
      ${ticks}${quarters}
      <text x="${cx}" y="${cy + 6}" text-anchor="middle" style="font:700 64px var(--q-num);fill:#ffffff;letter-spacing:-.02em">Q${q}</text>
      <text x="${cx}" y="${cy + 38}" text-anchor="middle" style="font:600 16px var(--q-jp);fill:#9fb0c9">${m1}–${m3}月</text>
    </svg>
  </div>
  <div class="q-cv-sum" data-region="support">
    ${summary.map(s => `<div><p class="q-lab">${s.lab}</p><p class="q-big">${s.v}<small>${s.u}</small></p><p><span class="${s.good ? 'q-up' : 'q-down'}">${s.dir === 'up' ? '▲' : '▼'}</span> ${s.note}</p></div>`).join('')}
  </div>
  <p class="q-source" style="left:84px;color:#8a9bb6" data-region="source">例示データ · 架空企業の数値（▲▼は増減の向き、色は良否）</p>
</div>`
};
