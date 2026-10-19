// Diagram study · Molecular graph — four methylxanthines drawn from one bond list each. Ring atoms come
// from regular hexagon/pentagon geometry, substituents point away from their ring centre, and the
// formula and molar mass are counted from the graph (implicit hydrogens = valence − bond orders).
import { svgRoot, el, g, textLines, measureText, theme as makeTheme, fmt } from '../runtime/figure.mjs';

// Shared xanthine scaffold (7H tautomer), purine numbering. Bonds: [a, b, order].
const ring6 = ['N1', 'C2', 'N3', 'C4', 'C5', 'C6'], ring5 = ['C4', 'C5', 'N7', 'C8', 'N9'];
const scaffold = [['N1', 'C2', 1], ['C2', 'N3', 1], ['N3', 'C4', 1], ['C4', 'C5', 2], ['C5', 'C6', 1], ['C6', 'N1', 1],
  ['C5', 'N7', 1], ['N7', 'C8', 1], ['C8', 'N9', 2], ['N9', 'C4', 1], ['C2', 'O2', 2], ['C6', 'O6', 2]];
const molecules = [ // which ring nitrogens carry a methyl group
  { name: 'キサンチン', methyl: [] },
  { name: 'テオブロミン', methyl: ['N3', 'N7'], note: 'カカオ' },
  { name: 'テオフィリン', methyl: ['N1', 'N3'], note: '茶葉' },
  { name: 'カフェイン', methyl: ['N1', 'N3', 'N7'], note: 'コーヒー豆' },
];
const valence = { C: 4, N: 3, O: 2 }, mass = { C: 12.011, H: 1.008, N: 14.007, O: 15.999 };

// Graph → bonds (with methyls), implicit hydrogens, formula and molar mass.
const build = m => {
  const bonds = [...scaffold, ...m.methyl.map(n => [n, `Me${n.slice(1)}`, 1])];
  const atoms = [...new Set(bonds.flatMap(b => [b[0], b[1]]))];
  const el0 = a => (a.startsWith('Me') ? 'C' : a[0]);
  const hyd = Object.fromEntries(atoms.map(a => [a, valence[el0(a)] - bonds.filter(b => b[0] === a || b[1] === a).reduce((s, b) => s + b[2], 0)]));
  const count = { C: 0, H: 0, N: 0, O: 0 };
  for (const a of atoms) { count[el0(a)]++; count.H += hyd[a]; }
  return { ...m, bonds, atoms, hyd, count, mw: Object.entries(count).reduce((s, [k, v]) => s + v * mass[k], 0) };
};
const mols = molecules.map(build);
const formula = c => ['C', 'H', 'N', 'O'].filter(k => c[k]).map(k => [k, c[k]]);   // Hill order
const key = c => formula(c).map(([k, v]) => k + v).join('');
const iso = mols.filter((m, i) => mols.some((o, j) => j !== i && key(o.count) === key(m.count)));   // same formula, different graph

