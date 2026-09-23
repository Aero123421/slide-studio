// Template: Product launch · Feature grid with a bespoke icon set. Synthetic example content; replace data and copy.
// Icons share one grammar: 64px tile, 2.4px violet line, one coral accent. Keep that grammar when adding icons.
const P = 'tpl-launch-features';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const V = '#5a3ff5', C = '#f2553a';
const line = `fill="none" stroke="${V}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"`;

const icons = {
  label: `<path d="M16 22a4 4 0 0 1 4-4h17l11 11v17a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4z" ${line}/><path d="M37 18v11h11" ${line}/>
    <rect x="22" y="32" width="8" height="8" rx="1.5" fill="${C}"/><path d="M34 34v8M38 34v8M42 34v8M22 44h8" ${line}/>`,
  rules: `<circle cx="32" cy="15" r="4" ${line}/><path d="M32 19v6" ${line}/><path d="M32 25l7 7-7 7-7-7z" ${line}/>
    <path d="M25 32h-6v9M39 32h6v9" ${line}/><circle cx="19" cy="46" r="5" fill="${C}"/><circle cx="45" cy="46" r="5" ${line}/>`,
  exchange: `<path d="M17 29a15 15 0 0 1 27-8" ${line}/><path d="M45 13v9h-9" ${line}/><path d="M47 35a15 15 0 0 1-27 8" ${line}/><path d="M19 51v-9h9" ${line}/>
    <circle cx="32" cy="32" r="5" fill="${C}"/>`,
  fraud: `<path d="M32 13l15 5.5V30c0 10-6.3 17.6-15 21-8.7-3.4-15-11-15-21V18.5z" ${line}/><path d="M32 24v10" fill="none" stroke="${C}" stroke-width="3.2" stroke-linecap="round"/><circle cx="32" cy="40.5" r="2.2" fill="${C}"/>`,
  restock: `<path d="M14 30l16-8 16 8v16l-16 8-16-8z" ${line}/><path d="M14 30l16 8 16-8M30 38v16" ${line}/>
    <circle cx="46" cy="18" r="8" fill="${C}"/><path d="M46 22v-8M42.5 17.5L46 14l3.5 3.5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`,
  timing: `<circle cx="29" cy="31" r="14" ${line}/><path d="M29 23v8l5 4" ${line}/>
    <circle cx="44" cy="44" r="9" fill="${C}"/><path d="M44 39.5v9M41 42.5c0-1.5 1.3-2.3 3-2.3s3 .8 3 2.1c0 3-6 1.5-6 4.4 0 1.3 1.3 2.1 3 2.1s3-.8 3-2.3" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`
};
const icon = (k, i) => `<svg viewBox="0 0 64 64" role="img" aria-labelledby="${P}-i${i}"><title id="${P}-i${i}">${k} icon</title><rect width="64" height="64" rx="18" fill="#ece8ff"/>${icons[k]}</svg>`;

// Availability must match the pricing page (04-pricing.mjs) feature table.
const features = [
  { icon: 'label', title: 'Instant QR labels', body: 'A prepaid label reaches the customer the moment a return qualifies. No printer needed.', plan: 'All plans' },
  { icon: 'rules', title: 'Rules that decide', body: 'Set the window, item condition and value limit once; routine cases approve themselves.', plan: 'All plans' },
  { icon: 'exchange', title: 'Exchange first', body: 'Offer a size or colour swap before a refund, using live stock from your warehouse.', plan: 'Growth and Scale' },
  { icon: 'fraud', title: 'Fraud signals', body: 'Serial returners and parcel-weight mismatches are flagged before any money moves.', plan: 'Scale' },
  { icon: 'restock', title: 'Restock sync', body: 'Scanned items are graded A to C and go back on sale without a spreadsheet.', plan: 'Growth and Scale' },
  { icon: 'timing', title: 'Refund timing', body: 'Refund on first scan, on arrival or after inspection, set per product line.', plan: 'All plans' }
];
const cards = features.map((f, i) => `<article>
  <div class="ln-feat-top">${icon(f.icon, i)}<span class="ln-tag${f.plan === 'All plans' ? ' is-all' : ''}">${esc(f.plan)}</span></div>
  <h3>${esc(f.title)}</h3><p>${esc(f.body)}</p></article>`).join('');

const lock = `<div class="ln-lock" aria-hidden="true"><svg viewBox="0 0 34 34"><rect width="34" height="34" rx="10" fill="#5a3ff5"/><path d="M12 12h8.5a6 6 0 0 1 0 12H14" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M15.5 8l-4 4 4 4" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="11.5" cy="24" r="2.2" fill="#ffc24b"/></svg>Fernhook 2.0</div>`;

export default {
  study: true,
  id: 'tpl-launch-features',
  title: 'Feature grid: six jobs Fernhook 2.0 now does',
  notes: 'Purpose: Show what is new as concrete jobs, each with plan availability, so the audience can map features to their own work.\nModify: Edit the features array; keep six or three items so the 3-column grid stays full. Draw new icons with the same 64px tile, 2.4px line and single coral accent.\nInvariant: Plan tags must agree with the pricing page. Describe the job a feature does, not an adjective.\nStatic: No builds; the grid reads at once.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-launch ln-features',
  content: `<div class="ln-page">${lock}
<div class="ln-abs" style="left:72px;top:60px;width:760px">
  <p class="ln-kicker">Six new jobs</p>
  <h2 class="ln-h2" data-region="title" style="margin-top:14px">Fernhook now handles the routine work before anyone opens a ticket</h2>
</div>
<div class="ln-feat" data-region="primary">${cards}</div>
</div>`
};
