/** Contrastive authoring source. Inputs below are synthetic, not user evaluation data.
 * Learn the transformation, then author a different composition for the real subject.
 * This workshop intentionally contains flawed BEFORE pages. Never submit unchanged.
 */
import {quantity,change,paired,totalCost,segments} from '../runtime/quant.mjs';
import {branches} from '../runtime/semantic-graph.mjs';
import {h} from '../runtime/kit.mjs';
export const css=`
.slide{padding:64px;background:#fafaf7;color:#152c36;font-family:'Noto Sans CJK JP',Arial,sans-serif}
h1{font-size:46px;line-height:1.24;font-weight:650;max-width:1140px;letter-spacing:-.025em}
p{font-size:27px;line-height:1.5}.sub{margin-top:20px!important;color:#3b5660;max-width:1060px}
.main{position:absolute;left:64px;right:64px;top:210px;bottom:70px}.source{position:absolute;left:64px;bottom:26px;font-size:17px;color:#52676f}
.side{position:absolute;right:0;top:0;width:30%}.big{font-size:72px;line-height:1.1;font-weight:600}.quiet{color:#2b7370}.split{display:grid;grid-template-columns:1.5fr 1fr;gap:56px;height:100%}
svg{width:100%;height:100%;font-family:inherit}.small{font-size:16px;line-height:1.4}.before h1{font-size:38px}.before .tiny{font-size:15px;line-height:1.6}
.lab-phase{position:absolute;left:64px;top:22px;font-size:15px;letter-spacing:.06em;color:#52676f}.main.split{height:auto}.split>div{min-width:0;min-height:0}
.cards{display:flex;gap:18px}.card{flex:1;border:1px solid #c6ccca;border-radius:14px;padding:22px;background:#fff}
.dark{background:#112832;color:#f5f3e7}.dark .sub,.dark .source{color:#c0d4d4}.dark .card{color:#152c36}
table{border-collapse:collapse;width:100%;font-size:24px;line-height:1.5}th,td{padding:21px 16px;text-align:left;border-bottom:1px solid #b8c9cd}th{font-size:20px;background:#163f4b;color:#fff;font-weight:500}td:first-child{font-weight:650}
img{object-fit:cover}.image-wide{position:absolute;left:0;top:0;width:100%;height:100%;max-width:none!important}.image-panel{position:absolute;left:66px;top:230px;width:460px;height:300px;object-fit:cover}
`;
const footer=(text='説明用の架空データ。実際の測定・見積もりではありません。')=>`<p class="source" data-region="source">${text}</p>`;
const title=(t,sub='')=>`<h1 data-region="title">${t}</h1>${sub?`<p class="sub">${sub}</p>`:''}`;
const svg=(body,w=1000,hg=360,alt='説明図')=>`<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${h(alt)}" viewBox="0 0 ${w} ${hg}">${body}</svg>`;
const text=(x,y,s,size=26,fill='#152c36',anchor='start')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" text-anchor="${anchor}">${h(s)}</text>`;
const line=(x1,y1,x2,y2,color='#2b7370',width=3)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}"/>`;
const records=[];
function pair(id,before,after,reason,{beforeClass='',afterClass='',readingMode='live'}={}){
 records.push({study:true,id:id+'-before',title:'Before · '+id,className:'before '+beforeClass,readingMode,content:'<p class="lab-phase">BEFORE · 意図的な不良例</p>'+before,notes:'Intentional failure. '+reason,exportPolicy:'final'});
 records.push({study:true,id:id+'-after',title:'After · '+id,className:afterClass,readingMode,content:'<p class="lab-phase">AFTER · 修正例</p>'+after,notes:'Repair operation: '+reason+' All example values are synthetic; do not copy them into real work.',exportPolicy:'final'});
}
const amounts=change(quantity(500,'百万円'),quantity(650,'百万円'));
const bars=(colorA='#a2afb1',colorB='#2b7370')=>svg(text(20,65,'前期')+text(20,205,'当期')+`<rect x="110" y="25" width="${amounts.before.value}" height="64" fill="${colorA}"/><rect x="110" y="165" width="${amounts.after.value}" height="64" fill="${colorB}"/>`+text(630,65,'500')+text(780,205,'650')+text(110,290,'単位：百万円',23));
pair('amount-and-rate',title('売上は30百万円増。成長の正体をつかむ。','500から650へ。数字の先に、新しい可能性が見えます。')+`<div class="main">${bars()}</div>`+footer(),
 title(`売上は${amounts.delta.value}百万円増、前年比${amounts.percent.toFixed(0)}%`)+`<div class="main" data-region="primary">${bars()}</div>`+footer(),
 'Separate amount from percentage. Recompute both from one source, retain unit and comparator, remove the unsupported rhetorical conclusion.');
