#!/usr/bin/env python3
"""Check explicit font cmap coverage. Rendering still needs a visual inspection.
Do not report installed-font availability from a fallback match alone.
"""
import argparse,json
p=argparse.ArgumentParser();p.add_argument('font');p.add_argument('--text',default='日本語の表示確認 ABC 0123 → − %');p.add_argument('--index',type=int,default=0);a=p.parse_args()
try:
 from fontTools.ttLib import TTFont
 f=TTFont(a.font,fontNumber=a.index);cmap=f.getBestCmap() or {};missing=sorted(set(c for c in a.text if not c.isspace() and ord(c) not in cmap));print(json.dumps({'font':a.font,'missing':missing,'covered':not missing,'note':'cmap coverage only; not shaping or visual QA'},ensure_ascii=False,indent=2));raise SystemExit(2 if missing else 0)
except ImportError:p.exit(1,'fontTools is optional and missing. Install in a local Python environment, or use the host font inspector.\n')
except (OSError,ValueError) as e:p.exit(1,str(e)+'\n')
