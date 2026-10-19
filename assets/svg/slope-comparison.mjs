// Diagram study · Slope comparison — the same entities at two occasions on one shared scale.
// Rank changes, the highlighted fall, the counts in the rail and the headline all come from `lines`.
import { slopeChart, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const lines = [ // share of trains arriving within 5 minutes of timetable, %, annual average (illustrative)
  { label: 'Coastal Line', a: 94.1, b: 82.6 },
  { label: 'Airport Express', a: 92.8, b: 95.2 },
  { label: 'Forest Line', a: 90.3, b: 87.6 },
  { label: 'Valley Line', a: 89.5, b: 93.1 },
  { label: 'Northern Loop', a: 88.0, b: 90.2 },
  { label: 'Cross-City', a: 86.2, b: 91.4 },
  { label: 'Lakeshore', a: 85.6, b: 89.7 },
  { label: 'Eastern Main', a: 84.7, b: 88.9 },
  { label: 'Harbour Branch', a: 83.1, b: 86.0 },
];
const occasions = ['2019', '2025'];
const rank = key => [...lines].sort((p, q) => q[key] - p[key]).map(l => l.label);
const story = [...lines].sort((p, q) => (p.b - p.a) - (q.b - q.a))[0]; // largest fall
const improved = lines.filter(l => l.b > l.a);
const ordinal = k => ['most', 'second most', 'third most'][k] ?? `${k + 1}th`;
const wasRank = rank('a').indexOf(story.label), isLast = rank('b').at(-1) === story.label;
const all = lines.flatMap(l => [l.a, l.b]), domain = [Math.floor(Math.min(...all)), Math.ceil(Math.max(...all))]; // one scale for both years

export function figure(theme = 'css') {
  const t = makeTheme(theme);
  return slopeChart({
    id: 'slope-comparison-fig', theme, width: 800, height: 470, fontSize: 16,
    title: 'Punctuality by rail line, 2019 and 2025, percent of trains within 5 minutes',
    desc: `${story.label} fell from ${fmt(story.a, { digits: 1 })}% to ${fmt(story.b, { digits: 1 })}%, from the ${ordinal(wasRank)} punctual line to ${isLast ? 'the least' : 'lower'}. ${improved.length} of ${lines.length} lines improved. Only the two annual averages are shown; the years between are not.`,
    data: lines, aLabel: occasions[0], bLabel: occasions[1], domain, format: { digits: 1 },
    highlight: story.label, highlightColor: () => t.c('accent'),
  });
}

export default {
  study: true,
  id: 'slope-comparison',
  title: 'Slope chart: paired values at two occasions',
  className: 'st st--rail cs-navy-classic-light',
  notes: 'Purpose: Track the same entities between two occasions so changes in level and in rank read together.\nModify: Replace `lines` (a = first occasion, b = second) and `occasions`. The highlighted line is the largest fall; switch the sort to the largest rise if that is the story. Labels spread themselves to avoid collisions.\nInvariant: One vertical scale for both occasions; straight lines only between the two measured points; say that intervening years are not shown.\nStatic: Already static. For a build, pass build:{by:"mark"} to draw lines one at a time, the highlighted one last.',
  sources: [{ type: 'original-example', file: 'assets/svg/slope-comparison.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">The <em>${story.label}</em> went from the ${ordinal(wasRank)} punctual line in ${occasions[0]} to ${isLast ? 'the least' : 'a laggard'} in ${occasions[1]}</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<div class="st-rail" data-region="support">
  <div class="st-kpi"><b class="st-accent">${fmt(story.b - story.a, { digits: 1 })} pts</b><span>${story.label}, ${occasions[0]} to ${occasions[1]}. Signal works on the single-track section began in 2023.</span></div>
  <hr class="st-rule">
  <div class="st-kpi"><b>${improved.length} of ${lines.length}</b><span>lines are more punctual than in ${occasions[0]}.</span></div>
</div>
<p class="st-source" data-region="source"><span>Illustrative data · annual averages for ${occasions[0]} and ${occasions[1]} only; lines do not show the years between</span><span>Slope chart</span></p>`,
};
