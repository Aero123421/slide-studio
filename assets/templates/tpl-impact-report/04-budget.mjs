// Template: 年次インパクトレポート · 予算の内訳（支出ドーナツ＋収入の積み上げ）. Synthetic example content; replace data and copy.
const ID = 'tpl-impact-report-budget';
// 単位：万円. field = true marks spending that directly reaches children (used in the headline).
const spend = [
  {name: '学習会の運営（人件費）', v: 2140, field: true, c: '#1E4652'},
  {name: '拠点の賃料・光熱費', v: 980, field: true, c: '#2E6E72'},
  {name: '教材・軽食', v: 720, field: true, c: '#5E9A93'},
  {name: 'ボランティア研修・保険', v: 410, field: true, c: '#8DB3A5'},
  {name: '広報・報告', v: 190, field: false, c: '#CDBF9F'},
  {name: '管理費', v: 420, field: false, c: '#A89A7D'}
];
const income = [
  {name: '個人からの寄付', v: 1650, c: '#D46E55'},
  {name: '民間の助成金', v: 1480, c: '#E49A7E'},
  {name: '自治体からの委託', v: 1240, c: '#EFC3A9'},
  {name: '会費', v: 310, c: '#C9B99A'},
  {name: '講座などの事業収入', v: 240, c: '#E6DCC6'}
];
const sum = a => a.reduce((t, x) => t + x.v, 0);
const S = sum(spend), I = sum(income), carry = I - S;                 // 4,860 / 4,920 / 60
const field = sum(spend.filter(x => x.field)), fieldPct = field / S * 100;
const fmt = n => Math.round(n).toLocaleString('ja-JP');
const pct = (v, t) => (v / t * 100).toFixed(1);
const roundedSum = spend.reduce((t, x) => t + +pct(x.v, S), 0);

// Donut geometry from the same array (starts at 12 o'clock, clockwise).
const C = 165, R = 150, r = 94;
let a0 = -Math.PI / 2;
const pt = (rad, ang) => `${(C + rad * Math.cos(ang)).toFixed(2)} ${(C + rad * Math.sin(ang)).toFixed(2)}`;
const arcs = spend.map(x => { const a1 = a0 + x.v / S * Math.PI * 2, large = a1 - a0 > Math.PI ? 1 : 0;
  const d = `M${pt(R, a0)} A${R} ${R} 0 ${large} 1 ${pt(R, a1)} L${pt(r, a1)} A${r} ${r} 0 ${large} 0 ${pt(r, a0)} Z`; a0 = a1;
  return `<path d="${d}" fill="${x.c}" stroke="#F7F5EF" stroke-width="2"/>`; }).join('');
// Bracket arc marking the "field" share on the outside of the donut.
const fa1 = -Math.PI / 2 + field / S * Math.PI * 2;
const bracket = `<path d="M${pt(R + 10, -Math.PI / 2 + .01)} A${R + 10} ${R + 10} 0 ${fa1 + Math.PI / 2 > Math.PI ? 1 : 0} 1 ${pt(R + 10, fa1 - .01)}" fill="none" stroke="#D46E55" stroke-width="3" stroke-linecap="round"/>`;
const donut = `<svg viewBox="-12 -12 354 354" role="img" aria-labelledby="${ID}-d-t ${ID}-d-d">
  <title id="${ID}-d-t">支出の内訳（合計${fmt(S)}万円）</title>
  <desc id="${ID}-d-d">${spend.map(x => `${x.name} ${fmt(x.v)}万円（${pct(x.v, S)}%）`).join('、')}。</desc>
  ${arcs}${bracket}
  <text x="${C}" y="${C - 18}" text-anchor="middle" class="ir-svg-s">支出合計</text>
  <text x="${C}" y="${C + 22}" text-anchor="middle" class="ir-svg-n" style="font-size:36px">${fmt(S)}</text>
  <text x="${C}" y="${C + 46}" text-anchor="middle" class="ir-svg-s">万円</text>
</svg>`;

