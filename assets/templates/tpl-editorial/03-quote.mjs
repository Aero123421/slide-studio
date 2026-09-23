// Template: Editorial / visual essay · Pull quote. Synthetic example content; replace data and copy.
const ID = 'tpl-editorial-quote';
const part = {n: 'II', name: 'Before the water'};
// An original sentence from this essay: no invented speaker, no borrowed authority.
const quote = 'Most of what we taste in the cup was decided <em>months</em> before the water met the coffee.';
const attribution = `From Part ${part.n} of this essay, “${part.name}”`;
const side = ['A cup of espresso begins as the seed of a red fruit. It is picked, fermented, dried, shipped, stored, roasted and rested before anyone grinds it.',
  'By the time it reaches the machine, the flavour has mostly been settled. The barista can reveal it, or waste it.'];

// Opening quotation mark drawn as geometry (a "6" shape: ball + rising tail), repeated twice.
const mark = x => `<circle cx="${x + 52}" cy="104" r="34"/><path d="M${x + 18} 104 C ${x + 16} 58, ${x + 46} 24, ${x + 92} 8 L ${x + 98} 22 C ${x + 66} 38, ${x + 50} 62, ${x + 56} 72 Z"/>`;
const quoteMark = `<svg viewBox="0 0 210 140" aria-hidden="true"><g fill="#B3361C">${mark(0)}${mark(104)}</g></svg>`;

export default {
  study: true,
  id: ID,
  title: 'Pull quote from the essay',
  notes: 'Purpose: Stop the reader on one sentence that carries the essay’s argument, with a short side column that sets it up.\nModify: Replace quote with a sentence taken from your own text (or a real, sourced statement with its source). Keep it under about 20 words so it holds at display size. Replace the side column with the paragraph that leads into it.\nInvariant: Do not attribute a sentence to an invented expert or a person who did not say it. One highlighted word at most.\nStatic: Static page.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-editorial ed-p-quote',
  content: `<div class="ed is-quote">
  <div class="ed-mast" data-region="support"><b>Margin</b><span>${part.n} — ${part.name}</span></div>
  <aside class="ed-side" data-region="support"><p class="ed-kicker">Part ${part.n}</p>${side.map(t => `<p>${t}</p>`).join('')}</aside>
  <div class="ed-vrule" style="left:372px;top:190px;height:440px"></div>
  <div class="ed-art" style="left:414px;top:118px;width:150px;height:100px">${quoteMark}</div>
  <div class="ed-qwrap"><blockquote class="ed-quote" data-region="primary"><p>${quote}</p></blockquote>
  <p class="ed-attr">${attribution}</p></div>
  <div class="ed-folio"><span>Margin · Issue 07</span><span>16</span></div>
</div>`
};
