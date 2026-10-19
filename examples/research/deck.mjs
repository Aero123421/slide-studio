// Worked example · A complete research narrative.
//
// A ten-page conference talk about one (fictional) diagnostic-accuracy study: can a
// night-noise leak score decide where a water utility sends its excavation crews?
// The talk follows the research route in references/authoring.md — question → why it
// matters → data → method → result with its uncertainty → the trade-off, explored live
// → what the trade-off is worth → limits → what the next study must decide.
//
// Every number on every page is computed below from ./data.json: headlines, rail
// numbers, figures, the table, and the dataset fed to the one interactive widget
// (kind `threshold`, assets/runtime/widgets.js). Edit the data and the talk recomputes;
// a sentence whose pattern no longer holds throws (see `claim`) instead of going stale.
import fs from 'node:fs/promises';
import { h } from '../../assets/runtime/kit.mjs';
import {
  theme, el, g, svgRoot, textLines, linear, band, axis, niceDomain, fmt, sum, median, beeswarm,
  confusionAt, rocPoints, auc, flowDiagram, forestPlot, lineChart,
} from '../../assets/runtime/figure.mjs';

// ------------------------------------------------------------------ CSS: grammar + one color system
// Read at build time, exactly as `craft.mjs init` writes theme.css for a user project.
const read = file => fs.readFile(new URL(file, import.meta.url), 'utf8');
const SYSTEM = 'laboratory';
const frame = await read('../../assets/runtime/study-frame.css');
const block = (await read('../../assets/color-systems/color-systems.css'))
  .match(new RegExp(String.raw`/\*[^*]*\*/\n\.cs-${SYSTEM}\{[^}]*\}`))?.[0];
if (!block) throw Error(`color-systems.css has no block for cs-${SYSTEM}`);

const deckCSS = String.raw`
/* ---- Research talk: deck-specific rules -------------------------------------------
   Page 1280 × 720, margins 64, 12 columns of 74 px with 24 px gutters (column k starts at 64 + 98k).
   Type: Charter for claims, Inter for everything else. Scale 88 · 40 · 26 · 20 · 17 · 15. */
.talk { --ss-font-display: "Charter", "Bitstream Charter", "Iowan Old Style", Georgia, serif;
        --ss-font-sans: "Inter", "Helvetica Neue", Arial, sans-serif; }
.talk .st-head { font-weight: 400; font-size: 40px; line-height: 1.13; letter-spacing: -.012em; max-width: 1110px; }
.talk .st-dek { top: 152px; font-size: 20px; color: var(--ss-muted); }
.talk .st-kpi b { font-weight: 400; }
.talk .st-kpi span { font-size: 19px; line-height: 1.42; color: var(--ss-ink); }
.talk .st-kpi span em { font-style: normal; color: var(--ss-muted); }
.talk .num { font-variant-numeric: tabular-nums lining-nums; }

/* Cover: one question, set large; the byline sits on the bottom margin. */
.talk .cover-title { position: absolute; left: 64px; top: 196px; margin: 0; font: 400 88px/1.02 var(--ss-font-display); letter-spacing: -.022em; }
.talk .cover-lead { position: absolute; left: 64px; top: 316px; width: 760px; font: 400 26px/1.38 var(--ss-font-sans); }
.talk .cover-by { position: absolute; left: 64px; right: 64px; bottom: 56px; padding-top: 18px; border-top: 1px solid var(--ss-rule); display: flex; justify-content: space-between; font: 400 19px/1.4 var(--ss-font-sans); }
.talk .cover-by span:last-child { color: var(--ss-muted); }

/* Explore: the threshold widget owns .w-plot, .w-controls and .w-status; this page only places
   them. The plot keeps the widget's 700 × 360 viewBox aspect so the axis overlay stays registered. */
.talk .widget { position: absolute; left: 64px; top: 176px; width: 1152px; height: 470px; display: grid;
  grid-template-columns: 770px 1fr; grid-template-rows: 396px 1fr; column-gap: 48px; }
.talk .w-plot { grid-column: 1; grid-row: 1; }
.talk .w-plot > svg { width: 100%; height: 100%; display: block; }
.talk .w-controls { grid-column: 2; grid-row: 1; align-self: start; display: grid; gap: 14px; }
.talk .w-controls label { display: grid; grid-template-columns: 1fr auto; row-gap: 10px; font: 600 18px/1.3 var(--ss-font-sans); }
.talk .w-controls label > span { grid-area: 1 / 1; }
.talk .w-controls output { grid-area: 1 / 2; font: 600 22px/1 var(--ss-font-sans); color: var(--ss-accent); font-variant-numeric: tabular-nums; }
.talk .w-controls input[type=range] { grid-area: 2 / 1 / 3 / 3; width: 100%; margin: 0; accent-color: var(--ss-accent); }
.talk .w-controls button { justify-self: start; font: 500 16px/1.2 var(--ss-font-sans); color: var(--ss-ink); background: none; border: 1px solid var(--ss-rule); border-radius: 6px; padding: 8px 12px; cursor: pointer; }
.talk .w-status { grid-column: 1; grid-row: 2; padding-top: 6px; font: 400 15px/1.3 var(--ss-font-sans); color: var(--ss-muted); }
.talk .w-export-summary { grid-column: 2 !important; grid-row: 1 !important; }
.talk .w-axis { position: absolute; left: 64px; top: 176px; width: 770px; height: 396px; pointer-events: none; }
.talk .readout { position: absolute; left: 882px; top: 318px; width: 334px; }
.talk .readout table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; }
.talk .readout th { font: 600 16px/1.3 var(--ss-font-sans); color: var(--ss-muted); text-align: left; padding: 0 0 8px; }
.talk .readout tbody th { padding: 14px 10px 14px 0; border-top: 1px solid var(--ss-rule); vertical-align: top; color: var(--ss-ink); }
.talk .readout td { padding: 10px 0 12px; border-top: 1px solid var(--ss-rule); font: 400 16px/1.25 var(--ss-font-sans); color: var(--ss-muted); vertical-align: top; }
.talk .readout td b { display: block; font: 400 34px/1.05 var(--ss-font-display); color: var(--ss-ink); }
.talk .readout td.sent b { color: var(--ss-accent); }
.talk .readout p { margin-top: 12px; font: 400 18px/1.4 var(--ss-font-sans); }

/* Compare: a table for reading; tabular figures, hairlines, the current rule in bold. */
.talk .tbl { position: absolute; left: 64px; top: 196px; width: 1152px; border-collapse: collapse; font: 400 22px/1.3 var(--ss-font-sans); font-variant-numeric: tabular-nums lining-nums; }
.talk .tbl th, .talk .tbl td { padding: 15px 18px; text-align: right; border-bottom: 1px solid var(--ss-rule); }
.talk .tbl :is(th, td):first-child { text-align: left; padding-left: 0; }
.talk .tbl thead th { font: 600 16px/1.3 var(--ss-font-sans); color: var(--ss-muted); vertical-align: bottom; border-bottom: 1.5px solid var(--ss-ink); }
.talk .tbl tbody th { font-weight: 400; }
.talk .tbl tr.today :is(th, td) { font-weight: 650; }
.talk .tbl tr.today th span { font-weight: 400; color: var(--ss-muted); font-size: 17px; margin-left: 10px; }
.talk .tbl tr.focus td.key { color: var(--ss-accent); font-weight: 650; }

/* Limits: three findings, each led by the number that sets its size. */
.talk .limits { position: absolute; left: 64px; top: 188px; width: 1152px; list-style: none; padding: 0; margin: 0; }
.talk .limits li { display: grid; grid-template-columns: 270px 1fr; column-gap: 24px; padding: 22px 0 24px; border-top: 1px solid var(--ss-rule); }
.talk .limits li:last-child { border-bottom: 1px solid var(--ss-rule); }
.talk .limits b { font: 400 54px/1 var(--ss-font-display); letter-spacing: -.02em; font-variant-numeric: lining-nums; }
.talk .limits h2 { font: 600 22px/1.3 var(--ss-font-sans); margin: 4px 0 6px; }
.talk .limits p { font: 400 20px/1.45 var(--ss-font-sans); color: var(--ss-ink); max-width: 820px; }

/* Next study: three decisions as columns on the grid (4 columns each), no boxes. */
.talk .next { position: absolute; left: 64px; top: 204px; width: 1152px; display: grid; grid-template-columns: repeat(3, 1fr); column-gap: 24px; }
.talk .next section { border-top: 2px solid var(--ss-ink); padding-top: 18px; }
.talk .next h2 { font: 600 22px/1.3 var(--ss-font-sans); margin: 0 0 14px; }
.talk .next b { display: block; font: 400 48px/1 var(--ss-font-display); letter-spacing: -.02em; margin-bottom: 14px; }
.talk .next b.st-accent { color: var(--ss-accent); }
.talk .next p { font: 400 20px/1.45 var(--ss-font-sans); }
`;

