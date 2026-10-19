// Diagram study · Frequency spectrum — a real windowed FFT (Welch average) of a synthesized vibration
// signal: peaks, the background they stand on, and the convention that makes the numbers comparable.
// Change `components` or `acquisition`; the signal, the spectrum, the background and the labels recompute.
import { svgRoot, el, g, textLines, linear, log, pathFromPoints, spreadLabels, measureText, rng, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const acquisition = { fs: 2560, seconds: 6.4, nfft: 2048, overlap: 0.5 };   // samples/s, record length, FFT length
const shaft = 24.7;   // Hz (1,482 rpm), pump drive-end bearing, horizontal accelerometer integrated to velocity
const components = [ // tones in the synthesized signal: frequency (Hz) and peak velocity amplitude (mm/s)
  { name: '1× shaft', f: shaft, peak: 2.4 },
  { name: '2× shaft', f: 2 * shaft, peak: 0.9 },
  { name: 'Outer race (BPFO)', f: 3.58 * shaft, peak: 0.55, focus: true },
  { name: '100 Hz electrical', f: 100, peak: 0.2 },
  { name: 'Vane pass (6×)', f: 6 * shaft, peak: 1.1 },
  { name: '2× BPFO', f: 2 * 3.58 * shaft, peak: 0.25 },
];
const fMax = 250;

// --- signal: tones + band-limited noise (deterministic) -------------------------------------------
const N = Math.round(acquisition.fs * acquisition.seconds), rand = rng(42);
const gauss = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
const signal = new Float64Array(N);
let lp = 0;
for (let i = 0; i < N; i++) {
  const tt = i / acquisition.fs;
  lp = 0.92 * lp + 0.08 * gauss();                       // low-pass noise: background falls with frequency
  signal[i] = components.reduce((s, c, k) => s + c.peak * Math.sin(2 * Math.PI * c.f * tt + k), 0) + 2.0 * lp + 0.5 * gauss();
}

// --- spectrum: Hann window, Welch averaging of |X|², single-sided RMS amplitude --------------------
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) {
    const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a), h = len / 2;
    for (let i = 0; i < n; i += len) for (let k = 0, cr = 1, ci = 0; k < h; k++) {
      const p = i + k, q = p + h, vr = re[q] * cr - im[q] * ci, vi = re[q] * ci + im[q] * cr;
      re[q] = re[p] - vr; im[q] = im[p] - vi; re[p] += vr; im[p] += vi;
      const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
    }
  }
}
const M = acquisition.nfft, hop = M * (1 - acquisition.overlap), win = Float64Array.from({ length: M }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / M));
const wsum = win.reduce((s, v) => s + v, 0), power = new Float64Array(M / 2);
let averages = 0;
for (let start = 0; start + M <= N; start += hop, averages++) {
  const re = Float64Array.from({ length: M }, (_, i) => signal[start + i] * win[i]), im = new Float64Array(M);
  fft(re, im);
  for (let k = 0; k < M / 2; k++) power[k] += re[k] ** 2 + im[k] ** 2;
}
const df = acquisition.fs / M;
const spectrum = Array.from(power, (p, k) => ({ f: k * df, a: (2 * Math.sqrt(p / averages) / wsum) / Math.SQRT2 })).filter(d => d.f > 0 && d.f <= fMax);
// Background: running median over ±12 bins (15 Hz each side), robust to the narrow peaks.
const background = spectrum.map((d, i) => { const w = spectrum.slice(Math.max(0, i - 12), i + 13).map(s => s.a).sort((p, q) => p - q); return { f: d.f, a: w[w.length >> 1] }; });
const peaks = components.map(c => {
  const near = spectrum.map((d, i) => ({ ...d, i })).filter(d => Math.abs(d.f - c.f) <= 2 * df);
  const top = near.reduce((p, q) => (q.a > p.a ? q : p));
  return { ...c, at: top, floor: background[top.i].a, db: 20 * Math.log10(top.a / background[top.i].a) };
});
const focus = peaks.find(p => p.focus);
const hz = v => fmt(v, { digits: 1 }), binHz = fmt(df, { digits: 2 });

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 800, H = 474, id = 'frequency-spectrum-fig';
  const box = { x: 62, y: 112, w: W - 62 - 8, h: H - 112 - 44 };
  const floorA = 0.01, x = linear([0, fMax], [box.x, box.x + box.w]), y = log([floorA, 4], [box.y + box.h, box.y]);
  const line = pts => pathFromPoints(pts.map(d => [x(d.f), y(Math.max(floorA, d.a))]));
  // Peak labels sit in a rail above the plot, spread along x so they never overlap, each on a leader.
  const items = peaks.map((p, i) => ({ id: i, y: x(p.at.f), h: Math.max(measureText(p.name, 15, { weight: 700 }), measureText(`${hz(p.f)} Hz`, 15)) + 14 }));
  const placed = spreadLabels(items, { min: box.x + 10, max: box.x + box.w - 6, gap: 4 });
  const rail = peaks.map((p, i) => {
    const lx = placed.find(q => q.id === i).y, px = x(p.at.f), py = y(p.at.a) - 6, hl = !!p.focus;
    const color = hl ? t.c('accent') : t.c('ink');
    return g({},
      el('path', { d: `M${lx} 52L${lx} 62L${px} 84L${px} ${py}`, fill: 'none', stroke: hl ? t.c('accent') : t.c('rule'), 'stroke-width': hl ? 1.6 : 1.2 }),
      textLines([p.name], { x: lx, y: 4, size: 15, anchor: 'middle', valign: 'top', weight: 700, fill: color }),
      textLines([`${hz(p.f)} Hz`], { x: lx, y: 26, size: 15, anchor: 'middle', valign: 'top', fill: hl ? t.c('accent') : t.c('muted') }));
  });
  const fy = y(focus.floor), ty = y(focus.at.a), fx = x(focus.at.f) - 14;   // prominence bracket left of the peak
  const bgAt = background.find(d => d.f >= 222), bgX = x(bgAt.f), bgY = y(bgAt.a);
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'Vibration velocity spectrum of a pump bearing, 0–250 Hz',
    desc: `RMS velocity spectrum (Hann window, ${M}-point FFT, ${averages} averages, ${binHz} Hz bins) on a log scale. Peaks: ${peaks.map(p => `${p.name} at ${hz(p.f)} Hz, ${fmt(p.at.a, { digits: 2 })} mm/s`).join('; ')}. The outer-race defect tone stands ${fmt(focus.db, { digits: 0 })} dB above the local background.` },
  // axes: log amplitude, linear frequency
  [0.01, 0.1, 1].map(v => g({}, el('line', { x1: box.x, x2: box.x + box.w, y1: y(v), y2: y(v), stroke: t.c('grid') }),
    textLines([fmt(v)], { x: box.x - 10, y: y(v), size: 15, anchor: 'end', valign: 'middle', fill: t.c('muted') }))),
  textLines(['mm/s RMS'], { x: box.x - 54, y: box.y - 6, size: 15, valign: 'bottom', fill: t.c('muted') }),
  el('line', { x1: box.x, x2: box.x + box.w, y1: box.y + box.h, y2: box.y + box.h, stroke: t.c('ink'), 'stroke-width': 1.2 }),
  [0, 50, 100, 150, 200, 250].map(v => g({}, el('line', { x1: x(v), x2: x(v), y1: box.y + box.h, y2: box.y + box.h + 5, stroke: t.c('ink') }),
    textLines([String(v)], { x: x(v), y: box.y + box.h + 10, size: 15, anchor: v === 0 ? 'start' : v === fMax ? 'end' : 'middle', valign: 'top', fill: t.c('muted') }))),
  textLines(['Frequency, Hz'], { x: box.x + box.w, y: H - 2, size: 15, anchor: 'end', valign: 'bottom', fill: t.c('muted') }),
  // background, spectrum, and the one prominence that matters
  el('path', { d: line(background), fill: 'none', stroke: t.c('muted'), 'stroke-width': 1.5, 'stroke-dasharray': '6 4' }),
  el('line', { x1: bgX, x2: bgX, y1: y(0.3) + 22, y2: bgY - 3, stroke: t.c('muted'), 'stroke-width': 1 }),
  textLines(['background', 'running median'], { x: bgX, y: y(0.3), size: 15, anchor: 'middle', valign: 'middle', fill: t.c('muted'), lineHeight: 1.2 }),
  el('path', { d: line(spectrum), fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.5, 'stroke-linejoin': 'round' }),
  el('path', { d: `M${fx + 6} ${fy}H${fx}V${ty}H${fx + 6}`, fill: 'none', stroke: t.c('accent'), 'stroke-width': 1.6 }),
  textLines([`+${fmt(focus.db, { digits: 0 })} dB`], { x: fx - 6, y: (fy + ty) / 2, size: 16, anchor: 'end', valign: 'middle', weight: 700, fill: t.c('accent'), halo: t.c('paper') }),
  rail);
}

