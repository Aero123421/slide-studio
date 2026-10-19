// Diagram study · Dependency graph — which work waits on which, and which chain sets the date.
// Tasks and "must finish before" edges are data; earliest starts, slack, the critical path,
// the accent and the headline are computed. Columns are dependency depth, not dates.
import { flowDiagram, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const tasks = [ // working days (illustrative), listed so that every dependency comes first
  { id: 'cut', label: 'Branch cut', days: 1, after: [] },
  { id: 'api', label: 'API v3 migration', days: 6, after: ['cut'] },
  { id: 'ios', label: 'iOS build', days: 2, after: ['cut'] },
  { id: 'android', label: 'Android build', days: 1, after: ['cut'] },
  { id: 'strings', label: 'Translations', days: 5, after: ['cut'] },
  { id: 'qa', label: 'Regression QA', days: 4, after: ['api', 'ios', 'android'] },
  { id: 'shots', label: 'Store screenshots', days: 2, after: ['strings'] },
  { id: 'review', label: 'Store review', days: 3, after: ['qa', 'shots'] },
  { id: 'rollout', label: 'Staged rollout', days: 4, after: ['review'] },
];

// Forward pass (earliest finish), backward pass (latest finish), slack = latest − earliest.
const ef = {}, lf = {};
for (const k of tasks) ef[k.id] = Math.max(0, ...k.after.map(a => ef[a])) + k.days;
const total = Math.max(...Object.values(ef));
for (const k of [...tasks].reverse()) {
  const next = tasks.filter(q => q.after.includes(k.id));
  lf[k.id] = next.length ? Math.min(...next.map(q => lf[q.id] - q.days)) : total;
}
const slack = Object.fromEntries(tasks.map(k => [k.id, lf[k.id] - ef[k.id]]));
const critical = tasks.filter(k => slack[k.id] === 0);
const loose = tasks.filter(k => slack[k.id] > 0);
const driver = critical.filter(k => k.after.length).sort((a, b) => b.days - a.days)[0];
const words = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];

export function figure(theme = 'css') {
  const t = makeTheme(theme);
  return flowDiagram({
    id: 'dependency-dag-fig', theme: t, width: 1152, height: 444, fontSize: 19, nodeMaxWidth: 210, nodeMinWidth: 150, crossGap: 22,
    title: 'Release 5.2 task dependencies with the critical path',
    desc: `${tasks.length} tasks. An arrow means the first task must finish before the second can start; tasks in the same column have no dependency on each other and can run in parallel. The critical path (${critical.map(k => k.label).join(' → ')}) takes ${total} working days; ${loose.map(k => `${k.label.toLowerCase()} has ${slack[k.id]} days of slack`).join(', ')}.`,
    nodes: tasks.map(k => {
      const crit = slack[k.id] === 0;
      const len = `${k.days} ${k.days === 1 ? 'day' : 'days'}`;
      return { id: k.id, label: k.label, sub: crit ? len : `${len}, ${slack[k.id]} slack`,
        fill: t.c('paper'), stroke: crit ? t.c('accent') : t.c('rule'), strokeWidth: crit ? 2.4 : 1.4 };
    }),
    edges: tasks.flatMap(k => k.after.map(a => ({ from: a, to: k.id, emphasis: slack[a] === 0 && slack[k.id] === 0 && ef[a] === ef[k.id] - k.days }))),
  });
}

export default {
  study: true,
  id: 'dependency-dag',
  title: 'Dependency graph: parallel and dependent work',
  className: 'st cs-launch-violet',
  notes: 'Purpose: Distinguish work that can run in parallel from work that must wait, and show which chain sets the finish date.\nModify: Edit `tasks` (days and the tasks each must wait for). Earliest finishes, slack, the critical path, the accent and the headline recompute; columns follow dependency depth.\nInvariant: An arrow means "must finish before"; no cycles; never move an edge endpoint to tidy the drawing; column position is dependency depth, not a date.\nStatic: Already static. For a build, pass build:{by:"mark"} to reveal tasks in dependency order.',
  sources: [{ type: 'original-example', file: 'assets/svg/dependency-dag.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">The <em>${driver.label}</em> sets the ${total}-day release.<br><span class="st-quiet">${words[loose.length][0].toUpperCase() + words[loose.length].slice(1)} other tasks have ${Math.min(...loose.map(k => slack[k.id]))} to ${Math.max(...loose.map(k => slack[k.id]))} days of slack</span></h1>
<p class="st-dek">An arrow means “must finish before”. Outlined tasks are on the critical path.</p>
<figure class="st-fig" style="top:214px" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative plan · mobile release 5.2, working days</span><span>Dependency graph (DAG) with critical path</span></p>`,
};
