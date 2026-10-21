// Diagram study · Regression with uncertainty — observations, fitted line, confidence band
// and prediction interval, each named on the chart. The engine fits OLS and draws the 95%
// band of the mean; the wider 95% prediction interval is computed here from the same fit.
import { scatterPlot, el, g, textLines, callout, pathFromPoints, niceDomain, linearFit, tQuantile, mean, rng, fmt } from '../runtime/figure.mjs';

// Daily gas use (kWh) against heating degree-days (base 15.5 °C) for one office building,
// 64 winter weekdays (illustrative).
const rand = rng(31);
const normal = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
const days = Array.from({ length: 64 }, () => {
  const hdd = Math.round(Math.max(0.4, 2 + 15 * rand() ** 0.9 + 0.8 * normal()) * 10) / 10;
  return { x: hdd, y: Math.round(150 + 38 * hdd + 58 * normal()) };
});

const fit = linearFit(days.map(d => [d.x, d.y]));
const xs = days.map(d => d.x), mx = mean(xs), sxx = xs.reduce((s, v) => s + (v - mx) ** 2, 0);
const tq = tQuantile(0.975, fit.n - 2);
const yhat = x => fit.intercept + fit.slope * x;
const ciHalf = x => tq * fit.se * Math.sqrt(1 / fit.n + (x - mx) ** 2 / sxx); // where the mean line can be
const piHalf = x => tq * fit.se * Math.sqrt(1 + 1 / fit.n + (x - mx) ** 2 / sxx); // where one new day can be
const k0 = v => fmt(v, { digits: 0 }), k1 = v => fmt(v, { digits: 1 });
const xDomain = [0, 20];
const reach = [...[Math.min(...xs), Math.max(...xs)].flatMap(v => [yhat(v) - piHalf(v), yhat(v) + piHalf(v)]), ...days.map(d => d.y)];
const yDomain = niceDomain([Math.min(...reach), Math.max(...reach)], 5); // room for the prediction interval

export function figure(theme = 'css') {
  return scatterPlot({
    id: 'regression-band-fig', theme, width: 1152, height: 470, fontSize: 17,
    title: 'Daily gas use against heating degree-days, with fitted line, 95% confidence band and 95% prediction interval',
    desc: `${fit.n} days. Ordinary least squares: ${k0(fit.intercept)} kWh plus ${k1(fit.slope)} kWh per degree-day, R² ${fmt(fit.r2, { digits: 2 })}. At the average day the 95% confidence band is ±${k0(ciHalf(mx))} kWh; the 95% prediction interval for a single day is ±${k0(piHalf(mx))} kWh.`,
    points: days, fit: 'linear', highlight: () => false, radius: 6, labels: 'none',
    xDomain, yDomain, xLabel: 'Heating degree-days, HDD (base 15.5 °C)', yLabel: 'Gas use, kWh per day',
    fitLabel: false,
    extra: ({ x, y, t }) => {
      const at = fit.band.map(b => b.x), end = at.at(-1);
      const edge = sign => pathFromPoints(at.map(v => [x(v), y(yhat(v) + sign * piHalf(v))]));
      const px = at[Math.round(at.length * 0.18)], cx = at[Math.round(at.length * 0.72)];
      return g({ class: 'prediction-interval' },
        [1, -1].map(sign => el('path', { d: edge(sign), fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.6, 'stroke-dasharray': '7 5' })),
        textLines(['Fitted line', `${k0(fit.slope)} kWh per HDD`], { x: x(end) + 12, y: y(yhat(end)), size: 17, valign: 'middle', weight: 700, fill: t.c('accent'), halo: t.c('paper') }),
        callout({ x: x(px), y: y(yhat(px) + piHalf(px)), dx: 14, dy: -118, width: 320, size: 17, theme: t, marker: 'dot',
          title: '95% prediction interval', text: `where a single new day should fall: ±${k0(piHalf(mx))} kWh` }),
        callout({ x: x(cx), y: y(yhat(cx) - ciHalf(cx)), dx: 46, dy: 96, width: 300, size: 17, theme: t, marker: 'dot', color: t.c('accent'),
          title: '95% confidence band', text: `where the mean line lies: ±${k0(ciHalf(mx))} kWh mid-range` }));
    },
  });
}

export default {
  study: true,
  id: 'regression-band',
  title: 'Regression band: fitted trend with confidence and prediction intervals',
  className: 'st cs-physics-lecture',
  notes: 'Purpose: Separate observations, the fitted trend and its uncertainty, and keep "where the average lies" apart from "where a single case lands".\nModify: Replace `days` with your (x, y) pairs and rename the axis titles; the OLS fit, R², the confidence band, the prediction interval and every number on the page recompute.\nInvariant: Both intervals are labelled with their level and meaning; the confidence band (mean response) is always narrower than the prediction interval (one new observation); the assumptions (OLS, independent normal errors) are stated.\nStatic: Already static. Do not extend the line beyond the observed x range.',
  sources: [{ type: 'original-example', file: 'assets/svg/regression-band.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Each heating degree-day adds <em>${k0(fit.slope)}\u00a0kWh</em> of gas, but any single day can land ±${k0(piHalf(mx))}\u00a0kWh from the line</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · ${fit.n} winter weekdays in one office building; OLS, intervals assume independent normal errors</span><span>Regression with intervals</span></p>`,
};
