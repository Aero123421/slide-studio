/**
 * Slide Studio figure engine — small, explicit statistics.
 *
 * Charts compute their marks from raw values with these functions, so a box,
 * a curve or an interval is never drawn from hand-copied numbers. Each function
 * states its definition; choose the one your analysis actually used.
 */
import { isNum, niceStep, extent } from './fig-core.mjs';

const finite = values => values.filter(isNum);

export function mean(values) {
  const v = finite(values);
  if (!v.length) throw Error('mean(): no finite values');
  return v.reduce((s, x) => s + x, 0) / v.length;
}

/** Sample standard deviation (n − 1). */
export function sd(values) {
  const v = finite(values);
  if (v.length < 2) return 0;
  const m = mean(v);
  return Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / (v.length - 1));
}

/** Quantile with linear interpolation (type 7, the default in R and NumPy). */
export function quantile(values, p) {
  const v = finite(values).sort((a, b) => a - b);
  if (!v.length) throw Error('quantile(): no finite values');
  const h = (v.length - 1) * p, lo = Math.floor(h), hi = Math.ceil(h);
  return v[lo] + (v[hi] - v[lo]) * (h - lo);
}
export const median = values => quantile(values, 0.5);

/**
 * Tukey box statistics: quartiles (type 7), whiskers to the most extreme data
 * within 1.5 × IQR, everything else listed as outliers.
 */
export function boxStats(values, { whisker = 1.5 } = {}) {
  const v = finite(values).sort((a, b) => a - b);
  if (!v.length) throw Error('boxStats(): no finite values');
  const q1 = quantile(v, 0.25), q2 = quantile(v, 0.5), q3 = quantile(v, 0.75), iqr = q3 - q1;
  const loFence = q1 - whisker * iqr, hiFence = q3 + whisker * iqr;
  const inside = v.filter(x => x >= loFence && x <= hiFence);
  return { n: v.length, q1, median: q2, q3, iqr, lo: inside[0], hi: inside[inside.length - 1], outliers: v.filter(x => x < loFence || x > hiFence), min: v[0], max: v[v.length - 1], mean: mean(v) };
}

/** Silverman's rule-of-thumb bandwidth for a Gaussian kernel. */
export function silverman(values) {
  const v = finite(values), s = sd(v), iqr = quantile(v, 0.75) - quantile(v, 0.25);
  const spread = Math.min(s, iqr / 1.34) || s || 1;
  return 0.9 * spread * v.length ** -0.2;
}

/** Gaussian kernel density evaluated at `points` (density units: per x unit). */
export function kde(values, points, bandwidth = silverman(values)) {
  const v = finite(values), k = 1 / (Math.sqrt(2 * Math.PI) * bandwidth * v.length);
  return points.map(x => [x, k * v.reduce((s, xi) => s + Math.exp(-0.5 * ((x - xi) / bandwidth) ** 2), 0)]);
}

/** Even-width bins on nice boundaries. Returns [{x0, x1, count, values}]. Last bin is closed. */
export function bins(values, { count = 10, domain, thresholds } = {}) {
  const v = finite(values);
  const [lo, hi] = domain || extent(v);
  let edges = thresholds;
  if (!edges) {
    const step = niceStep(hi - lo || 1, count);
    const start = Math.floor(lo / step) * step;
    edges = [];
    for (let x = start; x < hi + step * 0.5 || edges.length < 2; x += step) edges.push(+x.toFixed(10));
    if (edges[edges.length - 1] < hi) edges.push(+(edges[edges.length - 1] + step).toFixed(10));
  }
  const out = edges.slice(0, -1).map((x0, i) => ({ x0, x1: edges[i + 1], count: 0, values: [] }));
  for (const x of v) {
    let i = out.findIndex(b => x >= b.x0 && x < b.x1);
    if (i < 0 && x === edges[edges.length - 1]) i = out.length - 1;
    if (i >= 0) { out[i].count++; out[i].values.push(x); }
  }
  return out;
}

