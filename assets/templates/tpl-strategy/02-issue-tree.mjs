// Template: 戦略提案（コンサル型）· 論点ツリー. Synthetic example content; replace data and copy.
// A root question → sub-issues → testable questions. Box positions and bracket connectors are computed from the tree.
const P = 'tpl-strategy-issue-tree';
const root = ['EC物流の営業利益率を', '2029年度に6%へ', '上げるには何をすべきか'];
const branches = [
  {no: '1', title: ['単価と荷主構成で', '収益を増やせるか'], leaves: [
    {no: '1.1', q: '付帯作業（検品・流通加工）を有償化できるか', h: '上位20荷主の8割が料金改定を受け入れる', fx: '+1.2pt', st: 'done'},
    {no: '1.2', q: '粗利の高い荷主に営業を集中できるか', h: '食品・化粧品・医療材の3業種で新規の6割を確保', fx: '+0.4pt', st: 'done'}]},
  {no: '2', title: ['倉庫と拠点の', 'コストを下げられるか'], leaves: [
    {no: '2.1', q: '3拠点を2拠点に統合できるか', h: '川口の荷量は戸田の空き区画で吸収できる', fx: '+1.4pt', st: 'done'},
    {no: '2.2', q: '仕分け工程を部分的に自動化できるか', h: '仕分けの作業時間を35%削減できる', fx: '+1.1pt', st: 'wip'}]},
  {no: '3', title: ['投資を回収し、', '移行を実行できるか'], leaves: [
    {no: '3.1', q: '必要な投資を5年以内に回収できるか', h: '投資24億円、回収期間4.2年', fx: '—', st: 'wip'},
    {no: '3.2', q: '移行期間中も現場の人員を維持できるか', h: '配置転換を先行させれば離職を抑えられる', fx: '—', st: 'todo'}]}
];
const status = {done: {t: '検証済', fill: '#0d5c4f', ink: '#ffffff', stroke: '#0d5c4f'}, wip: {t: '検証中', fill: '#f8edd6', ink: '#8a5a04', stroke: '#c98a12'}, todo: {t: '未着手', fill: '#ffffff', ink: '#646a71', stroke: '#b8bdc2'}};
const leaves = branches.flatMap(b => b.leaves);
const doneFx = leaves.filter(l => l.st === 'done').reduce((s, l) => s + parseFloat(l.fx), 0);
const counts = Object.fromEntries(Object.keys(status).map(k => [k, leaves.filter(l => l.st === k).length]));

const W = 1192, H = 420, head = 30, lh = 52, lgap = 8, bgap = 18;
const rootX = 16, rootW = 212, subX = 276, subW = 214, leafX = 540, leafW = 652;
// vertical layout: leaves stacked, extra gap between branches
let yy = head + 4;
const lay = branches.map(b => {
  const ys = b.leaves.map((_, i) => { const y = yy; yy += lh + (i < b.leaves.length - 1 ? lgap : 0); return y; });
  yy += bgap;
  return {...b, ys, top: ys[0], bot: ys.at(-1) + lh};
});
const rootTop = lay[0].top, rootBot = lay.at(-1).bot, rootMid = (rootTop + rootBot) / 2;
const elbow = (x1, y1, x2, y2) => { const mx = (x1 + x2) / 2; return `<path d="M${x1} ${y1} H${mx} V${y2} H${x2}" fill="none" stroke="#8d949a" stroke-width="1.3"/>`; };
const lines = lay.map(b => {
  const mid = (b.top + b.bot) / 2;
  return elbow(rootX + rootW, rootMid, subX, mid) + b.ys.map(y => elbow(subX + subW, mid, leafX, y + lh / 2)).join('');
}).join('');
const subBoxes = lay.map(b => {
  const mid = (b.top + b.bot) / 2, h = b.bot - b.top;
  return `<rect x="${subX}" y="${b.top}" width="${subW}" height="${h}" fill="#f1f7f5"/><rect x="${subX}" y="${b.top}" width="4" height="${h}" fill="#0d5c4f"/>
    <text x="${subX + 20}" y="${mid - 8}" style="font:400 26px var(--s-fig);fill:#0d5c4f">${b.no}</text>
    <text x="${subX + 50}" y="${mid - 10}" class="s-sv-t">${b.title[0]}</text><text x="${subX + 50}" y="${mid + 14}" class="s-sv-t">${b.title[1]}</text>`;
}).join('');
const leafBoxes = lay.flatMap(b => b.leaves.map((l, i) => {
  const y = b.ys[i], s = status[l.st];
  return `<rect x="${leafX + 0.5}" y="${y + 0.5}" width="${leafW - 1}" height="${lh - 1}" fill="#ffffff" stroke="#dcdfe2"/>
    <text x="${leafX + 14}" y="${y + 22}" style="font:400 16px var(--s-fig);fill:#0d5c4f">${l.no}</text>
    <text x="${leafX + 52}" y="${y + 22}" class="s-sv-t">${l.q}</text>
    <text x="${leafX + 52}" y="${y + 43}" class="s-sv-m">仮説：${l.h}</text>
    <text x="${leafX + leafW - 112}" y="${y + 33}" text-anchor="end" style="font:400 20px var(--s-fig);fill:${l.fx === '—' ? '#8d949a' : '#1c2024'}">${l.fx}</text>
    <rect x="${leafX + leafW - 90}" y="${y + 13}" width="76" height="26" fill="${s.fill}" stroke="${s.stroke}"/>
    <text x="${leafX + leafW - 52}" y="${y + 31}" text-anchor="middle" style="font:700 15px var(--s-jp);fill:${s.ink}">${s.t}</text>`;
})).join('');
const rootBox = `<rect x="${rootX}" y="${rootTop}" width="${rootW}" height="${rootBot - rootTop}" fill="#0d5c4f"/>
  <text x="${rootX + 18}" y="${rootMid - 58}" style="font:700 15px var(--s-jp);fill:#bfe0d8;letter-spacing:.14em">主論点</text>
  ${root.map((t, i) => `<text x="${rootX + 18}" y="${rootMid - 18 + i * 28}" style="font:700 18px var(--s-jp);fill:#ffffff">${t}</text>`).join('')}`;
