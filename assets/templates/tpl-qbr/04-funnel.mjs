// Template: 四半期業績レビュー（QBR）· 商談ファネルとボトルネック. Synthetic example content; replace data and copy.
// Stage counts for this and the previous quarter. Bar widths ∝ count; conversion rates, the bottleneck and its impact are derived.
const P = 'tpl-qbr-funnel';
const stages = [
  {name: 'リード', now: 4820, prev: 4080},
  {name: 'MQL', now: 1510, prev: 1300},
  {name: '商談化', now: 620, prev: 624},
  {name: '提案', now: 310, prev: 300},
  {name: '受注', now: 96, prev: 98}
];
const newArr = 4.1;                                   // 億円, this quarter (matches KPI page)
const conv = stages.slice(1).map((s, i) => ({from: stages[i].name, to: s.name, now: s.now / stages[i].now, prev: s.prev / stages[i].prev}));
conv.forEach(c => { c.d = (c.now - c.prev) * 100; });
const worst = conv.reduce((a, b) => (b.d < a.d ? b : a));
const wi = conv.indexOf(worst);
// Impact if the worst step had kept last quarter's rate; downstream rates held at this quarter's.
const extraDeals = stages[wi].now * (worst.prev - worst.now);
const downstream = stages.at(-1).now / stages[wi + 1].now;
const extraWins = extraDeals * downstream;
const acv = newArr * 1e4 / stages.at(-1).now;         // 万円 per win
const extraArr = extraWins * acv / 1e4;               // 億円

const W = 704, H = 440, rowH = 88, bh = 44, top = 16, fx = 250, fmax = 330;
const bar = v => v / stages[0].now * fmax;
const yRow = i => top + i * rowH;
const pct = v => `${(v * 100).toFixed(1)}%`;
const rows = stages.map((s, i) => {
  const w = Math.max(bar(s.now), 1.5), y0 = yRow(i);
  const next = stages[i + 1];
  const trap = next ? `<path d="M${fx - bar(s.now) / 2} ${y0 + bh} L${fx + bar(s.now) / 2} ${y0 + bh} L${fx + bar(next.now) / 2} ${yRow(i + 1)} L${fx - bar(next.now) / 2} ${yRow(i + 1)}Z" fill="${i === wi ? '#fbe0da' : '#e7edf7'}"/>` : '';
  return `${trap}<rect x="${(fx - w / 2).toFixed(1)}" y="${y0}" width="${w.toFixed(1)}" height="${bh}" rx="3" fill="${i === stages.length - 1 ? '#2c64f0' : '#0d1b2e'}"/>
    <text x="0" y="${y0 + 29}" class="q-sv-lab" style="font-size:17px;fill:#0f1c2d">${s.name}</text>
    <text x="${fx + fmax / 2 + 92}" y="${y0 + 30}" text-anchor="end" style="font:700 22px var(--q-num);fill:#0f1c2d">${s.now.toLocaleString('ja-JP')}</text>
    <text x="${fx + fmax / 2 + 92}" y="${y0 + 52}" text-anchor="end" class="q-sv-axis" style="font-size:15px">前期 ${s.prev.toLocaleString('ja-JP')}</text>`;
}).join('');
const cx0 = 552, cw = 148;
const convs = conv.map((c, i) => {
  const yc = yRow(i) + bh + (rowH - bh) / 2, bad = i === wi;
  const col = bad ? '#ad311c' : c.d >= 0 ? '#0a7663' : '#3d4b62';
  return `${bad ? `<rect x="${cx0 - 12}" y="${yc - 28}" width="${W - cx0 + 12}" height="56" rx="8" fill="#fbe0da"/>` : ''}
    <text x="${cx0}" y="${yc - 6}" style="font:700 17px var(--q-num);fill:${col}">↓ ${pct(c.now)}</text>
    <text x="${W - 4}" y="${yc - 6}" text-anchor="end" style="font:600 15px var(--q-num);fill:${col}">${c.d >= 0 ? '+' : '−'}${Math.abs(c.d).toFixed(1)}pt</text>
    <rect x="${cx0}" y="${yc + 6}" width="${cw}" height="7" rx="3.5" fill="#e4e9f0"/>
    <rect x="${cx0}" y="${yc + 6}" width="${(c.now * cw).toFixed(1)}" height="7" rx="3.5" fill="${bad ? '#e2553d' : '#2c64f0'}"/>
    <line x1="${(cx0 + c.prev * cw).toFixed(1)}" x2="${(cx0 + c.prev * cw).toFixed(1)}" y1="${yc + 1}" y2="${yc + 18}" stroke="#0d1b2e" stroke-width="2"/>`;
}).join('');

