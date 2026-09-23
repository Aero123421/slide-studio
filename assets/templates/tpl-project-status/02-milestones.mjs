// Template: プロジェクト定例・進捗報告 · マイルストーンのタイムライン（今日の位置）. Synthetic example content; replace data and copy.
// 日付はすべて phases 配列と today から計算します。基準線（薄い帯）と見込み（濃い帯）、遅れ（斜線）は同じ日付軸に載ります。
const P = 'tpl-project-status-milestones';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const meta = { project: 'MINATO', name: '受発注システム刷新', meeting: '第14回 定例', date: '2026年9月23日（水）' };

const D = s => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
const DAY = 86400000;
const md = t => { const d = new Date(t); return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`; };
const WD = ['日', '月', '火', '水', '木', '金', '土'];
const mdw = t => { const d = new Date(t); return `${d.getUTCMonth() + 1}月${d.getUTCDate()}日（${WD[d.getUTCDay()]}）`; };
// Business days from a to b (positive when b is later), weekends excluded.
const bizDiff = (a, b) => { let n = 0, s = Math.sign(b - a); for (let t = a; t !== b; t += s * DAY) { const w = new Date(t + s * DAY).getUTCDay(); if (w !== 0 && w !== 6) n += s; } return n; };

const range = { from: D('2026-06-01'), to: D('2027-02-28') };
const today = D('2026-09-23');
// status: done | active | planned. base = 基準計画, fc = 実績または見込み. ms = 終了時のマイルストーン名.
const phases = [
  { name: '基本設計', owner: '業務・開発', base: ['2026-06-01', '2026-07-31'], fc: ['2026-06-01', '2026-07-31'], status: 'done', ms: '基本設計の承認' },
  { name: '詳細設計・開発', owner: '開発・委託先', base: ['2026-08-03', '2026-10-02'], fc: ['2026-08-03', '2026-10-09'], status: 'active', ms: '開発完了' },
  { name: '結合テスト', owner: 'QA・開発', base: ['2026-09-29', '2026-11-06'], fc: ['2026-10-06', '2026-11-10'], status: 'planned', ms: '結合テスト完了' },
  { name: '総合テスト', owner: 'QA・業務', base: ['2026-11-09', '2026-12-11'], fc: ['2026-11-11', '2026-12-15'], status: 'planned', ms: '総合テスト完了', buffer: ['2026-12-14', '2026-12-18'] },
  { name: '移行リハーサル', owner: 'インフラ・業務', base: ['2026-12-21', '2026-12-25'], fc: ['2026-12-21', '2026-12-25'], status: 'planned', ms: 'リハーサル完了' },
  { name: '本番稼働・安定化', owner: '全体', base: ['2027-01-12', '2027-02-26'], fc: ['2027-01-12', '2027-02-26'], status: 'planned', ms: '本番稼働', msAtStart: true }
];

const W = 1168, X0 = 232, X1 = 1160, sx = t => X0 + (t - range.from) / (range.to - range.from) * (X1 - X0);
const axisH = 44, rowH = 48;
const rows = phases.map((p, i) => {
  const y = axisH + i * rowH, cy = y + rowH / 2;
  const [b0, b1] = p.base.map(D), [f0, f1] = p.fc.map(D);
  const late = bizDiff(b1, f1);
  const fill = p.status === 'done' ? '#1d3a5f' : p.status === 'active' ? '#0c7478' : '#ffffff';
  const stroke = p.status === 'planned' ? '#0c7478' : 'none';
  // Active phase: progress fill up to today.
  const prog = p.status === 'active' ? `<rect x="${sx(f0)}" y="${cy - 3}" width="${sx(today) - sx(f0)}" height="14" fill="#0c7478"/>` : '';
  const barFill = p.status === 'active' ? '#bfe0e0' : fill;
  const lateBar = f1 > b1 ? `<rect x="${sx(b1)}" y="${cy - 3}" width="${sx(f1) - sx(b1)}" height="14" fill="url(#${P}-late)" stroke="#c48a00" stroke-width="1"/>` : '';
  const buf = p.buffer ? (() => {
    const [u0, u1] = p.buffer.map(D), used = Math.max(0, bizDiff(D(p.base[1]), f1)), size = bizDiff(u0 - DAY, u1);
    return `<rect x="${sx(u0 - DAY * 0.5)}" y="${cy - 5}" width="${sx(u1 + DAY * 0.5) - sx(u0 - DAY * 0.5)}" height="18" rx="3" fill="none" stroke="#8a96a8" stroke-dasharray="3 3"/>
      <text x="${sx(u1 + DAY * 0.5) + 6}" y="${cy + 9}" font-size="15" fill="#465264">予備日 残り${size - used}日</text>`;
  })() : '';
  const msT = p.msAtStart ? f0 : f1, msBase = p.msAtStart ? b0 : b1;
  // Baseline date: small hollow diamond on the thin baseline bar. Forecast/actual: solid diamond on the main bar.
  const baseDiamond = x => `<path d="M${x} ${cy - 13}l6 6.5-6 6.5-6-6.5z" fill="#fff" stroke="#6b778a" stroke-width="1.5"/>`;
  const fcDiamond = x => `<path d="M${x} ${cy - 5}l9 9-9 9-9-9z" fill="${p.status === 'done' ? '#1b2433' : '#0c7478'}" stroke="#fff" stroke-width="1.5"/>`;
  const msLabel = p.status === 'done' ? `${md(msT)} 完了` : late > 0 ? `${md(msT)}（+${late}営業日）` : `${md(msT)}（予定どおり）`;
  const labelRight = sx(msT) + 14 + msLabel.length * 14 < W;
  const lab = p.msAtStart
    ? `<text x="${sx(msT) - 14}" y="${cy - 14}" font-size="15" font-weight="700" fill="#1b2433" text-anchor="end">${esc(p.ms)} ${msLabel}</text>`
    : `<text x="${labelRight ? sx(msT) + 14 : sx(msT) - 14}" y="${cy - 14}" font-size="15" font-weight="700" fill="${late > 0 ? '#8a5a00' : '#1b2433'}" text-anchor="${labelRight ? 'start' : 'end'}">${msLabel}</text>`;
  return `<g>
    <line x1="0" x2="${X1}" y1="${y + rowH}" y2="${y + rowH}" stroke="#e8ecf1"/>
    <text x="0" y="${cy - 1}" font-size="17" font-weight="700" fill="#1b2433">${esc(p.name)}</text>
    <text x="0" y="${cy + 18}" font-size="15" fill="#5f6b7c">${esc(p.owner)}</text>
    <rect x="${sx(b0)}" y="${cy - 9}" width="${sx(b1) - sx(b0)}" height="5" rx="2" fill="#c7cfda"/>
    <rect x="${sx(f0)}" y="${cy - 3}" width="${Math.max(3, Math.min(sx(f1), sx(b1)) - sx(f0))}" height="14" fill="${barFill}" stroke="${stroke}" stroke-width="1.4"/>
    ${prog}${lateBar}${buf}
    ${msT !== msBase ? baseDiamond(sx(msBase)) : ''}${fcDiamond(sx(msT))}${lab}
  </g>`;
}).join('');

const months = [];
for (let y = 2026, m = 5; ; m++) { if (m > 11) { m = 0; y++; } const t = Date.UTC(y, m, 1); if (t > range.to) break; months.push({ t, y, m }); }
const chartH = axisH + phases.length * rowH;
const axis = months.map(({ t, y, m }, i) => {
  const next = i + 1 < months.length ? months[i + 1].t : range.to + DAY;
  return `<line x1="${sx(t)}" x2="${sx(t)}" y1="${axisH - 14}" y2="${chartH}" stroke="#dde3ea"/>
  <text x="${(sx(t) + sx(next)) / 2}" y="${axisH - 22}" font-size="15" fill="#465264" text-anchor="middle">${m === 0 ? `${y}年 ` : ''}${m + 1}月</text>`;
}).join('');
const golive = D(phases[phases.length - 1].fc[0]);
const todayMark = `<rect x="${sx(today)}" y="${axisH - 14}" width="${sx(golive) - sx(today)}" height="${chartH - axisH + 14}" fill="#0c7478" opacity=".035"/>
  <line x1="${sx(today)}" x2="${sx(today)}" y1="${axisH - 16}" y2="${chartH + 6}" stroke="#b8372a" stroke-width="2"/>
  <rect x="${sx(today) - 44}" y="${chartH + 6}" width="88" height="26" rx="13" fill="#b8372a"/>
  <text x="${sx(today)}" y="${chartH + 24}" font-size="15" font-weight="700" fill="#fff" text-anchor="middle">今日 ${md(today)}</text>`;

const svg = `<svg viewBox="0 0 ${W} ${chartH + 34}" width="${W}" height="${chartH + 34}" role="img" aria-labelledby="${P}-t ${P}-d" font-family="'Hiragino Sans','Noto Sans JP','Yu Gothic','Meiryo','IPAGothic',sans-serif">
<title id="${P}-t">フェーズ別の基準計画と見込み、マイルストーン、今日の位置</title>
<desc id="${P}-d">${phases.map(p => `${p.name}：基準 ${md(D(p.base[0]))}〜${md(D(p.base[1]))}、見込み ${md(D(p.fc[0]))}〜${md(D(p.fc[1]))}`).join('。')}。今日は${md(today)}。例示データ。</desc>
<defs><pattern id="${P}-late" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#fff2d2"/><line x1="0" y1="0" x2="0" y2="6" stroke="#e0a100" stroke-width="2"/></pattern></defs>
${todayMark}${axis}${rows}
</svg>`;

const nextMs = phases.map(p => ({ name: p.ms, t: D(p.msAtStart ? p.fc[0] : p.fc[1]) })).filter(m => m.t > today).sort((a, b) => a.t - b.t)[0];
const days = t => Math.round((t - today) / DAY);
const bufPhase = phases.find(p => p.buffer), used = bizDiff(D(bufPhase.base[1]), D(bufPhase.fc[1])), bufSize = bizDiff(D(bufPhase.buffer[0]) - DAY, D(bufPhase.buffer[1]));
const devLate = bizDiff(D(phases[1].base[1]), D(phases[1].fc[1]));
const gauge = Array.from({ length: bufSize }, (_, i) => `<rect x="${i * 30}" y="0" width="24" height="16" rx="3" fill="${i < used ? 'url(#' + P + '-late)' : '#e0f1f1'}" stroke="${i < used ? '#c48a00' : '#0c7478'}" stroke-width="1.2"/>`).join('');

const key = `<div class="ps-abs" style="left:56px;bottom:18px;display:flex;gap:22px;align-items:center;font:400 15px/1 var(--ps-jp);color:var(--ps-ink-2)">
  <span style="display:inline-flex;align-items:center;gap:8px"><i style="display:inline-block;width:28px;height:5px;border-radius:2px;background:#c7cfda"></i>基準計画</span>
  <span style="display:inline-flex;align-items:center;gap:8px"><i style="display:inline-block;width:28px;height:12px;background:#1d3a5f"></i>完了</span>
  <span style="display:inline-flex;align-items:center;gap:8px"><i style="display:inline-block;width:28px;height:12px;background:linear-gradient(90deg,#0c7478 55%,#bfe0e0 55%)"></i>進行中（今日まで）</span>
  <span style="display:inline-flex;align-items:center;gap:8px"><i style="display:inline-block;width:28px;height:12px;border:1.4px solid #0c7478"></i>見込み</span>
  <span style="display:inline-flex;align-items:center;gap:8px"><i style="display:inline-block;width:28px;height:12px;background:repeating-linear-gradient(45deg,#fff2d2 0 3px,#e0a100 3px 5px);border:1px solid #c48a00"></i>基準からの遅れ</span>
  <span style="display:inline-flex;align-items:center;gap:8px"><svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M8 1l7 7-7 7-7-7z" fill="#fff" stroke="#6b778a" stroke-width="1.8"/></svg>基準日</span>
  <span style="display:inline-flex;align-items:center;gap:8px"><svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path d="M8 1l7 7-7 7-7-7z" fill="#0c7478"/></svg>見込み日</span>
  <span style="margin-left:auto;color:var(--ps-ink-3)">例示データ</span></div>`;

const logo = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="6" fill="#1d3a5f"/><path d="M4 14c2.7-2.6 5.3-2.6 8 0s5.3 2.6 8 0" fill="none" stroke="#5ec4c4" stroke-width="2" stroke-linecap="round"/><path d="M4 9c2.7-2.6 5.3-2.6 8 0s5.3 2.6 8 0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`;
const bar = () => `<header class="ps-bar">${logo}<p>${meta.project}<span>${meta.name}プロジェクト</span></p><p class="ps-meta"><b>${meta.meeting}</b>${meta.date}</p></header>`;

export default {
  study: true,
  id: 'tpl-project-status-milestones',
  title: 'マイルストーン：基準計画と見込み、今日の位置',
  language: 'ja',
  notes: 'Purpose: 基準計画に対してどこがどれだけずれ、最終期限に影響するかを1本の日付軸で示す。\nModify: phases の base／fc（YYYY-MM-DD）、status、buffer と today を書き換える。棒・菱形・遅れ・予備日・下段の数値は日付から計算される。\nInvariant: 基準計画は消さずに残す。遅れは営業日で数え、予備日の残数と矛盾させない。今日の線は報告基準日に合わせる。\nStatic: ビルドなし。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-project-status ps-milestones',
  content: `<div class="ps-page">${bar()}
<div class="ps-abs" style="left:56px;top:66px;right:56px">
  <p class="ps-sec">02　マイルストーン</p>
  <h1 class="ps-title" data-region="title">開発の遅れ${devLate}営業日は、並行テストと予備日${used}日で吸収します</h1>
</div>
<div class="ps-fig" data-region="primary" style="left:56px;top:150px;width:${W}px">${svg}</div>
<div class="ps-abs" data-region="support" style="left:56px;right:56px;top:540px;display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:40px">
  <div style="border-top:1.5px solid var(--ps-ink);padding-top:12px"><p style="font:400 15px/1.3 var(--ps-jp);color:var(--ps-ink-3)">次のマイルストーン</p>
    <p style="margin-top:8px;font:700 22px/1.3 var(--ps-jp)">${esc(nextMs.name)}　${mdw(nextMs.t)}</p>
    <p style="margin-top:4px;font:400 16px/1.4 var(--ps-jp);color:var(--ps-ink-2)">あと<b class="ps-num" style="font-size:20px;color:var(--ps-ink)"> ${days(nextMs.t)} </b>日・基準日から${devLate}営業日遅れ</p></div>
  <div style="border-top:1.5px solid var(--ps-ink);padding-top:12px"><p style="font:400 15px/1.3 var(--ps-jp);color:var(--ps-ink-3)">総合テスト後の予備日</p>
    <svg viewBox="0 0 ${bufSize * 30} 16" width="${bufSize * 30}" height="16" style="margin-top:12px" role="img" aria-labelledby="${P}-g"><title id="${P}-g">予備日${bufSize}日のうち${used}日を使用</title><defs><pattern id="${P}-late2" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#fff2d2"/><line x1="0" y1="0" x2="0" y2="6" stroke="#e0a100" stroke-width="2"/></pattern></defs>${gauge.replaceAll(P + '-late', P + '-late2')}</svg>
    <p style="margin-top:10px;font:400 16px/1.4 var(--ps-jp);color:var(--ps-ink-2)">${bufSize}日のうち${used}日を使用、<b style="color:var(--ps-ink)">残り${bufSize - used}日</b></p></div>
  <div style="border-top:1.5px solid var(--ps-ink);padding-top:12px"><p style="font:400 15px/1.3 var(--ps-jp);color:var(--ps-ink-3)">本番稼働まで</p>
    <p style="margin-top:8px;font:700 22px/1.3 var(--ps-jp)">${mdw(golive)}</p>
    <p style="margin-top:4px;font:400 16px/1.4 var(--ps-jp);color:var(--ps-ink-2)">あと<b class="ps-num" style="font-size:20px;color:var(--ps-ink)"> ${days(golive)} </b>日・基準日から変更なし</p></div>
</div>
${key}
</div>`
};
