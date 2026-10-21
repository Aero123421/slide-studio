// Template: 四半期業績レビュー（QBR）· 次四半期の重点施策. Synthetic example content; replace data and copy.
// Three priorities in order of importance. Each names the page it comes from, one KPI (now → target),
// one owner and one date; current KPI values are computed from this quarter's figures below.
import { fmt } from '../../runtime/figure.mjs';

const ID = 'tpl-qbr-next-quarter';
const quarter = { name: '第3四半期', months: '10〜12月' };
// This quarter's figures the KPIs start from (same data as pages 3–5).
const funnel = { leads: 4820, meetings: 964, prevRate: 26.0 };            // 件, 前期の商談化率 %
const onboarding = { newContracts: 118, supported: 65 };                  // 7〜9月の新規契約社数と導入支援の実施社数
const cloud = { cost: 244, revenue: 2078 };                               // クラウド基盤費と売上高, 百万円
const priorities = [
  { what: 'インサイドセールス3名を11月末までに採用し、初回接触を48時間以内に戻す', from: '商談化率の低下', page: 4,
    kpi: '商談化率', now: funnel.meetings / funnel.leads * 100, target: funnel.prevRate, digits: 1, owner: '高木 誠', role: '営業本部長', due: '2026-12-28' },
  { what: '導入支援を全プランの新規契約に広げ、契約後30日以内に初期設定を終える', from: '刷新後の継続率の改善', page: 5,
    kpi: '導入支援の実施率', now: onboarding.supported / onboarding.newContracts * 100, target: 100, digits: 0, owner: '中村 彩', role: 'カスタマーサクセス部 部長', due: '2026-11-30' },
  { what: '予約インスタンスへの切り替えとログ保管の階層化で、クラウド基盤費を抑える', from: '基盤費の計画超過', page: 3,
    kpi: '基盤費の売上高比率', now: cloud.cost / cloud.revenue * 100, target: 11.0, digits: 1, owner: '佐伯 亮', role: '技術本部長', due: '2026-12-28' },
];
const note = '注：KPIの現状は2026年7〜9月期の実績。目標は12月単月の実績で判定する。';
const running = '2026年度 第2四半期 業績レビュー';
const page = 6;

// ---- derived
const WD = '日月火水木金土';
const due = iso => { const d = new Date(`${iso}T00:00:00Z`); return { md: `${d.getUTCMonth() + 1}月${d.getUTCDate()}日`, wd: WD[d.getUTCDay()] }; };
const v = (x, digits) => fmt(x, { digits });
const first = priorities[0];
const rows = priorities.map((p, i) => {
  const d = due(p.due);
  return `<tr>
    <td class="q-item"><span class="q-no">${i + 1}</span><p class="q-what">${p.what}</p><p class="q-why">根拠：${p.from}（${p.page}ページ）</p></td>
    <td><p class="q-kpi-name">${p.kpi}</p><p class="q-kpi-val">${v(p.now, p.digits)}%<span class="q-label"> → </span><span class="to">${v(p.target, p.digits)}%</span></p></td>
    <td><p class="q-who">${p.owner}<small>${p.role}</small></p></td>
    <td><p class="q-due">${d.md}<small>（${d.wd}）</small></p></td>
  </tr>`;
}).join('');

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Next-quarter priorities with owner, KPI and date',
  notes: `Purpose: 本資料の分析から導いた次四半期の重点施策を、責任者・KPI・期限つきで合意する。会議の最後に「誰が・何を・いつまでに」を確定させるページ。\nModify: priorities を3件（多くても4件）に絞って書き換える。各施策に根拠のページ、KPI（現状→目標）、責任者1名、期限1つを置く。KPIの現状値は funnel・onboarding・cloud の今期の値から計算される。quarter、note、running も更新する。\nInvariant: 上から重要な順に並べる（1が最優先）。施策は動詞で終わる具体的な行動にする。責任者は部署名ではなく個人名と役職。期限は日付で書く。\nStatic: Already static.`,
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-qbr q-next',
  content: `<h1 class="q-head" data-region="title">${quarter.name}は${first.kpi}を<span class="nw">${v(first.target, first.digits)}%</span>に戻すことを最優先とし、継続率の改善と基盤費の抑制を並行して進める</h1>
<table class="q-table g" style="--c:1;--s:12;top:212px" data-region="primary">
  <colgroup><col style="width:564px"><col style="width:196px"><col style="width:196px"><col style="width:196px"></colgroup>
  <thead><tr><th>重点施策</th><th>KPI（現状 → 目標）</th><th>責任者</th><th>期限</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<p class="q-foot" data-region="source"><span>${note}</span><span class="num">${running}　${page}</span></p>`,
};
