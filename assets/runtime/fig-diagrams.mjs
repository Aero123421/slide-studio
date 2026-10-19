/**
 * Slide Studio figure engine — relationship diagrams.
 *
 * Layout is computed from declared nodes and edges: node boxes from measured
 * labels, layers from edge direction, ports on box boundaries, arrowheads
 * outside the boxes. An edge always means one declared relation; write what
 * it means (sequence, data flow, dependency, causal hypothesis) in `desc`.
 */
import {
  theme, el, g, svgRoot, esc, n, isNum, sum, clamp, checkId, measureText, wrapText, wrapBalanced, blockWidth, textLines,
  roundRectPath, arrowMarker, boxPort, sidePort, normBuild, buildAttrs, isHighlighted, callout, rng, polar,
} from './fig-core.mjs';

function setup(o, defaults = {}) {
  checkId(o.id);
  if (!o.title) throw Error(`${o.id}: title (accessible name) is required`);
  const t = theme(o.theme), size = o.fontSize ?? 18;
  return { t, id: o.id, size, arrowSize: o.arrowSize, W: o.width ?? defaults.width ?? 1120, H: o.height ?? defaults.height ?? 520, build: normBuild(o.build) };
}
function root(o, ctx, defs, parts) {
  const notes = (o.annotate || []).map(a => callout({ theme: ctx.t, size: a.size ?? ctx.size - 1, ...a, attrs: a.step ? { 'data-step': a.step, 'data-motion': a.motion || 'reveal' } : {} }));
  const extra = typeof o.extra === 'function' ? o.extra(ctx) : (o.extra || '');
  return svgRoot({ id: ctx.id, width: ctx.W, height: ctx.H, title: o.title, desc: o.desc, theme: ctx.t, className: o.className || '' },
    el('defs', {}, defs, o.defs || ''), o.before || '', parts, notes, extra, o.after || '');
}
function markers(ctx) {
  const { t, id } = ctx, size = ctx.arrowSize ?? 12;
  return [
    arrowMarker(`${id}-arr`, t.c('muted'), { size }),
    arrowMarker(`${id}-arr-ink`, t.c('ink'), { size }),
    arrowMarker(`${id}-arr-accent`, t.c('accent'), { size }),
    arrowMarker(`${id}-arr-open`, t.c('muted'), { open: true, size }),
  ].join('');
}

// ---------------------------------------------------------------- nodes

const KIND_PAD = { process: [22, 16], terminal: [28, 16], decision: [34, 24], data: [32, 16], store: [24, 22], note: [18, 14], circle: [16, 16], plain: [6, 4] };

/** Measure a node: wraps label/sub into the max width and returns w, h and the lines. */
export function measureNode(nd, { size = 17, maxWidth = 220, minWidth = 96 } = {}) {
  const kind = nd.kind || 'process';
  const [px, py] = KIND_PAD[kind] || KIND_PAD.process;
  const inner = (nd.maxWidth ?? maxWidth) - 2 * px;
  const label = wrapBalanced(String(nd.label ?? nd.id), inner, size, { weight: 600 });
  const sub = nd.sub ? wrapBalanced(String(nd.sub), inner, Math.max(15, size - 3)) : [];
  const tw = Math.max(blockWidth(label, size, { weight: 600 }), blockWidth(sub, Math.max(15, size - 3)));
  const th = label.length * size * 1.22 + (sub.length ? 6 + sub.length * (Math.max(15, Math.max(15, size - 3))) * 1.25 : 0);
  let w = Math.max(nd.w ?? 0, minWidth, tw + 2 * px), h = Math.max(nd.h ?? 0, th + 2 * py);
  if (kind === 'decision') { w = Math.max(w, tw * 1.55 + 2 * px); h = Math.max(h, th * 1.7 + py); }
  if (kind === 'circle') { const d = Math.max(w, h); w = d; h = d; }
  return { ...nd, kind, w, h, lines: label, subLines: sub };
}

/** Draw a measured node at (x, y) top-left. */
/** Nodes may be given as plain strings (id = label) or as {id, label, sub, …} objects. */
const asNode = v => (typeof v === 'string' ? { id: v, label: v } : v);
/** Links may be given as [from, to] pairs or as {from, to, …} objects. */
const asLink = l => (Array.isArray(l) ? { from: l[0], to: l[1] } : l);

export function drawNode(nd, ctx, attrs = {}) {
  const { t, size } = ctx;
  const { x, y, w, h, kind } = nd;
  const em = !!nd.emphasis, muted = !!nd.muted;
  const fill = nd.fill || (em ? t.c('accent') : kind === 'note' ? t.c('paper') : t.c('surface'));
  const stroke = nd.stroke || (em ? t.c('accent') : muted ? t.c('rule') : kind === 'note' ? t.c('rule') : t.c('rule'));
  const ink = em ? t.c('onAccent') : muted ? t.c('muted') : t.c('ink');
  const sw = nd.strokeWidth ?? 1.4, dash = muted ? '5 4' : null;
  let shape;
  if (kind === 'terminal') shape = el('rect', { x, y, width: w, height: h, rx: h / 2, fill, stroke, 'stroke-width': sw, 'stroke-dasharray': dash });
  else if (kind === 'decision') shape = el('path', { d: `M${n(x + w / 2)} ${n(y)}L${n(x + w)} ${n(y + h / 2)}L${n(x + w / 2)} ${n(y + h)}L${n(x)} ${n(y + h / 2)}Z`, fill, stroke, 'stroke-width': sw, 'stroke-linejoin': 'round' });
  else if (kind === 'data') { const k = 14; shape = el('path', { d: `M${n(x + k)} ${n(y)}H${n(x + w)}L${n(x + w - k)} ${n(y + h)}H${n(x)}Z`, fill, stroke, 'stroke-width': sw, 'stroke-linejoin': 'round' }); }
  else if (kind === 'store') {
    const e = 9;
    shape = g({}, el('path', { d: `M${n(x)} ${n(y + e)}V${n(y + h - e)}A${n(w / 2)} ${e} 0 0 0 ${n(x + w)} ${n(y + h - e)}V${n(y + e)}`, fill, stroke, 'stroke-width': sw }),
      el('ellipse', { cx: x + w / 2, cy: y + e, rx: w / 2, ry: e, fill, stroke, 'stroke-width': sw }));
  } else if (kind === 'note') {
    const f = 14;
    shape = g({}, el('path', { d: `M${n(x)} ${n(y)}H${n(x + w - f)}L${n(x + w)} ${n(y + f)}V${n(y + h)}H${n(x)}Z`, fill, stroke, 'stroke-width': sw }),
      el('path', { d: `M${n(x + w - f)} ${n(y)}V${n(y + f)}H${n(x + w)}`, fill: 'none', stroke, 'stroke-width': sw }));
  } else if (kind === 'circle') shape = el('circle', { cx: x + w / 2, cy: y + h / 2, r: w / 2, fill, stroke, 'stroke-width': sw });
  else if (kind === 'plain') shape = '';
  else shape = el('rect', { x, y, width: w, height: h, rx: nd.radius ?? 10, fill, stroke, 'stroke-width': sw, 'stroke-dasharray': dash });
  const lh = size * 1.22, subSize = Math.max(15, size - 3), subLh = subSize * 1.25;
  const total = nd.lines.length * lh + (nd.subLines.length ? 6 + nd.subLines.length * subLh : 0);
  const cx = x + w / 2;
  let ty = y + h / 2 - total / 2 + size * 0.86;
  const out = [shape, textLines(nd.lines, { x: cx, y: ty, size, anchor: 'middle', fill: ink, weight: 600, lineHeight: 1.22 })];
  if (nd.subLines.length) out.push(textLines(nd.subLines, { x: cx, y: ty + (nd.lines.length - 1) * lh + 6 + subSize * 1.08, size: subSize, anchor: 'middle', fill: em ? t.c('onAccent') : t.c('muted'), lineHeight: 1.25 }));
  if (nd.badge) {
    const bx = x + w - 4, by = y + 4;
    out.push(el('circle', { cx: bx, cy: by, r: 12, fill: t.c('ink') }), textLines([String(nd.badge)], { x: bx, y: by, size: 13, anchor: 'middle', valign: 'middle', fill: t.c('paper'), weight: 700 }));
  }
  return g({ class: `ss-node ss-node-${kind}`, 'data-node': nd.id, ...attrs }, out);
}

// ---------------------------------------------------------------- edges

