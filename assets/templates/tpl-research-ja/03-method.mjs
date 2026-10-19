// Template: 学会発表（日本語） · 手法（パイプライン図）. Synthetic example content; replace data and copy.
// Top: the training loop (teacher → probability map → two-level threshold → pseudo-label → student,
// student → teacher by EMA). Bottom: the one idea that is new, shown on a computed probability map:
// the same map thresholded once (0.9) and twice (0.9 seeds, grown through ≥ 0.5). Counts are computed.
import { el, fmt, arrowMarker } from '../../runtime/figure.mjs';

const ID = 'tpl-research-ja-method';
const setup = { labeled: 50, unlabeled: 18000, high: 0.9, low: 0.5 };
// Same crack geometry as the background page: [x, y, width] in patch pixels (0–50)
const crack = {
  size: 50,
  main: [[-1, 11, 2.7], [6, 13, 2.6], [12, 16, 2.5], [17, 16.5, 2.3], [22, 20, 2.1], [27, 23, 1.8], [31, 27, 1.6], [36, 29, 1.3], [41, 33, 1.1], [46, 38, 1.0], [51, 40, 0.9]],
  branch: [[22, 20, 1.3], [24, 26, 1.1], [23, 32, 1.0], [26, 38, 0.9], [28, 44, 0.8], [30, 51, 0.8]],
};

// ---- the teacher's probability map, synthesised from the crack: wide = confident, thin = faint
const N = crack.size;
const segs = [crack.main, crack.branch].flatMap(line => line.slice(1).map((p, i) => [line[i], p]));
const hash = (i, j) => { let h = (i * 374761393 + j * 668265263) ^ 0x5bd1e995; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function nearest(x, y) {
  let best = { gap: Infinity, w: 0, d: Infinity };
  for (const [[x0, y0, w0], [x1, y1, w1]] of segs) {
    const vx = x1 - x0, vy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * vx + (y - y0) * vy) / (vx * vx + vy * vy)));
    const d = Math.hypot(x - (x0 + t * vx), y - (y0 + t * vy)), w = w0 + t * (w1 - w0);
    if (d - w / 2 < best.gap) best = { gap: d - w / 2, w, d };
  }
  return best;
}
const truth = [], prob = [], width = [];
for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
  const n = nearest(i + 0.5, j + 0.5), r = Math.max(n.w / 2, 0.5), jitter = hash(i + 7, j + 13) - 0.5;
  const isCrack = n.d <= r;
  truth.push(isCrack ? 1 : 0);
  const conf = Math.max(0, Math.min(1, (n.w - 0.9) / 1.3));                 // 0 at the thinnest, 1 on the trunk
  prob.push(isCrack
    ? Math.min(0.99, 0.56 + 0.42 * conf - 0.06 * (n.d / r) * (1 - conf / 2) + 0.07 * jitter)   // 0.47–0.99 on the crack
    : Math.max(0.01, 0.4 * Math.exp(-(n.d - r) / 0.7) + 0.1 * hash(i + 41, j + 3)));        // < 0.5 off the crack
  width.push(isCrack ? n.w : null);
}
const idx = (i, j) => j * N + i;
const single = prob.map(p => (p >= setup.high ? 1 : 0));
const twoLevel = single.slice(), stack = [];
single.forEach((v, k) => { if (v) stack.push(k); });
while (stack.length) { // grow from confident seeds through 8-connected pixels with p ≥ low
  const k = stack.pop(), i = k % N, j = (k - i) / N;
  for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
    const a = i + di, b = j + dj;
    if (a < 0 || b < 0 || a >= N || b >= N) continue;
    const q = idx(a, b);
    if (!twoLevel[q] && prob[q] >= setup.low) { twoLevel[q] = 1; stack.push(q); }
  }
}
function pieces(m) { // 8-connected components
  const seen = new Uint8Array(m.length); let count = 0;
  m.forEach((v, k) => {
    if (!v || seen[k]) return;
    count++; const st = [k]; seen[k] = 1;
    while (st.length) { const c = st.pop(), i = c % N, j = (c - i) / N;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= N || b >= N) continue; const q = idx(a, b); if (m[q] && !seen[q]) { seen[q] = 1; st.push(q); } } }
  });
  return count;
}
const crackTotal = truth.reduce((a, b) => a + b, 0);
const kept = m => m.reduce((a, v, k) => a + (v && truth[k] ? 1 : 0), 0) / crackTotal;
// Does the pseudo-label still reach the two ends of the crack (right edge, bottom edge)?
const ends = [[N - 1, crack.main.at(-1)[1]], [crack.branch.at(-1)[0], N - 1]];
const reaches = m => ends.filter(([ei, ej]) => m.some((v, k) => v && Math.hypot(k % N - ei, Math.floor(k / N) - ej) <= 3)).length;
const describe = m => ({ kept: kept(m), breaks: pieces(m) - pieces(truth), ends: reaches(m) });
const result = { single: describe(single), twoLevel: describe(twoLevel) };
const thin = prob.filter((p, k) => width[k] !== null && width[k] < 1.1);
const thinP = thin.reduce((a, b) => a + b, 0) / thin.length;          // typical confidence on thin branches
const pct = v => `${Math.round(v * 100)}%`;
const n0 = v => fmt(v, { locale: 'ja', digits: 0 });

