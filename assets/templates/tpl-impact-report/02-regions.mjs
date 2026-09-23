// Template: 年次インパクトレポート · 地域別の活動（抽象タイル図）. Synthetic example content; replace data and copy.
const ID = 'tpl-impact-report-regions';
// col/row place each area on an abstract tile schema (not geography).
const regions = [
  {name: '中央', people: 402, sites: 5, col: 1, row: 1}, {name: '東部', people: 281, sites: 4, col: 2, row: 1},
  {name: '北部', people: 236, sites: 3, col: 1, row: 0}, {name: '西部', people: 198, sites: 3, col: 0, row: 1},
  {name: '南部', people: 167, sites: 2, col: 1, row: 2}
].map(r => ({...r, perSite: r.people / r.sites}));
const total = regions.reduce((a, r) => a + r.people, 0);
const totalSites = regions.reduce((a, r) => a + r.sites, 0);
const ranked = [...regions].sort((a, b) => b.people - a.people);
const top2 = ranked.slice(0, 2), top2Share = top2.reduce((a, r) => a + r.people, 0) / total * 100;
const busiest = regions.reduce((a, r) => r.perSite > a.perSite ? r : a);
const fmt = n => Math.round(n).toLocaleString('ja-JP');
const f1 = n => n.toFixed(1);

// Sequential fill from light sage to deep teal by participants.
const lo = [221, 234, 228], hi = [30, 70, 82];
const pmin = Math.min(...regions.map(r => r.people)), pmax = Math.max(...regions.map(r => r.people));
const fill = p => { const t = (p - pmin) / (pmax - pmin); return { t, c: `rgb(${lo.map((v, i) => Math.round(v + (hi[i] - v) * (0.15 + 0.85 * t))).join(',')})` }; };
const S = 128, G = 12, OX = 70, OY = 14;
const houseIcon = (x, y, c) => `<path d="M${x} ${y + 7} L${x + 7} ${y} L${x + 14} ${y + 7} V${y + 15} H${x} Z" fill="${c}"/>`;
const tiles = regions.map(r => { const x = OX + r.col * (S + G), y = OY + r.row * (S + G), {t, c} = fill(r.people), light = t > .42, tc = light ? '#FFFFFF' : '#1F3440';
  return `<rect x="${x}" y="${y}" width="${S}" height="${S}" rx="14" fill="${c}"/>
  ${r === busiest ? `<rect x="${x - 5}" y="${y - 5}" width="${S + 10}" height="${S + 10}" rx="18" fill="none" stroke="#D46E55" stroke-width="3" stroke-dasharray="7 5"/>` : ''}
  <text class="${light ? 'ir-svg-w' : 'ir-svg-t'}" x="${x + 16}" y="${y + 30}">${r.name}</text>
  <text class="${light ? 'ir-svg-wn' : 'ir-svg-n'}" x="${x + 16}" y="${y + 78}">${fmt(r.people)}<tspan style="font:700 16px var(--ir-ja)" dx="3">人</tspan></text>
  ${Array.from({length: r.sites}, (_, k) => houseIcon(x + 16 + k * 20, y + 104, light ? '#FFFFFF' : '#2E6E72')).join('')}`; }).join('');
const dots = []; for (let i = 0; i < 12; i++) for (let j = 0; j < 10; j++) dots.push(`<circle cx="${20 + i * 50}" cy="${10 + j * 50}" r="1.6" fill="#8DB3A5" opacity=".5"/>`);
const map = `<svg viewBox="0 0 600 480" role="img" aria-labelledby="${ID}-t ${ID}-d">
  <title id="${ID}-t">5つの地域の参加者数と拠点数を示すタイル図（模式図）</title>
  <desc id="${ID}-d">${regions.map(r => `${r.name}：${r.people}人、${r.sites}拠点`).join('。')}。タイルの配置は位置関係の目安で、実際の地図ではない。</desc>
  ${dots.join('')}${tiles}
  <text class="ir-svg-s" x="${OX}" y="${OY + 3 * S + 2 * G + 28}">色が濃いほど参加者が多い　⌂＝拠点1か所</text>
  <text class="ir-svg-s" x="${OX}" y="${OY + 3 * S + 2 * G + 50}" style="fill:#A9492F">点線の枠：1拠点あたりの参加者が最も多い地域</text>
</svg>`;
const maxP = ranked[0].people;

export default {
  study: true,
  id: ID,
  title: '地域別の活動：参加者数と拠点数',
  language: 'ja',
  notes: 'Purpose: 地域ごとの参加者数・拠点数を、地理を捏造しない抽象的なタイル図と順位表で示し、次年度の拠点計画の根拠にする。\nModify: regions の人数・拠点数・タイル位置（col,row）を差し替える。見出しの割合、最も混み合う地域、表の並び・棒・合計はすべて計算で出る。実在の地名を使う場合も、正確な地図を用意できなければタイル図のままにする。\nInvariant: タイル図は位置関係の目安であり、面積や距離に意味はない（ページ上で明記する）。合計は表紙の参加者数・拠点数と一致させる。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-impact-report ir-p-regions',
  content: `<div class="ir">
  <div class="ir-top"><span class="ir-brand">まちの学び舎ネットワーク　2025年度 年次報告</span><span class="ir-sec"><b>02</b>地域別の活動</span></div>
  <h1 class="ir-h1" data-region="title">参加者の${Math.round(top2Share)}%は${top2.map(r => r.name).join('・')}。1拠点あたりの利用は${busiest.name}が最多</h1>
  <p class="ir-lead">${busiest.name}は${busiest.sites}拠点に${fmt(busiest.people)}人が通い、1拠点あたり${f1(busiest.perSite)}人と、いちばん混み合っています。</p>
  <div class="ir-fig" style="left:64px;top:184px;width:600px;height:480px" data-region="primary">${map}</div>
  <div class="ir-rank" data-region="support">
    <table><thead><tr><th>地域</th><th colspan="2" style="text-align:left;padding-left:6px">参加者（人）</th><th>拠点</th><th>1拠点あたり</th></tr></thead>
    <tbody>${ranked.map(r => `<tr><td>${r.name}</td><td class="ir-barcell"><span class="ir-bar" style="width:${(r.people / maxP * 180).toFixed(1)}px;${r === busiest ? 'background:#D46E55' : ''}"></span></td><td class="ir-num">${fmt(r.people)}</td><td class="ir-num">${r.sites}</td><td class="ir-num">${r === busiest ? `<b>${f1(r.perSite)}</b>` : f1(r.perSite)}</td></tr>`).join('')}
    <tr class="is-total"><td>合計</td><td></td><td class="ir-num">${fmt(total)}</td><td class="ir-num">${totalSites}</td><td class="ir-num">${f1(total / totalSites)}</td></tr></tbody></table>
    <p class="ir-note" style="margin-top:16px">参加者は年度内の実人数。棒の長さは参加者数に比例（0起点）。</p>
  </div>
  <p class="ir-foot" data-region="source"><span>タイルの配置は模式図で、実際の地図ではありません ・ 数値は例示用の架空データです</span><span>2</span></p>
</div>`
};
