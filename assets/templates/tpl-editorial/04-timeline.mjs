// Template: Editorial / visual essay · Illustrated timeline on a log time scale. Synthetic example content; replace data and copy.
const ID = 'tpl-editorial-timeline';
const MIN = 60, HOUR = 3600, DAY = 86400;
// Typical, illustrative durations in seconds. Order = sequence of the process.
const stages = [
  {key: 'ferment', name: 'Ferment', sec: 36 * HOUR, label: '36 hours'},
  {key: 'dry', name: 'Dry', sec: 21 * DAY, label: '21 days'},
  {key: 'ship', name: 'Ship & store', sec: 120 * DAY, label: '4 months'},
  {key: 'roast', name: 'Roast', sec: 12 * MIN, label: '12 minutes'},
  {key: 'rest', name: 'Rest', sec: 7 * DAY, label: '7 days'},
  {key: 'pull', name: 'Pull', sec: 28, label: '28 seconds', note: 'the only step you see'}
];
const totalDays = stages.reduce((a, s) => a + s.sec, 0) / DAY;
const months = totalDays / 30.44;
const pull = stages.find(s => s.key === 'pull');
const grid = [['10 sec', 10], ['1 min', MIN], ['1 hour', HOUR], ['1 day', DAY], ['1 week', 7 * DAY], ['1 month', 30.44 * DAY], ['1 year', 365.25 * DAY]];

// Geometry: log10 scale shared by every stage.
const W = 1152, X0 = 150, X1 = 1140, colW = (X1 - X0) / stages.length, top = 146, bot = 430;
const lmin = Math.log10(10), lmax = Math.log10(365.25 * DAY);
const y = s => bot - (Math.log10(s) - lmin) / (lmax - lmin) * (bot - top);
const cx = i => X0 + (i + .5) * colW;
const f = n => n.toFixed(1);

const ink = 'fill="none" stroke="#15120F" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
const draw = {
  ferment: `<rect x="28" y="22" width="44" height="54" rx="8" fill="#EAE2D3" stroke="#15120F" stroke-width="1.6"/><path d="M28 36 H72 M28 62 H72" ${ink}/><ellipse cx="44" cy="50" rx="5" ry="3.4" fill="#B3361C"/><ellipse cx="58" cy="47" rx="5" ry="3.4" fill="#B3361C"/><ellipse cx="51" cy="55" rx="5" ry="3.4" fill="#B3361C"/><circle cx="46" cy="12" r="3" ${ink}/><circle cx="56" cy="6" r="2" ${ink}/><circle cx="60" cy="15" r="2.4" ${ink}/>`,
  dry: `<circle cx="80" cy="14" r="8" ${ink}/><path d="M80 0 V3 M80 25 V28 M66 14 H69 M91 14 H94 M70 4 l2 2 M88 22 l2 2 M90 4 l-2 2" ${ink}/><path d="M8 50 L92 50 L84 60 L16 60 Z" fill="#EAE2D3" stroke="#15120F" stroke-width="1.6" stroke-linejoin="round"/><path d="M22 60 V78 M78 60 V78 M50 60 V78" ${ink}/>${Array.from({length: 9}, (_, i) => `<ellipse cx="${18 + i * 8}" cy="${46 - (i % 2) * 2}" rx="3.4" ry="2.4" fill="#8C4F25"/>`).join('')}`,
  ship: `<path d="M24 30 C 22 20, 34 14, 50 16 C 66 14, 78 20, 76 30 L 80 72 C 80 78, 20 78, 20 72 Z" fill="#E7D3AE" stroke="#15120F" stroke-width="1.6"/><path d="M36 18 C 40 10, 60 10, 64 18" ${ink}/><path d="M34 42 H66 M34 52 H66 M34 62 H58" fill="none" stroke="#15120F" stroke-width="1.2" stroke-dasharray="3 3"/><path d="M4 78 H96" ${ink}/>`,
  roast: `<rect x="18" y="30" width="56" height="34" rx="17" fill="#EAE2D3" stroke="#15120F" stroke-width="1.6"/><circle cx="46" cy="47" r="9" ${ink}/><path d="M46 38 V56 M37 47 H55" fill="none" stroke="#15120F" stroke-width="1"/><path d="M62 30 V8 H72 V30" ${ink}/><path d="M74 47 H88 V58" ${ink}/><path d="M36 74 C 32 68, 40 66, 38 60 C 44 64, 46 70, 42 74 Z M54 74 C 50 69, 57 67, 55 62 C 60 66, 61 71, 58 74 Z" fill="#B3361C"/><path d="M14 76 H92" ${ink}/>`,
  rest: `<path d="M30 16 H70 L74 76 H26 Z" fill="#EAE2D3" stroke="#15120F" stroke-width="1.6" stroke-linejoin="round"/><path d="M30 16 L34 26 H66 L70 16" ${ink}/><circle cx="50" cy="44" r="7" ${ink}/><circle cx="50" cy="44" r="2.4" fill="#15120F"/><path d="M34 60 H66" fill="none" stroke="#15120F" stroke-width="1" opacity=".5"/>`,
  pull: `<path d="M10 22 H44" fill="none" stroke="#15120F" stroke-width="6" stroke-linecap="round"/><path d="M44 16 H80 V28 C 80 32, 76 34, 72 34 H52 C 48 34, 44 32, 44 28 Z" fill="#EAE2D3" stroke="#15120F" stroke-width="1.6"/><path d="M60 34 V40 M66 34 V40" ${ink}/><path d="M61 42 V58 M65 42 V58" fill="none" stroke="#B3361C" stroke-width="2" stroke-linecap="round"/><path d="M48 58 H78 L74 76 H52 Z" fill="#fff" stroke="#15120F" stroke-width="1.6" stroke-linejoin="round"/><path d="M78 62 C 88 62, 88 72, 76 72" ${ink}/>`
};

