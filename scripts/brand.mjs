#!/usr/bin/env node
/** Local brand tokens -> validation, CSS or six contrasting proof pages. */
import fs from 'node:fs/promises';import path from 'node:path';
import {validateBrand,brandCSS} from './brand-core.mjs';import {renderCraft} from './craft-core.mjs';
import {lineChart,svgRoot,el,g,textLines,linear,axis,fmt,sum,mixHex,textOn,contrastRatio} from '../assets/runtime/figure.mjs';
const args=process.argv.slice(2),cmd=args.shift(),get=k=>{const i=args.indexOf(k);return i<0?undefined:args[i+1]};

// ── Proof deck ──────────────────────────────────────────────────────────────
// Six standard pages (opening, evidence, comparison, diagram, dense table, close)
// that show a captured identity carrying a realistic deck. The content is one
// fictional board paper; every number below is synthetic and every derived number
// on the pages is computed from it. Layout, type sizes and colors come only from
// the brand tokens (canvas, margin, gutter, three type roles, six colors), so a
// different brand.json re-proofs the same story in its own identity.
export const PROOF = {
  org: 'Northmere Water', team: 'Asset Strategy', meeting: 'Board of Directors, 14 November 2026',
  // Leakage, Ml/d (quarterly mean): the six metered zones and the other 14 zones, Q1 2024 – Q3 2026.
  quarters: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026', 'Q3 2026'],
  metered: [31.4, 31.0, 30.2, 30.9, 29.2, 28.0, 27.1, 27.5, 26.6, 26.0, 25.8],
  others: [40.2, 39.9, 39.5, 40.6, 40.1, 39.7, 39.3, 40.2, 39.8, 39.5, 39.4],
  meteringDone: { from: 'Q2 2024', to: 'Q3 2024' },
  leaksRepaired: 1140,                                          // leaks found from night-flow alarms and repaired
  zones: [                                                      // leakage Ml/d in Q1 2024 and Q3 2026; mean night pressure, m
    { name: 'Ashby', dmas: 16, properties: 38200, pressure: 62, before: 7.4, after: 6.5 },
    { name: 'Brindle', dmas: 19, properties: 46900, pressure: 48, before: 5.2, after: 3.9 },
    { name: 'Carrow', dmas: 13, properties: 31500, pressure: 45, before: 3.6, after: 2.7 },
    { name: 'Dunmore', dmas: 17, properties: 40800, pressure: 51, before: 4.8, after: 3.8 },
    { name: 'Fenwick', dmas: 12, properties: 29700, pressure: 67, before: 5.9, after: 5.1 },
    { name: 'Lowmoor', dmas: 10, properties: 24100, pressure: 64, before: 4.5, after: 3.8 },
  ],
  options: [                                                    // phase 2 alternatives for the same three zones; £m, Ml/d, months
    { id: 'A', name: 'Pressure management', capital: 4.1, saving: 3.2, months: 9, works: '14 valve sites, no road closures' },
    { id: 'B', name: 'Mains renewal', capital: 11.6, saving: 2.6, months: 30, works: '22 km of road works' },
  ],
  dma: {                                                        // one district metered area in Fenwick; flow at the inlet meter, l/s, hourly
    name: 'Fenwick 07', properties: 2400, householdNight: 1.7, businessNight: 0.47,   // l per property per hour; l/s
    flow: [9.6, 8.1, 7.2, 6.8, 7.0, 8.9, 14.2, 22.6, 25.1, 21.8, 18.9, 17.7, 18.3, 17.2, 16.4, 16.9, 18.8, 21.5, 23.4, 21.1, 18.0, 15.2, 12.6, 10.8],
  },
  steps: [
    { when: 'Dec 2026', what: 'Valve survey and hydraulic model of the three zones' },
    { when: 'Apr 2027', what: 'First pressure-reducing valves in service in Fenwick' },
    { when: 'Mar 2028', what: 'Leakage review against the 3.2 Ml/d saving' },
  ],
};

