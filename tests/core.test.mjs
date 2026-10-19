import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import vm from 'node:vm';import {spawnSync} from 'node:child_process';import {ROOT,compile,loadTheme,embedAssets,LAYOUTS,contrast,wrap} from '../scripts/core.mjs';import {renderHTML} from '../scripts/html.mjs';
const theme=await loadTheme('neutral');const deck=s=>({version:1,title:'Test',sample:true,slides:[s]});
// Embedded images are base64 and may spell "NaN"; geometry and text are checked, and every scene number must be finite.
test('all worked examples compile with portable local assets',async()=>{let found=new Set();for(const file of (await fs.readdir(path.join(ROOT,'assets/examples'))).filter(x=>x.endsWith('.json'))){const d=JSON.parse(await fs.readFile(path.join(ROOT,'assets/examples',file)));const scene=await embedAssets(compile(d,await loadTheme(d.theme)),path.join(ROOT,'assets/examples'));const html=renderHTML(scene);for(const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);assert.equal(scene.slides.length,d.slides.length);d.slides.forEach(s=>found.add(s.layout));assert(!html.replace(/data:[\w/+.-]+;base64,[A-Za-z0-9+/=]+/g,'').includes('NaN'));const finite=v=>typeof v==='number'?Number.isFinite(v):Array.isArray(v)?v.every(finite):v&&typeof v==='object'?Object.values(v).every(finite):true;assert(scene.slides.every(s=>finite(s.elements)),file);assert(scene.slides.every(s=>s.elements.every(n=>Number.isInteger(n.step))));}assert.deepEqual([...found].sort(),[...LAYOUTS].sort())});
test('negative bars and all-zero charts remain finite',()=>{for(const values of [[-20,0,30],[0,0,0]]){const s=compile(deck({layout:'bar',title:'Signed',unit:'h',data:values.map((value,i)=>({label:String(i),value}))}),theme);assert(s.slides[0].elements.every(e=>Number.isFinite(e.x+e.y+e.w+e.h)));assert(s.slides[0].elements.filter(e=>e.type==='rect').every(e=>e.h>=0))}});
// Labels now use the real minus sign (U+2212), as in the craft templates.
test('waterfall totals are explicit and preserve signed labels',()=>{const s=compile(deck({layout:'waterfall',title:'Change',unit:'h',data:[{label:'Start',value:100,total:true},{label:'Less',value:-30},{label:'More',value:5},{label:'End',value:75,total:true}]}),theme);const txt=s.slides[0].elements.filter(e=>e.type==='text').map(e=>e.text);assert(txt.includes('−30'));assert(txt.includes('+5'));assert(txt.includes('75'))});
// The donut is drawn with native ring sectors (editable freeform shapes), not an SVG picture.
test('100 percent donut is a complete ring; zero total rejected',()=>{const d={layout:'donut',title:'Share',unit:'',data:[{label:'Only',value:5}]};const els=compile(deck(d),theme).slides[0].elements;assert(!els.some(e=>e.type==='svg'||e.type==='image'));const arcs=els.filter(e=>e.type==='path').flatMap(e=>e.d.filter(c=>c[0]==='A'));const outer=Math.max(...arcs.map(c=>c[3]));assert.equal(Math.round(arcs.filter(c=>c[3]===outer).reduce((a,c)=>a+Math.abs(c[5]-c[4]),0)),360);assert.throws(()=>compile(deck({...d,data:[{label:'Zero',value:0}]}),theme),/positive total/)});
test('invalid series cannot silently render a plausible graph',()=>{assert.throws(()=>compile(deck({layout:'stacked',title:'Mix',unit:'',series:['A','B'],data:[{label:'x',values:[2]}]}),theme),/mismatch/);assert.throws(()=>compile(deck({layout:'bar',title:'bad',unit:'',data:[{label:'x',value:'10'}]}),theme),/finite numeric/)});
test('excess copy produces a repairable error rather than clipping',()=>assert.throws(()=>compile(deck({layout:'statement',title:'長すぎる文章'.repeat(100)}),theme),/Shorten or change layout/));
test('ragged table and missing graph endpoint are rejected',()=>{assert.throws(()=>compile(deck({layout:'table',title:'Table',columns:['A','B'],rows:[[1]]}),theme),/ragged/);assert.throws(()=>compile(deck({layout:'architecture',title:'Graph',nodes:[{id:'a',x:100,y:300,w:200,h:90,label:'A'}],links:[{from:'a',to:'missing'}]}),theme),/unknown endpoint/)});
test('embedding source text cannot terminate the scene script',()=>{const s=compile(deck({layout:'statement',title:'Safe',notes:'</script><script>alert(1)</script>'}),theme);const html=renderHTML(s);assert(!html.includes('</script><script>alert'));const m=html.match(/id="slide-studio-scene">([\s\S]*?)<\/script>/);assert.equal(JSON.parse(m[1]).slides[0].notes,s.slides[0].notes)});
test('freeform rejects off-canvas, duplicate IDs and invalid colors',()=>{const base={layout:'freeform',title:'Custom',elements:[{type:'rect',id:'x',x:1200,y:200,w:100,h:100}]};assert.throws(()=>compile(deck(base),theme),/outside canvas/);const el={type:'rect',id:'x',x:100,y:200,w:100,h:100};assert.throws(()=>compile(deck({...base,elements:[el,el]}),theme),/duplicate element/);assert.throws(()=>compile(deck({...base,elements:[{...el,fill:'red;evil'}]}),theme),/invalid fill/)});
test('all themes keep primary text readable against background',async()=>{for(const file of (await fs.readdir(path.join(ROOT,'assets/themes')))){const t=await loadTheme(path.join(ROOT,'assets/themes',file));assert(contrast(t.paper,t.ink)>=7)}});
test('source provenance and build groups survive compilation',()=>{const s=compile(deck({layout:'process',title:'Steps',build:'sequential',notes:'Talk',sources:[{file:'input.csv'}],items:[{title:'A',body:'One'},{title:'B',body:'Two'}]}),theme).slides[0];assert.equal(s.sources[0].file,'input.csv');assert(s.elements.some(e=>e.step===1));assert(s.elements.some(e=>e.step===2));assert.equal(s.elements.find(e=>e.text==='Steps').step,0)});

