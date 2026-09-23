// Template: 戦略提案（コンサル型）· 推奨案とその根拠. Synthetic example content; replace data and copy.
// The margin bridge (baseline + levers) produces the 2029 figure used in the hero panel and the title.
const P = 'tpl-strategy-recommendation';
const base = {label: ['2026年度', '見込み'], v: 2.0};
const levers = [
  {label: ['付帯作業の', '有償化'], v: 1.2, when: '27年度〜'},
  {label: ['高採算業種へ', '営業集中'], v: 0.4, when: '27年度〜'},
  {label: ['拠点統合', '川口→戸田'], v: 1.4, when: '28年度〜'},
  {label: ['仕分けの', '部分自動化'], v: 1.1, when: '29年度〜'}
];
const target = 6.0, invest = 24, payback = 4.2;
const end = Math.round((base.v + levers.reduce((s, l) => s + l.v, 0)) * 10) / 10;

const W = 740, H = 262, L = 44, R = 736, T = 30, B = 190, yMax = 7;
const cols = [{...base, kind: 'total'}, ...levers.map(l => ({...l, kind: 'step'})), {label: ['2029年度', '計画'], v: end, kind: 'total'}];
const slot = (R - L) / cols.length, bw = slot * 0.56;
const y = v => B - v / yMax * (B - T);
let run = 0;
const bars = cols.map((c, i) => {
  const x = L + i * slot + (slot - bw) / 2;
  let lo, hi;
  if (c.kind === 'total') { lo = 0; hi = c.v; run = c.v; } else { lo = run; hi = run + c.v; run = hi; }
  const fill = c.kind === 'total' ? (i === 0 ? '#8d949a' : '#0d5c4f') : '#3d8878';
  const next = i < cols.length - 1 ? `<line x1="${(x + bw).toFixed(1)}" x2="${(x + slot).toFixed(1)}" y1="${y(hi).toFixed(1)}" y2="${y(hi).toFixed(1)}" stroke="#8d949a" stroke-dasharray="3 3"/>` : '';
  const val = c.kind === 'total' ? `${c.v.toFixed(1)}%` : `+${c.v.toFixed(1)}`;
  return `${next}<rect x="${x.toFixed(1)}" y="${y(hi).toFixed(1)}" width="${bw.toFixed(1)}" height="${(y(lo) - y(hi)).toFixed(1)}" fill="${fill}"/>
    <text x="${(x + bw / 2).toFixed(1)}" y="${(y(hi) - 8).toFixed(1)}" text-anchor="middle" style="font:400 ${c.kind === 'total' ? 20 : 17}px var(--s-fig);fill:${i === cols.length - 1 ? '#0d5c4f' : '#1c2024'}">${val}</text>
    <text x="${(x + bw / 2).toFixed(1)}" y="${B + 22}" text-anchor="middle" class="s-sv-b">${c.label[0]}</text>
    <text x="${(x + bw / 2).toFixed(1)}" y="${B + 42}" text-anchor="middle" class="s-sv-m">${c.label[1]}</text>
    ${c.when ? `<text x="${(x + bw / 2).toFixed(1)}" y="${B + 62}" text-anchor="middle" style="font:600 15px var(--s-jp);fill:#8a5a04">${c.when}</text>` : ''}`;
}).join('');
const tgt = `<line x1="${L}" x2="${R}" y1="${y(target)}" y2="${y(target)}" stroke="#c98a12" stroke-width="1.6" stroke-dasharray="6 4"/>
  <text x="${L}" y="${y(target) - 8}" style="font:700 15px var(--s-jp);fill:#8a5a04">目標 ${target.toFixed(1)}%</text>`;

const reasons = [
  {h: '投資を自己資金で賄える', p: `必要投資${invest}億円は営業キャッシュフローの3年分以内。案Aの60億円は借入の上限に近い。`},
  {h: '早く出る利益で次を賄う', p: '料金改定の効果は半年後から出る。初年度の増益分で自動化投資の約4割を賄える。'},
  {h: '段階ごとに見直せる', p: '2027年3月と2028年3月に判断の場を置き、効果が未達なら自動化の範囲を縮める。'}
];

const track = ['論点', '優先度', '選択肢', '推奨', '実行'].map((t, i) => `<span${i === 3 ? ' class="on"' : ''}>${t}</span>`).join('');

export default {
  study: true,
  id: 'tpl-strategy-recommendation',
  title: '推奨案とその根拠',
  language: 'ja',
  notes: 'Purpose: 推奨案を1つに絞って言い切り、目標に届く道筋（利益率ブリッジ）と選ぶ理由3つを並べる。\nModify: base・levers（利益率への寄与pt、開始時期）・target・invest・payback を差し替える。2029年度の値は自動で合計される。\nInvariant: ブリッジの合計＝推奨パネルの数値＝見出しの数値。理由は比較表の評価軸に対応させ、各理由に数字か条件を1つ入れる。\nStatic: 3つの理由は順に表示される。最終状態ですべて表示。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-strategy s-rec',
  content: `<div class="s-wrap">
  
  <h1 class="s-title" data-region="title">推奨は<em>案C 段階導入</em>。料金改定で早く利益を確保し、<br>その利益で拠点統合と自動化を進める</h1>
  <div class="s-track" aria-label="章の位置">${track}</div>
  <div class="s-rule"></div>
  <section class="s-rec-hero" data-region="primary">
    <p class="s-lab">推奨案</p>
    <h2>案C 段階導入で、<br>${cols.at(-1).label[0]}に営業利益率<br>${end.toFixed(1)}%を目指す</h2>
    <p>効果の早い打ち手から順に実行し、各段階の成果を確かめてから次の投資に進む。</p>
    <div class="s-kpis">
      <div><strong>${end.toFixed(1)}<small>%</small></strong><span>2029年度 営業利益率</span></div>
      <div><strong>${invest}<small>億円</small></strong><span>総投資・回収${payback}年</span></div>
    </div>
  </section>
  <div class="s-rec-bridge" data-region="support">
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${P}-t ${P}-d">
      <title id="${P}-t">営業利益率のブリッジ（%）</title>
      <desc id="${P}-d">2026年度見込み${base.v.toFixed(1)}%に、${levers.map(l => `${l.label.join('')} +${l.v}pt`).join('、')}を加え、2029年度${end.toFixed(1)}%。目標${target.toFixed(1)}%。</desc>
      <text x="${L}" y="12" class="s-sv-m">営業利益率（%）と打ち手ごとの寄与（pt）</text>
      <line x1="${L}" x2="${R}" y1="${B}" y2="${B}" stroke="#1c2024" stroke-width="1.2"/>
      ${tgt}${bars}
    </svg>
  </div>
  <div class="s-why" data-region="support">
    ${reasons.map((r, i) => `<div data-step="${i + 1}" data-motion="lift"><span class="s-n">${i + 1}</span><h3>${r.h}</h3><p>${r.p}</p></div>`).join('')}
  </div>
  <div class="s-foot"><span data-region="source">例示データ · 寄与は各施策が満年度で効いた場合の利益率への効果</span><span>北辰コンサルティング<b>5</b></span></div>
</div>`
};
