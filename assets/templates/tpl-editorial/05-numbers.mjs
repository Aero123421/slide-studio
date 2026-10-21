// Template: Quire visual essay · Numbers. Synthetic example content; replace data and copy.
// The recipe as a typographic table: five large numerals with their units, each with a
// one-line name and a sentence. The ratio and the flow rate are computed from the recipe.
import { fmt } from '../../runtime/figure.mjs';

const ID = 'tpl-editorial-numbers';
const recipe = { dose: 18, yield: 36, time: 28, temp: 93 };       // g, g, s, °C
const words = { 18: 'Eighteen', 28: 'twenty-eight', 36: 'thirty-six' };
const ratio = recipe.yield / recipe.dose;                       // 1 : 2
const flow = recipe.yield / recipe.time;                        // g per second
const rows = [
  { name: 'Dose', n: recipe.dose, unit: 'g', text: 'Ground coffee, weighed to a tenth of a gram.' },
  { name: 'Yield', n: recipe.yield, unit: 'g', text: 'Espresso in the cup, by weight, not volume.' },
  { name: 'Time', n: recipe.time, unit: 's', text: `Pump on to ${recipe.yield}&nbsp;g in the cup: ${fmt(flow, { digits: 1 })}&nbsp;g a second.` },
  { name: 'Temperature', n: recipe.temp, unit: '°C', text: 'Water at the group head, just off the boil.' },
  { name: 'Ratio', n: `1&nbsp;:&nbsp;${fmt(ratio, { digits: ratio % 1 ? 1 : 0 })}`, unit: '', text: 'Yield over dose. Most run 1&nbsp;:&nbsp;1.5 to 1&nbsp;:&nbsp;2.5.' },
];

export default {
  study: true,
  id: ID,
  title: 'The recipe as five numbers',
  notes: 'Purpose: Show that the 28 seconds are one setting among five, and give each number a sentence that says what it controls.\nModify: Edit `recipe` (dose, yield, time, temperature); the ratio and the flow rate in the time row recompute. Keep each sentence to one line (about 45 characters) so the five rows fit the page. Rewrite the headline in the way a practitioner says the recipe aloud, and update `words` if the numbers change.\nInvariant: Every numeral carries its unit; derived numbers are computed, not typed; the numerals share one size and line up on their right edge; no colour on this page.\nStatic: Already static.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-editorial ed-numbers',
  content: `<h1 class="ed-num-head ed-head" data-region="title">${words[recipe.dose]} grams in,<br>${words[recipe.yield]} out,<br>${words[recipe.time]} seconds</h1>
<p class="ed-num-intro ed-body" data-region="support">That is how a barista says the recipe out loud. Written down it is five numbers, and moving any one of them changes the cup.</p>
<table class="ed-recipe" data-region="primary">
  ${rows.map(r => `<tr><td class="n">${r.n}${r.unit ? `<small>${r.unit}</small>` : ''}</td><td><b>${r.name}</b><p>${r.text}</p></td></tr>`).join('\n  ')}
</table>
<p class="ed-folio" data-region="source"><span>Quire, Winter 2026</span><span>42</span></p>`,
};
