// Template: プロジェクト定例・進捗報告 · リスク・課題一覧（影響×確度）. Synthetic example content; replace data and copy.
// マトリクス上の位置・スコア・並び順・色帯はすべて items 配列から計算します。
const P = 'tpl-project-status-risks';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const meta = { project: 'MINATO', name: '受発注システム刷新', meeting: '第14回 定例', date: '2026年9月23日（水）' };

// kind: issue＝すでに起きている課題（確度5として扱う）, risk＝起こりうるリスク. impact・likelihood は1〜5.
const items = [
  { id: 'I-1', kind: 'issue', title: 'インフラ担当が10月から1名減', impact: 4, likelihood: 5, action: '協力会社からの補充か作業の外部委託かを決める', owner: 'PM', due: '10/2' },
  { id: 'R-1', kind: 'risk', title: '旧システムの取引先マスタに重複データ', impact: 5, likelihood: 3, action: '名寄せルールを業務部門と確定し、リハーサル前に2回検証', owner: '業務リード', due: '10/16' },
  { id: 'I-2', kind: 'issue', title: '帳票モジュールに不具合が集中', impact: 3, likelihood: 5, action: '帳票の設計レビューを追加で2回実施', owner: 'QAリード', due: '10/9' },
  { id: 'R-2', kind: 'risk', title: '外部EDI接続先との試験日程が取れない', impact: 4, likelihood: 2, action: '取引先2社の接続試験枠を前倒しで予約', owner: '開発リード', due: '10/20' },
  { id: 'R-3', kind: 'risk', title: '年末の繁忙期と移行リハーサルが重なる', impact: 3, likelihood: 3, action: '業務部門の参加者を11月中に確定', owner: '業務リード', due: '11/13' },
  { id: 'R-4', kind: 'risk', title: 'ライセンス費用が為替で増える', impact: 2, likelihood: 2, action: '月次で監視。予備費の範囲内なら対応しない', owner: 'PM', due: '毎月' }
];
const score = it => it.impact * it.likelihood;
const zone = s => s >= 15 ? { name: '要対応', bg: '#f6d3cd', fg: '#b8372a' } : s >= 8 ? { name: '注意', bg: '#fbe6b4', fg: '#946000' } : { name: '監視', bg: '#dcefe3', fg: '#2b7a4b' };
const sorted = [...items].sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id));
const color = it => it.kind === 'issue' ? '#b8372a' : '#1d3a5f';

// matrix geometry
const C = 70, X0 = 74, Y0 = 18, N = 5;
const cx = l => X0 + (l - 0.5) * C, cy = i => Y0 + (N - i + 0.5) * C;
const cells = [];
for (let i = 1; i <= N; i++) for (let l = 1; l <= N; l++) {
  const z = zone(i * l);
  cells.push(`<rect x="${X0 + (l - 1) * C + 1.5}" y="${Y0 + (N - i) * C + 1.5}" width="${C - 3}" height="${C - 3}" rx="6" fill="${z.bg}" opacity="${0.55 + (i * l) / 50}"/>`);
}
const groups = {};
items.forEach(it => { const k = `${it.impact}-${it.likelihood}`; (groups[k] ||= []).push(it); });
const marks = Object.values(groups).flatMap(g => g.map((it, j) => {
  const dx = (j - (g.length - 1) / 2) * 30, x = cx(it.likelihood) + dx, y = cy(it.impact);
  const shape = it.kind === 'issue'
    ? `<rect x="${x - 19}" y="${y - 15}" width="38" height="30" rx="7" fill="${color(it)}"/>`
    : `<circle cx="${x}" cy="${y}" r="17.5" fill="${color(it)}"/>`;
  return `${shape}<text x="${x}" y="${y + 5}" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">${it.id}</text>`;
})).join('');
const ticks = [1, 2, 3, 4, 5].map(v => `<text x="${cx(v)}" y="${Y0 + N * C + 22}" font-size="15" fill="#5f6b7c" text-anchor="middle">${v}</text>
  <text x="${X0 - 12}" y="${cy(v) + 5}" font-size="15" fill="#5f6b7c" text-anchor="end">${v}</text>`).join('');
