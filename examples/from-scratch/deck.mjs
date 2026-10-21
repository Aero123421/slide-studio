// Worked example · A deck derived from a brief, without a template.
//
// Four pages for a transit board: make a trial bus lane permanent. Nothing here comes
// from a layout pack; each page's form follows from the question the board will ask.
// The code is in the order of the derivation the README walks through:
//   1. Brief        who decides what, where, in how long          → `brief`
//   2. Claims       one sentence per page, computed from the data → `claims`
//   3. Evidence     the figure that proves each claim             → the figure functions
//   4. Composition  regions on a 12-column grid made with kit.mjs → `cols`, `span`
import fs from 'node:fs/promises';
import { h, grid, position } from '../../assets/runtime/kit.mjs';
import { theme, el, g, svgRoot, textLines, linear, niceDomain, spreadLabels, lineChart, barChart, fmt, sum } from '../../assets/runtime/figure.mjs';

// ------------------------------------------------------------------ 1 · brief
const brief = {
  requester: 'Dana Okafor, Director of Service Planning, Kestrel Bay Transit',
  audience: 'Transit Board: seven members who know Route 14 but have not seen the trial data',
  decision: 'Make the Harbour Street bus lane permanent and fund the works',
  setting: 'Board meeting, 26 November 2026: five minutes, projected, then filed with the minutes',
  condition: 'When the trial was approved, the board capped added car delay at 2 minutes at the peak',
};

// ------------------------------------------------------------------ data (fictional)
const trial = { street: 'Harbour Street', km: 1.9, route: '14', lane: [7, 19], weeks: 12,
  period: '2 March–22 May 2026', baseline: 'the same 12 weeks of 2025' };
// Route 14 northbound, Quay Road to Station Avenue: median minutes by departure hour, weekdays.
const hours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
const bus = {
  before: [6.6, 8.9, 11.4, 9.6, 8.1, 7.9, 8.3, 8.4, 8.2, 8.6, 10.9, 12.8, 10.6, 8.4, 7.0],   // 2025
  trial: [6.5, 7.1, 7.8, 7.4, 7.0, 6.9, 7.1, 7.2, 7.1, 7.3, 7.9, 8.2, 7.7, 8.2, 6.9],        // 2026, lane 7:00–19:00
};
// Evening peak hour (17:00–18:00): median car minutes on each affected street, and cars counted.
const streets = [
  { label: 'Harbour Street, general lane', before: 6.9, trial: 8.5, cars: 820 },
  { label: 'Station Avenue', before: 4.8, trial: 5.9, cars: 560 },
  { label: 'Quay Road', before: 5.2, trial: 6.1, cars: 640 },
  { label: 'Mill Lane', before: 3.9, trial: 4.3, cars: 310 },
];
const BOARD_LIMIT = 2.0;        // minutes of added car delay allowed at the peak
const PEAK_RIDERS = 1340;       // Route 14 riders crossing the corridor, 17:00–18:00
const OCCUPANCY = 1.2;          // people per car, 2025 cordon count
const works = [                 // permanent works, US dollars, engineer's estimate
  { item: 'Red surfacing, 1.9 km both directions', cost: 68000 },
  { item: 'Two enforcement cameras', cost: 54000 },
  { item: 'Bus priority at three signals', cost: 41000 },
  { item: 'Signs and road markings', cost: 22000 },
];
const FUND = { name: '2026–27 bus priority capital line', unallocated: 240000 };
const schedule = [               // ISO dates; the first entry is the decision
  { label: 'Board decision', start: '2026-11-26', milestone: true },
  { label: 'Design and procurement', start: '2026-11-30', end: '2027-01-22' },
  { label: 'Night works', start: '2027-02-01', end: '2027-03-19' },
  { label: 'Cameras commissioned', start: '2027-03-22', end: '2027-04-02' },
  { label: 'Opens with the spring timetable', start: '2027-04-06', milestone: true },
];

