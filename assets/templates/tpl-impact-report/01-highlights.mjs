// Template: 年次インパクトレポート · 表紙と成果の大きな数字. Synthetic example content; replace data and copy.
const ID = 'tpl-impact-report-highlights';
const org = {name: 'NPO法人 まちの学び舎ネットワーク', year: '2025年度', period: '2025年4月〜2026年3月', mission: '地域の子どもが、放課後に安心して学べる場所をつくる'};
// Same region table as the regional page: participants and sites are summed from it.
const regions = [
  {name: '中央', people: 402, sites: 5}, {name: '東部', people: 281, sites: 4}, {name: '北部', people: 236, sites: 3},
  {name: '西部', people: 198, sites: 3}, {name: '南部', people: 167, sites: 2}
];
const people = regions.reduce((a, r) => a + r.people, 0);  // 1,284
const sites = regions.reduce((a, r) => a + r.sites, 0);    // 17
const prevSites = 14;
const kpis = [
  {icon: 'kids', label: '参加した子ども', value: people, prev: 1088, unit: '人', what: '小学4年〜中学3年の実人数'},
  {icon: 'book', label: '開いた学習会', value: 612, prev: 540, unit: '回', what: `${sites}拠点の合計`},
  {icon: 'hands', label: 'ボランティア', value: 186, prev: 151, unit: '人', what: '年3回以上参加した登録者'},
  {icon: 'loop', label: '継続参加率', value: 78, prev: 71, unit: '%', what: '4月の参加者が3月も通っていた割合', points: true}
];
const fmt = n => n.toLocaleString('ja-JP');
const delta = k => k.points ? `前年度比 +${k.value - k.prev}ポイント` : `前年度比 +${((k.value - k.prev) / k.prev * 100).toFixed(1)}%`;

const icons = {
  kids: `<circle cx="32" cy="32" r="32" fill="#DDEAE4"/><circle cx="24" cy="24" r="7" fill="#2E6E72"/><path d="M13 50 c0-10 5-16 11-16 s11 6 11 16z" fill="#2E6E72"/><circle cx="42" cy="28" r="6" fill="#8DB3A5"/><path d="M33 50 c0-8 4-13 9-13 s9 5 9 13z" fill="#8DB3A5"/>`,
  book: `<circle cx="32" cy="32" r="32" fill="#DDEAE4"/><path d="M14 20 q9 -4 18 2 v26 q-9 -6 -18 -2z" fill="#2E6E72"/><path d="M50 20 q-9 -4 -18 2 v26 q9 -6 18 -2z" fill="#8DB3A5"/><path d="M32 22 v26" stroke="#1E4652" stroke-width="1.6"/>`,
  hands: `<circle cx="32" cy="32" r="32" fill="#DDEAE4"/><path d="M32 46 C 18 36, 14 28, 20 22 c4 -4 9 -3 12 2 c3 -5 8 -6 12 -2 c6 6 2 14 -12 24z" fill="#D46E55"/><path d="M10 46 q10 -4 16 2 h10 M54 46 q-10 -4 -16 2" stroke="#2E6E72" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  loop: `<circle cx="32" cy="32" r="32" fill="#DDEAE4"/><path d="M18 34 a14 14 0 0 1 24 -12" stroke="#2E6E72" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M44 14 l-1 10 l-10 -2" stroke="#2E6E72" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M46 30 a14 14 0 0 1 -24 12" stroke="#8DB3A5" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M20 50 l1 -10 l10 2" stroke="#8DB3A5" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
};
const icon = (k, i) => `<svg viewBox="0 0 64 64" aria-hidden="true">${icons[k]}</svg>`;

