// Figure engine: primitives, scales, text, statistics and every chart/diagram renders a
// finite, uniquely-identified, accessible SVG from small but realistic data.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import * as F from '../assets/runtime/figure.mjs';
import { ROOT } from '../scripts/craft-core.mjs';

test('box plots reserve space for tied observations and reject cramped explicit heights', () => {
  for (const count of [30, 40, 100]) for (const groupCount of [1, 2]) {
    const options = { id: 'ties', title: 'Tied observations', groups: Array.from({ length: groupCount }, (_, i) => ({ label: String(i), values: Array(count).fill(1) })) };
    const svg = F.boxPlot(options);
    const height = Number(svg.match(/viewBox="0 0 [\d.]+ ([\d.]+)"/)[1]);
    const circles = [...svg.matchAll(/<circle[^>]*cy="([\d.-]+)"[^>]*r="3.2"/g)];
    assert.equal(circles.length, count * groupCount);
    for (const [, cy] of circles) assert(Number(cy) >= 3.2 && Number(cy) <= height - 3.2);
    for (const m of svg.matchAll(/<rect[^>]*y="([\d.-]+)"[^>]*height="([\d.-]+)"/g)) assert(Number(m[1]) >= 0 && Number(m[1]) + Number(m[2]) <= height);
    assert.throws(() => F.boxPlot({ ...options, height: 200 }), /height must be at least/);
  }
});

