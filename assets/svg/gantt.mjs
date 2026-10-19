// Diagram study · Gantt — spans on a true time axis, so overlap and the longest chain are visible.
// Tasks are [start, end) intervals in minutes after the line stops (start included, end excluded).
// The critical chain, the hidden overlap and the headline are computed from `tasks`.
import { ganttChart, fmt } from '../runtime/figure.mjs';

const tasks = [ // minutes after the filling line stops (illustrative), crew in `crew`
  { label: '停止・残液回収', start: 0, end: 12, crew: '全員' },
  { label: 'CIP洗浄', start: 12, end: 52, crew: '洗浄班', chain: true },
  { label: 'チェンジパーツ交換', start: 12, end: 38, crew: '機械班' },
  { label: 'ラベラーの調整', start: 22, end: 46, crew: '機械班' },
  { label: 'ふき取り検査', start: 52, end: 64, crew: '品質班', chain: true },
  { label: '試運転・初品検査', start: 64, end: 82, crew: '品質班' },
];
const restart = { label: '量産再開', start: Math.max(...tasks.map(k => k.end)), milestone: true };
restart.note = `${restart.start}分`;

const total = restart.start;
const chain = tasks.filter(k => k.chain);
const chainMin = chain.reduce((s, k) => s + (k.end - k.start), 0);
// Machine-crew work that runs entirely inside the cleaning window costs no line time.
const cip = chain[0];
const hidden = tasks.filter(k => k.crew === '機械班' && k.start >= cip.start && k.end <= cip.end);
const hiddenMin = hidden.reduce((s, k) => s + (k.end - k.start), 0);

export function figure(theme = 'css') {
  return ganttChart({
    id: 'gantt-fig', theme, width: 1152, height: 470, fontSize: 18, rowHeight: 52, locale: 'ja',
    title: '充填ラインの段取り替え：作業ごとの開始と終了（停止からの経過分）',
    desc: `ライン停止から量産再開まで${total}分。洗浄と検査の連鎖（${chain.map(k => k.label).join('→')}）が${chainMin}分を占める。機械班の${hidden.map(k => k.label).join('と')}（計${hiddenMin}分）はCIP洗浄の時間内に収まり、停止時間を延ばしていない。横軸は実時間で、棒の左端は開始時刻を含み、右端は終了時刻を含まない。`,
    tasks: [...tasks.map(k => ({ ...k, note: k.crew })), restart],
    highlight: chain.map(k => k.label),
    domain: [0, 90],
    ticks: Array.from({ length: 10 }, (_, i) => ({ at: i * 10, label: `${i * 10}分` })),
    zebra: false,
    annotate: [{ at: hidden.at(-1).label, text: `機械班の${hidden.length}作業（計${hiddenMin}分）は、CIP洗浄の${cip.end - cip.start}分の内側で終わる`, dx: -40, dy: 150, width: 330, marker: 'dot' }],
  });
}

export default {
  study: true,
  id: 'gantt',
  language: 'ja',
  title: 'Gantt chart: spans and overlap on a true time axis',
  className: 'st cs-manufacturing-plant',
  notes: 'Purpose: Compare task spans and their overlap on one real time axis, and show which chain sets the total.\nModify: Edit `tasks` (start/end in minutes, crew, chain flag). The total, the highlighted chain, the hidden parallel work and the headline recompute; ticks follow the domain.\nInvariant: One real time axis; intervals are [start, end) — start included, end excluded — everywhere, including in the headline arithmetic; bar length is duration, never effort.\nStatic: Already static. For a build, pass build:{by:"mark"} to reveal tasks in start order.',
  sources: [{ type: 'original-example', file: 'assets/svg/gantt.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">停止${total}分のうち${chainMin}分は${chain.map(k => `<em>${k.label}</em>`).join('と')}。<br><span class="st-quiet">部品交換と調整は洗浄の裏で終わっている</span></h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>架空のデータ · 充填ライン3号機、ライン停止からの経過分（開始を含み終了を含まない）、棒の右は担当班</span><span>ガントチャート</span></p>`,
};
