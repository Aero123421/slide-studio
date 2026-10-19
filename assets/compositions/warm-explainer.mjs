// Composition study · Warm explainer — a precise cutaway that shows the mechanism, in soft colors.
// The flow lines are not drawn by hand: a small Darcy model solves the pressure in the puck,
// the stream function is integrated from the face fluxes, and the lines are its contours at
// equal steps, so each gap between two lines carries the same amount of water. The headline
// share and the shot time of the cracked puck come from the same solution.
import { svgRoot, el, g, textLines, contourLines, pathFromPoints, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const basket = { widthMm: 58, puckMm: 11, headspaceMm: 3 };       // 58 mm basket, 18 g dose
const cell = 0.25;                                                 // model resolution, mm
const crack = { atMm: 45, widthMm: 0.5, depthMm: 10, k: 1000 };    // crack permeability relative to the puck
const shot = { dose: 18, out: 36, evenSeconds: 27, tds: { even: 9.8, cracked: 8.2 } }; // grams, seconds, % TDS
const lines = 20;                                                  // flow lines per panel

// --- the model: cell-centred pressure, p = 1 under the shower screen, p = 0 at the basket floor
const nx = Math.round(basket.widthMm / cell), ny = Math.round(basket.puckMm / cell);
function solve(permeability) {
  const k = (i, j) => permeability(i, j);
  const T = (a, b) => (2 * a * b) / (a + b);                       // harmonic mean between two cells
  const p = Array.from({ length: ny }, (_, j) => new Float64Array(nx).fill(1 - (j + 0.5) / ny));
  for (let it = 0; it < 20000; it++) {                             // successive over-relaxation
    let change = 0;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const kc = k(i, j); let num = 0, den = 0;
      if (i > 0) { const t = T(kc, k(i - 1, j)); num += t * p[j][i - 1]; den += t; }
      if (i < nx - 1) { const t = T(kc, k(i + 1, j)); num += t * p[j][i + 1]; den += t; }
      if (j > 0) { const t = T(kc, k(i, j - 1)); num += t * p[j - 1][i]; den += t; } else { num += 2 * kc; den += 2 * kc; }
      if (j < ny - 1) { const t = T(kc, k(i, j + 1)); num += t * p[j + 1][i]; den += t; } else den += 2 * kc;
      const next = p[j][i] + 1.9 * (num / den - p[j][i]);
      change = Math.max(change, Math.abs(next - p[j][i])); p[j][i] = next;
    }
    if (change < 1e-10) break;
  }
  // downward flux through every horizontal face (row r = 0 is the top surface, r = ny the floor)
  const flux = (r, i) => (r === 0 ? 2 * k(i, 0) * (1 - p[0][i]) : r === ny ? 2 * k(i, ny - 1) * p[ny - 1][i] : T(k(i, r - 1), k(i, r)) * (p[r - 1][i] - p[r][i]));
  const total = Array.from({ length: nx }, (_, i) => flux(0, i)).reduce((s, v) => s + v, 0);
  // stream function on the nodes: cumulative flux from the left wall, 0 → 1
  const psi = Array.from({ length: ny + 1 }, (_, r) => { let s = 0; const row = [0]; for (let i = 0; i < nx; i++) { s += flux(r, i); row.push(s / total); } return row; });
  return { psi, total };
}
const c0 = Math.round(crack.atMm / cell), cw = Math.round(crack.widthMm / cell), cd = Math.round(crack.depthMm / cell);
const even = solve(() => 1);
const cracked = solve((i, j) => (i >= c0 && i < c0 + cw && j < cd ? crack.k : 1));
const rMid = Math.round(cd / 2);
const inCrack = [cracked.psi[rMid][c0], cracked.psi[rMid][c0 + cw]];   // stream-function values at the crack walls
const share = inCrack[1] - inCrack[0];                                 // fraction of all water inside the crack
const speedup = cracked.total / even.total;                            // same pressure, more flow
const crackedSeconds = Math.round(shot.evenSeconds / speedup);
const ey = tds => (tds * shot.out) / shot.dose;                        // extraction yield, %
const pct = fmt(share * 100, { digits: 0 });