test("Japanese punctuation does not start a wrapped line",()=>{for(const text of ["一つの論点を二つの視点から比較する。","画像の意味を説明し、読み手に次の行動を伝える。"]){const result=wrap(text,170,24);assert(!result.some(line=>/^[。、，．！？）］】」』]/.test(line)));}});

// ---------------------------------------------------------------- the page standard

const examples = async () => Promise.all((await fs.readdir(path.join(ROOT, 'assets/examples'))).filter(f => f.endsWith('.json')).map(async f => {
  const d = JSON.parse(await fs.readFile(path.join(ROOT, 'assets/examples', f)));
  return { file: f, deck: d, scene: compile(d, await loadTheme(d.theme)) };
}));
const texts = slide => slide.elements.filter(e => e.type === 'text');
const isNice = (v, step) => Math.abs(v / step - Math.round(v / step)) < 1e-9 && [1, 2, 2.5, 5].some(m => Math.abs(step / 10 ** Math.floor(Math.log10(step)) - m) < 1e-9);

test('type sizes meet the reading minimums on every example page', async () => {
  for (const { file, scene } of await examples()) for (const s of scene.slides) for (const n of texts(s)) {
    const where = `${file} ${s.id} "${n.text.slice(0, 20)}"`;
    if (s.layout === 'freeform') continue; // author-sized
    assert(n.size >= (n.role === 'source' ? 15 : 16), `${where}: ${n.size}px`);
    if (n.role === 'body') assert(n.size >= 20, `${where}: body ${n.size}px`);
    if (n.role === 'title' && !['cover', 'statement', 'section', 'quote', 'closing'].includes(s.layout)) assert(n.size >= 36 && n.size <= 44, `${where}: headline ${n.size}px`);
  }
});

