// Composition study · Editorial opener — one image and a dominant serif title.
// The image is a helicorder record drawn from a synthetic seismogram: every trace, the red
// earthquake, the time labels and the title's "Ninety seconds at 03:12" come from `quake`.
import { svgRoot, el, g, textLines, rng, theme as makeTheme } from '../runtime/figure.mjs';

// The lecture this page opens (fictional society, speaker and event).
// Dates are ISO strings; weekday names are derived, never typed.
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const day = (iso, { weekday = true, year = true } = {}) => { const d = new Date(`${iso}T12:00:00Z`); return `${weekday ? `${DAYS[d.getUTCDay()]} ` : ''}${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}${year ? ` ${d.getUTCFullYear()}` : ''}`; };
const lecture = {
  series: 'Skarra Geological Society, winter lectures 2026',
  speaker: 'Ingrid Halvorsen',
  date: '2026-11-26', time: '19:30', venue: 'Harbour Hall',
};
// Station SKR1, vertical component: one drum line per two minutes, 30 lines (02:40–03:40).
const record = { station: 'SKR1', start: 2 * 3600 + 40 * 60, secondsPerLine: 120, lines: 30 };
// Illustrative local earthquake. Amplitudes are in line spacings (the drum clips at ±clip).
const quake = {
  origin: 3 * 3600 + 12 * 60 + 7, // 03:12:07 local time, s since midnight
  pDelay: 3.2,  // s, origin → P arrival at SKR1
  sMinusP: 5.4, // s, P → S arrival (≈ 45 km away)
  peak: 5.5,    // S-wave amplitude (clips the drum)
  coda: 27,     // s, e-folding time of the coda
  clip: 2.3,    // drum clipping, line spacings
};
const noise = 0.08; // microseism amplitude, line spacings

// Derived: when the shaking stands above three times the background, and for how long.
const tP = quake.origin + quake.pDelay, tS = tP + quake.sMinusP;
const tEnd = tS + quake.coda * Math.log(quake.peak / (3 * noise));
const seconds = Math.round((tEnd - tP) / 10) * 10;
const inWords = { 60: 'Sixty', 70: 'Seventy', 80: 'Eighty', 90: 'Ninety', 100: 'A hundred', 110: 'A hundred and ten', 120: 'Two minutes of' };
const clock = (s, sec = false) => [Math.floor(s / 3600), Math.floor(s / 60) % 60, ...(sec ? [Math.floor(s % 60)] : [])].map(v => String(v).padStart(2, '0')).join(':');

