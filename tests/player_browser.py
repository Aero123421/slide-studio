#!/usr/bin/env python3
"""Player 4 features in real Chromium: count, stagger, transitions, grow and draw
presets, number jump, black screen, help sheet, presenter window and reduced motion.
The fixture deck is built from the figure engine and the craft renderer, so the
test exercises the same code agents use.

    python tests/player_browser.py [--out result.json]
"""
from pathlib import Path
import argparse, json, subprocess, sys, tempfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from qa import launch  # noqa: E402

FIXTURE = r'''import {renderCraft} from './scripts/craft-core.mjs';
import {barChart, lineChart} from './assets/runtime/figure.mjs';
const bars = barChart({id:'b',title:'Bars',width:900,height:300,data:[{label:'A',value:3},{label:'B',value:5}],build:{start:1}});
const line = lineChart({id:'l',title:'Line',width:900,height:300,x:['a','b','c'],series:[{name:'S',values:[1,3,2]},{name:'T',values:[2,2,4],dash:'6 4'}],build:{start:1}});
const deck={title:'Player fixture',transition:'rise',css:'.slide{padding:40px}',slides:[
{id:'one',title:'One',notes:'Speaker note one',content:`<h1>Counting</h1><p id="num" data-step="1" data-motion="count" data-duration="900">1,234.5 units</p><ul id="list" data-step="2" data-motion="lift" data-stagger="120"><li>a</li><li>b</li><li>c</li></ul>`},
{id:'two',title:'Two',transition:'push',content:bars},
{id:'three',title:'Three',content:line},
{id:'four',title:'Four',content:'<h1>Four</h1>'}]};
console.log(await renderCraft(deck));'''


