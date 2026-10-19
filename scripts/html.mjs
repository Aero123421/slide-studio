/** Self-contained HTML player for the structured route. Navigation is progressive, never autoplay.
 * Print/export reveals every build. Author notes remain outside slide elements.
 * Each scene node becomes one absolutely positioned element (text as <h1>/<p>, tables as <table>,
 * lines and paths as inline SVG); the same scene drives the editable PPTX export.
 */
import { esc, safeJSON } from './core.mjs';

// Font stacks: the theme family first, then families that look right on macOS, Windows and Linux.
const STACK = {
  sans: `'Inter','Helvetica Neue',Arial,'Hiragino Sans','Hiragino Kaku Gothic ProN','Noto Sans JP','Yu Gothic UI','Yu Gothic',Meiryo,'IPAPGothic',sans-serif`,
  serif: `'Charter','Bitstream Charter',Georgia,'Hiragino Mincho ProN','Yu Mincho','Noto Serif JP','IPAMincho',serif`,
  mono: `'JetBrains Mono','SFMono-Regular',Menlo,Consolas,'DejaVu Sans Mono',monospace`,
};
export function fontStack(font = '') {
  const kind = /mono|consolas|courier|menlo/i.test(font) ? 'mono' : /serif|mincho|georgia|times|charter|garamond/i.test(font) && !/sans/i.test(font) ? 'serif' : 'sans';
  const own = String(font).split(',').map(f => f.trim()).filter(Boolean).map(f => `'${esc(f)}'`);
  return [...own, STACK[kind]].join(',');
}
const REGION = { title: 'title', kicker: 'support', support: 'support', source: 'source', chrome: 'source' };
const n2 = v => Math.round(v * 100) / 100;

function arcEnd(cx, cy, r, a) { const t = (a * Math.PI) / 180; return [cx + r * Math.cos(t), cy + r * Math.sin(t)]; }
/** Scene path commands -> SVG path data, relative to (ox, oy). */
export function svgPath(d, ox = 0, oy = 0) {
  return d.map(c => {
    if (c[0] === 'M' || c[0] === 'L') return `${c[0]}${n2(c[1] - ox)} ${n2(c[2] - oy)}`;
    if (c[0] === 'A') {
      const [, cx, cy, r, a0, a1] = c, [ex, ey] = arcEnd(cx, cy, r, a1);
      return `A${n2(r)} ${n2(r)} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 1 : 0} ${n2(ex - ox)} ${n2(ey - oy)}`;
    }
    return 'Z';
  }).join(' ');
}

/** Runs share one line (a figure and its unit); paragraphs get `paraGap` instead of an empty line. */
function textContent(n) {
  if (n.runs?.length) return n.runs.map(r => `<span style="font-size:${r.size}px;font-weight:${r.weight};color:${r.color}${r.tracking ? `;letter-spacing:${r.tracking}em` : ''}">${esc(r.text)}</span>`).join('');
  if (n.paraGap) return n.text.split('\n\n').map((p, i) => `<span style="display:block${i ? `;margin-top:${n.paraGap}px` : ''}">${esc(p)}</span>`).join('');
  return esc(n.text);
}
function attrs(n) {
  return `data-id="${esc(n.id)}" data-step="${n.step}"${n.role ? ` data-role="${esc(n.role)}"` : ''}`;
}
function box(n, pad = 0) {
  return `left:${n2(n.x - pad)}px;top:${n2(n.y - pad)}px;width:${n2(n.w + 2 * pad)}px;height:${n2(n.h + 2 * pad)}px;`;
}