export function figure(themeArg = 'css') {
  const t = makeTheme(themeArg), W = 1152, H = 460;
  const panelW = 540, gap = W - 2 * panelW, s = 500 / basket.widthMm, exag = 2;  // 8.6 px per mm, depth ×2
  const top = 64, screenY = top, puckTop = top + basket.headspaceMm * s * exag, puckBot = puckTop + basket.puckMm * s * exag;
  const levels = Array.from({ length: lines }, (_, m) => (m + 0.5) / lines);
  const panel = (px, model, title, withCrack) => {
    const bx = px + (panelW - basket.widthMm * s) / 2, bw = basket.widthMm * s;
    const X = i => bx + i * cell * s, Y = r => puckTop + r * cell * s * exag;
    const res = contourLines((i, r) => model.psi[Math.round(r)][Math.round(i)], { x0: 0, x1: nx, y0: 0, y1: ny, nx, ny, levels });
    const flow = res.flatMap(({ level, lines: ls }) => {
      const hot = withCrack && level > inCrack[0] && level < inCrack[1];
      return ls.map(l => el('path', { d: pathFromPoints(l.map(([i, r]) => [X(i), Y(r)])), fill: 'none', stroke: hot ? t.c('accent') : t.c('paper'), 'stroke-width': hot ? 1.6 : 1.3, 'stroke-linejoin': 'round', 'data-hot': hot ? 1 : null }));
    });
    const wall = 9, r0 = 10;                                         // basket wall rises 9 px above the screen
    const outline = `M${bx} ${screenY - wall}V${puckBot - r0}Q${bx} ${puckBot} ${bx + r0} ${puckBot}H${bx + bw - r0}Q${bx + bw} ${puckBot} ${bx + bw} ${puckBot - r0}V${screenY - wall}`;
    return g({},
      textLines([title], { x: px, y: 6, size: 20, weight: 700, valign: 'top', fill: t.c('ink') }),
      el('rect', { x: bx, y: screenY, width: bw, height: puckTop - screenY, fill: t.c('surface') }),          // water in the headspace
      el('path', { d: `M${bx} ${puckTop}H${bx + bw}V${puckBot - r0}Q${bx + bw} ${puckBot} ${bx + bw - r0} ${puckBot}H${bx + r0}Q${bx} ${puckBot} ${bx} ${puckBot - r0}Z`, fill: t.c('muted') }), // the puck
      withCrack ? el('rect', { x: X(c0), y: puckTop, width: cw * cell * s, height: cd * cell * s * exag, fill: t.c('surface') }) : '',
      flow,
      el('line', { x1: bx + 4, x2: bx + bw - 4, y1: screenY, y2: screenY, stroke: t.c('ink'), 'stroke-width': 2.5, 'stroke-dasharray': '7 4' }), // shower screen
      el('path', { d: outline, fill: 'none', stroke: t.c('ink'), 'stroke-width': 2.5, 'stroke-linejoin': 'round' }),
      el('line', { x1: bx + r0, x2: bx + bw - r0, y1: puckBot, y2: puckBot, stroke: t.c('paper'), 'stroke-width': 2.5, 'stroke-dasharray': '2 6' })); // floor perforations
  };
  const A = panel(0, even, 'Evenly tamped', false), B = panel(panelW + gap, cracked, 'Cracked while tamping', true);
  const strip = (px, seconds, tds, note) => g({},
    textLines([`${seconds} s`], { x: px, y: puckBot + 34, size: 44, weight: 700, valign: 'top', fill: t.c('ink'), attrs: { 'font-variant-numeric': 'tabular-nums' } }),
    textLines([`to pour ${shot.out} g from ${shot.dose} g`, `${fmt(ey(tds), { digits: 1 })}% extracted, ${note}`], { x: px + 118, y: puckBot + 40, size: 18, valign: 'top', lineHeight: 1.4, fill: t.c('ink') }));
  const bx = (panelW + gap) + (panelW - basket.widthMm * s) / 2, crackX = bx + (c0 + cw / 2) * cell * s;
  return svgRoot({ id: 'composition-warm-explainer-fig', width: W, height: H, theme: t,
    title: 'Cutaway of an espresso puck, evenly tamped and cracked, with computed flow lines',
    desc: `Twenty flow lines per puck, each gap carrying the same share of water. In the even puck the lines run straight down. In the cracked puck ${pct}% of the water runs through a crack ${crack.widthMm} mm wide; total flow rises ${fmt(speedup, { digits: 1 })} times, so the shot takes ${crackedSeconds} s instead of ${shot.evenSeconds} s and extracts ${fmt(ey(shot.tds.cracked), { digits: 1 })}% instead of ${fmt(ey(shot.tds.even), { digits: 1 })}%.` },
  A, B,
  textLines(['Water at 9 bar, 93 °C'], { x: (panelW - 500) / 2 + 12, y: (screenY + puckTop) / 2, size: 16, valign: 'middle', fill: t.c('ink') }),
  // crack callout: leader from the crack mouth up and right to the label
  el('path', { d: `M${crackX} ${puckTop - 3}V${screenY - 20}H${crackX + 26}`, fill: 'none', stroke: t.c('accent'), 'stroke-width': 1.4 }),
  textLines([`Crack ${crack.widthMm} mm wide: ${pct}% of the water`], { x: crackX + 32, y: screenY - 20, size: 17, weight: 700, valign: 'middle', fill: t.c('accent') }),
  strip(0, shot.evenSeconds, shot.tds.even, 'balanced'),
  strip(panelW + gap, crackedSeconds, shot.tds.cracked, 'sour'));
}

export default {
  study: true,
  id: 'composition-warm-explainer',
  title: 'Warm explainer: a precise cutaway drawing explains the mechanism',
  className: 'st cs-food-market cmp-warm',
  notes: 'Purpose: Explain how something works to a non-specialist audience (here, barista trainees) with one exact drawing of the mechanism, in a soft palette, and plain numbers for the consequence. The drawing replaces a paragraph; it does not decorate one.\nModify: Replace the model and drawing with your mechanism (a valve, a joint, a heat exchanger), but keep two states of the same object side by side at the same scale, label only the parts the explanation needs, and put the measurable consequence (time, yield, cost) directly under each state. Compute every number in the headline from the same model or data.\nInvariant: Same scale and same drawing vocabulary in both panels (one stroke weight for the object, one for the flow); muted fills, ink outlines; the accent marks only the cause (the crack and the water that takes it), and the headline phrase in accent names that mark. State any exaggeration (vertical scale ×2) on the page.\nStatic: Already static. For a build, show the even puck first and add the cracked puck as the second step.',
  sources: [],
  exportPolicy: 'final',
  content: `<h1 class="st-head">A crack ${crack.widthMm} mm wide carries <em>${pct}% of the water</em>, so the shot runs in ${crackedSeconds} s instead of ${shot.evenSeconds}</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative 2-D flow model and shot log · same grind, dose and pressure; target 18–22% extracted</span><span>Cutaway, depth drawn ×2</span></p>`,
};
