// Template: Product launch · Hero announcement with product mockup. Synthetic example content; replace data and copy.
// The mockup is drawn from the arrays below (queue rows, reason chips), so screen copy stays editable.
const P = 'tpl-launch-hero';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const tw = (s, px, k = 0.56) => Math.round(String(s).length * px * k); // rough text width for pill sizing

const product = { name: 'Fernhook', version: '2.0', url: 'app.fernhook.example/returns' };
const kpis = [
  { label: 'Auto-resolved today', value: '84%' },
  { label: 'Median refund time', value: '2h 10m' },
  { label: 'Waiting on a person', value: '12' }
];
const tone = {
  mint: ['#d8f5ea', '#0b5c45'], violet: ['#ece8ff', '#3a24c0'], coral: ['#ffe4dc', '#a3311c'], sun: ['#fff1cc', '#6b4a00']
};
const queue = [
  { who: 'AK', color: '#8b76ff', item: 'Trail runner', meta: '#48213 · size 42', reason: 'Too small', status: 'Exchange sent', tone: 'mint' },
  { who: 'MS', color: '#f2553a', item: 'Ceramic mug set', meta: '#48207 · 4 pcs', reason: 'Arrived damaged', status: 'Refunded', tone: 'violet' },
  { who: 'JL', color: '#12946f', item: 'Linen overshirt', meta: '#48198 · size M', reason: 'Changed mind', status: 'Label sent', tone: 'sun' },
  { who: 'RD', color: '#4b4870', item: 'Wool beanie', meta: '#48190 · slate', reason: 'Not as pictured', status: 'Needs review', tone: 'coral' },
  { who: 'TN', color: '#5a3ff5', item: 'Canvas tote', meta: '#48184 · natural', reason: 'Too big', status: 'Refunded', tone: 'violet' }
];
const reasons = [['Too small', true], ['Too big', false], ['Changed mind', false]];

