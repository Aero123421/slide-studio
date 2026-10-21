/**
 * Slide Studio figure engine — fields, contours and generative texture.
 *
 * Scientific fields (contours, vector fields) are computed from a function you
 * supply. Decorative textures are seeded and deterministic: the same seed draws
 * the same picture in every build. A texture must never look like data; keep it
 * out of evidence regions and label schematic encodings as schematic.
 */
import { theme, el, g, n, clamp, rng, pathFromPoints, polar, isNum, mixHex } from './fig-core.mjs';

// ---------------------------------------------------------------- noise

/** Seeded 2-D value noise in [0, 1] with smooth interpolation; fbm() layers octaves. */
export function noise2D(seed = 1) {
  const rand = rng(seed), perm = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
  const vals = Array.from({ length: 256 }, () => rand());
  const h = (x, y) => vals[perm[(perm[x & 255] + y) & 255]];
  const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
  const noise = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = fade(xf), v = fade(yf);
    const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  noise.fbm = (x, y, octaves = 4, gain = 0.5) => {
    let amp = 1, freq = 1, total = 0, norm = 0;
    for (let o = 0; o < octaves; o++) { total += amp * noise(x * freq, y * freq); norm += amp; amp *= gain; freq *= 2; }
    return total / norm;
  };
  return noise;
}

// ---------------------------------------------------------------- contours

/**
 * Marching squares. fn(x, y) sampled on an nx × ny grid over [x0,x1]×[y0,y1].
 * Returns [{level, lines: [[x,y]...][]}] in the function's own coordinates.
 */
export function contourLines(fn, { x0 = 0, x1 = 1, y0 = 0, y1 = 1, nx = 60, ny = 40, levels }) {
  const gx = i => x0 + ((x1 - x0) * i) / nx, gy = j => y0 + ((y1 - y0) * j) / ny;
  const grid = [];
  for (let j = 0; j <= ny; j++) { const row = []; for (let i = 0; i <= nx; i++) row.push(fn(gx(i), gy(j))); grid.push(row); }
  const flat = grid.flat().filter(isNum);
  const lv = levels ?? (() => { const lo = Math.min(...flat), hi = Math.max(...flat); return Array.from({ length: 8 }, (_, k) => lo + ((hi - lo) * (k + 1)) / 9); })();
  return lv.map(level => {
    const segs = [];
    const interp = (pa, pb, va, vb) => { const t = (level - va) / (vb - va || 1e-12); return [pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t]; };
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const v = [grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]];
      const p = [[gx(i), gy(j)], [gx(i + 1), gy(j)], [gx(i + 1), gy(j + 1)], [gx(i), gy(j + 1)]];
      const idx = (v[0] > level ? 8 : 0) | (v[1] > level ? 4 : 0) | (v[2] > level ? 2 : 0) | (v[3] > level ? 1 : 0);
      if (idx === 0 || idx === 15) continue;
      const e = k => interp(p[k], p[(k + 1) % 4], v[k], v[(k + 1) % 4]);
      const table = { 1: [[2, 3]], 2: [[1, 2]], 3: [[1, 3]], 4: [[0, 1]], 5: [[0, 3], [1, 2]], 6: [[0, 2]], 7: [[0, 3]], 8: [[0, 3]], 9: [[0, 2]], 10: [[0, 1], [2, 3]], 11: [[0, 1]], 12: [[1, 3]], 13: [[1, 2]], 14: [[2, 3]] };
      for (const [a, b] of table[idx]) segs.push([e(a), e(b)]);
    }
    return { level, lines: joinSegments(segs) };
  });
}
function joinSegments(segs) {
  const key = p => `${Math.round(p[0] * 1e4)},${Math.round(p[1] * 1e4)}`;
  const ends = new Map();
  segs.forEach((s, i) => { for (const p of s) { const k = key(p); if (!ends.has(k)) ends.set(k, []); ends.get(k).push(i); } });
  const used = new Set(), lines = [];
  for (let i = 0; i < segs.length; i++) {
    if (used.has(i)) continue;
    used.add(i);
    const line = [...segs[i]];
    for (const forward of [true, false]) {
      for (;;) {
        const tip = forward ? line[line.length - 1] : line[0];
        const next = (ends.get(key(tip)) || []).find(k => !used.has(k));
        if (next === undefined) break;
        used.add(next);
        const s = segs[next], other = key(s[0]) === key(tip) ? s[1] : s[0];
        if (forward) line.push(other); else line.unshift(other);
      }
    }
    lines.push(line);
  }
  return lines;
}

