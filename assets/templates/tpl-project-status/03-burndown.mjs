// Template: プロジェクト定例・進捗報告 · バーンダウン（計画線と実績線を計算で描画）. Synthetic example content; replace data and copy.
// 計画線・実績線・見込み線・見出しの数値は、すべて下の remaining 配列と計画値から計算します。
const P = 'tpl-project-status-burndown';
const meta = { project: 'MINATO', name: '受発注システム刷新', meeting: '第14回 定例', date: '2026年9月23日（水）' };
const DAY = 86400000;
const D = s => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
const md = t => { const d = new Date(t); return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`; };
const WD = ['日', '月', '火', '水', '木', '金', '土'];
const mdj = t => { const d = new Date(t); return `${d.getUTCMonth() + 1}月${d.getUTCDate()}日（${WD[d.getUTCDay()]}）`; };

const start = D('2026-07-31');          // 週次スナップショットの起点（金曜）
const planWeeks = 9;                    // 計画完了 = 起点から9週後
const initialScope = 420;               // 起点時点の総ストーリーポイント
const remaining = [420, 378, 338, 309, 290, 238, 188, 146]; // 各週金曜の残ポイント（追加分を含む）
const scopeChanges = [{ week: 4, pts: 24, label: '変更要求 CR-07・08' }];
const today = D('2026-09-23');
const lookback = 3;                       // 見込みに使う直近の週数

const last = remaining.length - 1;
const burned = remaining.slice(-lookback - 1).reduce((a, v, i, arr) => i ? a + (arr[i - 1] - v) : a, 0);
const velocity = burned / lookback;
const finishWeek = last + remaining[last] / velocity;
const weekDate = w => start + Math.round(w * 7) * DAY;
const finishDate = weekDate(finishWeek), planDate = weekDate(planWeeks);
const ideal = w => Math.max(0, initialScope * (1 - w / planWeeks));
const gap = Math.round(remaining[last] - ideal(last));
const need = Math.round(remaining[last] / (planWeeks - last));
const lateDays = Math.round((finishDate - planDate) / DAY);
const lateText = lateDays % 7 === 0 ? `${lateDays / 7}週間` : `${lateDays}日`;
const mdk = t => { const d = new Date(t); return `${d.getUTCMonth() + 1}月${d.getUTCDate()}日`; };

// geometry
const W = 820, H = 468, x0 = 64, x1 = 800, y0 = 408, y1 = 28, maxW = 11, maxPt = 450;
const sx = w => x0 + (w / maxW) * (x1 - x0), sy = v => y0 - (v / maxPt) * (y0 - y1);
const todayW = (today - start) / (7 * DAY);

const yTicks = [0, 100, 200, 300, 400].map(v => `<line x1="${x0}" x2="${x1}" y1="${sy(v)}" y2="${sy(v)}" stroke="${v ? '#e8ecf1' : '#1b2433'}" stroke-width="${v ? 1 : 1.5}"/>
  <text x="${x0 - 10}" y="${sy(v) + 5}" font-size="15" fill="#5f6b7c" text-anchor="end">${v}</text>`).join('');
const xTicks = Array.from({ length: maxW + 1 }, (_, w) => `<line x1="${sx(w)}" x2="${sx(w)}" y1="${y0}" y2="${y0 + 6}" stroke="#1b2433"/>
  <text x="${sx(w)}" y="${y0 + 26}" font-size="15" fill="#5f6b7c" text-anchor="middle">${md(weekDate(w))}</text>`).join('')
  + `<text x="${sx(planWeeks)}" y="${y0 + 46}" font-size="15" font-weight="700" fill="#465264" text-anchor="middle">計画</text>`
  + (Math.abs(finishWeek - Math.round(finishWeek)) < 0.15 ? `<text x="${sx(Math.round(finishWeek))}" y="${y0 + 46}" font-size="15" font-weight="700" fill="#0c7478" text-anchor="middle">見込み</text>` : '');
const planLine = `<path d="M${sx(0)} ${sy(initialScope)} L${sx(planWeeks)} ${sy(0)}" fill="none" stroke="#8a96a8" stroke-width="2.2" stroke-dasharray="7 6"/>
  <path d="M${sx(planWeeks)} ${sy(0) - 9}l9 9-9 9-9-9z" fill="#fff" stroke="#6b778a" stroke-width="1.6"/>
  <text x="${sx(3.2)}" y="${sy(ideal(3.2)) + 22}" font-size="15" fill="#5f6b7c" transform="rotate(${(Math.atan2(sy(0) - sy(initialScope), sx(planWeeks) - sx(0)) * 180 / Math.PI).toFixed(1)} ${sx(3.2)} ${sy(ideal(3.2)) + 22})">計画線（当初スコープ${initialScope}pt）</text>`;
const pts = remaining.map((v, w) => [sx(w), sy(v)]);
const actual = `<path d="M${pts.map(p => p.join(' ')).join(' L')}" fill="none" stroke="#0c7478" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/>
  ${pts.map(([x, y], w) => `<circle cx="${x}" cy="${y}" r="${w === last ? 6 : 4}" fill="${w === last ? '#0c7478' : '#fff'}" stroke="#0c7478" stroke-width="2.2"/>`).join('')}
  <text x="${pts[0][0] + 12}" y="${pts[0][1] - 10}" font-size="15" font-weight="700" fill="#0c7478">実績 ${remaining[0]}pt</text>
  <text x="${pts[last][0] + 12}" y="${pts[last][1] - 12}" font-size="17" font-weight="700" fill="#0c7478">${remaining[last]}pt</text>`;
const gapMark = `<line x1="${sx(last)}" x2="${sx(last)}" y1="${sy(remaining[last]) + 8}" y2="${sy(ideal(last))}" stroke="#b8372a" stroke-width="2.4"/>
  <circle cx="${sx(last)}" cy="${sy(ideal(last))}" r="3.5" fill="#b8372a"/>
  <text x="${sx(last) + 4}" y="${sy(ideal(last)) + 26}" font-size="15" font-weight="700" fill="#b8372a" text-anchor="end">計画より +${gap}pt</text>`;
const scope = scopeChanges.map(c => `<path d="M${sx(c.week)} ${sy(remaining[c.week]) - 12} v-44" stroke="#946000" stroke-width="1.6" marker-end="url(#${P}-up)"/>
  <text x="${sx(c.week) + 8}" y="${sy(remaining[c.week]) - 66}" font-size="15" fill="#946000">+${c.pts}pt ${c.label}</text>`).join('');
const forecast = `<g data-step="1" data-motion="wipe">
  <path d="M${sx(last)} ${sy(remaining[last])} L${sx(finishWeek)} ${sy(0)}" fill="none" stroke="#0c7478" stroke-width="2.6" stroke-dasharray="2 6" stroke-linecap="round"/>
  <circle cx="${sx(finishWeek)}" cy="${sy(0)}" r="7" fill="#0c7478" stroke="#fff" stroke-width="2"/>
  <path d="M${sx(finishWeek)} ${sy(0) - 9} V ${sy(260) + 54}" stroke="#0c7478" stroke-width="1.2"/>
  <rect x="${sx(finishWeek) - 150}" y="${sy(260)}" width="186" height="54" rx="8" fill="#e0f1f1"/>
  <text x="${sx(finishWeek) - 138}" y="${sy(260) + 22}" font-size="15" fill="#0c5558">現ペースの完了見込み</text>
  <text x="${sx(finishWeek) - 138}" y="${sy(260) + 43}" font-size="17" font-weight="700" fill="#0c5558">${md(finishDate)}（計画+${lateDays}日）</text>
  </g>`;
const todayLine = `<line x1="${sx(todayW)}" x2="${sx(todayW)}" y1="${y1 - 8}" y2="${y0}" stroke="#b8372a" stroke-width="1.5" stroke-dasharray="4 3"/>
  <text x="${sx(todayW)}" y="${y1 - 14}" font-size="15" font-weight="700" fill="#b8372a" text-anchor="middle">今日 ${md(today)}</text>`;

const svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="${P}-t ${P}-d" font-family="'Hiragino Sans','Noto Sans JP','Yu Gothic','Meiryo','IPAGothic',sans-serif">
<title id="${P}-t">開発フェーズのバーンダウン：計画線、実績、現ペースでの見込み</title>
<desc id="${P}-d">残作業は${md(weekDate(last))}時点で${remaining[last]}ポイント、計画線より${gap}ポイント多い。直近${lookback}週の平均消化は週${velocity.toFixed(0)}ポイントで、完了見込みは${md(finishDate)}、計画は${md(planDate)}。例示データ。</desc>
<defs><marker id="${P}-up" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#946000"/></marker></defs>
<text x="${x0 - 10}" y="${y1 - 14}" font-size="15" fill="#5f6b7c" text-anchor="end">残pt</text>
${yTicks}${xTicks}${todayLine}${planLine}${scope}${actual}${gapMark}${forecast}
</svg>`;

const logo = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="6" fill="#1d3a5f"/><path d="M4 14c2.7-2.6 5.3-2.6 8 0s5.3 2.6 8 0" fill="none" stroke="#5ec4c4" stroke-width="2" stroke-linecap="round"/><path d="M4 9c2.7-2.6 5.3-2.6 8 0s5.3 2.6 8 0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`;
const bar = () => `<header class="ps-bar">${logo}<p>${meta.project}<span>${meta.name}プロジェクト</span></p><p class="ps-meta"><b>${meta.meeting}</b>${meta.date}</p></header>`;

export default {
  study: true,
  id: 'tpl-project-status-burndown',
  title: 'バーンダウン：計画線・実績線・完了見込み',
  language: 'ja',
  notes: 'Purpose: 残作業の推移を計画と比べ、現在のペースでいつ終わるかを数字で示す。\nModify: start、planWeeks、initialScope、remaining（週次の残ポイント）、scopeChanges、today を書き換える。線・差分・見込み日・見出しの数値は自動で再計算される。\nInvariant: 縦軸は0から始める。計画線は当初計画のまま残し、スコープ追加は注記で示す。見込みの計算期間（lookback）を明記する。\nStatic: 見込み線はステップ1で表示。最終状態ですべて読める。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-project-status ps-burndown',
  content: `<div class="ps-page">${bar()}
<div class="ps-abs" style="left:56px;top:66px;right:56px">
  <p class="ps-sec">03　進捗（開発フェーズ）</p>
  <h1 class="ps-title" data-region="title">残り${remaining[last]}pt。今のペースでは開発完了は${mdk(finishDate)}、計画より${lateText}遅れます</h1>
</div>
<div class="ps-fig" data-region="primary" style="left:44px;top:166px">${svg}</div>
<div class="ps-rail" data-region="support" style="left:916px;right:56px;top:176px">
  <div><p>残作業（${md(weekDate(last))}時点）</p><strong class="ps-num">${remaining[last]}<small>pt</small></strong><p class="ps-rail-note">うち変更要求による追加 ${scopeChanges.reduce((a, c) => a + c.pts, 0)}pt</p></div>
  <div class="is-bad"><p>計画線との差</p><strong class="ps-num">+${gap}<small>pt</small></strong></div>
  <div><p>直近${lookback}週の平均消化</p><strong class="ps-num">${velocity.toFixed(0)}<small>pt／週</small></strong></div>
  <div><p>${md(planDate)}に間に合わせるには</p><strong class="ps-num">${need}<small>pt／週</small></strong><p class="ps-rail-note">現ペースの${(need / velocity).toFixed(1)}倍。増員では届かないため、完了日を${mdj(finishDate)}に置き直します。</p></div>
</div>
<p class="ps-source" data-region="source">例示データ・金曜時点の週次スナップショット・ストーリーポイントは委託先を含む開発チーム全体の見積もり</p>
</div>`
};