test('muted and accent text keep 4.5:1 against the background in every theme', async () => {
  for (const file of await fs.readdir(path.join(ROOT, 'assets/themes'))) {
    const t = await loadTheme(path.join(ROOT, 'assets/themes', file));
    assert(contrast(t.muted, t.paper) >= 4.5, `${file}: muted ${contrast(t.muted, t.paper).toFixed(2)}`);
    assert(contrast(t.accentText, t.paper) >= 4.5, `${file}: accent text`);
    assert(t.titleSize >= 36 && t.titleSize <= 44, `${file}: titleSize`);
  }
});

test('chart axes use nice tick values that include the zero baseline', () => {
  const awkward = [{ label: 'a', value: 17.5 }, { label: 'b', value: 33.8 }, { label: 'c', value: 45 }, { label: 'd', value: 11.3 }];
  const line = compile(deck({ layout: 'line', title: 'Trend', unit: 'h', data: awkward }), theme).slides[0];
  const scatter = compile(deck({ layout: 'scatter', title: 'Pairs', unit: 'h', xLabel: 'n', data: awkward.map((d, i) => ({ x: d.value * 3.1, y: d.value, label: d.label })) }), theme).slides[0];
  for (const s of [line, scatter]) {
    const ticks = texts(s).filter(n => n.role === 'axis' && n.numeric).map(n => Number(n.text.replace(/[,−]/g, m => (m === ',' ? '' : '-'))));
    assert(ticks.length >= 3 && ticks.includes(0), `${s.layout}: ${ticks}`);
    const byAxis = s.layout === 'line' ? [ticks] : [ticks.slice(0, ticks.indexOf(0, 1) > 0 ? ticks.indexOf(0, 1) : ticks.length), ticks.slice(ticks.indexOf(0, 1))];
    for (const axis of byAxis.filter(a => a.length > 1)) {
      const sorted = [...new Set(axis)].sort((a, b) => a - b), step = sorted[1] - sorted[0];
      assert(sorted.every(v => isNice(v, step)), `${s.layout}: ticks ${sorted} are not round`);
    }
  }
  const bar = compile(deck({ layout: 'bar', title: 'Parts', unit: 'h', data: awkward }), theme).slides[0];
  const base = bar.elements.find(e => e.type === 'line' && e.role === 'axis');
  const bars = bar.elements.filter(e => e.type === 'rect');
  assert(bars.every(b => Math.abs(b.y + b.h - base.y1) < 0.6), 'positive bars stand on the zero line');
});

test('one accent marks what the headline names; everything else stays grey', () => {
  const data = [{ label: '集計', value: 45 }, { label: '確認', value: 25 }, { label: '分析', value: 20 }];
  const fills = s => s.elements.filter(e => e.type === 'rect').map(e => e.fill);
  const named = compile(deck({ layout: 'bar', title: '集計に最も時間を使っている', unit: 'h', data }), theme).slides[0];
  assert.deepEqual(fills(named), [theme.accent, theme.context, theme.context]);
  const explicit = compile(deck({ layout: 'bar', title: '内訳', unit: 'h', data, highlight: '分析' }), theme).slides[0];
  assert.deepEqual(fills(explicit), [theme.context, theme.context, theme.accent]);
  const none = compile(deck({ layout: 'bar', title: '集計に最も時間を使っている', unit: 'h', data, highlight: null }), theme).slides[0];
  assert(!fills(none).includes(theme.accent));
});