// ------------------------------------------------------------------ data
const { study, operations2025: ops, sites } = JSON.parse(await read('./data.json'));
const scores = sites.map(s => s.score);                  // night-noise leak score, 0–1
const leaks = sites.map(s => s.leak);                    // reference label: 1 = leak found by excavation
const T0 = study.currentThreshold;                       // today's rule: dig when score ≥ 0.50
const thresholds = Array.from({ length: 19 }, (_, k) => (k + 1) * 5 / 100);   // the widget's slider stops
const at = t => { const c = confusionAt(scores, leaks, t); return { t, ...c, digs: c.tp + c.fp }; };
const table = thresholds.map(at);
const now = at(T0);
const nLeak = now.tp + now.fn, nNone = now.tn + now.fp;

/** Wilson score interval for k of n (95%): stays inside 0–1 and behaves at small n. */
function wilson(k, n, z = 1.96) {
  const p = k / n, d = 1 + z * z / n, centre = (p + z * z / (2 * n)) / d;
  const half = (z / d) * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n));
  return { k, n, p, lo: centre - half, hi: centre + half };
}
/** A sentence on a slide is a claim about the data: check its pattern, not just its numbers. */
const claim = (ok, message) => { if (!ok) throw Error(`Claim no longer holds: ${message}. Rewrite the page.`); };

const t2 = t => t.toFixed(2);                                     // thresholds: always two decimals
const pc = p => fmt(p * 100, { digits: 0 }) + '%';                // shares: whole percent
const count = v => fmt(v, { digits: 0 });                         // counts: 1,412
const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const SOURCE_STUDY = `${h(study.district)} blind survey, ${h(study.window)} · ${sites.length} flagged sites, ${nLeak} leaks`;

// Page 2 · 2025 job records: digs happen only at 0.50 and above.
const dug = sum(ops.bands.map(b => b.dug ?? 0)), dry = sum(ops.bands.map(b => b.dry ?? 0));
const undug = sum(ops.bands.filter(b => b.dug == null).map(b => b.alerts));
const oneIn = Math.round(dug / dry);
claim(ops.bands.every(b => (b.dug != null) === (b.from >= T0)), 'every alert at 0.50 or above, and none below, was excavated');

