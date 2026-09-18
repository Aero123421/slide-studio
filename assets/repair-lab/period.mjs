/** Every selectable horizon uses one calculated snapshot: marks, totals, headline,
 * units and selected condition agree. Synthetic offers; no real commercial data.
 */
import {totalCost} from '../runtime/quant.mjs';
import {h} from '../runtime/kit.mjs';
const offers=[{id:'A',initial:120,monthly:8},{id:'B',initial:60,monthly:11},{id:'C',initial:180,monthly:6}];
export const snapshots=Object.fromEntries([12,36,60].map(months=>{
 const rows=offers.map(o=>({...o,total:totalCost({...o,months,units:'万円'}).value}));
 const minimum=Math.min(...rows.map(r=>r.total)),winners=rows.filter(r=>r.total===minimum).map(r=>r.id);
 return [months,{months,rows,title:`${months}か月の合計は、${winners.join('・')}案が最小。`,condition:`表示条件：${months}か月。初期費用＋月額×${months}。追加費用と税は含まない。`}];
}));
const initial=snapshots[36],max=800;
export default {title:'One condition, one coherent comparison',language:'ja',mode:'workshop',readingMode:'live',css:`
.slide{padding:68px;background:#fafaf7;color:#16323c;font-family:'Noto Sans CJK JP',sans-serif}h1{font-size:46px;line-height:1.3;margin:0}.periods{display:flex;gap:14px;margin:34px 0 30px}.periods button{font-family:inherit;font-size:24px;padding:11px 24px;color:#16323c;background:transparent;border:1px solid #809b9e;cursor:pointer}.periods button[aria-pressed=true]{background:#1e646a;color:white}.chart{width:1120px;height:295px}p{font-size:24px;line-height:1.5}.condition{margin-top:18px!important}.source{position:absolute;bottom:25px;left:68px;font-size:17px;color:#4b656b}
body[data-export=true] .periods{visibility:hidden!important}
`,slides:[{id:'period-comparison',title:'期間ごとの費用比較',study:true,content:`
<h1 id="period-title" data-region="title">${h(initial.title)}</h1>
<div class="periods" data-interactive role="group" aria-label="比較する期間">${[12,36,60].map(n=>`<button type="button" data-months="${n}" aria-pressed="${n===36}">${n}か月</button>`).join('')}</div>
<svg class="chart" data-region="primary" role="img" aria-label="3案の総額。同じゼロ起点、単位は万円。" viewBox="0 0 1120 295">
<line x1="140" y1="12" x2="140" y2="250" stroke="#708d92" stroke-width="1"/>
${initial.rows.map((r,i)=>`<text x="10" y="${52+i*85}" font-size="28" fill="#16323c">${r.id}案</text><rect id="bar-${r.id}" x="140" y="${20+i*85}" width="${r.total/max*790}" height="46" fill="#387d81"/><text id="value-${r.id}" x="${160+r.total/max*790}" y="${52+i*85}" font-size="28" fill="#16323c">${r.total}</text>`).join('')}
<text x="140" y="287" font-size="23" fill="#16323c">0</text><text x="930" y="287" text-anchor="end" font-size="23" fill="#16323c">800万円</text>
</svg><p class="condition" id="period-condition">${h(initial.condition)}</p>
<p class="source">説明用の架空見積もり。除外費用を含めた最安を保証する比較ではありません。</p>
`,notes:'Change 12→36→60→12 months. The winning offer changes from B to C and back; the headline must change along with the bars. Static export preserves the currently selected, fully labelled horizon.'}],script:`
(()=>{const snapshots=${JSON.stringify(snapshots)},buttons=[...document.querySelectorAll('[data-months]')];
 function apply(months){const s=snapshots[months];if(!s)throw Error('Unknown comparison horizon');
 document.querySelector('#period-title').textContent=s.title;document.querySelector('#period-condition').textContent=s.condition;
 for(const r of s.rows){const width=r.total/800*790;document.querySelector('#bar-'+r.id).setAttribute('width',String(width));const value=document.querySelector('#value-'+r.id);value.textContent=String(r.total);value.setAttribute('x',String(160+width));}
 for(const b of buttons)b.setAttribute('aria-pressed',String(+b.dataset.months===s.months));
 document.querySelector('#period-comparison').dataset.selectedMonths=String(months);
 }
 for(const b of buttons)b.addEventListener('click',()=>apply(+b.dataset.months));apply(36);
})();`
};