test('step numbers appear only when the deck asks for a numbered sequence', () => {
  const items = [{ title: '集める', body: '記録する。' }, { title: '分ける', body: '分類する。' }, { title: '戻す', body: '決める。' }];
  const ordinals = s => texts(s).filter(n => /^0?\d+$/.test(n.text) && n.role !== 'source');
  for (const layout of ['process', 'agenda']) {
    assert.equal(ordinals(compile(deck({ layout, title: '手順', items }), theme).slides[0]).length, 0, layout);
    assert.deepEqual(ordinals(compile(deck({ layout, title: '手順', items, numbered: true }), theme).slides[0]).map(n => n.text), ['1', '2', '3'], layout);
  }
  const section = compile(deck({ layout: 'section', title: '提案', number: '2' }), theme).slides[0];
  const num = texts(section).find(n => n.text === '2'), head = texts(section).find(n => n.role === 'title');
  assert(num.size < head.size && num.color !== theme.accent, 'section numbers are navigation, not ornament');
});

test('charts are native shapes and labels; scatter labels never collide', () => {
  const pts = [[10, 20, 'A'], [11, 21, 'B'], [12, 20, 'C'], [11, 19, 'D'], [30, 45, 'E'], [31, 44, 'F']].map(([x, y, label]) => ({ x, y, label }));
  const s = compile(deck({ layout: 'scatter', title: 'Clusters', unit: 'h', xLabel: 'n', data: pts }), theme).slides[0];
  const labels = texts(s).filter(n => n.role === 'label');
  assert.equal(labels.length, pts.length);
  const box = n => ({ x: n.x, y: n.y, w: n.w, h: n.h });
  const hit = (a, b) => a.x < b.x + b.w - 0.5 && b.x < a.x + a.w - 0.5 && a.y < b.y + b.h - 0.5 && b.y < a.y + a.h - 0.5;
  const dots = s.elements.filter(e => e.type === 'ellipse').map(box);
  labels.forEach((a, i) => { labels.slice(i + 1).forEach(b => assert(!hit(box(a), box(b)), `${a.text}/${b.text}`)); dots.forEach(d => assert(!hit(box(a), d), `${a.text} covers a point`)); });
  for (const layout of ['bar', 'line', 'stacked', 'waterfall', 'donut', 'scatter']) {
    const spec = layout === 'stacked' ? { series: ['a', 'b'], data: [{ label: 'x', values: [1, 2] }, { label: 'y', values: [2, 3] }] } : layout === 'scatter' ? { xLabel: 'n', data: pts } : { data: [{ label: 'a', value: 3 }, { label: 'b', value: 5, total: layout === 'waterfall' }] };
    const els = compile(deck({ layout, title: layout, unit: 'h', ...spec }), theme).slides[0].elements;
    assert(!els.some(e => e.type === 'image' || e.type === 'svg'), `${layout} must not be a picture`);
  }
});

test('donut keeps six parts at most and explains its total', () => {
  const data = n => Array.from({ length: n }, (_, i) => ({ label: `p${i}`, value: i + 1 }));
  assert.throws(() => compile(deck({ layout: 'donut', title: 'Too many', unit: '件', data: data(7) }), theme), /max 6 parts/);
  const s = compile(deck({ layout: 'donut', title: 'Mix', unit: '件', centerLabel: '問い合わせ', data: data(6) }), theme).slides[0];
  assert(texts(s).some(n => n.text === '21件') && texts(s).some(n => n.text === '問い合わせ'));
});

test('paragraph breaks become half-line gaps and value units share one baseline', () => {
  const s = compile(deck({ layout: 'split', title: 'Two', leftTitle: 'A', leftBody: '一つ目の段落。\n\n二つ目の段落。', rightTitle: 'B', rightBody: '短い。' }), theme).slides[0];
  const body = texts(s).find(n => n.text.includes('二つ目'));
  assert(body.paraGap > 0 && body.paraGap < body.size * body.lineHeight);
  const m = compile(deck({ layout: 'metric', title: 'One', label: '作業時間', value: '+12時間' }), theme).slides[0];
  const v = texts(m).find(n => n.runs);
  assert.deepEqual(v.runs.map(r => r.text), ['+12', '時間']);
  assert(v.runs[0].size > 2 * v.runs[1].size);
});

