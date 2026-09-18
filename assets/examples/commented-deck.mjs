/** Run: node commented-deck.mjs ./deck.json
 * This example deliberately explains decisions near the fields a compact model edits.
 * Keep this file out of audience-facing slides; comments are production context.
 */
import fs from 'node:fs/promises';
const file=process.argv[2];if(!file)throw Error('Provide a new output JSON path');
const before=40,after=25; // Fictional teaching data. Replace BOTH from a real source.
const reduction=(before-after)/before*100; // Derive the claim, do not type an unrelated number.
const deck={version:1,title:'確認作業の改善',language:'ja',theme:'neutral',sample:true,
 slides:[
  // Role: establish the specific problem, not a slogan about transformation.
  {layout:'cover',title:'確認作業を減らし、\n分析する時間をつくる。',body:'月次レポート改善の提案'},
  // Role: one comparison. The renderer calculates coordinates and labels together.
  {layout:'bar',title:`確認時間を${reduction.toFixed(1)}%減らした`,unit:'時間 / 月',
   data:[{label:'改善前',value:before},{label:'改善後',value:after}],highlight:1,
   notes:'実務では対象期間・人数・測定方法を明記する。'},
  // Role: make the action explicit. No generic “Thank you” is needed here.
  {layout:'closing',title:'次の月次レポートで、\n同じ手順を試す。',body:'担当：運用チーム。翌月、作業時間と誤りを確認する。'}
 ]};
// Exclusive creation prevents accidentally replacing a user's current source file.
await fs.writeFile(file,JSON.stringify(deck,null,2),{flag:'wx'});