/**
 * Contour plot of a function on a box. Maps function space to pixel space,
 * colors levels with the sequential ramp, optionally labels a few levels.
 */
export function contourPlot(fn, { x = 0, y = 0, width, height, domain = { x0: 0, x1: 1, y0: 0, y1: 1 }, nx = 70, ny = 45, levels, theme: th, fill = false, strokeWidth = 1.6, label, highlightLevel, attrs = {} }) {
  const t = theme(th);
  const res = contourLines(fn, { ...domain, nx, ny, levels });
  const sx = v => x + ((v - domain.x0) / (domain.x1 - domain.x0)) * width, sy = v => y + height - ((v - domain.y0) / (domain.y1 - domain.y0)) * height;
  const steps = t.values.seq.length;
  const parts = res.map((r, k) => {
    const idx = Math.round(((k + 1) / (res.length + 1)) * (steps - 1));
    const hl = highlightLevel != null && Math.abs(r.level - highlightLevel) < 1e-9;
    return g({ class: 'ss-contour', 'data-level': n(r.level) }, r.lines.map(line => el('path', {
      d: pathFromPoints(line.map(([a, b]) => [sx(a), sy(b)])), fill: 'none', stroke: hl ? t.c('accent') : t.seq(Math.max(1, idx)),
      'stroke-width': hl ? strokeWidth * 2 : strokeWidth, 'stroke-linejoin': 'round', 'stroke-linecap': 'round',
    })));
  });
  return g({ class: 'ss-contours', ...attrs }, parts);
}