// Page 3 · how the reference labels were made.
const heard = sites.filter(s => s.survey === 'leak noise'), quiet = sites.filter(s => s.survey === 'quiet');
const dryHoles = heard.filter(s => !s.leak);
claim(heard.every(s => s.excavated) && quiet.every(s => !s.excavated && !s.leak), 'every site with leak noise, and only those, was excavated');

// Page 5 · four rates at today's threshold, each with a Wilson 95% interval.
const rates = [
  { label: 'Sensitivity: leaks found', ...wilson(now.tp, nLeak) },
  { label: 'Specificity: no-leak sites not dug', ...wilson(now.tn, nNone) },
  { label: 'PPV: digs that found a leak', ...wilson(now.tp, now.digs) },
  { label: 'NPV: undug sites with no leak', ...wilson(now.tn, now.tn + now.fn) },
];
const [sens, , ppv] = rates;
const recordsPPV = (dug - dry) / dug;                              // the same rate in 2025 job records
const AUC = auc(rocPoints(scores, leaks));

// Page 6 · between 0.30 and 0.60 every 0.05 step down finds exactly one more leak.
const band30to60 = table.filter(c => c.t >= 0.3 - 1e-9 && c.t <= 0.6 + 1e-9);
const steps = band30to60.slice(1).map((c, i) => ({ leaks: band30to60[i].tp - c.tp, dry: band30to60[i].fp - c.fp }));
const stepDry = [Math.min(...steps.map(s => s.dry)), Math.max(...steps.map(s => s.dry))];
claim(steps.every(s => s.leaks === 1), 'each 0.05 step between 0.30 and 0.60 adds one leak');

// Page 7 · the lowest threshold that finds every leak, and what it costs in dry digs.
const findAll = table.filter(c => c.fn === 0).at(-1);
const compareRows = [findAll.t, 0.3, 0.4, T0, 0.6, 0.7].map(at);

// Page 8 · cost in dry-dig equivalents when one missed leak is worth R dry digs.
const R = [1, 3, 6];
const VIEW = [0.1, 0.7];                                           // beyond 0.70 every curve only rises
const inView = table.filter(c => c.t >= VIEW[0] - 1e-9 && c.t <= VIEW[1] + 1e-9);
const costOf = (c, r) => c.fp + r * c.fn;
const best = R.map(r => table.reduce((b, c) => (costOf(c, r) < costOf(b, r) ? c : b)));
claim(best.every((b, i) => !i || b.t < best[i - 1].t), 'the best threshold falls as a miss gets dearer');
claim(best.every(b => b.t >= VIEW[0] && b.t <= VIEW[1]), 'every optimum lies inside the plotted range');
const missedFlow = median(sites.filter(s => s.leak && s.score < T0).map(s => s.flow));
const foundFlow = median(sites.filter(s => s.leak && s.score >= T0).map(s => s.flow));

// Page 10 · leaks needed for ±10 points on sensitivity (normal approximation), and sites to find them.
const leaksNeeded = Math.ceil(1.96 ** 2 * sens.p * (1 - sens.p) / 0.1 ** 2);
const sitesNeeded = Math.round(leaksNeeded / (nLeak / sites.length) / 10) * 10;

// ------------------------------------------------------------------ figures
const t = theme();                                                  // CSS-variable colors from cs-laboratory

/** Page 2: 2025 alerts by score band; only bands at 0.50 and above were ever excavated. */
function alertsFigure() {
  const W = 800, H = 482, box = { x: 60, y: 76, w: 728, h: 340 };
  const x = linear([0, 1], [box.x, box.x + box.w]);
  const y = linear(niceDomain([0, Math.max(...ops.bands.map(b => b.alerts))], 4), [box.y + box.h, box.y]);
  const bw = x(ops.bandWidth) - x(0) - 4;                            // 4 px gap between bands
  const bars = ops.bands.map(b => {
    const x0 = x(b.from) + 2;
    if (b.dug == null) return el('rect', { x: x0 + .75, y: y(b.alerts) + .75, width: bw - 1.5, height: y(0) - y(b.alerts) - .75, fill: 'none', stroke: t.c('muted'), 'stroke-width': 1.5, 'stroke-dasharray': '4 3' });
    return g({}, el('rect', { x: x0, y: y(b.dry), width: bw, height: y(0) - y(b.dry), fill: t.c('accent') }),
      el('rect', { x: x0, y: y(b.dug), width: bw, height: y(b.dry) - y(b.dug) - 1.5, fill: t.c('context') }));
  });
  const xt = x(T0), key = (fill, dash, label, value, yy) => g({},
    el('rect', { x: x(0.62), y: yy - 9, width: 18, height: 18, fill, stroke: dash ? t.c('muted') : null, 'stroke-dasharray': dash ? '3 2' : null }),
    textLines([label], { x: x(0.62) + 28, y: yy, size: 17, valign: 'middle', fill: t.c('ink') }),
    textLines([value], { x: box.x + box.w, y: yy, size: 17, anchor: 'end', valign: 'middle', fill: t.c('ink'), weight: 600, attrs: { 'font-variant-numeric': 'tabular-nums' } }));
  return svgRoot({ id: 'stakes-fig', width: W, height: H, title: 'Leak alerts in 2025 by score band, and what the excavations found',
    desc: `${count(undug + dug)} alerts. Below ${t2(T0)}: ${count(undug)} alerts, none excavated. At ${t2(T0)} and above: ${count(dug)} excavations, ${count(dry)} of them dry.` },
  axis(y, { orient: 'left', at: box.x, grid: [box.x, box.x + box.w], theme: t, size: 16, count: 4, format: v => count(v) }),
  textLines(['Alerts in 2025'], { x: 0, y: box.y - 22, size: 16, fill: t.c('muted') }),
  bars,
  el('line', { x1: box.x, x2: box.x + box.w, y1: y(0), y2: y(0), stroke: t.c('ink'), 'stroke-width': 1.2 }),
  axis(x, { orient: 'bottom', at: y(0), theme: t, size: 16, tickValues: [0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1], format: v => fmt(v, { digits: 1 }), tickSize: 5 }),
  textLines(['Leak score at alert'], { x: box.x + box.w, y: H - 8, size: 16, anchor: 'end', fill: t.c('muted') }),
  el('line', { x1: xt, x2: xt, y1: box.y - 56, y2: y(0), stroke: t.c('ink'), 'stroke-width': 1.5 }),
  textLines(['Not dug: outcome never recorded'], { x: xt - 12, y: box.y - 40, size: 17, anchor: 'end', fill: t.c('muted'), weight: 600 }),
  textLines(['Dug: outcome recorded'], { x: xt + 12, y: box.y - 40, size: 17, fill: t.c('ink'), weight: 600 }),
  key(t.c('context'), false, 'Leak found', count(dug - dry), y(560)),
  key(t.c('accent'), false, 'No leak found', count(dry), y(500)));
}

