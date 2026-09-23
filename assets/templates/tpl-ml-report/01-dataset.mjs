// Template: ML model evaluation report · Cover and dataset card (splits, class balance). Synthetic example content; replace data and copy.
const ID = 'tpl-ml-report-dataset';
const CLASSES = ['Healthy', 'Degraded', 'Failing']; // fixed class order used on every page
const COLORS = ['#86b6ef', '#2a78d6', '#104281'];
const DEFS = ['no work order within 30 days', 'maintenance order within 30 days, no stop', 'unplanned stop within 7 days'];
// One source of truth: windows per class in each time-based split
const splits = [
  { name: 'Train', period: 'Jan–Aug 2025', pumps: 138, counts: [25896, 4056, 1248] },
  { name: 'Validation', period: 'Sep 2025', pumps: 131, counts: [3526, 559, 215] },
  { name: 'Test', period: 'Oct–Nov 2025', pumps: 133, counts: [3720, 792, 288], held: true }
];
const fmt = n => n.toLocaleString('en-US');
const pct = (n, t) => (100 * n / t).toFixed(1);
// geometry of the split rows
const B = { x0: 250, x1: 640, top: 64, row: 74, h: 26 };
let rowsSvg = '';
splits.forEach((s, i) => {
  const tot = s.counts.reduce((a, b) => a + b, 0), y = B.top + i * B.row;
  let x = B.x0;
  const segs = s.counts.map((c, k) => {
    const w = (c / tot) * (B.x1 - B.x0), gap = k < 2 ? 2 : 0;
    const seg = `<rect x="${x}" y="${y}" width="${Math.max(0, w - gap)}" height="${B.h}" fill="${COLORS[k]}"${k === 0 ? ' rx="0"' : ''}/>`;
    const lab = k === 0 && w > 72 ? `<text x="${x + 8}" y="${y + 18}" class="${k === 0 ? 'v-num' : 'v-white'}"${k === 0 ? ' style="fill:#0f172a"' : ''}>${pct(c, tot)}%</text>` : '';
    const out = { seg, lab, x, w, c };
    x += w; return out;
  });
  const f = segs[2];
  rowsSvg += `<g>${segs.map(o => o.seg + o.lab).join('')}
<text x="0" y="${y + 12}" class="v-head">${s.name}${s.held ? ' <tspan class="v-sig" dx="6">held out</tspan>' : ''}</text>
<text x="0" y="${y + 32}" class="v-axis">${s.period} · ${s.pumps} pumps</text>
<text x="${B.x0 - 16}" y="${y + 18}" text-anchor="end" class="v-num-b">${fmt(tot)}</text>
<line x1="${f.x + f.w / 2}" y1="${y + B.h}" x2="${f.x + f.w / 2}" y2="${y + B.h + 10}" stroke="#104281"/>
<text x="${B.x1 - 56}" y="${y + B.h + 24}" text-anchor="end" class="v-lab2">Degraded ${pct(s.counts[1], tot)}%  ·  Failing, ${fmt(f.c)} windows</text><text x="${B.x1}" y="${y + B.h + 24}" text-anchor="end" class="v-num-b">${pct(f.c, tot)}%</text></g>`;
});
const legend = CLASSES.map((c, k) => `<rect x="0" y="${k * 24}" width="14" height="14" fill="${COLORS[k]}"/><text x="22" y="${k * 24 + 12}" class="v-lab">${c}</text><text x="110" y="${k * 24 + 12}" class="v-lab2">${DEFS[k]}</text>`).join('');
const trainF = splits[0].counts[2] / splits[0].counts.reduce((a, b) => a + b, 0), testF = splits[2].counts[2] / splits[2].counts.reduce((a, b) => a + b, 0);
const card = `<svg viewBox="0 0 656 340" role="img" aria-labelledby="${ID}-t ${ID}-d">
<title id="${ID}-t">Windows per split and class balance</title>
<desc id="${ID}-d">${splits.map(s => { const t = s.counts.reduce((a, b) => a + b, 0); return `${s.name} (${s.period}): ${fmt(t)} windows, ${CLASSES.map((c, k) => `${c} ${pct(s.counts[k], t)}%`).join(', ')}`; }).join('. ')}. Failing is ${(testF * 100).toFixed(1)}% of test windows versus ${(trainF * 100).toFixed(1)}% in training.</desc>
<text x="0" y="16" class="v-axis">SPLIT</text><text x="${B.x0 - 16}" y="16" text-anchor="end" class="v-axis">WINDOWS</text><text x="${B.x0}" y="16" class="v-axis">CLASS BALANCE · share of windows in the split</text>
<line x1="0" y1="32" x2="${B.x1}" y2="32" stroke="#0f172a"/>
${rowsSvg}
<g transform="translate(0,${B.top + 3 * B.row + 10})">${legend}</g>
</svg>`;

export default {
  study: true,
  id: ID,
  title: 'Evaluation report cover and dataset card',
  notes: 'Purpose: Open an evaluation report by naming the model, the decision requested and the data it was tested on, before any metric appears.\nModify: Edit splits (period, pumps, per-class counts) and the class definitions. Percentages, bar segments and the shift note are computed from counts. Replace the facts with your own provenance.\nInvariant: Class order Healthy → Degraded → Failing and its colour ramp are fixed across the report. Splits are time-based and the test period is after all training data. Say how labels were created and what is known to be missing.\nStatic: Static page.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-ml-report ml-dataset',
  content: `<div class="ml-page">
<div class="ml-top"><span class="ml-badge"><b>PumpGuard v2.3</b>evaluation report</span><span class="ml-sec"><em>01</em>Dataset</span></div>
<div class="ml-hero">
  <div class="ml-kick">Model evaluation · 2 Dec 2025</div>
  <h1 data-region="title">PumpGuard v2.3 on 4,800 held-out pump windows</h1>
  <p data-region="support">Predicts from 24 hours of telemetry whether a pump is healthy, degraded or failing within 7 days.</p>
</div>
<dl class="ml-spec" data-region="support">
  <dt>Task</dt><dd>3-class classification, one prediction per window</dd>
  <dt>Model</dt><dd>Gradient-boosted trees, 38 features</dd>
  <dt>Decision</dt><dd>Approve an 8-week shadow run at 3 sites</dd>
  <dt>Owner</dt><dd>Reliability ML team</dd>
</dl>
<section class="ml-card" data-region="primary">
  <div class="ml-card-h"><h2>Dataset card · pump telemetry v4</h2><span>snapshot 2025-12-01</span></div>
  <figure class="ml-fig" style="left:24px;top:64px;width:656px;height:340px">${card}</figure>
  <div class="ml-facts">
    <div><b>Unit</b>24 h window, 6 h stride; 142 pumps at 3 sites</div>
    <div><b>Labels</b>from maintenance work orders, joined by pump and date</div>
    <div><b>Known gaps</b>2.1% of sensor hours imputed; failing share is ${(testF * 100).toFixed(1)}% in test vs ${(trainF * 100).toFixed(1)}% in train</div>
  </div>
</section>
<footer class="ml-foot" data-region="source"><span>Illustrative data · fictional model and fleet</span><span>split by time only: a pump can appear in several splits</span></footer>
</div>`
};
