// Interaction study · Matrix lookup — a parcel rate card read by size and destination (Japanese page).
// Every rate comes from one formula (size step + zone surcharge, rounded to 10 yen), so the table, the
// selection and the headline always agree. Sender: 関東.
const sizes = ['60', '80', '100', '120', '140', '160'];                     // サイズ = 3辺の合計（cm）
const zones = ['関東', '中部', '関西', '中国', '四国', '九州', '北海道', '沖縄'];
const base = 940, perSize = 260;                                             // 60サイズ・関東内の運賃と、1サイズごとの加算（円, 税込）
const zoneFee = [0, 110, 220, 330, 330, 550, 660, 880];                      // 地帯加算（円）
const zonePerSize = [0, 20, 40, 60, 60, 90, 120, 300];                       // 遠い地帯ほど大きいサイズで上がる分（円/サイズ）
const rate = (s, z) => Math.round((base + perSize * s + zoneFee[z] + zonePerSize[z] * s) / 10) * 10;
const values = sizes.map((_, s) => zones.map((__, z) => rate(s, z)));
const start = { row: 2, column: 8 };                                         // 80サイズ・沖縄（1始まり）
const pick = values[start.row - 1][start.column - 1], local = values[start.row - 1][0];
const yen = v => v.toLocaleString('ja-JP') + '円';
const ID = 'interaction-matrix';

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Matrix lookup: parcel rates by size and destination',
  notes: `Purpose: 運賃表のように行と列の二つの条件で決まる値を、聴衆の質問（「この大きさを沖縄へ送るといくら？」）に合わせてその場で引き、同じ行・列の値と比べられるようにする。
Modify: \`sizes\`・\`zones\` と運賃の式（\`base\`・\`perSize\`・\`zoneFee\`・\`zonePerSize\`）を差し替えるか、\`values\` に実際の運賃表を入れる。見出しの金額と倍率は \`values\` から計算される。
Invariant: 表の数字はすべて見えたまま。選んだ行と列は淡い面で、交点のセルだけを強調色で示す。金額は右揃え、桁区切りつき。
Static: 書き出しは見出しと同じ選択（${sizes[start.row - 1]}サイズ・${zones[start.column - 1]}）を表示する。表全体が見えるので、配布資料としてもそのまま使える。`,
  sources: [{ type: 'original-example', file: 'assets/interactions/matrix.mjs' }],
  exportPolicy: 'final',
  className: 'st cs-finance-ledger',
  content: `<h1 class="st-head">${sizes[start.row - 1]}サイズを関東から${zones[start.column - 1]}へ送ると${yen(pick)}。関東内に送る${yen(local)}の${(pick / local).toFixed(1)}倍になる</h1>
<p class="st-dek">ハヤテ便（架空）の運賃表。関東から発送、税込。サイズは縦・横・高さの合計（cm）。</p>
<div class="widget" data-interactive="" id="${ID}-widget" data-region="primary"><div class="w-plot"></div><div class="w-controls"></div><output aria-live="polite" class="w-status"></output></div>
<p class="st-source" data-region="source"><span>架空のデータ · 運賃は基本料金・サイズ加算・地帯加算の式から計算</span><span>操作 · 行と列で引く表</span></p>`,
  widgets: [{
    id: `${ID}-widget`,
    kind: 'matrix',
    initial: { ...start },
    data: { rows: sizes.map(s => `${s}サイズ`), columns: zones, values, suffix: '円', cellSuffix: '', caption: '運賃（円）。行がサイズ、列が届け先' },
    controls: { row: { label: '荷物のサイズ' }, column: { label: '届け先（関東から）' } },
    text: {
      reset: '元に戻す',
      status: '{rowName}を関東から{columnName}へ：{value}。同じサイズを関東内に送る{first}の{vsFirst}倍。',
      readout: [{ value: '{value}', label: '{rowName}・関東→{columnName}' }],
    },
  }],
};