// Chemical text: digits become subscripts (a run of digits shares one baseline shift).
const chemRuns = text => {
  const out = []; let sub = false;
  for (const ch of text) {
    const digit = /\d/.test(ch);
    out.push(el('tspan', digit ? { 'font-size': 13, dy: sub ? null : 4 } : { dy: sub ? -4 : null }, ch));
    sub = digit;
  }
  return out;
};

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, id = 'molecular-graph-fig', L = 46;
  // Ring geometry in bond-length units (y up): hexagon with its shared edge vertical, pentagon fused on the right.
  const deg = Math.PI / 180, pos = {};
  [['C5', 30], ['C4', -30], ['N3', -90], ['C2', -150], ['N1', 150], ['C6', 90]].forEach(([a, d]) => { pos[a] = [Math.cos(d * deg), Math.sin(d * deg)]; });
  const cp = [Math.cos(30 * deg) + 0.5 / Math.tan(36 * deg), 0], rp = 0.5 / Math.sin(36 * deg);
  [['N7', 72], ['C8', 0], ['N9', -72]].forEach(([a, d]) => { pos[a] = [cp[0] + rp * Math.cos(d * deg), rp * Math.sin(d * deg)]; });
  const centre = a => (ring6.includes(a) && !ring5.includes(a) ? [0, 0] : cp);
  const out = (a, len = 1) => { const c = centre(a), v = [pos[a][0] - c[0], pos[a][1] - c[1]], l = Math.hypot(...v); return [pos[a][0] + (v[0] / l) * len, pos[a][1] + (v[1] / l) * len]; };
  ['O2', 'O6'].forEach(o => { pos[o] = out(`C${o[1]}`); });
  ['1', '3', '7'].forEach(k => { pos[`Me${k}`] = out(`N${k}`); });
  const cell = W / mols.length;

  const drawMol = (m, i) => {
    const ox = i * cell + cell / 2 - 0.62 * L, oy = 150;
    const P = a => [ox + pos[a][0] * L, oy - pos[a][1] * L];
    const parts = [], labels = [];
    for (const [a, b, order] of m.bonds) {
      const [x1, y1] = P(a), [x2, y2] = P(b), methyl = b.startsWith('Me');
      const stroke = methyl ? t.c('accent') : t.c('ink');
      parts.push(el('line', { x1, y1, x2, y2, stroke, 'stroke-width': methyl ? 2.6 : 2, 'stroke-linecap': 'round' }));
      if (order === 2) {
        const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
        if (b.startsWith('O')) {   // exocyclic C=O: second line beside the first
          parts.push(el('line', { x1: x1 + nx * 5, y1: y1 + ny * 5, x2: x2 + nx * 5, y2: y2 + ny * 5, stroke, 'stroke-width': 2, 'stroke-linecap': 'round' }));
        } else {                   // ring double bond: inner line, shortened, toward the ring centre
          const ring = ring5.includes(a) && ring5.includes(b) && !(a === 'C4' && b === 'C5') ? cp : [0, 0];
          const [cx, cy] = [ox + ring[0] * L, oy - ring[1] * L], mx = (x1 + x2) / 2, my = (y1 + y2) / 2, s = (cx - mx) * nx + (cy - my) * ny > 0 ? 1 : -1;
          parts.push(el('line', { x1: x1 + dx * 0.16 + s * nx * 6, y1: y1 + dy * 0.16 + s * ny * 6, x2: x2 - dx * 0.16 + s * nx * 6, y2: y2 - dy * 0.16 + s * ny * 6, stroke, 'stroke-width': 2, 'stroke-linecap': 'round' }));
        }
      }
    }
    // Atom labels: heteroatoms and methyls, each on a paper knockout so bond ends stop at the letters.
    // `bonded` is the index of the character that sits on the atom position (C of H3C, N of HN, …).
    const label = (a, text, color, bonded = 0) => {
      const [x, y] = P(a), widths = [...text].map(ch => measureText(ch, /\d/.test(ch) ? 13 : 18, { weight: 600 }));
      const w = widths.reduce((s1, v) => s1 + v, 0), before = widths.slice(0, bonded).reduce((s1, v) => s1 + v, 0);
      const x0 = x - before - widths[bonded] / 2;
      labels.push(el('rect', { x: x0 - 2, y: y - 11, width: w + 4, height: 22, fill: t.c('paper') }),
        el('text', { x: x0, y: y + 6.5, 'font-size': 18, 'font-weight': 600, fill: color }, chemRuns(text)));
    };
    for (const a of m.atoms) {
      if (a.startsWith('Me')) { const left = pos[a][0] < pos[`N${a.slice(2)}`][0] - 0.1; label(a, left ? 'H3C' : 'CH3', t.c('accent'), left ? 2 : 0); continue; }
      if (a[0] === 'C') continue;
      if (a[0] === 'N' && m.hyd[a]) {   // N–H: hydrogen written on the side away from the ring
        if (a === 'N3') { label(a, 'N', t.c('ink')); labels.push(textLines(['H'], { x: P(a)[0], y: P(a)[1] + 24, size: 18, anchor: 'middle', valign: 'middle', weight: 600, fill: t.c('ink') })); }
        else if (pos[a][0] < 0.2) label(a, 'HN', t.c('ink'), 1); else label(a, 'NH', t.c('ink'), 0);
        continue;
      }
      label(a, a[0], t.c('ink'));
    }
    // locants for the three methylation sites
    const loc = ['N1', 'N3', 'N7'].map(a => { const c = centre(a), [x, y] = P(a), v = [ox + c[0] * L - x, oy - c[1] * L - y], l = Math.hypot(...v); return textLines([a.slice(1)], { x: x + (v[0] / l) * 19, y: y + (v[1] / l) * 19, size: 15, anchor: 'middle', valign: 'middle', fill: t.c('muted') }); });
    const f = formula(m.count), tx = i * cell + cell / 2;
    const fText = el('text', { x: tx, y: 340, 'font-size': 17, 'text-anchor': 'middle', fill: t.c('ink') }, chemRuns(f.map(([k, v]) => k + (v > 1 ? v : '')).join('')));
    return g({ 'data-molecule': m.name }, parts, labels, loc,
      textLines([m.name], { x: tx, y: 302, size: 19, anchor: 'middle', valign: 'middle', weight: 700, fill: t.c('ink') }),
      fText,
      textLines([`${fmt(m.mw, { digits: 2 })} g/mol`], { x: tx, y: 366, size: 15, anchor: 'middle', valign: 'middle', fill: t.c('muted') }),
      textLines([m.methyl.length ? `メチル基：${m.methyl.join('、')}` : 'メチル基なし'], { x: tx, y: 394, size: 15, anchor: 'middle', valign: 'middle', weight: 700, fill: m.methyl.length ? t.c('accent') : t.c('muted') }));
  };
  // bracket joining the two isomers: same formula, different graph
  const [i1, i2] = iso.map(m => mols.indexOf(m));
  const bx1 = i1 * cell + cell / 2, bx2 = i2 * cell + cell / 2;
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'キサンチンと3種のメチルキサンチンの構造式（結合グラフ）',
    desc: `同じキサンチン骨格に、メチル基がテオブロミンはN3とN7、テオフィリンはN1とN3、カフェインはN1・N3・N7に付く。組成は結合リストから数え、${mols.map(m => `${m.name} ${key(m.count)}（${fmt(m.mw, { digits: 2 })} g/mol）`).join('、')}。テオブロミンとテオフィリンは分子式が同じで、メチル基の位置だけが違う。` },
  mols.map(drawMol),
  el('path', { d: `M${bx1} 412v10H${bx2}v-10`, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.2 }),
  textLines(['分子式は同じ、結合のしかたが違う'], { x: (bx1 + bx2) / 2, y: 434, size: 15, anchor: 'middle', valign: 'top', fill: t.c('ink'), weight: 600 }));
}