const svg = `<svg viewBox="0 0 ${X0 + N * C + 10} ${Y0 + N * C + 58}" width="${X0 + N * C + 10}" height="${Y0 + N * C + 58}" role="img" aria-labelledby="${P}-t ${P}-d" font-family="'Hiragino Sans','Noto Sans JP','Yu Gothic','Meiryo','IPAGothic',sans-serif">
<title id="${P}-t">影響と発生確度のマトリクス</title>
<desc id="${P}-d">${sorted.map(it => `${it.id} ${it.title}：影響${it.impact}、確度${it.likelihood}、スコア${score(it)}`).join('。')}。例示データ。</desc>
${cells.join('')}${ticks}${marks}
<text x="${X0 + N * C / 2}" y="${Y0 + N * C + 48}" font-size="15" font-weight="700" fill="#465264" text-anchor="middle">発生確度 →</text>
<text transform="translate(18 ${Y0 + N * C / 2}) rotate(-90)" font-size="15" font-weight="700" fill="#465264" text-anchor="middle">影響 →</text>
</svg>`;

const rows = sorted.map(it => {
  const s = score(it), z = zone(s);
  return `<tr><td><span class="ps-id" style="background:${color(it)};border-radius:${it.kind === 'issue' ? '6px' : '13px'}">${it.id}</span></td>
  <td><span class="ps-kind${it.kind === 'issue' ? ' is-issue' : ''}">${it.kind === 'issue' ? '課題' : 'リスク'}</span><b>${esc(it.title)}</b></td>
  <td><span class="ps-score ps-num" style="color:${z.fg}">${s}<small>${it.impact}×${it.likelihood}</small></span></td>
  <td>${esc(it.action)}</td><td><b>${esc(it.owner)}</b><br><span class="ps-num">${esc(it.due)}</span></td></tr>`;
}).join('');
const top = sorted[0];

const legend = [['15以上', zone(15)], ['8〜14', zone(8)], ['7以下', zone(1)]].map(([r, z]) => `<span style="display:inline-flex;align-items:center;gap:6px"><i style="display:inline-block;width:16px;height:16px;border-radius:4px;background:${z.bg}"></i>${r} ${z.name}</span>`).join('')
  + `<span style="display:inline-flex;align-items:center;gap:6px"><i style="display:inline-block;width:18px;height:14px;border-radius:4px;background:#b8372a"></i>課題</span><span style="display:inline-flex;align-items:center;gap:6px"><i style="display:inline-block;width:16px;height:16px;border-radius:50%;background:#1d3a5f"></i>リスク</span>`;

const logo = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="6" fill="#1d3a5f"/><path d="M4 14c2.7-2.6 5.3-2.6 8 0s5.3 2.6 8 0" fill="none" stroke="#5ec4c4" stroke-width="2" stroke-linecap="round"/><path d="M4 9c2.7-2.6 5.3-2.6 8 0s5.3 2.6 8 0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`;
const bar = () => `<header class="ps-bar">${logo}<p>${meta.project}<span>${meta.name}プロジェクト</span></p><p class="ps-meta"><b>${meta.meeting}</b>${meta.date}</p></header>`;

export default {
  study: true,
  id: 'tpl-project-status-risks',
  title: 'リスク・課題一覧：影響×発生確度',
  language: 'ja',
  notes: 'Purpose: リスクと課題を同じ尺度で並べ、今週どれに手を打つかを決める。\nModify: items（ID、種別、内容、影響、確度、対策、担当、期限）を書き換える。マトリクスの位置・スコア・並び順・色帯は自動で再計算される。\nInvariant: スコア＝影響×確度。課題（すでに起きていること）は確度5として扱い、形でリスクと区別する。対策には担当と期限を必ず付ける。\nStatic: ビルドなし。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-project-status ps-risks-page',
  content: `<div class="ps-page">${bar()}
<div class="ps-abs" style="left:56px;top:66px;right:56px">
  <p class="ps-sec">05　リスクと課題</p>
  <h1 class="ps-title" data-region="title">最優先は課題${top.id}（インフラ要員の減員）。10月2日までに補充方法を決めます</h1>
</div>
<div class="ps-fig" data-region="primary" style="left:34px;top:176px">${svg}</div>
<table class="ps-risks" data-region="support" style="top:176px">
  <colgroup><col style="width:56px"><col style="width:228px"><col style="width:74px"><col><col style="width:104px"></colgroup>
  <thead><tr><th>ID</th><th>内容</th><th>影響×確度</th><th>対策</th><th>担当・期限</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="ps-abs" style="left:56px;bottom:18px;right:56px;display:flex;gap:20px;align-items:center;font:400 15px/1 var(--ps-jp);color:var(--ps-ink-2)">${legend}<span style="margin-left:auto;color:var(--ps-ink-3)">例示データ・スコア＝影響×確度（各1〜5）</span></div>
</div>`
};