/** Page 3: how every flagged site got its reference label. Arrows mean "then". */
function designFigure() {
  return flowDiagram({
    id: 'design-fig', width: 800, height: 482, fontSize: 18, nodeMaxWidth: 250, direction: 'tb', gap: 40, crossGap: 48,
    title: 'Study flow: from flagged sites to reference labels',
    desc: `All ${sites.length} flagged sites were surveyed blind to the score. Leak noise at ${heard.length}; all ${heard.length} excavated: ${nLeak} leaks, ${dryHoles.length} dry. ${quiet.length} quiet sites were not excavated.`,
    nodes: [
      { id: 'flagged', label: 'Flagged sites', sub: `${sites.length} in ${study.district}, ${study.window}`, kind: 'terminal' },
      { id: 'survey', label: 'Blind acoustic survey', sub: `all ${sites.length}; crews never saw the score` },
      { id: 'heard', label: 'Leak noise heard', sub: `${heard.length} sites, all excavated` },
      { id: 'quiet', label: 'No leak noise', sub: `${quiet.length} sites → no leak`, muted: true },
      { id: 'leak', label: 'Leak found', sub: `${nLeak} sites → leak`, emphasis: true },
      { id: 'dry', label: 'Dry excavation', sub: `${dryHoles.length} sites → no leak` },
    ],
    edges: [['flagged', 'survey'], ['survey', 'heard'], ['survey', 'quiet'], ['heard', 'leak'], ['heard', 'dry']].map(([from, to]) => ({ from, to })),
  });
}

/** Page 4: every surveyed site on the score axis, split by what the survey found; today's rule on top (build 1). */
function ruleFigure() {
  const W = 1152, H = 482, r = 8, box = { x: 240, y: 74, w: 896, h: 340 };
  const x = linear([0, 1], [box.x, box.x + box.w]), xt = x(T0);
  const groups = [
    { key: 'leak', title: 'Leak found', sub: `${nLeak} sites, excavated`, list: sites.filter(s => s.leak), right: ['found', now.tp], left: ['missed', now.fn] },
    { key: 'none', title: 'No leak', sub: `${nNone} sites`, list: sites.filter(s => !s.leak), right: ['dry digs', now.fp], left: ['left alone', now.tn] },
  ];
  const yb = band(groups.map(gp => gp.key), [box.y, box.y + box.h], { inner: 0.16, outer: 0.02 });
  const tally = (value, word, xx, yy, anchor, fill) => el('text', { x: xx, y: yy, 'text-anchor': anchor === 'end' ? 'end' : null, fill },
    el('tspan', { 'font-size': 30, 'font-family': t.font('serif'), style: 'font-family:var(--ss-font-display)' }, String(value)),
    el('tspan', { 'font-size': 18, dx: 7 }, word));
  const rows = groups.map(gp => {
    const cy = yb.center(gp.key), swarm = beeswarm(gp.list.map(s => x(s.score)), { r, gap: 2 });
    const dot = (p, fill) => el('circle', { cx: p.x, cy: cy + p.y, r, fill, stroke: t.c('paper'), 'stroke-width': 1.5 });
    return {
      base: g({}, el('line', { x1: box.x, x2: box.x + box.w, y1: cy, y2: cy, stroke: t.c('grid') }),
        swarm.map(p => dot(p, t.c('context'))),
        textLines([gp.title], { x: 0, y: cy - 12, size: 21, fill: t.c('ink'), weight: 650 }),
        textLines([gp.sub], { x: 0, y: cy + 14, size: 17, fill: t.c('muted') })),
      rule: g({}, swarm.filter(p => gp.list[p.i].score >= T0).map(p => dot(p, t.c('accent'))),
        tally(gp.right[1], gp.right[0], xt + 14, yb(gp.key) + 30, 'start', t.c('accent')),
        tally(gp.left[1], gp.left[0], xt - 14, yb(gp.key) + 30, 'end', t.c('ink'))),
    };
  });
  return svgRoot({ id: 'rule-fig', width: W, height: H, title: `Leak scores of all ${sites.length} surveyed sites, by survey result, with today's threshold`,
    desc: `Threshold ${t2(T0)}: ${now.tp} leaks found, ${now.fn} missed, ${now.fp} dry digs, ${now.tn} no-leak sites left alone.` },
  rows.map(rw => rw.base),
  el('line', { x1: box.x, x2: box.x + box.w, y1: box.y + box.h, y2: box.y + box.h, stroke: t.c('ink'), 'stroke-width': 1.2 }),
  axis(x, { orient: 'bottom', at: box.y + box.h, theme: t, size: 16, tickValues: [0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1], format: v => fmt(v, { digits: 1 }), tickSize: 5 }),
  textLines(['Leak score'], { x: box.x + box.w, y: H - 8, size: 16, anchor: 'end', fill: t.c('muted') }),
  g({ 'data-step': 1, 'data-motion': 'reveal', 'data-duration': 600 },
    el('line', { x1: xt, x2: xt, y1: box.y - 50, y2: box.y + box.h, stroke: t.c('ink'), 'stroke-width': 1.5 }),
    textLines([`Crew sent at ${t2(T0)} or above`], { x: xt + 12, y: box.y - 34, size: 17, fill: t.c('ink'), weight: 600 }),
    textLines(['No crew below'], { x: xt - 12, y: box.y - 34, size: 17, anchor: 'end', fill: t.c('muted'), weight: 600 }),
    rows.map(rw => rw.rule)));
}