// --- window mockup -------------------------------------------------------
const W = { x: 132, y: 10, w: 528, h: 372 };
const main = W.x + 80;
const tileW = (W.x + W.w - 20 - main - 24) / 3;
const tiles = kpis.map((k, i) => {
  const x = main + i * (tileW + 12);
  return `<rect x="${x}" y="110" width="${tileW}" height="62" rx="10" fill="#f6f5fc"/>
  <text x="${x + 12}" y="131" font-size="10.5" fill="#6c6990">${esc(k.label)}</text>
  <text x="${x + 12}" y="160" font-size="23" font-weight="800" fill="#17143b" letter-spacing="-0.6">${esc(k.value)}</text>`;
}).join('');
const rowY = i => 206 + i * 34;
const rows = queue.map((r, i) => {
  const y = rowY(i), mid = y + 17, [bg, fg] = tone[r.tone], pw = tw(r.status, 10.5, 0.6) + 18;
  return `${i ? `<line x1="${main}" x2="${W.x + W.w - 20}" y1="${y}" y2="${y}" stroke="#efedf6"/>` : ''}
  <circle cx="${main + 11}" cy="${mid}" r="11" fill="${r.color}"/>
  <text x="${main + 11}" y="${mid + 3.5}" font-size="9.5" font-weight="700" fill="#fff" text-anchor="middle">${esc(r.who)}</text>
  <text x="${main + 30}" y="${mid - 2}" font-size="12.5" font-weight="700" fill="#17143b">${esc(r.item)}</text>
  <text x="${main + 30}" y="${mid + 12}" font-size="10" fill="#8a86ad">${esc(r.meta)}</text>
  <text x="${main + 196}" y="${mid + 4}" font-size="11.5" fill="#4b4870">${esc(r.reason)}</text>
  <rect x="${main + 322}" y="${mid - 10}" width="${pw}" height="20" rx="10" fill="${bg}"/>
  <text x="${main + 322 + pw / 2}" y="${mid + 3.6}" font-size="10.5" font-weight="700" fill="${fg}" text-anchor="middle">${esc(r.status)}</text>`;
}).join('');
const navIcons = [
  'M-6 -5h12M-6 0h12M-6 5h8',                          // queue
  'M-6 6v-5M-2 6v-9M2 6v-3M6 6v-12',                   // reports
  'M-6 -6h12v12h-12zM-6 -1h12',                        // labels
  'M-4 -6l-3 3 3 3M-7 -3h9a5 5 0 0 1 0 10h-3',         // rules
  'M0 -7a7 7 0 1 0 0.1 0M0 -3v3l2.5 2'                  // history
];
const nav = navIcons.map((d, i) => {
  const cy = 108 + i * 42;
  return `${i === 0 ? `<rect x="${W.x + 14}" y="${cy - 16}" width="32" height="32" rx="9" fill="#ece8ff"/>` : ''}
  <path d="${d}" transform="translate(${W.x + 30} ${cy})" fill="none" stroke="${i === 0 ? '#5a3ff5' : '#9f9bc0'}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
}).join('');

// --- phone mockup --------------------------------------------------------
let cx = 30, cy = 350;
const chips = reasons.map(([t, on]) => {
  const w = tw(t, 11, 0.56) + 22;
  if (cx + w > 180) { cx = 30; cy += 30; }
  const s = `<rect x="${cx}" y="${cy}" width="${w}" height="24" rx="12" fill="${on ? '#5a3ff5' : '#fff'}" stroke="${on ? '#5a3ff5' : '#dcd8ea'}"/>
  <text x="${cx + w / 2}" y="${cy + 16}" font-size="11" font-weight="${on ? 700 : 500}" fill="${on ? '#fff' : '#4b4870'}" text-anchor="middle">${esc(t)}</text>`;
  cx += w + 6; return s;
}).join('');

const mock = `<svg viewBox="0 0 660 590" width="660" height="590" role="img" aria-labelledby="${P}-t ${P}-d" font-family="Inter,'Helvetica Neue','Liberation Sans',Arial,sans-serif">
<title id="${P}-t">${product.name} ${product.version} product screens</title>
<desc id="${P}-d">A desktop returns queue with automation results beside a phone showing the customer choosing an exchange; two notifications show the rule approving the return and the refund being released. Sample data.</desc>
<defs>
  <filter id="${P}-shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="22" stdDeviation="22" flood-color="#05031a" flood-opacity=".55"/></filter>
  <filter id="${P}-soft" x="-20%" y="-40%" width="140%" height="190%"><feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="#05031a" flood-opacity=".45"/></filter>
  <linearGradient id="${P}-bezel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a3566"/><stop offset=".5" stop-color="#15123a"/><stop offset="1" stop-color="#2a2552"/></linearGradient>
  <clipPath id="${P}-win"><rect x="${W.x}" y="${W.y}" width="${W.w}" height="${W.h}" rx="14"/></clipPath>
  <linearGradient id="${P}-shoe" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b76ff"/><stop offset="1" stop-color="#5a3ff5"/></linearGradient>
</defs>
<g filter="url(#${P}-shadow)"><rect x="${W.x}" y="${W.y}" width="${W.w}" height="${W.h}" rx="14" fill="#fff"/></g>
<g clip-path="url(#${P}-win)">
  <rect x="${W.x}" y="${W.y}" width="${W.w}" height="34" fill="#f2f0fa"/>
  <circle cx="${W.x + 20}" cy="${W.y + 17}" r="4.5" fill="#d4d0e6"/><circle cx="${W.x + 35}" cy="${W.y + 17}" r="4.5" fill="#d4d0e6"/><circle cx="${W.x + 50}" cy="${W.y + 17}" r="4.5" fill="#d4d0e6"/>
  <rect x="${W.x + 150}" y="${W.y + 7}" width="260" height="20" rx="10" fill="#fff" stroke="#e3e0ef"/>
  <text x="${W.x + 280}" y="${W.y + 21}" font-size="10.5" fill="#6c6990" text-anchor="middle">${esc(product.url)}</text>
  <rect x="${W.x}" y="${W.y + 34}" width="60" height="${W.h - 34}" fill="#f7f6fc"/>
  <line x1="${W.x + 60}" x2="${W.x + 60}" y1="${W.y + 34}" y2="${W.y + W.h}" stroke="#ebe9f4"/>
  ${nav}
</g>
<text x="${main}" y="74" font-size="18" font-weight="800" fill="#17143b" letter-spacing="-0.3">Returns queue</text>
<text x="${main}" y="93" font-size="11" fill="#6c6990">Today · 148 requests · 3 channels</text>
<text x="${W.x + W.w - 70}" y="76" font-size="11" fill="#4b4870" text-anchor="end">Auto rules</text>
<rect x="${W.x + W.w - 60}" y="63" width="38" height="20" rx="10" fill="#5a3ff5"/><circle cx="${W.x + W.w - 32}" cy="73" r="7" fill="#fff"/>
${tiles}
<text x="${main}" y="195" font-size="9.5" font-weight="700" fill="#9f9bc0" letter-spacing="1">ITEM</text>
<text x="${main + 196}" y="195" font-size="9.5" font-weight="700" fill="#9f9bc0" letter-spacing="1">REASON</text>
<text x="${main + 322}" y="195" font-size="9.5" font-weight="700" fill="#9f9bc0" letter-spacing="1">STATUS</text>
${rows}

<path d="M196 498 C 226 498, 222 450, 248 446" fill="none" stroke="#a99bff" stroke-width="1.6" stroke-dasharray="3 5" stroke-linecap="round"/>
<g filter="url(#${P}-soft)"><rect x="250" y="410" width="392" height="70" rx="16" fill="#fff"/></g>
<circle cx="284" cy="445" r="17" fill="#d8f5ea"/><path d="M276 445l5.5 5.5 10-11" fill="none" stroke="#12946f" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
<text x="312" y="440" font-size="13.5" font-weight="800" fill="#17143b">Rule matched: Exchange-first</text>
<text x="312" y="460" font-size="11.5" fill="#6c6990">Trail runner · approved, label issued in 38 s</text>
<text x="626" y="436" font-size="10.5" fill="#9f9bc0" text-anchor="end">now</text>
<g filter="url(#${P}-soft)"><rect x="300" y="494" width="342" height="62" rx="16" fill="#fff"/></g>
<circle cx="332" cy="525" r="16" fill="#ece8ff"/><circle cx="332" cy="525" r="8" fill="none" stroke="#5a3ff5" stroke-width="2"/><path d="M332 520.5v9" stroke="#5a3ff5" stroke-width="2" stroke-linecap="round"/>
<text x="358" y="520" font-size="13.5" font-weight="800" fill="#17143b">Refund released on first scan</text>
<text x="358" y="540" font-size="11.5" fill="#6c6990">Canvas tote · $64.00 · 1 min ago</text>

<g filter="url(#${P}-shadow)"><rect x="10" y="150" width="190" height="432" rx="32" fill="url(#${P}-bezel)"/></g>
<rect x="17" y="157" width="176" height="418" rx="26" fill="#fff"/>
<rect x="80" y="165" width="50" height="13" rx="6.5" fill="#15123a"/>
<text x="32" y="176" font-size="10" font-weight="700" fill="#17143b">10:24</text>
<path d="M36 200l-5 5 5 5" fill="none" stroke="#17143b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<text x="46" y="209.5" font-size="14" font-weight="800" fill="#17143b">Start a return</text>
<text x="30" y="230" font-size="10" fill="#6c6990">Step 2 of 3 · choose a reason</text>
<rect x="30" y="237" width="150" height="4" rx="2" fill="#ece8ff"/><rect x="30" y="237" width="100" height="4" rx="2" fill="#5a3ff5"/>
<rect x="30" y="252" width="150" height="66" rx="12" fill="#f6f5fc"/>
<rect x="38" y="260" width="50" height="50" rx="9" fill="#ece8ff"/>
<path d="M44 294c0-6 3-10 7-12l5-6c2 3 6 5 10 5l12 4c4 1 6 4 6 7v2H44z" fill="url(#${P}-shoe)"/>
<path d="M44 296h40" stroke="#17143b" stroke-width="2.4" stroke-linecap="round"/><path d="M58 280l3 3M62 278l3 3" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>
<text x="96" y="277" font-size="12" font-weight="800" fill="#17143b">Trail runner</text>
<text x="96" y="292" font-size="10" fill="#6c6990">Size 42 · slate</text>
<text x="96" y="307" font-size="10.5" font-weight="700" fill="#4b4870">$118.00</text>
<text x="30" y="340" font-size="11.5" font-weight="800" fill="#17143b">Why is it going back?</text>
${chips}
<rect x="30" y="416" width="150" height="54" rx="12" fill="#d8f5ea"/>
<g transform="translate(47 443)" fill="none" stroke="#0b5c45" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M-7 -2a7 7 0 0 1 12.5-3.5M7 2a7 7 0 0 1-12.5 3.5"/><path d="M5.5 -9v4h-4M-5.5 9v-4h4"/></g>
<text x="62" y="439" font-size="12" font-weight="800" fill="#0b5c45">Swap for size 43</text>
<text x="62" y="456" font-size="10" fill="#1d6b53">In stock · ships today</text>
<rect x="30" y="482" width="150" height="34" rx="17" fill="#5a3ff5"/>
<text x="105" y="503.5" font-size="12.5" font-weight="800" fill="#fff" text-anchor="middle">Confirm exchange</text>
<text x="105" y="538" font-size="10.5" fill="#6c6990" text-anchor="middle">Refund instead</text>
<rect x="75" y="560" width="60" height="4" rx="2" fill="#d4d0e6"/>
</svg>`;

// --- backdrop: glow fields + dot lattice, fading out behind the copy ------
const dots = [];
for (let gx = 0; gx < 34; gx++) for (let gy = 0; gy < 20; gy++) {
  const x = 600 + gx * 20, y = 20 + gy * 36 + (gx % 2) * 18;
  const f = Math.max(0, 1 - Math.hypot(x - 980, y - 300) / 520);
  if (f > 0.04) dots.push(`<circle cx="${x}" cy="${y}" r="1.3" fill="#b3a5ff" opacity="${(f * 0.5).toFixed(2)}"/>`);
}
const orbits = [300, 380, 470].map((r, i) => `<ellipse cx="930" cy="360" rx="${r * 1.25}" ry="${r}" fill="none" stroke="#8b76ff" stroke-opacity="${0.16 - i * 0.04}" stroke-width="1.2"/>`).join('');
const bg = `<svg class="ln-deco ln-hero-bg" viewBox="0 0 1280 720" width="1280" height="720" aria-hidden="true">
<defs>
  <radialGradient id="${P}-g1" cx="980" cy="160" r="640" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#4a31d8" stop-opacity=".75"/><stop offset=".55" stop-color="#2a1b8a" stop-opacity=".35"/><stop offset="1" stop-color="#110e30" stop-opacity="0"/></radialGradient>
  <radialGradient id="${P}-g2" cx="700" cy="760" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f2553a" stop-opacity=".42"/><stop offset="1" stop-color="#f2553a" stop-opacity="0"/></radialGradient>
  <linearGradient id="${P}-g3" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#110e30"/><stop offset=".45" stop-color="#110e30" stop-opacity=".2"/><stop offset="1" stop-color="#110e30" stop-opacity="0"/></linearGradient>
</defs>
<rect width="1280" height="720" fill="#110e30"/><rect width="1280" height="720" fill="url(#${P}-g1)"/><rect width="1280" height="720" fill="url(#${P}-g2)"/>
${orbits}${dots.join('')}
<rect width="1280" height="720" fill="url(#${P}-g3)"/>
</svg>`;

const logo = `<svg viewBox="0 0 34 34" aria-hidden="true"><rect width="34" height="34" rx="10" fill="#5a3ff5"/><path d="M12 12h8.5a6 6 0 0 1 0 12H14" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M15.5 8l-4 4 4 4" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="11.5" cy="24" r="2.2" fill="#ffc24b"/></svg>`;

export default {
  study: true,
  id: 'tpl-launch-hero',
  title: 'Launch hero: Fernhook 2.0 returns automation',
  notes: 'Purpose: Open a launch with one promise, the availability facts and a believable picture of the product.\nModify: Change product, queue rows, KPI tiles and reason chips in the arrays at the top; the mockup redraws from them. Keep the headline to two lines.\nInvariant: Screens use sample data and say so; the phone-to-notification connector shows cause and effect, so keep it pointing from the customer action to the automated result.\nStatic: Final state is the whole page; no builds.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-launch ln-hero',
  content: `<div class="ln-page">${bg}
<div class="ln-mark">${logo}<span>${product.name}</span></div>
<div class="ln-abs" style="left:72px;top:178px;width:510px">
  <p class="ln-pill"><b>NEW</b>${product.name} ${product.version} is live today</p>
  <h1 class="ln-hero-h1" data-region="title" style="margin-top:30px">Returns that <em>run themselves.</em></h1>
  <p class="ln-hero-lede" style="margin-top:26px;width:470px">Version ${product.version} approves, labels and refunds routine returns in minutes, and sends only the exceptions to your team.</p>
  <div class="ln-facts" style="margin-top:44px">
    <div><p>Launch date</p><strong>23 Sep 2026</strong></div>
    <div><p>Available on</p><strong>Growth, Scale</strong></div>
    <div><p>Starter plan</p><strong>From 14 Oct</strong></div>
  </div>
</div>
<div class="ln-abs" data-region="primary" style="left:586px;top:78px;width:660px;height:590px">${mock}</div>
<p class="ln-hero-note" data-region="source">Product screens shown with sample data</p>
</div>`
};
