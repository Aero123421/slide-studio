// Composition study · Equation page — the notation large, each term explained beside it, and one
// plot that shows what the key term does. The worked example, the per-doubling step and the
// staircase on the plot are all computed from `law` and `today`.
import { svgRoot, el, g, textLines, linear, pathFromPoints, fmt, theme as makeTheme } from '../runtime/figure.mjs';

const law = { a: 5.35, c0: 278 };                  // ΔF = a · ln(C / C0), W m⁻²; C0 = CO₂ before 1750, ppm
const today = { year: 2024, c: 420 };              // ppm (illustrative round value)
const forcing = c => law.a * Math.log(c / law.c0);
const perDoubling = law.a * Math.LN2;              // W m⁻² added by every doubling
const now = forcing(today.c);
const doublings = [law.c0, 2 * law.c0, 4 * law.c0];
const f1 = v => fmt(v, { digits: 1 }), f2 = v => fmt(v, { digits: 2 });

const unit = 'W m<sup>−2</sup>';
const math = (inner, label) => `<math aria-label="${label}">${inner}</math>`;
const terms = [
  { sym: math('<mi mathvariant="normal">Δ</mi><mi>F</mi>', 'Delta F'), text: 'Forcing: extra energy kept per m² since 1750', value: unit },
  { sym: math('<mi>C</mi>', 'C'), text: 'CO₂ in the air now', value: `${today.c} ppm` },
  { sym: math('<msub><mi>C</mi><mn>0</mn></msub>', 'C zero'), text: 'CO₂ before 1750', value: `${law.c0} ppm` },
  { sym: math(`<mn>${law.a}</mn>`, String(law.a)), text: 'Fitted to radiative-transfer calculations', value: unit },
  { sym: math('<mi mathvariant="normal">ln</mi>', 'natural logarithm'), text: 'Natural log: each doubling adds one equal step', value: '', hot: true },
];