const svg = `<svg viewBox="0 0 ${W} 440" role="img" aria-labelledby="${ID}-t ${ID}-d">
  <title id="${ID}-t">Six stages from fruit to cup on a logarithmic time scale</title>
  <desc id="${ID}-d">${stages.map(s => `${s.name}: ${s.label}`).join('; ')}. Total about ${months.toFixed(1)} months. Illustrative typical durations.</desc>
  ${grid.map(([t, s]) => `<path d="M${X0 - 20} ${f(y(s))} H${X1}" stroke="#15120F" stroke-opacity="${s === 10 ? .5 : .14}" stroke-width="1"/><text class="ed-svg-axis" x="${X0 - 30}" y="${f(y(s) + 5)}" text-anchor="end">${t}</text>`).join('')}
  ${stages.map((s, i) => `<path d="M${f(cx(i))} ${top - 10} V${bot}" stroke="#15120F" stroke-opacity=".22" stroke-width="1" stroke-dasharray="1 4"/>`).join('')}
  ${stages.map((s, i) => `<g transform="translate(${f(cx(i) - 50)} 0)">${draw[s.key]}</g>`).join('')}
  ${stages.map((s, i) => `<text class="ed-svg-name" x="${f(cx(i))}" y="112" text-anchor="middle">${s.name}</text>`).join('')}
  ${stages.slice(1).map((s, i) => `<path d="M${f(X0 + (i + 1) * colW - 5)} 102 l6 5 l-6 5" fill="none" stroke="#B3361C" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}
  ${stages.map((s, i) => { const x = cx(i), yy = y(s.sec), hot = s === pull, right = x + 120 < W;
    return `<circle cx="${f(x)}" cy="${f(yy)}" r="${hot ? 10 : 7}" fill="${hot ? '#B3361C' : '#15120F'}"/>
    <text class="ed-svg-val" x="${f(right ? x + 16 : x - 16)}" y="${f(yy + 6)}" text-anchor="${right ? 'start' : 'end'}">${s.label}</text>
    ${s.note ? `<text class="ed-svg-note" x="${f(right ? x + 16 : x - 16)}" y="${f(yy - 22)}" text-anchor="${right ? 'start' : 'end'}">${s.note}</text>` : ''}`; }).join('')}
</svg>`;

export default {
  study: true,
  id: ID,
  title: 'Illustrated timeline: fruit to cup',
  notes: 'Purpose: Show a sequence of stages and how long each takes, when durations differ by orders of magnitude.\nModify: Edit stages (name, duration in seconds, label) and the drawings. The vertical positions, grid and total in the lede are computed from the same array.\nInvariant: Left-to-right is the order of the process; height is duration on a log scale that is named in the lede and labelled on the axis. Durations are typical illustrative values, stated in the source line.\nStatic: Static page.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-editorial ed-p-timeline',
  content: `<div class="ed">
  <div class="ed-mast" data-region="support"><b>Margin</b><span>II — Before the water</span></div>
  <h1 class="ed-h" data-region="title">Months of waiting, then <i>${pull.label}</i></h1>
  <p class="ed-lede">Six stages from fruit to cup, about ${Math.round(months)} months in all. The scale is logarithmic: each step up multiplies time.</p>
  <div class="ed-fig" style="left:64px;top:224px;width:1152px;height:440px" data-region="primary">${svg}</div>
  <div class="ed-folio"><span data-region="source">Illustrative typical durations · they vary by farm, process and roaster</span><span>17</span></div>
</div>`
};
