// Template: 四半期業績レビュー（QBR）· 契約コホート継続率ヒートマップ. Synthetic example content; replace data and copy.
// A deterministic generator stands in for real cohort data; replace `grid` with your own rows (null = not yet observed).
const P = 'tpl-qbr-cohort-heatmap';
const cohorts = ['25年10月', '11月', '12月', '26年1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月'];
const changeAt = 6;                                  // first cohort after the onboarding change (26年4月)
const months = 11;                                   // M1..M11 since contract
const jitter = (c, m) => Math.sin(c * 12.9898 + m * 78.233) * 0.9;
const grid = cohorts.map((_, c) => Array.from({length: months}, (_, j) => {
  const m = j + 1;
  if (m > months - c) return null;                   // not yet observed at 26年9月末
  const early = c >= changeAt ? 6.0 : 14.0;          // share lost in the first months
  const v = 100 - early * (1 - Math.exp(-m / 1.4)) - 0.55 * m + jitter(c, m);
  return Math.round(v * 10) / 10;
}));
const avg = a => a.reduce((s, v) => s + v, 0) / a.length;
const m3 = grid.map(r => r[2]);
const before = avg(m3.slice(0, changeAt).filter(v => v != null));
const after = avg(m3.slice(changeAt).filter(v => v != null));
const lostBefore = 100 - before, lostAfter = 100 - after;
const ratio = lostAfter / lostBefore;
const phrase = ratio < 0.56 ? 'ほぼ半分' : `${Math.round((1 - ratio) * 100)}%少ない水準`;

// Sequential single-hue scale (light → dark blue) on 70–100%.
const lo = 70, hi = 100;
const mix = (a, b, t) => a.map((x, i) => Math.round(x + (b[i] - x) * t));
const color = v => { const t = Math.max(0, Math.min(1, (v - lo) / (hi - lo))); const [r, g, b] = mix([236, 242, 253], [22, 58, 150], t); return `rgb(${r},${g},${b})`; };
const inkFor = v => ((v - lo) / (hi - lo) > 0.55 ? '#ffffff' : '#0f1c2d');

const W = 804, H = 440, gx = 92, gy = 34, cw = 60, ch = 32;
const cells = grid.map((row, c) => row.map((v, j) => {
  const x = gx + j * cw, y = gy + c * ch;
  return v == null ? '' : `<rect x="${x + 1}" y="${y + 1}" width="${cw - 2}" height="${ch - 2}" rx="2" fill="${color(v)}"/>
    <text x="${x + cw / 2}" y="${y + ch / 2 + 5}" text-anchor="middle" class="q-sv-cell" style="fill:${inkFor(v)}">${v.toFixed(1)}</text>`;
}).join('')).join('');
const rowLabels = cohorts.map((k, c) => `<text x="${gx - 12}" y="${gy + c * ch + ch / 2 + 5}" text-anchor="end" class="q-sv-lab" style="${c >= changeAt ? 'fill:#1f4fd1' : ''}">${k}</text>`).join('');
const colLabels = Array.from({length: months}, (_, j) => `<text x="${gx + j * cw + cw / 2}" y="${gy - 12}" text-anchor="middle" class="q-sv-axis" style="${j === 2 ? 'font-weight:700;fill:#0f1c2d' : ''}">M${j + 1}</text>`).join('');
const sepY = gy + changeAt * ch;
const m3box = `<rect x="${gx + 2 * cw - 1}" y="${gy - 30}" width="${cw + 2}" height="${m3.filter(v => v != null).length * ch + 32}" rx="4" fill="none" stroke="#0d1b2e" stroke-width="2"/>`;
const noteX = gx + 6 * cw + 12, noteY = sepY + ch + 20;

const dialMini = `<svg viewBox="0 0 40 40" role="img" aria-labelledby="${P}-dial"><title id="${P}-dial">四半期ダイヤル：第2四半期（7〜9月）</title>${[1, 2, 3, 4].map(k => {
  const a0 = -Math.PI / 2 + (k - 1) * Math.PI / 2 + 0.08, a1 = a0 + Math.PI / 2 - 0.16, p = (r, a) => `${(20 + r * Math.cos(a)).toFixed(2)} ${(20 + r * Math.sin(a)).toFixed(2)}`;
  const d = `M${p(19, a0)} A19 19 0 0 1 ${p(19, a1)} L${p(11, a1)} A11 11 0 0 0 ${p(11, a0)}Z`;
  return k === 1 ? `<path d="${d}" fill="#3b5480"/>` : k === 2 ? `<path d="${d}" fill="#2c64f0"/>` : `<path d="${d}" fill="none" stroke="#3b5480" stroke-width="1.2"/>`;
}).join('')}</svg>`;