export default {
  study: true,
  id: 'molecular-graph',
  language: 'ja',
  title: 'Molecular graph: connectivity drawn from a bond list',
  className: 'st cs-materials-lab',
  notes: 'Purpose: Show a schematic connectivity graph so that differences between related molecules (here, where the methyl groups sit) are visible, and the composition follows from the graph.\nModify: Edit `scaffold` and `molecules`; ring atoms are placed by hexagon/pentagon geometry, substituents point away from their ring centre, and formula and molar mass are counted from the bonds (implicit H = valence − bond orders).\nInvariant: Illustrative graph only: verify valence, tautomer, stereochemistry and identity before scientific use; skeletal convention (carbon unlabeled, heteroatoms labeled); every drawn bond exists in the bond list.\nStatic: Already static. For a talk, show the shared scaffold first, then add methyl groups molecule by molecule.',
  sources: [{ type: 'original-example', file: 'assets/svg/molecular-graph.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">${iso.map(m => m.name).join('と')}は分子式が同じ。<br><span class="st-quiet">違いは<em>メチル基</em>が付く窒素の位置だけ</span></h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>教育用の模式図 · 組成と分子量は結合リストから計算、原子量はIUPAC標準値、7H互変異性体で表示</span><span>結合グラフ（構造式）</span></p>`,
};
