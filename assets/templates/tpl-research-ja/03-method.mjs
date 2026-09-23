// Template: 学会・研究発表 · 手法パイプライン図. Synthetic example content; replace data and copy.
const ID = 'tpl-research-ja-method';
const C = { ink: '#1c2433', ink2: '#434c5e', mute: '#5b6271', rule: '#cfc6b2', card: '#fbfaf5', blue: '#2a63a8', blueL: '#dfe7f1', acc: '#b2432a', accL: '#f1dcd3', stone: '#e9e3d4' };
// Stage definitions: the single source for boxes, inputs and spec lines
const stages = [
  { no: 1, name: '自己教師あり事前学習', input: ['未ラベル画像', '12,000枚'], specs: [['入力', '未ラベル 12,000枚・512 px角'], ['課題', 'パッチの60%を隠して復元'], ['出力', 'エンコーダ E の重み']] },
  { no: 2, name: '少数ラベルで微調整', input: ['ラベル付き画像', '50枚'], specs: [['入力', 'ラベル付き 50枚'], ['損失', 'eq'], ['設定', '200エポック × 5シード']] },
  { no: 3, name: '推論と評価', input: ['評価用画像', '600枚・別の3橋'], held: true, specs: [['入力', '学習に使わない 600枚'], ['判定', '確率 0.5 以上をひび割れ'], ['指標', 'mIoU・clDice・途切れ数']] }
];
const handoffs = [['エンコーダ', '重みで初期化'], ['学習済み', 'モデル']];
const BW = 320, GAP = 96, BY = 104, BH = 292;
const bx = i => i * (BW + GAP);

// a small image tile with the same schematic crack in every stage
const crack = (x, y, s, stroke, w) => `<path d="M${x + s * .06},${y + s * .2} L${x + s * .3},${y + s * .36} L${x + s * .46},${y + s * .4} L${x + s * .62},${y + s * .6} L${x + s * .92},${y + s * .76}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
function tile(x, y, s, mode) {
  let g = `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${mode === 'mask' ? '#fff' : C.stone}" stroke="${C.ink}" stroke-width="1"/>`;
  if (mode === 'prob') {
    g += crack(x, y, s, C.acc, 14).replace('stroke-width', 'stroke-opacity=".18" stroke-width') + crack(x, y, s, C.acc, 7).replace('stroke-width', 'stroke-opacity=".4" stroke-width') + crack(x, y, s, C.acc, 2.5);
  } else if (mode === 'mask') g += crack(x, y, s, C.ink, 3.2);
  else g += crack(x, y, s, C.ink, 1.8);
  if (mode === 'masked') {
    const n = 6, c = s / n; // deterministic 60% mask pattern (22 of 36 patches)
    for (let k = 0; k < n * n; k++) if ((k * 7 + 3) % 36 < 22) g += `<rect x="${x + (k % n) * c}" y="${y + Math.floor(k / n) * c}" width="${c}" height="${c}" fill="#8e97a6" stroke="${C.stone}" stroke-width="1"/>`;
  }
  return g;
}
// encoder narrows, decoder widens
const trap = (x, y, w, h, dir, fill, stroke, label) => {
  const i = h * .28;
  const pts = dir === 'in' ? `${x},${y} ${x + w},${y + i} ${x + w},${y + h - i} ${x},${y + h}` : `${x},${y + i} ${x + w},${y} ${x + w},${y + h} ${x},${y + h - i}`;
  return `<polygon points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/><text x="${x + w / 2}" y="${y + h / 2 + 6}" text-anchor="middle" class="s-num-b">${label}</text>`;
};
const arrowR = (x1, y, x2, color = C.ink) => `<line x1="${x1}" y1="${y}" x2="${x2 - 2}" y2="${y}" stroke="${color}" stroke-width="1.4" marker-end="url(#${ID}-ah)"/>`;

