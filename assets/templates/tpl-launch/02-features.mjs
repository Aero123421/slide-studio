// Template: Product launch · What's new, as a typographic list with one measured proof each. Synthetic example content; replace data and copy.
// Columns follow the grid: capability (columns 1–3), what it does (4–8), the proof (9–12).
const ID = 'tpl-launch-features';
const C = n => 64 + 98 * (n - 1);      // x of column n (12 columns of 74 px, 24 px gutters)
const span = (a, b) => 98 * (b - a) + 74;
const nb = s => s.replace(/(\d) (?=[A-Za-z€%°])/g, '$1 ');   // keep numbers with their units

const beta = { shops: 14, returns: 38400, from: '1 June', to: '30 September 2026' };
// Plans must match 04-pricing.mjs. proof = one number from the beta; what = what it measures (≤ 36 characters).
const features = [
  { name: 'Approve by rule', plans: 'All plans', does: 'Requests that meet your policy on reason, condition, price and timing are approved at once.', proof: '81%', what: 'approved with no one touching them' },
  { name: 'Refund at first scan', plans: 'All plans', does: 'The refund goes out when the carrier first scans the parcel, not when your warehouse opens it.', proof: '41 min', what: 'median from drop-off to refund' },
  { name: 'Exchange first', plans: 'Growth and Scale', does: 'Wrong-size returns are offered the next size from live stock before any money moves.', proof: '26%', what: 'of size returns became exchanges' },
  { name: 'Grade on arrival', plans: 'Scale', does: 'Each item is graded A, B or C at the dock and listed for sale again without a spreadsheet.', proof: '1.2 days', what: 'median from arrival to back on sale' },
];
const fmtInt = v => v.toLocaleString('en-GB');

export default {
  study: true,
  id: ID,
  title: `What 2.0 does: ${features.length} jobs, measured in the beta`,
  notes: `Purpose: Say what is new as jobs the product now does, each backed by one number from real use, so the audience can map features to their own work.\nModify: Edit features (3–4 items): plans (must match 04-pricing), name (fits one line at 26 px in columns 1–3), does (one sentence, two lines at most), proof (one measured number) and what (what it measures, ≤ 36 characters). Edit beta for the evidence base.\nInvariant: One number per capability, each with its unit and what it measures; the evidence base is stated in the source line. Plans agree with the pricing page.\nStatic: No builds.`,
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-launch ln-features',
  content: `<h2 class="ln-at ln-head" data-region="title" style="left:${C(1)}px;top:64px;width:${span(1, 11)}px">${['', '', 'Two', 'Three', 'Four'][features.length]} jobs 2.0 now does on its own</h2>
<ul class="ln-at ln-list" data-region="primary" style="left:${C(1)}px;top:152px;width:${span(1, 12)}px">${features.map(f => `<li><div><h3>${f.name}</h3><span class="ln-plans">${f.plans}</span></div><p>${nb(f.does)}</p><p><span class="ln-proof">${nb(f.proof)}</span><span class="ln-proof-what">${f.what}</span></p></li>`).join('')}</ul>
<p class="ln-at ln-note" data-region="source" style="left:${C(1)}px;top:645px;width:${span(1, 12)}px">Fernhook 2.0 beta: ${beta.shops} shops, ${fmtInt(beta.returns)} returns, ${beta.from} – ${beta.to}. Times are medians. Sample data.</p>`,
};
