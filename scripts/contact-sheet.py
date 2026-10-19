#!/usr/bin/env python3
"""Render every slide of a built deck into one contact-sheet PNG (and optional frames).

    python scripts/contact-sheet.py deck.html --out review/sheet.png
    python scripts/contact-sheet.py deck.html --out sheet.png --final --frames review/frames
    python scripts/contact-sheet.py deck.html --out sheet.png --ids result,method --scale 0.5

A contact sheet is how you see a whole deck at once: rhythm, repeated skeletons,
density, a slide that is mostly empty, a figure that floats too small. Open the
PNG and look at it; then open single frames (--frames) at full size for labels.

--final   show every slide at its last build (what a PDF shows)
--steps   one tile per build step instead of one per slide (motion review)
Requires Playwright + Pillow (see requirements.txt). Chromium is found via
SLIDE_STUDIO_CHROMIUM, PATH, or Playwright's own install.
"""
from __future__ import annotations
import argparse, io, json, math, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from qa import launch, open_deck  # noqa: E402

def main() -> int:
    a = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    a.add_argument('deck'); a.add_argument('--out', required=True)
    a.add_argument('--cols', type=int, default=4); a.add_argument('--scale', type=float, default=0.3)
    a.add_argument('--final', action='store_true'); a.add_argument('--steps', action='store_true')
    a.add_argument('--ids', help='comma-separated slide ids to include')
    a.add_argument('--frames', help='also save full-size PNG frames into this directory')
    a.add_argument('--label', action='store_true', help='print slide ids under each tile')
    args = a.parse_args()
    from playwright.sync_api import sync_playwright
    from PIL import Image, ImageDraw
    wanted = set(args.ids.split(',')) if args.ids else None
    tiles, errors, names = [], [], []
    with sync_playwright() as pw:
        browser = launch(pw)
        try:
            page = browser.new_page(viewport={'width': 1280, 'height': 780}, device_scale_factor=1)
            page.on('pageerror', lambda e: errors.append(str(e)))
            open_deck(page, Path(args.deck))
            # Craft decks expose SlideStudio.meta; structured-route decks (studio.mjs)
            # expose window.slideStudio with the scene instead.
            kind = page.evaluate("""()=>{const a=window.SlideStudio||window.slideStudio;
              if(!a)throw Error('not a Slide Studio deck (no SlideStudio API)');
              if(a.meta){window.__ss=a;window.__ssMeta=a.meta;return 'craft'}
              const sc=a.scene||{};window.__ss=a;window.__ssMeta={width:sc.width||1280,height:sc.height||720,
                slides:(sc.slides||[]).map((s,i)=>({id:s.id||('slide-'+(i+1))}))};return 'structured'}""")
            meta = page.evaluate('window.__ssMeta')
            current = '.slide.is-current' if kind == 'craft' else '.slide.active'
            w, h = meta['width'], meta['height']
            page.set_viewport_size({'width': w, 'height': h + 60})
            unscale = ("document.documentElement.style.setProperty('--studio-scale','1');const d=document.querySelector('.deck');"
                       "if(d&&window.__ssMeta&&!window.__ss.meta){d.style.transform='none';document.querySelectorAll('body>nav,.counter,.notes').forEach(n=>n.style.display='none')}")
            page.evaluate('()=>{' + unscale + '}')
            for i, s in enumerate(meta['slides']):
                if wanted and s['id'] not in wanted: continue
                last = page.evaluate('(i)=>{__ss.show(i,0);return __ss.getState().maxBuild||0}', i)
                steps = list(range(last + 1)) if args.steps else [last if args.final else 0]
                for st in steps:
                    page.evaluate('(a)=>{__ss.show(a[0],a[1]);if(__ss.finish)__ss.finish();' + unscale + '}', [i, st])
                    page.wait_for_timeout(60)
                    png = page.locator(current).screenshot()
                    im = Image.open(io.BytesIO(png)).convert('RGB')
                    if args.frames:
                        d = Path(args.frames); d.mkdir(parents=True, exist_ok=True)
                        im.save(d / f'{i + 1:03d}-{s["id"]}' f'{"-s" + str(st) if args.steps else ""}.png')
                    tiles.append(im); names.append(f'{i + 1} {s["id"]}' + (f' · {st}' if args.steps else ''))
        finally:
            browser.close()
    if not tiles:
        print(json.dumps({'error': 'no slides matched'})); return 1
    tw, th = int(tiles[0].width * args.scale), int(tiles[0].height * args.scale)
    pad, lab = 8, (18 if args.label else 0)
    cols = max(1, min(args.cols, len(tiles))); rows = math.ceil(len(tiles) / cols)
    sheet = Image.new('RGB', (cols * (tw + pad) + pad, rows * (th + pad + lab) + pad), (38, 40, 44))
    draw = ImageDraw.Draw(sheet)
    for k, im in enumerate(tiles):
        x, y = pad + (k % cols) * (tw + pad), pad + (k // cols) * (th + pad + lab)
        sheet.paste(im.resize((tw, th), Image.LANCZOS), (x, y))
        if args.label: draw.text((x + 2, y + th + 3), names[k], fill=(220, 224, 230))
    out = Path(args.out); out.parent.mkdir(parents=True, exist_ok=True); sheet.save(out)
    print(json.dumps({'output': str(out.resolve()), 'tiles': len(tiles), 'errors': errors[:10]}, ensure_ascii=False))
    return 0 if not errors else 2

if __name__ == '__main__':
    sys.exit(main())