function helicorder(theme = 'css') {
  const t = makeTheme(theme), W = 624, H = 720, gutter = 78, top = 22;
  const gap = (H - 2 * top) / (record.lines - 1), pxs = (W - gutter) / record.secondsPerLine;
  const r = rng(26), ph = Array.from({ length: 8 }, () => r() * 2 * Math.PI);
  // Background: three microseism periods whose strength drifts slowly from line to line.
  const micro = s => noise * (0.75 + 0.25 * Math.sin(s / 410 + ph[3])) * (0.55 * Math.sin(2 * Math.PI * s / 4.8 + ph[0]) * (0.8 + 0.2 * Math.sin(s / 47))
    + 0.35 * Math.sin(2 * Math.PI * s / 6.3 + ph[1]) + 0.25 * Math.sin(2 * Math.PI * s / 7.7 + ph[2]));
  // Earthquake: P arrival, then S with a slow rise, an irregular packet and an exponential coda.
  const env = s => s < tP ? 0 : s < tS ? 0.26 * quake.peak * (1 - Math.exp(-(s - tP) / 0.4)) * Math.exp(-(s - tP) / 5)
    : quake.peak * (1 - Math.exp(-(s - tS) / 1.6)) * Math.exp(-(s - tS) / quake.coda)
      * (0.62 + 0.38 * (0.5 * Math.sin(2 * Math.PI * s / 3.1 + ph[4]) + 0.3 * Math.sin(2 * Math.PI * s / 7.9 + ph[5]) + 0.2 * Math.sin(2 * Math.PI * s / 1.3 + ph[6])));
  // Phase is integrated analytically so the carrier stays continuous: ~5 Hz P, S slowing from 2.6 to 0.9 Hz.
  const phase = s => s < tS ? 2 * Math.PI * 5 * (s - tP)
    : 2 * Math.PI * (0.9 * (s - tS) + 1.7 * 9 * (1 - Math.exp(-(s - tS) / 9))) + 0.9 * Math.sin(2 * Math.PI * s / 2.3 + ph[7]);
  const wave = s => env(s) * Math.sin(phase(s)) * (0.8 + 0.2 * r());
  const y0 = i => top + i * gap;
  const fmt1 = v => (Math.round(v * 10) / 10).toString();
  const lines = [], quakePaths = [];
  for (let i = 0; i < record.lines; i++) {
    const s0 = record.start + i * record.secondsPerLine;
    let d = '', q = '', prev = null, inQuake = false;
    for (let x = 0; x <= W - gutter + 0.01;) {
      const s = s0 + x / pxs, e = s >= tP && s <= tEnd;
      const v = Math.max(-quake.clip, Math.min(quake.clip, micro(s) + (e ? wave(s) : 0))) + (r() - 0.5) * 0.012;
      const pt = [gutter + x, y0(i) - v * gap];
      if (e !== inQuake && prev) { if (e) q += `M${fmt1(prev[0])} ${fmt1(prev[1])}`; else d += `M${fmt1(prev[0])} ${fmt1(prev[1])}`; }
      if (e) q += `${q ? 'L' : 'M'}${fmt1(pt[0])} ${fmt1(pt[1])}`;
      else d += `${d ? 'L' : 'M'}${fmt1(pt[0])} ${fmt1(pt[1])}`;
      inQuake = e; prev = pt;
      x += e ? 0.55 : 2;
    }
    lines.push(d); if (q) quakePaths.push(q);
  }
  const labelEvery = 5; // one time label per ten minutes
  return svgRoot({ id: 'composition-editorial-open-record', width: W, height: H, theme: t,
    title: `Seismograph record from station ${record.station}, ${clock(record.start)} to ${clock(record.start + record.lines * record.secondsPerLine)}`,
    desc: `Thirty two-minute lines of quiet background motion. At ${clock(quake.origin, true)} an earthquake begins; the trace stays above three times the background for about ${seconds} seconds and clips the neighbouring lines at its peak.` },
  el('rect', { x: 0, y: 0, width: W, height: H, fill: t.c('surface') }),
  Array.from({ length: record.lines / labelEvery }, (_, k) => textLines([clock(record.start + k * labelEvery * record.secondsPerLine)],
    { x: 20, y: y0(k * labelEvery), size: 15, valign: 'middle', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } })),
  el('path', { d: lines.join(''), fill: 'none', stroke: t.c('ink'), 'stroke-width': 0.9, 'stroke-linejoin': 'round', opacity: 0.62 }),
  el('path', { d: quakePaths.join(''), fill: 'none', stroke: t.c('accent'), 'stroke-width': 0.9, 'stroke-linejoin': 'round' }));
}

export default {
  study: true,
  id: 'composition-editorial-open',
  title: 'Editorial opener: one image and a dominant serif title',
  className: 'st cs-journal-serif cmp-editorial-open',
  notes: `Purpose: Open a talk, report or long read with a point of view: one image the audience can study, a title large enough to be the first thing read, and a short dek that says what the evening is about. Use it for the first page only.\nModify: Replace \`lecture\` and the image. The intended input is a high-resolution photograph (a landscape, an object, a person at work) shown full height on the right five columns; here the image is a drawn record (an instrument trace) because the bundled photographs are too small for a full-height panel. Here the title is computed from \`quake\` (${seconds} s above three times the background, starting ${clock(quake.origin)}); keep any title to three short lines broken by sense.\nInvariant: The title is the largest thing on the page and the only display type; the dek holds a narrow measure (about 40 characters); the image runs edge to edge in its own field and nothing sits on top of it; one accent, and only on the phrase that names the red part of the image.\nStatic: Already static.`,
  sources: [{ type: 'original-example', file: 'assets/compositions/editorial-open.mjs' }],
  exportPolicy: 'final',
  content: `<p class="eo-series" data-region="support">${lecture.series}</p>
<h1 class="eo-title" data-region="title">${inWords[seconds] ?? seconds}<br>seconds<br>at <em>${clock(quake.origin)}</em></h1>
<p class="eo-dek" data-region="support">The island’s strongest earthquake since 1962, read second by second from the seismometer on Skarra Head.</p>
<p class="eo-byline" data-region="support"><b>${lecture.speaker}</b><br>${day(lecture.date, { year: false })}, ${lecture.time}, ${lecture.venue}</p>
<figure class="eo-record" data-region="primary">${helicorder()}</figure>
<p class="eo-caption" data-region="source">Record: station ${record.station}, vertical, two minutes per line. Synthetic illustration.</p>`,
};
