// Motion study · Reveal the thought in readable phrases — a resident's sentence arrives one
// phrase (文節のまとまり) per build, so the audience reads it at speaking pace; the survey
// result beside it says how common the experience is. Builds: 1, 2 the next phrases.
import { svgRoot, el, g, textLines, linear, theme as makeTheme } from '../runtime/figure.mjs';

// 減便後の利用者聞き取り調査（架空のデータ）。「通院の時刻をどう決めているか」複数回答。
const respondents = 412;
const answers = [
  { label: 'バスの時刻表に合わせる', count: 194, focus: true },
  { label: '病院の空き枠だけで決める', count: 151 },
  { label: '家族の送迎に合わせる', count: 128 },
  { label: 'タクシーを使う', count: 49 },
];
const share = a => Math.round((a.count / respondents) * 100);
const focus = answers.find(a => a.focus);
// The quotation, split where a speaker would pause. One phrase per build.
const phrases = ['バスが一時間に一本になってから、', '病院の予約は、乗れる便から', '逆算して取っています。'];

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 312, H = 330, top = 72, row = (H - top) / answers.length;
  const x = linear([0, 100], [0, W - 64]);
  return svgRoot({ id: 'motion-phrase-reveal-fig', width: W, height: H, theme: t,
    title: `通院の時刻をどう決めているか（複数回答、${respondents}人）`,
    desc: answers.map(a => `${a.label} ${share(a)}%`).join('、') },
  textLines(['通院の時刻をどう決めているか', `（複数回答、${respondents}人）`], { x: 0, y: 0, size: 16, valign: 'top', fill: t.c('muted'), lineHeight: 1.5 }),
  answers.map((a, i) => {
    const y0 = top + i * row, c = a.focus ? t.c('accent') : t.c('context');
    return g({},
      textLines([a.label], { x: 0, y: y0, size: 17, valign: 'top', fill: a.focus ? t.c('ink') : t.c('muted'), weight: a.focus ? 700 : 400 }),
      el('rect', { x: 0, y: y0 + 28, width: x(share(a)), height: 16, fill: c }),
      textLines([`${share(a)}%`], { x: x(share(a)) + 8, y: y0 + 36, size: 17, valign: 'middle', fill: a.focus ? t.c('accent') : t.c('muted'), weight: a.focus ? 700 : 500 }));
  }));
}

// Each phrase is one block line; hidden phrases keep their space, so nothing reflows.
const phrase = (text, i) => `<span style="display:block" data-step="${i}"${i ? ' data-motion="reveal" data-duration="600"' : ''}>${i === 0 ? '<span style="margin-left:-.55em">「</span>' : ''}${text}${i === phrases.length - 1 ? '」' : ''}</span>`;

export default {
  study: true,
  id: 'motion-phrase-reveal',
  language: 'ja',
  title: 'Phrase reveal: a quotation at speaking pace',
  className: 'st st--rail cs-editorial-vermilion',
  notes: 'Purpose: Let the audience read a quotation phrase by phrase, at the pace it is spoken, instead of meeting a block of text or a letter-by-letter typewriter.\nModify: Split `phrases` where a speaker pauses (Japanese: at 文節 boundaries; English: at clause or prepositional-phrase boundaries). Replace `answers` with the survey result that says how common the quoted experience is.\nInvariant: Each build adds one whole phrase in reading order; earlier phrases never move; the attribution arrives with the last phrase; the survey bar for the quoted behaviour is the only accent.\nStatic: The final build shows the full quotation, its attribution and the survey bars.',
  sources: [{ type: 'original-example', file: 'assets/motion/motion-phrase-reveal.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" style="max-width:800px;text-wrap:initial">減便後、高齢の利用者の<em>${share(focus)}%</em>が<br>通院の時刻をバスの時刻表で決めている</h1>
<blockquote style="position:absolute;left:92px;top:232px;width:740px;margin:0;font:600 40px/1.7 var(--ss-font-display);color:var(--ss-ink)" data-region="primary">${phrases.map(phrase).join('')}
<footer style="margin-top:22px;font:400 19px/1.5 var(--ss-font-sans);color:var(--ss-muted)" data-step="${phrases.length - 1}" data-motion="reveal" data-delay="450">― 78歳、郊外の団地に住む利用者（聞き取り調査より）</footer></blockquote>
<div class="st-rail" data-region="support"><figure style="margin:0">${figure()}</figure></div>
<p class="st-source" data-region="source"><span>架空のデータ · 減便から半年後の聞き取り調査、65歳以上の路線バス利用者${respondents}人</span><span>モーション · 文節ごとに引用を示す（2ステップ）</span></p>`,
};
