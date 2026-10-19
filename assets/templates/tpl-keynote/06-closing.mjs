// Template: Stage keynote · Close: the asks and how to reach the speaker. Synthetic example content; replace data and copy.
// A reading list — who, then what — under one statement; the contact line bookends the opener's speaker line.
const ID = 'tpl-keynote-closing';
const M = n => 64 + 48 * n;            // x of module n (24 modules of 48 px)

const close = {
  statement: 'Three changes before summer 2027',
  asks: [                               // who can act, and the one thing we ask of them (a verb, a number, a date)
    { who: 'Retailers', what: 'Offer a midday rate, 10:00 to 16:00, at no more than half the evening rate.' },
    { who: 'Charger makers', what: 'Ship home chargers that start at 10:00 or after 23:00 unless the driver says otherwise.' },
    { who: 'The regulator', what: 'From 1 April 2027, let pooled loads of 1 MW or more bid into the balancing market.' },
  ],
  contact: 'Maren Ekholm, maren.ekholm@westmark-grid.example',
  data: 'Slides and data: westmark-grid.example/midday',
};

export default {
  study: true,
  id: ID,
  title: `Close: ${close.statement.toLowerCase().replace(/^./, c => c.toUpperCase())}`,
  notes: 'Purpose: End on what specific people in the room can do next, and how to reach the speaker; this page stays up during questions.\nModify: Edit close.statement, the asks (who can act; one change each, with a number or a date) and the contact and data lines.\nInvariant: Each ask names who acts and what changes, measurably. Three or four asks at most. Contact sits on the opener\'s bottom line (baseline 656), the data link starting on module 13. No yellow.\nStatic: No builds; all asks are visible during questions.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-keynote kn-closing',
  content: `<h2 class="kn-at kn-statement" data-region="title" style="left:${M(0)}px;top:64px;width:${M(24) - M(0)}px">${close.statement}</h2>
<ul class="kn-at kn-asks" data-region="primary" style="left:${M(0)}px;top:196px;width:${M(24) - M(0)}px">${close.asks.map(a => `<li><b>${a.who}</b><span>${a.what}</span></li>`).join('')}</ul>
<p class="kn-at kn-label" data-region="support" style="left:${M(0)}px;top:641px;width:${M(12) - M(0)}px;white-space:nowrap">${close.contact}</p>
<p class="kn-at kn-label kn-grey" style="left:${M(13)}px;top:641px;width:${M(24) - M(13)}px;white-space:nowrap">${close.data}</p>`,
};
