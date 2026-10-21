// Motion study · Reveal a conditional branch — the guard and every branch are on screen
// before anything is decided; build 1 evaluates the guard against the patient's own
// readings, build 2 draws the branch that the evaluation selects. The path is computed.
import { svgRoot, el, g, textLines, measureText, arrowMarker, theme as makeTheme } from '../runtime/figure.mjs';

const patient = { arrived: '14:52', complaint: 'Short of breath for two days', highRisk: false,
  vitals: { spo2: 88, rr: 26, hr: 118, sbp: 104 } };   // illustrative triage readings
const vitalRows = [
  { key: 'spo2', label: 'SpO₂', unit: '%' }, { key: 'rr', label: 'Resp. rate', unit: '/min' },
  { key: 'hr', label: 'Heart rate', unit: '/min' }, { key: 'sbp', label: 'Systolic BP', unit: 'mmHg' },
];
// Guard 1: any danger sign sends the patient to resuscitation. Guard 2 only runs if guard 1 is false.
const danger = [
  { key: 'spo2', text: 'SpO₂ below 90%', test: v => v < 90 },
  { key: 'rr', text: 'Resp. rate above 30', test: v => v > 30 },
  { key: 'sbp', text: 'Systolic BP below 90', test: v => v < 90 },
];
const outcomes = { resus: ['Resuscitation bay', 'seen at once'], majors: ['Majors', 'seen within 15 min'], waiting: ['Waiting area', 'seen within 60 min'] };