const dialMini = `<svg viewBox="0 0 40 40" role="img" aria-labelledby="${P}-dial"><title id="${P}-dial">四半期ダイヤル：第2四半期（7〜9月）</title>${[1, 2, 3, 4].map(k => {
  const a0 = -Math.PI / 2 + (k - 1) * Math.PI / 2 + 0.08, a1 = a0 + Math.PI / 2 - 0.16, p = (r, a) => `${(20 + r * Math.cos(a)).toFixed(2)} ${(20 + r * Math.sin(a)).toFixed(2)}`;
  const d = `M${p(19, a0)} A19 19 0 0 1 ${p(19, a1)} L${p(11, a1)} A11 11 0 0 0 ${p(11, a0)}Z`;
  return k === 1 ? `<path d="${d}" fill="#3b5480"/>` : k === 2 ? `<path d="${d}" fill="#2c64f0"/>` : `<path d="${d}" fill="none" stroke="#3b5480" stroke-width="1.2"/>`;
}).join('')}</svg>`;

export default {
  study: true,
  id: 'tpl-qbr-funnel',
  title: '商談ファネルとボトルネック',
  language: 'ja',
  notes: 'Purpose: 獲得ファネルの各段階の件数と転換率を前期と比べ、最も悪化した段階とその影響額を示す。\nModify: stages に今期・前期の件数を入れる。転換率、ボトルネック（前期差が最も悪い段階）、影響額は自動計算。\nInvariant: 棒の幅は件数に比例（受注が細いのは実際に少ないため）。影響額は「その段階だけ前期の転換率だった場合」の仮定で、下流の転換率は今期値を使う。\nStatic: Already static.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-qbr q-funnel',
  content: `<div class="q-wrap">
  <div class="q-rail">${dialMini}<p class="q-sec">営業ファネル</p><p class="q-pg"><b>04</b>/ 06</p></div>
  <div class="q-top"><span>FY2026 Q2 業績レビュー ・ ハルニレ・クラウド</span><span class="q-chip"><i></i>前期（4–6月）比</span></div>
  <h1 class="q-title" data-region="title">リードは前期比+${((stages[0].now / stages[0].prev - 1) * 100).toFixed(0)}%でも、<em class="q-neg">${worst.from}から${worst.to}への転換</em>で取りこぼしている</h1>
  <p class="q-sub" data-region="support">${worst.from}→${worst.to}の転換率は ${pct(worst.prev)} → ${pct(worst.now)}。他の段階は前期並みを保った。</p>
  <div class="q-card q-fn" data-region="primary">
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${P}-t ${P}-d">
      <title id="${P}-t">今期の商談ファネル（件数）と段階間の転換率</title>
      <desc id="${P}-d">${stages.map(s => `${s.name} ${s.now}件`).join('、')}。転換率は ${conv.map(c => `${c.from}→${c.to} ${pct(c.now)}（前期 ${pct(c.prev)}）`).join('、')}。</desc>
      ${rows}${convs}
    </svg>
  </div>
  <aside class="q-fx" data-region="support">
    <p class="q-lab">ボトルネック</p>
    <h3>${worst.from}→${worst.to}の転換率が<br>前期の水準を保っていれば</h3>
    <div class="q-rate"><strong>+${extraArr.toFixed(2)}</strong><span>億円の新規ARR<br>（今期実績 ${newArr}億円）</span></div>
    <ol>
      <li>${worst.to}の増加<b>+${Math.round(extraDeals)}件</b></li>
      <li>受注の増加（×${pct(downstream)}）<b>+${Math.round(extraWins)}件</b></li>
      <li>平均受注額<b>${Math.round(acv)}万円</b></li>
      <li>新規ARRへの影響<b>+${extraArr.toFixed(2)}億円</b></li>
    </ol>
  </aside>
  <p class="q-source" data-region="source">例示データ · 右列の縦線は前期の転換率、棒の幅は件数に比例</p>
</div>`
};