/** Path with rounded corners through orthogonal points. */
export function roundedPolyline(points, r = 10) {
  if (points.length < 3) return points.map((p, i) => `${i ? 'L' : 'M'}${n(p[0])} ${n(p[1])}`).join('');
  let d = `M${n(points[0][0])} ${n(points[0][1])}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [ax, ay] = points[i - 1], [bx, by] = points[i], [cx, cy] = points[i + 1];
    const l1 = Math.hypot(bx - ax, by - ay), l2 = Math.hypot(cx - bx, cy - by), rr = Math.min(r, l1 / 2, l2 / 2);
    const p1 = [bx - ((bx - ax) / (l1 || 1)) * rr, by - ((by - ay) / (l1 || 1)) * rr], p2 = [bx + ((cx - bx) / (l2 || 1)) * rr, by + ((cy - by) / (l2 || 1)) * rr];
    d += `L${n(p1[0])} ${n(p1[1])}Q${n(bx)} ${n(by)} ${n(p2[0])} ${n(p2[1])}`;
  }
  const last = points[points.length - 1];
  return d + `L${n(last[0])} ${n(last[1])}`;
}

/** Label pill centered at (x, y), with a paper background so lines never cut text. */
export function edgeLabel(text, x, y, ctx, { color, weight = 600, size } = {}) {
  const { t } = ctx, s = size ?? Math.max(15, ctx.size - 2);
  const lines = wrapText(text, 180, s, { weight });
  const w = blockWidth(lines, s, { weight }) + 14, h = lines.length * s * 1.2 + 8;
  return g({ class: 'ss-edge-label' }, el('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: 6, fill: t.c('paper') }),
    textLines(lines, { x, y, size: s, anchor: 'middle', valign: 'middle', fill: color || t.c('muted'), weight, lineHeight: 1.2 }));
}

function edgeStyle(e, ctx) {
  const { t, id } = ctx;
  const em = !!e.emphasis;
  return {
    stroke: em ? t.c('accent') : e.color || t.c('muted'), 'stroke-width': em ? 2.6 : 1.8, fill: 'none',
    'stroke-dasharray': e.style === 'dashed' ? '7 6' : e.style === 'dotted' ? '1.5 5' : null, 'stroke-linecap': 'round',
    'marker-end': e.arrow === false ? null : `url(#${id}-arr${em ? '-accent' : e.arrow === 'open' ? '-open' : ''})`,
    'marker-start': e.both ? `url(#${id}-arr${em ? '-accent' : ''})` : null,
  };
}

// ---------------------------------------------------------------- layered layout

function findBackEdges(ids, edges) {
  const adj = new Map(ids.map(i => [i, []]));
  edges.forEach((e, k) => { if (!e.back) adj.get(e.from).push([e.to, k]); });
  const state = new Map(), back = new Set();
  const visit = u => {
    state.set(u, 1);
    for (const [v, k] of adj.get(u)) { if (state.get(v) === 1) back.add(k); else if (!state.get(v)) visit(v); }
    state.set(u, 2);
  };
  for (const i of ids) if (!state.get(i)) visit(i);
  edges.forEach((e, k) => { if (e.back) back.add(k); });
  return back;
}

/**
 * Flow diagram with automatic layered layout (or manual positions).
 *   nodes: [{id, label, sub?, kind?, emphasis?, muted?, layer?, x?, y?, lane?}]
 *   edges: [{from, to, label?, style?, emphasis?, back?, route?: 'ortho'|'curve'|'straight'}]
 *   direction: 'lr' | 'tb'; groups: [{label, nodes:[ids], dashed?}]; lanes: [{id, label}]
 * Cycles are allowed: edges closing a cycle are drawn as feedback arcs.
 */
