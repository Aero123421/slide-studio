// Template: Editorial / visual essay · Closing page. Synthetic example content; replace data and copy.
const ID = 'tpl-editorial-closing';
const closing = {line: 'Next time, wait for the <em>minute.</em>',
  nextLabel: 'In the next issue',
  next: 'Part III, “Water”: the ingredient that makes up almost all of the cup, and the one we think about least.',
  colophon: 'Margin — Issue 07, The Slow Issue. Photograph on page 15: public-domain (CC0) study image. Illustrations and text: original to this issue.'};

// Side-view cup and saucer in fine line, with hatching clipped to the shaded side.
const hatch = Array.from({length: 40}, (_, i) => `<path d="M${120 + i * 9} 230 l-120 200" stroke="#15120F" stroke-width="1" stroke-opacity=".5"/>`).join('');
const art = `<svg viewBox="0 0 520 520" role="img" aria-labelledby="${ID}-t">
  <title id="${ID}-t">Fine-line drawing of an espresso cup on a saucer with one curl of steam</title>
  <defs>
    <clipPath id="${ID}-body"><path d="M150 262 C 150 350, 176 404, 214 414 H306 C 344 404, 370 350, 370 262 Z"/></clipPath>
    <clipPath id="${ID}-shade"><rect x="300" y="200" width="120" height="240"/></clipPath>
    <linearGradient id="${ID}-crema" x1="0" x2="1"><stop offset="0" stop-color="#8C4F25"/><stop offset=".5" stop-color="#C88A4E"/><stop offset="1" stop-color="#7A421F"/></linearGradient>
  </defs>
  <ellipse cx="262" cy="438" rx="236" ry="40" fill="#EAE2D3" stroke="#15120F" stroke-width="1.6"/>
  <ellipse cx="262" cy="430" rx="236" ry="40" fill="#F3EDE2" stroke="#15120F" stroke-width="1.6"/>
  <ellipse cx="262" cy="424" rx="96" ry="14" fill="none" stroke="#15120F" stroke-width="1" stroke-opacity=".5"/>
  <path d="M366 290 C 430 280, 440 360, 360 372" fill="none" stroke="#15120F" stroke-width="14" stroke-linecap="round"/>
  <path d="M366 290 C 430 280, 440 360, 360 372" fill="none" stroke="#F3EDE2" stroke-width="10.4" stroke-linecap="round"/>
  <path d="M150 262 C 150 350, 176 404, 214 414 H306 C 344 404, 370 350, 370 262 Z" fill="#F3EDE2" stroke="#15120F" stroke-width="1.8"/>
  <g clip-path="url(#${ID}-body)"><g clip-path="url(#${ID}-shade)">${hatch}</g></g>
  <ellipse cx="260" cy="262" rx="110" ry="22" fill="#F3EDE2" stroke="#15120F" stroke-width="1.8"/>
  <ellipse cx="260" cy="266" rx="94" ry="14" fill="url(#${ID}-crema)"/>
  <path d="M252 236 C 222 196, 292 170, 262 128 S 226 70, 270 26" fill="none" stroke="#B3361C" stroke-width="2.2" stroke-linecap="round"/>
</svg>`;

export default {
  study: true,
  id: ID,
  title: 'Closing page and next issue',
  notes: 'Purpose: End the essay on one line the reader can carry away, then point to what comes next and credit the images.\nModify: Replace the closing line (keep it short enough for display size), the next-issue teaser and the colophon credits.\nInvariant: One closing line, not a list of takeaways. Credits for every photograph used in the piece stay on the page.\nStatic: Static page.',
  sources: [{type: 'image', file: 'assets/media/study-01.jpg', license: 'CC0'}],
  exportPolicy: 'final',
  className: 'tpl-editorial ed-p-closing',
  content: `<div class="ed">
  <div class="ed-mast" data-region="support"><b>Margin</b><span>Issue 07 · The Slow Issue</span></div>
  <div class="ed-fig" style="left:64px;top:124px;width:540px;height:540px" data-region="primary">${art}</div>
  <div class="ed-closewrap"><h1 class="ed-close" data-region="title">${closing.line}</h1>
  <p class="ed-next"><b>${closing.nextLabel}</b>${closing.next}<span class="ed-end" aria-hidden="true"></span></p></div>
  <p class="ed-colophon" data-region="source">${closing.colophon}</p>
</div>`
};