const fired = danger.filter(d => d.test(patient.vitals[d.key]));
const route = fired.length ? 'resus' : patient.highRisk ? 'majors' : 'waiting';
const decisive = fired[0] && vitalRows.find(r => r.key === fired[0].key);

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, id = 'motion-branch-reveal-fig';
  const v = patient.vitals;
  // Patient card
  const P = { x: 0, y: 34, w: 286, h: 404 };
  const reading = (r, fill) => textLines([r.unit === '%' ? `${v[r.key]}%` : `${v[r.key]} ${r.unit}`], { x: P.x + P.w - 22, y: P.y + 150 + vitalRows.indexOf(r) * 60, size: 20, weight: 700, anchor: 'end', valign: 'middle', fill });
  const card = g({},
    el('rect', { x: P.x, y: P.y, width: P.w, height: P.h, rx: 14, fill: t.c('surface'), stroke: t.c('rule') }),
    textLines([`Arrival ${patient.arrived}`], { x: P.x + 22, y: P.y + 24, size: 16, weight: 700, valign: 'top', fill: t.c('muted') }),
    textLines(['Short of breath', 'for two days'], { x: P.x + 22, y: P.y + 54, size: 20, weight: 700, valign: 'top', fill: t.c('ink'), lineHeight: 1.25 }),
    vitalRows.map((r, k) => {
      const y = P.y + 150 + k * 60;
      return g({}, el('line', { x1: P.x + 22, x2: P.x + P.w - 22, y1: y - 22, y2: y - 22, stroke: t.c('rule') }),
        textLines([r.label], { x: P.x + 22, y, size: 16, valign: 'middle', fill: t.c('muted') }),
        // The reading that trips the guard turns accent when the guard is evaluated (build 1).
        fired.some(d => d.key === r.key)
          ? [g({ 'data-states': { 0: { opacity: 1 }, 1: { opacity: 0 } }, 'data-duration': 400 }, reading(r, t.c('ink'))),
            g({ 'data-states': { 0: { opacity: 0 }, 1: { opacity: 1 } }, 'data-duration': 400 }, reading(r, t.c('accent')))]
          : reading(r, t.c('ink')));
    }));

  // Guard 1, its conditions, and the verdict per condition (build 1)
  const G = { x: 368, y: 34, w: 360, h: 248 };
  const condY = k => G.y + 104 + k * 44;
  const guard = g({},
    el('rect', { x: G.x, y: G.y, width: G.w, height: G.h, rx: 14, fill: t.c('paper'), stroke: t.c('ink'), 'stroke-width': 2 }),
    textLines(['Any danger sign?'], { x: G.x + 22, y: G.y + 24, size: 21, weight: 700, valign: 'top', fill: t.c('ink') }),
    textLines(['One is enough'], { x: G.x + 22, y: G.y + 56, size: 16, valign: 'top', fill: t.c('muted') }),
    danger.map((d, k) => textLines([d.text], { x: G.x + 22, y: condY(k), size: 17, valign: 'middle', fill: t.c('ink') })));
  const verdicts = g({ 'data-step': 1, 'data-motion': 'reveal', 'data-stagger': 160 },
    danger.map((d, k) => {
      const hit = d.test(v[d.key]), row = vitalRows.find(r => r.key === d.key);
      return textLines([`${v[d.key]}${row.unit === '%' ? '%' : ''} · ${hit ? 'yes' : 'no'}`], { x: G.x + G.w - 22, y: condY(k), size: 17, weight: hit ? 700 : 500, anchor: 'end', valign: 'middle', fill: hit ? t.c('accent') : t.c('muted') });
    }));

  // Guard 2 (reached only on "no") and the three destinations
  const O = { x: 846, w: 306, h: 74 }, oy = { resus: G.y + 34, majors: H - 2 * O.h - 22, waiting: H - O.h - 4 };
  const G2 = { x: 448, w: 280, h: 76, y: (oy.majors + oy.waiting + O.h) / 2 - 38 };
  const box = k => ({ x: O.x, y: oy[k], w: O.w, h: O.h });
  // A destination; the selected one turns accent in build 2 (same box, its state crossfades).
  const dest = k => {
    const b = box(k), [name, sub] = outcomes[k];
    const face = (fill, ink, sub2, stroke) => g({}, el('rect', { x: b.x, y: b.y, width: b.w, height: b.h, rx: 12, fill, stroke }),
      textLines([name], { x: b.x + 20, y: b.y + 30, size: 19, weight: 700, valign: 'middle', fill: ink }),
      textLines([sub], { x: b.x + 20, y: b.y + 54, size: 16, valign: 'middle', fill: sub2 }));
    if (k !== route) return face(t.c('surface'), t.c('ink'), t.c('muted'), t.c('rule'));
    return g({}, g({ 'data-states': { 0: { opacity: 1 }, 2: { opacity: 0 } }, 'data-duration': 500 }, face(t.c('surface'), t.c('ink'), t.c('muted'), t.c('rule'))),
      g({ 'data-states': { 0: { opacity: 0 }, 2: { opacity: 1 } }, 'data-duration': 500 }, face(t.c('accent'), t.c('onAccent'), t.c('onAccent'), t.c('accent'))));
  };
  const guard2 = g({},
    el('rect', { x: G2.x, y: G2.y, width: G2.w, height: G2.h, rx: 12, fill: t.c('paper'), stroke: t.c('muted'), 'stroke-width': 1.4 }),
    textLines(['High-risk complaint?'], { x: G2.x + 20, y: G2.y + 30, size: 18, weight: 700, valign: 'middle', fill: t.c('ink') }),
    textLines(['chest pain, stroke signs, sepsis'], { x: G2.x + 20, y: G2.y + 54, size: 16, valign: 'middle', fill: t.c('muted') }));

  // Edges: every branch exists from the start (context); the selected one is drawn in build 2.
  const edge = (d, label, lx, ly, taken) => g({},
    el('path', { d, fill: 'none', stroke: t.c('context'), 'stroke-width': 2, 'marker-end': `url(#${id}-arr)` }),
    taken ? g({ 'data-step': 2, 'data-motion': 'draw', 'data-duration': 800, 'data-easing': 'smooth' },
      el('path', { d, fill: 'none', stroke: t.c('accent'), 'stroke-width': 4, 'stroke-linecap': 'round', 'marker-end': `url(#${id}-arr-accent)` })) : '',
    el('rect', { x: lx - measureText(label, 16, { weight: 700 }) / 2 - 7, y: ly - 12, width: measureText(label, 16, { weight: 700 }) + 14, height: 24, fill: t.c('paper') }),
    textLines([label], { x: lx, y: ly, size: 16, weight: 700, anchor: 'middle', valign: 'middle', fill: taken ? t.c('accent') : t.c('muted') }));
  const yRes = box('resus').y + O.h / 2, yMaj = box('majors').y + O.h / 2, yWait = box('waiting').y + O.h / 2;
  const gx2 = G2.x + G2.w, midX = (gx2 + O.x) / 2;
  const edges = [
    edge(`M${G.x + G.w} ${yRes}H${O.x - 4}`, 'Yes', (G.x + G.w + O.x) / 2, yRes, route === 'resus'),
    edge(`M${G2.x + 70} ${G.y + G.h}V${G2.y - 4}`, 'No', G2.x + 70, (G.y + G.h + G2.y) / 2, route !== 'resus'),
    edge(`M${gx2} ${G2.y + 26}H${midX}V${yMaj}H${O.x - 4}`, 'Yes', midX, (G2.y + 26 + yMaj) / 2, route === 'majors'),
    edge(`M${gx2} ${G2.y + 52}H${midX}V${yWait}H${O.x - 4}`, 'No', midX + 30, yWait, route === 'waiting'),
  ];
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'Emergency triage: danger-sign guard evaluated before the branch is taken',
    desc: `Patient arriving ${patient.arrived} with ${patient.complaint.toLowerCase()}: SpO₂ ${v.spo2}%, respiratory rate ${v.rr}, heart rate ${v.hr}, systolic ${v.sbp}. Guard: any danger sign (SpO₂ below 90%, respiratory rate above 30, systolic below 90) sends the patient to resuscitation. ${fired.length} sign met, so the route is ${outcomes[route][0].toLowerCase()}.` },
  el('defs', {}, arrowMarker(`${id}-arr`, t.c('context')), arrowMarker(`${id}-arr-ink`, t.c('ink')), arrowMarker(`${id}-arr-accent`, t.c('accent'))),
  el('path', { d: `M${P.x + P.w} ${G.y + 60}H${G.x - 4}`, fill: 'none', stroke: t.c('ink'), 'stroke-width': 2, 'marker-end': `url(#${id}-arr-ink)` }),
  edges, card, guard, verdicts, guard2, Object.keys(outcomes).map(dest));
}

export default {
  study: true,
  id: 'motion-branch-reveal',
  title: 'Reveal a conditional branch',
  className: 'st cs-clinical-trial',
  notes: 'Purpose: Make the guard visible, and evaluate it in view, before any path is taken.\nModify: Change `patient.vitals`, `danger` thresholds or `outcomes`; the verdicts, the selected route and the headline are computed, so a different patient takes a different branch.\nInvariant: All branches are drawn from build 0 as context; the guard\'s verdict (build 1) precedes the taken path (build 2); untaken branches stay visible.\nStatic: The final build shows the guard, each condition\'s verdict and the taken path together.',
  sources: [{ type: 'original-example', file: 'assets/motion/branch-reveal.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">${fired.length === 1 ? 'One reading decides it' : `${fired.length} readings decide it`}: ${decisive ? `an ${decisive.label} of ${patient.vitals[decisive.key]}${decisive.unit} sends this patient straight to the <em>resuscitation bay</em>` : 'no danger sign, so the second guard decides'}</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative patient and thresholds · not clinical guidance</span><span>Motion · guard shown, evaluated, then branch taken (2 builds)</span></p>`,
};
