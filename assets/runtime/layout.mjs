/** Geometry from relationships. Units are authored-canvas units (usually px).
 * Measure real text in the browser first. A fit failure is an invitation to
 * recompose, not a reason to delete an edge, hide a label or shrink all type. */
const finite=(...n)=>n.every(Number.isFinite);
function check(ok,message){if(!ok)throw Error(message)}
export function allocate({x=0,y=0,width,height,weights=[1,1],gap=32,axis='x'}){
  check(finite(x,y,width,height,gap)&&width>0&&height>0&&gap>=0,'Invalid region');
  check(['x','y'].includes(axis)&&Array.isArray(weights)&&weights.length&&weights.every(v=>Number.isFinite(v)&&v>0),'Positive weights and x/y axis required');
  const available=(axis==='x'?width:height)-gap*(weights.length-1);
  check(available>0,'Gaps consume region; recompose');
  const total=weights.reduce((a,b)=>a+b,0);let at=axis==='x'?x:y;
  return weights.map(v=>{const size=available*v/total;const box={x:axis==='x'?at:x,y:axis==='y'?at:y,width:axis==='x'?size:width,height:axis==='y'?size:height};at+=size+gap;return box});
}
export function dagLayers({nodes,edges,x=0,y=0,width=1000,height=400,nodeWidth=150,nodeHeight=64,gapX=48,gapY=24}){
  check(finite(x,y,width,height,nodeWidth,nodeHeight,gapX,gapY)&&Math.min(width,height,nodeWidth,nodeHeight)>0&&Math.min(gapX,gapY)>=0,'Invalid graph geometry');
  check(Array.isArray(nodes)&&nodes.length&&Array.isArray(edges),'Nodes and edges required');
  const ids=nodes.map(n=>typeof n==='string'?n:n.id),order=new Map(ids.map((id,i)=>[id,i]));
  check(ids.every(id=>typeof id==='string'&&id)&&order.size===ids.length,'Unique nonempty node IDs required');
  const incoming=new Map(ids.map(id=>[id,0])),out=new Map(ids.map(id=>[id,[]])),level=new Map(ids.map(id=>[id,0]));
  for(const e of edges){const [a,b]=Array.isArray(e)?e:[e.from,e.to];check(order.has(a)&&order.has(b),'Unknown edge endpoint');out.get(a).push(b);incoming.set(b,incoming.get(b)+1)}
  let queue=ids.filter(id=>!incoming.get(id)),visited=0;
  while(queue.length){queue.sort((a,b)=>order.get(a)-order.get(b));const id=queue.shift();visited++;for(const b of out.get(id)){level.set(b,Math.max(level.get(b),level.get(id)+1));incoming.set(b,incoming.get(b)-1);if(!incoming.get(b))queue.push(b)}}
  check(visited===ids.length,'Cycle found: use a cyclic graph composition, do not discard edges');
  const levels=Array.from({length:Math.max(...level.values())+1},()=>[]);for(const id of ids)levels[level.get(id)].push(id);
  check(levels.length*nodeWidth+(levels.length-1)*gapX<=width,'Graph width does not fit');
  const boxes={};levels.forEach((row,col)=>{const h=row.length*nodeHeight+(row.length-1)*gapY;check(h<=height,'Graph labels/nodes exceed region height');row.forEach((id,j)=>boxes[id]={x:x+col*(nodeWidth+gapX),y:y+(height-h)/2+j*(nodeHeight+gapY),width:nodeWidth,height:nodeHeight})});
  return {nodes:boxes,edges:edges.map(e=>Array.isArray(e)?[...e]:{...e}),levels};
}
export function labelRail({labels,x=0,y=0,height,gap=16}){
  check(Array.isArray(labels)&&finite(x,y,height,gap)&&height>0&&gap>=0,'Invalid label rail');
  check(labels.every(l=>typeof l.id==='string'&&finite(l.targetY,l.height)&&l.height>0)&&new Set(labels.map(l=>l.id)).size===labels.length,'Unique labels with measured heights required');
  const sorted=labels.map(l=>({...l})).sort((a,b)=>a.targetY-b.targetY);
  check(sorted.reduce((s,l)=>s+l.height,0)+Math.max(0,sorted.length-1)*gap<=height,'Label rail does not fit; expand or reword');
  let bottom=y;for(const l of sorted){l.x=x;l.y=Math.max(bottom,l.targetY-l.height/2);bottom=l.y+l.height+gap}
  let top=y+height;for(let i=sorted.length-1;i>=0;i--){const l=sorted[i];l.y=Math.min(l.y,top-l.height);top=l.y-gap}
  return sorted;
}
function hits(a,b,r,pad){
  const l=r.x-pad,t=r.y-pad,rr=r.x+r.width+pad,bb=r.y+r.height+pad;
  return a[0]===b[0] ? a[0]>l&&a[0]<rr&&Math.max(a[1],b[1])>t&&Math.min(a[1],b[1])<bb : a[1]>t&&a[1]<bb&&Math.max(a[0],b[0])>l&&Math.min(a[0],b[0])<rr;
}
export function routeOrthogonal({from,to,obstacles=[],clearance=12}){
  check(Array.isArray(from)&&Array.isArray(to)&&from.length===2&&to.length===2&&finite(...from,...to,clearance)&&clearance>=0,'Finite endpoint pairs required');
  check(obstacles.every(o=>finite(o.x,o.y,o.width,o.height)&&o.width>0&&o.height>0),'Valid obstacle rectangles required');
  const xs=[(from[0]+to[0])/2,...obstacles.flatMap(o=>[o.x-clearance-1,o.x+o.width+clearance+1])];
  const ys=[(from[1]+to[1])/2,...obstacles.flatMap(o=>[o.y-clearance-1,o.y+o.height+clearance+1])];
  const candidates=[[from,[to[0],from[1]],to],[from,[from[0],to[1]],to],...xs.map(v=>[from,[v,from[1]],[v,to[1]],to]),...ys.map(v=>[from,[from[0],v],[to[0],v],to])];
  const clean=candidates.map(p=>p.filter((a,i)=>!i||a[0]!==p[i-1][0]||a[1]!==p[i-1][1])).filter(p=>p.every((a,i)=>!i||!obstacles.some(o=>hits(p[i-1],a,o,clearance))));
  check(clean.length,'No clear candidate route: change ports, regions or route manually');
  const length=p=>p.slice(1).reduce((s,a,i)=>s+Math.abs(a[0]-p[i][0])+Math.abs(a[1]-p[i][1]),0);
  clean.sort((a,b)=>length(a)-length(b));return clean[0];
}
