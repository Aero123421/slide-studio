/** Meaning-first diagram contracts. Validation is deliberately narrow, not a
 * scientific/geographic verifier. Use true source relationships, then choose geometry.
 */
import {h} from './kit.mjs';
export function validateGraph(graph) {
  if(!graph||!Array.isArray(graph.nodes)||!Array.isArray(graph.edges))throw Error('nodes and edges arrays required');
  const ids=new Set();
  for(const n of graph.nodes){
    if(!n||typeof n.id!=='string'||!n.id||ids.has(n.id))throw Error('Unique node ids required');
    if(typeof n.label!=='string'||!n.label.trim())throw Error('Every node needs its actual label');
    ids.add(n.id);
  }
  const pairs=new Set();
  for(const e of graph.edges){
    if(!ids.has(e.from)||!ids.has(e.to))throw Error('Unknown edge endpoint');
    const key=e.from+'\0'+e.to;if(pairs.has(key))throw Error('Duplicate edge');pairs.add(key);
    if(e.from===e.to&&!e.meaning)throw Error('A self-loop needs an explicit meaning');
    if(!['sequence','condition','transfer','comparison','association','feedback'].includes(e.kind))throw Error('Declare each edge meaning');
    if(e.kind==='condition'&&(!e.label||!e.label.trim()))throw Error('Branch conditions need labels');
  }
  if(graph.kind==='alternatives'){
    if(!ids.has(graph.origin)||!Array.isArray(graph.outcomes)||graph.outcomes.length<2)throw Error('Alternatives require origin and at least two outcomes');
    if(new Set(graph.outcomes).size!==graph.outcomes.length||graph.outcomes.some(id=>!ids.has(id)||id===graph.origin))throw Error('Invalid outcome IDs');
    for(const id of graph.outcomes)if(!graph.edges.some(e=>e.from===graph.origin&&e.to===id&&e.kind==='condition'))throw Error('Every outcome needs a direct conditional branch');
    if(graph.edges.some(e=>graph.outcomes.includes(e.from)&&graph.outcomes.includes(e.to)))throw Error('Alternative outcomes must not be drawn as a sequential chain');
  }
  return {valid:true,nodes:ids.size,edges:graph.edges.length,limits:'Validates declared relationships, not whether the source itself is correct.'};
}
/** Small optional branch constructor. Change the source/geometry when necessary;
 * it is NOT a mandate to express every subject as branches or rounded cards.
 */
export function branches({id='branch',origin,outcomes,colors={ink:'#182e3a',accent:'#276b66'},width=1000,height=480}) {
  if(!/^[A-Za-z][\w-]*$/.test(id))throw Error('SVG id prefix required');
  if(!Number.isFinite(width)||!Number.isFinite(height)||width<500||height<440)throw Error('Canvas too small for labelled branches');
  if(!Array.isArray(outcomes)||outcomes.length<2||outcomes.length>4)throw Error('Use 2..4 outcomes or design a different graph');
  const graph={kind:'alternatives',origin:'origin',outcomes:outcomes.map((_,i)=>'out'+i),nodes:[{id:'origin',label:origin},...outcomes.map((o,i)=>({id:'out'+i,label:o.label}))],edges:outcomes.map((o,i)=>({from:'origin',to:'out'+i,kind:'condition',label:o.condition}))};validateGraph(graph);
  if([origin,...outcomes.flatMap(o=>[o.label,o.condition])].some(s=>s.length>40))throw Error('Long labels: reserve a label rail or expand the composition, not automatic truncation');
  const cx=width/2,top=95,bottom=height-95,gap=width/(outcomes.length+1);
  const conditionY=height*.62;
  const labelWidth=s=>[...s].reduce((n,c)=>n+(/[\u3000-\u9fff\uff00-\uffef]/u.test(c)?28:17),0);
  if(outcomes.some(o=>labelWidth(o.condition)>gap-24))throw Error('Condition labels need more width: enlarge the canvas, wrap explicitly or use a label rail');
  const paths=outcomes.map((o,i)=>{const x=gap*(i+1);return `<path data-from="origin" data-to="out${i}" d="M${cx},${top+32} L${cx},${height*.46} L${x},${height*.46} L${x},${conditionY-34}" fill="none" stroke="${h(colors.accent)}" stroke-width="3"/><path d="M${x},${conditionY+12} L${x},${bottom-32}" fill="none" stroke="${h(colors.accent)}" stroke-width="3" marker-end="url(#${id}-arrow)"/><text x="${x}" y="${conditionY}" text-anchor="middle" font-size="28" fill="${h(colors.accent)}">${h(o.condition)}</text><text x="${x}" y="${bottom+8}" text-anchor="middle" font-size="32" fill="${h(colors.ink)}">${h(o.label)}</text>`}).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${id}-title"><title id="${id}-title">${h(origin)}: ${outcomes.map(o=>h(o.condition+' → '+o.label)).join('; ')}</title><defs><marker id="${id}-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="${h(colors.accent)}"/></marker></defs>${paths}<text x="${cx}" y="${top}" text-anchor="middle" font-size="36" fill="${h(colors.ink)}">${h(origin)}</text></svg>`;
}