export default {
  study: true,
  id: 'frequency-spectrum',
  title: 'Frequency spectrum: peaks over a stated background',
  className: 'st st--left cs-manufacturing-plant',
  notes: 'Purpose: Show which frequencies carry energy, how far each peak stands above the background, and the processing that defines the amplitudes.\nModify: Edit `components`, `shaft` and `acquisition`; the signal is re-synthesized and re-analyzed (Hann window, Welch averaging), and the peak labels, background and dB figure recompute. With measured data, replace `signal` and keep the analysis.\nInvariant: Frequency in Hz on a linear axis; the amplitude convention (RMS velocity, mm/s), the window, FFT length, averages and bin width are stated on the page; the background is computed, not sketched.\nStatic: Already static. For a talk, show the spectrum, then the defect tone and its prominence.',
  sources: [{ type: 'original-example', file: 'assets/svg/frequency-spectrum.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">The ${fmt(focus.f, { digits: 0 })} Hz outer-race tone stands <em>${fmt(focus.db, { digits: 0 })} dB</em> above the background: the bearing, not the impeller, needs attention</h1>
<div class="st-rail" data-region="support">
  <div class="st-kpi"><b class="st-accent">${fmt(focus.at.a, { digits: 2 })}<small style="font-size:.4em;font-weight:500;margin-left:.15em">mm/s</small></b><span>RMS velocity at the bearing-defect frequency, ${fmt(3.58, { digits: 2 })} × shaft speed.</span></div>
  <hr class="st-rule">
  <p class="st-text st-muted">RMS velocity, drive-end bearing, horizontal. Hann window, ${fmt(M)}-point FFT, ${averages} averages with ${fmt(acquisition.overlap * 100)}% overlap, ${binHz} Hz bins.</p>
</div>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · synthesized ${acquisition.seconds} s record at ${fmt(acquisition.fs)} samples/s, analyzed on the page</span><span>Amplitude spectrum (Welch)</span></p>`,
};
