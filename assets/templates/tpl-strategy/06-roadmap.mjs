// Template: 戦略提案（コンサル型）· 実行ロードマップ（ガント）. Synthetic example content; replace data and copy.
// Time is in quarters from the start (0 = 2026年10月). Bars, phase band, gates and grid are computed from these arrays.
const P = 'tpl-strategy-roadmap';
const years = [{label: '2026年度', q: ['Q3', 'Q4']}, {label: '2027年度', q: ['Q1', 'Q2', 'Q3', 'Q4']}, {label: '2028年度', q: ['Q1', 'Q2', 'Q3', 'Q4']}];
const nQ = years.reduce((s, y) => s + y.q.length, 0);
const phases = [
  {t: 'フェーズ1　即効策', a: 0, b: 3},
  {t: 'フェーズ2　構造改革', a: 3, b: 6},
  {t: 'フェーズ3　自動化と定着', a: 6, b: 10}
];
const streams = [
  {name: '料金改定', lever: '1.1', tasks: [{t: '上位荷主と交渉', a: 0, b: 2}, {t: '新料金を適用', a: 2, b: 5, soft: true}]},
  {name: '営業集中', lever: '1.2', tasks: [{t: '専任チーム編成', a: 1, b: 2.5}, {t: '3業種で新規獲得', a: 2.5, b: 10, soft: true}]},
  {name: '拠点統合', lever: '2.1', tasks: [{t: '戸田を改修', a: 1, b: 3}, {t: '川口から移管', a: 3, b: 5.5}], ms: [{at: 6, t: '川口閉鎖'}]},
  {name: '部分自動化', lever: '2.2', tasks: [{t: '仕様策定・発注', a: 2, b: 4.5}, {t: '設置・試運転', a: 4.5, b: 8}, {t: '本稼働', a: 8, b: 10}]},
  {name: '人員と組織', lever: '3.2', tasks: [{t: '配置転換計画', a: 0, b: 1.5}, {t: '多能工化の教育', a: 1.5, b: 8, soft: true}]},
  {name: 'PMO', lever: '—', tasks: [{t: '月次でKPIと予算を確認', a: 0, b: 10, thin: true}]}
];
const gates = [{at: 2, t: '判断1　自動化を発注するか', d: '2027年3月'}, {at: 6, t: '判断2　稼働範囲を確定', d: '2028年3月'}];

const W = 1160, H = 420, LX = 178, RX = 1156, qw = (RX - LX) / nQ;
const X = q => LX + q * qw;
const yHead = 0, yPh = 58, rowTop = 100, rowH = 46;
let qi = 0;
const header = years.map(yr => {
  const x0 = X(qi), x1 = X(qi + yr.q.length);
  const qs = yr.q.map((q, j) => `<text x="${(X(qi + j) + qw / 2).toFixed(1)}" y="${yHead + 44}" text-anchor="middle" class="s-sv-m">${q}</text>`).join('');
  qi += yr.q.length;
  return `<text x="${x0 + 8}" y="${yHead + 16}" class="s-sv-t" style="font-size:15px">${yr.label}</text><line x1="${x0}" x2="${x0}" y1="${yHead}" y2="${rowTop + streams.length * rowH}" stroke="#1c2024" stroke-width="1"/>${qs}${x1 >= RX - 1 ? `<line x1="${x1}" x2="${x1}" y1="${yHead}" y2="${rowTop + streams.length * rowH}" stroke="#1c2024" stroke-width="1"/>` : ''}`;
}).join('');
const qgrid = Array.from({length: nQ}, (_, i) => `<line x1="${X(i)}" x2="${X(i)}" y1="${yHead + 26}" y2="${rowTop + streams.length * rowH}" stroke="#dcdfe2"/>`).join('');
const phaseBand = phases.map((p, i) => `<rect x="${X(p.a) + 1}" y="${yPh}" width="${X(p.b) - X(p.a) - 2}" height="26" fill="${['#e2eeeb', '#c9dfd9', '#a9ccc3'][i]}"/>
  <text x="${X(p.a) + 10}" y="${yPh + 18}" style="font:700 15px var(--s-jp);fill:#0d5c4f">${p.t}</text>`).join('');
