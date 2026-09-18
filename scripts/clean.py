#!/usr/bin/env python3
"""List or remove only unchanged tool-owned review files. Default is a dry run."""
import argparse,json,sys
from review_workspace import ReviewWorkspace
p=argparse.ArgumentParser(description=__doc__);p.add_argument('directory');p.add_argument('--apply',action='store_true');a=p.parse_args()
try:
    work=ReviewWorkspace(a.directory);names=work.plan()
    if a.apply:
        with work:pass
    print(json.dumps({'applied':a.apply,'files':names,'preserved':'All unknown files, project source and exports'},indent=2))
except Exception as e:print('Clean:',e,file=sys.stderr);sys.exit(1)
