// Template: Engineering design review / postmortem · Risk matrix with mitigations. Synthetic example content; replace data and copy.
const ID = 'tpl-architecture-risks';
const C = { bg: '#0b1119', axis: '#3a4c63', mute: '#8a9bb0', text: '#e8eef6', text2: '#b4c1d1', line: '#26364b' };
// One source of truth. L = likelihood 1–5, I = impact 1–5; now = before actions, after = planned residual.
const risks = [
  { id: 'R1', risk: 'Cache-key format changes ship without a compatibility check', fix: 'Versioned keys; canary gate fails on hit-ratio drop > 10 pts', owner: 'Pricing', due: '30 Sep', status: 'prog', now: [4, 4], after: [2, 4] },
  { id: 'R2', risk: 'Miss storm saturates the replica shared with reporting', fix: 'Dedicated pricing read pool; coalesce concurrent misses per key', owner: 'Data platform', due: '15 Oct', status: 'plan', now: [3, 5], after: [3, 2] },
  { id: 'R3', risk: 'Alert fires 12 min after impact (1 h burn window only)', fix: 'Add 5-min fast-burn alert and a hit-ratio alert', owner: 'SRE', due: '12 Sep', status: 'done', now: [4, 3], after: [4, 2] },
  { id: 'R4', risk: 'Rollback needs a manual config revert', fix: 'One-step rollback of code and config in the pipeline', owner: 'Delivery', due: '31 Oct', status: 'plan', now: [2, 3], after: [2, 2] },
  { id: 'R5', risk: 'Payment retries amplify load during timeouts', fix: 'Retry budget with jitter in payment-adapter', owner: 'Payments', due: '15 Oct', status: 'prog', now: [5, 2], after: [5, 1] }
];
const bands = [ // score = L × I
  { name: 'Low', max: 4, fill: '#132131', chip: '#8fb3d9' },
  { name: 'Moderate', max: 9, fill: '#1f2a24', chip: '#7fc79a' },
  { name: 'High', max: 14, fill: '#352c16', chip: '#f0b44c' },
  { name: 'Critical', max: 25, fill: '#3d1b1f', chip: '#ef7b7b' }
];
const band = s => bands.find(b => s <= b.max);
const score = ([l, i]) => l * i;
const statusText = { done: 'Done', prog: 'In progress', plan: 'Planned' };
// matrix geometry
const CELL = 76, M = { x0: 56, y0: 10 }, S = 470;
const cx = l => M.x0 + (l - 0.5) * CELL, cy = i => M.y0 + (5 - i + 0.5) * CELL;
let cells = '';
for (let l = 1; l <= 5; l++) for (let i = 1; i <= 5; i++) cells += `<rect x="${M.x0 + (l - 1) * CELL + 1}" y="${M.y0 + (5 - i) * CELL + 1}" width="${CELL - 2}" height="${CELL - 2}" rx="3" fill="${band(l * i).fill}"/>`;
let ticks = '';
for (let k = 1; k <= 5; k++) ticks += `<text x="${cx(k)}" y="${M.y0 + 5 * CELL + 20}" text-anchor="middle" class="t-axis">${k}</text><text x="${M.x0 - 12}" y="${cy(k) + 5}" text-anchor="end" class="t-axis">${k}</text>`;
ticks += `<text x="${M.x0}" y="${M.y0 + 5 * CELL + 44}" class="t-mono-s">rare</text><text x="${M.x0 + 5 * CELL}" y="${M.y0 + 5 * CELL + 44}" text-anchor="end" class="t-mono-s">almost certain</text>`
  + `<text x="${M.x0 + 2.5 * CELL}" y="${M.y0 + 5 * CELL + 44}" text-anchor="middle" class="t-mono">likelihood →</text>`
  + `<text transform="translate(16,${M.y0 + 2.5 * CELL}) rotate(-90)" text-anchor="middle" class="t-mono">impact →</text>`;