function illustration(i) {
  const x = bx(i), y = BY + 58;
  if (i === 0) return tile(x + 16, y + 6, 92, 'masked') + arrowR(x + 112, y + 52, x + 134) + trap(x + 138, y + 4, 52, 96, 'in', C.blueL, C.blue, 'E') + arrowR(x + 194, y + 52, x + 208) + tile(x + 212, y + 6, 92, 'plain')
    + `<text x="${x + 62}" y="${y + 124}" text-anchor="middle" class="s-lab-s">隠した入力</text><text x="${x + 258}" y="${y + 124}" text-anchor="middle" class="s-lab-s">復元</text>`;
  if (i === 1) return tile(x + 16, y + 20, 64, 'plain') + arrowR(x + 84, y + 52, x + 100) + trap(x + 104, y + 4, 52, 96, 'in', C.blueL, C.blue, 'E') + trap(x + 162, y + 4, 52, 96, 'out', C.accL, C.acc, 'D')
    + `<path d="M${x + 130},${y + 4} C${x + 132},${y - 12} ${x + 186},${y - 12} ${x + 188},${y + 4}" fill="none" stroke="${C.mute}" stroke-width="1.2" stroke-dasharray="3 3"/>`
    + arrowR(x + 218, y + 52, x + 234) + tile(x + 238, y + 20, 64, 'mask')
    + `<text x="${x + 48}" y="${y + 124}" text-anchor="middle" class="s-lab-s">画像</text><text x="${x + 159}" y="${y + 124}" text-anchor="middle" class="s-lab-s">エンコーダ・デコーダ</text><text x="${x + 270}" y="${y + 124}" text-anchor="middle" class="s-lab-s">予測</text>`;
  return tile(x + 16, y + 10, 80, 'plain') + arrowR(x + 100, y + 50, x + 120) + tile(x + 124, y + 10, 80, 'prob') + arrowR(x + 208, y + 50, x + 228) + tile(x + 232, y + 10, 80, 'mask')
    + `<text x="${x + 56}" y="${y + 124}" text-anchor="middle" class="s-lab-s">入力</text><text x="${x + 164}" y="${y + 124}" text-anchor="middle" class="s-lab-s">確率マップ</text><text x="${x + 272}" y="${y + 124}" text-anchor="middle" class="s-lab-s">二値マスク</text>`;
}
const eq = `<tspan class="s-num" font-style="italic">L</tspan><tspan class="s-num"> = </tspan><tspan class="s-num" font-style="italic">L</tspan><tspan class="s-axis" dy="4">Dice</tspan><tspan class="s-num" dy="-4"> + λ·</tspan><tspan class="s-num" font-style="italic">L</tspan><tspan class="s-axis" dy="4">conn</tspan><tspan class="s-num" dy="-4">（λ = 0.3）</tspan>`;
function stage(s, i) {
  const x = bx(i);
  const sheets = [2, 1, 0].map(k => `<rect x="${x + BW / 2 - 18 + k * 4}" y="${6 - k * 4 + 4}" width="36" height="28" fill="${s.held ? '#fff' : (i === 0 ? C.blueL : C.accL)}" stroke="${C.ink}" stroke-width="1"/>`).join('');
  const inputs = `${sheets}<text x="${x + BW / 2 + 36}" y="20" class="s-lab-b">${s.input[0]}</text><text x="${x + BW / 2 + 36}" y="40" class="s-lab-s">${s.input[1]}</text>`
    + `<line x1="${x + BW / 2}" y1="46" x2="${x + BW / 2}" y2="${BY - 4}" stroke="${C.ink}" stroke-width="1.2" stroke-dasharray="4 3" marker-end="url(#${ID}-ah)"/>`;
  const specs = s.specs.map(([k, v], j) => `<text x="${x + 18}" y="${BY + 220 + j * 25}" class="s-lab-s">${k}</text><text x="${x + 60}" y="${BY + 220 + j * 25}" class="s-lab">${v === 'eq' ? eq : v}</text>`).join('');
  return `<g${i ? ` data-step="${i}" data-motion="reveal"` : ''}>${inputs}
<rect x="${x}" y="${BY}" width="${BW}" height="${BH}" fill="${C.card}" stroke="${C.ink}" stroke-width="1.2"/>
<rect x="${x}" y="${BY}" width="${BW}" height="40" fill="${C.ink}"/>
<text x="${x + 16}" y="${BY + 27}" class="s-fig" fill="#f3c4b4" style="fill:#f3c4b4">Stage ${s.no}</text>
<text x="${x + 84}" y="${BY + 27}" class="s-head" style="fill:#f6f3ea">${s.name}</text>
${illustration(i)}
<line x1="${x + 16}" y1="${BY + 196}" x2="${x + BW - 16}" y2="${BY + 196}" stroke="${C.rule}" stroke-width=".75"/>
${specs}
${i < handoffs.length ? `${arrowR(x + BW + 6, BY + 110, x + BW + GAP - 6)}<text x="${x + BW + GAP / 2}" y="${BY + 82}" text-anchor="middle" class="s-lab-s">${handoffs[i][0]}</text><text x="${x + BW + GAP / 2}" y="${BY + 100}" text-anchor="middle" class="s-lab-s">${handoffs[i][1]}</text>` : ''}
</g>`;
}
const fig = `<svg viewBox="0 0 1152 452" role="img" aria-labelledby="${ID}-t ${ID}-d">
<title id="${ID}-t">3段階の手法パイプライン</title>
<desc id="${ID}-d">Stage 1 で未ラベル画像12,000枚からパッチ復元によりエンコーダEを事前学習し、その重みで Stage 2 のエンコーダを初期化する。Stage 2 ではラベル付き50枚で、Dice損失と連結性損失の和（λ=0.3）によりE と新規デコーダDを微調整する。Stage 3 では学習に使わない別の3橋の600枚で確率マップを求め、0.5以上をひび割れと判定して評価する。</desc>
<defs><marker id="${ID}-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" fill="${C.ink}"/></marker></defs>
${stages.map(stage).join('')}
<g transform="translate(0,432)">
  <line x1="0" y1="-5" x2="40" y2="-5" stroke="${C.ink}" stroke-width="1.4" marker-end="url(#${ID}-ah)"/><text x="50" y="0" class="s-lab-s">処理の順序と受け渡すもの</text>
  <line x1="236" y1="-5" x2="276" y2="-5" stroke="${C.ink}" stroke-width="1.2" stroke-dasharray="4 3" marker-end="url(#${ID}-ah)"/><text x="286" y="0" class="s-lab-s">データの入力</text>
  <rect x="408" y="-14" width="18" height="18" fill="${C.blueL}" stroke="${C.blue}"/><text x="434" y="0" class="s-lab-s">事前学習した重み</text>
  <rect x="580" y="-14" width="18" height="18" fill="${C.accL}" stroke="${C.acc}"/><text x="606" y="0" class="s-lab-s">少数ラベルで新たに学習</text>
  <path d="M796,-5 C798,-17 832,-17 834,-5" fill="none" stroke="${C.mute}" stroke-width="1.2" stroke-dasharray="3 3"/><text x="844" y="0" class="s-lab-s">スキップ接続</text>
</g>
</svg>`;

