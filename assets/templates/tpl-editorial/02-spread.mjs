// Template: Editorial / visual essay · Image-led spread. Synthetic example content; replace data and copy.
const ID = 'tpl-editorial-spread';
const part = {n: 'I', name: 'The cup'};
const photo = {src: '{{asset:assets/media/study-01.jpg}}',
  alt: 'An espresso in a red-brown cup and saucer with a metal spoon, on a worn wooden table',
  fig: 'Fig. 1', caption: 'A double espresso, drawn in under half a minute.',
  credit: 'Photograph: public-domain (CC0) study image'};
const headline = 'Thirty-six grams, and <i>a small ceremony</i>';
const body = 'The cup arrives before the conversation does. It is small enough to hold in one hand and hot enough to ask for a pause, which may be the point. Of every step between a coffee tree and this saucer, the one we watch is the shortest: ground coffee, hot water and pressure, for less than half a minute. Everything else happened out of sight, and most of it happened slowly.';

export default {
  study: true,
  id: ID,
  title: 'Image-led spread: the cup',
  notes: 'Purpose: Let one photograph carry the page, with a single column of essay text that tells the reader why it matters.\nModify: Swap the photograph (keep it near its native resolution; this 600×400 image is shown at about 1.08×), the caption and the column. Keep the column to one idea and roughly 60–80 words.\nInvariant: Picture first, headline second, body third. The caption states what the picture shows; the credit line stays visible.\nStatic: Static page.',
  sources: [{type: 'image', file: 'assets/media/study-01.jpg', license: 'CC0'}],
  exportPolicy: 'final',
  className: 'tpl-editorial ed-p-spread',
  content: `<div class="ed">
  <div class="ed-mast" data-region="support"><b>Margin</b><span>${part.n} — ${part.name}</span></div>
  <figure class="ed-photo" data-region="primary"><img src="${photo.src}" alt="${photo.alt}"></figure>
  <p class="ed-cap"><b>${photo.fig}</b>${photo.caption}</p>
  <p class="ed-credit">${photo.credit}</p>
  <div class="ed-vrule" style="left:744px"></div>
  <article class="ed-col" style="top:100px">
    <p class="ed-kicker">Part ${part.n} · ${part.name}</p>
    <h1 data-region="title">${headline}</h1>
    <p class="ed-body">${body}</p>
    <p class="ed-cont">Continued on page 16 <span aria-hidden="true">→</span></p>
  </article>
  <div class="ed-folio"><span>Margin · Issue 07</span><span>15</span></div>
</div>`
};