/** Page 5: the four rates of today's 2 × 2 table, with Wilson 95% intervals (squares sized by denominator). */
function accuracyFigure() {
  const rows = rates.map(r => ({ label: r.label, estimate: r.p * 100, low: r.lo * 100, high: r.hi * 100, weight: r.n, k: r.k, n: r.n }));
  return forestPlot({
    id: 'accuracy-fig', width: 1152, height: 430, fontSize: 18, rows, domain: [0, 100], highlight: rows[0].label,
    format: { digits: 0, suffix: '%' }, labelTitle: `At threshold ${t2(T0)}`, columnTitle: 'Sites · estimate (95% CI)',
    columnText: r => `${r.k} of ${r.n}   ${fmt(r.estimate, { digits: 0 })}%  (${fmt(r.low, { digits: 0 })}–${fmt(r.high, { digits: 0 })})`,
    title: `Accuracy of the leak score at threshold ${t2(T0)} with 95% intervals`,
    desc: `Sensitivity ${pc(sens.p)} (${pc(sens.lo)}–${pc(sens.hi)}), positive predictive value ${pc(ppv.p)}; the 2025 job records give ${pc(recordsPPV)}.`,
    // The forest plot lays rows out on band(labels, plot height, inner .2, outer .05); mark the job-record rate on the PPV row.
    extra: ({ x, box }) => {
      const yb = band(rows.map(r => r.label), [box.y, box.y + box.h], { inner: 0.2, outer: 0.05 }), cy = yb.center(rows[2].label), xr = x(recordsPPV * 100);
      return g({}, el('line', { x1: xr, x2: xr, y1: cy - 18, y2: cy + 18, stroke: t.c('ink'), 'stroke-width': 2 }),
        textLines([`2025 job records ${pc(recordsPPV)}`], { x: xr, y: cy + 24, size: 16, anchor: 'middle', valign: 'top', fill: t.c('ink') }));
    },
  });
}

/** Page 6: labels for the threshold widget's plot. The widget draws scores at x = 55 + 610·score and its
 *  axis at y = 300 in a 700 × 360 viewBox (assets/runtime/widgets.js); this overlay uses the same frame. */
function widgetAxis() {
  const X = v => 55 + 610 * v, s = 15.5;                            // 15.5 units ≈ 17 px at the plot's 1.1× scale
  return el('svg', { class: 'w-axis', viewBox: '0 0 700 360', 'aria-hidden': 'true' },
    [0, .25, .5, .75, 1].map(v => textLines([fmt(v, { digits: 2 })], { x: X(v), y: 322, size: s, anchor: 'middle', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } })),
    textLines(['Leak score'], { x: X(1), y: 350, size: s, anchor: 'end', fill: t.c('muted') }),
    el('circle', { cx: 64, cy: 20, r: 7, fill: t.c('accent') }), textLines(['Crew sent (score at or above the threshold)'], { x: 78, y: 20, size: s, valign: 'middle', fill: t.c('ink') }),
    el('circle', { cx: 444, cy: 20, r: 7, fill: t.c('context') }), textLines(['Not sent'], { x: 458, y: 20, size: s, valign: 'middle', fill: t.c('ink') }));
}

/** Page 8: cost of each threshold, in dry-dig equivalents, for three prices of a missed leak. */
function valueFigure() {
  const shade = [t.seq(2), t.seq(4), t.seq(6)];
  return lineChart({
    id: 'value-fig', width: 800, height: 482, xType: 'linear', x: inView.map(c => c.t), markers: 'all', endValues: false, fontSize: 17,
    series: R.map((r, k) => ({ name: `Miss = ${r} dry dig${r > 1 ? 's' : ''}`, values: inView.map(c => costOf(c, r)), color: shade[k] })),
    xFormat: v => fmt(v, { digits: 1 }), xTicks: 6, yDomain: [0, 70], unit: `Dry digs + R × missed leaks, per ${sites.length} sites`, xLabel: 'Threshold',
    title: 'Cost of each threshold in dry-dig equivalents, for three prices of a missed leak',
    desc: best.map((b, i) => `If a miss costs ${R[i]} dry digs, the cheapest threshold is ${t2(b.t)}.`).join(' '),
    extra: ({ x, y, box }) => g({},
      el('line', { x1: x(T0), x2: x(T0), y1: box.y, y2: box.y + box.h, stroke: t.c('muted'), 'stroke-width': 1.2, 'stroke-dasharray': '4 4' }),
      textLines([`today ${t2(T0)}`], { x: x(T0) + 6, y: box.y + 4, size: 16, valign: 'top', fill: t.c('muted') }),
      best.map((b, i) => g({ 'data-step': i + 1, 'data-motion': 'reveal' },
        el('circle', { cx: x(b.t), cy: y(costOf(b, R[i])), r: 9, fill: 'none', stroke: t.c('accent'), 'stroke-width': 2.5 }),
        textLines([`best ${t2(b.t)}`], { x: x(b.t), y: y(costOf(b, R[i])) + 30, size: 17, anchor: 'middle', fill: t.c('accent'), weight: 650, halo: t.c('paper') })))),
  });
}

