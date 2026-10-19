// Interaction study · Reachability — which bus stops can still reach the hospital when a bridge closes.
// The widget (kind 'graph') runs a shortest-path search over the open links at every toggle; the
// headline runs the same search here for the starting state.
const origin = 'hospital';
const stops = [   // positions in km on a local grid (x east, y south); label side for the map
  { id: 'hospital', name: 'Calder General Hospital', x: 1.5, y: 3.3, label: 'below' },
  { id: 'library', name: 'Library', x: 0.4, y: 2.0, label: 'above' },
  { id: 'market', name: 'Market Square', x: 2.6, y: 2.0, label: 'right' },
  { id: 'northgate', name: 'Northgate', x: 3.0, y: 0.6, label: 'left' },
  { id: 'station', name: 'Station', x: 2.6, y: 4.7, label: 'left' },
  { id: 'quay', name: 'Quay Street', x: 3.5, y: 3.3, label: 'below' },
  { id: 'millend', name: 'Mill End', x: 5.2, y: 3.3, label: 'below' },
  { id: 'orchard', name: 'Orchard Rise', x: 6.0, y: 2.2, label: 'right' },
  { id: 'ferry', name: 'Ferry Lane', x: 5.5, y: 4.7, label: 'right' },
  { id: 'heath', name: 'Heathfield', x: 7.0, y: 3.6, label: 'right' },
  { id: 'brook', name: 'Brook Green', x: 6.3, y: 1.1, label: 'right' },
  { id: 'weir', name: 'Weir Road', x: 5.2, y: 0.5, label: 'above' },
];
const links = [   // bus minutes between neighbouring stops
  ['hospital', 'market', 4], ['hospital', 'library', 5], ['hospital', 'station', 6], ['market', 'quay', 4], ['station', 'quay', 5],
  ['market', 'northgate', 6], ['millend', 'orchard', 4], ['millend', 'ferry', 5], ['orchard', 'heath', 5], ['orchard', 'brook', 4],
  ['ferry', 'heath', 6], ['brook', 'weir', 4],
];
const bridge = ['quay', 'millend', 3];        // Mill Street bridge: the only bus crossing of the river
const shuttle = ['northgate', 'weir', 9];     // temporary shuttle over Weir Road bridge, if it runs
const start = { bridge: false, shuttle: false };

function reach(open) {
  const edges = [...links, ...(open.bridge ? [bridge] : []), ...(open.shuttle ? [shuttle] : [])];
  const dist = Object.fromEntries(stops.map(s => [s.id, Infinity])); dist[origin] = 0;
  const todo = new Set(stops.map(s => s.id));
  while (todo.size) {
    const u = [...todo].reduce((a, b) => (dist[b] < dist[a] ? b : a));
    if (!Number.isFinite(dist[u])) break;
    todo.delete(u);
    for (const [a, b, m] of edges) { if (a === u && dist[u] + m < dist[b]) dist[b] = dist[u] + m; if (b === u && dist[u] + m < dist[a]) dist[a] = dist[u] + m; }
  }
  return dist;
}
const now = reach(start), cut = stops.filter(s => !Number.isFinite(now[s.id]));
const withShuttle = reach({ bridge: false, shuttle: true }), worst = Math.max(...Object.values(withShuttle));
const words = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const river = [[4.15, -0.3], [4.55, -0.3], [4.5, 1.2], [4.45, 2.4], [4.55, 3.8], [4.4, 5.3], [4.0, 5.3], [4.15, 3.8], [4.05, 2.4], [4.1, 1.2]];
const ID = 'interaction-graph';

export default {
  study: true,
  id: ID,
  title: 'Reachability: bus access to the hospital with a bridge closed',
  notes: `Purpose: Show what a closure does to a network, stop by stop: which places can still reach the hospital and how long it takes, with and without a stopgap.
Modify: Replace \`stops\` (with map positions), \`links\` (minutes), the closable \`bridge\` and the optional \`shuttle\`; the map, the minutes, the cut-off stops and the headline recompute.
Invariant: Closed or unused links stay on the map, dashed and labelled, so the change is visible. Reachability is a shortest-path search over the open links; nothing is placed by hand except stop positions.
Static: The export shows the closure without the shuttle (${cut.length} stops cut off). With the shuttle every stop is reachable, the farthest in ${worst} minutes; add that as a second page for a written brief.`,
  sources: [{ type: 'original-example', file: 'assets/interactions/graph.mjs' }],
  exportPolicy: 'final',
  className: 'st cs-civic-calm',
  content: `<h1 class="st-head">Closing Mill Street bridge cuts ${words[cut.length] ?? cut.length} east-bank stops off from the hospital by bus</h1>
<p class="st-dek">Calder bus network (fictional), weekday daytime minutes from Calder General Hospital.</p>
<div class="widget" data-interactive="" id="${ID}-widget" data-region="primary"><div class="w-plot"></div><div class="w-controls"></div><output aria-live="polite" class="w-status"></output></div>
<p class="st-source" data-region="source"><span>Illustrative network · shortest paths over open links, transfer time ignored</span><span>Interaction · Reachability</span></p>`,
  widgets: [{
    id: `${ID}-widget`,
    kind: 'graph',
    initial: { ...start },
    data: {
      origin, nodes: stops,
      edges: [...links.map(([from, to, minutes]) => ({ from, to, minutes })),
        { from: bridge[0], to: bridge[1], minutes: bridge[2], toggle: 'bridge', label: 'Mill Street bridge', closedLabel: 'Mill Street bridge closed' },
        { from: shuttle[0], to: shuttle[1], minutes: shuttle[2], toggle: 'shuttle', label: 'Weir Road shuttle', closedLabel: 'shuttle not running', labelDy: -14 }],
      toggles: [{ key: 'bridge', label: 'Mill Street bridge open', on: 'Open', off: 'Closed' }, { key: 'shuttle', label: 'Shuttle over Weir Road bridge', on: 'Running', off: 'Not running' }],
      areas: [{ points: river, tone: 'water', label: 'River Calder', labelAt: [4.28, 5.0] }],
      pad: { l: 40, r: 120, t: 56, b: 66 },
    },
    text: {
      minutes: '{m} min', unreachable: 'cut off',
      status: 'Every stop reaches the hospital; the farthest takes {farthest} minutes.',
      statusCut: '{reached} of {count} stops reach the hospital; {cut} are cut off: {cutList}.',
      figure: 'Bus network map with travel minutes from the hospital',
    },
  }],
};
