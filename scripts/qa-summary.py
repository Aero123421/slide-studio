#!/usr/bin/env python3
"""Print only what needs attention from a qa.py report: one line per finding.

    python scripts/qa.py deck.html --out .studio-review/current --states all
    python scripts/qa-summary.py .studio-review/current/report.json

Lists text overlaps, overflow past the slide, small text, broken media, missing
alt text, copy findings, rendered-integrity issues/warnings, player warnings,
duplicate IDs and design hints. Silence means the automated checks found nothing;
it does not mean the slides are good — look at them.
"""
import json, sys
from pathlib import Path

def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__); return 1
    r = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
    ids = {i + 1: s.get('id', str(i + 1)) for i, s in enumerate(r.get('slides') or [])} if isinstance(r.get('slides'), list) else {}
    out = []
    for e in r.get('errors') or []: out.append(f'page error: {e}')
    for w in r.get('playerWarnings') or []: out.append(f'player warning: {w}')
    for d in r.get('duplicateIds') or []: out.append(f'duplicate id: {d}')
    seen = set()
    for s in r.get('results') or []:
        where = f"slide {s.get('slide')} {ids.get(s.get('slide'), '')} state {s.get('state')}".strip()
        def add(kind, detail):
            key = (s.get('slide'), kind, json.dumps(detail, ensure_ascii=False, sort_keys=True))
            if key in seen: return
            seen.add(key); out.append(f'{where}: {kind}: {json.dumps(detail, ensure_ascii=False)[:220]}')
        for o in s.get('overlaps') or []: add('text overlap', o)
        for o in s.get('overflow') or []: add('outside slide', o)
        for o in s.get('smallTextWarnings') or []: add('small text', o)
        for o in s.get('broken') or []: add('broken media', o)
        for o in s.get('missingAlts') or []: add('missing alt', o)
        for o in s.get('copyFindings') or []:
            if not o.get('waived'): add(f"copy {o.get('level')}", o.get('quote'))
        ri = s.get('renderedIntegrity') or {}
        for o in ri.get('issues') or []: add('integrity issue', o)
        for o in ri.get('warnings') or []: add('integrity warning', o)
        for h in s.get('qualityHints') or []: add('design hint', h.get('message') if isinstance(h, dict) else h)
    print('\n'.join(out) if out else 'No automated findings. Now look at the rendered slides.')
    print(f"\nautomatedChecksPassed={r.get('automatedChecksPassed')} slides={len(r.get('slides') or []) if isinstance(r.get('slides'), list) else r.get('slides')} states={r.get('inspectedStates')}")
    return 0 if r.get('automatedChecksPassed') else 2

if __name__ == '__main__':
    sys.exit(main())
