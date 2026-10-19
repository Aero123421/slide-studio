// Motion study · Build a sentence by meaning — the headline arrives one clause at a time,
// and each clause brings the panel that proves it. Clauses, never letters.
// Builds: 0 clause 1 + price panel, 1 clause 2 + usage panel, 2 the conclusion + bill panel.
import { svgRoot, el, g, linear, textLines, theme as makeTheme, fmt } from '../runtime/figure.mjs';

// 断熱改修の補助を受けた1,240世帯の月平均（架空のデータ）。2023年度と2025年度。
const before = { price: 31.2, usage: 380 }; // 円/kWh, kWh/月
const after = { price: 37.4, usage: 266 };
const bill = s => s.price * s.usage;        // 円/月 = 単価 × 使用量
const change = (a, b) => Math.round((b / a - 1) * 100);
const panels = [
  { key: '単価', unit: '円/kWh', a: before.price, b: after.price, digits: 1 },
  { key: '使用量', unit: 'kWh/月', a: before.usage, b: after.usage, digits: 0 },
  { key: '月々の支払い', unit: '円/月', a: bill(before), b: bill(after), digits: 0, result: true },
].map(p => ({ ...p, pct: change(p.a, p.b) }));
const [price, usage, pay] = panels;
const saved = Math.round(pay.a - pay.b);
const signed = v => `${v > 0 ? '+' : '−'}${Math.abs(v)}%`;

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 400, colW = W / 3, base = H - 48, top = 92;
  const y = linear([0, 130], [base, top]); // one index scale for all three panels: 2023年度 = 100
  return svgRoot({ id: 'motion-sentence-build-fig', width: W, height: H, theme: t,
    title: '単価・使用量・月々の支払いの変化（2023年度＝100）',
    desc: `単価は${signed(price.pct)}、使用量は${signed(usage.pct)}、支払いは${signed(pay.pct)}（月${fmt(saved, { locale: 'ja' })}円の減少）。` },
  panels.map((p, i) => {
    const x0 = i * colW + 28, bw = 112, gap = 36, cx = [x0 + 40, x0 + 40 + bw + gap];
    const hi = p.result ? t.c('accent') : t.c('ink');
    return g({ 'data-step': i, 'data-motion': i ? 'reveal' : null, 'data-delay': i ? 150 : null, 'data-duration': 500 },
      textLines([p.key], { x: x0, y: 4, size: 22, valign: 'top', fill: t.c('ink'), weight: 700 }),
      textLines([p.unit], { x: x0, y: 38, size: 16, valign: 'top', fill: t.c('muted') }),
      el('line', { x1: x0, x2: x0 + 40 + 2 * bw + gap + 40, y1: y(100), y2: y(100), stroke: t.c('rule'), 'stroke-dasharray': '4 4' }),
      [[p.a, '2023年度', t.c('context')], [p.b, '2025年度', hi]].map(([v, yr, c], k) => {
        const idx = (v / p.a) * 100;
        return g({},
          el('rect', { x: cx[k], y: y(idx), width: bw, height: base - y(idx), fill: c }),
          textLines([fmt(v, { digits: p.digits, locale: 'ja' })], { x: cx[k] + bw / 2, y: y(idx) - 10, size: 18, anchor: 'middle', fill: k ? hi : t.c('muted'), weight: k ? 700 : 500 }),
          textLines([yr], { x: cx[k] + bw / 2, y: base + 12, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted') }));
      }),
      textLines([signed(p.pct)], { x: cx[1] + bw + 14, y: y((p.b / p.a) * 100) + 6, size: 26, valign: 'middle', fill: hi, weight: 700 }),
      el('line', { x1: x0, x2: x0 + 40 + 2 * bw + gap + 40, y1: base, y2: base, stroke: t.c('ink'), 'stroke-width': 1.4 }));
  }));
}

// One span per clause; inline-block so each clause stays whole and appears as a unit.
const clause = (step, html) => `<span style="display:inline-block" data-step="${step}"${step ? ' data-motion="reveal" data-duration="500"' : ''}>${html}</span>`;

export default {
  study: true,
  id: 'motion-sentence-build',
  language: 'ja',
  title: 'Sentence build: one clause per build, with its evidence',
  className: 'st cs-sustainability-moss',
  notes: 'Purpose: Reveal a causal sentence clause by clause (premise, counterweight, result), each clause arriving with the panel that proves it, never letter by letter.\nModify: Replace `before` and `after`; the percentages, the saving and every panel recompute. Keep one clause per line so each build adds a whole line.\nInvariant: Clauses are complete units of meaning and appear in reading order; the three panels share one index scale (2023年度 = 100); only the result takes the accent.\nStatic: The final build shows the whole sentence and all three panels.',
  sources: [{ type: 'original-example', file: 'assets/motion/sentence-build.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" style="font-size:40px;line-height:1.36;max-width:1100px;text-wrap:initial;font-family:var(--ss-font-sans)">${clause(0, `電気の単価は${Math.abs(price.pct)}%上がった。`)}<br>${clause(1, `それでも使用量が${Math.abs(usage.pct)}%減り、`)}<br>${clause(2, `<em>月々の支払い</em>は${Math.abs(pay.pct)}%下がった。`)}</h1>
<figure class="st-fig" style="top:236px" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>架空のデータ · 断熱改修の補助を受けた1,240世帯の月平均、月${fmt(saved, { locale: 'ja' })}円の減少</span><span>モーション · 節ごとに文を組み立てる（2ステップ）</span></p>`,
};
