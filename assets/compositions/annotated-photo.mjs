// Composition study · Annotated photograph — each observation tied to the exact region it describes.
// Targets are source-pixel coordinates in the photograph; the ring positions, the elbow leaders
// and the clock direction of the handle (computed against the cup's centre) all follow from them.

const photo = {
  src: '{{asset:assets/media/study-01.jpg}}', w: 600, h: 400, scale: 1.2, x: 64, y: 176,
  alt: 'An espresso in a red-brown cup with a white interior on a matching saucer, photographed from above on a wooden table. A teaspoon lies on the saucer to the right; the cup handle points to the lower left.',
  credit: '写真：Rachel Michetti（CC0）',
};
const cup = { x: 290, y: 150 };     // centre of the cup body, source px
const standard = { handleHour: 4 }; // house standard: handle at 4 o'clock, toward the guest's right hand
// Observations, top to bottom. `at` = source px; `slot` = where the label's first line sits (slide y).
const notes = [
  { key: 'arc', term: '光の弧', at: [292, 120], slot: 262, text: ['照明の映り込み。クレマの割れではない。'] },
  { key: 'crema', term: 'クレマ', at: [300, 162], slot: 370.4, text: ['むらのないヘーゼルナッツ色。', '白く抜けた斑点もなく、抽出は均一。'] },
  { key: 'spoon', term: 'スプーン', at: [358, 282], slot: 480, text: ['受け皿の右側。位置は基準どおり。'] },
  { key: 'handle', term: '取っ手', at: [226, 268], slot: 590, fault: true },
];

// Clock direction of the handle, seen from above with the guest at the bottom of the frame.
const hourOf = ([x, y]) => { const deg = (Math.atan2(x - cup.x, cup.y - y) * 180 / Math.PI + 360) % 360; return Math.round(deg / 30) || 12; };
const handle = notes.find(n => n.key === 'handle'), handleHour = hourOf(handle.at);
handle.text = [`${handleHour}時の向き。店の基準は${standard.handleHour}時（客の右手側）。`, '向きを直してから出す。'];
const pass = handleHour === standard.handleHour;

const px = ([x, y]) => [photo.x + x * photo.scale, photo.y + y * photo.scale];
const pw = photo.w * photo.scale, ph = photo.h * photo.scale, railX = 832;
// Leader: from the ring, vertically to the label's first line, then across into the rail
// (straight across when the label is level with the ring).
const leader = n => {
  const [x, y] = px(n.at), r = 12, dy = n.slot - y;
  if (Math.abs(dy) < r) return `M${(x + Math.sqrt(r * r - dy * dy)).toFixed(1)} ${n.slot}H${railX - 14}`;
  return `M${x} ${(y + Math.sign(dy) * r).toFixed(1)}V${n.slot}H${railX - 14}`;
};
const marks = notes.map(n => {
  const [x, y] = px(n.at);
  return `<path d="${leader(n)}" class="ap-halo"/><path d="${leader(n)}" class="ap-line${n.fault ? ' ap-hot' : ''}"/>` +
    `<circle cx="${x}" cy="${y}" r="12" class="ap-halo"/><circle cx="${x}" cy="${y}" r="12" class="ap-ring${n.fault ? ' ap-hot' : ''}"/>`;
}).join('');

export default {
  study: true,
  id: 'composition-annotated-photo',
  language: 'ja',
  title: 'Annotated photograph: observations tied to the regions they describe',
  className: 'st cs-food-market cmp-annotated-photo',
  notes: `Purpose: Teach people to read a real object (a dish, a specimen, a weld, a site) by pointing each observation at the exact spot in a photograph, so the audience checks the claim with their own eyes.\nModify: Replace \`photo\` (keep scale ≤ 1.3; here ${pw} × ${ph} px from ${photo.w} × ${photo.h}) and \`notes\`: give each observation its source-pixel target and the height of its label in the rail; rings and leaders recompute. The handle's clock direction (${handleHour}時) is computed from its position against \`cup\`.\nInvariant: The whole photograph stays visible (no crop that loses context); every label sits in the rail, never on the image; leaders run vertically then across, ordered so no line crosses another or a label; one accent, on the observation that fails.\nStatic: Already static. For teaching, a build can reveal one observation per click in this order.`,
  sources: [{ type: 'original-example', file: 'assets/compositions/annotated-photo.mjs' }, { type: 'image', file: 'assets/media/study-01.jpg', license: 'CC0' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" data-region="title">抽出は合格、提供は${pass ? '合格' : '差し戻し'}。<em>取っ手が${handleHour}時を向いている</em></h1>
<p class="st-dek ap-dek" data-region="support">提供前チェック（エスプレッソ）。写真の下側を客席として見る。</p>
<img class="ap-photo" data-region="primary" src="${photo.src}" alt="${photo.alt}" style="left:${photo.x}px;top:${photo.y}px;width:${pw}px;height:${ph}px">
<svg class="ap-marks" viewBox="0 0 1280 720" width="1280" height="720" aria-hidden="true">${marks}</svg>
${notes.map(n => `<p class="ap-note${n.fault ? ' ap-fault' : ''}" data-region="support" style="top:${n.slot - 14}px"><b>${n.term}</b>${n.text.join('<br>')}</p>`).join('\n')}
<p class="st-source" data-region="source"><span>${photo.credit} · 研修用の作例。クレマの評価は目視による</span><span>注記つき写真</span></p>`,
};