/** Arrows for a 2-D vector field fn(x,y) → [u,v], sampled on a grid. Length ∝ magnitude (capped). */
export function vectorField(fn, { x = 0, y = 0, width, height, domain = { x0: -1, x1: 1, y0: -1, y1: 1 }, cols = 18, rows = 11, theme: th, scale = 1, color, maxMagnitude, attrs = {} }) {
  // maxMagnitude fixes the length scale (arrow of length 0.82 cell = that magnitude), so two
  // panels or a key share one scale; by default the sampled maximum sets it.
  const t = theme(th), out = [];
  const cw = width / cols, ch = height / rows, maxLen = Math.min(cw, ch) * 0.82;
  const samples = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const fx = domain.x0 + ((i + 0.5) / cols) * (domain.x1 - domain.x0), fy = domain.y1 - ((j + 0.5) / rows) * (domain.y1 - domain.y0);
    const [u, v] = fn(fx, fy);
    samples.push({ px: x + (i + 0.5) * cw, py: y + (j + 0.5) * ch, u, v, m: Math.hypot(u, v) });
  }
  const maxM = maxMagnitude ?? (Math.max(...samples.map(s => s.m)) || 1);
  for (const s of samples) {
    const L = Math.min(1.25, s.m / maxM) * maxLen * scale, a = Math.atan2(-s.v, s.u);
    const x0 = s.px - (Math.cos(a) * L) / 2, y0 = s.py - (Math.sin(a) * L) / 2, x1 = s.px + (Math.cos(a) * L) / 2, y1 = s.py + (Math.sin(a) * L) / 2;
    const head = Math.min(7, L * 0.4), ha = 0.5;
    const c = color || t.seqAt(0.35 + 0.65 * Math.min(1, s.m / maxM));
    out.push(el('path', { d: `M${n(x0)} ${n(y0)}L${n(x1)} ${n(y1)}M${n(x1 - Math.cos(a - ha) * head)} ${n(y1 - Math.sin(a - ha) * head)}L${n(x1)} ${n(y1)}L${n(x1 - Math.cos(a + ha) * head)} ${n(y1 - Math.sin(a + ha) * head)}`, fill: 'none', stroke: c, 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  }
  return g({ class: 'ss-vector-field', ...attrs }, out);
}

/** Streamlines through a field (RK2 integration from seeded start points). */
export function streamlines(fn, { x = 0, y = 0, width, height, domain = { x0: -1, x1: 1, y0: -1, y1: 1 }, count = 40, steps = 80, dt = 0.02, seed = 3, theme: th, color, strokeWidth = 1.4, attrs = {} }) {
  const t = theme(th), rand = rng(seed), out = [];
  const sx = v => x + ((v - domain.x0) / (domain.x1 - domain.x0)) * width, sy = v => y + height - ((v - domain.y0) / (domain.y1 - domain.y0)) * height;
  for (let k = 0; k < count; k++) {
    let px = domain.x0 + rand() * (domain.x1 - domain.x0), py = domain.y0 + rand() * (domain.y1 - domain.y0);
    const pts = [[sx(px), sy(py)]];
    for (let s = 0; s < steps; s++) {
      const [u1, v1] = fn(px, py), m1 = Math.hypot(u1, v1) || 1;
      const mx = px + (u1 / m1) * dt * 0.5, my = py + (v1 / m1) * dt * 0.5;
      const [u2, v2] = fn(mx, my), m2 = Math.hypot(u2, v2) || 1;
      px += (u2 / m2) * dt; py += (v2 / m2) * dt;
      if (px < domain.x0 || px > domain.x1 || py < domain.y0 || py > domain.y1) break;
      pts.push([sx(px), sy(py)]);
    }
    if (pts.length > 4) out.push(el('path', { d: pathFromPoints(pts), fill: 'none', stroke: color || t.seqAt(0.3 + 0.6 * (k / count)), 'stroke-width': strokeWidth, 'stroke-linecap': 'round', opacity: 0.85 }));
  }
  return g({ class: 'ss-streamlines', ...attrs }, out);
}

// ---------------------------------------------------------------- decorative textures

/** Concentric rings around (cx, cy). colors cycle through the given list. */
export function rings({ cx, cy, r0 = 20, r1 = 300, count = 12, colors, strokeWidth = 2, theme: th, attrs = {} }) {
  const t = theme(th), list = colors || [t.c('ink')];
  return g({ class: 'ss-rings', ...attrs }, Array.from({ length: count }, (_, k) => el('circle', { cx, cy, r: r0 + ((r1 - r0) * k) / Math.max(1, count - 1), fill: 'none', stroke: list[k % list.length], 'stroke-width': strokeWidth })));
}

/** Quarter-circle tiles in a grid, rotated by a seeded choice: Truchet pattern. */
export function truchet({ x = 0, y = 0, cols = 12, rows = 7, size = 80, seed = 5, theme: th, color, strokeWidth = 3, filled = false, attrs = {} }) {
  const t = theme(th), rand = rng(seed), c = color || t.c('ink'), out = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const px = x + i * size, py = y + j * size, r = size / 2, flip = rand() < 0.5;
    const d = flip
      ? `M${n(px + r)} ${n(py)}A${n(r)} ${n(r)} 0 0 1 ${n(px)} ${n(py + r)}M${n(px + size)} ${n(py + r)}A${n(r)} ${n(r)} 0 0 0 ${n(px + r)} ${n(py + size)}`
      : `M${n(px + r)} ${n(py)}A${n(r)} ${n(r)} 0 0 0 ${n(px + size)} ${n(py + r)}M${n(px)} ${n(py + r)}A${n(r)} ${n(r)} 0 0 1 ${n(px + r)} ${n(py + size)}`;
    out.push(el('path', { d, fill: filled ? c : 'none', stroke: c, 'stroke-width': strokeWidth, 'stroke-linecap': 'round' }));
  }
  return g({ class: 'ss-truchet', ...attrs }, out);
}

/** Halftone dots whose radius follows f(u, v) ∈ [0, 1] over the box (u, v in 0..1). */
export function halftone({ x = 0, y = 0, width, height, spacing = 18, f = (u, v) => u, theme: th, color, maxR, offsetRows = true, angle = 0, attrs = {} }) {
  // Dots on a (hexagonal) screen rotated by `angle` degrees; radius = maxR · f(u, v), u/v in 0..1 across the box.
  const t = theme(th), c = color || t.c('ink'), R = maxR ?? spacing * 0.48, out = [];
  const a = (angle * Math.PI) / 180, cos = Math.cos(a), sin = Math.sin(a), cx = width / 2, cy = height / 2;
  const reach = Math.hypot(width, height) / 2 + spacing, rowH = spacing * 0.866;
  for (let j = -Math.ceil(reach / rowH); j <= Math.ceil(reach / rowH); j++) for (let i = -Math.ceil(reach / spacing) - 1; i <= Math.ceil(reach / spacing) + 1; i++) {
    const lx = i * spacing + (offsetRows && Math.abs(j) % 2 ? spacing / 2 : 0), ly = j * rowH;
    const px = cx + lx * cos - ly * sin, py = cy + lx * sin + ly * cos;
    if (px < 0 || px > width || py < 0 || py > height) continue;
    const r = R * clamp(f(px / width, py / height), 0, 1);
    if (r > 0.35) out.push(el('circle', { cx: x + px, cy: y + py, r, fill: c }));
  }
  return g({ class: 'ss-halftone', ...attrs }, out);
}

/** Noise-displaced parallel lines (topographic / wave texture). */
export function waveLines({ x = 0, y = 0, width, height, count = 24, amplitude = 30, frequency = 2.2, seed = 9, theme: th, color, strokeWidth = 1.6, attrs = {} }) {
  const t = theme(th), noise = noise2D(seed), out = [];
  for (let k = 0; k < count; k++) {
    const base = y + (height * (k + 0.5)) / count, pts = [];
    for (let s = 0; s <= 80; s++) { const u = s / 80; pts.push([x + u * width, base + (noise.fbm(u * frequency, k * 0.13, 3) - 0.5) * 2 * amplitude]); }
    out.push(el('path', { d: pathFromPoints(pts, { curve: 'monotone' }), fill: 'none', stroke: typeof color === 'function' ? color(k, count) : color || t.c('ink'), 'stroke-width': strokeWidth, 'stroke-linecap': 'round' }));
  }
  return g({ class: 'ss-waves', ...attrs }, out);
}

/** Jittered triangulated grid with fills from a ramp: faceted / low-poly field. */
export function facets({ x = 0, y = 0, width, height, cols = 10, rows = 6, jitter = 0.35, seed = 11, colors, theme: th, stroke, attrs = {} }) {
  const t = theme(th), rand = rng(seed), noise = noise2D(seed + 1), out = [];
  const pts = [];
  for (let j = 0; j <= rows; j++) {
    const row = [];
    for (let i = 0; i <= cols; i++) {
      const edge = i === 0 || j === 0 || i === cols || j === rows;
      const jx = edge ? 0 : (rand() - 0.5) * jitter * (width / cols), jy = edge ? 0 : (rand() - 0.5) * jitter * (height / rows);
      row.push([x + (i * width) / cols + jx, y + (j * height) / rows + jy]);
    }
    pts.push(row);
  }
  const ramp = colors || t.values.seq.map((_, k) => t.seq(k));
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const a = pts[j][i], b = pts[j][i + 1], c = pts[j + 1][i + 1], d = pts[j + 1][i];
    const tris = (i + j) % 2 ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]];
    for (const tri of tris) {
      const cx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3, cy = (tri[0][1] + tri[1][1] + tri[2][1]) / 3;
      const v = noise.fbm((cx - x) / width * 2.2, (cy - y) / height * 2.2, 3);
      const k = Math.round(clamp(v * 1.4 - 0.2, 0, 1) * (ramp.length - 1));
      out.push(el('path', { d: pathFromPoints(tri, { close: true }), fill: ramp[k], stroke: stroke || ramp[k], 'stroke-width': stroke ? 1 : 0.6, 'stroke-linejoin': 'round' }));
    }
  }
  return g({ class: 'ss-facets', ...attrs }, out);
}

