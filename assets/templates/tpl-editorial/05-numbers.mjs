// Template: Editorial / visual essay · Big-number spread. Synthetic example content; replace data and copy.
const ID = 'tpl-editorial-numbers';
// One illustrative house recipe. Every derived figure below is computed from it.
const recipe = {doseG: 18, yieldG: 36, timeS: 28};
const ratio = recipe.yieldG / recipe.doseG;          // 2
const flow = recipe.yieldG / recipe.timeS;           // g per second
const fmt1 = v => (Math.round(v * 10) / 10).toString();

// Proportional bars: in vs out on one common zero (1 g = pxPerG).
const pxPerG = 12, barX = 110, rows = [{k: 'In', g: recipe.doseG, note: 'dry ground coffee'}, {k: 'Out', g: recipe.yieldG, note: 'espresso in the cup'}];
const bars = `<svg viewBox="0 0 560 150" role="img" aria-labelledby="${ID}-bars-t">
  <title id="${ID}-bars-t">Bars to scale: ${recipe.doseG} grams in, ${recipe.yieldG} grams out</title>
  <path d="M${barX} 4 V116" stroke="#15120F" stroke-width="1.4"/>
  <text class="ed-svg-axis" x="${barX}" y="144">Bars to scale · each segment = 6 g</text>
  ${rows.map((r, i) => { const yy = 18 + i * 56, w = r.g * pxPerG;
    return `<text class="ed-svg-name" x="${barX - 16}" y="${yy + 22}" text-anchor="end">${r.k}</text>
    <rect x="${barX}" y="${yy}" width="${w}" height="32" fill="${i ? '#B3361C' : '#15120F'}"/>
    ${Array.from({length: Math.floor(r.g / 6)}, (_, t) => `<path d="M${barX + (t + 1) * 6 * pxPerG} ${yy} v32" stroke="#F3EDE2" stroke-width="1" stroke-opacity=".6"/>`).join('')}`; }).join('')}
</svg>`;
// Fine-line stopwatch drawn around the 28: hand angle computed from seconds on a 60-second dial.
const handA = (recipe.timeS / 60) * 2 * Math.PI - Math.PI / 2;
const dial = `<svg viewBox="0 0 300 300" aria-hidden="true">
  <circle cx="150" cy="160" r="128" fill="none" stroke="#F1E6D2" stroke-opacity=".35" stroke-width="1.4"/>
  ${Array.from({length: 60}, (_, i) => { const a = i / 60 * 2 * Math.PI - Math.PI / 2, r1 = i % 5 ? 120 : 112; return `<path d="M${(150 + r1 * Math.cos(a)).toFixed(1)} ${(160 + r1 * Math.sin(a)).toFixed(1)} L${(150 + 128 * Math.cos(a)).toFixed(1)} ${(160 + 128 * Math.sin(a)).toFixed(1)}" stroke="#F1E6D2" stroke-opacity="${i % 5 ? .3 : .6}" stroke-width="1.2"/>`; }).join('')}
  <path d="M150 160 L150 32 A128 128 0 0 1 ${(150 + 128 * Math.cos(handA)).toFixed(1)} ${(160 + 128 * Math.sin(handA)).toFixed(1)} Z" fill="#E36A4C" fill-opacity=".12"/>
  <path d="M150 160 L${(150 + 124 * Math.cos(handA)).toFixed(1)} ${(160 + 124 * Math.sin(handA)).toFixed(1)}" stroke="#E36A4C" stroke-width="2.4" stroke-linecap="round"/>
  <circle cx="150" cy="160" r="5" fill="#E36A4C"/>
  <rect x="138" y="14" width="24" height="12" rx="3" fill="none" stroke="#F1E6D2" stroke-opacity=".5" stroke-width="1.4"/>
</svg>`;

export default {
  study: true,
  id: ID,
  title: 'Big-number spread: three numbers make a recipe',
  notes: 'Purpose: Give a few numbers the scale of a headline, each with a caption that says what it counts, plus the figures derived from them.\nModify: Change recipe (dose, yield, time). The ratio, flow rate, bar lengths and stopwatch sector are computed from it.\nInvariant: Every big number carries its unit and a caption. Bars share one zero and one scale. The source line says these values are illustrative.\nStatic: Static page.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-editorial ed-p-numbers',
  content: `<div class="ed">
  <div class="ed-left is-dark">
    <p class="ed-kicker" style="position:absolute;left:64px;top:60px">Time</p>
    <div class="ed-art" style="left:120px;top:86px;width:360px;height:360px">${dial}</div>
    <p class="ed-big ed-abs" style="left:120px;top:176px;width:360px;text-align:center" data-region="primary">${recipe.timeS}</p>
    <p class="ed-abs ed-unit" style="left:64px;top:492px;margin:0;color:#F1E6D2">seconds</p>
    <p class="ed-abs ed-numcap" style="left:64px;top:550px;width:470px">From the first drop to the last, for one double shot pulled on a home machine.</p>
    <div class="ed-folio" style="left:64px;right:auto;width:470px"><span>Margin · Issue 07</span><span>18</span></div>
  </div>
  <div class="ed-gutter"></div>
  <h1 class="ed-abs ed-kicker" style="left:720px;top:60px;width:496px;color:#B3361C" data-region="title">Three numbers make a recipe</h1>
  <div class="ed-abs" style="left:720px;top:112px;width:220px"><p class="ed-mid">${recipe.doseG}<span class="ed-unit">g</span></p><p class="ed-numcap" style="margin-top:14px">ground coffee in the basket</p></div>
  <div class="ed-abs" style="left:970px;top:112px;width:246px"><p class="ed-mid" style="color:#B3361C">${recipe.yieldG}<span class="ed-unit">g</span></p><p class="ed-numcap" style="margin-top:14px">espresso in the cup</p></div>
  <div class="ed-fig" style="left:720px;top:340px;width:496px;height:133px">${bars}</div>
  <div class="ed-derived" data-region="support">
    <div>1 : ${fmt1(ratio)}<small>Brew ratio, in to out</small></div>
    <div>${fmt1(flow)} g/s<small>Average flow</small></div>
  </div>
  <p class="ed-src" style="left:720px;top:664px" data-region="source">Illustrative house recipe · replace with your own measurements</p>
</div>`
};