def main():
    a = argparse.ArgumentParser(description=__doc__); a.add_argument('--out'); args = a.parse_args()
    from playwright.sync_api import sync_playwright
    checks, errors = [], []

    def check(name, fn):
        try: fn(); checks.append({'name': name, 'passed': True}); print('PASS ' + name, flush=True)
        except Exception as e: checks.append({'name': name, 'passed': False, 'error': str(e)[:600]}); print('FAIL ' + name + ': ' + str(e)[:200], flush=True)

    def expect(v, msg='Assertion failed'):
        if not v: raise AssertionError(msg)

    html = subprocess.check_output(['node', '--input-type=module', '-e', FIXTURE], cwd=ROOT, text=True)
    with tempfile.TemporaryDirectory() as tmp:
        deck = Path(tmp) / 'fixture.html'; deck.write_text(html, encoding='utf-8')
        with sync_playwright() as pw:
            browser = launch(pw)
            try:
                ctx = browser.new_context(viewport={'width': 1280, 'height': 780})
                page = ctx.new_page(); page.on('pageerror', lambda e: errors.append(str(e)))
                page.goto(deck.as_uri()); page.wait_for_function('document.body.dataset.studioReady')
                state = lambda: page.evaluate('SlideStudio.getState()')

                def count():
                    page.keyboard.press('ArrowRight'); page.wait_for_timeout(150)
                    mid = page.inner_text('#num'); page.evaluate('SlideStudio.finish()')
                    expect(mid != '1,234.5 units', f'count shows an intermediate value (got {mid})')
                    expect(page.inner_text('#num') == '1,234.5 units', 'count ends on the committed text')
                check('count preset animates and ends on the committed number', count)

                def stagger():
                    page.keyboard.press('ArrowRight'); page.wait_for_timeout(60)
                    ops = page.evaluate("[...document.querySelectorAll('#list li')].map(e=>+getComputedStyle(e).opacity)")
                    expect(ops[0] >= ops[-1] and ops[-1] < 1, f'children enter one after another ({ops})')
                    page.evaluate('SlideStudio.finish()')
                    expect(page.evaluate("[...document.querySelectorAll('#list li')].every(e=>+getComputedStyle(e).opacity===1)"), 'all children visible at the end')
                check('data-stagger delays siblings and completes', stagger)

                def transition():
                    page.keyboard.press('ArrowRight'); page.wait_for_timeout(60)
                    expect(page.evaluate('document.getAnimations().length') > 0, 'a slide transition runs')
                    page.evaluate('SlideStudio.finish()')
                    expect(state()['current'] == 1, 'arrived on slide two')
                check('slide transition runs on animated navigation', transition)

                def grow():
                    page.keyboard.press('ArrowRight'); page.wait_for_timeout(100)
                    mid = page.evaluate("getComputedStyle(document.querySelector('#two .ss-bar')).scale")
                    page.evaluate('SlideStudio.finish()')
                    fin = page.evaluate("getComputedStyle(document.querySelector('#two .ss-bar')).scale")
                    expect(mid not in ('none', '1') and fin in ('none', '1'), f'bars grow from the baseline (mid {mid}, final {fin})')
                check('figure build: grow-x bars end at full length', grow)

                def draw():
                    page.keyboard.press('ArrowRight'); page.keyboard.press('ArrowRight'); page.wait_for_timeout(150)
                    page.evaluate('SlideStudio.finish()')
                    fin = page.evaluate("[...document.querySelectorAll('#three .ss-line')].map(e=>getComputedStyle(e).clipPath)")
                    expect(all(c in ('none', '') for c in fin), f'drawn lines are fully visible at the end ({fin})')
                check('figure build: draw preset leaves complete lines', draw)

                def jump():
                    page.keyboard.press('1'); page.keyboard.press('Enter'); page.evaluate('SlideStudio.finish()')
                    expect(state()['current'] == 0, 'number + Enter jumps to slide 1')
                    page.keyboard.press('4'); page.keyboard.press('Enter'); page.evaluate('SlideStudio.finish()')
                    expect(state()['current'] == 3, 'number + Enter jumps to slide 4')
                check('number + Enter jumps to a slide', jump)

                def blackout():
                    page.keyboard.press('b')
                    expect(page.evaluate("document.getElementById('studio-blackout').classList.contains('on')"), 'B blacks out')
                    page.keyboard.press('Escape')
                    expect(not page.evaluate("document.getElementById('studio-blackout').classList.contains('on')"), 'Escape restores')
                check('black screen toggles with B and Escape', blackout)

                def help_sheet():
                    page.keyboard.press('?')
                    expect(page.evaluate("document.getElementById('studio-help').classList.contains('open')"), '? opens the shortcut sheet')
                    page.keyboard.press('Escape')
                check('shortcut sheet opens with ?', help_sheet)

                def presenter():
                    page.evaluate('SlideStudio.show(0,0)')
                    with page.expect_popup() as pop: page.keyboard.press('p')
                    pv = pop.value; pv.wait_for_load_state()
                    expect('Speaker note one' in pv.inner_text('#pv-notes'), 'notes shown')
                    expect(pv.evaluate("!!document.querySelector('#pv-current .slide') && !!document.querySelector('#pv-next .slide')"), 'current and next previews')
                    pv.keyboard.press('ArrowRight'); page.evaluate('SlideStudio.finish()')
                    expect(state()['step'] == 1, 'keys in the presenter window drive the deck')
                    pv.close()
                check('presenter window mirrors and drives the deck', presenter)

                def reduced():
                    page.emulate_media(reduced_motion='reduce'); page.evaluate('SlideStudio.show(0,0)'); page.keyboard.press('ArrowRight')
                    expect(page.evaluate('document.getAnimations().length') == 0, 'no animations under reduced motion')
                    expect(page.inner_text('#num') == '1,234.5 units', 'final state shown immediately')
                check('reduced motion commits states without animating', reduced)

                check('no page errors or player warnings', lambda: (expect(not errors, str(errors[:3])), expect(not state()['warnings'], str(state()['warnings']))))
            finally:
                browser.close()
    result = {'suite': 'player', 'checks': checks, 'passed': all(c['passed'] for c in checks)}
    if args.out: Path(args.out).write_text(json.dumps(result, indent=2), encoding='utf-8')
    print(json.dumps({'passed': result['passed'], 'checks': len(checks)}))
    return 0 if result['passed'] else 1


if __name__ == '__main__':
    sys.exit(main())