// offsets so risks sharing a cell do not overlap
const slot = {};
const pos = (p, key) => { const k = `${key}${p[0]},${p[1]}`; const n = slot[k] = (slot[k] || 0) + 1; const o = [[0, 0], [20, -16], [-20, 16], [20, 16]][n - 1] || [0, 0]; return [cx(p[0]) + o[0], cy(p[1]) + o[1]]; };
const marks = risks.map(r => {
  const [x0, y0] = pos(r.now, 'n'), [x1, y1] = pos(r.after, 'a');
  const len = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / len, uy = (y1 - y0) / len;
  const col = band(score(r.now)).chip;
  return `<line x1="${x0 + ux * 16}" y1="${y0 + uy * 16}" x2="${x1 - ux * 17}" y2="${y1 - uy * 17}" stroke="${C.text2}" stroke-width="1.4" stroke-dasharray="4 3" marker-end="url(#${ID}-ah)"/>`
    + `<circle cx="${x1}" cy="${y1}" r="13" fill="${C.bg}" stroke="${C.text2}" stroke-width="1.6"/><text x="${x1}" y="${y1 + 4.5}" text-anchor="middle" class="t-mono-s" style="fill:${C.text2}">${r.id}</text>`
    + `<circle cx="${x0}" cy="${y0}" r="15" fill="${col}" stroke="${C.bg}" stroke-width="2"/><text x="${x0}" y="${y0 + 5}" text-anchor="middle" class="t-dark">${r.id}</text>`;
}).join('');
const matrix = `<svg viewBox="0 0 ${S} ${S}" role="img" aria-labelledby="${ID}-t ${ID}-d">
<title id="${ID}-t">Risk matrix: likelihood by impact, now and after mitigation</title>
<desc id="${ID}-d">${risks.map(r => `${r.id} moves from likelihood ${r.now[0]}, impact ${r.now[1]} (score ${score(r.now)}, ${band(score(r.now)).name}) to likelihood ${r.after[0]}, impact ${r.after[1]} (score ${score(r.after)}, ${band(score(r.after)).name})`).join('. ')}.</desc>
<defs><marker id="${ID}-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" fill="${C.text2}"/></marker></defs>
${cells}${ticks}${marks}
</svg>`;
const rows = risks.map(r => {
  const bn = band(score(r.now)), ba = band(score(r.after));
  return `<tr><td><span class="ar-id" style="background:${bn.chip}">${r.id}</span></td><td><div class="ar-risk">${r.risk}</div><div class="ar-mit">→ ${r.fix}</div></td><td class="ar-own">${r.owner}<br>${r.due}</td><td class="ar-score">${score(r.now)}<i>→</i>${score(r.after)}<br><span style="color:${ba.chip};font-weight:500">${ba.name.toLowerCase()}</span></td><td><span class="ar-state ${r.status}">${statusText[r.status]}</span></td></tr>`;
}).join('');
const critNow = risks.filter(r => band(score(r.now)).name === 'Critical').length;
const worstAfter = bands[Math.max(...risks.map(r => bands.indexOf(band(score(r.after)))))].name.toLowerCase();
const legend = bands.map(b => `<span><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect width="14" height="14" rx="3" fill="${b.fill}" stroke="${b.chip}"/></svg>${b.name} ${bands.indexOf(b) ? bands[bands.indexOf(b) - 1].max + 1 : 1}–${b.max}</span>`).join('');

export default {
  study: true,
  id: ID,
  title: 'Risk matrix with owned mitigations',
  notes: 'Purpose: Close the review with the risks this incident exposed, what each action is expected to change, and who owns it by when.\nModify: Edit risks (now/after as [likelihood, impact], owner, due, status) and the band thresholds. Cell colours, markers, arrows, scores and the headline counts are computed.\nInvariant: The arrow means planned effect of the mitigation, not a measured result. Score = likelihood × impact on 1–5 scales, and the scale definitions stay visible. Every action has one owning team and a date.\nStatic: Static page.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-architecture ar-risks',
  content: `<div class="ar-page">
<div class="ar-bar"><span class="ar-crumb"><b>INC-2317</b><i>/</i>06 · Risks &amp; actions</span><span>Review date 19 Aug 2026</span></div>
<h1 class="ar-title" data-region="title">${risks.length} actions move ${critNow === 2 ? 'both' : critNow} critical risks down; none stays above <em>${worstAfter}</em></h1>
<figure class="ar-fig" style="left:40px;top:142px;width:${S}px;height:${S}px" data-region="primary">${matrix}</figure>
<table class="ar-table" data-region="primary"><thead><tr><th style="width:48px"></th><th>Risk → mitigation</th><th style="width:108px">Owner · due</th><th style="width:92px">Score</th><th style="width:104px">Status</th></tr></thead><tbody>${rows}</tbody></table>
<div class="ar-legend ar-legend-wrap" style="left:48px;top:596px;width:480px" data-region="support">${legend}<span><svg width="30" height="14" viewBox="0 0 30 14" aria-hidden="true"><circle cx="7" cy="7" r="6" fill="#ef7b7b"/><circle cx="23" cy="7" r="5.5" fill="none" stroke="${C.text2}" stroke-width="1.4"/></svg>now → planned</span></div>
<footer class="ar-foot" data-region="source"><span>Illustrative risks · score = likelihood × impact, each 1–5</span><span class="ar-pg">06 / 06</span></footer>
</div>`
};
