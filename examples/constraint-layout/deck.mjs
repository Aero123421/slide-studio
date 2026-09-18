// A new layout is calculated from graph identity and explicit measured-label budgets.
// This is an illustrative workflow, not an imported template or a real system claim.
import {allocate,dagLayers} from '../../assets/runtime/layout.mjs';
import {h} from '../../assets/runtime/kit.mjs';
const edges=[['source','clean'],['source','validate'],['clean','report'],['validate','report']];
const ids=['source','clean','validate','report'];
function makeDiagram(labels,region){
  const model=dagLayers({nodes:ids,edges,width:region.width,height:region.height,nodeWidth:205,nodeHeight:94,gapX:55,gapY:48});
  const port=(n,side)=>[n.x+(side==='right'?n.width:0),n.y+n.height/2];
  let svg=`<svg viewBox="0 0 ${region.width} ${region.height}" role="img" aria-label="Source branches to cleaning and validation before reporting.">`;
  for(const [from,to] of model.edges){const a=port(model.nodes[from],'right'),b=port(model.nodes[to],'left'),middle=(a[0]+b[0])/2;
    svg+=`<path d="M${a} H${middle} V${b[1]} H${b[0]-5}" fill="none" stroke="#567889" stroke-width="2.5"/><path d="M${b[0]} ${b[1]} l-10 -5 v10Z" fill="#567889"/>`;
  }
  for(const id of ids){const n=model.nodes[id],lines=labels[id];
    svg+=`<rect x="${n.x}" y="${n.y}" width="${n.width}" height="${n.height}" rx="3" fill="#E1EBEB" stroke="#245B72" stroke-width="2"/>`;
    for(const [j,line]of lines.entries())svg+=`<text x="${n.x+n.width/2}" y="${n.y+n.height/2-(lines.length-1)*14+j*28+7}" text-anchor="middle" font-family="Arial,sans-serif" font-size="22" fill="#172B38">${h(line)}</text>`;
  }
  return svg+'</svg>';
}
function page(id,title,labels,explanation){
  const [evidence,support]=allocate({x:64,y:240,width:1152,height:330,weights:[3.2,1],gap:44});
  const place=b=>`left:${b.x}px;top:${b.y}px;width:${b.width}px;height:${b.height}px`;
  return {id,title,content:`<h1 data-region="title">${title}</h1><div class="figure" data-region="primary" style="${place(evidence)}">${makeDiagram(labels,evidence)}</div><div class="explanation" data-region="support" style="${place(support)}"><p>${explanation}</p></div><p class="scope" data-region="source">Illustrative workflow · not a claim about an implemented system</p>`,notes:'The node IDs and edges remain constant. Label height was budgeted for two 22px lines plus padding. Inspect actual glyph widths after localization; a fit failure requires reallocation or different grouping, not hidden labels.'};
}
export default {title:'Geometry from constraints',language:'en',mode:'workshop',sample:true,
css:'.slide{background:#F7F5EF;color:#172B38;padding:64px}h1{font:54px/1.15 Arial,sans-serif;max-width:1100px;letter-spacing:-1px}.figure,.explanation{position:absolute}.figure svg{width:100%;height:100%}.explanation p{font:26px/1.45 Arial,sans-serif}.scope{position:absolute;left:64px;bottom:38px;font:17px/1.3 Arial,sans-serif;color:#526975}',
slides:[
 page('separate-roles','Separate validation from transformation.',{source:['Observations'],clean:['Transformation'],validate:['Validation'],report:['Derived report']},'A valid result needs both a defined transformation and a separate validity check.'),
 page('longer-labels','Longer labels do not change the dependencies.',{source:['Observations with','missing fields'],clean:['Recorded','transformations'],validate:['Independent','validity checks'],report:['Reviewed','derived report']},'The same graph retains every edge. More descriptive labels use the space reserved inside each node.')
]};