// Here before/after encode the fixed measurement order: condition A, then B.
const rows=[{id:1,before:12,after:10},{id:2,before:11,after:10},{id:3,before:14,after:12},{id:4,before:13,after:14},{id:5,before:15,after:null},{id:6,before:16,after:14}];
const result=paired(rows,{units:'°C'});
function diffPlot(reverse=false){return svg(line(450,20,450,310,'#849fa7',1)+result.rows.map((r,i)=>{
 const v=(reverse?-1:1)*r.difference,y=46+i*53;return text(15,y+8,'試料 '+r.id,22)+line(450,y,450+v*120,y,v>0?'#a24b31':'#2b7370',12)+text(450+v*120+(v>0?15:-15),y+8,(v>0?'+':'')+v.toFixed(1),22,'#152c36',v>0?'start':'end');}).join('')+text(450,354,reverse?'条件A − 条件B（℃）':'条件B − 条件A（℃）',24,'#152c36','middle'),800,380);}
pair('paired-sign',title('平均差 −1.2℃。差の意味を確かめる。')+`<div class="main split"><div>${diffPlot(true)}</div><div><p class="big">−1.2℃</p><p class="sub">平均差</p></div></div>`+footer(),
 title(`5試料の平均差は${result.mean.toFixed(1)}℃。1試料は上昇した。`)+`<div class="main split" data-region="primary"><div>${diffPlot()}</div><div><p class="big quiet">${result.mean.toFixed(1)}℃</p><p class="sub">条件B − 条件A</p><p style="margin-top:35px">差の標本標準偏差 ${result.sampleSD.toFixed(1)}℃<br>全6試料のうち1試料は欠測</p></div></div>`+footer(),
 'Use the same subtraction direction for every row, axis and summary. Preserve the worsening pair and missingness. Sample SD is calculated with n−1.');
const points=[{x:150,y:140},{x:325,y:100},{x:500,y:null},{x:675,y:160},{x:850,y:80}];
function missingPlot(gap=true){const groups=gap?segments(points):[points.filter(p=>p.y!=null)];return svg(groups.map(g=>`<polyline points="${g.map(p=>p.x+','+p.y).join(' ')}" fill="none" stroke="#2b7370" stroke-width="5"/>`).join('')+points.filter(p=>p.y!=null).map(p=>`<circle cx="${p.x}" cy="${p.y}" r="8" fill="#2b7370"/>`).join('')+points.map((p,i)=>text(p.x,260,(i+1)+'月',25,'#152c36','middle')).join('')+(gap?text(500,150,'欠測',28,'#a24b31','middle'):''),1000,320,'月別の観測値。3月は欠測');}
pair('missing-is-not-a-line',title('変化の流れを、一本の線で。')+`<div class="main">${missingPlot(false)}</div>`+footer(),
 title('3月は欠測。前後の変化は分からない。')+`<div class="main" data-region="primary">${missingPlot()}</div>`+footer(),
 'Break the line at the missing observation instead of implying an observed transition. Do not replace it with zero.');