const heads = [[rootX, '主論点'], [subX, 'サブ論点'], [leafX, '検証すべき問いと仮説'], [leafX + leafW - 112, '利益率効果', 'end'], [leafX + leafW - 52, '状態', 'middle']]
  .map(([x, t, a]) => `<text x="${x}" y="18" ${a ? `text-anchor="${a}"` : ''} class="s-sv-m" style="font-weight:600">${t}</text>`).join('');

const track = ['論点', '優先度', '選択肢', '推奨', '実行'].map((t, i) => `<span${i === 0 ? ' class="on"' : ''}>${t}</span>`).join('');

export default {
  study: true,
  id: 'tpl-strategy-issue-tree',
  title: '論点ツリー — 主論点から検証すべき問いへ',
  language: 'ja',
  notes: 'Purpose: 主論点を漏れなく重複なく分解し、どの問いがどこまで検証できたかを示す。\nModify: root・branches・leaves を書き換える。箱の高さと接続線は葉の数から自動で決まる。状態は done / wip / todo。\nInvariant: 線は「分解」を表し、矢印（順序）ではない。各問いは Yes/No で答えられる形にし、仮説と効果の単位を揃える。\nStatic: Already static.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-strategy s-tree-page',
  content: `<div class="s-wrap">
  <div class="s-tick"></div>
  <h1 class="s-title" data-region="title">${leaves.length}つの問いのうち${counts.done}つは検証を終えた。<br>残る主な論点は<em>自動化の効果と投資回収</em>に絞られた</h1>
  <div class="s-track" aria-label="章の位置">${track}</div>
  <div class="s-rule"></div>
  <div class="s-tree" data-region="primary">
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${P}-t ${P}-d">
      <title id="${P}-t">論点ツリー</title>
      <desc id="${P}-d">主論点を${branches.length}つのサブ論点と${leaves.length}つの問いに分解。${leaves.map(l => `${l.no} ${l.q}（${status[l.st].t}）`).join('、')}。</desc>
      ${heads}${lines}${rootBox}${subBoxes}${leafBoxes}
    </svg>
  </div>
  <div class="s-so" style="top:604px" data-region="support"><b>示唆</b><p>検証済みの${counts.done}施策だけで+${doneFx.toFixed(1)}pt。目標の6%に届くかは、2.2の自動化効果にかかっている。</p></div>
  <div class="s-foot"><span data-region="source">例示データ · 効果は2029年度の営業利益率への寄与（ベースライン2.0%）</span><span>北辰コンサルティング<b>2</b></span></div>
</div>`
};
