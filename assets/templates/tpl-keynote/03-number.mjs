// Template: Conference keynote · One giant number with context. Synthetic example content; replace data and copy.
// The giant number is not typed in: it is the distance between the two computed peaks on the chart below it.
const P = 'tpl-keynote-number';

// Illustrative daily profiles (hours 0–24), each scaled to its own daily peak = 100.
const g = (x, m, s) => Math.exp(-((x - m) ** 2) / (2 * s * s));
const sunrise = 5.6, sunset = 20.9;
const solarRaw = h => h <= sunrise || h >= sunset ? 0 : Math.sin(Math.PI * (h - sunrise) / (sunset - sunrise)) ** 1.6;
const demandRaw = h => 0.52 + 0.16 * g(h, 8.2, 1.5) + 0.36 * g(h, 17.6, 1.9) + 0.08 * g(h, 12.5, 2.5) - 0.12 * g(h, 3.5, 2.2);
const STEP = 1 / 60, hours = Array.from({ length: 24 * 60 + 1 }, (_, i) => i * STEP);
const peakOf = f => hours.reduce((best, h) => f(h) > f(best) ? h : best, 0);
const sPeak = peakOf(solarRaw), dPeak = peakOf(demandRaw);
const sMax = solarRaw(sPeak), dMax = demandRaw(dPeak);
const solar = h => 100 * solarRaw(h) / sMax, demand = h => 100 * demandRaw(h) / dMax;
const gapMin = Math.round((dPeak - sPeak) * 60), gh = Math.floor(gapMin / 60), gm = gapMin % 60;
const clock = h => { const m = Math.round(h * 60); return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };

// chart geometry
const W = 1136, H = 236, x0 = 0, x1 = W, y0 = 196, yTop = 30;
const sx = h => x0 + (h / 24) * (x1 - x0), sy = v => y0 - (v / 100) * (y0 - yTop);
const path = f => hours.filter((_, i) => i % 6 === 0).map((h, i) => `${i ? 'L' : 'M'}${sx(h).toFixed(1)} ${sy(f(h)).toFixed(1)}`).join(' ');
const ticks = [0, 3, 6, 9, 12, 15, 18, 21, 24].map(h => `<line x1="${sx(h)}" x2="${sx(h)}" y1="${y0}" y2="${y0 + 6}" stroke="#5d6072"/><text x="${sx(h)}" y="${y0 + 28}" font-size="15" fill="#9a9cab" text-anchor="${h === 0 ? 'start' : h === 24 ? 'end' : 'middle'}">${clock(h)}</text>`).join('');
const bracketY = yTop - 30;
const chart = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="${P}-t ${P}-d" font-family="Inter,'Helvetica Neue','Liberation Sans',Arial,sans-serif">
<title id="${P}-t">Solar output and city demand over one day</title>
<desc id="${P}-d">Solar output peaks at ${clock(sPeak)}; demand peaks at ${clock(dPeak)}, ${gh} hours ${gm} minutes later. Each curve is scaled to its own daily peak. Illustrative profile.</desc>
<defs>
  <linearGradient id="${P}-sunfill" x1="0" y1="${yTop}" x2="0" y2="${y0}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffb547" stop-opacity=".55"/><stop offset="1" stop-color="#ffb547" stop-opacity="0"/></linearGradient>
</defs>
<line x1="${x0}" x2="${x1}" y1="${y0}" y2="${y0}" stroke="#5d6072"/>
${ticks}
<path d="${path(solar)} L${sx(24)} ${y0} L${sx(0)} ${y0} Z" fill="url(#${P}-sunfill)"/>
<path d="${path(solar)}" fill="none" stroke="#ffb547" stroke-width="3"/>
<path d="${path(demand)}" fill="none" stroke="#56d7e6" stroke-width="3"/>
<line x1="${sx(sPeak)}" x2="${sx(sPeak)}" y1="${bracketY}" y2="${sy(100)}" stroke="#ffb547" stroke-width="1.4" stroke-dasharray="3 4"/>
<line x1="${sx(dPeak)}" x2="${sx(dPeak)}" y1="${bracketY}" y2="${sy(100)}" stroke="#56d7e6" stroke-width="1.4" stroke-dasharray="3 4"/>
<circle cx="${sx(sPeak)}" cy="${sy(100)}" r="6" fill="#07080d" stroke="#ffb547" stroke-width="3"/>
<circle cx="${sx(dPeak)}" cy="${sy(100)}" r="6" fill="#07080d" stroke="#56d7e6" stroke-width="3"/>
<path d="M${sx(sPeak)} ${bracketY} H ${sx(dPeak)}" stroke="#f4f1ea" stroke-width="2"/>
<path d="M${sx(sPeak)} ${bracketY - 7} v14 M${sx(dPeak)} ${bracketY - 7} v14" stroke="#f4f1ea" stroke-width="2"/>
<text x="${(sx(sPeak) + sx(dPeak)) / 2}" y="${bracketY - 12}" font-size="16" font-weight="700" fill="#f4f1ea" text-anchor="middle">${gh} h ${gm} min</text>
<text x="${sx(sPeak) - 14}" y="${sy(100) - 12}" font-size="16" font-weight="700" fill="#ffb547" text-anchor="end">Solar output peaks ${clock(sPeak)}</text>
<text x="${sx(dPeak) + 14}" y="${sy(100) - 12}" font-size="16" font-weight="700" fill="#56d7e6">Demand peaks ${clock(dPeak)}</text>
</svg>`;

export default {
  study: true,
  id: 'tpl-keynote-number',
  title: `Giant number: ${gh} h ${gm} min between the solar and demand peaks`,
  notes: 'Purpose: Make one number unforgettable and show exactly where it comes from.\nModify: Replace solarRaw and demandRaw with your metered hourly profiles (or an array lookup). The peaks, the giant number, the bracket and the labels recompute.\nInvariant: The giant number equals the bracket on the chart. Say how the curves are scaled; do not compare their heights as quantities.\nStatic: The context chart builds in at step 1; the final state shows number and chart together.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-keynote kn-number',
  content: `<div class="kn-page" style="background:radial-gradient(900px 420px at 30% 110%,rgba(255,122,61,.18),transparent 70%),radial-gradient(700px 400px at 90% -10%,rgba(79,134,255,.16),transparent 70%),#07080d">
<p class="kn-abs kn-eyebrow" style="left:76px;top:66px">The number that runs our evenings</p>
<p class="kn-abs kn-giant kn-num" data-region="title" role="heading" aria-level="2" style="left:64px;top:128px">${gh}<small>h</small>${gm}<small>min</small></p>
<p class="kn-abs kn-context" style="left:800px;top:146px;width:410px">between the hour our solar farms produce the most and the hour the city <em>needs</em> the most.</p>
<div class="kn-abs" data-region="primary" data-step="1" data-motion="lift" style="left:72px;top:410px;width:${W}px">${chart}
  <p style="margin-top:8px;font:400 15px/1.3 var(--kn-sans);color:var(--kn-ink-3)">Each curve scaled to its own daily peak · illustrative June weekday profile · replace with metered data</p></div>
</div>`
};
