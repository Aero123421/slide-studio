// Template: Engineering design review / postmortem · Incident timeline. Synthetic example content; replace data and copy.
const ID = 'tpl-architecture-timeline';
const C = { axis: '#3a4c63', grid: '#1f2d40', mute: '#8a9bb0', text2: '#b4c1d1', sync: '#3987e5', warn: '#fab219', crit: '#e66767', good: '#2fb65a', bg: '#0b1119', panel: '#111b28' };
const DAY = '12 Aug 2026';
// One source of truth. lane: system (what the service did) | response (what people and tools did)
const events = [
  { t: '13:58', lane: 'system', kind: 'change', lines: ['pricing-svc v4.18 deployed', '(cache key adds cart_id)'] },
  { t: '14:05', lane: 'system', kind: 'bad', lines: ['p99 crosses 400 ms SLO', 'customer impact starts'], mark: 'impact' },
  { t: '15:30', lane: 'system', kind: 'bad', lines: ['peak p99 1,940 ms', 'failed checkouts 2.3%'] },
  { t: '16:14', lane: 'system', kind: 'change', lines: ['rollback to v4.17', 'complete'] },
  { t: '16:52', lane: 'system', kind: 'good', lines: ['hit ratio back above 95%', 'p99 under SLO'], mark: 'recovered' },
  { t: '14:17', lane: 'response', kind: 'detect', lines: ['burn-rate alert pages', 'on-call (1 h window)'], mark: 'alert' },
  { t: '14:24', lane: 'response', kind: 'act', lines: ['on-call acknowledges'] },
  { t: '14:41', lane: 'response', kind: 'act', lines: ['SEV-2 declared,', 'incident lead assigned'] },
  { t: '15:02', lane: 'response', kind: 'act', lines: ['replica scaled up', 'no effect on p99'] },
  { t: '15:48', lane: 'response', kind: 'act', lines: ['cache-key change', 'identified as cause'], mark: 'cause' },
  { t: '16:10', lane: 'response', kind: 'act', lines: ['rollback started'], mark: 'mitigate' }
];
const mins = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
const T0 = mins('13:50'), T1 = mins('17:00');
const W = 1184, AX = 196, X0 = 110, X1 = W - 16;
const x = t => X0 + (mins(t) - T0) / (T1 - T0) * (X1 - X0);
const at = m => events.find(e => e.mark === m).t;
const dur = (a, b) => { const d = mins(b) - mins(a); return d >= 60 ? `${Math.floor(d / 60)}h ${String(d % 60).padStart(2, '0')}m` : `${d} min`; };
// label placement: search levels and sides per lane so that blocks never overlap and no stem crosses a block
const charW = 7.4, blockH = 46;
const levelsY = { system: [92, 18], response: [AX + 34, AX + 92, AX + 150] }; // index 0 = nearest the axis
function place(list, nLevels) {
  const opts = e => { const w = Math.max(60, ...e.lines.map(l => l.length * charW)) + 8, o = [];
    for (let lv = 0; lv < nLevels; lv++) for (const side of ['r', 'l']) { const bx0 = side === 'r' ? x(e.t) + 8 : x(e.t) - 8 - w; if (bx0 >= 0 && bx0 + w <= X1) o.push({ lv, side, bx0, bx1: bx0 + w }); }
    return o; };
  const cand = list.map(opts);
  const ok = (a, ea, b, eb) => {
    if (a.lv === b.lv && !(a.bx1 + 12 < b.bx0 || b.bx1 + 12 < a.bx0)) return false;          // same level overlap
    const sa = x(ea.t), sb = x(eb.t);
    if (a.lv > b.lv && sa >= b.bx0 - 6 && sa <= b.bx1 + 6) return false;                   // a's stem crosses b's block
    if (b.lv > a.lv && sb >= a.bx0 - 6 && sb <= a.bx1 + 6) return false;
    return true;
  };
  let best = null, bestCost = Infinity;
  (function go(i, chosen, cost) {
    if (cost >= bestCost) return;
    if (i === list.length) { best = chosen.slice(); bestCost = cost; return; }
    for (const c of cand[i]) if (chosen.every((p, j) => ok(c, list[i], p, list[j]))) { chosen.push(c); go(i + 1, chosen, cost + c.lv * 2 + (c.side === 'l' ? 1 : 0)); chosen.pop(); }
  })(0, [], 0);
  if (!best) throw new Error('Timeline labels do not fit; shorten lines or add a level');
  list.forEach((e, i) => Object.assign(e, best[i], { anchorEnd: best[i].side === 'l', level: best[i].lv }));
}
for (const lane of ['system', 'response']) {
  const list = events.filter(e => e.lane === lane).sort((a, b) => mins(a.t) - mins(b.t));
  place(list, levelsY[lane].length);
  list.forEach(e => { e.by = levelsY[lane][e.level]; });
}
const glyph = e => {
  const cx = x(e.t), cy = AX, c = { change: C.text2, bad: C.warn, good: C.good, detect: C.crit, act: C.sync }[e.kind];
  if (e.lane === 'system') return `<rect x="${cx - 6}" y="${cy - 6}" width="12" height="12" transform="rotate(45 ${cx} ${cy})" fill="${c}" stroke="${C.bg}" stroke-width="2"/>`;
  return `<circle cx="${cx}" cy="${cy}" r="6" fill="${c}" stroke="${C.bg}" stroke-width="2"/>`;
};
const blocks = events.map(e => {
  const cx = x(e.t), top = e.by, tx = e.anchorEnd ? e.bx1 : e.bx0, anc = e.anchorEnd ? 'end' : 'start';
  const stem = e.lane === 'system' ? `<line x1="${cx}" y1="${top + 4}" x2="${cx}" y2="${AX - 8}" stroke="${C.axis}" stroke-width="1"/>` : `<line x1="${cx}" y1="${AX + 8}" x2="${cx}" y2="${top + blockH - 6}" stroke="${C.axis}" stroke-width="1"/>`;
  const hi = e.kind === 'bad' ? 't-warn' : e.kind === 'good' ? 't-good' : e.kind === 'detect' ? 't-crit' : 't-mono-b';
  return `${stem}<text x="${tx}" y="${top + 16}" text-anchor="${anc}" class="${hi}">${e.t}</text>` + e.lines.map((l, i) => `<text x="${tx}" y="${top + 34 + i * 17}" text-anchor="${anc}" class="t-lab2">${l}</text>`).join('');
}).join('');
let axis = `<line x1="${X0}" y1="${AX}" x2="${X1}" y2="${AX}" stroke="${C.axis}" stroke-width="1.4"/>`;
for (let m = T0 + 10; m <= T1; m += 30) { const t = `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`; axis += `<line x1="${x(t)}" y1="${AX - 4}" x2="${x(t)}" y2="${AX + 4}" stroke="${C.axis}"/><text x="${x(t)}" y="${AX + 22}" text-anchor="middle" class="t-axis">${t}</text>`; }
const band = `<rect x="${x(at('impact'))}" y="${AX - 2}" width="${x(at('recovered')) - x(at('impact'))}" height="4" fill="${C.warn}" fill-opacity=".7"/>`;
const impact = `<rect x="${x(at('impact'))}" y="4" width="${x(at('recovered')) - x(at('impact'))}" height="${AX - 8}" fill="${C.warn}" fill-opacity=".045"/><text x="${x(at('impact')) + 6}" y="${AX - 12}" class="t-mono-s">customer impact ${dur(at('impact'), at('recovered'))}</text>`;
const lanesLab = `<text x="0" y="${AX - 40}" class="t-zone">SYSTEM</text><text x="0" y="${AX + 52}" class="t-zone">RESPONSE</text><text x="0" y="${AX + 5}" class="t-mono-s">UTC →</text>`;
const H = AX + 150 + blockH + 4;
const fig = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${ID}-t ${ID}-d">
<title id="${ID}-t">Incident timeline, ${DAY}, 13:50–17:00 UTC</title>
<desc id="${ID}-d">${events.sort((a, b) => mins(a.t) - mins(b.t)).map(e => `${e.t} ${e.lines.join(' ')}`).join('; ')}.</desc>
${impact}${axis}${band}${lanesLab}${blocks}${events.map(glyph).join('')}
</svg>`;
const metrics = [
  { k: 'Time to detect', v: dur(at('impact'), at('alert')), n: `impact ${at('impact')} → alert ${at('alert')}` },
  { k: 'Time to mitigate', v: dur(at('impact'), at('mitigate')), n: `impact → rollback started ${at('mitigate')}` },
  { k: 'Time to recover', v: dur(at('impact'), at('recovered')), n: `impact → p99 under SLO ${at('recovered')}` }
];

export default {
  study: true,
  id: ID,
  title: 'Incident timeline with detection and recovery times',
  notes: 'Purpose: Reconstruct what the system did and what responders did on one time axis, and derive detection, mitigation and recovery times from the same timestamps.\nModify: Edit events (t, lane, kind, lines, optional mark). Positions, label levels, the impact band and all durations are computed; marks impact, alert, cause, mitigate and recovered must exist.\nInvariant: One time zone, stated once. System events (diamonds) and response events (circles) stay on separate sides of the axis. Durations are computed from the marked events, never typed.\nStatic: Static page.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-architecture ar-timeline',
  content: `<div class="ar-page">
<div class="ar-bar"><span class="ar-crumb"><b>INC-2317</b><i>/</i>05 · Timeline</span><span>${DAY} · all times UTC</span></div>
<h1 class="ar-title" data-region="title">Detection took ${dur(at('impact'), at('alert'))}; finding the cause took <em>${dur(at('alert'), at('cause'))}</em></h1>
<figure class="ar-fig" style="left:48px;top:128px;width:${W}px;height:${H}px" data-region="primary">${fig}</figure>
<div class="ar-metrics" data-region="support">${metrics.map(m => `<div class="ar-metric"><div class="k">${m.k}</div><div class="v">${m.v}</div><div class="n">${m.n}</div></div>`).join('')}<div class="ar-metric ar-lesson"><div class="k">What slowed us</div><div class="v">Scaling the replica treated the symptom. Cache hit ratio was on a dashboard, not in any alert.</div></div></div>
<footer class="ar-foot" data-region="source"><span>Illustrative incident · fictional timeline</span><span class="ar-pg">05 / 06</span></footer>
</div>`
};
