// Template: Incident review · Timeline with time to detect, mitigate and resolve. Synthetic example content; replace data and copy.
import { wrapText, spreadLabels } from '../../runtime/figure.mjs';

const ID = 'tpl-architecture-timeline';
// UTC, Tue 6 Oct 2026. mark names the four moments the durations are measured between.
const events = [
  { t: '18:00', text: 'Promotion starts; 41,200 price rules invalidated' },
  { t: '18:02', text: 'p99 passes 1.0 s and 504s begin', mark: 'impact' },
  { t: '18:10', text: 'Error-rate alert pages the on-call engineer', mark: 'detected' },
  { t: '18:17', text: 'SEV-2 declared; incident commander assigned' },
  { t: '18:24', text: 'Reporting jobs paused; p99 falls only to 1.6 s' },
  { t: '18:31', text: 'Hit ratio found at 22%: the cache is cold' },
  { t: '18:38', text: 'Script warms the 20,000 most-viewed SKUs' },
  { t: '18:44', text: 'p99 back under 1.0 s; impact ends', mark: 'mitigated' },
  { t: '19:32', text: 'Stable for 48 minutes; incident resolved', mark: 'resolved' },
];
const axisBreak = ['18:50', '19:26']; // minutes in between are not drawn; the break is marked on the axis
const domain = ['17:58', '19:36'];
const durations = [ // measured from the start of customer impact
  { to: 'detected', label: 'to detect' },
  { to: 'mitigated', label: 'to mitigate' },
  { to: 'resolved', label: 'to resolve' },
];
const lessons = [
  { lead: 'The page named the symptom.', text: 'The alert fired on checkout errors; nothing watched the cache hit ratio, so the first 14 minutes went to the gateway and the replica.' },
  { lead: 'Pausing reporting only halved the pain.', text: 'p99 dropped from 2.0 s to 1.6 s at 18:24 because every request still missed the cache.' },
  { lead: 'No runbook for a cold cache.', text: 'The warm-up script was written during the incident and ran at 18:38.' },
];

// ---- scale: true time inside each segment, a fixed 36 px break between them
const mins = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const at = mark => events.find(e => e.mark === mark).t;
const [d0, d1] = domain.map(mins), [b0, b1] = axisBreak.map(mins);
const TOP = 0, HEIGHT = 444, GAP = 36;
const PX = (HEIGHT - GAP) / ((b0 - d0) + (d1 - b1));
const Y = t => { const m = mins(t); return TOP + (m <= b0 ? (m - d0) * PX : (b0 - d0) * PX + GAP + (m - b1) * PX); };
const span = (a, b) => mins(b) - mins(a);
const NB = '\u00a0'; // never break a number from its unit

// ---- columns (px inside the 1152 px figure): duration labels | brackets | axis | time + event
const AX = 236, LABEL_R = 164, TIME_X = AX + 22, TEXT_X = AX + 86, TEXT_W = 448, FS = 18;
const lines = events.map(e => wrapText(e.text.replace(/(\d) (s|min)\b/g, `$1${NB}$2`), TEXT_W, FS));
const placed = spreadLabels(events.map((e, i) => ({ id: i, y: Y(e.t), h: lines[i].length * 24 })), { min: TOP + 2, max: TOP + HEIGHT, gap: 6 });
const RED = 'var(--ar-red)', INK = 'var(--ar-ink)';
const axis = `<line x1="${AX}" y1="${Y(domain[0])}" x2="${AX}" y2="${Y(axisBreak[0]) + 6}" stroke="${INK}" stroke-width="1.5"/>`
  + `<line x1="${AX}" y1="${Y(axisBreak[1]) - 6}" x2="${AX}" y2="${Y(domain[1])}" stroke="${INK}" stroke-width="1.5"/>`
  + [Y(axisBreak[0]) + 6, Y(axisBreak[1]) - 6].map(y => `<path d="M${AX - 9} ${y + 4}L${AX + 9} ${y - 4}" stroke="${INK}" stroke-width="1.5"/>`).join('')
  + `<text x="${TEXT_X}" y="${(Y(axisBreak[0]) + Y(axisBreak[1])) / 2 + 6}" class="t-axis">${span(...axisBreak)} minutes of monitoring not drawn</text>`
  + `<line x1="${AX}" y1="${Y(at('impact'))}" x2="${AX}" y2="${Y(at('mitigated'))}" stroke="${RED}" stroke-width="7"/>`;
