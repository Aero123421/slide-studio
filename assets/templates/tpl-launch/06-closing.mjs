// Template: Product launch · Closing call to action with rollout dates. Synthetic example content; replace data and copy.
const P = 'tpl-launch-closing';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const steps = [
  { h: 'Import your current policy', p: 'Upload it as a CSV or start from the returns-policy template in Settings.' },
  { h: 'Run one week in shadow mode', p: 'Fernhook proposes a decision on every return; your team still clicks approve.' },
  { h: 'Switch routine cases to automatic', p: 'Keep review for high-value items or anything the fraud signals flag.' }
];
const rollout = [
  { when: 'Today', what: 'Growth and Scale plans', now: true },
  { when: '14 October', what: 'Starter plan' },
  { when: 'Q1 2027 · planned', what: 'Public API and webhooks' }
];

// Backdrop: the logo's return arrow, redrawn as a family of concentric loops.
const loops = Array.from({ length: 9 }, (_, i) => {
  const r = 90 + i * 34, cx = 330, cy = 520;
  return `<path d="M${cx - r * 0.2} ${cy - r} H ${cx + r * 0.35} A ${r} ${r} 0 0 1 ${cx + r * 0.35} ${cy + r} H ${cx - r * 0.1}" fill="none" stroke="url(#${P}-lg)" stroke-width="${(1.1 + i * 0.08).toFixed(2)}" stroke-opacity="${(0.75 - i * 0.06).toFixed(2)}"/>`;
}).join('');
const bg = `<svg class="ln-deco" style="inset:0" viewBox="0 0 1280 720" width="1280" height="720" aria-hidden="true">
<defs>
  <radialGradient id="${P}-g1" cx="260" cy="620" r="620" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#4a31d8" stop-opacity=".7"/><stop offset="1" stop-color="#110e30" stop-opacity="0"/></radialGradient>
  <radialGradient id="${P}-g2" cx="1180" cy="40" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f2553a" stop-opacity=".28"/><stop offset="1" stop-color="#f2553a" stop-opacity="0"/></radialGradient>
  <linearGradient id="${P}-fade" x1="0" y1="0" x2="0" y2="720" gradientUnits="userSpaceOnUse"><stop offset=".42" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#fff" stop-opacity="1"/></linearGradient>
  <mask id="${P}-mask"><rect width="1280" height="720" fill="url(#${P}-fade)"/></mask>
  <linearGradient id="${P}-lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b76ff"/><stop offset="1" stop-color="#ff9c86"/></linearGradient>
</defs>
<rect width="1280" height="720" fill="#110e30"/><rect width="1280" height="720" fill="url(#${P}-g1)"/><rect width="1280" height="720" fill="url(#${P}-g2)"/>
<g mask="url(#${P}-mask)">${loops}</g>
<rect x="676" y="0" width="604" height="720" fill="#0d0b27" fill-opacity=".55"/>
<line x1="676" x2="676" y1="0" y2="720" stroke="#8b76ff" stroke-opacity=".25"/>
</svg>`;
const logo = `<svg viewBox="0 0 34 34" aria-hidden="true"><rect width="34" height="34" rx="10" fill="#5a3ff5"/><path d="M12 12h8.5a6 6 0 0 1 0 12H14" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M15.5 8l-4 4 4 4" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="11.5" cy="24" r="2.2" fill="#ffc24b"/></svg>`;

export default {
  study: true,
  id: 'tpl-launch-closing',
  title: 'Closing: turn it on today, three steps and rollout dates',
  notes: 'Purpose: End with the concrete next action, how to adopt safely, and when each plan gets access.\nModify: Edit steps (keep three) and rollout dates; change the URL line. The loop backdrop is decorative and can stay.\nInvariant: Label future items as planned, not promised. Steps are imperative actions the customer takes, in order.\nStatic: The three steps build in order; the final state shows all of them.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-launch ln-close',
  content: `<div class="ln-page">${bg}
<div class="ln-mark">${logo}<span>Fernhook 2.0</span></div>
<div class="ln-abs" style="left:72px;top:196px;width:560px">
  <h2 class="ln-close-h" data-region="title">Turn it on today.</h2>
  <p class="ln-hero-lede" style="margin-top:26px;width:500px">Every Growth and Scale account already has 2.0. Nothing changes until you switch the rules on.</p>
</div>
<p class="ln-abs ln-url" style="left:72px;bottom:60px">fernhook.example/<span>2-0</span></p>
<div class="ln-abs" data-region="primary" style="left:736px;top:92px;width:472px">
  <p class="ln-kicker" style="color:#b3a5ff">Get started in a week</p>
  <ol class="ln-steps" style="margin-top:24px">${steps.map((s, i) => `<li data-step="${i + 1}" data-motion="lift"><h3>${esc(s.h)}</h3><p>${esc(s.p)}</p></li>`).join('')}</ol>
</div>
<div class="ln-abs ln-roll" data-region="support" style="left:736px;top:520px;width:472px">${rollout.map(r => `<div class="${r.now ? 'is-now' : ''}"><p>${esc(r.when)}</p><strong>${esc(r.what)}</strong></div>`).join('')}</div>
</div>`
};
