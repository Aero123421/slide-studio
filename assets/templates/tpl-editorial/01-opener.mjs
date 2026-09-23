// Template: Editorial / visual essay · Typographic opener. Synthetic example content; replace data and copy.
const ID = 'tpl-editorial-opener';
const issue = {name: 'Margin', number: '07', theme: 'The Slow Issue', section: 'Essay', page: 14};
const story = {pre: 'The', title: 'Long', italic: 'Minute.',
  dek: 'Espresso takes half a minute to pour and half a year to arrive. An essay on the patience hidden in a small cup.',
  byline: 'Words and drawings by the Margin desk'};

// Cup seen from above, cropped by the right edge. Geometry is decorative, not data.
const C = {x: 420, y: 372}, saucer = 292, well = 206, cup = 192, rim = 164, crema = 158;
const rings = Array.from({length: 22}, (_, i) => `<circle cx="${C.x}" cy="${C.y}" r="${20 + i * 6.4}" fill="none" stroke="#F6D9AE" stroke-opacity="${(.05 + (i % 3) * .025).toFixed(3)}" stroke-width="1"/>`).join('');
const swirl = [0, 1, 2].map(k => { let d = ''; for (let t = 0; t <= 1.001; t += .02) { const a = t * Math.PI * 2.4 + k * 2.1, r = 18 + t * 128; d += (t ? ' L' : 'M') + (C.x + r * Math.cos(a)).toFixed(1) + ' ' + (C.y + r * Math.sin(a) * .92).toFixed(1); } return `<path d="${d}" fill="none" stroke="#E7B77F" stroke-opacity="${[.55, .35, .25][k]}" stroke-width="${[2.2, 1.6, 1.2][k]}" stroke-linecap="round"/>`; }).join('');
const steam = [0, 1, 2].map(k => { const x0 = C.x - 60 + k * 58; return `<path d="M${x0} ${C.y - 150} C ${x0 - 40} ${C.y - 210}, ${x0 + 44} ${C.y - 250}, ${x0 + 4} ${C.y - 300} S ${x0 - 30} ${C.y - 360}, ${x0 + 10} ${C.y - 400}" fill="none" stroke="#F1E6D2" stroke-opacity="${[.22, .32, .18][k]}" stroke-width="2" stroke-linecap="round"/>`; }).join('');
const hA = 208 * Math.PI / 180, hx = C.x + 176 * Math.cos(hA), hy = C.y + 176 * Math.sin(hA);
const art = `<svg viewBox="0 0 680 720" role="img" aria-labelledby="${ID}-t" style="overflow:hidden">
  <title id="${ID}-t">Line drawing of an espresso cup on its saucer, seen from above, with steam rising</title>
  <defs>
    <radialGradient id="${ID}-crema" cx="46%" cy="44%" r="60%"><stop offset="0" stop-color="#7A421F"/><stop offset=".55" stop-color="#B8763A"/><stop offset=".86" stop-color="#8C4F25"/><stop offset="1" stop-color="#4B2512"/></radialGradient>
    <radialGradient id="${ID}-porc" cx="40%" cy="36%" r="70%"><stop offset="0" stop-color="#FFF9EE"/><stop offset="1" stop-color="#D9CDB9"/></radialGradient>
    <pattern id="${ID}-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><path d="M0 0 V7" stroke="#F1E6D2" stroke-opacity=".16" stroke-width="1"/></pattern>
    <filter id="${ID}-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="12"/></filter>
  </defs>
  <circle cx="${C.x}" cy="${C.y}" r="${saucer}" fill="#211712" stroke="#F1E6D2" stroke-opacity=".55" stroke-width="1.4"/>
  <path d="M${C.x - saucer + 2} ${C.y} a${saucer - 2} ${saucer - 2} 0 1 0 ${2 * (saucer - 2)} 0 a${saucer - 2} ${saucer - 2} 0 1 0 ${-2 * (saucer - 2)} 0 Z M${C.x - well} ${C.y} a${well} ${well} 0 1 1 ${2 * well} 0 a${well} ${well} 0 1 1 ${-2 * well} 0 Z" fill="url(#${ID}-hatch)" fill-rule="evenodd"/>
  <circle cx="${C.x}" cy="${C.y}" r="${saucer - 22}" fill="none" stroke="#F1E6D2" stroke-opacity=".28" stroke-width="1"/>
  <circle cx="${C.x}" cy="${C.y}" r="${well}" fill="none" stroke="#F1E6D2" stroke-opacity=".35" stroke-width="1" stroke-dasharray="2 5"/>
  <g transform="rotate(38 ${C.x + 190} ${C.y + 196})"><ellipse cx="${C.x + 190}" cy="${C.y + 196}" rx="30" ry="19" fill="none" stroke="#F1E6D2" stroke-opacity=".7" stroke-width="1.6"/><path d="M${C.x + 220} ${C.y + 196} H${C.x + 330}" stroke="#F1E6D2" stroke-opacity=".7" stroke-width="5" stroke-linecap="round"/></g>
  <circle cx="${C.x + 16}" cy="${C.y + 22}" r="${cup}" fill="#000" opacity=".45" filter="url(#${ID}-soft)"/>
  <g transform="rotate(${(208).toFixed(0)} ${hx.toFixed(1)} ${hy.toFixed(1)})"><rect x="${hx.toFixed(1)}" y="${(hy - 21).toFixed(1)}" width="92" height="42" rx="21" fill="url(#${ID}-porc)" stroke="#15120F" stroke-width="1.6"/><path d="M${(hx + 40).toFixed(1)} ${hy.toFixed(1)} h36" stroke="#15120F" stroke-opacity=".25" stroke-width="1.4" stroke-linecap="round"/></g>
  <circle cx="${C.x}" cy="${C.y}" r="${cup}" fill="url(#${ID}-porc)" stroke="#15120F" stroke-width="1.6"/>
  <circle cx="${C.x}" cy="${C.y}" r="${rim}" fill="#3A1D0E"/>
  <circle cx="${C.x}" cy="${C.y}" r="${crema}" fill="url(#${ID}-crema)"/>
  ${rings}${swirl}
  <path d="M${C.x - 150} ${C.y - 70} A ${cup - 12} ${cup - 12} 0 0 1 ${C.x - 40} ${C.y - 176}" fill="none" stroke="#FFFFFF" stroke-opacity=".75" stroke-width="5" stroke-linecap="round"/>
  ${steam}
</svg>`;

export default {
  study: true,
  id: ID,
  title: 'The Long Minute — essay opener',
  notes: 'Purpose: Open a visual essay with one dramatic typographic statement, a one-sentence dek and a single drawn image.\nModify: Change issue and story. Keep the title to two or three short words so it can run at display size; move the drawing further right (or use a photograph) if the words are longer.\nInvariant: The title is the first read, the drawing the second, the dek the third. The drawing is cropped deliberately by the right edge; keep the crop inside the SVG viewport.\nStatic: Static page.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-editorial ed-p-opener',
  content: `<div class="ed is-dark">
  <div class="ed-art" style="left:600px;top:0;width:680px;height:720px">${art}</div>
  <div class="ed-mast" style="right:auto;width:470px" data-region="support"><b>${issue.name}</b><span>Issue ${issue.number} · ${issue.theme}</span></div>
  <h1 class="ed-title" data-region="title"><span class="ed-the">${story.pre}</span> ${story.title}<i>${story.italic}</i></h1>
  <div class="ed-foot1"><p class="ed-dek" data-region="support">${story.dek}</p>
  <p class="ed-by">${story.byline} · ${issue.section}, p. ${issue.page}</p></div>
</div>`
};