// Flat townscape for the cover panel: hills, houses, a school with a clock, trees. Decorative, not a map.
const house = (x, w, h, roof, body, win) => `<rect x="${x}" y="${300 - h}" width="${w}" height="${h}" fill="${body}"/><path d="M${x - 6} ${300 - h} L${x + w / 2} ${300 - h - w * .45} L${x + w + 6} ${300 - h} Z" fill="${roof}"/><rect x="${x + w * .2}" y="${300 - h + 14}" width="${w * .22}" height="${w * .22}" fill="${win}"/><rect x="${x + w * .58}" y="${300 - h + 14}" width="${w * .22}" height="${w * .22}" fill="${win}"/>`;
const tree = (x, r, c) => `<rect x="${x - 2}" y="${300 - 18}" width="4" height="18" fill="#2A5560"/><circle cx="${x}" cy="${300 - 18 - r * .8}" r="${r}" fill="${c}"/>`;
const town = `<svg viewBox="0 0 540 300" role="img" aria-labelledby="${ID}-town-t">
  <title id="${ID}-town-t">家や学校、木が並ぶ町並みのイラスト</title>
  <circle cx="410" cy="150" r="54" fill="#EFE6D3" opacity=".9"/>
  <path d="M0 230 C 90 190, 180 205, 270 222 S 450 196, 540 214 V300 H0Z" fill="#2A5A64"/>
  ${house(40, 58, 70, '#D46E55', '#F4F1E8', '#2E6E72')}${tree(118, 18, '#8DB3A5')}
  <rect x="150" y="186" width="150" height="114" fill="#E8E1CF"/><path d="M142 186 L225 142 L308 186Z" fill="#8DB3A5"/><circle cx="225" cy="170" r="12" fill="#F4F1E8" stroke="#1E4652" stroke-width="2"/><path d="M225 170 v-7 M225 170 h5" stroke="#1E4652" stroke-width="2" stroke-linecap="round"/>
  ${[0, 1, 2, 3].map(i => `<rect x="${166 + i * 32}" y="206" width="20" height="18" fill="#2E6E72"/><rect x="${166 + i * 32}" y="240" width="20" height="18" fill="#2E6E72"/>`).join('')}<rect x="212" y="266" width="26" height="34" fill="#1E4652"/>
  ${tree(322, 22, '#DDEAE4')}${house(352, 64, 86, '#EFE6D3', '#CFE3EA', '#1E4652')}${house(436, 54, 62, '#D46E55', '#F4F1E8', '#2E6E72')}${tree(512, 16, '#8DB3A5')}
  <path d="M0 300 H540" stroke="#1E4652" stroke-width="2"/>
  ${[0, 1, 2, 3, 4, 5, 6].map(i => `<circle cx="${60 + i * 70}" cy="292" r="3" fill="#EFE6D3" opacity=".7"/>`).join('')}
</svg>`;

export default {
  study: true,
  id: ID,
  title: '2025年度インパクトレポート：表紙と成果の数字',
  language: 'ja',
  notes: 'Purpose: 表紙で1年間のいちばん大きな変化を1文で示し、成果を4つの大きな数字と前年度比で一覧させる。\nModify: org と kpis を差し替える。参加者数と拠点数は regions の合計から計算しているので、地域別ページと同じ表を使う。率の変化は「ポイント」、人数・回数の変化は「%」で表す。\nInvariant: 大きな数字には必ず単位・定義（何を数えたか）・比較対象を添える。数字は4つまで。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-impact-report ir-p-highlights',
  content: `<div class="ir">
  <section class="ir-cover" data-region="title">
    <p class="ir-kick">${org.year} インパクトレポート</p>
    <h1>放課後に通える<br>学びの場が、${sites}か所に<br>広がりました</h1>
    <p class="ir-grow">前年度の${prevSites}か所から +${sites - prevSites}か所</p>
    <p class="ir-org"><b>${org.name}</b>${org.mission}<br>対象期間：${org.period}</p>
    <div class="ir-fig" style="left:0;top:420px;width:540px;height:300px">${town}</div>
  </section>
  <div class="ir-kpis" data-region="primary">
    ${kpis.map((k, i) => `<div class="ir-kpi"><div class="ir-ico">${icon(k.icon, i)}</div><p class="ir-label">${k.label}</p>
      <p class="ir-big ir-num">${fmt(k.value)}<small>${k.unit}</small></p><p class="ir-what">${k.what}</p>
      <p class="ir-delta">${delta(k)}</p></div>`).join('')}
  </div>
  <p class="ir-foot" style="left:584px" data-region="source"><span>数値・団体名はすべて例示用の架空データです</span><span>1</span></p>
</div>`
};