// ------------------------------------------------------------------ 2 · claims, computed
const inLane = hr => hr >= trial.lane[0] && hr < trial.lane[1];
const change = hours.map((hr, i) => ({ hr, d: bus.trial[i] - bus.before[i] }));
const peak = change.filter(c => inLane(c.hr)).reduce((a, b) => (b.d < a.d ? b : a));      // largest saving
const offLane = Math.max(...change.filter(c => !inLane(c.hr)).map(c => Math.abs(c.d)));   // outside lane hours
const delays = streets.map(s => ({ ...s, value: +(s.trial - s.before).toFixed(1) }));
const worst = delays.reduce((a, b) => (b.value > a.value ? b : a));
const saved = PEAK_RIDERS * -peak.d;                                                        // person-minutes
const lost = sum(delays.map(s => s.cars * OCCUPANCY * s.value));
const cost = sum(works.map(w => w.cost));
const day = iso => Date.parse(iso + 'T00:00:00Z') / 864e5;
const opening = schedule.at(-1), decision = schedule[0];
const check = (ok, message) => { if (!ok) throw Error(`Claim no longer holds: ${message}`); };
check(delays.every(s => s.value <= BOARD_LIMIT), 'every street stays inside the board limit');
check(offLane <= 0.25, 'outside lane hours the bus times did not change');
check(cost <= FUND.unallocated, 'the works fit the unallocated capital line');

const hhmm = hr => `${hr}:00`;
const min = v => fmt(v, { digits: 1 });
const usd = v => fmt(v, { digits: 0, prefix: '$' });
const hundreds = v => fmt(Math.round(v / 100) * 100, { digits: 0 });
const longDate = iso => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

// <em> marks the phrase that names the page's one accented mark; titles drop the markup.
const claims = {
  ask: `Make the ${trial.street} bus lane permanent`,
  buses: `With the lane in force, Route ${trial.route} crossed ${trial.street} up to <em>${min(-peak.d)} minutes faster</em>; outside lane hours nothing changed`,
  cars: `Car journeys on the four affected streets slowed by at most <em>${min(worst.value)} minutes</em> at the peak, inside the board’s ${fmt(BOARD_LIMIT, { digits: 0 })}-minute limit`,
  cost: `Permanent works cost ${usd(cost)}; approved today, the lane opens with the spring timetable on <em>${longDate(opening.start).replace(/ \d{4}$/, '')}</em>`,
};
const plain = html => html.replace(/<[^>]+>/g, '');

// ------------------------------------------------------------------ 4 · composition grid
// 1280 × 720 page, 64 px margins, 12 columns of 74 px with 24 px gutters. `span(first, n)`
// returns the box covering n columns; every region below is placed with it.
const cols = grid({ x: 64, y: 0, width: 1152, height: 720, columns: 12, gap: 24 });
const span = (first, n, y, height) => ({ x: cols[first].x, y, w: cols[first + n - 1].x + cols[first + n - 1].w - cols[first].x, h: height });
const FIG = { top: 176, bottom: 658 };                                  // evidence band shared by pages 2–4
const at = box => `style="${position(box)}"`;
const atTop = box => `style="left:${box.x}px;top:${box.y}px;width:${box.w}px"`;   // height follows the content

// ------------------------------------------------------------------ 3 · evidence
const t = theme();

/** Page 2: a time-of-day profile, because the question is *when* the lane helps. */
function busFigure(box) {
  const x = hours.map(hhmm);
  return lineChart({
    id: 'bus-fig', width: box.w, height: box.h, x, xEvery: 2, fontSize: 18, unit: 'Median minutes, Quay Road to Station Avenue',
    series: [{ name: '2025', values: bus.before, color: t.c('muted') }, { name: 'Trial 2026', values: bus.trial }],
    highlight: 'Trial 2026', yDomain: niceDomain([Math.min(...bus.trial, ...bus.before), Math.max(...bus.before, ...bus.trial)], 4), format: { digits: 1 }, endValues: false,
    bands: [{ from: hhmm(trial.lane[0]), to: hhmm(trial.lane[1]), label: `Lane in force, ${hhmm(trial.lane[0])}–${hhmm(trial.lane[1])}` }],
    // The claim is the gap at the peak hour, so mark the gap itself: a difference line through the two points,
    // labelled in the empty band between the lines.
    extra: ({ x, y }) => { const i = hours.indexOf(peak.hr), between = bus.trial[i] + (bus.before[i] - bus.trial[i]) * 0.25;
      return g({ 'data-step': 1, 'data-motion': 'reveal', 'data-delay': 500 },
        el('line', { x1: x(i), x2: x(i), y1: y(bus.before[i]) + 6, y2: y(bus.trial[i]) - 6, stroke: t.c('accent'), 'stroke-width': 2.4, 'stroke-dasharray': '1 5', 'stroke-linecap': 'round' }),
        textLines([`${min(-peak.d)} min`], { x: x(i) - 12, y: y(between), size: 19, anchor: 'end', valign: 'middle', fill: t.c('accent'), weight: 650, halo: t.c('paper') })); },
    build: { start: 0, by: 'series' },
    title: `Route ${trial.route} travel time across ${trial.street} by hour, 2025 and trial 2026`,
    desc: `During lane hours the trial line runs below 2025 at every hour; the gap peaks at ${min(-peak.d)} minutes at ${hhmm(peak.hr)}. Before ${hhmm(trial.lane[0])} and from ${hhmm(trial.lane[1])} the lines meet.`,
  });
}

