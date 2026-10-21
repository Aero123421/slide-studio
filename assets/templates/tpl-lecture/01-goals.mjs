// Template: 講義・社内研修（日本語） · 表紙と学習目標. Synthetic example content; replace data and copy.
// Type-led opener: the series, a large title, one line on why it matters, then three goals written as
// things the learner can do by the end (observable verbs), numbered because they follow the lesson's order.
const ID = 'tpl-lecture-goals';
const course = {
  series: 'データ読み解き基礎', session: '第3回',
  title: '平均の落とし穴',
  subtitle: '店ごとの平均を、そのまま平均してはいけない理由',
  audience: '店舗運営・営業企画の新任者向け', minutes: 45,
};
const goals = [ // one per main page of the lesson: concept (2), example (3), mistake and check (4–5)
  '単純平均と加重平均の違いを、数直線の図で説明できる',
  '「合計 ÷ 合計」の手順で、加重平均を計算できる',
  '資料の平均値が、何を重みにした平均かを確かめられる',
];

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Lecture opener: title and three learning goals',
  notes: 'Purpose: 講義の題名と、終わったときに何ができるようになるかを最初に約束する。受講者が自分の到達を確かめられる目標にする。\nModify: course の講座名・回・題名・副題・対象・時間と goals を書き換える。目標は「〜できる」で終わる観察できる行動にし、3つまでにする。\nInvariant: 目標の順番は講義の順番と同じ。まとめのページでは目標を繰り返さず、学んだ要点として言い直す。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-lecture lx-p-goals',
  content: `<p class="lx-series" data-region="support"><b>${course.series}</b>${course.session}</p>
<h1 class="lx-title" data-region="title">${course.title}</h1>
<p class="lx-sub" data-region="support">${course.subtitle}</p>
<section class="lx-goals" data-region="primary">
  <h2>この回の目標</h2>
  <ol>${goals.map((g, i) => `<li><i>${i + 1}</i><span>${g}</span></li>`).join('')}</ol>
</section>
<p class="lx-meta"><span>${course.audience}</span><span class="nw">${course.minutes}分</span></p>`,
};
