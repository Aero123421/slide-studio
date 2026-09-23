// Template: 戦略提案（コンサル型）· 選択肢比較表（ハーベイボール）. Synthetic example content; replace data and copy.
// Scores 0–4 per criterion drive the Harvey balls and the total; the recommended column is highlighted by `rec`.
const P = 'tpl-strategy-options';
const options = [
  {k: 'A', name: '全自動倉庫を新設', desc: '自社で60億円を投じ、新拠点に集約'},
  {k: 'B', name: '3PL大手に運営を委託', desc: '庫内作業と配送を外部に移管'},
  {k: 'C', name: '段階導入', desc: '3つの打ち手を効果の早い順に実施', rec: true}
];
const criteria = [
  {name: '利益改善の大きさ', note: '完成後の最大値', s: [[4, '+4.8pt（2031年度）'], [2, '+1.9pt、委託料が重い'], [3, '+4.1pt']]},
  {name: '投資負担の軽さ', note: '初期投資と借入余力', s: [[0, '借入の上限に近い'], [4, 'ほぼ不要'], [3, '自己資金内で賄える']]},
  {name: '実行リスクの低さ', note: '工期・稼働・品質', s: [[1, '建設遅延の影響が大きい'], [2, '移管中の品質低下'], [3, '段階ごとに見直せる']]},
  {name: '効果が出る速さ', note: '最初の利益寄与まで', s: [[1, '稼働は2029年以降'], [3, '1年後から'], [3, '半年後から']]},
  {name: '荷主との関係維持', note: '上位20荷主への影響', s: [[3, '移転時の説明が必要'], [1, '直接の接点を失う'], [4, '現行の窓口を維持']]}
];
const quant = [
  {name: '2029年度 営業利益率', v: ['4.4%', '3.9%', '6.1%']},
  {name: '必要投資額', v: ['60億円', '3億円', '24億円']},
  {name: '投資回収期間', v: ['9.5年', '—', '4.2年']}
];
const totals = options.map((_, i) => criteria.reduce((s, c) => s + c.s[i][0], 0));
const max = criteria.length * 4;

const harvey = (n, id) => {
  const r = 10, c = 12, a = n / 4 * 2 * Math.PI - Math.PI / 2;
  const wedge = n === 0 ? '' : n === 4 ? `<circle cx="${c}" cy="${c}" r="${r}" fill="#1c2024"/>`
    : `<path d="M${c} ${c} L${c} ${c - r} A${r} ${r} 0 ${n > 2 ? 1 : 0} 1 ${(c + r * Math.cos(a)).toFixed(2)} ${(c + r * Math.sin(a)).toFixed(2)}Z" fill="#1c2024"/>`;
  return `<svg viewBox="0 0 24 24" role="img" aria-labelledby="${id}"><title id="${id}">${n}/4</title><circle cx="${c}" cy="${c}" r="${r}" fill="#fff" stroke="#1c2024" stroke-width="1.5"/>${wedge}</svg>`;
};
const recCls = i => (options[i].rec ? ' class="is-rec"' : '');
const head = `<tr><th></th>${options.map((o, i) => `<th${recCls(i)}><p class="s-oname"><span class="s-otag">案${o.k}</span>${o.name}${o.rec ? '<span class="s-orec">推奨</span>' : ''}</p><p class="s-odesc">${o.desc}</p></th>`).join('')}</tr>`;
const qual = criteria.map((c, ci) => `<tr><td class="s-crit">${c.name}<span>${c.note}</span></td>${c.s.map(([n, t], i) => `<td${recCls(i)}><span class="s-hb">${harvey(n, `${P}-h${ci}${i}`)}${t}</span></td>`).join('')}</tr>`).join('');
const total = `<tr class="s-break"><td class="s-crit">定性評価の合計<span>${max}点満点</span></td>${totals.map((t, i) => `<td class="s-q${options[i].rec ? ' is-rec' : ''}">${t}<small>／${max}</small></td>`).join('')}</tr>`;
const quan = quant.map((q, qi) => `<tr${qi === 0 ? ' class="s-break"' : ''}><td class="s-crit">${q.name}</td>${q.v.map((v, i) => `<td class="s-q${options[i].rec ? ' is-rec' : ''}">${v.replace(/([\d.]+)(.*)/, '$1<small>$2</small>')}</td>`).join('')}</tr>`).join('');
const legend = [0, 1, 2, 3, 4].map(n => `<span>${harvey(n, `${P}-lg${n}`)}</span>`).join('');

const track = ['論点', '優先度', '選択肢', '推奨', '実行'].map((t, i) => `<span${i === 2 ? ' class="on"' : ''}>${t}</span>`).join('');

export default {
  study: true,
  id: 'tpl-strategy-options',
  title: '選択肢比較表 — ハーベイボールによる評価',
  language: 'ja',
  notes: 'Purpose: 実現手段の選択肢を同じ評価軸で並べ、推奨案がどの点で優れ、どの点で劣るかを見せる。\nModify: options・criteria（各案の点数0〜4と一言コメント）・quant を差し替える。合計と推奨列の強調は自動。\nInvariant: 評価軸はすべて「●ほど良い」の向きに揃える（例：投資負担の「軽さ」）。定性評価と定量値を分けて示す。推奨案の弱点も隠さない。\nStatic: Already static.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-strategy s-options',
  content: `<div class="s-wrap">
  
  <h1 class="s-title" data-region="title"><em>段階導入（案C）</em>は利益改善で全自動化に及ばないが、<br>投資とリスクの釣り合いが最も良い</h1>
  <div class="s-track" aria-label="章の位置">${track}</div>
  <div class="s-rule"></div>
  <div class="s-opt" data-region="primary">
    <table>
      <thead>${head}</thead>
      <tbody>
        ${qual}${total}${quan}
      </tbody>
    </table>
  </div>
  <div class="s-foot"><span data-region="source">例示データ · 利益改善はベースライン2.0%からの差</span><span>北辰コンサルティング<b>4</b></span></div>
  <div class="s-legend" style="right:260px" aria-label="評価の凡例"><span>劣る</span>${legend}<span>優れる</span></div>
</div>`
};
