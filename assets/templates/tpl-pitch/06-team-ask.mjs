// Template: Parwell seed memorandum · Team and ask. Synthetic example content; replace data and copy.
// The raise as one proportional bar, the milestones it buys (today vs target) and the
// founders as text. Dollar amounts, the kitchen target and target ARR derive from `ask`.
import { theme, el, svgRoot, textLines, measureText, fmt } from '../../runtime/figure.mjs';

const ID = 'tpl-pitch-team-ask';
const ask = {
  raise: 4.0e6, months: 24, by: 'October 2028',        // USD; runway in months
  funds: [                                              // shares of the raise, must sum to 1
    { name: 'Product and forecasting', share: 0.45 },
    { name: 'Sales and onboarding', share: 0.35, buysKitchens: true },
    { name: 'Integrations', share: 0.12 },
    { name: 'Operations', share: 0.08 },
  ],
  cac: 2400, price: 300 * 12,                           // USD per new kitchen; USD per kitchen per year
  today: { kitchens: 118, distributors: 4 },            // September 2026
  distributorsTarget: 12,
};
const founders = [
  { name: 'Maren Holt', role: 'CEO', credential: 'Seven years running purchasing for a nine-restaurant group' },
  { name: 'Daniel Okoro', role: 'CTO', credential: 'Built fresh-produce forecasting for a 400-store grocery chain' },
  { name: 'Inès Faure', role: 'Head of Kitchens', credential: 'Chef-owner of a 60-seat bistro for eight years' },
];
const total = ask.funds.reduce((s, f) => s + f.share, 0);
if (Math.abs(total - 1) > 1e-9) throw Error(`${ID}: fund shares sum to ${total}, not 1`);
const sales = ask.funds.find(f => f.buysKitchens);
const salesBudget = ask.raise * sales.share;
const newKitchens = Math.floor(salesBudget / ask.cac);
const targetKitchens = Math.round((ask.today.kitchens + newKitchens) / 50) * 50;
const targetArr = targetKitchens * ask.price;
const todayArr = ask.today.kitchens * ask.price;
const m = v => v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : `$${fmt(Math.round(v / 1000))}k`;

// ---- use of funds: one bar on the full 12-column width ----
const t = theme('css');
const W = 1152, H = 92, BH = 28, GAP = 3;
let acc = 0;
const segs = ask.funds.map(f => { const x0 = acc * W; acc += f.share; return { ...f, x0, x1: acc * W }; });
const marks = segs.map((s, i) => {
  const last = i === segs.length - 1;
  const lines = [s.name, `${m(ask.raise * s.share)}, ${fmt(s.share * 100)}%`];
  const wide = Math.max(...lines.map(l => measureText(l, 17, { weight: 600 })));
  const right = last && s.x0 + wide > W;                 // the last label hangs from the bar end if it would run out
  const tx = right ? W : s.x0, anchor = right ? 'end' : 'start';
  return el('rect', { x: s.x0 + (i ? GAP / 2 : 0), y: 0, width: s.x1 - s.x0 - (i ? GAP / 2 : 0) - (last ? 0 : GAP / 2), height: BH, fill: s.buysKitchens ? t.c('accent') : t.c('context') })
    + textLines([lines[0]], { x: tx, y: BH + 26, size: 17, anchor, weight: 600, fill: s.buysKitchens ? 'var(--pp-accent-ink)' : t.c('ink') })
    + textLines([lines[1]], { x: tx, y: BH + 50, size: 17, anchor, fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } });
}).join('');
const funds = svgRoot({
  id: `${ID}-funds`, width: W, height: H, theme: t,
  title: `Use of the ${m(ask.raise)} seed round over ${ask.months} months`,
  desc: segs.map(s => `${s.name} ${m(ask.raise * s.share)} (${fmt(s.share * 100)}%)`).join('; ') + '.',
}, marks);

export default {
  study: true,
  id: ID,
  title: 'Team and ask: the raise, use of funds and milestones',
  notes: `Purpose: Close the pitch with the amount, where it goes, what it buys and who will do it.\nModify: Edit \`ask\` (raise, runway, fund shares, CAC, price, today’s numbers) and \`founders\` (one credential each, the one that matters for this company). Dollar amounts, the kitchen target and target ARR recompute; the module throws if the shares do not sum to 100%.\nInvariant: One proportional bar for use of funds, labelled in place; new kitchens = sales budget ÷ CAC (churn not netted, as the source line says); target ARR = target kitchens × the same price as the other pages; the accent marks the money that buys the milestone.\nStatic: Already static.`,
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-pitch pp-ask',
  content: `<div class="pp-run"><span>Parwell — Seed memorandum, October 2026</span><span>6</span></div>
<h1 class="pp-head" data-region="title">We are raising ${m(ask.raise)} to reach ${fmt(targetKitchens)} kitchens and ${m(targetArr)} ARR by ${ask.by}</h1>
<p class="pp-ex" data-region="support"><b>Exhibit 5</b>Use of funds, ${m(ask.raise)} over ${ask.months} months</p>
<figure class="pp-funds" data-region="primary">${funds}</figure>
<table class="pp-buys" data-region="support">
  <thead><tr><th>What it buys</th><th>Today</th><th>${ask.by}</th></tr></thead>
  <tbody>
    <tr><td>Live kitchens</td><td>${fmt(ask.today.kitchens)}</td><td class="goal">${fmt(targetKitchens)}</td></tr>
    <tr><td>Annual recurring revenue</td><td>${m(todayArr)}</td><td class="goal">${m(targetArr)}</td></tr>
    <tr><td>Distributors taking our orders</td><td>${ask.today.distributors}</td><td class="goal">${ask.distributorsTarget}</td></tr>
  </tbody>
</table>
<div class="pp-team" data-region="support"><h2>Founders</h2>
  ${founders.map(f => `<p><b>${f.name}, ${f.role}</b>${f.credential}</p>`).join('\n  ')}
</div>
<p class="pp-source" data-region="source">${sales.name} ${m(salesBudget)} ÷ $${fmt(ask.cac)} per kitchen = ${fmt(newKitchens)} new kitchens; ${ask.today.kitchens} today + ${newKitchens} ≈ ${fmt(targetKitchens)}, before churn. ARR at $${fmt(ask.price)} a kitchen a year.</p>`,
};