pair('conditional-outcomes',title('検査後は、返却・修理・交換へ。')+`<div class="main">${svg(text(80,140,'返却',38)+line(240,126,380,126)+text(310,110,'→',34)+text(430,140,'修理',38)+line(580,126,720,126)+text(650,110,'→',34)+text(780,140,'交換',38))}</div>`+footer('架空の検査手順。'),
 title('検査の結果に応じて、行き先を分ける。')+`<div class="main" data-region="primary">${branches({id:'repair-branch',origin:'検査結果',outcomes:[{condition:'適合',label:'返却'},{condition:'不適合・修理可',label:'修理'},{condition:'不適合・修理不可',label:'交換'}],height:440})}</div>`+footer('架空の検査手順。'),
 'These are alternatives, not stages in a sequence. Preserve conditions and directly connect the origin to each alternative.');
const encodings=[{name:'A',value:25,color:'#277275'},{name:'B',value:37,color:'#b66b32'},{name:'C',value:29,color:'#657388'}];
function encodedBars(correct){return svg(encodings.map((s,i)=>text(100,80+i*100,s.name,28)+`<rect x="160" y="40" width="${s.value*17}" height="56" fill="${correct?s.color:'#142c35'}" transform="translate(0 ${i*100})"/>`+text(175+s.value*17,80+i*100,String(s.value),28)).join(''),1000,360);}
pair('encoding-map',title('系列ごとに色分けしました。')+`<p class="sub"><span style="color:#277275">■ A</span>　<span style="color:#b66b32">■ B</span>　<span style="color:#657388">■ C</span></p><div class="main">${encodedBars(false)}</div>`+footer(),
 title('Bが37件で最多。')+`<div class="main" data-region="primary">${encodedBars(true)}</div>`+footer(),
 'Use one encoding map for names and mark colors. Direct labels keep the comparison readable without relying on color alone.');
pair('proposal-scope',title('週1回、追加の手間なく回収できます。','日々の仕事に、余裕を。')+`<div class="main"><p class="big">負担ゼロ</p></div>`+footer('架空の案。所要時間と必要人数は未測定。'),
 title('回収を週1回とする案。作業時間は試行で測る。')+`<div class="main"><div class="split"><div><p style="font-size:38px">決めた条件</p><p class="sub">週1回の回収を試す。</p></div><div><p style="font-size:38px">まだ確認すること</p><p class="sub">置き場、担当人数、<br>受け付けから保管までの時間。</p></div></div></div>`+footer('説明用の架空案。運用実績ではありません。'),
 'Move proposal status and uncertainty into the main statement. A tiny footnote cannot undo a bold workload guarantee.');
pair('literal-before-clever',title('窓口をつなぐ。可能性をひらく。','一つの接点が、無限の価値を生み出します。')+`<div class="main"><div class="cards"><div class="card">つながり</div><div class="card">安心</div><div class="card">未来</div></div></div>`+footer('説明用の架空案。'),
 title('試行案：申請の受付を1か所にまとめる。')+`<div class="main">${svg(text(100,110,'申請者',36)+line(250,100,470,100)+text(345,82,'→',32)+text(500,110,'受付',36)+line(615,100,850,100)+text(710,82,'→',32)+text(885,110,'担当者',36,'#152c36','middle')+text(500,235,'受付で担当を確認し、書類を渡す。',29,'#152c36','middle'),1000,330)}</div>`+footer('説明用の架空案。処理時間の改善は未検証。'),
 'State the proposed operation and show its actual handoff. Do not invent trust, speed or benefit claims to fill matching cards.');