export function nodeHTML(n) {
  if (n.type === 'text') {
    const tag = n.role === 'title' ? 'h1' : 'p';
    const style = `${box(n)}font-family:${fontStack(n.font)};font-size:${n.size}px;font-weight:${n.weight};line-height:${n.lineHeight};color:${n.color};text-align:${n.align}${n.tracking ? `;letter-spacing:${n.tracking}em` : ''}${n.italic ? ';font-style:italic' : ''}`;
    return `<${tag} class="node text${n.numeric ? ' num' : ''}" ${attrs(n)} data-region="${REGION[n.role] || 'primary'}"${n.role === 'quote-mark' ? ' aria-hidden="true"' : ''} style="${style}">${textContent(n)}</${tag}>`;
  }
  if (n.type === 'line') {
    const w = n.strokeWidth || 1, head = n.arrow ? 5 * w : 0, pad = Math.ceil(w + head);
    const x1 = n.x1 ?? n.x, y1 = n.y1 ?? n.y, x2 = n.x2 ?? n.x + n.w, y2 = n.y2 ?? n.y + n.h, ox = n.x - pad, oy = n.y - pad;
    let tip = '', ex = x2, ey = y2;
    if (n.arrow) {
      // The line stops at the base of the arrowhead; the head is a filled triangle at the end point.
      const len = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / len, uy = (y2 - y1) / len;
      ex = x2 - ux * head * 0.9; ey = y2 - uy * head * 0.9;
      const bx = x2 - ux * head, by = y2 - uy * head, px = -uy * head / 2, py = ux * head / 2;
      tip = `<path d="M${n2(x2 - ox)} ${n2(y2 - oy)}L${n2(bx + px - ox)} ${n2(by + py - oy)}L${n2(bx - px - ox)} ${n2(by - py - oy)}Z" fill="${n.stroke}"/>`;
    }
    const dash = n.dash ? ` stroke-dasharray="${3 * w} ${2 * w}"` : '';
    return `<svg class="node" ${attrs(n)} style="${box(n, pad)}" aria-hidden="true"><line x1="${n2(x1 - ox)}" y1="${n2(y1 - oy)}" x2="${n2(ex - ox)}" y2="${n2(ey - oy)}" stroke="${n.stroke}" stroke-width="${w}"${dash}/>${tip}</svg>`;
  }
  if (n.type === 'path') {
    const pad = Math.ceil(n.strokeWidth || 0) + 1, ox = n.x - pad, oy = n.y - pad;
    const stroke = n.stroke && n.stroke !== 'none' ? ` stroke="${n.stroke}" stroke-width="${n.strokeWidth}" stroke-linejoin="round" stroke-linecap="round"` : '';
    return `<svg class="node" ${attrs(n)} style="${box(n, pad)}" aria-hidden="true"><path d="${svgPath(n.d, ox, oy)}" fill="${n.fill || 'none'}"${stroke}/></svg>`;
  }
  if (n.type === 'table') {
    const cols = n.cols.map(w => `<col style="width:${n2(w)}px">`).join('');
    const rows = n.rows.map(r => {
      const tag = r.header ? 'th' : 'td';
      const cells = r.cells.map(c => `<${tag}${r.header ? ' scope="col"' : ''} class="${c.numeric ? 'num' : ''}" style="padding:0 ${c.pad[1]}px 0 ${c.pad[0]}px;text-align:${c.align};vertical-align:${r.valign || 'middle'};font-size:${c.size}px;line-height:${c.lineHeight};font-weight:${c.weight};color:${c.color};${r.rule ? `border-bottom:${r.rule.width}px solid ${r.rule.color}` : ''}${r.header && r.valign === 'bottom' ? ';padding-bottom:10px' : ''}">${esc(c.text)}</${tag}>`).join('');
      return `<tr style="height:${n2(r.h)}px${r.fill ? `;background:${r.fill}` : ''}">${cells}</tr>`;
    });
    const head = n.rows.filter(r => r.header).length;
    return `<table class="node" ${attrs(n)} data-region="primary" style="${box(n)}font-family:${fontStack(n.font)}"><colgroup>${cols}</colgroup>${head ? `<thead>${rows.slice(0, head).join('')}</thead>` : ''}<tbody>${rows.slice(head).join('')}</tbody></table>`;
  }
  if (n.type === 'image' || n.type === 'svg') return `<img class="node" ${attrs(n)} src="${esc(n.src)}" alt="${esc(n.alt || '')}" style="${box(n)}object-fit:${n.fit || 'contain'}">`;
  const border = n.stroke && n.stroke !== 'none' && n.strokeWidth ? `border:${n.strokeWidth}px solid ${n.stroke};` : '';
  return `<div class="node" ${attrs(n)} aria-hidden="true" style="${box(n)}background:${n.fill === 'none' ? 'transparent' : n.fill};${border}border-radius:${n.type === 'ellipse' ? '50%' : (n.radius || 0) + 'px'}"></div>`;
}

