// Template: 四半期業績レビュー（QBR）· 前年差の要因ウォーターフォール. Synthetic example content; replace data and copy.
// Start value + signed steps. The end total, bar floats, labels, connectors and headline are all derived.
const P = 'tpl-qbr-waterfall';
const start = {label: ['前年同期', '営業利益'], v: 1.62};
const steps = [
  {label: ['売上の', '増加'], v: +3.56},
  {label: ['売上原価の', '増加'], v: -1.10},
  {label: ['人件費の', '増加'], v: -1.28},
  {label: ['広告宣伝費', 'の増加'], v: -0.42},
  {label: ['その他', '販管費'], v: -0.02}
];
const revenue = {prev: 14.84, now: 18.40};       // 億円, for margins in the subtitle
const end = start.v + steps.reduce((s, x) => s + x.v, 0);
const r2 = v => Math.round(v * 100) / 100;

const W = 724, H = 436, L = 58, R = 716, T = 34, B = 350, yMax = 6;
const cols = [{...start, kind: 'total'}, ...steps.map(s => ({...s, kind: s.v >= 0 ? 'up' : 'down'})), {label: ['当期', '営業利益'], v: r2(end), kind: 'total'}];
const slot = (R - L) / cols.length, bw = slot * 0.58;
const y = v => B - v / yMax * (B - T);
let run = 0;
const geo = cols.map((c, i) => {
  let lo, hi;
  if (c.kind === 'total') { lo = 0; hi = c.v; run = c.v; } else { lo = Math.min(run, run + c.v); hi = Math.max(run, run + c.v); run = r2(run + c.v); }
  return {...c, x: L + i * slot + (slot - bw) / 2, lo, hi, after: run};
});
const fill = {total: '#0d1b2e', up: '#12a086', down: '#e2553d'};
const grid = [0, 2, 4, 6].map(v => `<line x1="${L}" x2="${R}" y1="${y(v)}" y2="${y(v)}" stroke="${v ? '#e4e9f0' : '#0d1b2e'}" stroke-width="${v ? 1 : 1.5}"/>
  <text x="${L - 10}" y="${y(v) + 5}" text-anchor="end" class="q-sv-axis">${v}</text>`).join('');
const bars = geo.map((g, i) => {
  const val = g.kind === 'total' ? g.v.toFixed(2) : `${g.v > 0 ? '+' : '−'}${Math.abs(g.v).toFixed(2)}`;
  const vy = y(g.hi) - 10;
  const conn = i < geo.length - 1 ? `<line x1="${(g.x + bw).toFixed(1)}" x2="${(geo[i + 1].x).toFixed(1)}" y1="${y(g.after).toFixed(1)}" y2="${y(g.after).toFixed(1)}" stroke="#5f6c82" stroke-width="1.2" stroke-dasharray="3 3"/>` : '';
  const h = Math.max(2, y(g.lo) - y(g.hi));
  return `${conn}<rect x="${g.x.toFixed(1)}" y="${y(g.hi).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="3" fill="${fill[g.kind]}"/>
    <text x="${(g.x + bw / 2).toFixed(1)}" y="${vy.toFixed(1)}" text-anchor="middle" class="q-sv-val" style="fill:${g.kind === 'up' ? '#0a7663' : g.kind === 'down' ? '#ad311c' : '#0f1c2d'}">${val}</text>
    <text x="${(g.x + bw / 2).toFixed(1)}" y="${B + 26}" text-anchor="middle" class="q-sv-lab">${g.label[0]}</text>
    <text x="${(g.x + bw / 2).toFixed(1)}" y="${B + 46}" text-anchor="middle" class="q-sv-lab">${g.label[1]}</text>`;
}).join('');
const diff = r2(end - start.v);
const mPrev = start.v / revenue.prev * 100, mNow = end / revenue.now * 100;

