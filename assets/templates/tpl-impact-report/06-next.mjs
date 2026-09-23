// Template: 年次インパクトレポート · 次年度計画（目標とロードマップ）. Synthetic example content; replace data and copy.
const ID = 'tpl-impact-report-next';
// Current-year figures come from the same tables as pages 1–2; targets are the plan.
const regions = [
  {name: '中央', people: 402, sites: 5}, {name: '東部', people: 281, sites: 4}, {name: '北部', people: 236, sites: 3},
  {name: '西部', people: 198, sites: 3}, {name: '南部', people: 167, sites: 2}
];
const busiest = regions.reduce((a, r) => r.people / r.sites > a.people / a.sites ? r : a);
const nowKids = regions.reduce((a, r) => a + r.people, 0), nowSites = regions.reduce((a, r) => a + r.sites, 0);
const goals = [
  {label: '参加する子ども', from: nowKids, to: 1450, unit: '人', how: `${busiest.name}と西部で受け入れ枠を増やす`},
  {label: '拠点', from: nowSites, to: 19, unit: 'か所', how: `${busiest.name}に${busiest.sites + 1}か所目、西部に${regions.find(r => r.name === '西部').sites + 1}か所目を開く`},
  {label: '継続参加率', from: 78, to: 80, unit: '%', points: true, how: '休みが続いた子への声かけを仕組みにする'}
];
const chip = g => g.points ? `+${g.to - g.from}ポイント` : (g.unit === 'か所' ? `+${g.to - g.from}か所` : `+${((g.to - g.from) / g.from * 100).toFixed(1)}%`);
const fmt = n => n.toLocaleString('ja-JP');

// Roadmap: quarter index 0–3 (4–6月 … 1–3月). bar = [start, end] inclusive; ms = milestones at quarter positions.
const quarters = ['4–6月', '7–9月', '10–12月', '1–3月'];
const plan = [
  {name: `${busiest.name}の新拠点`, bar: [0, 1], barLabel: '場所探し・準備', ms: [{q: 2, t: '開設'}]},
  {name: '西部の新拠点', bar: [1, 2], barLabel: '準備', ms: [{q: 3, t: '開設'}]},
  {name: 'ボランティア研修', ms: [0, 1, 2, 3].map(q => ({q, t: `第${q + 1}回`}))},
  {name: '継続参加の声かけ', bar: [0, 3], barLabel: '毎月の欠席確認と連絡'},
  {name: '成果の測り方の見直し', bar: [2, 2], barLabel: '調査票の改訂', ms: [{q: 3, t: '調査'}]}
];
const LW = 170, QW = (668 - LW) / 4, HY = 34, RH = 62;
const qx = q => LW + q * QW;
const gantt = `<svg viewBox="0 0 668 ${HY + plan.length * RH + 6}" role="img" aria-labelledby="${ID}-g-t ${ID}-g-d">
  <title id="${ID}-g-t">2026年度のロードマップ</title>
  <desc id="${ID}-g-d">${plan.map(p => `${p.name}：${p.bar ? `${quarters[p.bar[0]]}〜${quarters[p.bar[1]]} ${p.barLabel}` : ''}${p.ms ? ' ' + p.ms.map(m => m.t).join('・') : ''}`).join('。')}</desc>
  ${quarters.map((q, i) => `<rect x="${qx(i) + 2}" y="0" width="${QW - 4}" height="26" rx="6" fill="${i % 2 ? '#DDEAE4' : '#CFE3EA'}"/><text class="ir-svg-t" x="${qx(i) + QW / 2}" y="18.5" text-anchor="middle" style="font-size:15px">${q}</text>`).join('')}
  ${[1, 2, 3].map(i => `<path d="M${qx(i)} 32 V${HY + plan.length * RH}" stroke="#D5DDD9" stroke-width="1" stroke-dasharray="3 4"/>`).join('')}
  ${plan.map((p, r) => { const y = HY + r * RH, cy = y + RH / 2;
    return `<path d="M0 ${y + RH} H668" stroke="#D5DDD9" stroke-width="1"/>
    <text class="ir-svg-t" x="0" y="${cy + 6}">${p.name}</text>
    ${p.bar ? `<rect x="${qx(p.bar[0]) + 6}" y="${cy - 13}" width="${(p.bar[1] - p.bar[0] + 1) * QW - 12}" height="26" rx="13" fill="#2E6E72"/><text class="ir-svg-w" x="${qx(p.bar[0]) + 20}" y="${cy + 5.5}" style="font-size:15px">${p.barLabel}</text>` : ''}
    ${(p.ms || []).map(m => { const x = qx(m.q) + QW / 2;
      return `<path d="M${x} ${cy - 12} L${x + 12} ${cy} L${x} ${cy + 12} L${x - 12} ${cy} Z" fill="#D46E55" stroke="#F7F5EF" stroke-width="2"/><text class="ir-svg-s" x="${x + 18}" y="${cy + 5}" style="fill:#A9492F;font-weight:700">${m.t}</text>`; }).join('')}`; }).join('')}
</svg>`;
const arrow = `<svg viewBox="0 0 44 26" aria-hidden="true"><path d="M2 13 H36 M28 5 L38 13 L28 21" stroke="#8DB3A5" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export default {
  study: true,
  id: ID,
  title: '次年度計画：目標とロードマップ',
  language: 'ja',
  notes: 'Purpose: 今年度の結果から次年度の重点を導き、数値目標と四半期ごとの実行計画を1枚で約束する。\nModify: goals の目標値と方法、plan の期間（四半期の番号 0〜3）とマイルストーンを差し替える。現状値は表紙・地域別ページと同じ regions から計算する。\nInvariant: 目標は現状値と並べ、増分（%・ポイント・か所）を計算で示す。計画は約束ではなく予定として書き、確定していない項目は断定しない。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-impact-report ir-p-next',
  content: `<div class="ir">
  <div class="ir-top"><span class="ir-brand">まちの学び舎ネットワーク　2025年度 年次報告</span><span class="ir-sec"><b>06</b>次年度の計画</span></div>
  <h1 class="ir-h1" data-region="title">2026年度は、最も混み合う${busiest.name}に${busiest.sites + 1}か所目の拠点を開く計画です</h1>
  <div class="ir-goals" data-region="primary">
    ${goals.map(g => `<div class="ir-goal"><p class="ir-label">${g.label}</p><span class="ir-chip">${chip(g)}</span>
      <p class="ir-from">${fmt(g.from)}<small>${g.unit}</small></p><div class="ir-arrow">${arrow}</div><p class="ir-to">${fmt(g.to)}<small>${g.unit}</small></p>
      <p>${g.how}</p></div>`).join('')}
  </div>
  <p class="ir-panelh" style="left:548px;top:150px">実行計画<small>2026年4月〜2027年3月</small></p>
  <div class="ir-fig" style="left:548px;top:192px;width:668px;height:${HY + plan.length * RH + 6}px" data-region="support">${gantt}</div>
  <p class="ir-thanks">ご寄付・ご協力くださったすべての皆さまに、心から感謝申し上げます。</p>
  <p class="ir-foot" data-region="source"><span>目標値と日程は計画段階のもので、変わる場合があります ・ 数値は例示用の架空データです</span><span>6</span></p>
</div>`
};