/** Isometric lattice lines (60° family) clipped to a box. */
export function isoGrid({ x = 0, y = 0, width, height, spacing = 40, theme: th, color, strokeWidth = 1, verticals = true, attrs = {} }) {
  // A true isometric lattice: vertical lines plus lines at ±30°, all meeting at the
  // same lattice points (edge length = spacing), clipped to the box.
  const t = theme(th), c = color || t.c('rule'), out = [];
  const m = 1 / Math.sqrt(3), d = spacing * Math.sqrt(3) / 2, line = (x1, y1, x2, y2) => out.push(el('line', { x1: x + x1, y1: y + y1, x2: x + x2, y2: y + y2, stroke: c, 'stroke-width': strokeWidth }));
  if (verticals) for (let X = 0; X <= width + 1e-6; X += d) line(X, 0, X, height);
  for (const slope of [m, -m]) {
    const c0 = slope > 0 ? -width * m : 0, c1 = slope > 0 ? height : height + width * m;
    for (let k = Math.floor(c0 / spacing) * spacing; k <= c1; k += spacing) {
      // y = slope·X + k within X ∈ [0, width], y ∈ [0, height]
      let a = (0 - k) / slope, b = (height - k) / slope;
      if (a > b) [a, b] = [b, a];
      const X0 = Math.max(0, a), X1 = Math.min(width, b);
      if (X1 - X0 > 0.5) line(X0, slope * X0 + k, X1, slope * X1 + k);
    }
  }
  return g({ class: 'ss-isogrid', ...attrs }, out);
}