/** Empirical CDF as step points [[x, F(x)], …]. */
export function ecdf(values) {
  const v = finite(values).sort((a, b) => a - b), n = v.length, out = [];
  v.forEach((x, i) => { if (i === n - 1 || v[i + 1] !== x) out.push([x, (i + 1) / n]); });
  return out;
}

/**
 * Ordinary least squares y = a + b·x, with the confidence band of the mean
 * response (t-quantile for the requested level) evaluated at `at`.
 */
export function linearFit(points, { level = 0.95, at } = {}) {
  const p = points.filter(q => isNum(q[0]) && isNum(q[1])), k = p.length;
  if (k < 3) throw Error('linearFit(): at least 3 points required');
  const mx = mean(p.map(q => q[0])), my = mean(p.map(q => q[1]));
  let sxx = 0, sxy = 0;
  for (const [x, y] of p) { sxx += (x - mx) ** 2; sxy += (x - mx) * (y - my); }
  if (!sxx) throw Error('linearFit(): x has no variance');
  const b = sxy / sxx, a = my - b * mx;
  const residuals = p.map(([x, y]) => y - (a + b * x));
  const sse = residuals.reduce((s, r) => s + r * r, 0), se = Math.sqrt(sse / (k - 2));
  const sst = p.reduce((s, [, y]) => s + (y - my) ** 2, 0);
  const tq = tQuantile(1 - (1 - level) / 2, k - 2);
  const xs = at || (() => { const [lo, hi] = extent(p.map(q => q[0])); return Array.from({ length: 25 }, (_, i) => lo + ((hi - lo) * i) / 24); })();
  const band = xs.map(x => { const yh = a + b * x, w = tq * se * Math.sqrt(1 / k + (x - mx) ** 2 / sxx); return { x, y: yh, lo: yh - w, hi: yh + w }; });
  return { intercept: a, slope: b, r2: sst ? 1 - sse / sst : 1, se, n: k, residuals, band, level };
}

/** Student-t quantile via inverse regularized incomplete beta (bisection; adequate for figures). */
export function tQuantile(p, df) {
  if (df > 1000) return normalQuantile(p);
  let lo = -50, hi = 50;
  for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2; if (tCdf(mid, df) < p) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}
function tCdf(t, df) {
  const x = df / (df + t * t), ib = betaInc(x, df / 2, 0.5);
  return t >= 0 ? 1 - 0.5 * ib : 0.5 * ib;
}
function betaInc(x, a, b) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const lbeta = lgamma(a + b) - lgamma(a) - lgamma(b);
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b + lbeta) / a;
  // Lentz continued fraction
  let f = 1, c = 1, d = 0;
  for (let i = 0; i <= 300; i++) {
    const m = i >> 1;
    let num;
    if (i === 0) num = 1;
    else if (i % 2 === 0) num = (m * (b - m) * x) / ((a + 2 * m - 1) * (a + 2 * m));
    else num = -((a + m) * (a + b + m) * x) / ((a + 2 * m) * (a + 2 * m + 1));
    d = 1 + num * d; if (Math.abs(d) < 1e-30) d = 1e-30; d = 1 / d;
    c = 1 + num / c; if (Math.abs(c) < 1e-30) c = 1e-30;
    const cd = c * d; f *= cd;
    if (Math.abs(1 - cd) < 1e-10) break;
  }
  return front * (f - 1);
}
function lgamma(z) {
  const g = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let x = z, y = z, tmp = x + 5.5; tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (const c of g) ser += c / ++y;
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}
/** Inverse standard normal CDF (Acklam's rational approximation). */
export function normalQuantile(p) {
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const lowP = 0.02425;
  if (p < lowP) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  if (p > 1 - lowP) { const q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  const q = p - 0.5, r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

/** ROC points from scores (higher = more positive) and 0/1 labels. Includes (0,0) and (1,1). */
export function rocPoints(scores, labels) {
  const rows = scores.map((s, i) => [s, labels[i] ? 1 : 0]).sort((a, b) => b[0] - a[0]);
  const P = rows.filter(r => r[1]).length, N = rows.length - P;
  if (!P || !N) throw Error('rocPoints(): need both classes');
  const pts = [{ fpr: 0, tpr: 0, threshold: Infinity }];
  let tp = 0, fp = 0;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][1]) tp++; else fp++;
    if (i === rows.length - 1 || rows[i + 1][0] !== rows[i][0]) pts.push({ fpr: fp / N, tpr: tp / P, threshold: rows[i][0] });
  }
  return pts;
}
/** Precision–recall points; precision at recall 0 is taken from the first threshold. */
export function prPoints(scores, labels) {
  const rows = scores.map((s, i) => [s, labels[i] ? 1 : 0]).sort((a, b) => b[0] - a[0]);
  const P = rows.filter(r => r[1]).length;
  if (!P) throw Error('prPoints(): no positives');
  const pts = []; let tp = 0, fp = 0;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][1]) tp++; else fp++;
    if (i === rows.length - 1 || rows[i + 1][0] !== rows[i][0]) pts.push({ recall: tp / P, precision: tp / (tp + fp), threshold: rows[i][0] });
  }
  return [{ recall: 0, precision: pts[0].precision, threshold: Infinity }, ...pts];
}
/**
 * Trapezoidal area under a curve sorted by x. Accepts [x, y] pairs, rocPoints()
 * output ({fpr, tpr}), prPoints() output ({recall, precision}) or {x, y}.
 */
