// Diagram study · Funnel — how many remain after each stage, with a defined encoding.
// Bar width is proportional to the count at each stage; the step rate is computed between
// neighbours. The largest cut, the rail numbers and the headline come from `stages`.
import { funnelChart, el, g, textLines, fmt, pct } from '../runtime/figure.mjs';

const stages = [ // applications in the 2026 round of a community health fund (illustrative)
  { label: 'Letters of intent', value: 1240 },
  { label: 'Pass eligibility screen', value: 412 },
  { label: 'Invited to full proposal', value: 186 },
  { label: 'Full proposal submitted', value: 171 },
  { label: 'Site visit', value: 58 },
  { label: 'Funded', value: 31 },
];
const steps = stages.slice(1).map((s, i) => ({ ...s, from: stages[i], lost: stages[i].value - s.value, rate: s.value / stages[i].value }));
const cut = [...steps].sort((a, b) => b.lost - a.lost)[0];
const laterLost = steps.filter(s => s !== cut && stages.indexOf(s.from) > stages.indexOf(cut.from)).reduce((sum, s) => sum + s.lost, 0);
const first = stages[0], last = stages.at(-1);

export function figure(theme = 'css') {
  return funnelChart({
    id: 'funnel-fig', theme, width: 800, height: 470, fontSize: 17,
    title: 'Applications remaining at each stage of the 2026 community health fund round',
    desc: `Bar width is proportional to the number of applications at each stage; at the eligibility screen, the accent wings show the width that was lost. ${fmt(first.value)} letters of intent became ${fmt(last.value)} grants (${pct(last.value / first.value, 1)}). The largest cut is the eligibility screen: ${fmt(cut.lost)} letters stop there, ${pct(cut.rate)} continue; all later stages together remove ${fmt(laterLost)}.`,
    stages, highlight: () => false, format: { digits: 0 },
    // The largest cut: the previous stage's width, drawn around the remaining bar, with the lost part in accent.
    extra: ({ t, y, box }) => {
      const max = stages[0].value, cx = box.x + box.w / 2, prevW = (cut.from.value / max) * box.w, curW = (cut.value / max) * box.w;
      const wing = (prevW - curW) / 2, yy = y(cut.label), h = y.bw;
      return g({ class: 'funnel-cut' },
        el('rect', { x: cx - prevW / 2, y: yy, width: wing - 3, height: h, rx: 4, fill: t.c('accent') }),
        el('rect', { x: cx + curW / 2 + 3, y: yy, width: wing - 3, height: h, rx: 4, fill: t.c('accent') }),
        textLines([`${fmt(cut.lost)} stopped`], { x: cx - prevW / 2 + (wing - 3) / 2, y: yy + h / 2, size: 16, anchor: 'middle', valign: 'middle', fill: t.c('onAccent'), weight: 700 }));
    },
  });
}

export default {
  study: true,
  id: 'funnel',
  title: 'Funnel: items remaining after each stage',
  className: 'st st--rail cs-nonprofit-warm',
  notes: 'Purpose: Show how many items remain after each stage and where the largest loss happens.\nModify: Replace `stages` with your counts (each stage a subset of the one before). Widths, step rates, the largest cut, the rail and the headline recompute.\nInvariant: The encoding is defined: bar width is proportional to count (say so); stages are nested subsets in order; rates are stage-to-stage, and the overall rate is stated separately.\nStatic: Already static. For a build, pass build:{by:"mark"} to reveal stages top to bottom.',
  sources: [{ type: 'original-example', file: 'assets/svg/funnel.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Of ${fmt(first.value)} letters of intent, <em>${fmt(cut.lost)} stopped</em> at the eligibility screen, more than every later stage combined</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<div class="st-rail" data-region="support">
  <div class="st-kpi"><b>${pct(last.value / first.value, 1)}</b><span>${fmt(last.value)} grants from ${fmt(first.value)} letters of intent.</span></div>
  <hr class="st-rule">
  <div class="st-kpi"><b>${fmt(laterLost)}</b><span>removed by all the later stages together.</span></div>
</div>
<p class="st-source" data-region="source"><span>Illustrative data · bar width proportional to count; rates are stage to stage</span><span>Funnel chart</span></p>`,
};
