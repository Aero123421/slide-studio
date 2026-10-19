// Composition study · Useful final frame — the decision asked for, the evidence in one number,
// and what happens after a yes, with dates and owners. Weekdays, the saved hours and the request
// sentence are computed from the data, so the last page cannot contradict the deck.

// Japanese line breaking: phrases joined with <wbr>, set with `word-break: keep-all` (works without auto-phrase).
const seg = new Intl.Segmenter('ja', { granularity: 'word' });
const KANA = /^[ぁ-ゟー]+$/u, CLOSE = /^[、。，．）」』】〕・：；？！%％]/u, OPEN = /[（「『【〔]$/u;
const KANJI = /^[㐀-鿿々ァ-ヿ]+$/u, CJK = /^[ぁ-ヿ㐀-鿿々]/u, HAN = /^[㐀-鿿々]/u;
function ja(text) {
  const out = [];
  for (const { segment } of seg.segment(text)) {
    const prev = out.at(-1);
    if (prev === undefined) { out.push(segment); continue; }
    const glue = (KANA.test(segment) && (!/[、。]$/.test(prev) || segment.length === 1))
      || CLOSE.test(segment) || OPEN.test(prev) || /^\s+$/.test(segment)
      || (KANJI.test(prev.replace(/^[（「『【〔]/u, '')) && HAN.test(segment))
      || (/[0-9][0-9.,]*%?$/.test(prev) && (CJK.test(segment) || /^[%％]/.test(segment)))
      || (/[0-9][㐀-鿿々ァ-ヿ]+$/u.test(prev) && HAN.test(segment))
      || segment === '＝' || /＝$/.test(prev) || (/[0-9][年月]$/.test(prev) && /^[0-9]/.test(segment));
    if (glue) out[out.length - 1] += segment; else out.push(segment);
  }
  return out.join('<wbr>');
}

const trial = { line: '3号ライン', weeks: 6, changeovers: 72, beforeMin: 47, afterMin: 18 };   // 試行の実績（平均）
const rollout = { lines: ['1', '2', '4'], perDay: 6, daysPerMonth: 21 };                      // 段取り替え回数／日、稼働日／月
const decision = { meeting: '工場会議', date: '2026-11-13' };
const next = [
  { from: '2026-11-16', to: '2026-11-27', what: `班長研修（${rollout.lines.length}ライン×3直、各2時間）`, who: '製造課' },
  { from: '2026-12-01', what: `${rollout.lines.join('・')}号ラインで新しい手順を開始`, who: '各ラインの班長' },
  { from: '2026-12-25', what: `効果を${decision.meeting}で報告`, who: '生産技術課' },
];
const savedHours = Math.round(((trial.beforeMin - trial.afterMin) * rollout.perDay * rollout.daysPerMonth * rollout.lines.length) / 60);
const day = iso => { const d = new Date(`${iso}T12:00:00Z`); return `${d.getUTCMonth() + 1}月${d.getUTCDate()}日（${'日月火水木金土'[d.getUTCDay()]}）`; };
const span = r => (r.to ? `${day(r.from)}〜${day(r.to).replace(/^\d+月/, '')}` : day(r.from));

export default {
  study: true,
  id: 'composition-final-frame',
  language: 'ja',
  title: 'Useful final frame: the decision asked for, its evidence and the next dated steps',
  className: 'st cs-manufacturing-plant cmp-final',
  notes: 'Purpose: End a decision deck on what the audience must do and what happens next, instead of a thank-you page. The last frame stays on screen during discussion, so it carries the request, the one number that justifies it and the dated steps after a yes.\nModify: Replace `trial`, `rollout`, `decision` and `next`. The request sentence, the saved hours and the weekdays recompute. Keep the next steps to three rows (date, action, owner by team or role) and point to where the evidence lives in the deck, not to an e-mail address or phone number.\nInvariant: One framed request (the only accent on the page, and a box that stands for the decision itself); one result number with its basis in words; a short table of dated steps with owners; no contact details, no closing animation, no slogan.\nStatic: Already static.',
  sources: [],
  exportPolicy: 'final',
  content: `<p class="ff-run" data-region="support">第2工場　段取り替え時間の短縮</p>
<section class="ff-ask" data-region="title">
  <p class="ff-ask-label">ご判断のお願い　${day(decision.date)}の${decision.meeting}</p>
  <h1 class="ff-ask-text">${ja(`新しい段取り手順を、${rollout.lines.join('・')}号ラインにも展開することを承認してください`)}</h1>
</section>
<div class="ff-result" data-region="primary">
  <p class="ff-result-label">${ja(`${trial.line}の試行（${trial.weeks}週間、${trial.changeovers}回の平均）`)}</p>
  <p class="ff-num">${trial.beforeMin}<small>分</small><span class="ff-arrow">→</span>${trial.afterMin}<small>分</small></p>
  <p class="ff-result-text">${ja(`1回の段取り替えにかかる時間。${rollout.lines.length}ラインに広げると、生産に使える時間が月${savedHours}時間増える。`)}</p>
</div>
<div class="ff-next" data-region="support">
  <h2 class="ff-next-title">承認後の進め方</h2>
  <table class="ff-table"><tbody>${next.map(r => `<tr><th scope="row">${span(r)}</th><td>${ja(r.what)}</td><td class="ff-who">${r.who}</td></tr>`).join('')}</tbody></table>
</div>
<p class="ff-evidence" data-region="support">試行データと新しい手順書は付録A（14〜19ページ）にあります。</p>
<p class="st-source" data-region="source"><span>架空のデータ · 第2工場の改善プロジェクト</span><span>最終ページ：判断と次の手順</span></p>`,
};