export function flowDiagram(o) {
  const ctx = setup(o);
  const { t, size, build } = ctx;
  const dir = o.direction || 'lr', lr = dir === 'lr';
  const nodes = o.nodes.map(nd => measureNode(nd, { size, maxWidth: o.nodeMaxWidth ?? 240, minWidth: o.nodeMinWidth ?? 120 }));
  const byId = new Map(nodes.map(nd => [nd.id, nd]));
  for (const e of o.edges) if (!byId.has(e.from) || !byId.has(e.to)) throw Error(`${o.id}: edge ${e.from} → ${e.to} references an unknown node`);
  const edges = o.edges.map((e, k) => ({ ...e, k }));
  const back = findBackEdges(nodes.map(nd => nd.id), edges);
  const forward = edges.filter(e => !back.has(e.k));
  const lanes = o.lanes || null;
  const laneLabelW = lanes ? Math.max(...lanes.map(l => measureText(l.label, size - 1, { weight: 700 }))) + 36 : 0;

  const manual = o.layout === 'manual' || nodes.every(nd => isNum(nd.x) && isNum(nd.y));
  if (!manual) {
    // 1. ranks: longest path over forward edges (or given layer)
    const rank = new Map(nodes.map(nd => [nd.id, nd.layer ?? 0]));
    for (let pass = 0; pass < nodes.length; pass++) for (const e of forward) if (byId.get(e.to).layer === undefined && rank.get(e.to) < rank.get(e.from) + 1) rank.set(e.to, rank.get(e.from) + 1);
    const layerCount = Math.max(...rank.values()) + 1;
    const layers = Array.from({ length: layerCount }, () => []);
    nodes.forEach(nd => layers[rank.get(nd.id)].push(nd));
    // 2. order: lanes fix order; otherwise barycenter sweeps reduce crossings
    const pos = new Map();
    const setPos = () => layers.forEach(L => L.forEach((nd, i) => pos.set(nd.id, i)));
    setPos();
    if (!lanes) for (let it = 0; it < 6; it++) {
      const down = it % 2 === 0;
      const seq = down ? layers.slice(1) : layers.slice(0, -1).reverse();
      for (const L of seq) {
        const bc = nd => {
          const nb = forward.filter(e => (down ? e.to === nd.id : e.from === nd.id)).map(e => pos.get(down ? e.from : e.to));
          return nb.length ? sum(nb) / nb.length : pos.get(nd.id);
        };
        L.sort((a, b) => bc(a) - bc(b) || pos.get(a.id) - pos.get(b.id));
        L.forEach((nd, i) => pos.set(nd.id, i));
      }
    }
    // 3. coordinates. Each gutter between layers is at least wide enough for the
    //    labels of edges that cross it, so edge labels never sit on a node.
    const gap = o.gap ?? (lr ? 70 : 54), cross = o.crossGap ?? (lr ? 30 : 44);
    const along = L => Math.max(...L.map(nd => (lr ? nd.w : nd.h)));
    const spans = layers.map(along);
    const usableAlong = (lr ? ctx.W - laneLabelW : ctx.H) - 8;
    const need = Array.from({ length: Math.max(0, layerCount - 1) }, () => gap);
    for (const e of forward) {
      if (!e.label) continue;
      const r0 = rank.get(e.from), r1 = rank.get(e.to);
      if (r1 !== r0 + 1) continue;
      const lines = wrapText(e.label, 180, Math.max(15, size - 2), { weight: 600 });
      const req = lr ? blockWidth(lines, Math.max(15, size - 2), { weight: 600 }) + 40 : lines.length * (Math.max(15, Math.max(15, size - 2))) * 1.2 + 30;
      need[r0] = Math.max(need[r0], req);
    }
    let gaps = [...need];
    const needA = sum(spans) + sum(gaps);
    if (needA > usableAlong) {
      // Squeeze unlabeled gutters first (down to 36), then everything proportionally.
      let deficit = needA - usableAlong;
      const plain = gaps.map((v, i) => (v === gap ? i : -1)).filter(i => i >= 0);
      const room = sum(plain.map(i => gaps[i] - 36));
      if (room > 0) { const take = Math.min(deficit, room); for (const i of plain) gaps[i] -= ((gaps[i] - 36) / room) * take; deficit -= take; }
      if (deficit > 0) { const k = (sum(gaps) - deficit) / Math.max(1, sum(gaps)); gaps = gaps.map(v => v * k); }
      if (Math.min(...gaps, Infinity) < 28) throw Error(`${o.id}: ${layerCount} layers do not fit (${Math.round(needA)} > ${Math.round(usableAlong)}). Shorten labels, use direction:'tb', or split the diagram.`);
    }
    const extraA = needA > usableAlong ? 0 : (usableAlong - needA) * (o.spread === false ? 0 : 0.5);
    const extraEach = o.spread === false ? 0 : extraA / Math.max(1, layerCount - 1);
    let a = (lr ? laneLabelW : 0) + 4 + (o.align === 'start' || layerCount === 1 ? 0 : (extraA - extraEach * (layerCount - 1)) / 2 + (needA > usableAlong ? 0 : (usableAlong - needA - extraA) / 2));
    layers.forEach((L, li) => {
      const span = spans[li];
      L.forEach(nd => { if (lr) nd.x = a + (span - nd.w) / 2; else nd.y = a + (span - nd.h) / 2; });
      a += span + (gaps[li] ?? 0) + extraEach;
    });
    const crossSize = lr ? ctx.H : ctx.W;
    if (lanes) {
      const laneH = crossSize / lanes.length;
      nodes.forEach(nd => {
        const li = lanes.findIndex(l => l.id === nd.lane);
        if (li < 0) throw Error(`${o.id}: node ${nd.id} needs a lane`);
        if (lr) nd.y = li * laneH + (laneH - nd.h) / 2; else nd.x = li * laneH + (laneH - nd.w) / 2;
      });
    } else {
      // stack each layer centered, then relax toward neighbors while keeping order and spacing
      const c = nd => (lr ? nd.y + nd.h / 2 : nd.x + nd.w / 2);
      const setC = (nd, v) => { if (lr) nd.y = v - nd.h / 2; else nd.x = v - nd.w / 2; };
      const ext = nd => (lr ? nd.h : nd.w);
      const groupOf = new Map();
      (o.groups || []).forEach((gp, gi) => gp.nodes.forEach(idv => { if (!groupOf.has(idv)) groupOf.set(idv, gi); }));
      const groupGap = (o.groups || []).length ? size + 46 : 0;
      const spacing = (p, q) => cross + (groupOf.get(p.id) !== groupOf.get(q.id) && (groupOf.has(p.id) || groupOf.has(q.id)) ? groupGap : 0);
      // keep group members contiguous within a layer
      if (groupOf.size) for (const L of layers) L.sort((a, b) => (groupOf.get(a.id) ?? -1) - (groupOf.get(b.id) ?? -1) || pos.get(a.id) - pos.get(b.id));
      for (const L of layers) {
        const total = sum(L.map(ext)) + sum(L.slice(1).map((q, i) => spacing(L[i], q)));
        if (total > crossSize - 8) throw Error(`${o.id}: a layer with ${L.length} nodes does not fit; widen the figure or change direction.`);
        let v = (crossSize - total) / 2;
        L.forEach((nd, i) => { if (i) v += spacing(L[i - 1], nd); setC(nd, v + ext(nd) / 2); v += ext(nd); });
      }
      const settle = L => {
        for (let i = 1; i < L.length; i++) { const p = L[i - 1], q = L[i]; const min = c(p) + ext(p) / 2 + spacing(p, q) + ext(q) / 2; if (c(q) < min) setC(q, min); }
        const lastNd = L[L.length - 1];
        const over = c(lastNd) + ext(lastNd) / 2 - (crossSize - 4);
        if (over > 0) for (const nd of L) setC(nd, c(nd) - over);
        for (let i = L.length - 2; i >= 0; i--) { const p = L[i], q = L[i + 1]; const max = c(q) - ext(q) / 2 - spacing(p, q) - ext(p) / 2; if (c(p) > max) setC(p, max); }
        const under = 4 - (c(L[0]) - ext(L[0]) / 2);
        if (under > 0) for (const nd of L) setC(nd, c(nd) + under);
      };
      for (let it = 0; it < 40; it++) {
        for (const L of (it % 2 ? [...layers].reverse() : layers)) {
          for (const nd of L) {
            const nb = forward.filter(e => e.to === nd.id || e.from === nd.id).map(e => byId.get(e.to === nd.id ? e.from : e.to));
            // neighbors inside the same boundary pull harder, so boundaries stay compact and separate
            const w = nb.map(m => (groupOf.get(m.id) === groupOf.get(nd.id) ? 1 : groupOf.has(nd.id) ? 0.15 : 1));
            if (nb.length && sum(w) > 0) setC(nd, c(nd) * 0.3 + (sum(nb.map((m, k) => c(m) * w[k])) / sum(w)) * 0.7);
          }
          settle(L);
        }
      }
      // Straighten chains: a node with one incoming and its source with one outgoing edge share a center line when room allows.
      const outDeg = new Map(nodes.map(nd => [nd.id, forward.filter(e => e.from === nd.id).length]));
      const inDeg = new Map(nodes.map(nd => [nd.id, forward.filter(e => e.to === nd.id).length]));
      for (let pass = 0; pass < 3; pass++) for (const e of forward) {
        const a = byId.get(e.from), b = byId.get(e.to);
        if (inDeg.get(b.id) !== 1 || outDeg.get(a.id) !== 1) continue;
        const L = layers.find(layer => layer.includes(b)), i = L.indexOf(b), want = c(a);
        const lo = i > 0 ? c(L[i - 1]) + ext(L[i - 1]) / 2 + spacing(L[i - 1], b) + ext(b) / 2 : 4 + ext(b) / 2;
        const hi = i < L.length - 1 ? c(L[i + 1]) - ext(L[i + 1]) / 2 - spacing(b, L[i + 1]) - ext(b) / 2 : crossSize - 4 - ext(b) / 2;
        if (want >= lo && want <= hi) setC(b, want);
      }
      // Separate boundaries that share a layer span: push the later boundary away along the cross axis.
      const gbox = gi => {
        const mem = nodes.filter(nd => groupOf.get(nd.id) === gi);
        if (!mem.length) return null;
        const pad = 20, top = size + 18;
        return { a0: Math.min(...mem.map(m => (lr ? m.x : m.y))), a1: Math.max(...mem.map(m => (lr ? m.x + m.w : m.y + m.h))), c0: Math.min(...mem.map(m => c(m) - ext(m) / 2)) - pad - (lr ? top : 0), c1: Math.max(...mem.map(m => c(m) + ext(m) / 2)) + pad, mem };
      };
      for (let pass = 0; pass < 4; pass++) {
        const gcount = (o.groups || []).length;
        for (let i = 0; i < gcount; i++) for (let j = i + 1; j < gcount; j++) {
          const A = gbox(i), B = gbox(j);
          if (!A || !B || A.a1 < B.a0 || B.a1 < A.a0) continue;
          const overlap = Math.min(A.c1, B.c1) - Math.max(A.c0, B.c0);
          if (overlap <= -12) continue;
          const shift = overlap + 16, down = (B.c0 + B.c1) / 2 >= (A.c0 + A.c1) / 2;
          for (const m of (down ? B : A).mem) setC(m, c(m) + (down ? shift : -shift));
        }
        layers.forEach(L => L.sort((p, q) => c(p) - c(q)));
        layers.forEach(settle);
      }
      // Center the drawing on the cross axis.
      const lo = Math.min(...nodes.map(nd => c(nd) - ext(nd) / 2)), hi = Math.max(...nodes.map(nd => c(nd) + ext(nd) / 2));
      const shift = (crossSize - (hi - lo)) / 2 - lo - (back.size ? 24 : 0) * 0;
      nodes.forEach(nd => setC(nd, c(nd) + shift));
    }
  } else {
    nodes.forEach(nd => { if (!isNum(nd.x) || !isNum(nd.y)) throw Error(`${o.id}: manual layout needs x,y for ${nd.id}`); nd.x -= nd.w / 2; nd.y -= nd.h / 2; });
  }

  const parts = [];
  // lanes
  if (lanes) {
    const laneSize = (lr ? ctx.H : ctx.W) / lanes.length;
    lanes.forEach((l, i) => {
      parts.push(el('rect', { ...(lr ? { x: 0, y: i * laneSize, width: ctx.W, height: laneSize } : { x: i * laneSize, y: 0, width: laneSize, height: ctx.H }), fill: i % 2 ? t.c('paper') : t.c('surface') }));
      if (i) parts.push(el('line', { ...(lr ? { x1: 0, x2: ctx.W, y1: i * laneSize, y2: i * laneSize } : { x1: i * laneSize, x2: i * laneSize, y1: 0, y2: ctx.H }), stroke: t.c('rule') }));
      parts.push(textLines(wrapText(l.label, laneLabelW - 26, size - 1, { weight: 700 }), lr ? { x: 16, y: i * laneSize + laneSize / 2, size: size - 1, valign: 'middle', fill: t.c('muted'), weight: 700 } : { x: i * laneSize + laneSize / 2, y: 14, size: size - 1, anchor: 'middle', valign: 'top', fill: t.c('muted'), weight: 700 }));
    });
  }
  // groups (boundaries)
  for (const gp of o.groups || []) {
    const mem = gp.nodes.map(i => byId.get(i)).filter(Boolean);
    if (!mem.length) continue;
    const pad = gp.pad ?? 20, top = size + 18;
    const x0 = Math.min(...mem.map(m => m.x)) - pad, y0 = Math.min(...mem.map(m => m.y)) - pad - top, x1 = Math.max(...mem.map(m => m.x + m.w)) + pad, y1 = Math.max(...mem.map(m => m.y + m.h)) + pad;
    parts.push(g({ class: 'ss-group' }, el('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, rx: 14, fill: gp.dashed ? 'none' : t.c('paper'), stroke: gp.emphasis ? t.c('accent') : t.c('rule'), 'stroke-width': 1.6, 'stroke-dasharray': gp.dashed ? '7 6' : null }),
      textLines([gp.label], { x: x0 + 14, y: y0 + 12, size: Math.max(15, size - 2), valign: 'top', fill: gp.emphasis ? t.c('accent') : t.c('muted'), weight: 700 })));
  }
  // edges
  const order = topoOrder(nodes, forward);
  const stepOf = new Map(order.map((idv, i) => [idv, i]));
  const edgeParts = [], labelParts = [];
  const maxBottom = Math.max(...nodes.map(nd => nd.y + nd.h)), maxRight = Math.max(...nodes.map(nd => nd.x + nd.w));
  let backSlot = 0;
  for (const e of edges) {
    const a = byId.get(e.from), b = byId.get(e.to);
    const st = edgeStyle(e, ctx);
    let pts, mid;
    const route = e.route || o.route || 'ortho';
    if (back.has(e.k) && !manual) {
      backSlot++;
      const off = 26 + backSlot * 16;
      if (lr) {
        const p = sidePort(a, 'bottom'), q = sidePort(b, 'bottom', 2);
        const yy = maxBottom + off;
        pts = [p, [p[0], yy], [q[0], yy], [q[0], q[1] + 8]];
        mid = [(p[0] + q[0]) / 2, yy];
      } else {
        const p = sidePort(a, 'right'), q = sidePort(b, 'right', 2);
        const xx = maxRight + off;
        pts = [p, [xx, p[1]], [xx, q[1]], [q[0] + 8, q[1]]];
        mid = [xx, (p[1] + q[1]) / 2];
      }
      edgeParts.push(el('path', { d: roundedPolyline(pts, 12), ...st, 'stroke-dasharray': st['stroke-dasharray'] || '7 6', pathLength: build ? 1 : null, ...buildAttrs(build, { i: stepOf.get(e.from) ?? 0, motion: 'draw', delay: 200 }) }));
    } else {
      const fromSide = e.fromSide || (manual ? autoSide(a, b) : lr ? 'right' : 'bottom');
      const toSide = e.toSide || (manual ? autoSide(b, a) : lr ? 'left' : 'top');
      const p = sidePort(a, fromSide), q = sidePort(b, toSide, 3);
      if (route === 'straight' || (Math.abs(p[1] - q[1]) < 2 && (fromSide === 'right' || fromSide === 'left')) || (Math.abs(p[0] - q[0]) < 2 && (fromSide === 'top' || fromSide === 'bottom'))) {
        const pa = route === 'straight' && manual ? boxPort(a, b.x + b.w / 2, b.y + b.h / 2) : p;
        const pb = route === 'straight' && manual ? boxPort(b, a.x + a.w / 2, a.y + a.h / 2, 3) : q;
        pts = [pa, pb];
      } else if (route === 'curve') {
        pts = null;
        const horiz = fromSide === 'right' || fromSide === 'left';
        const dx = (q[0] - p[0]) * 0.5, dy = (q[1] - p[1]) * 0.5;
        const d = horiz ? `M${n(p[0])} ${n(p[1])}C${n(p[0] + dx)} ${n(p[1])} ${n(q[0] - dx)} ${n(q[1])} ${n(q[0])} ${n(q[1])}` : `M${n(p[0])} ${n(p[1])}C${n(p[0])} ${n(p[1] + dy)} ${n(q[0])} ${n(q[1] - dy)} ${n(q[0])} ${n(q[1])}`;
        edgeParts.push(el('path', { d, ...st, pathLength: build ? 1 : null, ...buildAttrs(build, { i: stepOf.get(e.to) ?? 0, motion: 'draw' }) }));
        mid = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
      } else {
        const horiz = fromSide === 'right' || fromSide === 'left';
        if (horiz && (toSide === 'left' || toSide === 'right')) {
          const mx = e.via ?? (p[0] + q[0]) / 2; pts = [p, [mx, p[1]], [mx, q[1]], q];
          // Label in the gutter: on the target's row, so a branch label sits next to the branch it names.
          if (!isNum(e.labelPos)) mid = [mx, Math.abs(q[1] - p[1]) > size * 1.6 ? q[1] : (p[1] + q[1]) / 2];
        } else if (!horiz && (toSide === 'top' || toSide === 'bottom')) {
          const my = e.via ?? (p[1] + q[1]) / 2; pts = [p, [p[0], my], [q[0], my], q];
          if (!isNum(e.labelPos)) mid = [Math.abs(q[0] - p[0]) > 60 ? q[0] : (p[0] + q[0]) / 2, my];
        }
        else if (horiz) pts = [p, [q[0], p[1]], q];
        else pts = [p, [p[0], q[1]], q];
      }
      if (pts) {
        edgeParts.push(el('path', { d: roundedPolyline(pts, 12), ...st, pathLength: build ? 1 : null, ...buildAttrs(build, { i: stepOf.get(e.to) ?? 0, motion: 'draw' }) }));
        if (!mid) mid = longestSegmentMid(pts, e.labelPos);
      }
    }
    if (e.label) labelParts.push(g({ ...buildAttrs(build, { i: stepOf.get(e.to) ?? 0, label: true }) }, edgeLabel(e.label, mid[0], mid[1], ctx, { color: e.emphasis ? t.c('accent') : null })));
  }
  parts.push(g({ class: 'ss-edges' }, edgeParts));
  nodes.forEach(nd => parts.push(drawNode(nd, ctx, buildAttrs(build, { i: stepOf.get(nd.id) ?? 0, motion: 'settle' }))));
  parts.push(g({ class: 'ss-edge-labels' }, labelParts));
  if (back.size && !manual) {
    const needed = lr ? maxBottom + 26 + back.size * 16 + 14 : maxRight + 26 + back.size * 16 + 14;
    if (lr && needed > ctx.H) ctx.H = needed;
    if (!lr && needed > ctx.W) ctx.W = needed;
  }
  ctx.nodes = Object.fromEntries(nodes.map(nd => [nd.id, { x: nd.x, y: nd.y, w: nd.w, h: nd.h }]));
  return root(o, ctx, markers(ctx), parts);
}
function autoSide(a, b) {
  const dx = b.x + b.w / 2 - (a.x + a.w / 2), dy = b.y + b.h / 2 - (a.y + a.h / 2);
  return Math.abs(dx) * (a.h / a.w) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'bottom' : 'top';
}
function longestSegmentMid(pts, pos) {
  if (isNum(pos)) {
    const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), total = sum(lens);
    let acc = 0;
    for (let i = 0; i < lens.length; i++) { if (acc + lens[i] >= total * pos) { const f = (total * pos - acc) / (lens[i] || 1); return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]; } acc += lens[i]; }
  }
  let best = 0, at = [pts[0][0], pts[0][1]];
  for (let i = 1; i < pts.length; i++) {
    const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (L > best) { best = L; at = [(pts[i][0] + pts[i - 1][0]) / 2, (pts[i][1] + pts[i - 1][1]) / 2]; }
  }
  return at;
}
function topoOrder(nodes, edges) {
  const indeg = new Map(nodes.map(nd => [nd.id, 0]));
  for (const e of edges) indeg.set(e.to, indeg.get(e.to) + 1);
  const q = nodes.filter(nd => !indeg.get(nd.id)).map(nd => nd.id), out = [];
  while (q.length) { const u = q.shift(); out.push(u); for (const e of edges) if (e.from === u) { indeg.set(e.to, indeg.get(e.to) - 1); if (!indeg.get(e.to)) q.push(e.to); } }
  for (const nd of nodes) if (!out.includes(nd.id)) out.push(nd.id);
  return out;
}