export default {
  study: true,
  id: 'tpl-qbr-cohort-heatmap',
  title: '契約コホート別の継続率ヒートマップ',
  language: 'ja',
  notes: 'Purpose: 契約月ごとのコホートが何か月目にどれだけ残っているかを並べ、施策前後の差を示す。\nModify: grid を実データ（行＝契約月、列＝経過月、未観測は null）に置き換える。changeAt は施策後の最初のコホート。\nInvariant: 色は単一色相の明度（濃いほど継続率が高い）で、数値も各セルに表示。比較は同じ経過月（M3）で行い、未観測セルは平均に含めない。\nStatic: Already static.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-qbr q-cohort',
  content: `<div class="q-wrap">
  <div class="q-rail">${dialMini}<p class="q-sec">顧客継続</p><p class="q-pg"><b>05</b>/ 06</p></div>
  <div class="q-top"><span>FY2026 Q2 業績レビュー ・ ハルニレ・クラウド</span><span class="q-chip"><i></i>契約社数ベース</span></div>
  <h1 class="q-title" data-region="title">4月のオンボーディング刷新後、<em>3か月目までの解約は${phrase}</em>に減った</h1>
  <p class="q-sub" data-region="support">M3時点の解約率は刷新前 ${lostBefore.toFixed(1)}% に対し、刷新後 ${lostAfter.toFixed(1)}%。初期設定をCSが伴走する形に変えた効果とみている。</p>
  <div class="q-card q-hm" data-region="primary">
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${P}-t ${P}-d">
      <title id="${P}-t">契約月コホート別・経過月別の継続率（%）</title>
      <desc id="${P}-d">行は25年10月〜26年8月の契約コホート、列は契約後1〜11か月目。M3の平均継続率は刷新前 ${before.toFixed(1)}%、刷新後 ${after.toFixed(1)}%。</desc>
      <text x="${gx - 12}" y="${gy - 12}" text-anchor="end" class="q-sv-axis">契約月</text>
      ${colLabels}${rowLabels}${cells}
      <line x1="8" x2="${gx + months * cw}" y1="${sepY}" y2="${sepY}" stroke="#2c64f0" stroke-width="2" stroke-dasharray="6 4"/>
      ${m3box}
      <text x="${noteX}" y="${noteY}" style="font:700 16px var(--q-jp);fill:#1f4fd1">▲ 26年4月 オンボーディング刷新</text>
      <text x="${noteX}" y="${noteY + 24}" class="q-sv-axis">点線より下が刷新後のコホート</text>
      <g transform="translate(${gx + 6 * cw + 12} ${H - 34})">
        <defs><linearGradient id="${P}-lg"><stop offset="0" stop-color="${color(lo)}"/><stop offset="1" stop-color="${color(hi)}"/></linearGradient></defs>
        <text x="0" y="0" class="q-sv-axis">継続率</text>
        <text x="62" y="0" class="q-sv-axis">${lo}%</text>
        <rect x="102" y="-12" width="160" height="12" rx="2" fill="url(#${P}-lg)" stroke="#c9d2df"/>
        <text x="270" y="0" class="q-sv-axis">${hi}%</text>
      </g>
    </svg>
  </div>
  <aside class="q-hx" data-region="support">
    <div class="q-kpi"><p class="q-lab">M3継続率・刷新前</p><strong class="q-num">${before.toFixed(1)}<small>%</small></strong><p>25年10月〜26年3月の6コホート平均</p></div>
    <div class="q-kpi"><p class="q-lab">M3継続率・刷新後</p><strong class="q-num" style="color:#1f4fd1">${after.toFixed(1)}<small>%</small></strong><p>26年4月〜6月の3コホート平均</p></div>
    <p>7月以降のコホートはM3に未到達のため、比較に含めていない。</p>
  </aside>
  <p class="q-source" data-region="source">例示データ · 継続率＝契約社数に対する継続社数の割合（26年9月末時点）</p>
</div>`
};
