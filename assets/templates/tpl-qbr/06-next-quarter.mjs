// Template: 四半期業績レビュー（QBR）· 次四半期の重点施策と決裁事項. Synthetic example content; replace data and copy.
// Each initiative links back to the finding that motivates it, names one KPI (now → target), one owner and a schedule.
const P = 'tpl-qbr-next-quarter';
const months = ['10月', '11月', '12月'];
const items = [
  {title: 'MQLから商談への引き渡し基準を見直す', link: ['4ページ', '転換率 48.0%→41.1%'], kpi: ['商談化率', '41%', '48%'], owner: '営業企画部 田村',
   span: [0, 1.6], ms: 1.6},
  {title: 'SDRを3名増員し、48時間以内に初回接触する', link: ['4ページ', '取りこぼし 約0.7億円'], kpi: ['初回接触まで', '96時間', '48時間'], owner: 'IS部 森',
   span: [0, 3], ms: 1.0, plan: [0, 1]},
  {title: '初期設定の伴走を小規模顧客にも広げる', link: ['5ページ', 'M3解約が約半分に'], kpi: ['月次解約率', '0.62%', '0.55%'], owner: 'CS部 石川',
   span: [0.5, 3], ms: 2.5},
  {title: '上位プランへの移行提案を全既存顧客に展開する', link: ['3ページ', '増収の約7割がアップセル'], kpi: ['NRR', '112%', '114%'], owner: 'AM部 岡本',
   span: [0, 3], ms: 3}
];
const pctX = m => (m / months.length * 100).toFixed(2);
const gantt = it => {
  const soft = it.plan ? `<span class="q-bar q-soft" style="left:${pctX(it.plan[0])}%;width:calc(${pctX(it.plan[1] - it.plan[0])}% - 4px)"></span>` : '';
  const from = it.plan ? it.plan[1] : it.span[0];
  return `${soft}<span class="q-bar" style="left:calc(${pctX(from)}% + ${it.plan ? 2 : 0}px);width:calc(${pctX(it.span[1] - from)}% - ${it.plan ? 2 : 0}px)"></span><span class="q-ms" style="left:calc(${pctX(it.ms)}% - ${it.ms >= 3 ? 8 : 0}px)"></span>`;
};
const rows = items.map((it, i) => `<tr>
    <td class="q-no">${String(i + 1).padStart(2, '0')}</td>
    <td><h3>${it.title}</h3><p class="q-link">根拠：${it.link[0]} ・ <b>${it.link[1]}</b></p></td>
    <td><p class="q-link" style="margin:0 0 2px">${it.kpi[0]}</p><p class="q-kv">${it.kpi[1]}<i>→</i><b>${it.kpi[2]}</b></p></td>
    <td class="q-owner">${it.owner}</td>
    <td class="q-m" colspan="3"><div style="position:relative;height:20px">${gantt(it)}</div></td>
  </tr>`).join('');

const dialMini = `<svg viewBox="0 0 40 40" role="img" aria-labelledby="${P}-dial"><title id="${P}-dial">四半期ダイヤル：第2四半期（7〜9月）</title>${[1, 2, 3, 4].map(k => {
  const a0 = -Math.PI / 2 + (k - 1) * Math.PI / 2 + 0.08, a1 = a0 + Math.PI / 2 - 0.16, p = (r, a) => `${(20 + r * Math.cos(a)).toFixed(2)} ${(20 + r * Math.sin(a)).toFixed(2)}`;
  const d = `M${p(19, a0)} A19 19 0 0 1 ${p(19, a1)} L${p(11, a1)} A11 11 0 0 0 ${p(11, a0)}Z`;
  return k === 1 ? `<path d="${d}" fill="#3b5480"/>` : k === 2 ? `<path d="${d}" fill="#2c64f0"/>` : k === 3 ? `<path d="${d}" fill="none" stroke="#8fb0ff" stroke-width="1.6"/>` : `<path d="${d}" fill="none" stroke="#3b5480" stroke-width="1.2"/>`;
}).join('')}</svg>`;

export default {
  study: true,
  id: 'tpl-qbr-next-quarter',
  title: '次四半期の重点施策と決裁事項',
  language: 'ja',
  notes: 'Purpose: 今回の分析から導いた次四半期の施策を、根拠・KPI・責任者・日程つきで示し、会議で決める事項を明記する。\nModify: items に施策を追加・削除する（4〜5件が目安）。span と ms は月単位（0＝10月初め、3＝12月末）。plan は準備期間（点線）。\nInvariant: 各施策は根拠ページとKPI（現状→目標）を1つずつ持つ。決裁事項は1件に絞り、金額と期待効果を並べる。\nStatic: Already static.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-qbr q-next',
  content: `<div class="q-wrap">
  <div class="q-rail">${dialMini}<p class="q-sec">次期の打ち手</p><p class="q-pg"><b>06</b>/ 06</p></div>
  <div class="q-top"><span>FY2026 Q2 業績レビュー ・ ハルニレ・クラウド</span><span class="q-chip"><i style="background:#8fb0ff"></i>Q3（10–12月）計画</span></div>
  <h1 class="q-title" data-region="title">Q3は<em>商談化率の回復</em>を最優先に、解約改善と既存拡大を続ける</h1>
  <p class="q-sub" data-region="support">4つの施策はいずれも本資料の分析に基づく。SDR増員のみ追加予算を要する。</p>
  <div class="q-plan" data-region="primary">
    <table>
      <thead><tr><th></th><th>施策</th><th style="width:170px">KPI（現状 → 目標）</th><th style="width:140px">責任者</th>${months.map(m => `<th class="q-m">${m}</th>`).join('')}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
  <div class="q-ask" data-region="support">
    <span class="q-lab">本日の決裁事項</span>
    <p><b>SDR 3名の採用</b>を承認いただきたい。10月中に採用し、11月から初回接触の短縮に充てる。</p>
    <strong>0.27<small>億円／年</small></strong>
  </div>
  <p class="q-source" data-region="source">例示データ · 実線＝実行期間、点線＝準備期間、◆＝効果判定の時期</p>
</div>`
};
