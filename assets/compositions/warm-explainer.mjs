// Composition study · Warm explainer — a precise cutaway that shows the mechanism, in soft colors.
// The flow lines are not drawn by hand: a small Darcy model solves the pressure in the puck,
// the stream function is integrated from the face fluxes, and the lines are its contours at
// equal steps, so each gap between two lines carries the same amount of water. The headline
// share and the shot time of the cracked puck come from the same solution.
import { svgRoot, el, g, textLines, contourLines, pathFromPoints, measureText, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const basket = { widthMm: 58, puckMm: 11, headspaceMm: 3 };       // 58 mm basket, 18 g dose
const cell = 0.25;                                                 // model resolution, mm
const crack = { atMm: 45, widthMm: 0.5, depthMm: 10, k: 1000 };    // crack permeability relative to the puck
const shot = { dose: 18, out: 36, evenSeconds: 27, tds: { even: 9.8, cracked: 8.2 } }; // grams, seconds, % TDS
const lines = 20;                                                  // flow lines in the even puck; each carries 1/20 of its flow

// --- the model: cell-centred pressure, p = 1 under the shower screen, p = 0 at the basket floor
const nx = Math.round(basket.widthMm / cell), ny = Math.round(basket.puckMm / cell);
function solve(permeability) {
  const N = nx * ny, k = new Float64Array(N);
  for (let c = 0; c < N; c++) k[c] = permeability(c % nx, Math.floor(c / nx));
  const T = (a, b) => (2 * a * b) / (a + b);                       // harmonic mean between two cells
  const tE = new Float64Array(N), tS = new Float64Array(N);         // transmissibility to the east / south neighbour
  for (let c = 0; c < N; c++) { if (c % nx < nx - 1) tE[c] = T(k[c], k[c + 1]); if (c + nx < N) tS[c] = T(k[c], k[c + nx]); }
  const p = new Float64Array(N);
  for (let c = 0; c < N; c++) p[c] = 1 - (Math.floor(c / nx) + 0.5) / ny;   // start from the even-puck solution
  for (let it = 0; it < 20000; it++) {                             // successive over-relaxation
    let change = 0;
    for (let c = 0; c < N; c++) {
      const i = c % nx; let num = 0, den = 0;
      if (i > 0) { num += tE[c - 1] * p[c - 1]; den += tE[c - 1]; }
      if (i < nx - 1) { num += tE[c] * p[c + 1]; den += tE[c]; }
      if (c >= nx) { num += tS[c - nx] * p[c - nx]; den += tS[c - nx]; } else { num += 2 * k[c]; den += 2 * k[c]; } // p = 1 at the screen
      if (c + nx < N) { num += tS[c] * p[c + nx]; den += tS[c]; } else den += 2 * k[c];                             // p = 0 at the floor
      const next = p[c] + 1.95 * (num / den - p[c]);
      change = Math.max(change, Math.abs(next - p[c])); p[c] = next;
    }
    if (change < 1e-9) break;
  }
  // downward flux through every horizontal face (row r = 0 is the top surface, r = ny the floor)
  const flux = (r, i) => (r === 0 ? 2 * k[i] * (1 - p[i]) : r === ny ? 2 * k[(ny - 1) * nx + i] * p[(ny - 1) * nx + i] : tS[(r - 1) * nx + i] * (p[(r - 1) * nx + i] - p[r * nx + i]));
  let total = 0; for (let i = 0; i < nx; i++) total += flux(0, i);
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
  const t = makeTheme(themeArg), W = 1152, H = 470;
  const panelW = 540, gap = W - 2 * panelW, s = 500 / basket.widthMm, exag = 2.5;  // 8.6 px per mm across, depth drawn ×2.5
  const screenY = 52, puckTop = screenY + basket.headspaceMm * s * exag, puckBot = puckTop + basket.puckMm * s * exag;
  // One line = the same amount of water in both panels (1/20 of the even puck's flow), so the
  // cracked puck has more lines in total and its bulk has fewer than the even one.
  const levelsFor = model => { const step = even.total / model.total / lines, out = []; for (let v = step / 2; v < 1; v += step) out.push(v); return out; };
  const panel = (px, model, title, withCrack) => {
    const bx = px + (panelW - basket.widthMm * s) / 2, bw = basket.widthMm * s;
    const X = i => bx + i * cell * s, Y = r => puckTop + r * cell * s * exag;
    const res = contourLines((i, r) => model.psi[Math.round(r)][Math.round(i)], { x0: 0, x1: nx, y0: 0, y1: ny, nx, ny, levels: levelsFor(model) });
    const flow = res.flatMap(({ level, lines: ls }) => {
      const hot = withCrack && level > inCrack[0] && level < inCrack[1];
      return ls.map(l => el('path', { d: pathFromPoints(l.map(([i, r]) => [X(i), Y(r)])), fill: 'none', stroke: hot ? t.c('accent') : t.c('paper'), 'stroke-width': hot ? 1.5 : 1.3, 'stroke-linejoin': 'round' }));
    });
    const wall = 10, r0 = 12;                                        // basket wall rises above the screen; rounded floor
    const outline = `M${bx} ${screenY - wall}V${puckBot - r0}Q${bx} ${puckBot} ${bx + r0} ${puckBot}H${bx + bw - r0}Q${bx + bw} ${puckBot} ${bx + bw} ${puckBot - r0}V${screenY - wall}`;
    return g({ class: 'we-panel' },
      textLines([title], { x: px, y: 0, size: 20, weight: 700, valign: 'top', fill: t.c('ink') }),
      el('path', { d: `M${bx} ${screenY}H${bx + bw}V${puckTop}H${bx}Z`, fill: t.c('surface') }),               // water in the headspace, between screen and puck
      el('path', { d: `M${bx} ${puckTop}H${bx + bw}V${puckBot - r0}Q${bx + bw} ${puckBot} ${bx + bw - r0} ${puckBot}H${bx + r0}Q${bx} ${puckBot} ${bx} ${puckBot - r0}Z`, fill: t.c('muted') }), // the puck
      withCrack ? el('rect', { x: X(c0), y: puckTop, width: cw * cell * s, height: cd * cell * s * exag, fill: t.c('surface') }) : '',
      flow,
      el('line', { x1: bx + 4, x2: bx + bw - 4, y1: screenY, y2: screenY, stroke: t.c('ink'), 'stroke-width': 2.5, 'stroke-dasharray': '7 4' }), // shower screen
      el('path', { d: outline, fill: 'none', stroke: t.c('ink'), 'stroke-width': 2.5, 'stroke-linejoin': 'round' }),
      el('line', { x1: bx + r0, x2: bx + bw - r0, y1: puckBot, y2: puckBot, stroke: t.c('paper'), 'stroke-width': 2.5, 'stroke-dasharray': '2 6' })); // floor perforations
  };
  const bxA = (panelW - basket.widthMm * s) / 2, bxB = panelW + gap + bxA;
  const crackX = bxB + (c0 + cw / 2) * cell * s, headMid = (screenY + puckTop) / 2;
  const crackLabel = `Crack ${crack.widthMm} mm wide: ${pct}% of the water`;
  const labelEnd = bxB + 14 + measureText(crackLabel, 17, { weight: 700 }) * 1.04;
  const strip = (px, seconds, tds, note) => g({},
    textLines([`${seconds} s`], { x: px, y: puckBot + 30, size: 44, weight: 700, valign: 'top', fill: t.c('ink'), attrs: { 'font-variant-numeric': 'tabular-nums' } }),
    textLines([`to pour ${shot.out} g from ${shot.dose} g`, `${fmt(ey(tds), { digits: 1 })}% extracted, ${note}`], { x: px + 118, y: puckBot + 35, size: 18, valign: 'top', lineHeight: 1.4, fill: t.c('ink') }));
  return svgRoot({ id: 'composition-warm-explainer-fig', width: W, height: H, theme: t,
    title: 'Cutaway of an espresso puck, evenly tamped and cracked, with computed flow lines',
    desc: `Each flow line carries the same amount of water in both pucks. In the even puck ${lines} lines run straight down. In the cracked puck ${pct}% of the water runs through a crack ${crack.widthMm} mm wide; total flow rises ${fmt(speedup, { digits: 1 })} times, so the shot takes ${crackedSeconds} s instead of ${shot.evenSeconds} s and extracts ${fmt(ey(shot.tds.cracked), { digits: 1 })}% instead of ${fmt(ey(shot.tds.even), { digits: 1 })}%.` },
  panel(0, even, 'Evenly tamped', false),
  panel(panelW + gap, cracked, 'Cracked while tamping', true),
  textLines(['Water at 9 bar and 93 °C, over 18 g of coffee'], { x: bxA + 14, y: headMid, size: 17, valign: 'middle', fill: t.c('ink') }),
  textLines([crackLabel], { x: bxB + 14, y: headMid, size: 17, weight: 700, valign: 'middle', fill: t.c('accent') }),
  el('path', { d: `M${labelEnd + 8} ${headMid}H${crackX}V${puckTop - 2}`, fill: 'none', stroke: t.c('accent'), 'stroke-width': 1.5 }),
  strip(0, shot.evenSeconds, shot.tds.even, 'balanced'),
  strip(panelW + gap, crackedSeconds, shot.tds.cracked, 'sour'));
}

export default {
  study: true,
  id: 'composition-warm-explainer',
  title: 'Warm explainer: a precise cutaway drawing explains the mechanism',
  className: 'st cs-food-market cmp-warm',
  notes: 'Purpose: Explain how something works to a non-specialist audience (here, barista trainees) with one exact drawing of the mechanism, in a soft palette, and plain numbers for the consequence. The drawing replaces a paragraph; it does not decorate one.\nModify: Replace the model and drawing with your mechanism (a valve, a joint, a heat exchanger), but keep two states of the same object side by side at the same scale, label only the parts the explanation needs, and put the measurable consequence (time, yield, cost) directly under each state. Compute every number in the headline from the same model or data.\nInvariant: Same scale and same drawing vocabulary in both panels (one stroke weight for the object, one for the flow); muted fills, ink outlines; the accent marks only the cause (the crack and the water that takes it), and the headline phrase in accent names that mark. State any exaggeration (here the depth is drawn ×2.5) on the page.\nStatic: Already static. For a build, show the even puck first and add the cracked puck as the second step.',
  sources: [{ type: 'original-example', file: 'assets/compositions/warm-explainer.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">A crack ${crack.widthMm} mm wide carries <em style="white-space:nowrap">${pct}% of the water</em>, so the shot runs in ${crackedSeconds} s instead of ${shot.evenSeconds}</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative 2-D flow model and shot log; same grind, dose and pressure; target 18–22% extracted</span><span>Each line carries the same flow · depth drawn ×2.5</span></p>`,
};