// ------------------------------------------------------------------ the widget's live 2 × 2 readout
// The widget writes its state (threshold and counts) to data-state on every render; this script mirrors it.
const readoutScript = String.raw`
(() => {
  const root = document.getElementById('research-threshold'), out = document.getElementById('explore-readout');
  if (!root || !out) return;
  const pct = v => Number.isFinite(v) ? Math.round(v * 100) + '%' : '–';
  const set = (key, text) => { const el = out.querySelector('[data-k="' + key + '"]'); if (el) el.textContent = text; };
  const render = () => {
    let s; try { s = JSON.parse(root.dataset.state || '{}'); } catch { return; }
    const c = s.counts; if (!c) return;
    set('t', Number(s.threshold).toFixed(2)); set('tp', c.tp); set('fn', c.fn); set('fp', c.fp); set('tn', c.tn);
    set('sens', pct(c.tp / (c.tp + c.fn))); set('dry', pct(c.fp / (c.tp + c.fp)));
  };
  new MutationObserver(render).observe(root, { attributes: true, attributeFilter: ['data-state'] });
  render();
})();`;

// ------------------------------------------------------------------ pages
const cls = (layout = '') => `st cs-${SYSTEM} talk ${layout}`.trim();
const source = (left, right) => `<p class="st-source" data-region="source"><span>${left}</span><span>${right}</span></p>`;
const sources = [{ file: 'examples/research/data.json', status: 'illustrative' }];