// ---------------------------------------------------------------- trees

/**
 * Tree (decision tree, issue tree, hierarchy). root: {label, sub?, kind?, emphasis?, edgeLabel?, children:[…]}.
 * direction 'tb' (default) or 'lr'. Leaves are spaced evenly; parents center over children.
 */
export function treeDiagram(o) {
  const ctx = setup(o);
  const { t, size, build } = ctx;
  const lr = o.direction === 'lr';
  let counter = 0;
  const prep = (nd, depth, parent) => {
    const m = measureNode({ id: `${ctx.id}-n${counter++}`, ...nd, kind: nd.kind || (nd.children?.length ? 'process' : 'process') }, { size, maxWidth: o.nodeMaxWidth ?? 220, minWidth: o.nodeMinWidth ?? 96 });
    m.depth = depth; m.parent = parent; m.kids = (nd.children || []).map(c => prep(c, depth + 1, m));
    return m;
  };
  const rootNd = prep(o.root, 0, null);
  const all = []; const walk = nd => { all.push(nd); nd.kids.forEach(walk); }; walk(rootNd);
  const depthCount = Math.max(...all.map(nd => nd.depth)) + 1;
  const leaves = all.filter(nd => !nd.kids.length);
  const crossOf = nd => (lr ? nd.h : nd.w), alongOf = nd => (lr ? nd.w : nd.h);
  const crossTotal = lr ? ctx.H : ctx.W, alongTotal = lr ? ctx.W : ctx.H;
  const gapC = o.siblingGap ?? 18;
  const need = sum(leaves.map(crossOf)) + gapC * (leaves.length - 1);
  if (need > crossTotal) throw Error(`${o.id}: ${leaves.length} leaves need ${Math.round(need)}px; widen the figure, shorten labels or switch direction.`);
  // leaf positions (cross axis centers)
  let v = (crossTotal - need) / 2;
  for (const lf of leaves) { lf.c = v + crossOf(lf) / 2; v += crossOf(lf) + gapC; }
  const place = nd => { if (nd.kids.length) { nd.kids.forEach(place); nd.c = (nd.kids[0].c + nd.kids.at(-1).c) / 2; } };
  place(rootNd);
  const depthSpan = Array.from({ length: depthCount }, (_, d) => Math.max(...all.filter(nd => nd.depth === d).map(alongOf)));
  const gapA = Math.max(36, (alongTotal - sum(depthSpan)) / Math.max(1, depthCount - 1));
  const starts = []; let a = 0;
  for (let d = 0; d < depthCount; d++) { starts.push(a); a += depthSpan[d] + Math.min(gapA, o.levelGap ?? 120); }
  const offsetA = (alongTotal - (a - Math.min(gapA, o.levelGap ?? 120))) / 2;
  for (const nd of all) {
    const along = offsetA + starts[nd.depth] + (lr && o.align !== 'center' ? 0 : (depthSpan[nd.depth] - alongOf(nd)) / 2);
    if (lr) { nd.x = along; nd.y = nd.c - nd.h / 2; } else { nd.y = along; nd.x = nd.c - nd.w / 2; }
  }
  const parts = [];
  const order = [...all].sort((p, q) => p.depth - q.depth);
  for (const nd of all) for (const kid of nd.kids) {
    const p = lr ? sidePort(nd, 'right') : sidePort(nd, 'bottom'), q = lr ? sidePort(kid, 'left', 3) : sidePort(kid, 'top', 3);
    const midA = lr ? (p[0] + q[0]) / 2 : (p[1] + q[1]) / 2;
    const pts = lr ? [p, [midA, p[1]], [midA, q[1]], q] : [p, [p[0], midA], [q[0], midA], q];
    const em = !!kid.emphasis || !!kid.edgeEmphasis;
    parts.push(el('path', { d: o.curve ? (lr ? `M${n(p[0])} ${n(p[1])}C${n(midA)} ${n(p[1])} ${n(midA)} ${n(q[1])} ${n(q[0])} ${n(q[1])}` : `M${n(p[0])} ${n(p[1])}C${n(p[0])} ${n(midA)} ${n(q[0])} ${n(midA)} ${n(q[0])} ${n(q[1])}`) : roundedPolyline(pts, 10), ...edgeStyle({ emphasis: em, arrow: o.arrows === false ? false : undefined }, ctx), pathLength: build ? 1 : null, ...buildAttrs(build, { i: order.indexOf(kid), motion: 'draw' }) }));
    if (kid.edgeLabel) {
      const f = o.labelPos ?? 0.5; // position along the last leg of the elbow (0 = bend, 1 = child)
      const lx = lr ? midA + (q[0] - midA) * f : q[0], ly = lr ? q[1] : midA + (q[1] - midA) * f;
      parts.push(g({ ...buildAttrs(build, { i: order.indexOf(kid), label: true }) }, edgeLabel(kid.edgeLabel, lx, ly, ctx, { color: em ? t.c('accent') : t.c('ink') })));
    }
  }
  for (const nd of all) parts.push(drawNode(nd, ctx, buildAttrs(build, { i: order.indexOf(nd), motion: 'settle' })));
  return root(o, ctx, markers(ctx), parts);
}