export default {
  study: true,
  id: ID,
  title: '手法：事前学習・微調整・評価の3段階',
  language: 'ja',
  notes: 'Purpose: 手法を処理の順序どおりに示し、各段階の入力・目的・出力と、段階間で受け渡すものを明示する。\nModify: stages 配列の名称・入力データ・仕様行、handoffs の受け渡しラベルを書き換える。段階数を変える場合は BW と GAP を 1152px に収まるよう再計算する。\nInvariant: 実線矢印は処理の順序と受け渡し、破線はデータ入力。評価データが学習に使われていないことを図中に書く。損失の定義は脚注に残す。\nStatic: 各段階は順に表示される（reveal）。最終状態で3段階すべてが読める。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-research-ja rj-method',
  content: `<div class="rj-page">
<header class="rj-head"><span class="rj-sec"><span class="rj-secno">§2</span><b>手法</b></span><span>構造物画像解析シンポジウム 2026　口頭発表 B-3</span></header>
<h1 class="rj-title" data-region="title">未ラベル画像で形を学び、50枚で細線を教える</h1>
<figure class="rj-fig" style="left:64px;top:156px;width:1152px;height:452px" data-region="primary">${fig}</figure>
<p class="rj-cap" style="position:absolute;left:64px;top:620px;width:1152px" data-region="support"><b>連結性損失</b><i class="rj-num">L</i><sub>conn</sub>：予測と正解を細線化（ソフトスケルトン）し、互いの骨格が相手の領域に含まれる割合から求める。線が途切れるほど大きくなる。</p>
<footer class="rj-foot" data-region="source"><span>設定値は説明用の架空の例</span><span class="rj-folio">3 / 6</span></footer>
</div>`
};
