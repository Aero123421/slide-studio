// Template: 四半期業績レビュー（QBR）· 表紙. Synthetic example content; replace data and copy.
// Type only: company, document title, period, meeting date, author. Dates are computed, so the weekday is always right.
const ID = 'tpl-qbr-cover';

const doc = {
  company: 'ミズナラ・テクノロジーズ株式会社',   // fictional company
  classification: '社外秘',
  fiscalYear: 2026,                              // 年度 (April start)
  quarter: 2,                                    // 第2四半期 = 7–9月
  title: '業績レビュー',
  meeting: { name: '経営会議', date: '2026-10-20' },
  author: '経営企画部',
};

// Fiscal quarter q of an April-start year covers months 3q+1 … 3q+3 (calendar year rolls over for Q4).
const WD = '日月火水木金土';
const day = iso => new Date(`${iso}T00:00:00Z`);
const firstMonth = 3 * doc.quarter + 1;                                   // 7
const start = new Date(Date.UTC(doc.fiscalYear + (firstMonth > 12 ? 1 : 0), (firstMonth - 1) % 12, 1));
const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 3, 0)); // last day of the 3rd month
const jpDate = (d, withYear = true) => `${withYear ? `${d.getUTCFullYear()}年` : ''}${d.getUTCMonth() + 1}月${d.getUTCDate()}日`;
const meetingDay = day(doc.meeting.date);
const period = `${jpDate(start)}〜${jpDate(end, start.getUTCFullYear() !== end.getUTCFullYear())}`;

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Quarterly business review — cover',
  notes: 'Purpose: 会議の名前・対象期間・日付・作成者だけを静かに示し、資料の素性を一目で分かるようにする。\nModify: doc の会社名・年度・四半期・会議日・作成部署を書き換える。対象期間（4月始まりの年度）と曜日は自動計算。3月決算以外の会社は firstMonth の式を自社の期首月に合わせる。\nInvariant: 文字だけで構成する（ロゴ・図・数値サマリーを置かない）。結論は2ページ目以降で述べる。社外秘などの取扱区分は実際の規程に合わせる。\nStatic: Already static.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-qbr q-cover',
  content: `<p class="q-cv-org g" style="--c:1;--s:8" data-region="support">${doc.company}</p>
<p class="q-cv-class g" style="--c:11;--s:2" data-region="support">${doc.classification}</p>
<h1 class="q-cv-title g" style="--c:1;--s:10" data-region="title"><span class="nw">${doc.fiscalYear}年度 第${doc.quarter}四半期</span><br>${doc.title}</h1>
<dl class="q-cv-meta g" style="--c:1;--s:6" data-region="support">
  <dt>対象期間</dt><dd class="num">${period}</dd>
  <dt>会議</dt><dd class="num">${doc.meeting.name}　${jpDate(meetingDay)}（${WD[meetingDay.getUTCDay()]}）</dd>
  <dt>作成</dt><dd>${doc.author}</dd>
</dl>`,
};