export function auc(points) {
  const xy = points.map(p => (Array.isArray(p) ? p : 'fpr' in p ? [p.fpr, p.tpr] : 'recall' in p ? [p.recall, p.precision] : [p.x, p.y]));
  let a = 0;
  for (let i = 1; i < xy.length; i++) a += ((xy[i][0] - xy[i - 1][0]) * (xy[i][1] + xy[i - 1][1])) / 2;
  return a;
}
/** Counts at a threshold: predicted positive when score ≥ threshold. */
export function confusionAt(scores, labels, threshold) {
  const c = { tp: 0, fp: 0, fn: 0, tn: 0 };
  scores.forEach((s, i) => { const pos = s >= threshold, y = !!labels[i]; c[pos && y ? 'tp' : pos ? 'fp' : y ? 'fn' : 'tn']++; });
  return c;
}
/** Reliability bins: mean predicted probability vs observed frequency per equal-width bin. */
export function calibrationBins(probs, labels, count = 10) {
  const out = Array.from({ length: count }, (_, i) => ({ x0: i / count, x1: (i + 1) / count, n: 0, sumP: 0, pos: 0 }));
  probs.forEach((p, i) => { const k = Math.min(count - 1, Math.floor(p * count)); const b = out[k]; b.n++; b.sumP += p; b.pos += labels[i] ? 1 : 0; });
  return out.map(b => ({ x0: b.x0, x1: b.x1, n: b.n, meanPredicted: b.n ? b.sumP / b.n : null, observed: b.n ? b.pos / b.n : null }));
}

/**
 * Deterministic 1-D beeswarm: places circles of radius r along x without overlap,
 * stacking them away from a center line. Returns [{x, y, i}] offsets from the line.
 */
export function beeswarm(xs, { r = 5, gap = 1 } = {}) {
  const order = xs.map((x, i) => ({ x, i })).filter(d => isNum(d.x)).sort((a, b) => a.x - b.x || a.i - b.i);
  const placed = [], d2 = (2 * r + gap) ** 2;
  for (const p of order) {
    const near = placed.filter(q => Math.abs(q.x - p.x) < 2 * r + gap);
    let best = 0;
    for (let k = 0; k < 400; k++) {
      const y = (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (r * 0.5);
      if (near.every(q => (q.x - p.x) ** 2 + (q.y - y) ** 2 >= d2)) { best = y; break; }
    }
    placed.push({ x: p.x, y: best, i: p.i });
  }
  return placed.sort((a, b) => a.i - b.i);
}

/** Rebase a series so its first finite value equals `base` (index = 100 by default). */
export function rebase(values, base = 100) {
  const first = values.find(isNum);
  if (!isNum(first) || first === 0) throw Error('rebase(): first finite value must be nonzero');
  return values.map(v => (isNum(v) ? (v / first) * base : null));
}
