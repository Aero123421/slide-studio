/* Geometry-only offline mesh inspection. Real vertices/triangles, not a mock 3D image.
 * OBJ groups retained; materials/textures deliberately ignored. Canvas painter sorting
 * is a lightweight teaching renderer, not a precision CAD kernel or full Z-buffer.
 * For production GLB use the optional model-viewer adapter described in motion-and-interaction.md. */
(()=>{'use strict';
const finite=v=>Number.isFinite(v),MAX=40000;
function validate(mesh){if(!mesh.vertices.length||!mesh.faces.length)throw Error('No triangle mesh found');if(mesh.faces.length>MAX)throw Error('Mesh exceeds 40,000 triangles; simplify before presenting');if(mesh.vertices.some(v=>v.length!==3||v.some(x=>!finite(x))))throw Error('Invalid vertex');if(mesh.faces.some(f=>f.indices.some(i=>!Number.isInteger(i)||i<0||i>=mesh.vertices.length)))throw Error('Face index outside vertex array');return mesh}
function parseOBJ(text){if(text.length>8*1024*1024)throw Error('OBJ exceeds 8 MiB');const vertices=[],faces=[];let group='Mesh';
for(const line of text.split(/\r?\n/)){const w=line.trim().split(/\s+/),type=w.shift();if(type==='v')vertices.push(w.slice(0,3).map(Number));else if(type==='g'||type==='o')group=w.join(' ').slice(0,80)||'Mesh';else if(type==='f'){const ids=w.map(v=>{const n=Number(v.split('/')[0]);if(!Number.isInteger(n)||!n)throw Error('Invalid face index');return n>0?n-1:vertices.length+n});for(let i=1;i<ids.length-1;i++)faces.push({indices:[ids[0],ids[i],ids[i+1]],group});if(faces.length>MAX)throw Error('Too many faces')}}return validate({vertices,faces})}
function parseSTL(buffer){if(buffer.byteLength>8*1024*1024)throw Error('STL exceeds 8 MiB');const vertices=[],faces=[],v=new DataView(buffer);const add=tri=>{const offset=vertices.length;vertices.push(...tri);faces.push({indices:[offset,offset+1,offset+2],group:'STL mesh'})};const n=buffer.byteLength>=84?v.getUint32(80,true):0;
if(n&&84+n*50===buffer.byteLength){if(n>MAX)throw Error('Too many triangles');for(let i=0;i<n;i++){const start=84+i*50+12;add([0,1,2].map(j=>[0,1,2].map(k=>v.getFloat32(start+j*12+k*4,true))))}}
else{const text=new TextDecoder().decode(buffer),a=[...text.matchAll(/vertex\s+([\deE+.-]+)\s+([\deE+.-]+)\s+([\deE+.-]+)/g)].map(m=>m.slice(1).map(Number));if(a.length%3)throw Error('Incomplete STL triangle');for(let i=0;i<a.length;i+=3)add(a.slice(i,i+3))}return validate({vertices,faces})}
function clipZ(points,limit){const out=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],ia=a[2]<=limit,ib=b[2]<=limit;if(ia)out.push(a);if(ia!==ib){const t=(limit-a[2])/(b[2]-a[2]);out.push(a.map((v,k)=>v+(b[k]-v)*t))}}return out}
function draw(canvas,mesh,{yaw=35,pitch=60,explode=0,cut=1,wire=false}={}){
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas unavailable');const W=canvas.width,H=canvas.height;ctx.clearRect(0,0,W,H);ctx.fillStyle='#e9eff0';ctx.fillRect(0,0,W,H);
 const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(const v of mesh.vertices)for(let k=0;k<3;k++){min[k]=Math.min(min[k],v[k]);max[k]=Math.max(max[k],v[k]);}const center=min.map((x,k)=>(x+max[k])/2),extent=Math.max(...max.map((x,k)=>x-min[k]))||1;
 const groups=[...new Set(mesh.faces.map(f=>f.group))],colors=['#547f92','#c09557','#b45c3f','#344854','#7c647f'];const ca=Math.cos(yaw*Math.PI/180),sa=Math.sin(yaw*Math.PI/180),cb=Math.cos(pitch*Math.PI/180),sb=Math.sin(pitch*Math.PI/180),scale=Math.min(W,H)*.64/extent;
 const transform=(v,g)=>{let [x,y,z]=v.map((p,k)=>p-center[k]);z+=(g-1)*explode*extent*.3;const xx=x*ca-y*sa,yy=x*sa+y*ca;return [xx,yy*cb-z*sb,yy*sb+z*cb]};
 const polys=[];for(const f of mesh.faces){const gi=groups.indexOf(f.group);let pp=f.indices.map(i=>mesh.vertices[i]);if(cut<1)pp=clipZ(pp,min[2]+(max[2]-min[2])*cut);if(pp.length<3)continue;const p=pp.map(v=>transform(v,gi));const a=p[1].map((v,k)=>v-p[0][k]),b=p[2].map((v,k)=>v-p[0][k]);const n=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];const len=Math.hypot(...n)||1;const shade=.55+.45*Math.abs((n[0]*.25-n[1]*.6+n[2]*.7)/len);polys.push({p,depth:p.reduce((s,v)=>s+v[2],0)/p.length,color:colors[gi%colors.length],shade})}
 polys.sort((a,b)=>a.depth-b.depth);for(const f of polys){ctx.beginPath();f.p.forEach((v,i)=>{const x=W*.5+v[0]*scale,y=H*.53+v[1]*scale;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath();const c=f.color.slice(1).match(/../g).map(n=>Math.round(parseInt(n,16)*f.shade));ctx.fillStyle=`rgb(${c.join(',')})`;ctx.fill();if(wire){ctx.strokeStyle='#263f4b';ctx.lineWidth=.6;ctx.stroke()}}
 ctx.fillStyle='#263f4b';ctx.font='17px sans-serif';ctx.fillText(`${mesh.faces.length} triangles · ${groups.length} groups · geometry only`,20,H-18);
 return {triangles:mesh.faces.length,groups:groups.length,drawn:polys.length,bounds:{min,max}};
}
window.StudioMesh={parseOBJ,parseSTL,draw};
})();