const finite = svg => !/NaN|Infinity|undefined/.test(svg);
const ids = svg => [...svg.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
function checkSvg(name, svg) {
  assert.equal(typeof svg, 'string', `${name}: returns a string`);
  assert.match(svg, /^<svg[^>]*\bxmlns="http:\/\/www\.w3\.org\/2000\/svg"/, `${name}: root svg with xmlns`);
  assert(finite(svg), `${name}: no NaN/Infinity/undefined in output`);
  assert.match(svg, /<title[^>]*>[^<]+<\/title>/, `${name}: has a title`);
  const list = ids(svg);
  assert.equal(new Set(list).size, list.length, `${name}: ids are unique`);
  for (const ref of svg.matchAll(/url\(#([^)]+)\)/g)) assert(list.includes(ref[1]), `${name}: url(#${ref[1]}) resolves`);
}

test('el() escapes text, merges data-states objects and rejects object children', () => {
  const out = F.el('text', { x: 1, 'data-label': 'a<b & "c"' }, F.esc('x < y & z'));
  assert(out.includes('data-label="a&lt;b &amp; &quot;c&quot;"'));
  assert(out.includes('>x &lt; y &amp; z<'));
  assert.equal(F.el('g', {}, '<rect/>'), '<g><rect/></g>', 'children are trusted markup');
  const states = F.el('g', { 'data-states': { 0: { opacity: 0 }, 2: { opacity: 1 } } });
  const json = /data-states="([^"]+)"/.exec(states)[1].replace(/&quot;/g, '"');
  assert.deepEqual(JSON.parse(json), { 0: { opacity: 0 }, 2: { opacity: 1 } });
  assert.throws(() => F.el('g', {}, { fill: 'red' }));
});

test('theme() emits CSS variables with fallbacks, or literal colors from a color system', async () => {
  const css = F.theme('css');
  assert.match(css.c('ink'), /^var\(--ss-ink,#[0-9a-f]{6}\)$/i);
  assert.match(css.cat(0), /^var\(--ss-cat-1,/);
  const system = JSON.parse(await fs.readFile(path.join(ROOT, 'assets/color-systems/laboratory.json'), 'utf8'));
  const lit = F.theme(system);
  assert.equal(lit.c('ink').toLowerCase(), system.tokens.ink.toLowerCase());
  assert(!lit.c('accent').includes('var('));
  assert.throws(() => css.c('no-such-role'));
});

test('scales map, invert and produce nice ticks', () => {
  const y = F.linear([0, 87], [400, 0], { nice: true });
  assert.deepEqual(y.domain, [0, 100]);
  assert.equal(y(50), 200);
  assert.equal(y.invert(100), 75);
  assert.deepEqual(F.ticks(0, 1, 5), [0, 0.2, 0.4, 0.6, 0.8, 1]);
  assert.deepEqual(F.niceDomain([3.2, 97.5]), [0, 100]);
  const b = F.band(['a', 'b', 'c'], [0, 300]);
  assert(b('a') < b('b') && b('b') < b('c'));
  assert(Math.abs(b.center('b') - 150) < 1e-9);
  assert.throws(() => F.band(['a', 'a'], [0, 1]));
  const l = F.log([1, 1000], [0, 300]);
  assert.equal(l(10), 100);
  assert(l.ticks().includes(100));
});

test('fmt() uses a real minus sign, explicit plus, locale grouping and compact forms', () => {
  assert.equal(F.fmt(-1.5), '−1.5');
  assert.equal(F.fmt(2.25, { sign: true }), '+2.25');
  assert.equal(F.fmt(0, { sign: true }), '0');
  assert.equal(F.fmt(1234567, { digits: 0 }), '1,234,567');
  assert.equal(F.pct(0.256, 1), '25.6%');
  assert.equal(F.fmt(12300, { compact: true }), '12.3K');
  assert.equal(F.fmt(NaN), '—');
});

test('text measurement and wrapping keep CJK phrases and kinsoku intact', () => {
  assert(F.measureText('WWWW', 20) > F.measureText('iiii', 20));
  assert(Math.abs(F.measureText('日本語', 20) - 60) < 1);
  const lines = F.wrapText('A deliberately long label that has to wrap onto several lines', 180, 16);
  assert(lines.length >= 3);
  for (const line of lines) assert(F.measureText(line, 16) <= 180 + 1, `fits: ${line}`);
  const ja = F.wrapText('加重平均は、人数で重みをつけた平均です。単純平均とは結果が異なります。', 200, 20);
  assert(ja.length >= 2);
  for (const line of ja.slice(1)) assert(!/^[、。）」]/.test(line), `no line starts with closing punctuation: ${line}`);
  assert.equal(ja.join(''), '加重平均は、人数で重みをつけた平均です。単純平均とは結果が異なります。');
});

test('statistics match hand-computed values', () => {
  assert.equal(F.mean([1, 2, 3, 4]), 2.5);
  assert(Math.abs(F.sd([2, 4, 4, 4, 5, 5, 7, 9]) - 2.138) < 1e-3);
  assert.equal(F.median([5, 1, 3]), 3);
  const fit = F.linearFit([[0, 1], [1, 3], [2, 5], [3, 7]]);
  assert(Math.abs(fit.slope - 2) < 1e-9 && Math.abs(fit.intercept - 1) < 1e-9);
  const c = F.confusionAt([0.9, 0.8, 0.3, 0.2], [1, 0, 1, 0], 0.5);
  assert.deepEqual([c.tp, c.fp, c.fn, c.tn], [1, 1, 1, 1]);
  const roc = F.rocPoints([0.9, 0.8, 0.7, 0.1], [1, 1, 0, 0]);
  assert(Math.abs(F.auc(roc) - 1) < 1e-9);
  const r = F.rng(7), a = [r(), r(), r()], r2 = F.rng(7);
  assert.deepEqual(a, [r2(), r2(), r2()]);
});

test('waterfall totals are validated against the running sum', () => {
  const ok = F.waterfallChart({ id: 'wf-ok', title: 'Bridge', width: 800, height: 400, data: [
    { label: 'Plan', value: 100, total: true }, { label: 'Price', value: 12 }, { label: 'Volume', value: -7 }, { label: 'Actual', value: 105, total: true }] });
  checkSvg('waterfall', ok);
  assert.throws(() => F.waterfallChart({ id: 'wf-bad', title: 'Bridge', width: 800, height: 400, data: [
    { label: 'Plan', value: 100, total: true }, { label: 'Price', value: 12 }, { label: 'Actual', value: 150, total: true }] }));
});

test('every chart and diagram renders a valid, accessible SVG', () => {
  const W = 900, H = 460, base = name => ({ id: `t-${name}`, title: `${name} test`, desc: 'Synthetic data.', width: W, height: H });
  const values = Array.from({ length: 40 }, (_, i) => 50 + 20 * Math.sin(i * 1.7) + (i % 7));
  const scores = Array.from({ length: 60 }, (_, i) => ((i * 37) % 100) / 100), labels = scores.map((s, i) => (s + ((i * 13) % 30) / 100 > 0.6 ? 1 : 0));
  const cases = {
    barChart: { data: [{ label: 'North', value: 42 }, { label: 'South', value: 18 }, { label: 'East', value: 27 }], highlight: 'North' },
    columnChart: { data: [{ label: '2023', value: 12 }, { label: '2024', value: 19 }, { label: '2025', value: 23 }] },
    groupedBarChart: { categories: ['Q1', 'Q2', 'Q3'], series: [{ name: 'Plan', values: [10, 12, 14] }, { name: 'Actual', values: [9, 13, 15] }] },
    stackedBarChart: { categories: ['A site', 'B site'], series: [{ name: 'Landfill', values: [10, 4] }, { name: 'Recycled', values: [6, 9] }] },
    divergingBarChart: { data: [{ label: 'Ops', value: 4.2 }, { label: 'Sales', value: -3.1 }, { label: 'R&D', value: 1.4 }] },
    dumbbellChart: { data: [{ label: 'Chemistry', a: 410, b: 612 }, { label: 'Library', a: 160, b: 164 }], aLabel: '2015', bLabel: '2025' },
    slopeChart: { data: [{ label: 'Year 1', a: 72, b: 75 }, { label: 'Year 2', a: 66, b: 71 }, { label: 'Year 3', a: 66, b: 65 }] },
    dotPlot: { data: [{ label: 'Clinic A', values: { before: 31, after: 24 } }, { label: 'Clinic B', values: { before: 28, after: 26 } }], series: ['before', 'after'] },
    lollipopChart: { data: [{ label: 'Pumps', value: 0.31 }, { label: 'Valves', value: 0.12 }] },
    bulletChart: { data: [{ label: 'Revenue', sub: '€m', value: 18.4, target: 18, ranges: [12, 16, 20] }] },
    waffleChart: { value: 37, total: 100 },
    unitChart: { groups: [{ label: 'Answered', count: 24, highlight: true }, { label: 'Missed', count: 16 }] },
    donutChart: { data: [{ label: 'Staff', value: 61 }, { label: 'Rent', value: 22 }, { label: 'Other', value: 17 }] },
    lineChart: { x: [2019, 2020, 2021, 2022, 2023], series: [{ name: 'Wind', values: [3, 4, 6, 7, 9] }, { name: 'Gas', values: [9, 8, 8, 7, 5] }], highlight: 'Wind' },
    areaChart: { x: [1, 2, 3, 4], series: [{ name: 'Load', values: [5, 7, 6, 8] }] },
    smallMultiples: { x: [1, 2, 3, 4], panels: [{ title: 'Oslo', values: [1, 2, 3, 4] }, { title: 'Lyon', values: [2, 2, 3, 5] }, { title: 'Turin', values: [4, 3, 2, 2] }] },
    ganttChart: { tasks: [{ label: 'Design', start: 0, end: 4 }, { label: 'Build', start: 3, end: 9 }, { label: 'Launch', start: 9, end: 9, milestone: true }], ticks: [0, 3, 6, 9] },
    timelineChart: { events: [{ at: 0, label: '09:12', title: 'Alert' }, { at: 12, label: '09:24', title: 'Rollback' }, { at: 31, label: '09:43', title: 'Recovered' }] },
    funnelChart: { stages: [{ label: 'Leads', value: 4820 }, { label: 'Qualified', value: 1510 }, { label: 'Proposals', value: 310 }, { label: 'Won', value: 98 }] },
    sankeyChart: { nodes: [{ id: 'a', label: 'Grid' }, { id: 'b', label: 'Homes' }, { id: 'c', label: 'Industry' }], links: [{ source: 'a', target: 'b', value: 40 }, { source: 'a', target: 'c', value: 60 }] },
    histogram: { values, bins: 8 },
    ecdfChart: { series: [{ name: 'Before', values }, { name: 'After', values: values.map(v => v * 0.9) }] },
    boxPlot: { groups: [{ label: 'Line 1', values }, { label: 'Line 2', values: values.map(v => v + 6) }] },
    violinPlot: { groups: [{ label: 'Line 1', values }, { label: 'Line 2', values: values.map(v => v - 4) }] },
    stripPlot: { groups: [{ label: 'Line 1', values }, { label: 'Line 2', values: values.map(v => v + 2) }] },
    errorBarChart: { groups: [{ label: 'Control', values }, { label: 'Treated', values: values.map(v => v + 5) }] },
    forestPlot: { rows: [{ label: 'Site 1', estimate: -1.2, low: -2.0, high: -0.4, weight: 30 }, { label: 'Site 2', estimate: -0.6, low: -1.5, high: 0.3, weight: 20 }], reference: 0 },
    scatterPlot: { points: values.map((v, i) => ({ x: i, y: v })), fit: 'linear' },
    heatmap: { rows: ['Jan', 'Feb'], cols: ['M1', 'M2', 'M3'], values: [[100, 82, 75], [100, 85, 79]] },
    confusionMatrix: { labels: ['Healthy', 'Failing'], matrix: [[880, 31], [12, 77]] },
    rocCurve: { curves: [{ name: 'Model', scores, labels }] },
    prCurve: { curves: [{ name: 'Model', scores, labels }] },
    calibrationChart: { probs: scores, labels },
    residualPlot: { points: values.map((v, i) => ({ x: i, residual: v - 55 })) },
    learningCurve: { sizes: [50, 100, 200, 400], train: [{ mean: 0.9, sd: 0.02 }, { mean: 0.88, sd: 0.02 }, { mean: 0.87, sd: 0.01 }, { mean: 0.86, sd: 0.01 }], val: [{ mean: 0.7, sd: 0.04 }, { mean: 0.76, sd: 0.03 }, { mean: 0.8, sd: 0.02 }, { mean: 0.82, sd: 0.02 }] },
    flowDiagram: { nodes: [{ id: 'a', label: 'Intake' }, { id: 'b', label: 'Review', kind: 'decision' }, { id: 'c', label: 'Approve' }, { id: 'd', label: 'Return' }], edges: [{ from: 'a', to: 'b' }, { from: 'b', to: 'c', label: 'ok' }, { from: 'b', to: 'd', label: 'missing' }] },
    treeDiagram: { root: { label: 'Operating profit', children: [{ label: 'Revenue', children: [{ label: 'Price' }, { label: 'Volume' }] }, { label: 'Cost' }] } },
    sequenceDiagram: { actors: ['Card', 'Gate', 'Bank'], messages: [{ from: 'Card', to: 'Gate', label: 'tap' }, { from: 'Gate', to: 'Bank', label: 'authorise', kind: 'async' }, { from: 'Bank', to: 'Gate', label: 'approved', kind: 'reply' }] },
    networkDiagram: { nodes: [{ id: 'a', label: 'Hub' }, { id: 'b', label: 'North' }, { id: 'c', label: 'South' }], edges: [{ from: 'a', to: 'b' }, { from: 'a', to: 'c' }], layout: 'star' },
    quadrantChart: { quadrants: ['Quick wins', 'Big bets', 'Fill-ins', 'Avoid'], items: [{ label: 'Bundle offers', x: 0.8, y: 0.7 }, { label: 'New region', x: 0.3, y: 0.9 }], x: 'Ease', y: 'Impact' },
    cycleDiagram: { steps: [{ label: 'Plan' }, { label: 'Do' }, { label: 'Check' }, { label: 'Act' }] },
    bipartiteDiagram: { left: ['Team A', 'Team B'], right: ['API', 'Data'], links: [['Team A', 'API'], ['Team B', 'Data']] },
    layerDiagram: { layers: [{ label: 'Edge', items: ['CDN', 'Gateway'] }, { label: 'Services', items: ['Pricing', 'Checkout'] }] },
    matrixDiagram: { rows: ['Plan', 'Build'], cols: ['PM', 'Eng'], cells: [['A', 'C'], ['I', 'R']] },
  };
  for (const [name, spec] of Object.entries(cases)) {
    assert.equal(typeof F[name], 'function', `${name} is exported`);
    let svg;
    try { svg = F[name]({ ...base(name), ...spec }); } catch (e) { throw Error(`${name}: ${e.message}`); }
    checkSvg(name, svg);
  }
});

test('figures build motion attributes and keep a complete final state', () => {
  const svg = F.barChart({ id: 'mv', title: 'Motion', width: 800, height: 300, data: [{ label: 'A', value: 3 }, { label: 'B', value: 5 }], build: { start: 1, motion: 'grow-x', stagger: 80 } });
  assert.match(svg, /data-step="1"/);
  assert.match(svg, /data-motion="grow-x"/);
  const literal = F.barChart({ id: 'lit', title: 'Literal', width: 800, height: 300, data: [{ label: 'A', value: 3 }], theme: { ink: '#111111', accent: '#c81e1e' } });
  assert(!literal.includes('var(--ss-'), 'literal themes contain no CSS variables');
});