export function proofDeck(brand){
  const P = PROOF, c = brand.colors, ty = brand.typography;
  // Derived numbers: computed once, read by every page.
  const pct = (a, b) => (b - a) / a * 100;
  const meteredChange = pct(P.metered[0], P.metered.at(-1)), othersChange = pct(P.others[0], P.others.at(-1));
  const zoneTotal = k => sum(P.zones.map(z => z[k]));
  if (Math.abs(zoneTotal('before') - P.metered[0]) > 1e-9 || Math.abs(zoneTotal('after') - P.metered.at(-1)) > 1e-9) throw Error('zone table and leakage series disagree');
  const perProperty = z => z.after * 1e6 / z.properties;                       // l per property per day
  const phase2 = [...P.zones].sort((a, b) => perProperty(b) - perProperty(a)).slice(0, 3);
  const isPhase2 = z => phase2.includes(z);
  const highPressure = [...P.zones].sort((a, b) => b.pressure - a.pressure).slice(0, 3);
  if (phase2.some(z => !highPressure.includes(z))) throw Error('The table headline says the three highest-leakage zones are the three high-pressure zones; the data no longer agree.');
  const [optA, optB] = P.options, costPer = o => o.capital / o.saving;     // £m per Ml/d saved
  const dmaMin = Math.min(...P.dma.flow), dmaHour = P.dma.flow.indexOf(dmaMin);
  const nightUse = P.dma.properties * P.dma.householdNight / 3600 + P.dma.businessNight;   // l/s
  const dmaLeak = dmaMin - nightUse, dmaLeakMld = dmaLeak * 86400 / 1e6;
  const names = list => list.map(z => z.name).join(list.length > 2 ? ', ' : ' and ').replace(/, ([^,]*)$/, ' and $1');
  const f1 = v => fmt(v, { digits: 1 }), f0 = v => fmt(v, { digits: 0 });

  // Grid and type scale, from the tokens only.
  const W = brand.canvas.width, H = brand.canvas.height, M = brand.spacing.margin, G = brand.spacing.gutter;
  const colW = (W - 2 * M - 11 * G) / 12, colX = k => M + (k - 1) * (colW + G), span = n => n * colW + (n - 1) * G;
  const size = { display: Math.round(ty.heading.size * 1.4), headline: ty.heading.size, lead: Math.round(ty.body.size * 1.15), body: ty.body.size, label: ty.caption.size };
  const logo = brand.logo && brand.logo.y < M + 2 * size.headline * ty.heading.lineHeight ? brand.logo : null;   // keep headlines clear of a logo in the top band
  const headW = logo ? Math.min(W - 2 * M, logo.x - M - G) : W - 2 * M;
  const top = M + Math.ceil(2 * size.headline * ty.heading.lineHeight) + G;   // content starts under a two-line headline
  const bottom = H - M - G / 2, footY = H - M;                            // content ends above the source line
  const px = v => `${Math.round(v * 100) / 100}px`;
  const box = (x, y, w, h, body, role = 'primary', cls = '') => `<div class="pf-box ${cls}" data-region="${role}" style="left:${px(x)};top:${px(y)};width:${px(w)};height:${px(h)}">${body}</div>`;
  const head = text => `<h1 class="pf-head" data-region="title">${text}</h1>`;
  const source = (left, right = '') => `<p class="pf-source" data-region="source"><span>${left}</span>${right ? `<span>${right}</span>` : ''}</p>`;

  // Colors: brand roles, plus a few mixes of them for figure roles the brand does not name.
  const context = mixHex(c.line, c.muted, 0.4), grid = mixHex(c.line, c.background, 0.55), onAccent = textOn(c.accent, c.background, c.text);
  // The accent colors text only where it is legible on the background (WCAG AA); otherwise it stays on marks and fields.
  const accentText = contrastRatio(c.accent, c.background) >= 4.5 ? c.accent : c.text;
  const seq = Array.from({ length: 7 }, (_, i) => mixHex(c.background, c.accent, (i + 1) / 7));
  const css = `/* Identity proof: positions and sizes are computed from the brand tokens in scripts/brand.mjs. */
.proof { --ss-paper:${c.background}; --ss-surface:${c.surface}; --ss-ink:${c.text}; --ss-muted:${c.muted}; --ss-rule:${c.line}; --ss-grid:${grid};
  --ss-accent:${c.accent}; --ss-on-accent:${onAccent}; --ss-highlight:${c.accent}; --ss-context:${context}; --ss-positive:${c.accent}; --ss-negative:${c.text};
  ${seq.map((v, i) => `--ss-seq-${i + 1}:${v};`).join(' ')} --ss-cat-1:${c.accent}; --ss-cat-2:${c.muted}; --ss-cat-3:${context};
  --ss-font-sans: var(--brand-body-font); --ss-font-display: var(--brand-heading-font);
  font: ${size.body}px/${ty.body.lineHeight} var(--brand-body-font); }
.proof :where(h1, h2, p, table, figure) { margin: 0; }
.proof .pf-box { position: absolute; }
.proof .pf-box > svg { display: block; width: 100%; height: 100%; overflow: visible; }
.proof .pf-head { position: absolute; left: ${M}px; top: ${M}px; width: ${px(headW)}; font: 700 ${size.headline}px/${ty.heading.lineHeight} var(--brand-heading-font); letter-spacing: -.01em; text-wrap: balance; }
.proof .pf-source { position: absolute; left: ${M}px; right: ${M}px; top: ${footY}px; display: flex; justify-content: space-between; gap: ${G}px; font: ${size.label}px/${ty.caption.lineHeight} var(--brand-caption-font); color: var(--brand-muted); }
.proof .pf-label { font: ${size.label}px/${ty.caption.lineHeight} var(--brand-caption-font); color: var(--brand-muted); }
.proof .pf-label b { font-weight: 700; color: ${accentText}; }
.proof .pf-lead { font-size: ${size.lead}px; line-height: ${ty.body.lineHeight}; }
.proof .pf-big { font: 700 ${size.display}px/1 var(--brand-heading-font); letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
.proof .pf-big small { font-size: .4em; letter-spacing: 0; margin-left: .1em; }
.proof .pf-accent { color: ${accentText}; }
.proof .pf-rule { border: 0; border-top: 1px solid var(--brand-line); margin: ${G / 2}px 0; }
.proof .pf-facts { width: 100%; border-collapse: collapse; font-size: ${size.label + 3}px; line-height: 1.3; font-variant-numeric: tabular-nums; }
.proof .pf-facts th { width: 38%; padding: 8px ${G / 2}px 8px 0; border-top: 1px solid var(--brand-line); font: ${size.label}px/${ty.caption.lineHeight} var(--brand-caption-font); color: var(--brand-muted); text-align: left; vertical-align: top; }
.proof .pf-facts td { padding: 7px 0 8px; border-top: 1px solid var(--brand-line); vertical-align: top; }
.proof .pf-table { width: 100%; border-collapse: collapse; font: ${size.label + 2}px/1.4 var(--brand-body-font); font-variant-numeric: tabular-nums; }
.proof .pf-table th { padding: 0 ${G / 2}px 12px 0; border-bottom: 1.5px solid var(--brand-text); font: ${size.label}px/1.3 var(--brand-caption-font); color: var(--brand-muted); text-align: right; vertical-align: bottom; }
.proof .pf-table td { padding: 9px ${G / 2}px 9px 0; border-bottom: 1px solid var(--brand-line); text-align: right; white-space: nowrap; }
.proof .pf-table :is(th, td):first-child { text-align: left; }
.proof .pf-table :is(th, td):last-child { padding-right: 0; }
.proof .pf-table tr.is-total td { border-bottom: 0; border-top: 1.5px solid var(--brand-text); font-weight: 700; }
.proof .pf-table .is-key { color: ${accentText}; font-weight: 700; }
.proof.pf-close { background: var(--brand-accent); color: ${onAccent}; }
.proof.pf-close .pf-source, .proof.pf-close .pf-label { color: ${onAccent}; }
.proof .pf-steps { display: grid; grid-template-columns: repeat(3, 1fr); column-gap: ${G}px; }
.proof .pf-steps div { padding-top: 14px; border-top: 2px solid currentColor; }
.proof .pf-steps b { display: block; font: 700 ${size.lead}px/1.2 var(--brand-heading-font); }
.proof .pf-steps span { display: block; margin-top: 8px; font-size: ${size.label + 2}px; line-height: ${ty.caption.lineHeight}; }
`;

  // 1 · Opening: the topic, the ask, and the one number that earns the meeting.
  const opening = `<p class="pf-label pf-box" style="left:${M}px;top:${M}px">${P.org} — ${P.team}</p>
${box(colX(1), top - G, span(8), H - 2 * M - top, `<h1 class="pf-big" style="font-size:${size.display}px;line-height:1.08;text-wrap:balance">Leakage programme review, ${P.quarters[0].slice(-4)}–${P.quarters.at(-1).slice(-4)}</h1>
<p class="pf-lead" style="margin-top:${G}px;max-width:${px(span(7))}">Metering found and fixed ${f1(P.metered[0] - P.metered.at(-1))} megalitres a day in six zones. Phase 2 asks for pressure management in the three that still leak most.</p>`, 'title')}
${box(colX(9), top + size.headline, span(4), 260, `<p class="pf-big pf-accent" style="font-size:${Math.round(size.display * 1.6)}px">${fmt(meteredChange, { digits: 0 })}%</p>
<p class="pf-label" style="margin-top:16px">Leakage in the six metered zones, ${P.quarters[0]} to ${P.quarters.at(-1)}</p>`, 'support')}
${source(P.meeting, 'Fictional utility and data, for an identity proof')}`;

  // 2 · Evidence: one chart from the figure engine, two numbers that read it.
  const chartW = span(8), chartH = bottom - top;
  const quarterX = i => 2024 + (i + 0.5) / 4;                  // quarter midpoints on a year axis
  const qIndex = q => P.quarters.indexOf(q);
  const evidenceChart = lineChart({
    id: 'proof-leakage', width: chartW, height: chartH, fontSize: size.label, xType: 'linear',
    title: 'Leakage by quarter, megalitres a day', desc: `Six metered zones ${f1(P.metered[0])} to ${f1(P.metered.at(-1))} Ml/d (${fmt(meteredChange, { digits: 0 })}%); other zones ${f1(P.others[0])} to ${f1(P.others.at(-1))} (${fmt(othersChange, { digits: 0 })}%).`,
    series: [{ name: 'Six metered zones', points: P.metered.map((v, i) => [quarterX(i), v]) }, { name: 'Other 14 zones', points: P.others.map((v, i) => [quarterX(i), v]) }],
    highlight: 'Six metered zones', endLabels: false, markers: 'last', format: { digits: 1 }, unit: 'Leakage, Ml/d', yDomain: [20, 45], yTicks: 5,
    xDomain: [2024, 2024 + P.quarters.length / 4], xTicks: 3, xFormat: v => String(v),
    bands: [{ from: quarterX(qIndex(P.meteringDone.from)) - 0.125, to: quarterX(qIndex(P.meteringDone.to)) + 0.125, label: 'Meters installed' }],
    extra: ({ x, y }) => [['Six metered zones', P.metered, accentText, 700], ['Other 14 zones', P.others, 'var(--ss-muted)', 400]].map(([name, v, fill, weight]) =>
      textLines([name], { x: x(quarterX(v.length - 1)), y: y(v.at(-1)) + (name.startsWith('Six') ? 34 : -20), size: size.label, anchor: 'end', fill, weight })).join(''),
  });
  const evidence = `${head(`Leakage fell ${fmt(-meteredChange, { digits: 0 })}% where we metered the network, against ${fmt(-othersChange, { digits: 0 })}% elsewhere`)}
${box(colX(1), top, chartW, chartH, evidenceChart)}
${box(colX(9), top, span(4), chartH, `<div style="display:flex;flex-direction:column;justify-content:center;height:100%">
  <p class="pf-big pf-accent" style="font-size:${size.display}px">${fmt(meteredChange, { digits: 0 })}%</p><p class="pf-label" style="margin-top:10px">Six metered zones, ${f1(P.metered[0])} → ${f1(P.metered.at(-1))} Ml/d</p>
  <hr class="pf-rule"><p class="pf-big" style="font-size:${size.display}px">${fmt(othersChange, { digits: 0 })}%</p><p class="pf-label" style="margin-top:10px">Other 14 zones, ${f1(P.others[0])} → ${f1(P.others.at(-1))} Ml/d</p>
  <hr class="pf-rule"><p class="pf-label" style="color:var(--brand-text)">Crews repaired ${fmt(P.leaksRepaired)} leaks located from night-flow alarms.</p></div>`, 'support')}
${source('Fictional data: quarterly mean leakage from the water balance, Q1 2024 – Q3 2026', 'Line chart')}`;

  // 3 · Comparison: two options on one scale, the same facts in the same rows.
  const costMax = Math.ceil(Math.max(...P.options.map(costPer)));
  const option = (o, rec) => `<p class="pf-label">${rec ? '<b>Recommended</b> · ' : ''}Option ${o.id}</p>
<h2 style="margin-top:6px;font:700 ${size.lead}px/1.2 var(--brand-heading-font)">${o.name}</h2>
<p class="pf-big${rec ? ' pf-accent' : ''}" style="margin-top:12px">£${f1(costPer(o))}m</p>
<p class="pf-label" style="margin-top:6px">per megalitre a day of leakage saved</p>
<svg role="img" aria-label="£${f1(costPer(o))}m on a shared scale from 0 to £${costMax}m" viewBox="0 0 ${Math.round(span(6))} 20" style="display:block;width:100%;height:20px;margin:12px 0 18px">
  <rect x="0" y="4" width="${Math.round(span(6))}" height="12" fill="${grid}"/><rect x="0" y="4" width="${(costPer(o) / costMax * span(6)).toFixed(1)}" height="12" fill="${rec ? c.accent : c.muted}"/></svg>
<table class="pf-facts"><tbody>
  <tr><th>Capital cost</th><td>£${f1(o.capital)}m</td></tr>
  <tr><th>Leakage saved</th><td>${f1(o.saving)} Ml/d</td></tr>
  <tr><th>First saving</th><td>after ${o.months} months</td></tr>
  <tr><th>Works</th><td>${o.works}</td></tr>
</tbody></table>`;
  const comparison = `${head(`Pressure management saves a megalitre a day for £${f1(costPer(optA))}m; mains renewal needs £${f1(costPer(optB))}m`)}
${box(colX(1), top, span(6), bottom - top, option(optA, true))}
${box(colX(7), top, span(6), bottom - top, option(optB, false), 'support')}
${source(`Fictional estimates for ${names(phase2)}; bars share one scale, £0–${costMax}m per Ml/d`, 'Paired comparison')}`;

  // 4 · Diagram: how a district meter turns night-time flow into a leakage estimate.
  const dmaW = span(7), figH = bottom - top;
  const dmaDrawing = (() => {
    // Schematic of one district metered area: a dashed boundary, one metered inlet, closed boundary valves.
    const ink = 'var(--ss-ink)', mut = 'var(--ss-muted)', acc = 'var(--ss-accent)', fs = size.label;
    const bx = 170, by = 24, bw = dmaW - bx - 6, bh = figH - 40;                 // boundary
    const mainY = by + 118, lowY = by + bh - 96, branchX = [0.27, 0.53, 0.79].map(f => bx + bw * f), endX = bx + bw - 40;
    const valve = (x, y, closed, vertical = false) => el('path', { d: vertical
      ? `M${x - 9} ${y - 11}L${x + 9} ${y + 11}H${x - 9}L${x + 9} ${y - 11}Z`
      : `M${x - 11} ${y - 9}L${x + 11} ${y + 9}V${y - 9}L${x - 11} ${y + 9}Z`, fill: closed ? ink : 'var(--ss-paper)', stroke: ink, 'stroke-width': 2, 'stroke-linejoin': 'round' });
    // Service connections drawn as short ticks along the mains: one tick per ~60 properties, alternating sides.
    const services = () => {
      const runs = [[bx + 64, endX, mainY, 'h'], ...branchX.map(x => [mainY + 24, lowY - 10, x, 'v']), [branchX[0] + 24, bx + bw - 40, lowY, 'h']];
      const length = sum(runs.map(([a, b]) => b - a)), every = length / Math.round(P.dma.properties / 60), d = [];
      for (const [a, b, at, dir] of runs) for (let u = a + every / 2, k = 0; u < b; u += every, k++) {
        const s = k % 2 ? 1 : -1;
        d.push(dir === 'h' ? `M${u.toFixed(1)} ${at}v${s * 9}` : `M${at} ${u.toFixed(1)}h${s * 9}`);
      }
      return el('path', { d: d.join(''), stroke: context, 'stroke-width': 1.5, fill: 'none' });
    };
    const parts = [
      el('rect', { x: bx, y: by, width: bw, height: bh, rx: 16, fill: 'var(--ss-surface)', stroke: mut, 'stroke-width': 1.5, 'stroke-dasharray': '8 6' }),
      // trunk main → meter (outside) → pressure-reducing valve (inside) → distribution mains
      el('line', { x1: 0, x2: bx + 64, y1: mainY, y2: mainY, stroke: ink, 'stroke-width': 7 }),
      el('line', { x1: bx + 64, x2: endX, y1: mainY, y2: mainY, stroke: mut, 'stroke-width': 4 }),
      ...branchX.map(x => el('line', { x1: x, x2: x, y1: mainY, y2: lowY, stroke: mut, 'stroke-width': 3 })),
      el('line', { x1: branchX[0], x2: bx + bw, y1: lowY, y2: lowY, stroke: mut, 'stroke-width': 3 }),
      el('line', { x1: branchX[1], x2: branchX[1], y1: lowY, y2: by + bh, stroke: mut, 'stroke-width': 3 }),
      services(),
      el('circle', { cx: bx - 70, cy: mainY, r: 17, fill: 'var(--ss-paper)', stroke: acc, 'stroke-width': 4 }),
      textLines(['M'], { x: bx - 70, y: mainY, size: 16, anchor: 'middle', valign: 'middle', fill: accentText, weight: 700 }),
      valve(bx + 34, mainY, false),
      valve(bx + bw, lowY, true), valve(branchX[1], by + bh, true, true),
      // labels sit in open space, never across a pipe
      textLines(['Inlet meter', 'logs flow', 'every 15 min'], { x: 0, y: mainY - 100, size: fs, fill: accentText, weight: 700, lineHeight: 1.3 }),
      textLines(['Pressure-reducing valve,', 'added in phase 2'], { x: bx + 20, y: by + 40, size: fs, fill: ink, lineHeight: 1.3 }),
      textLines([`${P.dma.name}`, `${fmt(P.dma.properties)} properties`], { x: bx + bw - 22, y: by + 40, size: fs, anchor: 'end', fill: mut, weight: 700, lineHeight: 1.3 }),
      textLines(['Boundary valves', 'stay closed'], { x: bx + bw - 22, y: lowY + 40, size: fs, anchor: 'end', fill: ink, lineHeight: 1.3 }),
    ];
    return svgRoot({ id: 'proof-dma', width: dmaW, height: figH, title: `District metered area ${P.dma.name}`, desc: 'One inlet meter measures all water entering the area; boundary valves stay closed, so night-time flow above legitimate use is leakage.' }, ...parts);
  })();
  const flowW = span(5) - G / 2, flowH = figH * 0.62;
  const flowChart = (() => {
    const m = { l: 44, r: 12, t: 30, b: 34 }, x = linear([0, 23], [m.l, flowW - m.r]), y = linear([0, 30], [flowH - m.b, m.t]);
    const pts = P.dma.flow.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    const parts = [axis(y, { orient: 'left', at: m.l, grid: [m.l, flowW - m.r], size: size.label - 2, count: 3 }), axis(x, { orient: 'bottom', at: flowH - m.b, size: size.label - 2, tickValues: [0, 6, 12, 18], format: h => `${String(h).padStart(2, '0')}:00` }),
      el('polyline', { points: pts, fill: 'none', stroke: 'var(--ss-ink)', 'stroke-width': 2.5 }),
      el('rect', { x: x(dmaHour) - 8, y: y(nightUse), width: 16, height: y(0) - y(nightUse), fill: 'var(--ss-context)' }),
      el('rect', { x: x(dmaHour) - 8, y: y(dmaMin), width: 16, height: y(nightUse) - y(dmaMin), fill: 'var(--ss-accent)' }),
      textLines(['Flow, l/s'], { x: m.l - 40, y: 14, size: size.label - 2, fill: 'var(--ss-muted)' }),
      // the label sits beside the bar, under the curve and above the axis
      textLines([`${String(dmaHour).padStart(2, '0')}:00 minimum`], { x: x(dmaHour) + 14, y: y(0) - 12, size: size.label - 2, fill: accentText, weight: 700 })];
    return svgRoot({ id: 'proof-night', width: flowW, height: flowH, title: `Inflow to ${P.dma.name} over one day`, desc: `Minimum ${f1(dmaMin)} l/s at ${dmaHour}:00, of which ${f1(nightUse)} l/s is legitimate night use.` }, ...parts);
  })();
  const diagram = `${head('A district meter turns night\u2011time flow into a leakage estimate')}
${box(colX(1), top, dmaW, figH, dmaDrawing)}
${box(colX(8) + G / 2, top, flowW, flowH, flowChart, 'support')}
${box(colX(8) + G / 2, top + flowH + G / 2, flowW, figH - flowH - G / 2, `<p class="pf-label" style="color:var(--brand-text);font-size:${size.label + 2}px"><b>${f1(dmaMin)} l/s</b> minimum at ${String(dmaHour).padStart(2, '0')}:00 − <b style="color:var(--brand-muted)">${f1(nightUse)} l/s</b> legitimate night use = <b>${f1(dmaLeak)} l/s</b> leakage, about ${fmt(dmaLeakMld, { digits: 2 })} Ml/d</p>`, 'support')}
${source(`Schematic, not to scale. Fictional data for one day in ${P.dma.name}`, 'Night-flow analysis')}`;

  // 5 · Dense table: every zone, every field, totals that match the evidence page.
  const rows = P.zones.map(z => `<tr><td>${z.name}</td><td>${z.dmas}</td><td>${fmt(z.properties)}</td><td>${z.pressure}</td><td>${f1(z.before)}</td><td>${f1(z.after)}</td><td>${fmt(pct(z.before, z.after), { digits: 0 })}%</td><td${isPhase2(z) ? ' class="is-key"' : ''}>${f0(perProperty(z))}</td><td${isPhase2(z) ? ' class="is-key"' : ''}>${isPhase2(z) ? 'Phase 2' : '—'}</td></tr>`).join('');
  const totals = `<tr class="is-total"><td>Six zones</td><td>${zoneTotal('dmas')}</td><td>${fmt(zoneTotal('properties'))}</td><td></td><td>${f1(zoneTotal('before'))}</td><td>${f1(zoneTotal('after'))}</td><td>${fmt(meteredChange, { digits: 0 })}%</td><td>${f0(zoneTotal('after') * 1e6 / zoneTotal('properties'))}</td><td></td></tr>`;
  const dense = `${head('The three high-pressure zones still lose the most water per property')}
${box(colX(1), top, W - 2 * M, bottom - top, `<table class="pf-table"><thead><tr><th>Zone</th><th>District<br>areas</th><th>Properties</th><th>Night<br>pressure, m</th><th>Leakage, Ml/d<br>${P.quarters[0]}</th><th>Leakage, Ml/d<br>${P.quarters.at(-1)}</th><th>Change</th><th>Leakage per<br>property, l/day</th><th>Plan</th></tr></thead><tbody>${rows}${totals}</tbody></table>`)}
${source('Fictional data. Leakage per property uses Q3 2026 leakage and connected properties', 'Reference table')}`;

  // 6 · Close: the decision, then what happens and when.
  const close = `${box(colX(1), top - G, span(10), size.display * 3, `<p class="pf-big" style="font-size:${Math.round(size.display * 0.82)}px;line-height:1.12;letter-spacing:-.015em">Approve £${f1(optA.capital)}m for pressure management in ${names(phase2)}.</p>`, 'title')}
${box(colX(1), bottom - 150, W - 2 * M, 150, `<div class="pf-steps">${P.steps.map(s => `<div><b>${s.when}</b><span>${s.what}</span></div>`).join('')}</div>`)}
${source(`${P.org}, ${P.team}`, P.meeting)}`;

  const slide = (id, title, content, notes, cls = '') => ({ id, title, className: `proof ${cls}`.trim(), content, notes, exportPolicy: 'final' });
  return {title:`Identity proof · ${brand.name}`,language:'en',mode:'workshop',brand,sample:true,draft:brand.status!=='approved',css,
  slides:[
    slide('identity-opening', 'Leakage programme review', opening, 'Type-led opener: the display size, the lead size and one accent number. Checks the heading face at its largest and the accent at its largest area.'),
    slide('identity-evidence', 'Leakage fell where we metered', evidence, 'Evidence page: a figure-engine line chart themed from the brand tokens (--ss-* set from brand colors), direct labels, one accent series, a rail of two numbers.'),
    slide('identity-comparison', 'Pressure management against mains renewal', comparison, 'Paired comparison: two columns, one shared scale for the deciding number, the same facts in the same rows. Checks the long headline and the accent used once.'),
    slide('identity-image', 'How night-flow analysis finds leakage', diagram, 'Diagram page: a schematic drawn from computed geometry beside a small chart and the arithmetic it supports. Substitute an approved photograph when the subject is a physical asset.'),
    slide('identity-dense', 'Leakage by zone', dense, 'Dense reference table at caption size: tabular figures, units in the headers, totals that equal the evidence page, the key rows marked with the accent.'),
    slide('identity-close', 'Decision requested', close, 'Quiet close on the accent color: one decision, three dated steps. Text color on the accent is chosen for contrast (textOn).', 'pf-close'),
  ]};
}
if(process.argv[1]?.endsWith('brand.mjs'))try{
 if(!args[0]||!['validate','css','proof'].includes(cmd))throw Error('brand.mjs validate|css|proof brand.json [--out FILE] [--allow-draft] [--force]');
 const b=JSON.parse(await fs.readFile(args[0],'utf8'));validateBrand(b,{allowDraft:args.includes('--allow-draft')});
 if(cmd==='validate')console.log(JSON.stringify({valid:true,status:b.status}));
 else {const out=get('--out');if(!out)throw Error('--out required');await fs.mkdir(path.dirname(path.resolve(out)),{recursive:true});const text=cmd==='css'?brandCSS(b):await renderCraft(proofDeck(b),{assetBase:path.dirname(path.resolve(args[0])),allowDraft:args.includes('--allow-draft')});await fs.writeFile(out,text,{flag:args.includes('--force')?'w':'wx'});console.log(out)}
}catch(e){console.error(e.message);process.exitCode=1}