export function figure(themeArg = 'css') {
  const t = makeTheme(themeArg), W = 466, H = 452, m = { l: 40, r: 14, t: 34, b: 52 };
  const x = linear([200, 1200], [m.l, W - m.r]), y = linear([-2, 9], [H - m.b, m.t]);
  const curve = []; for (let c = 200; c <= 1200; c += 10) curve.push([x(c), y(forcing(c))]);
  const stairs = doublings.slice(1).map((c, i) => {
    const c0 = doublings[i], yA = y(forcing(c0)), yB = y(forcing(c));
    return g({},
      el('path', { d: `M${x(c0)} ${yA}H${x(c)}V${yB}`, fill: 'none', stroke: t.c('accent'), 'stroke-width': 2.4 }),
      textLines(['×2'], { x: (x(c0) + x(c)) / 2, y: yA - 9, size: 17, anchor: 'middle', fill: t.c('ink'), weight: 600 }),
      textLines([`+${f1(perDoubling)}`], { x: x(c) + 8, y: (yA + yB) / 2, size: 17, valign: 'middle', fill: t.c('accent'), weight: 700 }));
  });
  return svgRoot({ id: 'composition-equation-page-fig', width: W, height: H, theme: t,
    title: 'Radiative forcing of CO₂ against its concentration, 200 to 1,200 ppm',
    desc: `The curve ΔF = ${law.a} ln(C / ${law.c0}) flattens as concentration grows, but each doubling (${doublings.join(' to ')} ppm) adds the same ${f1(perDoubling)} W per square metre. ${today.year}: ${today.c} ppm gives ${f2(now)}.` },
  textLines(['Forcing, W m⁻²'], { x: 0, y: 2, size: 16, valign: 'top', fill: t.c('muted') }),
  [0, 2, 4, 6, 8].map(v => g({},
    el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), stroke: v === 0 ? t.c('ink') : t.c('grid'), 'stroke-width': v === 0 ? 1.4 : 1 }),
    textLines([String(v)], { x: m.l - 10, y: y(v), size: 16, anchor: 'end', valign: 'middle', fill: t.c('muted') }))),
  [200, 400, 600, 800, 1000, 1200].map(v => textLines([fmt(v)], { x: x(v), y: H - m.b + 12, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted') })),
  textLines(['CO₂ concentration, ppm'], { x: W - m.r, y: H - 4, size: 16, anchor: 'end', fill: t.c('muted') }),
  stairs,
  el('path', { d: pathFromPoints(curve), fill: 'none', stroke: t.c('ink'), 'stroke-width': 3, 'stroke-linejoin': 'round' }),
  el('circle', { cx: x(today.c), cy: y(now), r: 6, fill: t.c('ink'), stroke: t.c('paper'), 'stroke-width': 2 }),
  textLines([String(today.year)], { x: x(today.c) - 10, y: y(now) - 10, size: 17, anchor: 'end', fill: t.c('ink'), weight: 600 }),
  doublings.map((c, i) => textLines([`${fmt(c)} ppm`], i === 0
    ? { x: x(c) + 8, y: y(0) + 22, size: 15, fill: t.c('muted') }
    : { x: x(c) - 8, y: y(forcing(c)) - 10, size: 15, anchor: 'end', fill: t.c('muted') })));
}

export default {
  study: true,
  id: 'composition-equation-page',
  title: 'Equation page: the notation large, every term explained beside it',
  className: 'st cs-physics-lecture cmp-equation',
  notes: 'Purpose: Teach a formula so the audience can use it: the notation large enough to read from the back, every symbol defined in words with its unit and value, one worked example, and one plot that shows what the important term does.\nModify: Replace `law`, `today` and `terms` (one row per symbol, in the order they appear in the formula). Keep the MathML real (selectable, with an aria-label in words) and keep the sentence under the formula as the plain-language fallback. Recompute the worked example and the plot from the same constants.\nInvariant: The formula is set once, large, in real math markup; the term column repeats each symbol exactly as it appears in the formula; units on every quantity; the accent marks only the term being explained (ln) and what it does on the plot (equal steps per doubling), and the headline phrase in accent names that step. Axes and curve in ink.\nStatic: Already static.',
  sources: [{ type: 'original-example', file: 'assets/compositions/equation-page.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Each doubling of CO₂ adds the same <em>${f1(perDoubling)} W m<sup>−2</sup></em> of forcing</h1>
<div class="eq-formula" data-region="primary">
  <math class="eq-main" aria-label="Delta F equals ${law.a} times the natural logarithm of C over C zero"><mrow><mi mathvariant="normal">Δ</mi><mi>F</mi><mo>=</mo><mn>${law.a}</mn><mspace width="0.22em"></mspace><mi mathvariant="normal" class="eq-hot">ln</mi><mo>&#x2061;</mo><mrow><mo stretchy="false">(</mo><mi>C</mi><mo>/</mo><msub><mi>C</mi><mn>0</mn></msub><mo stretchy="false" lspace="0" rspace="0">)</mo></mrow></mrow></math>
  <p class="eq-words">In words: the extra heating grows with the logarithm of how many times CO₂ has multiplied since 1750.</p>
</div>
<dl class="eq-terms" data-region="support">${terms.map(r => `<div${r.hot ? ' class="eq-hot"' : ''}><dt>${r.sym}</dt>${r.value ? `<dd>${r.text}</dd><dd class="eq-unit">${r.value}</dd>` : `<dd class="eq-span">${r.text}</dd>`}</div>`).join('')}</dl>
<p class="eq-example" data-region="support">${today.year}: ${law.a} × ln(${today.c} ⁄ ${law.c0}) = <b>${f2(now)} ${unit}</b></p>
<figure class="eq-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Simplified expression for CO₂ forcing; constants from the published fit, ${today.year} value rounded</span><span>Equation, terms and one plot</span></p>`,
};