/** Seeded scatter of small marks (dots, ticks or crosses) for atmospheric texture. */
export function sprinkle({ x = 0, y = 0, width, height, count = 120, seed = 4, theme: th, color, shape = 'dot', size = 3, attrs = {} }) {
  const t = theme(th), rand = rng(seed), c = color || t.c('rule'), out = [];
  for (let k = 0; k < count; k++) {
    const px = x + rand() * width, py = y + rand() * height, s = size * (0.5 + rand());
    out.push(shape === 'cross' ? el('path', { d: `M${n(px - s)} ${n(py)}h${n(2 * s)}M${n(px)} ${n(py - s)}v${n(2 * s)}`, stroke: c, 'stroke-width': 1.4, 'stroke-linecap': 'round' })
      : shape === 'tick' ? el('line', { x1: px, y1: py, x2: px + s * 2, y2: py - s * 2, stroke: c, 'stroke-width': 1.4, 'stroke-linecap': 'round' })
        : el('circle', { cx: px, cy: py, r: s / 2, fill: c }));
  }
  return g({ class: 'ss-sprinkle', ...attrs }, out);
}

/** Linear gradient definition helper (for <defs>). stops: [[offset 0..1, color]]. */
export function linearGradient(id, stops, { x1 = 0, y1 = 0, x2 = 0, y2 = 1 } = {}) {
  return el('linearGradient', { id, x1, y1, x2, y2 }, stops.map(([o, c, op]) => el('stop', { offset: o, 'stop-color': c, 'stop-opacity': op ?? null })));
}
export function radialGradient(id, stops, { cx = 0.5, cy = 0.5, r = 0.5, fx, fy } = {}) {
  return el('radialGradient', { id, cx, cy, r, fx: fx ?? null, fy: fy ?? null }, stops.map(([o, c, op]) => el('stop', { offset: o, 'stop-color': c, 'stop-opacity': op ?? null })));
}

/** Blend helper for literal palettes (e.g. building a 9-step ramp for a texture). */
export const ramp = (a, b, count) => Array.from({ length: count }, (_, k) => mixHex(a, b, count > 1 ? k / (count - 1) : 0));

/** Points on a polar rose / spiral, useful for radial compositions. */
export function spiralPoints({ cx, cy, r0 = 10, r1 = 200, turns = 3, count = 200 }) {
  return Array.from({ length: count }, (_, k) => { const u = k / (count - 1), a = u * turns * 2 * Math.PI; return polar(cx, cy, r0 + (r1 - r0) * u, a); });
}