test('slide ids that the player uses for its controls are rejected', () => {
  assert.throws(() => compile(deck({ layout: 'statement', title: 'Next', id: 'next' }), theme), /player controls/);
});

test('Japanese wraps between phrases, without stranding a short first line', () => {
  assert.deepEqual(wrap('何が書かれているかを、そのまま書く。', 357, 24), ['何が書かれているかを、', 'そのまま書く。']);
  assert(!wrap('2029年度に270億円まで増やす', 200, 24).some(l => /^(年度|億円)/.test(l)), 'numbers stay with their units');
});

test('editable PPTX export writes native shapes, freeform paths, tables and slide titles', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'ss-pptx-'));
  try {
    const spec = { version: 1, title: 'Native', sample: true, language: 'ja', slides: [
      { layout: 'donut', title: '請求が4割', unit: '件', data: [{ label: '請求', value: 4 }, { label: '操作', value: 6 }] },
      { layout: 'line', title: '増えた', unit: '人', data: [{ label: '4月', value: 1 }, { label: '5月', value: 3 }] },
      { layout: 'table', title: '条件', columns: ['指標', '目標'], rows: [['時間', '70時間以下']] },
      { layout: 'metric', title: '一つの数字', label: '作業時間', value: '+12時間', body: '一段落目。\n\n二段落目。' },
    ] };
    const sceneFile = path.join(dir, 'deck.scene.json'), out = path.join(dir, 'deck.pptx');
    await fs.writeFile(sceneFile, JSON.stringify(compile(spec, theme)));
    const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/export-pptx.mjs'), sceneFile, out, '--mode', 'editable'], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    const { default: JSZip } = await import(path.join(ROOT, 'node_modules/jszip/lib/index.js'));
    const zip = await JSZip.loadAsync(await fs.readFile(out));
    const xml = await Promise.all([1, 2, 3, 4].map(i => zip.file(`ppt/slides/slide${i}.xml`).async('string')));
    assert(xml[0].includes('<a:custGeom>') && xml[0].includes('<a:arcTo'), 'donut ring sectors are freeform shapes');
    assert(xml[1].includes('<a:custGeom>'), 'the line is a freeform path');
    assert(xml[2].includes('<a:tbl>'), 'the table is a real table');
    assert(xml.every(x => !x.includes('<p:pic>')), 'no pictures of charts');
    assert(xml.every(x => /<p:ph[^>]*type="title"/.test(x)), 'every slide has a title placeholder');
    assert(xml.every(x => (x.match(/<a:p>[\s\S]*?<\/a:p>/g) || []).every(p => (p.match(/<a:pPr\b/g) || []).length <= 1)), 'one paragraph-properties element per paragraph');
    assert(/lang="ja-JP"/.test(xml[3]) && /<a:spcBef>/.test(xml[3]), 'language tag and paragraph spacing carried over');
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});

test('freeform colours may name theme roles, so a custom page follows the theme', async () => {
  const spec = deck({ layout: 'freeform', title: 'Custom', elements: [{ type: 'text', id: 'a', x: 64, y: 300, w: 400, h: 40, text: 'Before', size: 24, color: 'muted' }, { type: 'rect', id: 'b', x: 64, y: 360, w: 200, h: 8, fill: 'accent' }] });
  for (const name of ['neutral', 'stage']) {
    const t = await loadTheme(name), els = compile(spec, t).slides[0].elements;
    assert.equal(els.find(e => e.id === 'a').color, t.muted);
    assert.equal(els.find(e => e.id === 'b').fill, t.accent);
  }
  assert.throws(() => compile(deck({ layout: 'freeform', title: 'Bad', elements: [{ type: 'rect', id: 'c', x: 64, y: 300, w: 10, h: 10, fill: 'brand-blue' }] }), theme), /invalid fill/);
});