// Income: one stacked column, labels on a rail to the right (pushed apart, never overlapping).
const colX = 24, colW = 96, colTop = 10, colH = 350, gapMin = 44;
let yb = colTop + colH;
const segs = income.map(x => { const h = x.v / I * colH, y = yb - h; yb = y; return {...x, y, h, mid: y + h / 2}; });
const rail = segs.map(s => ({...s, ly: s.mid}));
for (let it = 0; it < 50; it++) for (let i = 1; i < rail.length; i++) { const d = rail[i - 1].ly - rail[i].ly; if (d < gapMin) { const m = (gapMin - d) / 2; rail[i - 1].ly += m; rail[i].ly -= m; } }
rail[rail.length - 1].ly = Math.max(rail[rail.length - 1].ly, 22);
for (let i = rail.length - 2; i >= 0; i--) rail[i].ly = Math.max(rail[i].ly, rail[i + 1].ly + gapMin);
const column = `<svg viewBox="0 0 416 370" role="img" aria-labelledby="${ID}-c-t">
  <title id="${ID}-c-t">収入の内訳（合計${fmt(I)}万円）：${income.map(x => `${x.name} ${fmt(x.v)}万円`).join('、')}</title>
  ${segs.map(s => `<rect x="${colX}" y="${s.y.toFixed(2)}" width="${colW}" height="${s.h.toFixed(2)}" fill="${s.c}" stroke="#F7F5EF" stroke-width="2"/>`).join('')}
  ${rail.map(s => `<path d="M${colX + colW + 4} ${s.mid.toFixed(1)} L${colX + colW + 22} ${s.mid.toFixed(1)} L${colX + colW + 36} ${s.ly.toFixed(1)} L${colX + colW + 44} ${s.ly.toFixed(1)}" fill="none" stroke="#8A9A9E" stroke-width="1.2"/>
    <text class="ir-svg-t" x="${colX + colW + 52}" y="${(s.ly - 2).toFixed(1)}" style="font-size:16px">${s.name}</text>
    <text class="ir-svg-s" x="${colX + colW + 52}" y="${(s.ly + 18).toFixed(1)}"><tspan style="font:700 15px var(--ir-num);fill:#1F3440">${fmt(s.v)}</tspan> 万円・${pct(s.v, I)}%</text>`).join('')}
</svg>`;

export default {
  study: true,
  id: ID,
  title: '予算の内訳：支出と収入',
  language: 'ja',
  notes: 'Purpose: お金の出入りを1枚で示し、支出のうち子どもと接する現場に使った割合を見出しで伝える。\nModify: spend と income（万円）を差し替える。合計・割合・ドーナツの角度・積み上げの高さ・ラベル位置・繰越額はすべて計算で出る。field: true の項目が見出しの「現場」の割合に入る。\nInvariant: ドーナツの中央の合計＝支出の各項目の合計、積み上げの高さ＝収入の合計。収入−支出＝繰越を下段で必ず示す。割合は小数1桁で四捨五入。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-impact-report ir-p-budget',
  content: `<div class="ir">
  <div class="ir-top"><span class="ir-brand">まちの学び舎ネットワーク　2025年度 年次報告</span><span class="ir-sec"><b>04</b>予算の内訳</span></div>
  <h1 class="ir-h1" data-region="title">支出の${Math.round(fieldPct)}%を、子どもと接する現場に使いました</h1>
  <p class="ir-panelh" style="left:64px;top:140px">支出<small>単位：万円</small></p>
  <div class="ir-fig" style="left:64px;top:190px;width:330px;height:330px" data-region="primary">${donut}</div>
  <div class="ir-legend" data-region="support"><table><tbody>
    ${spend.filter(x => x.field).map(x => `<tr><td><i style="background:${x.c}"></i>${x.name}</td><td class="ir-num">${fmt(x.v)}</td><td class="ir-num">${pct(x.v, S)}%</td></tr>`).join('')}
    <tr><td style="color:#A9492F;font-weight:700"><i style="background:#D46E55;height:3px;vertical-align:4px"></i>現場への支出 小計</td><td class="ir-num" style="color:#A9492F;font-weight:700">${fmt(field)}</td><td class="ir-num" style="color:#A9492F;font-weight:700">${pct(field, S)}%</td></tr>
    ${spend.filter(x => !x.field).map(x => `<tr><td><i style="background:${x.c}"></i>${x.name}</td><td class="ir-num">${fmt(x.v)}</td><td class="ir-num">${pct(x.v, S)}%</td></tr>`).join('')}
    <tr class="is-total"><td>支出合計</td><td class="ir-num">${fmt(S)}</td><td class="ir-num">100%</td></tr>
  </tbody></table>${Math.abs(roundedSum - 100) > .05 ? '<p class="ir-note" style="margin-top:8px">割合は四捨五入のため、合計が100%にならない場合があります。</p>' : ''}</div>
  <p class="ir-panelh" style="left:800px;top:140px">収入<small>合計 ${fmt(I)} 万円</small></p>
  <div class="ir-fig" style="left:800px;top:190px;width:416px;height:370px" data-region="support">${column}</div>
  <div class="ir-recon" data-region="support">
    <span>収入</span><b>${fmt(I)}</b><span class="ir-op">−</span><span>支出</span><b>${fmt(S)}</b><span class="ir-op">＝</span><span>次年度への繰越</span><b style="color:#A9492F">${fmt(carry)}</b><span>万円</span>
  </div>
  <p class="ir-foot" data-region="source"><span>2025年度決算（例示用の架空データ）・ 単位：万円</span><span>4</span></p>
</div>`
};
