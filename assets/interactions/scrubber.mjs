// Interaction study · Time scrubber — a tide gauge read hour by hour during a typhoon's approach (Japanese page).
// The widget (kind 'scrubber') reads both series at the cursor; the headline is computed from the same arrays.
const start = { day: 14, hour: 0 };            // 9月14日 0時 から 48時間
const hours = 48;
const warning = 230;                           // 高潮警報の基準潮位, cm（観測基準面から）
// 推算潮位: four tidal constituents (M2, S2, K1, O1), cm above the gauge datum.
const constituents = [[56, 12.42, 2.4], [17, 12.0, 1.6], [12, 23.93, 26], [7, 25.82, 20]];   // amplitude cm, period h, phase h
const predicted = Array.from({ length: hours }, (_, t) => Math.round(104 + constituents.reduce((s, [a, p, ph]) => s + a * Math.cos((2 * Math.PI * (t - ph)) / p), 0)));
// 観測潮位 = 推算 + 高潮偏差 (a surge that peaks as the typhoon passes).
const surge = t => 4 + 58 * Math.exp(-((t - 26.4) ** 2) / (2 * 4.4 ** 2));
const observed = predicted.map((v, t) => Math.round(v + surge(t)));

const label = t => `${start.day + Math.floor((start.hour + t) / 24)}日 ${(start.hour + t) % 24}時`;
const peak = observed.indexOf(Math.max(...observed));
const over = observed.filter(v => v >= warning).length;
const ID = 'interaction-scrubber';

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Time scrubber: observed and predicted tide during a typhoon',
  notes: `Purpose: 1時間ごとの潮位を時刻カーソルで読み、満潮と高潮が重なった時刻と、そのときの推算潮位との差（偏差）を聴衆と一緒に確かめる。
Modify: \`predicted\` と \`observed\`（同じ長さの配列、cm）、\`warning\`、\`start\` を差し替える。見出しのピーク時刻・潮位・偏差・超過量は配列から計算される。
Invariant: 二つの系列は同じ時間軸と同じ縦軸で描く。カーソルはどちらの系列も同じ時刻で読む。警報基準の線は動かさない。
Static: 書き出しは見出しと同じピーク時刻（${label(peak)}）を表示する。前後の時刻が議論に必要なら別ページに展開する。`,
  sources: [{ type: 'original-example', file: 'assets/interactions/scrubber.mjs' }],
  exportPolicy: 'final',
  className: 'st cs-wa-ai',
  content: `<h1 class="st-head">${label(peak).replace(' ', '')}、満潮に高潮が重なり潮位は${observed[peak]} cm。推算を${observed[peak] - predicted[peak]} cm上回り、警報基準を${observed[peak] - warning} cm超えた</h1>
<p class="st-dek">東浜港（架空）の潮位、9月${start.day}日0時から${hours}時間。観測基準面からの高さ（cm）。基準を超えたのは${over}時間。</p>
<div class="widget" data-interactive="" id="${ID}-widget" data-region="primary"><div class="w-plot"></div><div class="w-controls"></div><output aria-live="polite" class="w-status"></output></div>
<p class="st-source" data-region="source"><span>架空のデータ · 推算潮位は主要4分潮から計算、観測は推算に高潮偏差を加えたもの</span><span>操作 · 時刻スクラバー</span></p>`,
  widgets: [{
    id: `${ID}-widget`,
    kind: 'scrubber',
    initial: { time: peak },
    data: {
      x: Array.from({ length: hours }, (_, t) => t),
      labels: Array.from({ length: hours }, (_, t) => label(t)),
      lines: [{ name: '観測', values: observed, tone: 'accent' }, { name: '推算', values: predicted, tone: 'muted', dash: true }],
      refs: [{ y: warning, label: `高潮警報の基準 ${warning} cm`, tone: 'negative', align: 'left' }],
    },
    controls: { time: { label: '時刻（1時間ごと）' } },
    axes: {
      x: { ticks: Array.from({ length: hours / 6 }, (_, k) => ({ value: k * 6, label: k * 6 % 24 ? `${(k * 6) % 24}時` : `${start.day + k / 4}日 0時` })) },
      y: { title: '潮位（cm）', min: 0, max: 300, ticks: [0, 50, 100, 150, 200, 250, 300], digits: 0, unit: 'cm' },
    },
    text: {
      status: '{label}　観測 {y}\u00a0cm、推算 {y2}\u00a0cm。偏差は {delta}\u00a0cm。',
      statusAbove: '{label}　観測 {y}\u00a0cm。警報基準を {overRef}\u00a0cm 上回り、推算との差は {delta}\u00a0cm。',
      figure: '東浜港の観測潮位と推算潮位、48時間',
    },
  }],
};