const steps=[['受付','書類を受け取り、受付番号を付ける。'],['確認','記入漏れを確認し、担当を決める。'],['通知','結果と次に必要な手続きを伝える。']];
pair('small-top-heavy',title('手続きを見える化し、価値ある体験へ。')+`<div class="main" style="top:185px"><div class="cards">${steps.map(([a,b])=>`<div class="card"><p style="font-size:18px">${a}</p><p class="tiny">${b}</p></div>`).join('')}</div></div>`+footer('架空の手続き。'),
 title('受付から通知まで、3つの工程を通る。')+`<div class="main">${svg(steps.map(([a,b],i)=>`<circle cx="80" cy="${55+i*125}" r="24" fill="#2b7370"/>`+text(80,64+i*125,String(i+1),24,'#fff','middle')+text(145,65+i*125,a,32)+text(350,65+i*125,b,26)+(i<2?line(80,82+i*125,80,154+i*125,'#8fb6b3'):'' )).join(''),1060,380)}</div>`+footer('架空の手続き。'),
 'Keep the same concrete information but use the available height and larger aligned labels. Empty space is not fixed by inventing more text.');
const suppliers=[['A','120','8','4か月','CSV'],['B','60','11','2か月','API・CSV'],['C','200','5','6か月','未確認'],['D','100','9','3か月','CSV']];
const cols=['案','初期費用','月額','導入期間','データ出力'];
pair('dense-reference',title('4案それぞれに、選ぶ理由があります。')+`<div class="main"><div class="cards">${suppliers.map(r=>`<div class="card"><p>${r[0]}案</p><p class="tiny">初期${r[1]}万円<br>月額${r[2]}万円<br>${r[3]}<br>出力：${r[4]}</p></div>`).join('')}</div></div>`+footer(),
 title('導入は2〜6か月。C案の出力方法は未確認。')+`<div class="main" data-region="primary"><table><thead><tr>${cols.map(v=>`<th>${v}</th>`).join('')}</tr></thead><tbody>${suppliers.map(row=>`<tr>${row.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table><p style="font-size:22px;margin-top:24px">費用は万円。C案のデータ出力は、確認してから判断する。</p></div>`+footer(),
 'Reference density is appropriate. Keep every required field aligned and preserve unknown entries instead of inventing a verdict.',{readingMode:'reference'});
pair('image-evidence',title('一杯が生む、新しい価値。','心をつなぐ体験を、ここから。')+`<img class="image-panel" src="{{asset:assets/media/photo.jpg}}" alt="コーヒーカップの写真"><div style="position:absolute;left:640px;top:260px;width:380px"><p>小さな一杯から、<br>新しい物語が始まります。</p></div>`+footer('写真：Rachel Michetti / CC0。'),
 `<img src="{{asset:assets/media/photo.jpg}}" alt="写真のカップと影を観察する" style="position:absolute;left:0;top:0;width:810px;height:720px;object-fit:cover"><div style="position:absolute;left:858px;top:118px;width:355px"><h1 style="font-size:43px">器の縁と、<br>落ちる影。</h1><p class="sub">写真の形と明暗を<br>具体的に観察する。</p></div>`+`<p class="source" style="left:858px;width:355px;font-size:16px">写真：Rachel Michetti / CC0。<br>構図の検討用に切り取り。</p>`,
 'Let the actual photograph do visual work. Replace an unrelated promise with a concrete viewing task; preserve photographic rights and crop disclosure.');
pair('source-before-font',title('観測記録のमापनを確認する。')+`<div class="main"><p style="font-size:38px">09:00　6.4℃<br>09:10　6.9℃</p></div>`+footer('文字列の混入を示す、意図的な不良例。'),
 title('観測記録の測定値を確認する。')+`<div class="main"><p style="font-size:38px">09:00　6.4℃<br>09:10　6.9℃</p></div>`+footer('説明用の架空の記録。実際の測定ではありません。'),
 'A source-language fragment cannot be fixed by merely swapping fonts. Verify the intended language/word and preserve deliberate multilingual content.');
pair('export-note',title('3年間の総額で比較する。')+`<div class="main"><p style="font-size:42px">A案 408万円　B案 456万円</p><p class="sub">配布用メモ：印刷・PDFでは3年表示が残ります。</p></div>`+footer(),
 title('3年間の総額は、A案が48万円低い。')+`<div class="main"><p style="font-size:58px">A案 <strong>${totalCost({initial:120,monthly:8,months:36,units:'万円'}).value}</strong>万円</p><p style="font-size:58px;margin-top:40px">B案 <strong>${totalCost({initial:60,monthly:11,months:36,units:'万円'}).value}</strong>万円</p><p class="sub">表示条件：36か月。追加作業費と税は含まない。</p></div>`+footer(),
 'Show the selected horizon and exclusions. Put export behavior in a runbook, not in the audience explanation. Values come from the same cost function.');
export const lab={title:'Editing and design repair lab',language:'ja',mode:'workshop',readingMode:'live',css,slides:records};
function pairedPlot(){
 const min=8,max=17,yy=v=>345-(v-min)/(max-min)*290;
 const counts=new Map();for(const r of result.rows)counts.set(r.after,(counts.get(r.after)||0)+1);
 const seen=new Map();
 const marks=result.rows.map(r=>{const col=r.after>r.before?'#ae593b':'#2b7370';const k=seen.get(r.after)||0;seen.set(r.after,k+1);const x=770+(counts.get(r.after)>1?(k-.5)*16:0);
 return line(200,yy(r.before),x,yy(r.after),col,3)+`<circle cx="200" cy="${yy(r.before)}" r="7" fill="${col}"/><circle cx="${x}" cy="${yy(r.after)}" r="7" fill="${col}"/>`+text(168,yy(r.before)+8,String(r.before),24,col,'end');}).join('');
 const labels=[...counts].map(([value,count])=>text(802,yy(value)+8,String(value)+(count>1?'（'+count+'試料）':''),24)).join('');
 return svg(line(200,30,200,355,'#c1cecf',2)+line(770,30,770,355,'#c1cecf',2)+marks+labels+text(200,403,'条件A',27,'#152c36','middle')+text(770,403,'条件B',27,'#152c36','middle'),1000,440,'同じ試料の条件Aと条件Bの温度を結ぶ。Bの値は4試料で低く、1試料で高い。');
}
export const talk={title:'A complete small measurement story',language:'ja',mode:'workshop',readingMode:'live',css,slides:[
 {study:true,id:'protocol',title:'何を比べたか',content:title('同じ試料を、条件Aと条件Bで測る。')+`<div class="main">${svg(text(120,120,'条件A',40)+line(300,107,650,107)+text(475,87,'→',40)+text(710,120,'条件B',40)+text(475,235,'全6試料。A、Bの順で測定。',30,'#152c36','middle'),1000,340)}</div>`+footer('説明用の架空実験。'),notes:'Protocol before interpretation. No efficacy claim.'},
 {study:true,id:'paired-result',title:'5試料の結果',content:title('5試料中4試料で、条件Bの温度が低い。','平均差 −1.2℃（条件B − 条件A）。1試料は欠測。')+`<div class="main" style="top:218px" data-region="primary">${pairedPlot()}</div>`+footer('説明用の架空実験。差の標本標準偏差は1.3℃。'),notes:'All plotted values, sample count, mean and sample SD come from the same synthetic paired result. One pair worsens; this remains visible.'},
 {study:true,id:'next-measurement',title:'次に確認すること',content:title('条件Bの効果とまでは、まだ言い切れない。')+`<div class="main"><table><thead><tr><th>今回の制約</th><th>次の測定で変えること</th></tr></thead><tbody><tr><td>測定順序が固定</td><td>順序を無作為化して比較する</td></tr><tr><td>1試料に欠測</td><td>欠測の理由も記録する</td></tr><tr><td>対象はこの6試料だけ</td><td>条件を増やし、再現性を確かめる</td></tr></tbody></table></div>`+footer('説明用の架空実験。次の測定案であり、実施済みではありません。'),notes:'Limitations stay next to concrete changes; no invented sample-size guarantee or inspirational conclusion.'}
]};