// ---- drawing helpers
const W = 1152, H = 440;
const A = `${ID}-arrow`, AA = `${ID}-arrow-acc`;
const arrow = (d, acc) => el('path', { d, fill: 'none', stroke: acc ? 'var(--rj-accent)' : 'var(--rj-ink2)', 'stroke-width': acc ? 2 : 1.5, 'marker-end': `url(#${acc ? AA : A})` });
const box = (x, y, w, h, label, acc) => el('rect', { x, y, width: w, height: h, fill: acc ? 'var(--rj-tint)' : '#fff', stroke: acc ? 'var(--rj-accent)' : 'var(--rj-ink)', 'stroke-width': acc ? 2 : 1.5 })
  + el('text', { x: x + w / 2, y: y + h / 2 + 6, 'text-anchor': 'middle', class: acc ? 's-strong s-acc' : 's-strong' }, label);
const data = (x, y, label, sub) => el('text', { x, y, class: 's-strong' }, label) + el('text', { x, y: y + 24, class: 's-lab' }, sub);

// pipeline geometry (one row per data source)
const r1 = 0, r2 = 104, bh = 52, mx = 200, mw = 180;        // row tops, box height, model column
const probX = 470, opX = 650, opW = 220, pseudoX = 960;
const pipeline = [
  data(0, r1 + 22, '未ラベル画像', `${n0(setup.unlabeled)}枚`),
  arrow(`M136 ${r1 + bh / 2}H${mx - 6}`),
  box(mx, r1, mw, bh, '教師モデル'),
  arrow(`M${mx + mw + 6} ${r1 + bh / 2}H${probX - 8}`),
  el('text', { x: probX, y: r1 + bh / 2 + 6, class: 's-strong' }, '確率マップ'),
  arrow(`M${probX + 100} ${r1 + bh / 2}H${opX - 6}`),
  box(opX, r1, opW, bh, '2段のしきい値', true),
  el('text', { x: opX + opW / 2, y: r1 + bh + 24, 'text-anchor': 'middle', class: 's-lab s-acc' }, `始点${setup.high}以上・延長${setup.low}以上`),
  arrow(`M${opX + opW + 6} ${r1 + bh / 2}H${pseudoX - 8}`, true),
  el('text', { x: pseudoX, y: r1 + bh / 2 + 6, class: 's-strong s-acc' }, '擬似ラベル'),
  data(0, r2 + 22, 'ラベル付き画像', `${setup.labeled}枚と正解マスク`),
  arrow(`M136 ${r2 + bh / 2}H${mx - 6}`),
  box(mx, r2, mw, bh, '生徒モデル'),
  arrow(`M${pseudoX + 45} ${r1 + bh / 2 + 16}V${r2 + bh / 2}H${mx + mw + 8}`, true),
  el('text', { x: pseudoX + 30, y: r2 + bh / 2 - 10, 'text-anchor': 'end', class: 's-lab' }, '正解の代わりに学ぶ（入力には強い摂動）'),
  arrow(`M${mx + mw / 2} ${r2 - 4}V${r1 + bh + 8}`),
  el('text', { x: mx + mw / 2 + 12, y: (r1 + bh + r2) / 2 + 6, class: 's-lab' }, '重みの指数移動平均'),
].join('');

