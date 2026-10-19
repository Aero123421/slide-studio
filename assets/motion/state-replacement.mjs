// Motion study · Replace a state, not an identity — a published article is corrected in place.
// The figure in question sits in a fixed slot that holds both values, so the text never
// reflows; only its state changes (published → under review → corrected). HTML, not SVG.
import { statesAttr } from '../runtime/figure.mjs';

const fix = { field: '事業費', wrong: '約480億円', right: '約48億円', was: '約31億円' }; // 架空の記事
const events = [ // その日の経過
  { at: '06:00', what: '記事を掲載', step: 0 },
  { at: '09:40', what: '読者から指摘', note: '県の公表資料では48億円', step: 1 },
  { at: '15:10', what: '県の担当課に確認', step: 1 },
  { at: '17:20', what: '訂正を掲載', note: '同じ記事の同じ位置で差し替え', step: 2 },
];
const minutes = hhmm => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const reported = events.find(e => e.what.includes('指摘')), corrected = events.find(e => e.what.includes('訂正'));
const lag = minutes(corrected.at) - minutes(reported.at);
const lagText = `${Math.floor(lag / 60)}時間${lag % 60 ? `${lag % 60}分` : ''}`;

const st = map => `data-states="${statesAttr(map)}" data-duration="500"`;
// Three states share one grid cell, so the slot is as wide as its widest value and never moves.
const stack = (cells, style = '') => `<span style="display:inline-grid;vertical-align:baseline;${style}">${cells.map(([html, map, css = '']) => `<span style="grid-area:1/1;${css}" ${st(map)}>${html}</span>`).join('')}</span>`;
const slot = stack([
  [fix.wrong, { 0: { opacity: 1 }, 2: { opacity: 0 } }],
  [`<span style="color:var(--ss-accent);font-weight:700">${fix.right}</span>`, { 0: { opacity: 0 }, 2: { opacity: 1 } }, 'justify-self:center'],
  ['<span style="display:block;align-self:end;height:3px;margin-bottom:-4px;background:var(--ss-accent)"></span>', { 0: { opacity: 0 }, 1: { opacity: 1 }, 2: { opacity: 0 } }, 'align-self:end'],
]);
const status = stack([
  ['公開中', { 0: { opacity: 1 }, 1: { opacity: 0 } }],
  ['確認中', { 0: { opacity: 0 }, 1: { opacity: 1 }, 2: { opacity: 0 } }],
  [`訂正 ${corrected.at}`, { 0: { opacity: 0 }, 2: { opacity: 1 } }, 'font-weight:700;color:var(--ss-ink)'],
]);

const article = `<article style="width:768px;color:var(--ss-ink);font-family:var(--ss-font-serif, serif)">
  <h2 style="font:700 31px/1.35 var(--ss-font-serif, serif);margin:0">県道バイパス、事業費が膨らむ</h2>
  <p style="font:500 20px/1.5 var(--ss-font-serif, serif);margin:6px 0 0;color:var(--ss-muted)">資材高と軟弱地盤対策で、県が計画を見直し</p>
  <p style="font:400 16px/1.4 var(--ss-font-sans);margin:14px 0 0;color:var(--ss-muted);display:flex;gap:18px"><span>2026年10月14日 ${events[0].at}</span>${status}</p>
  <hr style="border:0;border-top:1px solid var(--ss-rule);margin:18px 0 20px">
  <p style="font:400 20px/1.9 var(--ss-font-serif, serif);margin:0">　県は13日、県道南北バイパス（全長8.2キロ）の${fix.field}が、当初見込みの${fix.was}から${slot}に膨らむと明らかにした。資材価格の高騰に加え、軟弱地盤への対策工事が必要になったため。</p>
  <p style="font:400 20px/1.9 var(--ss-font-serif, serif);margin:4px 0 0">　県は来年度予算に設計見直しの費用を計上する方針で、完成は当初計画より2年遅れの2031年度を見込む。</p>
  <p data-step="2" data-motion="reveal" data-delay="500" style="font:400 18px/1.7 var(--ss-font-sans);margin:22px 0 0;padding-top:14px;border-top:1px solid var(--ss-rule)"><b>訂正</b>　14日付の本記事で、${fix.field}を「${fix.wrong}」としたのは「${fix.right}」の誤りでした。</p>
</article>`;

const rail = events.map(e => `<div data-step="${e.step}" data-motion="reveal" style="display:grid;grid-template-columns:72px 1fr;gap:4px 12px;font:400 18px/1.45 var(--ss-font-sans)">
  <b style="font-variant-numeric:tabular-nums">${e.at}</b><span style="font-weight:700">${e.what}</span>
  ${e.note ? `<span></span><span style="font-size:16px;color:var(--ss-muted)">${e.note}</span>` : ''}</div>`).join('\n');

export default {
  study: true,
  id: 'motion-state-replacement',
  language: 'ja',
  title: 'Replace a state, not an identity',
  className: 'st st--rail cs-editorial-vermilion',
  notes: 'Purpose: Preserve position while a status changes: the article stays where it is, the disputed figure is flagged, then replaced in the same slot, and the correction is stated.\nModify: Edit `fix` (field, wrong and right values) and `events` (time, what, note, build). The status line, the slot and the elapsed time recompute.\nInvariant: The article never moves or reflows: every state of the slot and of the status shares one grid cell sized to the widest value. The wrong value is not silently erased; the correction note quotes it.\nStatic: The final build shows the corrected figure, the status and the correction note together with the timeline.',
  sources: [{ type: 'original-example', file: 'assets/motion/state-replacement.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">指摘から${lagText}で<em>${fix.right}</em>に訂正<br><span class="st-quiet">記事の位置も見出しも変えず、数字だけを差し替えた</span></h1>
<figure class="st-fig" data-region="primary">${article}</figure>
<div class="st-rail" data-region="support">${rail}</div>
<p class="st-source" data-region="source"><span>架空の記事 · 時刻は掲載日の当日</span><span>モーション · 同じ位置での状態の置き換え（2ビルド）</span></p>`,
};