const notes = [
  {tone: 'pos', h: '売上の増加', v: steps[0].v, p: '増収分の約7割は既存顧客のアップセル。上位プランへの移行と利用席数の追加が中心。'},
  {tone: 'neg', h: '人件費の増加', v: steps[2].v, p: '開発14名・CS 9名を採用。一方で営業部門の増員は3名にとどまった。'},
  {tone: 'neg', h: '広告宣伝費の増加', v: steps[3].v, p: '展示会2件への出展。リードは前期比+18%と増えたが、商談化率が下がった<span style="white-space:nowrap">（4ページ）</span>。'}
];

const dialMini = `<svg viewBox="0 0 40 40" role="img" aria-labelledby="${P}-dial"><title id="${P}-dial">四半期ダイヤル：第2四半期（7〜9月）</title>${[1, 2, 3, 4].map(k => {
  const a0 = -Math.PI / 2 + (k - 1) * Math.PI / 2 + 0.08, a1 = a0 + Math.PI / 2 - 0.16, p = (r, a) => `${(20 + r * Math.cos(a)).toFixed(2)} ${(20 + r * Math.sin(a)).toFixed(2)}`;
  const d = `M${p(19, a0)} A19 19 0 0 1 ${p(19, a1)} L${p(11, a1)} A11 11 0 0 0 ${p(11, a0)}Z`;
  return k === 1 ? `<path d="${d}" fill="#3b5480"/>` : k === 2 ? `<path d="${d}" fill="#2c64f0"/>` : `<path d="${d}" fill="none" stroke="#3b5480" stroke-width="1.2"/>`;
}).join('')}</svg>`;

export default {
  study: true,
  id: 'tpl-qbr-waterfall',
  title: '営業利益の前年差ウォーターフォール',
  language: 'ja',
  notes: 'Purpose: 前年同期から当期への営業利益の変化を、要因ごとの増減に分解して示す。\nModify: start と steps（符号付き、億円）を差し替える。当期値・棒の位置・接続線・見出しの差額は自動計算。\nInvariant: 始点＋各要因＝終点。増加は緑、減少は赤、合計は紺。共通のゼロ基準を持つ縦軸。\nStatic: 右側の3つの注記は段階表示。最終状態ですべて表示される。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-qbr q-bridge',
  content: `<div class="q-wrap">
  <div class="q-rail">${dialMini}<p class="q-sec">損益分析</p><p class="q-pg"><b>03</b>/ 06</p></div>
  <div class="q-top"><span>FY2026 Q2 業績レビュー ・ ハルニレ・クラウド</span><span class="q-chip"><i></i>前年同期比</span></div>
  <h1 class="q-title" data-region="title">営業利益は前年同期から<em>+${diff.toFixed(2)}億円</em>。増収分が人件費と原価の増加を吸収した</h1>
  <p class="q-sub" data-region="support">営業利益 ${start.v.toFixed(2)}億円 → ${end.toFixed(2)}億円、営業利益率 ${mPrev.toFixed(1)}% → ${mNow.toFixed(1)}%（+${(mNow - mPrev).toFixed(1)}pt）</p>
  <div class="q-card q-wf" data-region="primary">
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${P}-t ${P}-d">
      <title id="${P}-t">営業利益の前年同期差の要因分解（億円）</title>
      <desc id="${P}-d">前年同期 ${start.v.toFixed(2)}億円から、${steps.map(s => `${s.label.join('')} ${s.v > 0 ? '+' : ''}${s.v.toFixed(2)}`).join('、')}を経て当期 ${end.toFixed(2)}億円。</desc>
      <text x="${L - 10}" y="${T - 16}" text-anchor="end" class="q-sv-axis">億円</text>
      ${grid}${bars}
    </svg>
  </div>
  <div class="q-notes" data-region="support">
    ${notes.map((n, i) => `<div class="q-note ${n.tone}" data-step="${i + 1}" data-motion="lift"><h3>${n.h}<span class="q-num ${n.tone === 'pos' ? 'q-pos' : 'q-neg'}">${n.v > 0 ? '+' : '−'}${Math.abs(n.v).toFixed(2)}億円</span></h3><p>${n.p}</p></div>`).join('')}
  </div>
  <p class="q-source" data-region="source">例示データ · 単位：億円、四捨五入のため合計が一致しない場合がある</p>
</div>`
};