const rows = streams.map((s, r) => {
  const y0 = rowTop + r * rowH, cy = y0 + rowH / 2;
  const label = `<text x="8" y="${cy + 6}" class="s-sv-t">${s.name}</text><text x="${LX - 12}" y="${cy + 5}" text-anchor="end" style="font:400 15px var(--s-fig);fill:#646a71">${s.lever}</text>`;
  const tasks = s.tasks.map(t => {
    const x = X(t.a) + 2, w = X(t.b) - X(t.a) - 4, h = t.thin ? 8 : 26;
    const bar = t.soft
      ? `<rect x="${x}" y="${cy - h / 2}" width="${w}" height="${h}" fill="#e2eeeb" stroke="#3d8878" stroke-dasharray="4 3"/>`
      : `<rect x="${x}" y="${cy - h / 2}" width="${w}" height="${h}" fill="${t.thin ? '#8d949a' : '#0d5c4f'}"/>`;
    const txt = t.thin
      ? `<text x="${x + 10}" y="${cy - 10}" class="s-sv-m">${t.t}</text>`
      : `<text x="${x + 10}" y="${cy + 5}" style="font:600 15px var(--s-jp);fill:${t.soft ? '#0d5c4f' : '#ffffff'}">${t.t}</text>`;
    return bar + txt;
  }).join('');
  const ms = (s.ms || []).map(m => `<rect x="${X(m.at) - 8}" y="${cy - 8}" width="16" height="16" transform="rotate(45 ${X(m.at)} ${cy})" fill="#1c2024"/><text x="${X(m.at) + 14}" y="${cy + 5}" style="font:700 15px var(--s-jp);fill:#1c2024">${m.t}</text>`).join('');
  return label + tasks + ms;
}).join('');
const bands = streams.map((_, r) => r % 2 === 0 ? `<rect x="0" y="${rowTop + r * rowH}" width="${RX}" height="${rowH}" fill="#f4f5f6"/>` : '').join('');
const bottom = rowTop + streams.length * rowH;
const gateMarks = gates.map(g => `<line x1="${X(g.at)}" x2="${X(g.at)}" y1="${yPh - 4}" y2="${bottom + 6}" stroke="#c98a12" stroke-width="2" stroke-dasharray="5 4"/>
  <rect x="${X(g.at) - 7}" y="${bottom + 2}" width="14" height="14" transform="rotate(45 ${X(g.at)} ${bottom + 9})" fill="#c98a12"/>
  <text x="${X(g.at) + 14}" y="${bottom + 16}" style="font:700 15px var(--s-jp);fill:#8a5a04">${g.t}</text>
  <text x="${X(g.at) + 14}" y="${bottom + 36}" class="s-sv-m">${g.d}</text>`).join('');

const track = ['論点', '優先度', '選択肢', '推奨', '実行'].map((t, i) => `<span${i === 4 ? ' class="on"' : ''}>${t}</span>`).join('');

export default {
  study: true,
  id: 'tpl-strategy-roadmap',
  title: '実行ロードマップ（ガント）',
  language: 'ja',
  notes: 'Purpose: 推奨案を実行する順序・期間・判断の時期を1枚で示し、今日決めてほしいことで締める。\nModify: years（四半期の並び）、phases、streams（a・b は開始・終了の四半期番号、soft は継続・準備）、gates を差し替える。\nInvariant: 各ワークストリームは論点ツリーの番号に対応させる。判断ゲートは日付と「何を決めるか」を書く。最後の枠には会議で決める事項を1つだけ置く。\nStatic: Already static.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-strategy s-roadmap',
  content: `<div class="s-wrap">
  <div class="s-tick"></div>
  <h1 class="s-title" data-region="title">最初の18か月で料金改定と拠点統合を終え、<br><em>自動化は2度の判断を経て</em>2029年度に本稼働させる</h1>
  <div class="s-track" aria-label="章の位置">${track}</div>
  <div class="s-rule"></div>
  <div class="s-gantt" data-region="primary">
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${P}-t ${P}-d">
      <title id="${P}-t">実行ロードマップ（2026年10月〜2029年3月）</title>
      <desc id="${P}-d">${streams.map(s => `${s.name}：${s.tasks.map(t => t.t).join('→')}`).join('。')}。判断の時期は${gates.map(g => `${g.d}（${g.t.replace(/\s+/g, '')}）`).join('、')}。</desc>
      <text x="8" y="44" class="s-sv-m">ワークストリーム</text><text x="${LX - 12}" y="44" text-anchor="end" class="s-sv-m">論点</text>
      ${bands}${qgrid}${header}${phaseBand}${rows}${gateMarks}
    </svg>
  </div>
  <div class="s-so" style="top:606px" data-region="support"><b>本日の決定事項</b><p>フェーズ1の着手とPMOの設置を承認いただきたい。自動化投資の可否は2027年3月の判断1で改めて諮る。</p></div>
  <div class="s-foot"><span data-region="source">例示データ · 実線＝実施、点線＝継続・定着、◆＝判断の時期</span><span>北辰コンサルティング<b>6</b></span></div>
</div>`
};