// ---------------------------------------------------------------- sequence

/**
 * Sequence diagram. actors: [{id, label, sub?}]; messages: [{from, to, label,
 * kind: 'sync'|'reply'|'async'|'self', emphasis?, note?}]. Time runs downward.
 */
export function sequenceDiagram(o) {
  const ctx = setup(o);
  const { t, size, build } = ctx;
  // Actors may be {id, label, sub} objects or plain names.
  const actors = o.actors.map(a => measureNode({ ...(typeof a === 'string' ? { id: a, label: a } : a), kind: 'process' }, { size, maxWidth: 200, minWidth: 120 }));
  const col = new Map();
  const left = actors[0].w / 2 + 6, right = ctx.W - actors.at(-1).w / 2 - 6;
  actors.forEach((a, i) => { const cx = left + (i / Math.max(1, actors.length - 1)) * (right - left); col.set(a.id, cx); a.x = cx - a.w / 2; a.y = 0; });
  const headH = Math.max(...actors.map(a => a.h));
  const rowH = o.rowHeight ?? Math.max(46, (ctx.H - headH - 30) / (o.messages.length + 0.6));
  const parts = [];
  actors.forEach(a => parts.push(el('line', { x1: col.get(a.id), x2: col.get(a.id), y1: headH, y2: ctx.H - 4, stroke: t.c('rule'), 'stroke-width': 1.6, 'stroke-dasharray': '4 6' })));
  for (const act of o.activations || []) {
    const x = col.get(act.actor), y0 = headH + 24 + act.from * rowH - 10, y1 = headH + 24 + act.to * rowH + 10;
    parts.push(el('rect', { x: x - 7, y: y0, width: 14, height: y1 - y0, rx: 3, fill: t.c('surface'), stroke: t.c('rule') }));
  }
  actors.forEach(a => parts.push(drawNode({ ...a, h: headH }, ctx)));
  o.messages.forEach((m, k) => {
    const y = headH + 24 + (k + 0.5) * rowH;
    const x0 = col.get(m.from), x1 = col.get(m.to);
    if (x0 === undefined || x1 === undefined) throw Error(`${o.id}: message ${k} references an unknown actor`);
    const kind = m.kind || (m.from === m.to ? 'self' : 'sync');
    const st = edgeStyle({ emphasis: m.emphasis, style: kind === 'reply' ? 'dashed' : null, arrow: kind === 'async' || kind === 'reply' ? 'open' : undefined }, ctx);
    const items = [];
    if (kind === 'self') {
      items.push(el('path', { d: `M${n(x0 + 8)} ${n(y - 10)}H${n(x0 + 56)}V${n(y + 12)}H${n(x0 + 12)}`, ...st }));
      items.push(textLines(wrapText(m.label, 260, Math.max(15, size - 2)), { x: x0 + 66, y: y, size: Math.max(15, size - 2), valign: 'middle', fill: m.emphasis ? t.c('accent') : t.c('ink'), weight: 600 }));
    } else {
      const dirn = Math.sign(x1 - x0);
      items.push(el('line', { x1: x0 + dirn * 8, x2: x1 - dirn * 10, y1: y, y2: y, ...st }));
      items.push(textLines(wrapText(m.label, Math.abs(x1 - x0) - 30, Math.max(15, size - 2)), { x: (x0 + x1) / 2, y: y - 9, size: Math.max(15, size - 2), anchor: 'middle', valign: 'bottom', fill: m.emphasis ? t.c('accent') : kind === 'reply' ? t.c('muted') : t.c('ink'), weight: 600 }));
    }
    if (m.note) items.push(textLines(wrapText(m.note, 220, Math.max(15, size - 3)), { x: Math.max(x0, x1) + 16, y: y + 4, size: Math.max(15, size - 3), valign: 'top', fill: t.c('muted'), italic: true }));
    if (m.number !== false && o.numbered) items.push(el('circle', { cx: Math.min(x0, x1) - 18, cy: y, r: 11, fill: t.c('ink') }), textLines([String(k + 1)], { x: Math.min(x0, x1) - 18, y, size: 13, anchor: 'middle', valign: 'middle', fill: t.c('paper'), weight: 700 }));
    parts.push(g({ class: 'ss-msg', ...buildAttrs(build, { i: k, motion: 'reveal' }) }, items));
  });
  return root(o, ctx, markers(ctx), parts);
}

// ---------------------------------------------------------------- networks

/**
 * Network diagram. nodes: [{id, label, group?, size?}], edges: [[a, b] | {from, to, weight}].
 * layout: 'ring' | 'star' (center = first node or o.center) | 'grid' | 'force' (seeded, deterministic) | 'manual' (x,y in 0..1).
 */
