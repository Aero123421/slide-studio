/* Slide Studio player — deterministic presentation states.
 *
 * Contract
 * - A slide's state is (slide index, build step). Every route (button, key,
 *   swipe, API, presenter window, URL hash) calls show(i, step).
 * - Target styles are committed synchronously; animation is a removable layer
 *   on top. finish() completes every running animation at its target, so a
 *   direct jump, reverse navigation, reduced motion and export all reach the
 *   same committed state.
 * - Widgets own their content; global navigation never consumes keys from
 *   inputs, sliders, editors, media or [data-interactive] regions.
 *
 * Authoring hooks (see references/motion-and-interaction.md)
 *   data-step="n"            visible from build n (0 = start); data-until="m" hides after m
 *   data-motion="preset"     entry effect when the element appears
 *   data-delay="ms"          wait before the entry effect (stagger by hand)
 *   data-stagger="ms"        animate the element's children one after another
 *   data-duration="ms"       effect length (default 500, max 1600)
 *   data-easing="name|css"   standard | emphasized | decelerate | accelerate | linear | smooth | any CSS easing
 *   data-states='{"0":{…},"2":{…}}'  cumulative CSS state per build (transformations)
 */
(() => {
  'use strict';
  const meta = JSON.parse(document.getElementById('slide-studio-meta').textContent);
  const slides = [...document.querySelectorAll('.slide')];
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  const warnings = [], widgets = new Map(), tracks = new WeakMap(), animations = new Set(), counting = new Set();
  const lastSteps = Array(slides.length).fill(0);
  const labels = meta.labels || {};
  let current = 0, step = 0, overview = false, restore = null, enteredIndex = null;
  let exporting = new URLSearchParams(location.search).has('static');
  const $ = id => document.getElementById(id);
  const warn = e => { warnings.push(String(e)); console.warn('[Slide Studio]', e); };
  const call = (widget, method, ...args) => { try { return widget?.[method]?.(...args); } catch (e) { warn(`${method}: ${e.message}`); } };
  const rtl = () => document.documentElement.dir === 'rtl';

  // ------------------------------------------------------------ build bookkeeping

  const max = i => Math.max(0, ...[...slides[i].querySelectorAll('[data-step],[data-states]')].flatMap(el => {
    const v = [Number(el.dataset.step) || 0];
    try { if (el.dataset.states) v.push(...Object.keys(JSON.parse(el.dataset.states)).map(Number)); } catch { /* reported below */ }
    return v.filter(Number.isFinite);
  }));

  function parseTrack(el) {
    const map = JSON.parse(el.dataset.states), keys = Object.keys(map).map(Number).sort((a, b) => a - b);
    if (!map['0'] || keys.some(k => !Number.isInteger(k) || k < 0)) throw Error('state 0 and nonnegative integer keys required');
    const base = {};
    for (const state of Object.values(map)) {
      if (!state || typeof state !== 'object' || Array.isArray(state)) throw Error('CSS property map required');
      for (const key of Object.keys(state)) {
        if (!(key in el.style) && !key.startsWith('--')) throw Error(`unknown CSS property ${key}`);
        base[key] = key.startsWith('--') ? el.style.getPropertyValue(key) : el.style[key] || getComputedStyle(el)[key];
      }
    }
    return { map, keys, base };
  }
  for (const slide of slides) for (const el of slide.querySelectorAll('[data-states]')) {
    try { tracks.set(el, parseTrack(el)); } catch (e) { warn(`${slide.id}: ${e.message}`); }
  }
  const stateAt = (track, at) => { const to = { ...track.base }; for (const k of track.keys) if (k <= at) Object.assign(to, track.map[k]); return to; };

  // ------------------------------------------------------------ animation layer

  const EASE = {
    standard: 'cubic-bezier(.2,0,0,1)', emphasized: 'cubic-bezier(.3,0,0,1)', decelerate: 'cubic-bezier(0,0,0,1)',
    accelerate: 'cubic-bezier(.3,0,1,1)', linear: 'linear', smooth: 'cubic-bezier(.45,0,.2,1)',
  };
  const DEFAULT_EASE = 'cubic-bezier(.22,.68,.2,1)';
  const easing = el => { const e = el.dataset.easing; return e ? EASE[e] || e : DEFAULT_EASE; };
  const durationOf = (el, fallback = 500) => {
    const requested = el.dataset.duration === undefined ? fallback : Number(el.dataset.duration);
    return Number.isFinite(requested) ? Math.min(1600, Math.max(0, requested)) : fallback;
  };
  const delayOf = el => { const d = Number(el.dataset.delay); return Number.isFinite(d) ? Math.min(2400, Math.max(0, d)) : 0; };
  const motionAllowed = animate => animate && !mq.matches && !exporting;

  function track(a) {
    animations.add(a);
    a.finished?.then(() => { animations.delete(a); a.cancel?.(); }).catch(() => animations.delete(a));
    return a;
  }
  function finish() {
    for (const a of animations) { try { a.finish(); a.cancel?.(); } catch { a.cancel?.(); } }
    animations.clear();
  }

  /** Commit `to` on the element now; optionally animate from `from` (or the old value) as a removable layer. */
  function transition(el, to, animate, from = null, { delay = 0, duration, keyframes } = {}) {
    const old = {};
    for (const [k, v] of Object.entries(to)) {
      old[k] = k.startsWith('--') ? getComputedStyle(el).getPropertyValue(k) : getComputedStyle(el)[k];
      if (k.startsWith('--')) el.style.setProperty(k, String(v)); else el.style[k] = String(v);
    }
    if (!motionAllowed(animate) || !el.animate) return;
    try {
      const frames = keyframes || [from || old, to];
      track(el.animate(frames, { duration: duration ?? durationOf(el), delay, easing: easing(el), fill: delay ? 'backwards' : 'none' }));
    } catch (e) { warn(e.message); }
  }

  // Entry presets use individual transform properties (translate/scale), so they
  // compose with an element's own transform attribute instead of replacing it.
  const ENTRY = {
    reveal: [{ opacity: 0 }, { opacity: 1 }],
    focus: [{ opacity: 0.2 }, { opacity: 1 }],
    lift: [{ opacity: 0, translate: '0 20px' }, { opacity: 1, translate: '0 0' }],
    rise: [{ opacity: 0, translate: '0 48px' }, { opacity: 1, translate: '0 0' }],
    slide: [{ opacity: 0, translate: '-28px 0' }, { opacity: 1, translate: '0 0' }],
    settle: [{ opacity: 0, scale: '0.96' }, { opacity: 1, scale: '1' }],
    zoom: [{ opacity: 0, scale: '0.86' }, { opacity: 1, scale: '1' }],
    blur: [{ opacity: 0, filter: 'blur(10px)' }, { opacity: 1, filter: 'blur(0px)' }],
    'grow-x': [{ scale: '0 1' }, { scale: '1 1' }],
    'grow-y': [{ scale: '1 0' }, { scale: '1 1' }],
    wipe: [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }],
    'wipe-up': [{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)' }],
    trace: [{ strokeDashoffset: '1' }, { strokeDashoffset: '0' }],
    draw: null, count: null, // special-cased below
  };
  const GEOMETRY = 'path,line,polyline,polygon,circle,ellipse,rect';
  const hasStroke = el => { const s = getComputedStyle(el); return s.stroke && s.stroke !== 'none' && parseFloat(s.strokeWidth) > 0; };

  /** Draw strokes on: dash offset for solid strokes, a left-to-right wipe for dashed ones. */
  function drawOn(el, animate, delay) {
    const targets = el instanceof SVGGeometryElement ? [el] : [...el.querySelectorAll(GEOMETRY)];
    if (!motionAllowed(animate)) return;
    const duration = durationOf(el, 900);
    for (const t of targets) {
      if (!t.animate) continue;
      try {
        if (!hasStroke(t)) { track(t.animate([{ opacity: 0 }, { opacity: 1 }], { duration: duration * 0.6, delay: delay + duration * 0.4, easing: easing(el), fill: 'backwards' })); continue; }
        const dashed = getComputedStyle(t).strokeDasharray !== 'none';
        if (!t.hasAttribute('pathLength') && !dashed) t.setAttribute('pathLength', '1');
        const frames = dashed
          ? [{ clipPath: rtl() ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }]
          : [{ strokeDasharray: '1 1', strokeDashoffset: '1' }, { strokeDasharray: '1 1', strokeDashoffset: '0' }];
        track(t.animate(frames, { duration, delay, easing: easing(el), fill: 'backwards' }));
      } catch (e) { warn(e.message); }
    }
  }

  /** Count a number up to its committed text. The DOM always holds the final text except mid-animation. */
  function countUp(el, animate, delay) {
    if (!motionAllowed(animate)) return;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode()) && !/\d/.test(node.data));
    if (!node) return;
    const final = node.data;
    const m = /([-−+]?)(\d[\d,  ]*)(\.\d+)?/.exec(final);
    if (!m) return;
    const [all, sign, int, dec = ''] = m, head = final.slice(0, m.index), tail = final.slice(m.index + all.length);
    const target = Number(int.replace(/[^\d]/g, '') + dec) * (sign === '-' || sign === '−' ? -1 : 1);
    if (!Number.isFinite(target)) return;
    const from = Number(el.dataset.countFrom ?? 0), digits = Math.max(0, dec.length - 1), grouped = /[,  ]/.test(int);
    const sep = (int.match(/[,  ]/) || [','])[0];
    const format = v => {
      const abs = Math.abs(v).toFixed(digits);
      let [ip, fp] = abs.split('.');
      if (grouped) ip = ip.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
      const s = v < 0 ? (sign === '-' ? '-' : '−') : sign === '+' ? '+' : '';
      return head + s + ip + (fp ? '.' + fp : '') + tail;
    };
    const duration = durationOf(el, 1100), start = performance.now() + delay;
    let raf = 0, done;
    const finished = new Promise(r => { done = r; });
    const record = { node, final };
    const stop = () => { cancelAnimationFrame(raf); node.data = final; counting.delete(record); done(); };
    counting.add(record);
    const frame = now => {
      const t = Math.min(1, Math.max(0, (now - start) / duration)), e = 1 - (1 - t) ** 3;
      node.data = t >= 1 ? final : format(from + (target - from) * e);
      if (t < 1) raf = requestAnimationFrame(frame); else stop();
    };
    node.data = format(from);
    raf = requestAnimationFrame(frame);
    track({ finish: stop, cancel: stop, finished });
  }

  function enter(el, animate, extraDelay = 0) {
    const name = el.dataset.motion, delay = delayOf(el) + extraDelay;
    if (!(name in ENTRY)) { if (!el.dataset.motionWarned) { warn('Unknown entry effect: ' + name); el.dataset.motionWarned = 'true'; } return; }
    if (el.dataset.stagger !== undefined) {
      const gap = Math.max(0, Number(el.dataset.stagger) || 0);
      [...el.children].forEach((child, i) => {
        child.dataset.motion ??= name;
        if (child.dataset.duration === undefined && el.dataset.duration !== undefined) child.dataset.duration = el.dataset.duration;
        if (child.dataset.easing === undefined && el.dataset.easing !== undefined) child.dataset.easing = el.dataset.easing;
        enter(child, animate, delay + i * gap);
      });
      return;
    }
    if (name === 'draw') return drawOn(el, animate, delay);
    if (name === 'count') return countUp(el, animate, delay);
    const [from, to] = ENTRY[name];
    transition(el, to, animate, from, { delay });
  }

  // ------------------------------------------------------------ applying states

  function context(i = current) {
    return { slide: slides[i], index: i, step: i === current ? step : lastSteps[i], exporting, reducedMotion: mq.matches, active: i === current && !overview && !exporting };
  }

  /** Static state for a slide root (also used on presenter clones). */
  function applyStatic(root, at, original = root) {
    for (const el of root.querySelectorAll('[data-step]')) {
      const on = at >= Number(el.dataset.step) && (el.dataset.until === undefined || at <= Number(el.dataset.until));
      el.dataset.studioHidden = String(!on);
    }
    const originals = [...original.querySelectorAll('[data-states]')];
    [...root.querySelectorAll('[data-states]')].forEach((el, k) => {
      const tr = tracks.get(originals[k]);
      if (!tr) return;
      for (const [key, v] of Object.entries(stateAt(tr, at))) { if (key.startsWith('--')) el.style.setProperty(key, String(v)); else el.style[key] = String(v); }
    });
  }

  function apply(i, at, animate) {
    const slide = slides[i];
    for (const el of slide.querySelectorAll('[data-step]')) {
      const on = at >= Number(el.dataset.step) && (el.dataset.until === undefined || at <= Number(el.dataset.until));
      const was = el.dataset.studioHidden === 'false';
      el.dataset.studioHidden = String(!on);
      el.setAttribute('aria-hidden', String(!on));
      el.inert = !on;
      if (on && el.dataset.motion && !el.hasAttribute('data-states')) {
        if (!(el.dataset.motion in ENTRY)) { if (!el.dataset.motionWarned) { warn('Unknown entry effect: ' + el.dataset.motion); el.dataset.motionWarned = 'true'; } }
        else if (animate && !was) enter(el, animate);
        else if (!was && ENTRY[el.dataset.motion]) transition(el, ENTRY[el.dataset.motion][1], false);
      }
    }
    for (const el of slide.querySelectorAll('[data-states]')) {
      const tr = tracks.get(el);
      if (!tr) continue;
      const to = stateAt(tr, at);
      transition(el, to, animate);
      const hidden = el.dataset.studioHidden === 'true' || to.opacity === 0 || to.opacity === '0' || to.visibility === 'hidden';
      el.setAttribute('aria-hidden', String(hidden));
      el.inert = hidden;
    }
    lastSteps[i] = at;
    slide.dataset.currentStep = String(at);
    for (const [id, w] of widgets) if (slide.contains($(id))) call(w, 'onStep', { ...context(i), step: at });
  }

  // ------------------------------------------------------------ slide transitions

  const TRANSITIONS = {
    fade: () => [{ opacity: 0 }, { opacity: 1 }],
    rise: () => [{ opacity: 0, translate: '0 24px' }, { opacity: 1, translate: '0 0' }],
    push: forward => [{ opacity: 0, translate: `${(forward !== rtl() ? 1 : -1) * 4}% 0` }, { opacity: 1, translate: '0 0' }],
    zoom: () => [{ opacity: 0, scale: '0.97' }, { opacity: 1, scale: '1' }],
  };
  function slideTransition(i, forward) {
    const kind = meta.slides[i]?.transition || meta.transition || 'none';
    if (kind === 'none') return;
    const make = TRANSITIONS[kind];
    if (!make) { warn('Unknown slide transition: ' + kind); return; }
    try { track(slides[i].animate(make(forward), { duration: kind === 'fade' ? 340 : 460, easing: EASE.standard })); } catch (e) { warn(e.message); }
  }

  // ------------------------------------------------------------ navigation

  function scale() {
    const fs = document.body.classList.contains('studio-fullscreen');
    const bar = fs ? 0 : document.querySelector('.studio-controls').getBoundingClientRect().height;
    document.documentElement.style.setProperty('--studio-bar', bar + 'px');
    const r = Math.min(innerWidth / meta.width, Math.max(1, innerHeight - bar) / meta.height);
    document.documentElement.style.setProperty('--studio-scale', String(r));
    if (overview) document.querySelectorAll('.studio-thumb').forEach(w => w.style.setProperty('--thumb-scale', w.clientWidth / meta.width));
  }
  function pauseSlide(i) {
    if (enteredIndex === i) enteredIndex = null;
    for (const el of slides[i].querySelectorAll('video,audio')) el.pause();
    for (const [id, w] of widgets) if (slides[i].contains($(id))) call(w, 'onLeave', context(i));
  }
  function show(i, n = 0, { animate = false } = {}) {
    finish();
    const previous = current;
    current = Math.max(0, Math.min(slides.length - 1, Math.floor(Number(i) || 0)));
    step = Math.max(0, Math.min(max(current), Math.floor(Number(n) || 0)));
    if (exporting) step = max(current);
    const changed = previous !== current;
    if (changed) { pauseSlide(previous); for (const el of slides[current].querySelectorAll('[data-step]')) el.dataset.studioHidden = 'true'; }
    document.body.dataset.export = String(exporting);
    slides.forEach((sl, j) => {
      const active = j === current;
      sl.classList.toggle('is-current', active);
      sl.setAttribute('aria-hidden', String(!active));
      sl.inert = !active || overview;
      if (active || exporting) apply(j, exporting ? max(j) : step, animate && active);
    });
    if (changed && motionAllowed(animate) && !overview) slideTransition(current, current > previous);
    $('studio-position').textContent = `${current + 1} / ${slides.length} · ${step} / ${max(current)}`;
    $('studio-prev').disabled = !current && !step;
    $('studio-next').disabled = current === slides.length - 1 && (exporting || step === max(current));
    const s = meta.slides[current];
    $('studio-notes').textContent = (s.notes || '') + (s.sources?.length ? '\n\n' + s.sources.map(x => (typeof x === 'string' ? x : JSON.stringify(x))).join('\n') : '');
    $('studio-announcer').textContent = s.title;
    $('studio-jump').value = String(current);
    try { history.replaceState(null, '', '#' + encodeURIComponent(s.id)); } catch { /* sandboxed frames */ }
    for (const [id, w] of widgets) if (slides[current].contains($(id))) {
      if (exporting) call(w, 'onExport', context());
      else if (enteredIndex !== current && !overview && !document.hidden) call(w, 'onEnter', context());
    }
    enteredIndex = !exporting && !overview && !document.hidden ? current : null;
    window.dispatchEvent(new CustomEvent('studio:state', { detail: context() }));
    scale();
  }
  function next() { if (!exporting && step < max(current)) show(current, step + 1, { animate: true }); else if (current < slides.length - 1) show(current + 1, 0, { animate: true }); }
  function prev() { if (!exporting && step > 0) show(current, step - 1, { animate: true }); else if (current) show(current - 1, max(current - 1), { animate: true }); }

  function toggleOverview() {
    overview = !overview;
    document.body.classList.toggle('overview', overview);
    finish();
    if (overview) pauseSlide(current);
    slides.forEach((sl, i) => {
      let w = sl.parentElement;
      if (overview) {
        w = document.createElement('div');
        w.className = 'studio-thumb'; w.tabIndex = 0; w.setAttribute('role', 'button'); w.setAttribute('aria-label', meta.slides[i].title);
        sl.before(w); w.append(sl); sl.inert = true; apply(i, max(i), false);
        w.onclick = () => { toggleOverview(); show(i); };
        w.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleOverview(); show(i); } };
      } else if (w.classList.contains('studio-thumb')) { w.before(sl); w.remove(); }
    });
    if (!overview) show(current, step);
    scale();
  }
  function setExport(on) { exporting = !!on; if (overview) toggleOverview(); if (exporting) for (let i = 0; i < slides.length; i++) pauseSlide(i); show(current, step); }
  function prepareExport() {
    setExport(true);
    for (const [id, w] of widgets) { const i = slides.findIndex(sl => sl.contains($(id))); call(w, 'onExport', context(i < 0 ? current : i)); }
    window.dispatchEvent(new CustomEvent('studio:export'));
  }
  function reset() { for (const [id, w] of widgets) if (slides[current].contains($(id))) call(w, 'reset'); show(current, 0); }

  // ------------------------------------------------------------ chrome: blackout, help, toast

  function toggleBlackout(force) {
    let el = $('studio-blackout');
    if (!el) { el = document.createElement('div'); el.id = 'studio-blackout'; el.className = 'studio-blackout'; el.setAttribute('aria-hidden', 'true'); el.onclick = () => toggleBlackout(false); document.body.append(el); }
    const on = force ?? !el.classList.contains('on');
    el.classList.toggle('on', on);
    return on;
  }
  function toggleHelp(force) {
    let el = $('studio-help');
    if (!el) {
      el = document.createElement('div');
      el.id = 'studio-help'; el.className = 'studio-help'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'false'); el.setAttribute('aria-label', labels.help || 'Keyboard shortcuts');
      const rows = [
        ['→  Space  PgDn', labels.next || 'Next'], ['←  PgUp', labels.prev || 'Previous'], ['Home  End', `1 / ${slides.length}`],
        ['O', labels.overview || 'Overview'], ['N', labels.notes || 'Notes'], ['P', labels.presenter || 'Presenter view'],
        ['B', labels.blank || 'Black screen'], ['F', labels.full || 'Fullscreen'], ['R', labels.reset || 'Reset'], ['12 Enter', labels.goto || 'Go to slide'], ['Esc', '×'],
      ];
      el.innerHTML = '<div class="studio-help-card"><h2></h2><dl></dl></div>';
      el.querySelector('h2').textContent = labels.help || 'Keyboard shortcuts';
      const dl = el.querySelector('dl');
      for (const [k, v] of rows) { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = k; dd.textContent = v; dl.append(dt, dd); }
      el.onclick = e => { if (e.target === el) toggleHelp(false); };
      document.body.append(el);
    }
    const on = force ?? !el.classList.contains('open');
    el.classList.toggle('open', on);
    $('studio-help-btn')?.setAttribute('aria-expanded', String(on));
    return on;
  }
  let toastTimer = 0;
  function toast(text) {
    let el = $('studio-toast');
    if (!el) { el = document.createElement('div'); el.id = 'studio-toast'; el.className = 'studio-toast'; el.setAttribute('role', 'status'); document.body.append(el); }
    el.textContent = text; el.classList.add('on');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('on'), 1400);
  }

  // ------------------------------------------------------------ presenter window

  let presenter = null, presenterStart = 0, presenterPaused = 0;
  const pad2 = v => String(v).padStart(2, '0');
  const elapsed = () => { const s = Math.max(0, Math.floor(((presenterPaused || Date.now()) - presenterStart) / 1000)); return `${Math.floor(s / 60)}:${pad2(s % 60)}`; };

  function cloneSlide(i, at) {
    const src = slides[i];
    // Clone committed text, not a number caught mid-count.
    const live = [...counting].map(r => [r, r.node.data]);
    for (const [r] of live) r.node.data = r.final;
    const c = src.cloneNode(true);
    for (const [r, v] of live) r.node.data = v;
    // IDs stay: the clone lives in the presenter document, and SVG url(#…) references need them.
    c.inert = true; c.classList.add('is-current'); c.setAttribute('aria-hidden', 'true');
    if (at !== null) applyStatic(c, at, src);
    const srcCanvas = src.querySelectorAll('canvas'), dstCanvas = c.querySelectorAll('canvas');
    dstCanvas.forEach((cv, k) => { try { cv.getContext('2d')?.drawImage(srcCanvas[k], 0, 0); } catch { /* tainted or webgl */ } });
    c.querySelectorAll('video,audio').forEach(m => { m.removeAttribute('autoplay'); m.muted = true; });
    return c;
  }
  function renderPresenter() {
    if (!presenter || presenter.closed) return;
    const d = presenter.document, s = meta.slides[current], last = max(current);
    const cur = d.getElementById('pv-current'), nxt = d.getElementById('pv-next');
    if (!cur) return;
    cur.replaceChildren(cloneSlide(current, null));
    let nextLabel;
    if (step < last) { nxt.replaceChildren(cloneSlide(current, step + 1)); nextLabel = `${labels.next || 'Next'} · ${step + 1} / ${last}`; }
    else if (current < slides.length - 1) { nxt.replaceChildren(cloneSlide(current + 1, 0)); nextLabel = `${labels.next || 'Next'} · ${current + 2} / ${slides.length}`; }
    else { nxt.replaceChildren(); nextLabel = '—'; }
    d.getElementById('pv-next-label').textContent = nextLabel;
    d.getElementById('pv-position').textContent = `${current + 1} / ${slides.length}` + (last ? `  ·  ${step} / ${last}` : '');
    d.getElementById('pv-title').textContent = s.title;
    d.getElementById('pv-notes').textContent = s.notes || '';
    fitPresenter();
  }
  function fitPresenter() {
    if (!presenter || presenter.closed) return;
    for (const frame of presenter.document.querySelectorAll('.pv-frame')) frame.style.setProperty('--pv-scale', String(frame.clientWidth / meta.width));
  }
  function openPresenter() {
    if (presenter && !presenter.closed) { presenter.focus(); renderPresenter(); return presenter; }
    const w = window.open('', 'slide-studio-presenter', 'popup,width=1280,height=800');
    if (!w) { toast('Pop-up blocked'); return null; }
    presenter = w; presenterStart = Date.now(); presenterPaused = 0;
    const d = w.document;
    d.open();
    d.write(`<!doctype html><html lang="${document.documentElement.lang}" dir="${document.documentElement.dir}"><head><meta charset="utf-8"><title></title></head><body class="pv-body">
<header class="pv-bar"><strong id="pv-position"></strong><span id="pv-title" class="pv-title"></span><span class="pv-time"><button type="button" id="pv-timer" class="pv-btn"></button><span id="pv-clock"></span></span></header>
<main class="pv-main"><section class="pv-current-wrap"><div id="pv-current" class="pv-frame"></div></section>
<aside class="pv-side"><p id="pv-next-label" class="pv-label"></p><div id="pv-next" class="pv-frame pv-next"></div><p class="pv-label" id="pv-notes-label"></p><div id="pv-notes" class="pv-notes" tabindex="0"></div></aside></main>
<footer class="pv-foot"><button type="button" id="pv-prev" class="pv-btn">←</button><button type="button" id="pv-nextbtn" class="pv-btn">→</button></footer></body></html>`);
    d.close();
    d.title = `${labels.presenter || 'Presenter view'} — ${meta.title}`;
    for (const st of document.querySelectorAll('style')) d.head.append(st.cloneNode(true));
    d.getElementById('pv-notes-label').textContent = labels.notes || 'Notes';
    d.getElementById('pv-prev').setAttribute('aria-label', labels.prev || 'Previous');
    d.getElementById('pv-nextbtn').setAttribute('aria-label', labels.next || 'Next');
    d.getElementById('pv-prev').onclick = () => prev();
    d.getElementById('pv-nextbtn').onclick = () => next();
    d.getElementById('pv-timer').onclick = () => { if (presenterPaused) { presenterStart += Date.now() - presenterPaused; presenterPaused = 0; } else presenterPaused = Date.now(); };
    d.getElementById('pv-timer').ondblclick = () => { presenterStart = Date.now(); presenterPaused = 0; };
    d.addEventListener('keydown', e => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
      if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key) && !e.target.closest?.('button')) { e.preventDefault(); next(); }
      else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); prev(); }
      else if (e.key === 'Home') { e.preventDefault(); show(0); }
      else if (e.key === 'End') { e.preventDefault(); show(slides.length - 1, max(slides.length - 1)); }
      else if (e.key.toLowerCase() === 'b') { e.preventDefault(); toggleBlackout(); }
    });
    const tick = () => {
      if (!presenter || presenter.closed) return;
      d.getElementById('pv-timer').textContent = elapsed() + (presenterPaused ? ' ‖' : '');
      d.getElementById('pv-clock').textContent = new Date().toLocaleTimeString(document.documentElement.lang || undefined, { hour: '2-digit', minute: '2-digit' });
    };
    tick();
    const interval = w.setInterval(tick, 1000);
    w.addEventListener('resize', fitPresenter);
    w.addEventListener('beforeunload', () => w.clearInterval(interval));
    renderPresenter();
    return w;
  }
  window.addEventListener('studio:state', renderPresenter);
  window.addEventListener('pagehide', () => { if (presenter && !presenter.closed) presenter.close(); });

  // ------------------------------------------------------------ fullscreen & idle controls

  let idleTimer = 0;
  function wake() {
    document.body.classList.remove('studio-idle');
    clearTimeout(idleTimer);
    if (document.body.classList.contains('studio-fullscreen')) idleTimer = setTimeout(() => document.body.classList.add('studio-idle'), 2200);
  }
  document.addEventListener('fullscreenchange', () => { document.body.classList.toggle('studio-fullscreen', !!document.fullscreenElement); wake(); scale(); });
  document.addEventListener('pointermove', wake, { passive: true });
  async function toggleFullscreen() {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { toast(labels.full ? `${labels.full}: ✕` : 'Fullscreen unavailable'); }
  }

  // ------------------------------------------------------------ input

  $('studio-prev').onclick = prev;
  $('studio-next').onclick = next;
  $('studio-overview').onclick = toggleOverview;
  $('studio-reset').onclick = reset;
  $('studio-jump').onchange = e => show(Number(e.target.value));
  $('studio-notes-btn').onclick = () => { const on = $('studio-notes').classList.toggle('open'); $('studio-notes-btn').setAttribute('aria-expanded', String(on)); };
  $('studio-full').onclick = toggleFullscreen;
  if ($('studio-presenter')) $('studio-presenter').onclick = openPresenter;
  if ($('studio-help-btn')) $('studio-help-btn').onclick = () => toggleHelp();

  let digits = '', digitTimer = 0;
  const INTERACTIVE = 'input,textarea,select,video,audio,[contenteditable],[data-interactive],[role="slider"],[role="textbox"],[role="combobox"],[role="grid"]';

  // Navigation buttons are not content widgets. Arrow/Page keys still navigate when
  // those buttons keep focus after a mouse click; Space/Enter keep native activation.
  document.addEventListener('keydown', e => {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || e.isComposing || e.keyCode === 229) return;
    const target = e.composedPath().find(x => x instanceof Element) || document.body;
    if (e.key === 'Escape') {
      if ($('studio-help')?.classList.contains('open')) { e.preventDefault(); toggleHelp(false); return; }
      if ($('studio-blackout')?.classList.contains('on')) { e.preventDefault(); toggleBlackout(false); return; }
      if (overview) { e.preventDefault(); toggleOverview(); return; }
      if ($('studio-notes').classList.contains('open')) { e.preventDefault(); $('studio-notes').classList.remove('open'); $('studio-notes-btn').setAttribute('aria-expanded', 'false'); return; }
    }
    const navigationKey = ['ArrowRight', 'ArrowLeft', 'PageDown', 'PageUp', ' ', 'Enter', 'Home', 'End'].includes(e.key);
    if (e.repeat && navigationKey) {
      // Do not steal a slider's held arrow key. Only suppress presentation navigation.
      if (!target.closest('input,textarea,select,[contenteditable],[data-interactive]')) e.preventDefault();
      return;
    }
    if (overview) return;
    const onNav = !!target.closest('.studio-controls');
    if (target.closest(INTERACTIVE)) return;
    if (target.closest('button,a,summary,[role="button"]') && (!onNav || [' ', 'Enter'].includes(e.key))) return;
    if (/^[0-9]$/.test(e.key)) {
      digits += e.key; clearTimeout(digitTimer); digitTimer = setTimeout(() => { digits = ''; }, 1600);
      toast(`${labels.goto || 'Go to slide'}: ${digits}`);
      return;
    }
    if (e.key === 'Enter' && digits) {
      e.preventDefault(); const k = Number(digits) - 1; digits = ''; clearTimeout(digitTimer);
      if (k >= 0 && k < slides.length) show(k, 0, { animate: true });
      return;
    }
    if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); prev(); }
    else if (e.key === 'Home') { e.preventDefault(); show(0); }
    else if (e.key === 'End') { e.preventDefault(); show(slides.length - 1, max(slides.length - 1)); }
    else if (e.key.toLowerCase() === 'o') { e.preventDefault(); toggleOverview(); }
    else if (e.key.toLowerCase() === 'r') { e.preventDefault(); reset(); }
    else if (e.key.toLowerCase() === 'n') { e.preventDefault(); $('studio-notes-btn').click(); }
    else if (e.key.toLowerCase() === 'p') { e.preventDefault(); openPresenter(); }
    else if (e.key.toLowerCase() === 'b' || e.key === '.') { e.preventDefault(); toggleBlackout(); }
    else if (e.key.toLowerCase() === 'f') { e.preventDefault(); toggleFullscreen(); }
    else if (e.key === '?') { e.preventDefault(); toggleHelp(); }
  });

  // Touch swipe: horizontal flicks navigate; interactive regions keep their gestures.
  let swipe = null;
  const stage = document.querySelector('.studio-stage');
  stage.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' || overview || e.target.closest(INTERACTIVE + ',button,a')) { swipe = null; return; }
    swipe = { x: e.clientX, y: e.clientY, t: performance.now() };
  }, { passive: true });
  stage.addEventListener('pointerup', e => {
    if (!swipe) return;
    const dx = e.clientX - swipe.x, dy = e.clientY - swipe.y, dt = performance.now() - swipe.t;
    swipe = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > 1.5 * Math.abs(dy) && dt < 800) { if ((dx < 0) !== rtl()) next(); else prev(); }
  }, { passive: true });
  stage.addEventListener('pointercancel', () => { swipe = null; }, { passive: true });

  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseSlide(current); else show(current, step); });
  window.addEventListener('resize', scale);
  mq.addEventListener('change', () => { finish(); for (let i = 0; i < slides.length; i++) pauseSlide(i); show(current, step); });
  window.addEventListener('beforeprint', () => { restore = { current, step, exporting, widgets: [...widgets].map(([id, w]) => [id, call(w, 'snapshot')]) }; prepareExport(); });
  window.addEventListener('afterprint', () => {
    if (!restore) return;
    exporting = restore.exporting;
    for (const [id, s] of restore.widgets) call(widgets.get(id), 'restore', s);
    show(restore.current, restore.step);
    restore = null;
  });

  // ------------------------------------------------------------ public API

  const api = {
    kind: 'craft', version: 4, meta, show, next, prev, finish, reset, setExport, prepareExport, showAllBuilds: prepareExport,
    overview: toggleOverview, presenter: openPresenter, blackout: toggleBlackout, help: toggleHelp,
    register(id, widget) {
      if (widgets.has(id)) throw Error('Duplicate widget ID: ' + id);
      if (!$(id)) throw Error('Missing widget root: ' + id);
      widgets.set(id, widget);
      if (slides[current].contains($(id))) call(widget, exporting ? 'onExport' : 'onEnter', context());
      return () => { call(widget, 'dispose'); widgets.delete(id); };
    },
    getWidgetState: id => call(widgets.get(id), 'snapshot'),
    getState: () => ({ current, step, maxBuild: max(current), exporting, overview, reducedMotion: mq.matches, warnings: [...warnings], widgets: [...widgets.keys()], presenter: !!(presenter && !presenter.closed) }),
  };
  window.slideStudio = window.SlideStudio = api;
  let id = '';
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { /* malformed hash */ }
  const initial = meta.slides.findIndex(s => s.id === id);
  show(initial < 0 ? 0 : initial);
  document.body.dataset.studioReady = 'true';
})();
