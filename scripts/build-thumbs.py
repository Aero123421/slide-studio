#!/usr/bin/env python3
"""Render small WebP thumbnails for the gallery index (gallery/thumbs/).

    python scripts/build-thumbs.py              # every catalog study + the worked example decks
    python scripts/build-thumbs.py --only templates,diagrams

One file per catalog id (`<id>.webp`) and one per example deck (`deck-<name>.webp`,
its first slide), each the final build of the slide at 320×180. Stale thumbnails
are removed. Run after the galleries are built; requires Playwright + Pillow, and
Chromium via SLIDE_STUDIO_CHROMIUM, PATH or Playwright's own install.
"""
from pathlib import Path
import argparse, io, json, sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from qa import launch, open_deck, guard_network  # noqa: E402

EXAMPLE_DECKS = ['research', 'languages', 'images', 'from-scratch', 'constraint-layout',
                 'repair-lab', 'period-comparison', 'transfer-talk', 'brand']


def main():
    a = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    a.add_argument('--width', type=int, default=320)
    a.add_argument('--quality', type=int, default=72)
    a.add_argument('--only', help='comma-separated catalog kinds and/or "examples"')
    args = a.parse_args()
    from playwright.sync_api import sync_playwright
    from PIL import Image
    only = set(args.only.split(',')) if args.only else None
    resources = json.loads((ROOT / 'assets/catalog.json').read_text(encoding='utf-8'))['resources']
    pages = {}
    for r in resources:
        if only and r['kind'] not in only: continue
        file = r['gallery'].split('#')[0]
        pages.setdefault(file, set()).add(r['id'])
    jobs = [(ROOT / f, ids, None) for f, ids in sorted(pages.items())]
    if not only or 'examples' in only:
        jobs += [(ROOT / 'gallery' / f'{n}.html', None, n) for n in EXAMPLE_DECKS]
    out = ROOT / 'gallery/thumbs'; out.mkdir(parents=True, exist_ok=True)
    w, h = args.width, round(args.width * 9 / 16)
    written, errors, blocked = set(), [], []
    with sync_playwright() as pw:
        browser = launch(pw)
        try:
            for file, ids, deck in jobs:
                if not file.exists(): errors.append(f'missing {file.relative_to(ROOT)}'); continue
                page = browser.new_page(viewport={'width': 1280, 'height': 780}, device_scale_factor=1)
                guard_network(page, blocked); page.on('pageerror', lambda e: errors.append(str(e)[:200]))
                open_deck(page, file)
                kind = page.evaluate("()=>{const a=window.SlideStudio||window.slideStudio;window.__ss=a;return a.meta?'craft':'structured'}")
                meta = page.evaluate("()=>__ss.meta||{slides:[...document.querySelectorAll('.slide')].map((s,i)=>({id:s.id||'slide-'+(i+1)}))}")
                current = '.slide.is-current' if kind == 'craft' else '.slide.active'
                page.evaluate("()=>{document.documentElement.style.setProperty('--studio-scale','1');const d=document.querySelector('.deck');if(d&&!__ss.meta)d.style.transform='none'}")
                for i, s in enumerate(meta['slides']):
                    if deck is None and s['id'] not in ids: continue
                    if deck is not None and i > 0: break
                    page.evaluate("(i)=>{__ss.show(i,0);const m=__ss.getState().maxBuild||0;__ss.show(i,m);if(__ss.finish)__ss.finish();document.documentElement.style.setProperty('--studio-scale','1')}", i)
                    page.wait_for_timeout(80)
                    im = Image.open(io.BytesIO(page.locator(current).screenshot())).convert('RGB').resize((w, h), Image.LANCZOS)
                    name = f'deck-{deck}.webp' if deck else f"{s['id']}.webp"
                    im.save(out / name, 'WEBP', quality=args.quality, method=6)
                    written.add(name)
                page.close()
        finally:
            browser.close()
    stale = [] if only else [p.name for p in out.glob('*.webp') if p.name not in written]
    for name in stale: (out / name).unlink()
    size = sum((out / n).stat().st_size for n in written)
    print(json.dumps({'thumbs': len(written), 'bytes': size, 'removed': stale[:20], 'errors': errors[:10], 'blocked': blocked[:5]}, ensure_ascii=False))
    return 0 if not errors else 2


if __name__ == '__main__':
    sys.exit(main())
