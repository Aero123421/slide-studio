/* Read-only, conservative diagnostics of the rendered state. Not visual approval.
 * Unknown paint/compositing is reported as unmeasured, never assumed to be white. */
(slide) => {
  const issues = [], warnings = [], unmeasured = [], crops = [];
  const ref = e => e.id || e.getAttribute('data-qa-mark') || e.classList[0] || e.tagName.toLowerCase();
  const shown = e => {
    if (!e.getClientRects().length) return false;
    for (let p = e; p; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (s.display === 'none' || s.visibility !== 'visible' || +s.opacity === 0) return false;
    }
    return true;
  };
  const rgba = s => {
    const m = s.match(/^rgba?\(([^)]+)\)$/);
    if (!m) return null; // Wide gamut, currentColor, gradients: do not invent a ratio.
    const v = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return v.length >= 3 && v.every(Number.isFinite) ? [...v.slice(0, 3), v[3] ?? 1] : null;
  };
  const over = (fg, bg) => fg.slice(0, 3).map((v, i) => v * fg[3] + bg[i] * (1 - fg[3]));
  const luminance = rgb => rgb.map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((a, v, i) => a + v * [.2126, .7152, .0722][i], 0);
  const ratio = (a, b) => { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const pseudoPaint = e => ['::before', '::after'].some(p => {
    const s = getComputedStyle(e, p);
    return !['none', 'normal'].includes(s.content) && s.display !== 'none' && +s.opacity > 0;
  });
  const background = e => {
    const layers = [];
    for (let p = e; p; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (+s.opacity !== 1 || s.filter !== 'none' || s.mixBlendMode !== 'normal' || s.backdropFilter && s.backdropFilter !== 'none') return null;
    }
    for (let p = e; p; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (+s.opacity !== 1 || s.filter !== 'none' || s.mixBlendMode !== 'normal' || s.backdropFilter && s.backdropFilter !== 'none') return null;
      if (s.backgroundImage !== 'none' || pseudoPaint(p)) return null;
      const c = rgba(s.backgroundColor);
      if (!c) return null;
      layers.push(c);
      if (c[3] === 1) {
        let result = c.slice(0, 3);
        for (let i = layers.length - 2; i >= 0; i--) result = over(layers[i], result);
        return result;
      }
    }
    return null;
  };
  const walker = document.createTreeWalker(slide, NodeFilter.SHOW_TEXT);
  let node;
  while (node = walker.nextNode()) {
    const e = node.parentElement, text = node.textContent.trim();
    if (!text || !shown(e) || e.closest('script,style,option,template,[aria-hidden="true"],:disabled,[aria-disabled="true"]')) continue;
    const s = getComputedStyle(e), range = document.createRange(); range.selectNodeContents(node);
    const rects = [...range.getClientRects()].filter(r => r.width > 0 && r.height > 0);
    if (!rects.length) continue;
    const entry = {element: ref(e), text: text.slice(0, 90)};
    // Hit testing guards against non-ancestor artwork covering a line or supplying its background.
    const unexpected = rects.some(r => [.2, .5, .8].some(f => {
      const top = document.elementFromPoint(r.left + r.width * f, r.top + r.height * .5);
      return top && top !== e && !top.contains(e) && !e.contains(top);
    }));
    if (unexpected) warnings.push({kind:'text-occlusion', ...entry, message:'A text line intersects another painted element. Inspect stacking and the actual image.'});
    const fg = rgba(s.webkitTextFillColor || s.color), bg = background(e);
    if (unexpected || e.closest('svg') || s.textShadow !== 'none' || parseFloat(s.webkitTextStrokeWidth) > 0 || !fg || !bg) {
      unmeasured.push({...entry, reason:'Contrast needs pixel review (image, SVG, overlap, effects or unresolved backdrop).'}); continue;
    }
    const contrast = ratio(over(fg, bg), bg), font = parseFloat(s.fontSize);
    const threshold = font >= 24 || font >= 18.667 && parseFloat(s.fontWeight) >= 700 ? 3 : 4.5;
    if (contrast < threshold) {
      const finding = {kind:'text-contrast', ...entry, ratio:+contrast.toFixed(2), referenceThreshold:threshold,
        message:'Computed solid-color contrast is low. Inspect the actual text and background; not a WCAG certification.'};
      // 1.5 is a severe-defect triage threshold, NOT an accessibility conformance threshold.
      (contrast < 1.5 ? issues : warnings).push(finding);
    }
  }

  const ownPaint = e => {
    const s = getComputedStyle(e);
    const paintedColor = c => c !== 'none' && c !== 'transparent' && (rgba(c)?.[3] ?? 1) > 0;
    if (s.backgroundImage !== 'none' || paintedColor(s.backgroundColor) || s.boxShadow !== 'none' || pseudoPaint(e)) return true;
    if (parseFloat(s.outlineWidth) > 0 && !['none', 'hidden'].includes(s.outlineStyle) && paintedColor(s.outlineColor)) return true;
    if (['Top', 'Right', 'Bottom', 'Left'].some(side => parseFloat(s['border' + side + 'Width']) > 0 && !['none', 'hidden'].includes(s['border' + side + 'Style']) && paintedColor(s['border' + side + 'Color']))) return true;
    if (e instanceof SVGElement && !['svg','g','text','tspan'].includes(e.localName)) {
      return paintedColor(s.fill) && +s.fillOpacity > 0 || paintedColor(s.stroke) && +s.strokeOpacity > 0;
    }
    return e.matches('img,video,canvas'); // Content requires separate image review.
  };
  for (const e of slide.querySelectorAll('[data-qa-mark],.bar')) {
    if (!shown(e)) continue;
    const b = e.getBoundingClientRect();
    if (b.width < 1 || b.height < 1 || e.getAttribute('data-qa-value') === '0') continue;
    if (!ownPaint(e) && ![...e.querySelectorAll('*')].some(c => shown(c) && ownPaint(c))) {
      const finding = {kind:'unpainted-mark', element:ref(e), message:'This nonzero mark has geometry but no detected fill, stroke, border, image or painted child. Labels alone do not draw a bar.'};
      (e.hasAttribute('data-qa-mark') ? issues : warnings).push(finding);
    }
  }
  for (const e of slide.querySelectorAll('[data-qa-style]')) {
    if (!shown(e)) continue;
    try {
      const wanted = JSON.parse(e.dataset.qaStyle), s = getComputedStyle(e);
      if (!wanted || Array.isArray(wanted) || typeof wanted !== 'object' || !Object.keys(wanted).length) throw Error('Nonempty CSS property/value object required');
      for (const [property, expected] of Object.entries(wanted)) {
        if (typeof expected !== 'string' || !s.getPropertyValue(property)) throw Error('Use a real CSS property and its serialized computed string');
        const actual = s.getPropertyValue(property).trim();
        if (actual !== expected) issues.push({kind:'computed-style', element:ref(e), property, expected, actual});
      }
    } catch (e2) { issues.push({kind:'invalid-style-check', element:ref(e), message:e2.message}); }
  }

  for (const im of slide.querySelectorAll('img')) {
    if (!shown(im) || !im.naturalWidth) continue;
    const s = getComputedStyle(im);
    if (s.objectFit !== 'cover' && !im.hasAttribute('data-qa-focus')) continue;
    const entry = {element:ref(im), alt:im.alt, fit:s.objectFit, position:s.objectPosition};
    let ancestorClip = false;
    const imageBox = im.getBoundingClientRect();
    for (let p = im.parentElement; p && p !== slide.parentElement; p = p.parentElement) {
      const ps = getComputedStyle(p), b = p.getBoundingClientRect();
      if (ps.transform !== 'none' && p !== slide || ps.clipPath !== 'none' || ['hidden','clip','auto','scroll'].includes(ps.overflowX) && (imageBox.left < b.left - 1 || imageBox.right > b.right + 1) || ['hidden','clip','auto','scroll'].includes(ps.overflowY) && (imageBox.top < b.top - 1 || imageBox.bottom > b.bottom + 1)) ancestorClip = true;
    }
    const positions = s.objectPosition.trim().split(/\s+/);
    // Percentage positions only. Complex calc()/edge offsets/transforms are explicitly unmeasured.
    const w = im.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight);
    const h = im.clientHeight - parseFloat(s.paddingTop) - parseFloat(s.paddingBottom);
    if (!['cover','contain'].includes(s.objectFit) || positions.length !== 2 || !positions.every(x => /^-?[\d.]+%$/.test(x)) || s.transform !== 'none' || s.clipPath !== 'none' || ancestorClip || w <= 0 || h <= 0) {
      unmeasured.push({...entry, reason:'Crop needs image review: unsupported fit, position, clip or transform.'}); continue;
    }
    const zoom = Math[s.objectFit === 'cover' ? 'max' : 'min'](w / im.naturalWidth, h / im.naturalHeight);
    const dw = im.naturalWidth * zoom, dh = im.naturalHeight * zoom;
    const dx = (w - dw) * parseFloat(positions[0]) / 100, dy = (h - dh) * parseFloat(positions[1]) / 100;
    const visible = [Math.max(0,-dx/dw), Math.max(0,-dy/dh), Math.min(1,(w-dx)/dw), Math.min(1,(h-dy)/dh)];
    const retained = Math.max(0,visible[2]-visible[0]) * Math.max(0,visible[3]-visible[1]);
    crops.push({...entry, visibleSource:visible, retainedFraction:+retained.toFixed(3)});
    if (im.hasAttribute('data-qa-focus')) {
      try {
        const a = JSON.parse(im.dataset.qaFocus);
        if (!Array.isArray(a) || a.length !== 4 || !a.every(Number.isFinite) || a[0] < 0 || a[1] < 0 || a[2] <= 0 || a[3] <= 0 || a[0]+a[2] > 1 || a[1]+a[3] > 1) throw Error('Focus must be normalized [x,y,width,height] inside the source image');
        const kept = Math.max(0,Math.min(a[0]+a[2],visible[2])-Math.max(a[0],visible[0])) * Math.max(0,Math.min(a[1]+a[3],visible[3])-Math.max(a[1],visible[1])) / (a[2]*a[3]);
        if (kept < .98) issues.push({kind:'cropped-focus', ...entry, retainedFocus:+kept.toFixed(3), message:'The declared essential source region is cropped. Reposition, contain, or change the frame.'});
      } catch (e) { issues.push({kind:'invalid-focus-check', ...entry, message:e.message}); }
    } else if (retained < .7) warnings.push({kind:'substantial-crop', ...entry, retainedFraction:+retained.toFixed(3), message:'Much of the source is outside this frame. Compare the original subject with the rendered crop; this can be intentional.'});
  }
  return {renderedIntegrity:{issues,warnings,unmeasured,crops},integrityBlocking:issues.length > 0};
}
