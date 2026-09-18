/** Numeric evidence helpers. Compute once; bind the same result to copy and marks.
 * No strings-as-numbers, silent unit conversion, zero imputation or inference tests.
 * Units are exact caller-owned labels; choose a common unit BEFORE calling.
 */
function finite(value, name='value') {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw Error(`${name} must be a finite number`);
  return value;
}
function unit(value) {
  if (typeof value !== 'string' || !value.trim()) throw Error('An explicit unit is required');
  return value;
}
export function quantity(value, units) { return Object.freeze({value:finite(value),unit:unit(units)}); }
export function difference(before, after) {
  if (before.unit !== after.unit) throw Error('Unit mismatch: convert explicitly before subtracting');
  return Object.freeze({value:finite(after.value)-finite(before.value),unit:unit(before.unit),direction:'after - before'});
}
export function change(before, after) {
  const delta=difference(before,after);
  const percent=before.value === 0 ? null : 100*delta.value/Math.abs(before.value);
  return Object.freeze({before,after,delta,percent,percentUnit:'%',denominator:'absolute before',
    caution:before.value < 0 ? 'Negative baseline: explain the denominator; do not label this a conventional growth rate.' : before.value === 0 ? 'Undefined percentage change from zero.' : null});
}
export function formatQuantity(q, {locale='en',digits=1,sign=false}={}) {
  finite(q.value);unit(q.unit);
  if (!Number.isInteger(digits)||digits<0||digits>12) throw Error('digits must be 0..12');
  return new Intl.NumberFormat(locale,{minimumFractionDigits:digits,maximumFractionDigits:digits,signDisplay:sign?'exceptZero':'auto'}).format(q.value)+' '+q.unit;
}
export function paired(rows,{before='before',after='after',units,direction='after - before'}={}) {
  unit(units);
  if (!Array.isArray(rows)||!rows.length) throw Error('Nonempty paired rows required');
  if (!['after - before','before - after'].includes(direction)) throw Error('Declare subtraction direction');
  const valid=[],missing=[];
  rows.forEach((row,i)=>{
    const a=row[before],b=row[after];
    if(a==null||b==null){missing.push(i);return;}
    finite(a,`${before} row ${i}`);finite(b,`${after} row ${i}`);
    valid.push({index:i,id:row.id??i+1,before:a,after:b,difference:direction==='after - before'?b-a:a-b});
  });
  if(!valid.length) throw Error('No complete pairs');
  const mean=valid.reduce((s,r)=>s+r.difference,0)/valid.length;
  const sampleSD=valid.length<2?null:Math.sqrt(valid.reduce((s,r)=>s+(r.difference-mean)**2,0)/(valid.length-1));
  return Object.freeze({unit:units,direction,n:valid.length,total:rows.length,missing,rows:valid,mean,sampleSD,
    below:valid.filter(r=>r.after<r.before).length,equal:valid.filter(r=>r.after===r.before).length,above:valid.filter(r=>r.after>r.before).length,
    scope:'Descriptive complete-pair statistics. No significance, causality or missingness assumption is inferred.'});
}
export function totalCost({initial,monthly,months,units,additional=0}) {
  [initial,monthly,months,additional].forEach(v=>finite(v));unit(units);
  if(!Number.isInteger(months)||months<0)throw Error('months must be a nonnegative integer');
  return quantity(initial+monthly*months+additional,units);
}
/** Build a line without bridging a missing observation. Not a smoothing algorithm. */
export function segments(points) {
  if(!Array.isArray(points))throw Error('points must be an array');
  const groups=[];let group=[];
  for(const p of points){
    if(p==null||p.y==null){if(group.length)groups.push(group);group=[];continue;}
    finite(p.x,'x');finite(p.y,'y');group.push(p);
  }
  if(group.length)groups.push(group);
  return groups;
}