const rows = events.map((e, i) => {
  const y = Y(e.t), ly = placed[i].y - (lines[i].length - 1) * 12, big = !!e.mark;
  const leader = placed[i].shifted ? `<path d="M${AX + 8} ${y}L${TIME_X - 4} ${placed[i].y}" fill="none" stroke="var(--ar-rule)" stroke-width="1"/>` : '';
  return `${leader}<circle cx="${AX}" cy="${y}" r="${big ? 5.5 : 4}" fill="${e.mark === 'impact' || e.mark === 'mitigated' ? RED : INK}" stroke="var(--ar-paper)" stroke-width="2"/>`
    + `<text x="${TIME_X}" y="${ly + 6}" class="t-num" style="font:600 ${FS}px var(--ar-sans);fill:var(--ar-ink)">${e.t}</text>`
    + `<text x="${TEXT_X}" y="${ly + 6}" style="font:400 ${FS}px var(--ar-sans);fill:var(--ar-ink)">${lines[i].map((l, k) => `<tspan x="${TEXT_X}" dy="${k ? 24 : 0}">${l}</tspan>`).join('')}</text>`;
}).join('');
// durations: one bracket per measure, all starting at impact, nested so the shortest sits next to the axis
const brackets = durations.map((d, k) => {
  const x = AX - 20 - k * 16, y0 = Y(at('impact')), y1 = Y(at(d.to)), m = span(at('impact'), at(d.to));
  return `<path d="M${x + 6} ${y0}H${x}V${y1}H${x + 6}" fill="none" stroke="${INK}" stroke-width="1.25"/>`
    + `<text x="${LABEL_R - k * 16 + 8 * 0}" y="${y1 - 3}" text-anchor="end" style="font:600 22px var(--ar-display);fill:var(--ar-ink)" class="t-num">${m}${NB}min</text>`
    + `<text x="${LABEL_R - k * 16}" y="${y1 + 18}" text-anchor="end" class="t-axis">${d.label}</text>`;
}).join('');
const W = 1152;
const fig = `<svg viewBox="0 0 ${W} ${HEIGHT}" width="${W}" height="${HEIGHT}" role="img" aria-labelledby="${ID}-t ${ID}-d" style="overflow:visible">
<title id="${ID}-t">Incident timeline, ${domain[0]}–${domain[1]} UTC, with time to detect, mitigate and resolve</title>
<desc id="${ID}-d">${events.map(e => `${e.t} ${e.text}`).join('. ')}. ${durations.map(d => `${span(at('impact'), at(d.to))} minutes ${d.label}`).join(', ')}, all measured from ${at('impact')}. The axis is broken between ${axisBreak[0]} and ${axisBreak[1]}.</desc>
${axis}${brackets}${rows}
</svg>`;
const mitigate = span(at('impact'), at('mitigated')), detect = span(at('impact'), at('detected'));

export default {
  study: true,
  id: ID,
  title: 'Incident timeline with time to detect, mitigate and resolve',
  notes: 'Purpose: Reconstruct the incident minute by minute and show where the response lost time, with detection, mitigation and resolution times computed from the same timestamps.\nModify: Edit events (t, text, optional mark), axisBreak, domain and lessons. The vertical positions, label spreading, impact bar, brackets, durations and the headline numbers are computed; marks impact, detected, mitigated and resolved must exist.\nInvariant: One time zone, stated once. Time is to scale inside each axis segment and any break is drawn and labelled. Durations are measured from the start of customer impact and never typed by hand. Lessons describe systems and gaps, not people.\nStatic: Static page; no builds.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-architecture ar-timeline',
  content: `<p class="ar-run"><span>Incident review — checkout timeouts, 6 Oct 2026</span><span>5</span></p>
<h1 class="ar-head" data-region="title">Detected in ${detect} minutes, mitigated in ${mitigate}, because no runbook covered a cold cache</h1>
<figure class="ar-fig" style="left:64px;top:196px" data-region="primary">${fig}</figure>
<aside class="ar-rail" data-region="support"><h2>Why mitigation took ${mitigate} minutes</h2>${lessons.map(l => `<p><b>${l.lead}</b> ${l.text.replace(/(\d) (s|min)\b/g, `$1${NB}$2`)}</p>`).join('')}</aside>
<p class="ar-src" data-region="source"><span>All times UTC, from the alert history and the incident channel. Durations are measured from the start of customer impact at ${at('impact')}.</span></p>`,
};
