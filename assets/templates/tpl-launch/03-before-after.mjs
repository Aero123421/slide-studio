// Template: Product launch · Before/after workflow on a shared time axis. Synthetic example content; replace data and copy.
// Every bar, duration label, refund marker and summary figure is computed from the two step arrays.
const P = 'tpl-launch-before-after';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Hours. kind: wait = request idle in a queue, staff = a person works it, customer = the customer acts,
// auto = automated, transit = carrier, refund = zero-length milestone.
const before = [
  { label: 'Request waits in shared inbox', parts: [['wait', 8]] },
  { label: 'Agent checks order and policy', parts: [['staff', 0.5]] },
  { label: 'Warehouse lead approves by email', parts: [['wait', 18], ['staff', 0.25]] },
  { label: 'Agent buys label, emails a PDF', parts: [['wait', 3.5], ['staff', 0.5]] },
  { label: 'Customer prints label and ships', parts: [['customer', 20]] },
  { label: 'Parcel in transit', parts: [['transit', 48]] },
  { label: 'Inspection, then manual refund', parts: [['wait', 10], ['staff', 0.5], ['refund', 0]] }
];
const after = [
  { label: 'Customer picks item, reason, swap', parts: [['customer', 0.1]] },
  { label: 'Rules approve, QR label issued', parts: [['auto', 0.02]] },
  { label: 'Customer drops parcel at a locker', parts: [['customer', 1.9]] },
  { label: 'Refund released on first scan', parts: [['auto', 0.01], ['refund', 0]] },
  { label: 'Parcel in transit', parts: [['transit', 48]] },
  { label: 'Scan-in, grade, restock', parts: [['staff', 0.25]] }
];

const place = steps => { let t = 0; return steps.map(s => { const start = t; const parts = s.parts.map(([k, d]) => { const p = { k, a: t, b: t + d }; t += d; return p; }); return { ...s, start, end: t, parts }; }); };
const B = place(before), A = place(after);
const refundAt = L => L.flatMap(s => s.parts).find(p => p.k === 'refund').a;
const touches = L => L.filter(s => s.parts.some(p => p.k === 'staff')).length;
const transit = L => L.flatMap(s => s.parts).filter(p => p.k === 'transit').reduce((a, p) => a + p.b - p.a, 0);
const fmt = h => h < 1 ? `${Math.max(1, Math.round(h * 60))} min` : h >= 20 ? `${Math.round(h)} h` : `${+h.toFixed(1)} h`;
const rB = refundAt(B), rA = refundAt(A);

// geometry
const W = 1152, x0 = 330, x1 = 1096, maxH = 120, sx = h => x0 + (h / maxH) * (x1 - x0);
const rowH = 26, bh = 14;
const col = {
  wait: `url(#${P}-hatch)`, staff: '#f2553a', customer: '#ffffff', auto: '#5a3ff5', transit: '#c7c3da'
};
const stroke = { wait: '#f2553a', staff: 'none', customer: '#6c6990', auto: 'none', transit: 'none' };

function lane(steps, y0, tone) {
  return steps.map((s, i) => {
    const y = y0 + i * rowH, cy = y + rowH / 2;
    const bars = s.parts.filter(p => p.k !== 'refund').map(p => {
      const x = sx(p.a), w = Math.max(3, sx(p.b) - sx(p.a));
      return `<rect x="${x.toFixed(1)}" y="${cy - bh / 2}" width="${w.toFixed(1)}" height="${bh}" rx="3" fill="${col[p.k]}" stroke="${stroke[p.k]}" stroke-width="1.2"/>`;
    }).join('');
    const ref = s.parts.find(p => p.k === 'refund');
    const dur = s.end - s.start;
    const endX = Math.max(sx(s.end), sx(s.start) + 3);
    const refText = `${dur > 0.05 ? fmt(dur) + ' · ' : ''}refund at ${fmt(ref ? ref.a : 0)}`;
    const fitsRight = ref && sx(ref.a) + 16 + refText.length * 7.6 < W;
    const lab = ref
      ? `<path d="M${sx(ref.a)} ${cy - 10}l10 10-10 10-10-10z" fill="#17143b" stroke="#fff" stroke-width="2"/>
         <text x="${fitsRight ? sx(ref.a) + 16 : sx(s.start) - 10}" y="${cy + 5}" font-size="14" font-weight="700" fill="#17143b" text-anchor="${fitsRight ? 'start' : 'end'}">${refText}</text>`
      : `<text x="${endX + 8}" y="${cy + 5}" font-size="14" fill="#6c6990">${fmt(dur)}</text>`;
    return `<line x1="0" x2="${x1}" y1="${y + rowH}" y2="${y + rowH}" stroke="#ebe8f3"/>
      <text x="0" y="${cy + 5.5}" font-size="16" fill="#17143b"><tspan font-weight="700" fill="${tone}">${i + 1}</tspan><tspan dx="12">${esc(s.label)}</tspan></text>${bars}${lab}`;
  }).join('');
}

const topAxis = 16, yB = 58, yA = yB + B.length * rowH + 46;
const grid = [0, 24, 48, 72, 96, 120].map(h => `<line x1="${sx(h)}" x2="${sx(h)}" y1="${topAxis + 8}" y2="${yA + A.length * rowH}" stroke="#dcd8ea" stroke-dasharray="${h ? '2 4' : ''}"/>
  <text x="${sx(h)}" y="${topAxis}" font-size="14" fill="#6c6990" text-anchor="middle">${h} h</text>`).join('')
  + [1, 2, 3, 4, 5].map(d => `<text x="${sx(d * 24 - 12)}" y="${topAxis}" font-size="14" font-weight="700" fill="#9f9bc0" text-anchor="middle">Day ${d}</text>`).join('');