export function networkDiagram(o) {
  const ctx = setup(o);
  const { t, size, build } = ctx;
  const nodes = o.nodes.map(nd => ({ ...nd }));
  const byId = new Map(nodes.map(nd => [nd.id, nd]));
  const edges = o.edges.map(e => (Array.isArray(e) ? { from: e[0], to: e[1] } : e));
  for (const e of edges) if (!byId.has(e.from) || !byId.has(e.to)) throw Error(`${o.id}: edge ${e.from}-${e.to} references an unknown node`);
  const pad = o.padding ?? 70, cx = ctx.W / 2, cy = ctx.H / 2, R = Math.min(ctx.W, ctx.H) / 2 - pad;
  const layout = o.layout || 'force';
  if (layout === 'ring') nodes.forEach((nd, i) => { const a = -Math.PI / 2 + (i / nodes.length) * 2 * Math.PI; [nd.x, nd.y] = polar(cx, cy, R, a); });
  else if (layout === 'star') {
    const center = byId.get(o.center) || nodes[0];
    center.x = cx; center.y = cy;
    const rest = nodes.filter(nd => nd !== center);
    rest.forEach((nd, i) => { const a = -Math.PI / 2 + (i / rest.length) * 2 * Math.PI; [nd.x, nd.y] = polar(cx, cy, R, a); });
  } else if (layout === 'grid') {
    const cols = o.cols ?? Math.ceil(Math.sqrt(nodes.length)), rows = Math.ceil(nodes.length / cols);
    nodes.forEach((nd, i) => { nd.x = pad + ((i % cols) + 0.5) * ((ctx.W - 2 * pad) / cols); nd.y = pad * 0.6 + (Math.floor(i / cols) + 0.5) * ((ctx.H - 1.2 * pad) / rows); });
  } else if (layout === 'manual') nodes.forEach(nd => { nd.x = pad + nd.x * (ctx.W - 2 * pad); nd.y = pad + nd.y * (ctx.H - 2 * pad); });
  else {
    const rand = rng(o.seed ?? 7), k = Math.sqrt(((ctx.W - 2 * pad) * (ctx.H - 2 * pad)) / nodes.length) * 0.75;
    nodes.forEach((nd, i) => { const a = (i / nodes.length) * 2 * Math.PI; nd.x = cx + Math.cos(a) * R * 0.5 + (rand() - 0.5) * 10; nd.y = cy + Math.sin(a) * R * 0.5 + (rand() - 0.5) * 10; });
    for (let it = 0; it < 400; it++) {
      const temp = (1 - it / 400) * 30 + 0.5;
      for (const a of nodes) { a.dx = 0; a.dy = 0; }
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.max(1, Math.hypot(dx, dy)), f = (k * k) / d;
        a.dx += (dx / d) * f; a.dy += (dy / d) * f; b.dx -= (dx / d) * f; b.dy -= (dy / d) * f;
      }
      for (const e of edges) {
        const a = byId.get(e.from), b = byId.get(e.to), dx = a.x - b.x, dy = a.y - b.y, d = Math.max(1, Math.hypot(dx, dy)), f = (d * d) / k;
        a.dx -= (dx / d) * f; a.dy -= (dy / d) * f; b.dx += (dx / d) * f; b.dy += (dy / d) * f;
      }
      for (const a of nodes) {
        const d = Math.max(1e-9, Math.hypot(a.dx, a.dy));
        a.x += (a.dx / d) * Math.min(d, temp); a.y += (a.dy / d) * Math.min(d, temp);
        a.x += (cx - a.x) * 0.01; a.y += (cy - a.y) * 0.01;
      }
    }
    // fit into box
    const xs = nodes.map(nd => nd.x), ys = nodes.map(nd => nd.y);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const s = Math.min((ctx.W - 2 * pad) / Math.max(1, x1 - x0), (ctx.H - 2 * pad) / Math.max(1, y1 - y0));
    nodes.forEach(nd => { nd.x = cx + (nd.x - (x0 + x1) / 2) * s; nd.y = cy + (nd.y - (y0 + y1) / 2) * s; });
  }
  const groups = [...new Set(nodes.map(nd => nd.group).filter(v => v != null))];
  const deg = new Map(nodes.map(nd => [nd.id, 0]));
  for (const e of edges) { deg.set(e.from, deg.get(e.from) + 1); deg.set(e.to, deg.get(e.to) + 1); }
  const maxW = Math.max(1, ...edges.map(e => e.weight ?? 1));
  const parts = [];
  edges.forEach((e, k) => {
    const a = byId.get(e.from), b = byId.get(e.to);
    const hl = o.highlight != null && (isHighlighted(o.highlight, a, 'id') && isHighlighted(o.highlight, b, 'id'));
    parts.push(el('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: hl ? t.c('accent') : (o.edgeColor ?? t.c('muted')), 'stroke-opacity': hl || o.edgeColor ? null : 0.55, 'stroke-width': 1.4 + 3 * ((e.weight ?? 1) / maxW) * (o.weighted ? 1 : 0) + (hl ? 1.2 : 0), 'stroke-linecap': 'round', ...buildAttrs(build && { ...build, start: build.start + 1 }, { i: k, motion: 'draw' }), pathLength: build ? 1 : null }));
  });
  nodes.forEach((nd, k) => {
    const r = nd.size ?? (o.sizeByDegree ? 9 + 3 * Math.sqrt(deg.get(nd.id)) : 13);
    const hl = isHighlighted(o.highlight, nd, 'id');
    const fill = nd.color || (o.highlight != null ? (hl ? t.c('highlight') : t.c('context')) : groups.length ? t.cat(groups.indexOf(nd.group)) : t.c('ink'));
    const ang = Math.atan2(nd.y - cy, nd.x - cx), lx = nd.x + Math.cos(ang) * (r + 10), ly = nd.y + Math.sin(ang) * (r + 10);
    const anchor = Math.abs(Math.cos(ang)) < 0.35 ? 'middle' : Math.cos(ang) > 0 ? 'start' : 'end';
    const centerish = Math.hypot(nd.x - cx, nd.y - cy) < 30;
    parts.push(g({ class: 'ss-net-node', ...buildAttrs(build, { i: k, motion: 'settle' }) },
      el('circle', { cx: nd.x, cy: nd.y, r, fill, stroke: t.c('paper'), 'stroke-width': 3 }),
      nd.label ? textLines([nd.label], { x: centerish ? nd.x : lx, y: centerish ? nd.y + r + 8 : ly, size: size - 1, anchor: centerish ? 'middle' : anchor, valign: centerish ? 'top' : Math.sin(ang) > 0.35 ? 'top' : Math.sin(ang) < -0.35 ? 'bottom' : 'middle', fill: t.c('ink'), weight: hl ? 700 : 600, halo: t.c('paper') }) : ''));
  });
  ctx.nodes = Object.fromEntries(nodes.map(nd => [nd.id, { x: nd.x, y: nd.y }]));
  return root(o, ctx, '', parts);
}

// ---------------------------------------------------------------- matrices & cycles

/**
 * 2×2 / quadrant chart. x and y: {title, low, high}; quadrants: [tl, tr, bl, br]
 * as {title, body?}; items: [{label, x, y}] in 0..1 (positions are judgments —
 * say so in desc). highlightQuadrant: 0..3.
 */
export function quadrantChart(o) {
  const ctx = setup(o, { width: 900, height: 600 });
  const { t, size, build } = ctx;
  const small = Math.max(15, size - 3);
  const m = { left: 54, right: 12, top: 12, bottom: 54 };
  const bx = m.left, by = m.top, bw = ctx.W - m.left - m.right, bh = ctx.H - m.top - m.bottom;
  const parts = [], occupied = [];
  const qs = o.quadrants || [];
  // One field divided by two hairlines; a highlighted quadrant gets a light accent tint.
  parts.push(el('rect', { x: bx, y: by, width: bw, height: bh, fill: t.c('surface') }));
  [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([qx, qy], i) => {
    const x0 = bx + (qx * bw) / 2, y0 = by + (qy * bh) / 2;
    if (o.highlightQuadrant === i) parts.push(el('rect', { x: x0, y: y0, width: bw / 2, height: bh / 2, fill: t.c('accent'), 'fill-opacity': 0.1 }));
    const q = qs[i];
    if (!q) return;
    // Quadrant names sit in the outer corner, away from the centre where items cluster.
    const right = qx === 1, bottom = qy === 1, inner = bw / 2 - 40;
    const title = wrapText(q.title, inner, size, { weight: 700 }), body = q.body ? wrapText(q.body, inner, small) : [];
    const blockH = title.length * size * 1.25 + (body.length ? 4 + body.length * small * 1.3 : 0);
    const tx = right ? x0 + bw / 2 - 18 : x0 + 18, ty = bottom ? y0 + bh / 2 - 16 - blockH : y0 + 16;
    const anchor = right ? 'end' : 'start';
    parts.push(textLines(title, { x: tx, y: ty, size, valign: 'top', anchor, fill: o.highlightQuadrant === i ? t.c('accent') : t.c('ink'), weight: 700 }));
    if (body.length) parts.push(textLines(body, { x: tx, y: ty + title.length * size * 1.25 + 4, size: small, valign: 'top', anchor, fill: t.c('muted'), lineHeight: 1.3 }));
    const w = Math.max(blockWidth(title, size, { weight: 700 }), blockWidth(body, small));
    occupied.push({ x: right ? tx - w : tx, y: ty, w, h: blockH });
  });
  parts.push(el('line', { x1: bx + bw / 2, x2: bx + bw / 2, y1: by, y2: by + bh, stroke: t.c('paper'), 'stroke-width': 3 }));
  parts.push(el('line', { x1: bx, x2: bx + bw, y1: by + bh / 2, y2: by + bh / 2, stroke: t.c('paper'), 'stroke-width': 3 }));
  const ax = o.x || {}, ay = o.y || {};
  parts.push(el('line', { x1: bx, x2: bx + bw, y1: by + bh + 14, y2: by + bh + 14, stroke: t.c('ink'), 'stroke-width': 1.5, 'marker-end': `url(#${ctx.id}-arr-ink)` }));
  parts.push(el('line', { x1: bx - 14, x2: bx - 14, y1: by + bh, y2: by, stroke: t.c('ink'), 'stroke-width': 1.5, 'marker-end': `url(#${ctx.id}-arr-ink)` }));
  if (ax.low) parts.push(textLines([ax.low], { x: bx, y: by + bh + 26, size: small, valign: 'top', fill: t.c('muted') }));
  if (ax.high) parts.push(textLines([ax.high], { x: bx + bw - 16, y: by + bh + 26, size: small, anchor: 'end', valign: 'top', fill: t.c('muted') }));
  if (ax.title) parts.push(textLines([ax.title], { x: bx + bw / 2, y: by + bh + 26, size: size - 1, anchor: 'middle', valign: 'top', fill: t.c('ink'), weight: 700 }));
  const ayx = bx - 26;
  if (ay.title) parts.push(textLines([ay.title], { x: ayx, y: by + bh / 2, size: size - 1, anchor: 'middle', valign: 'middle', fill: t.c('ink'), weight: 700, attrs: { transform: `rotate(-90 ${n(ayx)} ${n(by + bh / 2)})` } }));
  if (ay.low) parts.push(textLines([ay.low], { x: ayx, y: by + bh, size: small, anchor: 'start', valign: 'middle', fill: t.c('muted'), attrs: { transform: `rotate(-90 ${n(ayx)} ${n(by + bh)})` } }));
  if (ay.high) parts.push(textLines([ay.high], { x: ayx, y: by + 16, size: small, anchor: 'end', valign: 'middle', fill: t.c('muted'), attrs: { transform: `rotate(-90 ${n(ayx)} ${n(by + 16)})` } }));
  // Items: place each label on the first side (right, left, above, below) that collides
  // with no quadrant text, no other label and no point, and stays inside the field.
  const items = (o.items || []).map(it => ({ it, px: bx + 24 + it.x * (bw - 48), py: by + bh - 24 - it.y * (bh - 48) }));
  for (const { px, py } of items) occupied.push({ x: px - 11, y: py - 11, w: 22, h: 22 });
  const hit = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  const labelSize = Math.max(15, size - 2);
  items.forEach(({ it, px, py }, k) => {
    const hl = it.highlight ?? isHighlighted(o.highlight, it);
    const w = measureText(it.label, labelSize, { weight: hl ? 700 : 600 }), h = labelSize * 1.3;
    const sides = it.labelLeft ? ['left', 'right', 'above', 'below'] : ['right', 'left', 'above', 'below'];
    const box = side => side === 'right' ? { x: px + 16, y: py - h / 2, w, h } : side === 'left' ? { x: px - 16 - w, y: py - h / 2, w, h }
      : side === 'above' ? { x: px - w / 2, y: py - 14 - h, w, h } : { x: px - w / 2, y: py + 14, w, h };
    const inside = b => b.x >= bx + 4 && b.x + b.w <= bx + bw - 4 && b.y >= by + 2 && b.y + b.h <= by + bh - 2;
    const side = sides.find(sd => { const b = box(sd); return inside(b) && !occupied.some(o2 => hit(b, o2)); }) ?? sides.find(sd => inside(box(sd))) ?? sides[0];
    const b = box(side);
    occupied.push(b);
    const anchor = side === 'right' ? 'start' : side === 'left' ? 'end' : 'middle';
    const lx = side === 'right' ? b.x : side === 'left' ? b.x + w : px;
    parts.push(g({ class: 'ss-item', ...buildAttrs(build, { i: k, motion: 'settle' }) },
      el('circle', { cx: px, cy: py, r: hl ? 11 : 9, fill: hl ? t.c('accent') : t.c('ink'), stroke: t.c('paper'), 'stroke-width': 2.5 }),
      textLines([it.label], { x: lx, y: b.y + h / 2, size: labelSize, anchor, valign: 'middle', fill: hl ? t.c('accent') : t.c('ink'), weight: hl ? 700 : 600 })));
  });
  return root(o, ctx, markers(ctx), parts);
}

/** Cycle diagram: steps arranged on a circle with arrows between consecutive steps. */
export function cycleDiagram(o) {
  const ctx = setup(o, { width: 760, height: 560 });
  const { t, size, build } = ctx;
  const steps = o.steps.map((s, i) => measureNode({ id: `s${i}`, ...s }, { size, maxWidth: o.nodeMaxWidth ?? 200, minWidth: 120 }));
  const cx = ctx.W / 2, cy = ctx.H / 2;
  const R = Math.min(ctx.W - Math.max(...steps.map(s => s.w)), ctx.H - Math.max(...steps.map(s => s.h))) / 2 - 6;
  steps.forEach((s, i) => { const a = -Math.PI / 2 + (i / steps.length) * 2 * Math.PI; s.a = a; s.x = cx + Math.cos(a) * R - s.w / 2; s.y = cy + Math.sin(a) * R - s.h / 2; });
  const parts = [];
  steps.forEach((s, i) => {
    const nx = steps[(i + 1) % steps.length];
    // arc between the two boxes along the circle
    const a0 = s.a, a1 = nx.a + (i === steps.length - 1 ? 2 * Math.PI : 0);
    const pad0 = Math.atan2(Math.hypot(s.w, s.h) / 2 + 4, R), pad1 = Math.atan2(Math.hypot(nx.w, nx.h) / 2 + 10, R);
    const s0 = a0 + pad0 * 0.85, s1 = a1 - pad1 * 0.85;
    if (s1 <= s0) return;
    const [x0, y0] = polar(cx, cy, R, s0), [x1, y1] = polar(cx, cy, R, s1);
    parts.push(el('path', { d: `M${n(x0)} ${n(y0)}A${n(R)} ${n(R)} 0 0 1 ${n(x1)} ${n(y1)}`, ...edgeStyle({ emphasis: o.steps[i].emphasisOut }, ctx), pathLength: build ? 1 : null, ...buildAttrs(build, { i: i + 1, motion: 'draw' }) }));
  });
  steps.forEach((s, i) => parts.push(drawNode(s, ctx, buildAttrs(build, { i, motion: 'settle' }))));
  if (o.center) {
    const lines = wrapText(o.center.label, R * 1.1, size + 2, { weight: 700 });
    parts.push(textLines(lines, { x: cx, y: cy, size: size + 2, anchor: 'middle', valign: 'middle', fill: t.c('ink'), weight: 700 }));
    if (o.center.sub) parts.push(textLines(wrapText(o.center.sub, R * 1.1, Math.max(15, size - 2)), { x: cx, y: cy + lines.length * (size + 2) * 0.7 + 14, size: Math.max(15, size - 2), anchor: 'middle', valign: 'top', fill: t.c('muted') }));
  }
  return root(o, ctx, markers(ctx), parts);
}

/**
 * Bipartite relations: left set ↔ right set. left/right: [{id, label}], links:
 * [{from, to, weight?, emphasis?}]. Two kinds of entities stay in separate columns.
 */
export function bipartiteDiagram(o) {
  const ctx = setup(o);
  const { t, size, build } = ctx;
  const L = o.left.map(nd => measureNode({ ...asNode(nd), kind: 'process' }, { size, maxWidth: o.nodeMaxWidth ?? 230, minWidth: 150 }));
  const R = o.right.map(nd => measureNode({ ...asNode(nd), kind: 'process' }, { size, maxWidth: o.nodeMaxWidth ?? 230, minWidth: 150 }));
  const links = o.links.map(asLink);
  const top = o.leftTitle || o.rightTitle ? size + 22 : 4;
  const stack = (list, x) => {
    const total = sum(list.map(nd => nd.h)), gap = Math.min(28, (ctx.H - top - total) / Math.max(1, list.length - 1));
    let y = top + (ctx.H - top - (total + gap * (list.length - 1))) / 2;
    list.forEach(nd => { nd.x = x === 'left' ? 2 : ctx.W - nd.w - 2; nd.y = y; y += nd.h + gap; });
  };
  stack(L, 'left'); stack(R, 'right');
  const byId = new Map([...L, ...R].map(nd => [nd.id, nd]));
  const parts = [];
  if (o.leftTitle) parts.push(textLines([o.leftTitle], { x: 2, y: 4, size: size - 1, valign: 'top', fill: t.c('muted'), weight: 700 }));
  if (o.rightTitle) parts.push(textLines([o.rightTitle], { x: ctx.W - 2, y: 4, size: size - 1, anchor: 'end', valign: 'top', fill: t.c('muted'), weight: 700 }));
  const maxW = Math.max(1, ...links.map(l => l.weight ?? 1));
  links.forEach((l, k) => {
    const a = byId.get(l.from), b = byId.get(l.to);
    if (!a || !b) throw Error(`${o.id}: link ${l.from}→${l.to} references an unknown node`);
    const p = sidePort(a, 'right'), q = sidePort(b, 'left', 3), mx = (p[0] + q[0]) / 2;
    parts.push(el('path', { d: `M${n(p[0])} ${n(p[1])}C${n(mx)} ${n(p[1])} ${n(mx)} ${n(q[1])} ${n(q[0])} ${n(q[1])}`, fill: 'none', stroke: l.emphasis ? t.c('accent') : (o.edgeColor ?? t.c('muted')), 'stroke-opacity': l.emphasis || o.edgeColor ? null : 0.55, 'stroke-width': 1.6 + (o.weighted ? 4 * ((l.weight ?? 1) / maxW) : 0) + (l.emphasis ? 1 : 0), 'stroke-linecap': 'round', pathLength: build ? 1 : null, ...buildAttrs(build, { i: k, motion: 'draw' }) }));
  });
  [...L, ...R].forEach(nd => parts.push(drawNode(nd, ctx)));
  return root(o, ctx, markers(ctx), parts);
}

/**
 * Architecture layers: horizontal bands, each with a label and component boxes.
 * layers: [{label, items:[{label, sub?, emphasis?}], note?}] from top to bottom.
 */
export function layerDiagram(o) {
  const ctx = setup(o);
  const { t, size, build } = ctx;
  const labelW = Math.max(...o.layers.map(L => measureText(L.label, size - 1, { weight: 700 }))) + 40;
  const gap = o.gap ?? 12, bandH = (ctx.H - gap * (o.layers.length - 1)) / o.layers.length;
  const parts = [];
  o.layers.forEach((L, li) => {
    const y = li * (bandH + gap);
    parts.push(g({ class: 'ss-layer', ...buildAttrs(build, { i: li, motion: 'lift' }) },
      el('rect', { x: 0, y, width: ctx.W, height: bandH, rx: 12, fill: L.emphasis ? t.seq(0) : t.c('surface'), stroke: L.emphasis ? t.c('accent') : null }),
      textLines(wrapText(L.label, labelW - 30, size - 1, { weight: 700 }), { x: 20, y: y + bandH / 2, size: size - 1, valign: 'middle', fill: L.emphasis ? t.c('accent') : t.c('muted'), weight: 700 }),
      (() => {
        const items = L.items.map(it => measureNode({ ...asNode(it), kind: 'process' }, { size: size - 1, maxWidth: 220, minWidth: 100 }));
        const avail = ctx.W - labelW - 16, igap = o.itemGap ?? 16;
        if (sum(items.map(i => i.w)) + igap * (items.length - 1) > avail + 1) throw Error(`${o.id}: layer "${L.label}" has too many components for the width`);
        // Stretch components to share the band (default) so layers read as one structure.
        if (o.stretch !== false) { const each = (avail - igap * (items.length - 1)) / items.length; if (items.every(i => i.w <= each)) items.forEach(i => { i.w = each; }); }
        const totalW = sum(items.map(i => i.w));
        let x = labelW + (avail - (totalW + igap * (items.length - 1))) / 2;
        return items.map(it => { it.x = x; it.y = y + (bandH - it.h) / 2; x += it.w + igap; return drawNode({ ...it, fill: it.emphasis ? null : t.c('paper') }, { ...ctx, size: size - 1 }); });
      })()));
  });
  return root(o, ctx, markers(ctx), parts);
}

/**
 * Capability / responsibility matrix (RACI, feature coverage). rows, cols,
 * cells[r][c] ∈ symbols keys; symbols: {key: {glyph:'full'|'half'|'empty'|'text', label}}.
 */
export function matrixDiagram(o) {
  const ctx = setup(o);
  const { t, size, build } = ctx;
  const rowW = Math.max(...o.rows.map(r => measureText(r, size, { weight: 600 }))) + 24;
  const headH = Math.max(...o.cols.map(c => wrapText(c, (ctx.W - rowW) / o.cols.length - 8, size - 1).length)) * (size - 1) * 1.2 + 18;
  const keyH = o.symbols ? size + 24 : 0;
  const cw = (ctx.W - rowW) / o.cols.length, rh = (ctx.H - headH - keyH) / o.rows.length;
  const parts = [];
  o.cols.forEach((c, ci) => parts.push(textLines(wrapText(c, cw - 8, size - 1), { x: rowW + ci * cw + cw / 2, y: headH - 10, size: size - 1, anchor: 'middle', valign: 'bottom', fill: t.c('muted'), weight: 700, lineHeight: 1.2 })));
  o.rows.forEach((r, ri) => {
    const y = headH + ri * rh;
    if (ri % 2 === 0) parts.push(el('rect', { x: 0, y, width: ctx.W, height: rh, fill: t.c('surface') }));
    parts.push(textLines([r], { x: 12, y: y + rh / 2, size, valign: 'middle', fill: t.c('ink'), weight: 600 }));
    o.cols.forEach((c, ci) => {
      const key = o.cells[ri][ci], sym = o.symbols?.[key], cx = rowW + ci * cw + cw / 2, cy = y + rh / 2, R = Math.min(11, rh * 0.3);
      if (!key) return;
      const at = buildAttrs(build, { i: ri, motion: 'reveal' });
      if (!sym || sym.glyph === 'text') parts.push(textLines([sym?.text ?? String(key)], { x: cx, y: cy, size: size - 1, anchor: 'middle', valign: 'middle', fill: sym?.emphasis ? t.c('accent') : t.c('ink'), weight: 700, attrs: at }));
      else if (sym.glyph === 'full') parts.push(el('circle', { cx, cy, r: R, fill: sym.emphasis ? t.c('accent') : t.c('ink'), ...at }));
      else if (sym.glyph === 'half') parts.push(g(at, el('circle', { cx, cy, r: R - 1, fill: 'none', stroke: t.c('ink'), 'stroke-width': 2 }), el('path', { d: `M${n(cx)} ${n(cy - R + 1)}A${n(R - 1)} ${n(R - 1)} 0 0 0 ${n(cx)} ${n(cy + R - 1)}Z`, fill: t.c('ink') })));
      else parts.push(el('circle', { cx, cy, r: R - 1, fill: 'none', stroke: t.c('muted'), 'stroke-width': 2, ...at }));
    });
  });
  if (o.symbols) {
    let x = 12; const y = ctx.H - keyH / 2;
    for (const [k, s] of Object.entries(o.symbols)) {
      const R = 8;
      parts.push(s.glyph === 'full' ? el('circle', { cx: x + R, cy: y, r: R, fill: s.emphasis ? t.c('accent') : t.c('ink') }) : s.glyph === 'half' ? g({}, el('circle', { cx: x + R, cy: y, r: R - 1, fill: 'none', stroke: t.c('ink'), 'stroke-width': 2 }), el('path', { d: `M${n(x + R)} ${n(y - R + 1)}A${n(R - 1)} ${n(R - 1)} 0 0 0 ${n(x + R)} ${n(y + R - 1)}Z`, fill: t.c('ink') })) : s.glyph === 'text' ? textLines([s.text ?? k], { x: x + R, y, size: Math.max(15, size - 2), anchor: 'middle', valign: 'middle', fill: t.c('ink'), weight: 700 }) : el('circle', { cx: x + R, cy: y, r: R - 1, fill: 'none', stroke: t.c('muted'), 'stroke-width': 2 }));
      parts.push(textLines([s.label], { x: x + 2 * R + 8, y, size: Math.max(15, size - 2), valign: 'middle', fill: t.c('muted') }));
      x += 2 * R + 8 + measureText(s.label, Math.max(15, size - 2)) + 28;
    }
  }
  return root(o, ctx, '', parts);
}