export function renderHTML(scene) {
  const meta = { width: scene.width || 1280, height: scene.height || 720, title: scene.title, language: scene.language, readingMode: scene.readingMode || 'live', mode: 'present', slides: scene.slides.map(s => ({ id: s.id, title: s.title, layout: s.layout })) };
  return `<!doctype html>
<html lang="${esc(scene.language)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="generator" content="Slide Studio structured route"><title>${esc(scene.title)}</title><style>
*{box-sizing:border-box}html,body{margin:0;height:100%}body{background:#15171b;font-family:Arial,sans-serif;color:white}
.viewport{position:fixed;inset:0 0 52px 0;display:grid;place-items:center;overflow:hidden}body.full .viewport{inset:0}
.deck{width:1280px;height:720px;position:relative;transform-origin:center}.slide{display:none;position:absolute;inset:0;overflow:hidden}.slide.active{display:block}
.node{position:absolute;margin:0}.text{white-space:pre;overflow:visible;font-kerning:normal;text-rendering:optimizeLegibility}.num{font-variant-numeric:tabular-nums lining-nums}
svg.node{overflow:visible;pointer-events:none}table.node{border-collapse:collapse;table-layout:fixed;border-spacing:0}table.node th,table.node td{white-space:pre;margin:0}
.slide .node{transition:opacity .28s ease,translate .28s ease}.slide .node.hidden-build{opacity:0;translate:0 14px;visibility:hidden}body.static .node{opacity:1!important;translate:none!important;visibility:visible!important;transition:none!important}body.settle .node{transition:none!important}
nav{position:fixed;left:0;right:0;bottom:0;height:52px;display:flex;gap:10px;align-items:center;justify-content:center;background:#15171b;transition:opacity .2s}body.full nav{opacity:0}body.full nav:hover,body.full nav:focus-within{opacity:1}
button{font:14px Arial;color:white;background:transparent;border:1px solid #6d737f;border-radius:5px;padding:7px 12px;cursor:pointer}button:focus-visible{outline:3px solid #95c6ff;outline-offset:2px}.counter{display:grid;place-items:center;min-width:75px;font-size:14px}
.notes{display:none;position:fixed;right:20px;top:20px;max-width:540px;max-height:75vh;overflow:auto;background:#fff;color:#20242c;padding:24px;font:18px/1.6 Arial;border-radius:10px;white-space:pre-wrap;box-shadow:0 6px 40px #0004;z-index:2}.notes.open{display:block}.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
body.overview{overflow:auto}body.overview .viewport{position:static;display:block;place-items:normal;padding:24px}body.overview .deck{transform:none!important;width:auto;height:auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,358px),1fr));gap:20px}body.overview .slide{display:block;position:relative;width:1280px;height:720px;zoom:.28;transform:none;transform-origin:top left;margin:0}body.overview .node{opacity:1!important;visibility:visible!important;translate:none!important}body.overview nav{position:sticky}
@media(prefers-reduced-motion:reduce){.slide .node{transition:none;translate:none!important}}
@page{size:13.333333in 7.5in;margin:0}@media print{html,body{width:1280px;height:auto;background:white;margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}.viewport{position:static;display:block;width:1280px;height:auto}.deck{transform:none!important;width:1280px;height:auto}.slide{display:block!important;position:relative!important;width:1280px;height:720px;break-after:page;page-break-after:always}.slide:last-child{break-after:auto;page-break-after:auto}.node{opacity:1!important;visibility:visible!important;translate:none!important;transition:none!important}nav,.notes,.sr-only{display:none!important}body.overview .deck{display:block}body.overview .slide{transform:none;zoom:1;margin:0}}
</style></head><body><div class="viewport"><main class="deck" aria-label="${esc(scene.title)}">${scene.slides.map((s, i) => `<section class="slide${i === 0 ? ' active is-current' : ''}" id="${esc(s.id)}" aria-label="${esc(s.title)}" aria-hidden="${i !== 0}" style="background:${s.paper}">${s.elements.map(nodeHTML).join('')}</section>`).join('\n')}</main></div><nav aria-label="スライド操作"><button id="prev" aria-label="前へ">←</button><span class="counter"></span><button id="next" aria-label="次へ">→</button><button id="overview">一覧 O</button><button id="notes">ノート N</button><button id="full">全画面 F</button></nav><aside class="notes" aria-label="発表者ノート"></aside><div class="sr-only" aria-live="polite" id="announce"></div>
<!-- Canonical scene for EDITABLE export; keep this JSON synchronized by rebuilding.
     Arbitrary DOM/CSS edits do not update PPTX scene objects. Use fidelity export for them. -->
<script type="application/json" id="slide-studio-scene">${safeJSON(scene)}</script>
<script>
(()=>{'use strict';const scene=JSON.parse(document.getElementById('slide-studio-scene').textContent);const meta=${safeJSON(meta)};const slides=[...document.querySelectorAll('.slide')];let current=0,step=0;const params=new URLSearchParams(location.search);if(params.has('static'))document.body.classList.add('static');
const maxBuild=i=>Math.max(0,...scene.slides[i].elements.map(n=>n.step||0));
function scale(){const bar=document.body.classList.contains('full')?0:52;document.querySelector('.deck').style.transform='scale('+Math.min(innerWidth/1280,Math.max(1,innerHeight-bar)/720)+')'}
function show(i,build=0){current=Math.max(0,Math.min(slides.length-1,i));step=Math.max(0,Math.min(maxBuild(current),build));slides.forEach((s,j)=>{s.classList.toggle('active',j===current);s.classList.toggle('is-current',j===current);s.setAttribute('aria-hidden',!document.body.classList.contains('overview')&&j!==current);s.querySelectorAll('[data-step]').forEach(n=>n.classList.toggle('hidden-build',Number(n.dataset.step)>step))});document.querySelector('.counter').textContent=(current+1)+' / '+slides.length;const note=scene.slides[current];document.querySelector('.notes').textContent=note.notes+(note.sources.length?'\\n\\nSources\\n'+note.sources.map(s=>typeof s==='string'?s:(s.title||'Source')+' '+(s.url||s.file||'')).join('\\n'):'');document.getElementById('announce').textContent=note.title;history.replaceState(null,'','#'+encodeURIComponent(note.id));}
function next(){if(!document.body.classList.contains('static')&&step<maxBuild(current))show(current,step+1);else if(current<slides.length-1)show(current+1)}
function prev(){if(step>0&&!document.body.classList.contains('static'))show(current,step-1);else if(current>0)show(current-1,maxBuild(current-1))}
function overview(){const on=document.body.classList.toggle('overview');slides.forEach((s,i)=>s.setAttribute('aria-hidden',!on&&i!==current));scale()}
function notes(){document.querySelector('.notes').classList.toggle('open')}
async function full(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{document.getElementById('announce').textContent='全画面表示はこの環境では利用できません'}}
document.getElementById('next').onclick=next;document.getElementById('prev').onclick=prev;document.getElementById('overview').onclick=overview;document.getElementById('notes').onclick=notes;document.getElementById('full').onclick=full;
document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();next()}else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();prev()}else if(e.key==='Home'){e.preventDefault();show(0)}else if(e.key==='End'){e.preventDefault();show(slides.length-1,maxBuild(slides.length-1))}else if(e.key.toLowerCase()==='o')overview();else if(e.key.toLowerCase()==='n')notes();else if(e.key.toLowerCase()==='f')full();else if(e.key==='Escape'){document.body.classList.remove('overview');document.querySelector('.notes').classList.remove('open');show(current,step)}});
document.addEventListener('fullscreenchange',()=>{document.body.classList.toggle('full',!!document.fullscreenElement);scale()});
window.addEventListener('resize',scale);window.addEventListener('beforeprint',()=>document.body.classList.add('printing'));window.addEventListener('afterprint',()=>document.body.classList.remove('printing'));
// Deliberately tiny automation interface; renderers need no synthetic keyboard events.
// meta mirrors the craft player's page list so review tools (qa.py, contact sheets) can read both.
// finish() settles running build transitions at once, for screenshots and exports.
function finish(){document.body.classList.add('settle');void(slides[current]&&slides[current].offsetHeight);document.body.classList.remove('settle')}
window.slideStudio={scene,meta,show,finish,showAllBuilds:()=>{document.body.classList.add('static');show(current,maxBuild(current))},getState:()=>({current,step,maxBuild:maxBuild(current)})};
let hash;try{hash=decodeURIComponent(location.hash.slice(1))}catch{hash=''}const start=scene.slides.findIndex(s=>s.id===hash);scale();show(start>=0?start:0);})();
</script></body></html>`;
}