const head = (y, t, sub, tone) => `<text x="0" y="${y}" font-size="15" font-weight="800" letter-spacing="1.4" fill="${tone}">${t}</text><text x="${t.length * 11.5 + 14}" y="${y}" font-size="15" fill="#6c6990">${esc(sub)}</text>`;

const svg = `<svg viewBox="0 0 ${W} 446" width="${W}" height="446" role="img" aria-labelledby="${P}-t ${P}-d" font-family="Inter,'Helvetica Neue','Liberation Sans',Arial,sans-serif">
<title id="${P}-t">Return workflow before and after Fernhook 2.0 on a shared hour axis</title>
<desc id="${P}-d">Before: ${B.length} steps, refund after ${fmt(rB)}. After: ${A.length} steps, refund ${fmt(rA)} after the request. Carrier transit is ${transit(B)} hours in both. Illustrative data.</desc>
<defs><pattern id="${P}-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#ffe4dc"/><line x1="0" y1="0" x2="0" y2="6" stroke="#f2553a" stroke-width="1.6" stroke-opacity=".55"/></pattern></defs>
${grid}
${head(yB - 14, 'BEFORE', 'email, store admin, spreadsheet, carrier site', '#c23a22')}
${lane(B, yB, '#c23a22')}
<g data-step="1" data-motion="lift">
${head(yA - 14, 'WITH 2.0', 'one returns portal, rules and scans', '#5a3ff5')}
${lane(A, yA, '#5a3ff5')}
</g>
</svg>`;

const key = [['Waiting in a queue', `background:repeating-linear-gradient(45deg,#ffe4dc 0 3px,#f7b3a4 3px 5px);border:1.2px solid #f2553a`],
  ['Staff work', 'background:#f2553a'], ['Customer', 'background:#fff;border:1.2px solid #6c6990'], ['Automated', 'background:#5a3ff5'], ['Carrier transit', 'background:#c7c3da']]
  .map(([t, s]) => `<span><i style="${s}"></i>${t}</span>`).join('') + `<span><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M8 1l7 7-7 7-7-7z" fill="#17143b"/></svg>Refund</span>`;

const stats = [
  { k: 'Time to refund', a: fmt(rB), b: fmt(rA) },
  { k: 'Staff touches per return', a: touches(B), b: touches(A) },
  { k: 'Carrier transit', a: fmt(transit(B)), b: fmt(transit(A)) }
];
const statHtml = stats.map(s => {
  const same = String(s.a) === String(s.b);
  const fig = same
    ? `<span style="color:#17143b">${s.b}</span> <span style="font:500 17px/1 var(--ln-sans);color:#6c6990;letter-spacing:0">unchanged</span>`
    : `<span style="color:#7f7ba3;font-weight:600;text-decoration:line-through;text-decoration-thickness:2px">${s.a}</span> <span style="color:#5a3ff5">→ ${s.b}</span>`;
  return `<div style="padding:2px 0 2px 18px;border-left:2px solid ${same ? '#dcd8ea' : '#8b76ff'}"><p style="font:500 16px/1.2 var(--ln-sans);color:#6c6990">${s.k}</p>
  <p class="ln-num" style="margin-top:8px;font:800 30px/1 var(--ln-sans);letter-spacing:-.8px;white-space:nowrap">${fig}</p></div>`;
}).join('');

const lock = `<div class="ln-lock" aria-hidden="true"><svg viewBox="0 0 34 34"><rect width="34" height="34" rx="10" fill="#5a3ff5"/><path d="M12 12h8.5a6 6 0 0 1 0 12H14" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M15.5 8l-4 4 4 4" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="11.5" cy="24" r="2.2" fill="#ffc24b"/></svg>Fernhook 2.0</div>`;

export default {
  study: true,
  id: 'tpl-launch-before-after',
  title: 'Before and after: the return workflow on one time axis',
  notes: `Purpose: Prove the headline benefit with the workflow itself: which steps disappear and where the time went.\nModify: Edit the before/after step arrays (hours per part). Bars, durations, refund markers and the three summary figures recompute. Keep maxH at or above the longest lane.\nInvariant: Both lanes share one hour axis starting at zero. Keep unchanged steps (carrier transit) visible so the gain is not overstated.\nStatic: The "with 2.0" lane builds in at step 1; the final state shows both lanes.`,
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-launch ln-before-after',
  content: `<div class="ln-page">${lock}
<div class="ln-abs" style="left:72px;top:46px;width:1100px">
  <p class="ln-kicker">Before and after 2.0</p>
  <h2 class="ln-h2" data-region="title" style="margin-top:12px">Refunds move from day five to drop-off</h2>
</div>
<div class="ln-abs" data-region="support" style="left:72px;top:150px;width:1000px;display:grid;grid-template-columns:repeat(3,auto);justify-content:start;column-gap:56px">${statHtml}</div>
<div class="ln-abs ln-lanes" data-region="primary" style="top:222px;height:446px">${svg}</div>
<div class="ln-abs ln-key" style="left:72px;bottom:22px">${key}</div>
<p class="ln-source" data-region="source" style="left:auto;right:64px;bottom:22px">Illustrative data for one routine return</p>
</div>`
};