export default {
  title: `Where should the crews dig? Leak score validation, ${study.district} 2026`,
  language: 'en', readingMode: 'live', transition: 'fade', sample: true,
  css: [frame, block, deckCSS].join('\n'),
  script: readoutScript,
  slides: [
    {
      id: 'question', title: 'Where should the crews dig?', className: cls('cover'),
      content: `<h1 class="cover-title" data-region="title">Where should the crews dig?</h1>
<p class="cover-lead" data-region="support">Testing the night-noise leak score against blind acoustic surveys at all ${sites.length} sites it flagged in ${h(study.district)}, ${h(study.window)}</p>
<p class="cover-by" data-region="source"><span><b>Mara Ellison</b> · Network Analytics, Northmoor Water</span><span>Water Loss Research Day · 12 November 2026</span></p>`,
      notes: `The decision is a line on a score. Today crews dig wherever the night-noise score reaches ${t2(T0)}. This talk asks whether that is the right line, and what we would need to know to move it. Everything here comes from one month in one district; the numbers are small on purpose and I will show their uncertainty.`,
      sources,
    },
    {
      id: 'stakes', className: cls('st--rail'),
      title: `In 2025 one excavation in ${WORDS[oneIn]} found no leak, and the ${count(undug)} alerts below ${t2(T0)} were never checked`,
      content: `<h1 class="st-head" data-region="title">In 2025 one excavation in ${WORDS[oneIn]} found no leak, and the ${count(undug)} alerts below ${t2(T0)} were never checked</h1>
<figure class="st-fig" data-region="primary">${alertsFigure()}</figure>
<div class="st-rail" data-region="support">
  <div class="st-kpi"><b class="st-accent num">${pc(dry / dug)}</b><span>of ${count(dug)} excavations found no leak: ${count(dry)} dry holes at £${count(ops.dryDigCost)} each, £${fmt(dry * ops.dryDigCost / 1e6, { digits: 2 })} million.</span></div>
  <hr class="st-rule">
  <div class="st-kpi"><b class="num">${count(undug)}</b><span>alerts scored below ${t2(T0)}. No crew was sent, so the records cannot say how many were leaks.</span></div>
</div>
${source(h(ops.source), 'Alerts by score band')}`,
      notes: `Job records only see one side of the rule. Above ${t2(T0)} we learn the outcome because we dig: ${count(dry)} of ${count(dug)} digs were dry. Below ${t2(T0)} we learn nothing, because we never look. That is why the records cannot tell us whether ${t2(T0)} is right, and why we ran a study that looked everywhere.`,
      sources,
    },
    {
      id: 'data', className: cls('st--rail'),
      title: `All ${sites.length} flagged sites were surveyed blind to the score; excavation confirmed ${nLeak} leaks`,
      content: `<h1 class="st-head" data-region="title">All ${sites.length} flagged sites were surveyed blind to the score; excavation confirmed ${nLeak} leaks</h1>
<figure class="st-fig" data-region="primary">${designFigure()}</figure>
<div class="st-rail" data-region="support">
  <div class="st-kpi"><b class="st-accent num">${nLeak}</b><span>reference leaks: leak noise heard, then found by excavation.</span></div>
  <hr class="st-rule">
  <div class="st-kpi"><b class="num">${nNone}</b><span>reference no-leaks: ${quiet.length} quiet sites and ${dryHoles.length} dry excavations.</span></div>
</div>
${source(`${SOURCE_STUDY} · score frozen at 06:00 on each survey day`, 'Study flow')}`,
      notes: `Population: every site the model flagged in ${study.district} in the window, so the study sees low scores as well as high ones. The survey team used a correlator and a ground microphone and never saw the score. Excavation followed wherever they heard leak noise. Quiet sites were not dug; I come back to that as a limit.`,
      sources,
    },
    {
      id: 'method', className: cls(),
      title: `At today's threshold of ${t2(T0)}, crews would reach ${now.tp} of the ${nLeak} leaks and dig ${now.fp} dry holes`,
      content: `<h1 class="st-head" data-region="title">At today’s threshold of ${t2(T0)}, crews would reach <em>${now.tp}</em> of the ${nLeak} leaks and dig ${now.fp} dry holes</h1>
<figure class="st-fig" data-region="primary">${ruleFigure()}</figure>
${source(`${SOURCE_STUDY} · one dot per site`, 'Strip plot by reference label')}`,
      notes: `First the observations: one dot per site, placed by its score, split by what the survey and excavation found. Leaks sit mostly to the right, but the two groups overlap between about 0.2 and 0.7. [Next] Then today's rule: everything at ${t2(T0)} or above gets a crew. Four counts fall out of that one line: ${now.tp} found, ${now.fn} missed, ${now.fp} dry, ${now.tn} correctly left alone.`,
      sources,
    },
    {
      id: 'result', className: cls(),
      title: `The score found ${pc(sens.p)} of leaks at ${t2(T0)}, but with ${nLeak} leaks the 95% interval runs from ${pc(sens.lo)} to ${pc(sens.hi)}`,
      content: `<h1 class="st-head" data-region="title">The score found <em>${pc(sens.p)}</em> of leaks at ${t2(T0)}, but with ${nLeak} leaks the 95% interval runs from ${pc(sens.lo)} to ${pc(sens.hi)}</h1>
<figure class="st-fig" data-region="primary">${accuracyFigure()}</figure>
${source(`${SOURCE_STUDY} · Wilson score intervals · area under the ROC curve ${fmt(AUC, { digits: 2 })}`, 'Interval plot')}`,
      notes: `Four rates from the same two-by-two table. The squares are sized by how many sites each rate rests on. The sensitivity interval is wide because it rests on ${nLeak} leaks. One check that the sample behaves like the network: ${pc(ppv.p)} of study digs found a leak, against ${pc(recordsPPV)} in the 2025 job records.`,
      sources,
    },
    {
      id: 'explore', className: cls(),
      title: `Between 0.30 and 0.60, each 0.05 step down finds one more leak and adds ${stepDry[0]} to ${stepDry[1]} dry digs`,
      content: `<h1 class="st-head" data-region="title">Between 0.30 and 0.60, each 0.05 step down finds one more leak and adds ${stepDry[0]} to ${stepDry[1]} dry digs</h1>
<div class="widget" data-interactive="" id="research-threshold" data-region="primary"><div class="w-plot"></div><div class="w-controls"></div><output aria-live="polite" class="w-status"></output></div>
${widgetAxis()}
<div class="readout" id="explore-readout" data-region="support">
  <table><thead><tr><td></td><th scope="col">Crew sent</th><th scope="col">Not sent</th></tr></thead>
  <tbody><tr><th scope="row">Leak</th><td class="sent"><b data-k="tp">${now.tp}</b>found</td><td><b data-k="fn">${now.fn}</b>missed</td></tr>
  <tr><th scope="row">No leak</th><td class="sent"><b data-k="fp">${now.fp}</b>dry digs</td><td><b data-k="tn">${now.tn}</b>left alone</td></tr></tbody></table>
  <p>Threshold <b data-k="t">${t2(T0)}</b>: <b data-k="sens">${pc(sens.p)}</b> of leaks found, <b data-k="dry">${pc(now.fp / now.digs)}</b> of digs dry</p>
</div>
${source(`${SOURCE_STUDY} · counts recomputed from the same ${sites.length} scores`, 'Interactive threshold')}`,
      notes: `Move the threshold and watch the two right-hand cells. Going down from 0.60 to 0.30, each step picks up exactly one more leak, and two to five more dry digs. Going up, dry digs vanish quickly but leaks go with them. The static handout keeps today's ${t2(T0)}; the next page has the other thresholds as a table.`,
      sources,
      widgets: [{ id: 'research-threshold', kind: 'threshold', initial: { threshold: T0 }, data: { values: scores, labels: leaks } }],
    },
    {
      id: 'compare', className: cls(),
      title: `Finding all ${nLeak} leaks would take a threshold of ${t2(findAll.t)} and ${findAll.fp} dry digs, ${fmt(findAll.fp / now.fp, { digits: 1 })} times today's ${now.fp}`,
      content: `<h1 class="st-head" data-region="title">Finding all ${nLeak} leaks would take a threshold of ${t2(findAll.t)} and ${findAll.fp} dry digs, ${fmt(findAll.fp / now.fp, { digits: 1 })} times today’s ${now.fp}</h1>
<table class="tbl" data-region="primary"><thead><tr><th scope="col">Threshold</th><th scope="col">Crews sent</th><th scope="col">Leaks found<br>of ${nLeak}</th><th scope="col">Leaks missed</th><th scope="col">Dry digs</th><th scope="col">Share of digs<br>that were dry</th></tr></thead>
<tbody>${compareRows.map(c => `<tr class="${c.t === T0 ? 'today' : c === compareRows[0] ? 'focus' : ''}"><th scope="row">${t2(c.t)}${c.t === T0 ? '<span>today</span>' : ''}</th><td>${c.digs}</td><td${c.fn === 0 ? ' class="key"' : ''}>${c.tp}</td><td>${c.fn}</td><td${c.fn === 0 ? ' class="key"' : ''}>${c.fp}</td><td>${c.digs ? pc(c.fp / c.digs) : '–'}</td></tr>`).join('')}</tbody></table>
${source(`${SOURCE_STUDY} · counts per ${sites.length} flagged sites`, 'Threshold comparison')}`,
      notes: `The static version of the previous page. Read the dry-digs column against the leaks-found column: from ${t2(T0)} down to ${t2(findAll.t)} we gain ${findAll.tp - now.tp} leaks for ${findAll.fp - now.fp} extra dry digs. Whether that is worth it is not a statistical question; it is the next page.`,
      sources,
    },
    {
      id: 'value', className: cls('st--rail'),
      title: `If a missed leak costs as much as ${R.join(', ').replace(/, (?=[^,]*$)/, ' or ')} dry digs, the best threshold is ${best.map(b => t2(b.t)).join(', ').replace(/, (?=[^,]*$)/, ' or ')}`,
      content: `<h1 class="st-head" data-region="title">If a missed leak costs as much as ${R.join(', ').replace(/, (?=[^,]*$)/, ' or ')} dry digs, the best threshold is <em>${best.map(b => t2(b.t)).join(', ').replace(/, (?=[^,]*$)/, ' or ')}</em></h1>
<figure class="st-fig" data-region="primary">${valueFigure()}</figure>
<div class="st-rail" data-region="support">
  <div class="st-kpi"><b class="num">${fmt(missedFlow, { digits: 1 })} m³/h</b><span>median flow of the ${now.fn} leaks missed at ${t2(T0)}, against ${fmt(foundFlow, { digits: 1 })} m³/h for the ${now.tp} found. Quiet leaks are small leaks.</span></div>
  <hr class="st-rule">
  <p class="st-text">What one missed leak is worth in dry digs, R, sets the threshold. This study did not measure it.</p>
</div>
${source(`${SOURCE_STUDY} · cost = dry digs + R × missed leaks`, 'Cost curves')}`,
      notes: `Put a price on each kind of error and the threshold choice becomes arithmetic. If a missed leak is worth one dry dig, ${t2(best[0].t)} is cheapest; at three, ${t2(best[1].t)}; at six, ${t2(best[2].t)}. The flows matter here: the leaks the score misses are the quiet ones, a median ${fmt(missedFlow, { digits: 1 })} cubic metres an hour. So R may be low, but we have not measured it.`,
      sources,
    },
    {
      id: 'limits', className: cls(),
      title: 'Three limits keep this study from setting the threshold on its own',
      content: `<h1 class="st-head st-one" data-region="title">Three limits keep this study from setting the threshold on its own</h1>
<ol class="limits" data-region="primary">
  <li><b class="num">${nLeak} leaks</b><div><h2>Too few leaks for a precise rate</h2><p>Sensitivity at ${t2(T0)} could be anywhere from ${pc(sens.lo)} to ${pc(sens.hi)}, a ${fmt((sens.hi - sens.lo) * 100, { digits: 0 })}-point range. Every comparison between thresholds inherits that width.</p></div></li>
  <li><b class="num">1 district</b><div><h2>One district, one month</h2><p>${h(study.district)} in March: wet ground and busy night-time pumping. Summer nights and plastic mains carry leak noise differently.</p></div></li>
  <li><b class="num">${quiet.length} sites</b><div><h2>Quiet sites were not excavated</h2><p>A leak the survey team could not hear is counted as no leak, so the true sensitivity may be lower than ${pc(sens.p)}.</p></div></li>
</ol>
${source(SOURCE_STUDY, 'Study limits')}`,
      notes: 'Each limit has a size. The first is statistical and the next study can buy it down. The second is about where the result applies. The third is about the reference standard itself: excavating a sample of quiet sites would tell us how many leaks the survey misses.',
      sources,
    },
    {
      id: 'next', className: cls(),
      title: `Before the threshold moves, the next study must price a missed leak and confirm about ${leaksNeeded} leaks`,
      content: `<h1 class="st-head" data-region="title">Before the threshold moves, the next study must price a missed leak and confirm about ${leaksNeeded} leaks</h1>
<div class="next" data-region="primary">
  <section><h2>What a missed leak is worth</h2><b class="st-accent num">${t2(best[0].t)} → ${t2(best.at(-1).t)}</b><p>The best threshold moves this far as R goes from ${R[0]} to ${R.at(-1)}. Log flow and run time for every confirmed leak, and agree a value per cubic metre with finance.</p></section>
  <section><h2>How many leaks to confirm</h2><b class="num">${leaksNeeded} leaks</b><p>Enough for ±10 points on sensitivity, against ±${fmt((sens.hi - sens.lo) * 50, { digits: 0 })} now: about ${count(sitesNeeded)} flagged sites at ${h(study.district)}’s leak rate of ${pc(nLeak / sites.length)}.</p></section>
  <section><h2>Where and when to sample</h2><b class="num">3 × 2</b><p>Three districts, winter and summer, cast-iron and plastic mains, with a sample of quiet sites excavated to check the survey.</p></section>
</div>
${source(`${SOURCE_STUDY} · sample size by normal approximation`, 'Next study')}`,
      notes: `The order matters. Without R, a more precise study still cannot choose a threshold. With R and about ${leaksNeeded} confirmed leaks, the choice becomes a calculation we can defend to the regulator and to the crews.`,
      sources,
    },
  ],
};
