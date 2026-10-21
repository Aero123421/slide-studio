// Motion study · Show the condition that enables a transfer — the release gate opens only
// when every check has passed (build 1), and only then does the lot move (build 2). The
// gate state is computed from the checks; the lot is one element translated through it.
import { svgRoot, el, g, textLines, linear, theme as makeTheme } from '../runtime/figure.mjs';

const lot = { id: 'B-2417', product: '注射剤 50 mL', qty: '12,000本', made: [10, 1] }; // 製造完了 10月1日
// 出荷判定の条件（製造完了日を0日目とする。架空のデータ）
const checks = [
  { name: '含量試験', spec: '規格 98.0〜102.0%', result: '99.1%', start: 0, end: 2, pass: true },
  { name: '無菌試験', spec: '14日間培養し菌の発育なし', result: '適合', start: 1, end: 15, pass: true },
  { name: '記録照査と承認', spec: '品質保証責任者', result: '承認', start: 15, end: 16, pass: true },
];
const open = checks.every(c => c.pass);
const releaseDay = Math.max(...checks.map(c => c.end));
const sterile = checks.find(c => c.name === '無菌試験');
const released = new Date(2026, lot.made[0] - 1, lot.made[1] + releaseDay);
const releasedText = `${released.getMonth() + 1}月${released.getDate()}日`;

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, id = 'motion-causal-gate-fig';
  const x = linear([0, releaseDay], [300, 780]), rowY = k => 64 + k * 56, barH = 26;
  const gateX = x(releaseDay);
  // Checks on a day axis: outlined while pending (build 0), filled with the result in build 1.
  const axisDays = Array.from({ length: releaseDay / 2 + 1 }, (_, k) => k * 2);
  const timeline = g({},
    axisDays.map(d => g({}, el('line', { x1: x(d), x2: x(d), y1: 34, y2: rowY(checks.length - 1) + barH / 2 + 14, stroke: t.c('grid') }),
      textLines([`${d}日`], { x: x(d), y: 8, size: 15, anchor: 'middle', valign: 'top', fill: t.c('muted') }))),
    checks.map((c, k) => g({},
      textLines([c.name], { x: 0, y: rowY(k) - 9, size: 18, weight: 700, valign: 'middle', fill: t.c('ink') }),
      textLines([c.spec], { x: 0, y: rowY(k) + 15, size: 15, valign: 'middle', fill: t.c('muted') }),
      g({ 'data-states': { 0: { opacity: 1 }, 1: { opacity: 0 } }, 'data-duration': 400 },
        el('rect', { x: x(c.start), y: rowY(k) - barH / 2, width: x(c.end) - x(c.start), height: barH, rx: 4, fill: 'none', stroke: t.c('muted'), 'stroke-width': 1.4, 'stroke-dasharray': '5 4' })),
      g({ 'data-step': 1, 'data-motion': 'grow-x', 'data-duration': 700, 'data-delay': k * 180, class: 'st-origin-left' },
        el('rect', { x: x(c.start), y: rowY(k) - barH / 2, width: x(c.end) - x(c.start), height: barH, rx: 4, fill: c.pass ? t.c('ink') : t.c('negative') })),
      g({ 'data-step': 1, 'data-motion': 'reveal', 'data-delay': 600 + k * 180 },
        textLines([c.result], { x: x(c.end) + 10, y: rowY(k), size: 17, weight: 700, valign: 'middle', fill: t.c('ink') })))));

  // Zones, the gate and the lot
  const zoneY = 268, zoneH = 194, gap = 26;
  const lotW = 250, lotH = 96, lotY = zoneY + 82;
  const homeX = gateX - gap - lotW - 40, destX = gateX + gap + 50;
  const zones = g({},
    el('rect', { x: 0, y: zoneY, width: gateX - gap, height: zoneH, rx: 14, fill: t.c('surface'), stroke: t.c('rule') }),
    textLines(['隔離保管'], { x: 22, y: zoneY + 22, size: 18, weight: 700, valign: 'top', fill: t.c('ink') }),
    textLines(['判定が出るまで出荷できない'], { x: 22, y: zoneY + 50, size: 16, valign: 'top', fill: t.c('muted') }),
    el('rect', { x: gateX + gap, y: zoneY, width: W - gateX - gap, height: zoneH, rx: 14, fill: t.c('surface'), stroke: t.c('rule') }),
    textLines(['出荷可能在庫'], { x: gateX + gap + 22, y: zoneY + 22, size: 18, weight: 700, valign: 'top', fill: t.c('ink') }));
  // Gate: two leaves meet at the lot's centre line and retract into their posts only if every check passed.
  const mid = lotY + lotH / 2, top = zoneY + 10, bottom = zoneY + zoneH - 10;
  const leafEl = (y0, y1, origin) => g({ 'data-states': { 0: { scale: '1 1' }, 1: { scale: `1 ${open ? 0.12 : 1}` } }, 'data-duration': 700, 'data-easing': 'emphasized', style: `transform-origin:${origin}` },
    el('rect', { x: gateX - 7, y: y0, width: 14, height: y1 - y0, rx: 3, fill: t.c('ink') }));
  const status = (text, on, fill) => g({ 'data-states': { 0: { opacity: on[0] }, 1: { opacity: on[1] } }, 'data-duration': 400 },
    textLines([text], { x: gateX + 14, y: zoneY - 34, size: 16, weight: 700, valign: 'middle', fill }));
  const gate = g({},
    el('line', { x1: gateX, x2: gateX, y1: rowY(checks.length - 1) + barH / 2 + 14, y2: zoneY - 4, stroke: t.c('muted'), 'stroke-width': 1.4, 'stroke-dasharray': '3 4' }),
    leafEl(top, mid - 3, '50% 0%'), leafEl(mid + 3, bottom, '50% 100%'),
    [top, bottom].map(y => el('rect', { x: gateX - 15, y: y - 5, width: 30, height: 10, rx: 3, fill: t.c('muted') })),
    status('判定待ち', [1, 0], t.c('muted')),
    status(`${releaseDay}日目に開放`, [0, open ? 1 : 0], t.c('ink')));
  const card = g({ 'data-states': { 0: { translate: '0px 0px' }, 1: { translate: '0px 0px' }, 2: { translate: `${open ? destX - homeX : 0}px 0px` } }, 'data-duration': 900, 'data-easing': 'smooth' },
    el('rect', { x: homeX, y: lotY, width: lotW, height: lotH, rx: 10, fill: t.c('paper'), stroke: t.c('ink'), 'stroke-width': 2 }),
    textLines([`ロット ${lot.id}`], { x: homeX + 20, y: lotY + 32, size: 20, weight: 700, valign: 'middle', fill: t.c('ink') }),
    textLines([`${lot.product} · ${lot.qty}`], { x: homeX + 20, y: lotY + 66, size: 16, valign: 'middle', fill: t.c('muted') }));
  return svgRoot({ id, width: W, height: H, theme: t,
    title: `Batch release gate for lot ${lot.id}`,
    desc: `出荷判定の3項目（${checks.map(c => `${c.name} ${c.result}`).join('、')}）がすべて適合した${releaseDay}日目にゲートが開き、その後ロット${lot.id}が隔離保管から出荷可能在庫へ移る。${releaseDay}日のうち${sterile.end - sterile.start}日は無菌試験の培養。` },
  timeline, zones, gate, card,
  g({ 'data-step': 2, 'data-motion': 'reveal', 'data-delay': 800 },
    textLines([`${releasedText}から出荷可`], { x: gateX + gap + 22, y: zoneY + 50, size: 16, weight: 700, valign: 'top', fill: t.c('accent') })));
}

export default {
  study: true,
  id: 'motion-causal-gate',
  language: 'ja',
  title: 'Show the condition that enables a transfer',
  className: 'st cs-laboratory',
  notes: 'Purpose: The gate changes before the downstream result appears: every release condition is met first, then the lot moves.\nModify: Edit `checks` (name, spec, result, start/end day, pass). The gate opens only when every check passes; set one `pass` to false and the gate stays shut and the lot stays in quarantine.\nInvariant: Conditions are visible (as pending outlines) from the first build; the gate state changes in its own build; the transfer happens after it, and the lot is one element that moves through the gate.\nStatic: The final build shows completed checks, the open gate and the lot in released stock. A state change is not proof of physical timing; the day axis carries the timing.',
  sources: [{ type: 'original-example', file: 'assets/motion/motion-causal-gate.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">ロット${lot.id}は<em>${releasedText}から出荷可</em><br><span class="st-quiet">判定${checks.length}項目がそろうまで${releaseDay}日、うち${sterile.end - sterile.start}日は無菌試験の培養</span></h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>架空のデータ · 製造完了日を0日目とした日数</span><span>モーション · 条件の成立 → ゲート開放 → 移送（2ビルド）</span></p>`,
};