/** Page 3: one bar per street against the board's limit, because the condition is a cap on change. */
function carFigure(box) {
  return barChart({
    id: 'car-fig', width: box.w, height: box.h, data: delays, sort: 'desc', highlight: worst.label, fontSize: 18,
    domain: [0, BOARD_LIMIT * 1.25], barRatio: 0.46, format: { digits: 1, prefix: '+' }, unit: 'Added minutes at the evening peak, trial minus 2025', labelWidth: 230,
    reference: { value: BOARD_LIMIT, label: `Board limit +${fmt(BOARD_LIMIT, { digits: 1 })}` },
    title: 'Added car travel time at the evening peak on each affected street',
    desc: `All four streets stay below the +${fmt(BOARD_LIMIT, { digits: 1 })}-minute limit; the largest increase is ${worst.label}, +${min(worst.value)} minutes.`,
  });
}

/** Page 4: the schedule on a true time scale, so the gap between decision and opening is visible. */
function scheduleFigure(box) {
  const d0 = day(decision.start) - 6, d1 = day(opening.start) + 10;
  const y = linear([d0, d1], [24, box.h - 24]);                       // time runs down the page
  const lineX = 132, months = [];                                     // month labels sit left of the time line
  const first = new Date(decision.start + 'T00:00:00Z');
  for (let m = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 1)); day(m.toISOString().slice(0, 10)) < d1; m = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 1))) months.push(m);
  return svgRoot({ id: 'schedule-fig', width: box.w, height: box.h, title: 'Schedule from board decision to opening',
    desc: `Decision ${longDate(decision.start)}; night works ${longDate(schedule[2].start)} to ${longDate(schedule[2].end)}; opening ${longDate(opening.start)}.` },
  el('line', { x1: lineX, x2: lineX, y1: y(d0), y2: y(d1), stroke: t.c('rule'), 'stroke-width': 2 }),
  months.map(m => { const yy = y(day(m.toISOString().slice(0, 10)));
    return g({}, el('line', { x1: lineX - 6, x2: lineX, y1: yy, y2: yy, stroke: t.c('muted') }),
      textLines([m.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' }) + (m.getUTCMonth() === 0 ? ` ${m.getUTCFullYear()}` : '')], { x: lineX - 14, y: yy, size: 16, anchor: 'end', valign: 'middle', fill: t.c('muted') })); }),
  // Labels sit beside their marks; spreadLabels moves close neighbours apart and a leader keeps the link.
  (() => {
    const items = schedule.map((s, i) => { const y0 = y(day(s.start)), y1 = s.end ? y(day(s.end)) : y0; return { id: i, s, y0, y1, y: (y0 + y1) / 2, h: 50 }; });
    const placed = spreadLabels(items.map(({ id, y: yy, h: hh }) => ({ id, y: yy, h: hh })), { min: 0, max: box.h, gap: 6 });
    return items.map((it, k) => {
      const { s, y0, y1 } = it, yy = placed[k].y, last = s === opening, first = s === decision;
      const mark = s.milestone
        ? el('circle', { cx: lineX, cy: y0, r: 8, fill: last ? t.c('accent') : t.c('ink'), stroke: t.c('paper'), 'stroke-width': 2.5 })
        : el('rect', { x: lineX - 4, y: y0, width: 8, height: Math.max(4, y1 - y0), rx: 4, fill: t.c('muted') });
      const short = iso => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
      const when = s.end ? `${short(s.start)}–${short(s.end)}` : longDate(s.start);
      return g({}, mark,
        el('path', { d: `M${lineX + 12} ${(y0 + y1) / 2}L${lineX + 20} ${yy}`, fill: 'none', stroke: t.c('rule'), 'stroke-width': Math.abs(yy - (y0 + y1) / 2) > 2 ? 1.2 : 0 }),
        textLines([s.label], { x: lineX + 26, y: yy - 11, size: 19, valign: 'middle', fill: last ? t.c('accent') : t.c('ink'), weight: s.milestone ? 650 : 500 }),
        textLines([first ? `${when}, today` : when], { x: lineX + 26, y: yy + 13, size: 16, valign: 'middle', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } }));
    });
  })());
}

// ------------------------------------------------------------------ CSS: grammar + one color system + this deck
const read = file => fs.readFile(new URL(file, import.meta.url), 'utf8');
const SYSTEM = 'civic-calm';
const frame = await read('../../assets/runtime/study-frame.css');
const block = (await read('../../assets/color-systems/color-systems.css'))
  .match(new RegExp(String.raw`/\*[^*]*\*/\n\.cs-${SYSTEM}\{[^}]*\}`))?.[0];
if (!block) throw Error(`color-systems.css has no block for cs-${SYSTEM}`);
const deckCSS = String.raw`
/* ---- Board deck: deck-specific rules. Positions come from span() in deck.mjs; this file sets type. ----
   Type: Inter Display for claims, Inter for text. Scale 68 · 38 · 26 · 21 · 18 · 15. */
.board { --ss-font-display: "Inter Display", "Inter", "Helvetica Neue", Arial, sans-serif;
         --ss-font-sans: "Inter", "Helvetica Neue", Arial, sans-serif; }
.board .st-head { font-weight: 600; font-size: 38px; line-height: 1.16; letter-spacing: -.015em; max-width: 1100px; }
.board .abs { position: absolute; margin: 0; }
.board .num { font-variant-numeric: tabular-nums lining-nums; }

/* Page 1: the ask, set as a statement. */
.board .ask-title { font: 600 68px/1.04 var(--ss-font-display); letter-spacing: -.025em; text-wrap: balance; }
.board .ask-lead { font: 400 26px/1.4 var(--ss-font-sans); text-wrap: pretty; }
.board .ask-decision { border-top: 1px solid var(--ss-ink); padding-top: 18px; font: 400 22px/1.45 var(--ss-font-sans); }
.board .ask-decision b { font-weight: 650; }
.board .ask-by { display: flex; justify-content: space-between; font: 400 18px/1.4 var(--ss-font-sans); color: var(--ss-muted); }

/* Page 3: the rail weighs the minutes the lane saved against the minutes it cost. */
.board .weigh { display: grid; align-content: center; gap: 26px; }
.board .weigh b { display: block; font: 600 54px/1 var(--ss-font-display); letter-spacing: -.02em; font-variant-numeric: tabular-nums lining-nums; }
.board .weigh span { display: block; margin-top: 8px; font: 400 20px/1.4 var(--ss-font-sans); }

/* Page 4: the cost table for reading. */
.board .costs { border-collapse: collapse; font: 400 21px/1.3 var(--ss-font-sans); font-variant-numeric: tabular-nums lining-nums; }
.board .costs th, .board .costs td { padding: 14px 0; border-bottom: 1px solid var(--ss-rule); text-align: left; }
.board .costs td { text-align: right; }
.board .costs thead th { font: 600 16px/1.3 var(--ss-font-sans); color: var(--ss-muted); border-bottom: 1.5px solid var(--ss-ink); }
.board .costs thead th:last-child { text-align: right; }
.board .costs tbody th { font-weight: 400; }
.board .costs tfoot :is(th, td) { font-weight: 650; border-bottom: 0; padding-top: 16px; }
.board .costs caption { caption-side: bottom; text-align: left; padding-top: 14px; font: 400 18px/1.45 var(--ss-font-sans); color: var(--ss-muted); }
`;

// ------------------------------------------------------------------ pages
const cls = (layout = '') => `st cs-${SYSTEM} board ${layout}`.trim();
const source = (left, method) => `<p class="st-source" data-region="source"><span>${left}</span><span>${method}, fictional data</span></p>`;
const SOURCE_TRIAL = `Kestrel Bay Transit, bus location records; ${trial.period} against ${trial.baseline}.`;
const sources = [{ file: 'examples/from-scratch/deck.mjs', status: 'illustrative' }];

const figBus = span(0, 12, FIG.top, FIG.bottom - FIG.top);
const figCars = span(0, 8, FIG.top, FIG.bottom - FIG.top), railCars = span(8, 4, FIG.top, FIG.bottom - FIG.top);
const tableCost = span(0, 6, FIG.top + 8, 440), figSchedule = span(7, 5, FIG.top - 4, FIG.bottom - FIG.top + 4);

export default {
  title: `${trial.street} bus lane: decision for the Transit Board`,
  language: 'en', readingMode: 'live', transition: 'fade', sample: true,
  css: [frame, block, deckCSS].join('\n'),
  slides: [
    {
      id: 'ask', title: claims.ask, className: cls(),
      content: `<h1 class="abs ask-title" data-region="title" ${at(span(0, 9, 150, 150))}>${h(claims.ask)}</h1>
<p class="abs ask-lead" data-region="support" ${at(span(0, 8, 316, 110))}>In the ${trial.weeks}-week trial, Route ${trial.route} crossed ${trial.street} up to ${min(-peak.d)} minutes faster, and car delay on every affected street stayed inside the board’s ${fmt(BOARD_LIMIT, { digits: 0 })}-minute limit.</p>
<p class="abs ask-decision" data-region="primary" ${at(span(0, 8, 480, 90))}><b>Decision today:</b> ${usd(cost)} for permanent works from the ${FUND.name}, so the lane opens on ${longDate(opening.start)}.</p>
<p class="abs ask-by" data-region="source" ${at(span(0, 12, 640, 30))}><span>Transit Board, ${longDate(decision.start)}</span><span>Dana Okafor, Director of Service Planning</span></p>`,
      notes: `Brief: ${brief.decision}, for ${brief.audience.toLowerCase()}. Answer first: the board is asked to approve one thing. The next three pages answer the three questions members asked when they approved the trial: did it help the buses, what did it cost drivers, and what will it cost us.`,
      sources,
    },
    {
      id: 'buses', title: plain(claims.buses), className: cls(),
      content: `<h1 class="st-head" data-region="title">${claims.buses}</h1>
<figure class="abs" data-region="primary" ${at(figBus)}>${busFigure(figBus)}</figure>
${source(SOURCE_TRIAL, 'Median by departure hour')}`,
      notes: `First the 2025 line: the street jams twice a day. [Next] Then the trial: from 7:00 to 19:00 the bus runs close to its free-flow time; the biggest saving, ${min(-peak.d)} minutes, is at ${hhmm(peak.hr)}. Before 7:00 and after 19:00 the lane is open to cars and the two years match, which is why we credit the lane and not the season.`,
      sources,
    },
    {
      id: 'cars', title: plain(claims.cars), className: cls(),
      content: `<h1 class="st-head" data-region="title">${claims.cars}</h1>
<figure class="abs" data-region="primary" ${at(figCars)}>${carFigure(figCars)}</figure>
<div class="abs weigh" data-region="support" ${at(railCars)}>
  <p><b>${hundreds(saved)}</b><span>minutes saved by ${fmt(PEAK_RIDERS, { digits: 0 })} bus riders in the evening peak hour</span></p>
  <hr class="st-rule">
  <p><b>${hundreds(lost)}</b><span>minutes lost by people in ${fmt(sum(streets.map(s => s.cars)), { digits: 0 })} cars on the four streets</span></p>
</div>
${source(`Signal detector journey times, 17:00–18:00, trial weeks against 2025; ${fmt(OCCUPANCY, { digits: 1 })} people per car.`, 'Change against a limit')}`,
      notes: `The condition the board set was a cap of ${fmt(BOARD_LIMIT, { digits: 0 })} minutes on any street. The worst case is the general lane of ${trial.street} itself, +${min(worst.value)}. On the right, the same hour in people: riders saved about twice the minutes that people in cars lost.`,
      sources,
    },
    {
      id: 'cost', title: plain(claims.cost), className: cls(),
      content: `<h1 class="st-head" data-region="title">${claims.cost}</h1>
<table class="abs costs" data-region="primary" ${atTop(tableCost)}>
  <thead><tr><th scope="col">Permanent works</th><th scope="col">Cost</th></tr></thead>
  <tbody>${works.map(w => `<tr><th scope="row">${h(w.item)}</th><td>${usd(w.cost)}</td></tr>`).join('')}</tbody>
  <tfoot><tr><th scope="row">Total</th><td>${usd(cost)}</td></tr></tfoot>
  <caption>From the ${FUND.name}, which has ${usd(FUND.unallocated)} unallocated. Engineer’s estimate, November 2026.</caption>
</table>
<figure class="abs" data-region="support" ${at(figSchedule)}>${scheduleFigure(figSchedule)}</figure>
${source('Kestrel Bay Transit, capital programme and works plan.', 'Cost and schedule')}`,
      notes: `Everything on this page is what the board approves today. The night works need eight weeks between February and March; commissioning the cameras takes two weeks; the spring timetable starts ${longDate(opening.start)}. A later decision moves the opening to the summer timetable.`,
      sources,
    },
  ],
};