// zoom: three registered panels of the same 50×50 patch
const s = 3.4, P = N * s, zy = 218, zx = [0, 206, 412];
function panel(x0, kind) {
  const out = [el('rect', { x: x0, y: zy, width: P, height: P, fill: '#fff' })];
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const k = idx(i, j); let fill = null, op = null;
    if (kind === 'prob') { if (prob[k] > 0.04) { fill = 'var(--rj-ink)'; op = prob[k].toFixed(2); } }
    else {
      const m = kind === 'single' ? single : twoLevel;
      if (m[k]) fill = kind === 'single' ? 'var(--rj-ink)' : 'var(--rj-accent)';
      else if (truth[k]) fill = 'var(--rj-rule)';
    }
    if (fill) out.push(el('rect', { x: x0 + i * s, y: zy + j * s, width: s, height: s, fill, 'fill-opacity': op }));
  }
  out.push(el('rect', { x: x0 + 0.5, y: zy + 0.5, width: P - 1, height: P - 1, fill: 'none', stroke: 'var(--rj-base2)' }));
  return out.join('');
}
const shape = r => r.ends === ends.length ? `枝の先までつながり、正解の${pct(r.kept)}が残る` : `細い部分が消え、残るのは正解の${pct(r.kept)}`;
const zoomLabels = [
  ['(a) 確率マップ', '教師の出力。濃いほど高い'],
  [`(b) しきい値${setup.high}だけ`, shape(result.single)],
  ['(c) 2段のしきい値', shape(result.twoLevel)],
];
const textBlock = (x, y, t, cls) => { const [a, b] = t.split('、'); return el('text', { x, y, class: cls }, el('tspan', { x }, b ? a + '、' : a), b ? el('tspan', { x, dy: 21 }, b) : ''); };
const zoom = zx.map((x, k) => el('text', { x, y: zy - 12, class: 's-panel' }, zoomLabels[k][0])
  + panel(x, ['prob', 'single', 'two'][k])
  + textBlock(x, zy + P + 24, zoomLabels[k][1], k === 2 ? 's-lab s-acc' : 's-lab')).join('');

const fig = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${ID}-t ${ID}-d">
<title id="${ID}-t">学習の流れと、2段のしきい値による擬似ラベルの作り方</title>
<desc id="${ID}-d">未ラベル画像${n0(setup.unlabeled)}枚を教師モデルに通して確率マップを作り、2段のしきい値で擬似ラベルにする。生徒モデルはラベル付き画像${setup.labeled}枚の正解と擬似ラベルから学び、教師は生徒の重みの指数移動平均で更新される。同じ確率マップをしきい値${setup.high}だけで切ると正解画素の${pct(result.single.kept)}しか残らず細い部分が消えるが、${setup.high}以上の画素から${setup.low}以上の隣接画素をたどると${pct(result.twoLevel.kept)}が残る。</desc>
<defs>${arrowMarker(A, 'var(--rj-ink2)', { size: 10 })}${arrowMarker(AA, 'var(--rj-accent)', { size: 11 })}</defs>
${pipeline}
<line x1="0" y1="${zy - 42}" x2="${W}" y2="${zy - 42}" stroke="var(--rj-rule)" stroke-width="1"/>
${zoom}
</svg>`;

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Method: teacher–student training with a two-level threshold that keeps thin cracks in the pseudo-labels',
  notes: `Purpose: 手法の全体（教師が擬似ラベルを作り、生徒が学ぶ）と、新しい一点（2段のしきい値）を1枚で示す。上段は流れ、下段は同じ確率マップでの比較。\nModify: setup の枚数としきい値を書き換える。下段の確率マップは crack から合成した模式図で、途切れの数と残る画素の割合は自動で数える。実データの例に替える場合は prob を実際の確率マップに置き換える。\nInvariant: 提案部分（2段のしきい値と擬似ラベル）だけを青にする。学習の流れは左から右、更新の戻りは下から上。下段の3枚は同じ範囲・同じ縮尺。\nStatic: 静的ページ。`,
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-research-ja rj-method',
  content: `<h1 class="rj-h" data-region="title">50枚で学んだ教師が擬似ラベルを作り、<span class="nw">細い線は2段のしきい値で残す</span></h1>
<figure class="rj-fig" style="left:64px;top:184px" data-region="primary">${fig}</figure>
<p class="rj-eq" style="left:750px;top:404px;width:466px" data-region="support">確率が<b>${setup.high}以上</b>の画素を始点に、<b>${setup.low}以上</b>で隣り合う画素をたどって擬似ラベルに加える。細い枝の確率は<span class="nw">${thinP.toFixed(1)}前後</span>しかないため、1段のしきい値では消えてしまう。</p>
<p class="rj-note" style="left:750px;top:532px;width:466px" data-region="source">下段は模式図。灰色は正解にあるが擬似ラベルから落ちた画素</p>
<footer class="rj-foot"><span>ラベル50枚で学ぶひび割れ検出</span><b>3</b></footer>`,
};
